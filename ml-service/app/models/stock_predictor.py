
"""
Predictor avanzado de stock para e-commerce empresarial
Incluye ARIMA, LSTM, Random Forest y XGBoost con ensemble methods
"""
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
import joblib
import logging

# Machine Learning imports
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import xgboost as xgb

# Time series analysis
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.seasonal import seasonal_decompose
from statsmodels.tsa.stattools import adfuller

# Deep Learning
import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense, Dropout, BatchNormalization
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau

# Configuration
from ..config import ML_MODEL_CONFIG, settings

@dataclass
class StockPredictionResult:
    """Resultado de predicción de stock"""
    product_id: int
    predicted_stock: List[float]
    confidence_intervals: List[Tuple[float, float]]
    days_until_stockout: Optional[int]
    reorder_point: float
    reorder_quantity: float
    seasonal_factors: Dict[str, float]
    model_accuracy: float
    prediction_date: datetime
    external_factors_impact: Dict[str, float]

class StockPredictor:
    """Predictor empresarial de stock con múltiples algoritmos ML"""

    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.config = ML_MODEL_CONFIG["stock_predictor"]
        self.logger = logging.getLogger(__name__)

        # Configurar modelos
        self._initialize_models()

    def _initialize_models(self):
        """Inicializar todos los modelos de predicción"""
        # ARIMA model placeholder
        self.models['arima'] = None

        # LSTM model architecture
        self.models['lstm'] = self._build_lstm_model()

        # Random Forest
        self.models['random_forest'] = RandomForestRegressor(
            n_estimators=self.config['random_forest_estimators'],
            random_state=settings.model_random_state,
            n_jobs=-1
        )

        # XGBoost
        self.models['xgboost'] = xgb.XGBRegressor(
            max_depth=self.config['xgboost_max_depth'],
            random_state=settings.model_random_state,
            n_jobs=-1
        )

        # Scalers
        self.scalers['lstm'] = MinMaxScaler()
        self.scalers['features'] = StandardScaler()

    def _build_lstm_model(self) -> Sequential:
        """Construir arquitectura LSTM optimizada"""
        model = Sequential([
            LSTM(
                self.config['lstm_units'],
                return_sequences=True,
                input_shape=(30, 1)  # 30 días históricos
            ),
            Dropout(self.config['lstm_dropout']),
            BatchNormalization(),

            LSTM(self.config['lstm_units'] // 2, return_sequences=False),
            Dropout(self.config['lstm_dropout']),
            BatchNormalization(),

            Dense(25, activation='relu'),
            Dropout(0.1),
            Dense(1, activation='linear')
        ])

        model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss='huber',
            metrics=['mae', 'mse']
        )

        return model

    def prepare_data(self, 
                    historical_data: pd.DataFrame,
                    external_factors: Optional[Dict] = None) -> Dict:
        """Preparar datos para entrenamiento y predicción"""

        # Validar datos de entrada
        required_columns = ['date', 'stock_level', 'sales', 'product_id']
        if not all(col in historical_data.columns for col in required_columns):
            raise ValueError(f"Faltan columnas requeridas: {required_columns}")

        # Ordenar por fecha
        data = historical_data.sort_values('date').copy()
        data['date'] = pd.to_datetime(data['date'])

        # Feature engineering avanzado
        features_data = self._engineer_features(data, external_factors)

        # Preparar datos para LSTM
        lstm_data = self._prepare_lstm_data(data['stock_level'].values)

        # Preparar datos para modelos tradicionales
        ml_features = self._prepare_ml_features(features_data)

        return {
            'lstm_data': lstm_data,
            'ml_features': ml_features,
            'time_series': data['stock_level'].values,
            'dates': data['date'].values,
            'features_data': features_data
        }

    def _engineer_features(self, 
                          data: pd.DataFrame, 
                          external_factors: Optional[Dict] = None) -> pd.DataFrame:
        """Ingeniería de características avanzada"""

        features = data.copy()

        # Características temporales
        features['day_of_week'] = features['date'].dt.dayofweek
        features['month'] = features['date'].dt.month
        features['quarter'] = features['date'].dt.quarter
        features['is_weekend'] = features['day_of_week'].isin([5, 6]).astype(int)
        features['is_holiday'] = 0  # Placeholder para días festivos

        # Características de tendencia
        features['stock_ma_7'] = features['stock_level'].rolling(7).mean()
        features['stock_ma_30'] = features['stock_level'].rolling(30).mean()
        features['sales_ma_7'] = features['sales'].rolling(7).mean()
        features['sales_ma_30'] = features['sales'].rolling(30).mean()

        # Características de volatilidad
        features['stock_std_7'] = features['stock_level'].rolling(7).std()
        features['sales_std_7'] = features['sales'].rolling(7).std()

        # Características lag
        for lag in [1, 3, 7, 14]:
            features[f'stock_lag_{lag}'] = features['stock_level'].shift(lag)
            features[f'sales_lag_{lag}'] = features['sales'].shift(lag)

        # Características de velocidad
        features['stock_velocity'] = features['sales'] / features['stock_level'].replace(0, 1)
        features['days_of_stock'] = features['stock_level'] / features['sales_ma_7'].replace(0, 1)

        # Factores externos si están disponibles
        if external_factors:
            for factor, value in external_factors.items():
                features[f'external_{factor}'] = value

        # Llenar valores faltantes
        features = features.fillna(method='ffill').fillna(method='bfill')

        return features

    def _prepare_lstm_data(self, stock_data: np.ndarray, sequence_length: int = 30):
        """Preparar datos para modelo LSTM"""

        # Normalizar datos
        scaled_data = self.scalers['lstm'].fit_transform(stock_data.reshape(-1, 1))

        X, y = [], []
        for i in range(sequence_length, len(scaled_data)):
            X.append(scaled_data[i-sequence_length:i, 0])
            y.append(scaled_data[i, 0])

        return {
            'X': np.array(X),
            'y': np.array(y),
            'scaled_data': scaled_data
        }

    def _prepare_ml_features(self, features_data: pd.DataFrame) -> Dict:
        """Preparar características para modelos ML tradicionales"""

        # Seleccionar características numéricas
        numeric_features = features_data.select_dtypes(include=[np.number]).columns
        feature_matrix = features_data[numeric_features].fillna(0)

        # Escalar características
        scaled_features = self.scalers['features'].fit_transform(feature_matrix)

        return {
            'features': scaled_features,
            'feature_names': list(numeric_features),
            'target': feature_matrix['stock_level'].values
        }

    def train_arima_model(self, time_series: np.ndarray) -> ARIMA:
        """Entrenar modelo ARIMA con selección automática de parámetros"""

        # Test de estacionariedad
        adf_result = adfuller(time_series)
        is_stationary = adf_result[1] <= 0.05

        if not is_stationary:
            # Diferenciar la serie si no es estacionaria
            diff_series = np.diff(time_series)
        else:
            diff_series = time_series

        try:
            # Entrenar modelo ARIMA
            order = self.config['arima_order']
            model = ARIMA(time_series, order=order)
            fitted_model = model.fit()

            self.logger.info(f"ARIMA({order}) entrenado. AIC: {fitted_model.aic}")
            return fitted_model

        except Exception as e:
            self.logger.error(f"Error entrenando ARIMA: {e}")
            # Fallback a modelo simple
            simple_model = ARIMA(time_series, order=(1, 1, 1))
            return simple_model.fit()

    def train_lstm_model(self, lstm_data: Dict) -> tf.keras.Model:
        """Entrenar modelo LSTM con callbacks empresariales"""

        X, y = lstm_data['X'], lstm_data['y']

        # Split train/validation
        split_idx = int(len(X) * 0.8)
        X_train, X_val = X[:split_idx], X[split_idx:]
        y_train, y_val = y[:split_idx], y[split_idx:]

        # Reshape para LSTM
        X_train = X_train.reshape((X_train.shape[0], X_train.shape[1], 1))
        X_val = X_val.reshape((X_val.shape[0], X_val.shape[1], 1))

        # Callbacks
        callbacks = [
            EarlyStopping(patience=10, restore_best_weights=True),
            ReduceLROnPlateau(factor=0.5, patience=5, min_lr=1e-6)
        ]

        # Entrenar modelo
        history = self.models['lstm'].fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=50,
            batch_size=self.config.get('batch_size', 32),
            callbacks=callbacks,
            verbose=0
        )

        self.logger.info(f"LSTM entrenado. Val Loss: {min(history.history['val_loss']):.4f}")
        return self.models['lstm']

    def train_ensemble_models(self, ml_data: Dict):
        """Entrenar modelos Random Forest y XGBoost"""

        X, y = ml_data['features'], ml_data['target']

        # Split train/test
        split_idx = int(len(X) * 0.8)
        X_train, X_test = X[:split_idx], X[split_idx:]
        y_train, y_test = y[:split_idx], y[split_idx:]

        # Entrenar Random Forest
        self.models['random_forest'].fit(X_train, y_train)
        rf_score = self.models['random_forest'].score(X_test, y_test)

        # Entrenar XGBoost
        self.models['xgboost'].fit(X_train, y_train)
        xgb_score = self.models['xgboost'].score(X_test, y_test)

        self.logger.info(f"Random Forest R²: {rf_score:.4f}")
        self.logger.info(f"XGBoost R²: {xgb_score:.4f}")

    def predict_stock(self, 
                     product_id: int,
                     days_ahead: int = 30,
                     prepared_data: Optional[Dict] = None) -> StockPredictionResult:
        """Predicción empresarial de stock con ensemble de modelos"""

        if not prepared_data:
            raise ValueError("Se requieren datos preparados para la predicción")

        predictions = {}
        confidences = {}

        # Predicción ARIMA
        if self.models['arima']:
            try:
                arima_pred = self.models['arima'].forecast(steps=days_ahead)
                predictions['arima'] = arima_pred
                confidences['arima'] = 0.7  # Confidence placeholder
            except Exception as e:
                self.logger.error(f"Error en predicción ARIMA: {e}")

        # Predicción LSTM
        try:
            lstm_pred = self._predict_lstm(prepared_data['lstm_data'], days_ahead)
            predictions['lstm'] = lstm_pred
            confidences['lstm'] = 0.8
        except Exception as e:
            self.logger.error(f"Error en predicción LSTM: {e}")

        # Predicción ensemble ML
        try:
            ml_pred = self._predict_ensemble_ml(prepared_data['ml_features'], days_ahead)
            predictions['ensemble'] = ml_pred
            confidences['ensemble'] = 0.85
        except Exception as e:
            self.logger.error(f"Error en predicción ensemble: {e}")

        # Combinar predicciones con pesos
        final_prediction = self._combine_predictions(predictions, confidences)

        # Calcular métricas adicionales
        result = self._calculate_stock_metrics(
            product_id=product_id,
            predictions=final_prediction,
            historical_data=prepared_data['time_series'],
            days_ahead=days_ahead
        )

        return result

    def _predict_lstm(self, lstm_data: Dict, days_ahead: int) -> np.ndarray:
        """Predicción con modelo LSTM"""

        last_sequence = lstm_data['X'][-1:]
        predictions = []

        current_sequence = last_sequence.copy()

        for _ in range(days_ahead):
            # Reshape para predicción
            pred_input = current_sequence.reshape((1, 30, 1))
            next_pred = self.models['lstm'].predict(pred_input, verbose=0)[0, 0]
            predictions.append(next_pred)

            # Actualizar secuencia
            current_sequence = np.roll(current_sequence, -1)
            current_sequence[-1] = next_pred

        # Desnormalizar predicciones
        predictions = np.array(predictions).reshape(-1, 1)
        return self.scalers['lstm'].inverse_transform(predictions).flatten()

    def _predict_ensemble_ml(self, ml_data: Dict, days_ahead: int) -> np.ndarray:
        """Predicción con ensemble de Random Forest y XGBoost"""

        # Usar las últimas características como base
        last_features = ml_data['features'][-1:].copy()
        predictions = []

        for day in range(days_ahead):
            # Predicción Random Forest
            rf_pred = self.models['random_forest'].predict(last_features)[0]

            # Predicción XGBoost
            xgb_pred = self.models['xgboost'].predict(last_features)[0]

            # Promedio ponderado
            ensemble_pred = 0.6 * rf_pred + 0.4 * xgb_pred
            predictions.append(ensemble_pred)

            # Actualizar características para siguiente predicción
            # (simplificado - en producción sería más sofisticado)
            last_features[0, 0] = ensemble_pred  # Actualizar stock_level

        return np.array(predictions)

    def _combine_predictions(self, 
                           predictions: Dict[str, np.ndarray], 
                           confidences: Dict[str, float]) -> np.ndarray:
        """Combinar predicciones de múltiples modelos con pesos dinámicos"""

        if not predictions:
            raise ValueError("No hay predicciones disponibles")

        # Normalizar pesos de confianza
        total_confidence = sum(confidences.values())
        weights = {model: conf/total_confidence for model, conf in confidences.items()}

        # Combinar predicciones
        combined = np.zeros(len(list(predictions.values())[0]))

        for model, pred in predictions.items():
            combined += weights[model] * pred

        return combined

    def _calculate_stock_metrics(self, 
                               product_id: int,
                               predictions: np.ndarray,
                               historical_data: np.ndarray,
                               days_ahead: int) -> StockPredictionResult:
        """Calcular métricas empresariales de stock"""

        # Calcular intervalos de confianza (simplificado)
        std_error = np.std(historical_data[-30:]) * 1.96  # 95% confidence
        confidence_intervals = [
            (pred - std_error, pred + std_error) for pred in predictions
        ]

        # Días hasta agotamiento
        days_until_stockout = None
        for i, stock in enumerate(predictions):
            if stock <= 0:
                days_until_stockout = i + 1
                break

        # Punto de reorden (simplificado)
        avg_daily_sales = np.mean(np.diff(historical_data[-30:]) * -1)  # Ventas promedio
        lead_time = 7  # días
        safety_stock = avg_daily_sales * 3  # 3 días de stock de seguridad
        reorder_point = (avg_daily_sales * lead_time) + safety_stock

        # Cantidad de reorden
        optimal_stock_days = 30
        reorder_quantity = avg_daily_sales * optimal_stock_days

        # Factores estacionales (placeholder)
        seasonal_factors = {
            'monthly_trend': 1.0,
            'weekly_pattern': 1.0,
            'seasonal_index': 1.0
        }

        # Accuracy del modelo (placeholder)
        model_accuracy = 0.85

        # Impacto de factores externos (placeholder)
        external_factors_impact = {
            'promotions': 1.2,
            'competitor_actions': 0.95,
            'market_trends': 1.05
        }

        return StockPredictionResult(
            product_id=product_id,
            predicted_stock=predictions.tolist(),
            confidence_intervals=confidence_intervals,
            days_until_stockout=days_until_stockout,
            reorder_point=reorder_point,
            reorder_quantity=reorder_quantity,
            seasonal_factors=seasonal_factors,
            model_accuracy=model_accuracy,
            prediction_date=datetime.utcnow(),
            external_factors_impact=external_factors_impact
        )

    def save_models(self, model_path: str):
        """Guardar modelos entrenados"""

        # Guardar modelos sklearn
        joblib.dump(self.models['random_forest'], f"{model_path}/random_forest.pkl")
        joblib.dump(self.models['xgboost'], f"{model_path}/xgboost.pkl")
        joblib.dump(self.scalers, f"{model_path}/scalers.pkl")

        # Guardar modelo LSTM
        self.models['lstm'].save(f"{model_path}/lstm_model.h5")

        # Guardar modelo ARIMA si existe
        if self.models['arima']:
            joblib.dump(self.models['arima'], f"{model_path}/arima_model.pkl")

        self.logger.info(f"Modelos guardados en {model_path}")

    def load_models(self, model_path: str):
        """Cargar modelos entrenados"""

        try:
            # Cargar modelos sklearn
            self.models['random_forest'] = joblib.load(f"{model_path}/random_forest.pkl")
            self.models['xgboost'] = joblib.load(f"{model_path}/xgboost.pkl")
            self.scalers = joblib.load(f"{model_path}/scalers.pkl")

            # Cargar modelo LSTM
            self.models['lstm'] = load_model(f"{model_path}/lstm_model.h5")

            # Cargar modelo ARIMA si existe
            try:
                self.models['arima'] = joblib.load(f"{model_path}/arima_model.pkl")
            except FileNotFoundError:
                pass

            self.logger.info(f"Modelos cargados desde {model_path}")

        except Exception as e:
            self.logger.error(f"Error cargando modelos: {e}")
            raise

# Factory function
def create_stock_predictor() -> StockPredictor:
    """Factory para crear instancia del predictor de stock"""
    return StockPredictor()
