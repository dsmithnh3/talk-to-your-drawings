from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Annotation
from app.schemas import AnnotationCreate, AnnotationRead
from typing import List
from fastapi.security import OAuth2PasswordBearer
from app.auth_utils import decode_access_token

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload["sub"]

@router.get("/annotations/{image_id}", response_model=List[AnnotationRead])
def get_annotations(image_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    return db.query(Annotation).filter(Annotation.image_id == image_id).all()

@router.post("/annotations/{image_id}", response_model=List[AnnotationRead])
def set_annotations(image_id: int, annotations: List[AnnotationCreate], db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    db.query(Annotation).filter(Annotation.image_id == image_id).delete()
    db.bulk_save_objects([
        Annotation(image_id=image_id, **a.dict()) for a in annotations
    ])
    db.commit()
    return db.query(Annotation).filter(Annotation.image_id == image_id).all() 