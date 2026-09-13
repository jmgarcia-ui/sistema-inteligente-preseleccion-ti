from fastapi import APIRouter

router = APIRouter(tags=["sistema"])

@router.get("/health")
def verificar_salud()->dict[str,str]:
  return {"status":"hola gente, estoy volviendo a programar jeje, me volvere el mejor de todo jicamarca en esto! se los prometo."}