from pydantic import BaseModel
from typing import Optional, List

class UserCreate(BaseModel):
    username: str
    password: str

class UserRead(BaseModel):
    id: int
    username: str
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class ImageCreate(BaseModel):
    filename: str

class ImageRead(BaseModel):
    id: int
    filename: str
    owner_id: int
    class Config:
        orm_mode = True

class AnnotationCreate(BaseModel):
    label: str
    x: int
    y: int
    width: int
    height: int
    color: str

class AnnotationRead(AnnotationCreate):
    id: int
    image_id: int
    class Config:
        orm_mode = True 