from sqlalchemy.orm import Session
from app.esquemas.vacantes import VacanteCrear, VacanteActualizar
from app.modelos.vacante import EstadoVacante, Vacante
from app.modelos.usuario import Usuario
from sqlalchemy import select
from datetime import date

def crear_vacante(sesion:Session, datos: VacanteCrear, id_creador: int) -> Vacante:
  #creamos el objeto
  vacante = Vacante(
    id_creador=id_creador,
    titulo=datos.titulo,
    descripcion=datos.descripcion,
    requisitos=datos.requisitos,
    modalidad=datos.modalidad,
    ubicacion=datos.ubicacion,
    fecha_limite=datos.fecha_limite,
  )
  #añadimos el objeto a la sesion (no se guarda aún)
  sesion.add(vacante)
  #se guarda en la bd el objeto
  sesion.commit()
  #vacante recibe el id generado por sql server y el enum "borrador"
  sesion.refresh(vacante)

  return vacante

def obtener_vacante_por_id(sesion: Session, id_vacante: int) -> Vacante | None:
  #buscar directamente por llave primaria
  return sesion.get(Vacante, id_vacante)

def puede_editar_vacante(usuario: Usuario, vacante: Vacante) -> bool:
  return(usuario.rol.nombre == "administrador" or vacante.id_creador == usuario.id)

def actualizar_vacante(sesion: Session, vacante:Vacante, datos:VacanteActualizar) -> Vacante:
  #convertir objeto en un diccionario
  #exclued_unset elimina campos que el fron no envio
  cambios = datos.model_dump(exclude_unset=True)
  #actualizamos el objeto
  for campo, valor in cambios.items():
    setattr(vacante, campo, valor)
  sesion.commit()
  sesion.refresh(vacante)
  return vacante

def listar_vacantes_publicas(sesion: Session) -> list[Vacante]:
  #creamos la consulta
  consulta = select(Vacante).where(Vacante.estado == EstadoVacante.PUBLICADA, Vacante.fecha_limite >= date.today())

  #ejecutar consulta
  #.all() los convierte en una lista
  return sesion.scalars(consulta).all()

def obtener_vacante_publica_por_id(sesion: Session, id_vacante: int) -> Vacante | None:
  #crear la consulta
  consulta = select(Vacante).where(
    Vacante.estado == EstadoVacante.PUBLICADA, 
    Vacante.fecha_limite >= date.today(),
    Vacante.id == id_vacante,
  ) 

  #ejecutar consulta
  return sesion.scalar(consulta)