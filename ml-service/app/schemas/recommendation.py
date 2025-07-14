from pydantic import BaseModel
from typing import Optional

class RecommendationRequest(BaseModel):
    current_product_id: Optional[str] = None
    num_recommendations: int = 10

class RecommendationResponse(BaseModel):
    product_id: str
    score: float
    reason: str
    product_name: str
    product_price: float
    confidence_level: float

    class Config:
        from_attributes = True
