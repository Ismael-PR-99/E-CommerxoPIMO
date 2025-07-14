from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime
from app.models.stock_predictor import StockPredictor
from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.core.security import get_current_user
from app.db.session import get_db
from sqlalchemy.orm import Session

router = APIRouter()
predictor = StockPredictor()

@router.post("/generate", response_model=List[PredictionResponse])
async def generate_prediction(
    request: PredictionRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Genera predicciones de stock para un producto específico
    """
    try:
        # Obtener datos históricos del producto
        historical_data = await get_historical_data(request.product_id, db)
        
        # Preparar datos para el modelo
        product_data = {
            'current_stock': request.current_stock,
            'price': request.price,
            'moving_avg_7d': calculate_moving_average(historical_data, 7),
            'moving_avg_30d': calculate_moving_average(historical_data, 30)
        }
        
        # Generar predicciones
        predictions = predictor.predict(product_data, days_ahead=request.days_ahead)
        
        # Guardar predicciones en la base de datos
        saved_predictions = []
        for pred in predictions:
            prediction = await save_prediction(
                db=db,
                product_id=request.product_id,
                predicted_demand=pred['predicted_demand'],
                confidence_level=pred['confidence_level'],
                prediction_date=datetime.strptime(pred['date'], '%Y-%m-%d')
            )
            saved_predictions.append(prediction)
            
        return saved_predictions
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al generar predicciones: {str(e)}"
        )

@router.get("/{product_id}", response_model=List[PredictionResponse])
async def get_predictions(
    product_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtiene las predicciones existentes para un producto
    """
    try:
        predictions = await get_product_predictions(product_id, db)
        if not predictions:
            raise HTTPException(
                status_code=404,
                detail="No se encontraron predicciones para este producto"
            )
        return predictions
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener predicciones: {str(e)}"
        )

async def get_historical_data(product_id: str, db: Session) -> List[dict]:
    """Obtiene datos históricos de ventas del producto"""
    # Implementar lógica de consulta a la base de datos
    pass

def calculate_moving_average(data: List[dict], window: int) -> float:
    """Calcula el promedio móvil de ventas"""
    if not data:
        return 0.0
    
    quantities = [d['quantity'] for d in data]
    if len(quantities) < window:
        return sum(quantities) / len(quantities)
    
    return sum(quantities[-window:]) / window

async def save_prediction(
    db: Session,
    product_id: str,
    predicted_demand: int,
    confidence_level: float,
    prediction_date: datetime
) -> PredictionResponse:
    """Guarda una predicción en la base de datos"""
    # Implementar lógica de guardado
    pass

async def get_product_predictions(product_id: str, db: Session) -> List[PredictionResponse]:
    """Obtiene las predicciones guardadas para un producto"""
    # Implementar lógica de consulta
    pass
