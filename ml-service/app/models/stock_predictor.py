import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib
from datetime import datetime, timedelta
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class StockPredictor:
    def __init__(self, model_path: str = "models/stock_predictor.joblib"):
        self.model_path = model_path
        self.model = None
        self.scaler = StandardScaler()
        
    def prepare_features(self, historical_data: List[Dict[str, Any]]) -> np.ndarray:
        """Prepara las características para el modelo."""
        df = pd.DataFrame(historical_data)
        
        # Características temporales
        df['date'] = pd.to_datetime(df['date'])
        df['day_of_week'] = df['date'].dt.dayofweek
        df['month'] = df['date'].dt.month
        df['day_of_month'] = df['date'].dt.day
        
        # Calcular promedios móviles
        df['moving_avg_7d'] = df['quantity'].rolling(window=7, min_periods=1).mean()
        df['moving_avg_30d'] = df['quantity'].rolling(window=30, min_periods=1).mean()
        
        # Seleccionar características
        features = df[[
            'day_of_week', 'month', 'day_of_month',
            'moving_avg_7d', 'moving_avg_30d',
            'current_stock', 'price'
        ]].values
        
        return self.scaler.fit_transform(features)
    
    def train(self, historical_data: List[Dict[str, Any]]) -> None:
        """Entrena el modelo con datos históricos."""
        try:
            X = self.prepare_features(historical_data)
            y = np.array([d['quantity'] for d in historical_data])
            
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            self.model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
            
            self.model.fit(X_train, y_train)
            
            # Guardar el modelo entrenado
            joblib.dump(self.model, self.model_path)
            logger.info(f"Modelo guardado en {self.model_path}")
            
        except Exception as e:
            logger.error(f"Error al entrenar el modelo: {str(e)}")
            raise
    
    def predict(self, product_data: Dict[str, Any], days_ahead: int = 30) -> List[Dict[str, Any]]:
        """Realiza predicciones para los próximos días."""
        try:
            if self.model is None:
                self.model = joblib.load(self.model_path)
            
            predictions = []
            current_date = datetime.now()
            
            for i in range(days_ahead):
                future_date = current_date + timedelta(days=i)
                
                # Preparar features para la predicción
                features = np.array([[
                    future_date.weekday(),
                    future_date.month,
                    future_date.day,
                    product_data.get('moving_avg_7d', 0),
                    product_data.get('moving_avg_30d', 0),
                    product_data.get('current_stock', 0),
                    product_data.get('price', 0)
                ]])
                
                features_scaled = self.scaler.transform(features)
                prediction = self.model.predict(features_scaled)[0]
                confidence = self.model.predict_proba(features_scaled)[0] if hasattr(self.model, 'predict_proba') else None
                
                predictions.append({
                    'date': future_date.strftime('%Y-%m-%d'),
                    'predicted_demand': int(max(0, prediction)),
                    'confidence_level': float(confidence[1]) if confidence is not None else 0.8
                })
            
            return predictions
            
        except Exception as e:
            logger.error(f"Error al realizar predicciones: {str(e)}")
            raise
    
    def evaluate_model(self, test_data: List[Dict[str, Any]]) -> Dict[str, float]:
        """Evalúa el rendimiento del modelo."""
        try:
            X_test = self.prepare_features(test_data)
            y_test = np.array([d['quantity'] for d in test_data])
            
            y_pred = self.model.predict(X_test)
            
            mse = np.mean((y_test - y_pred) ** 2)
            rmse = np.sqrt(mse)
            mae = np.mean(np.abs(y_test - y_pred))
            
            return {
                'mse': float(mse),
                'rmse': float(rmse),
                'mae': float(mae)
            }
            
        except Exception as e:
            logger.error(f"Error al evaluar el modelo: {str(e)}")
            raise
