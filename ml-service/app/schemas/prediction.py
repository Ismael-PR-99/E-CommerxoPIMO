from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PredictionRequest(BaseModel):
    product_id: str
    current_stock: int
    price: float
    days_ahead: int = 30

class PredictionResponse(BaseModel):
    id: str
    product_id: str
    predicted_demand: int
    confidence_level: float
    prediction_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class PredictionCreate(BaseModel):
    product_id: str
    predicted_demand: int
    confidence_level: float
    prediction_date: datetime

class PredictionUpdate(BaseModel):
    predicted_demand: Optional[int] = None
    confidence_level: Optional[float] = None
    prediction_date: Optional[datetime] = None
