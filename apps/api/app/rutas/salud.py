from fastapi import APIRouter

router = APIRouter(tags=["sistema"])

@router.get("/health")
def verificar_salud()->dict[str,str]:
  return {"status":"ok"}