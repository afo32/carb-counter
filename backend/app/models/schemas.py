from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import uuid


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    username: str
    first_name: str          
    last_name: str           
    country: str             

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    username: str
    role: str
    first_name: Optional[str] = None  
    last_name: Optional[str] = None   
    country: Optional[str] = None     

class FoodCreate(BaseModel):
    name: str
    carbs_per_100g: float
    image_url: Optional[str] = None

class FoodUpdate(BaseModel):
    name: Optional[str] = None
    carbs_per_100g: Optional[float] = None
    image_url: Optional[str] = None

class FoodResponse(BaseModel):
    id: str
    name: str
    carbs_per_100g: float
    image_url: Optional[str]
    created_by: Optional[str]
    is_global: bool
    created_at: datetime