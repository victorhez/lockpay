from pydantic import BaseModel, Field
from typing import Generic, TypeVar, Optional

T = TypeVar('T')

class SuccessResponse(BaseModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    message: Optional[str] = None

class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    error_code: Optional[str] = None
    details: Optional[dict] = None
