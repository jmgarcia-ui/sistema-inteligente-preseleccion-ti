from app.servicios.texto_rico import html_a_texto, texto_a_html

from app.configuracion import obtener_configuracion
from app.modelos.analisis_cv import Recomendacion
from app.servicios.azure_openai import completar_json

#cuánto esperar a que Azure confirme el envío
ESPERA_ENVIO_SEGUNDOS = 60


class CorreoError(Exception):
  pass


def _html(cuerpo: str) -> str:
  #el cuerpo es HTML del editor (o texto plano de antes): se limpia y cada bloque lleva su margen en línea, como piden los clientes de correo
  contenido = (
    texto_a_html(cuerpo)
    .replace("<p>", '<p style="margin:0 0 14px">')
    .replace("<ul>", '<ul style="margin:0 0 14px;padding-left:22px">')
    .replace("<ol>", '<ol style="margin:0 0 14px;padding-left:22px">')
  )
  pie = '<p style="margin:24px 0 0;font-size:12px;color:#556274">Este correo se envió desde una dirección que no recibe respuestas.</p>'
  return f'<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#0f172a;max-width:600px">{contenido}{pie}</div>'


#envía el correo y devuelve el identificador de la operación en Azure
def enviar_correo(destinatario: str, nombre: str, asunto: str, cuerpo: str) -> str:
  configuracion = obtener_configuracion()
  if configuracion.azure_comunicacion_connection_string is None or not configuracion.correo_remitente:
    raise CorreoError("El envío de correos no está configurado (AZURE_COMUNICACION_CONNECTION_STRING y CORREO_REMITENTE).")

  #se importa aquí para que el paquete solo haga falta al enviar
  from azure.communication.email import EmailClient

  cliente = EmailClient.from_connection_string(configuracion.azure_comunicacion_connection_string.get_secret_value())
  mensaje = {
    "senderAddress": configuracion.correo_remitente,
    "recipients": {"to": [{"address": destinatario, "displayName": nombre}]},
    "content": {"subject": asunto, "plainText": html_a_texto(cuerpo), "html": _html(cuerpo)},
    #el remitente no recibe respuestas (DoNotReply); el candidato lo sabe por el cuerpo del correo
    "userEngagementTrackingDisabled": True,
  }
  try:
    operacion = cliente.begin_send(mensaje)
    resultado = operacion.result(timeout=ESPERA_ENVIO_SEGUNDOS)
  except Exception as error:
    raise CorreoError(f"Azure no pudo enviar el correo: {error}") from error
  if resultado.get("status") != "Succeeded":
    raise CorreoError(f"Azure no confirmó el envío ({resultado.get('status')}): {resultado.get('error')}")
  return resultado["id"]


ESQUEMA_CORREO = {
  "type": "object",
  "additionalProperties": False,
  "required": ["asunto", "cuerpo"],
  "properties": {"asunto": {"type": "string"}, "cuerpo": {"type": "string"}},
}


#redacta de nuevo el borrador cuando la decisión del equipo no coincide con la propuesta de la IA
def redactar_correo(tipo: Recomendacion, vacante: str, nombres: str, motivo: str | None) -> tuple[str, str]:
  if tipo == Recomendacion.PASA:
    pedido = (
      "Redacta un correo felicitando al candidato porque avanza a la siguiente etapa del proceso para la vacante "
      "y avisándole que pronto lo contactarán para coordinar la entrevista técnica u otra etapa. No prometas fechas."
    )
  else:
    pedido = (
      "Redacta un correo agradeciendo al candidato y diciéndole con claridad que en esta ocasión no avanza en el proceso. "
      "Explica el motivo de forma respetuosa y concreta, a partir del motivo que te damos, y dale 2 o 3 recomendaciones útiles "
      "y accionables. Invítalo a postular a futuras vacantes. Sin juicios personales ni comparaciones."
    )
  mensajes = [
    {
      "role": "system",
      "content": "Redactas correos de un equipo de selección de TI: en español, tuteando, cálidos y profesionales, firmados por "
      '"Equipo de selección". Usa solo el primer nombre. No inventes datos, empresas ni personas de contacto. Nunca menciones '
      "edad, género, nacionalidad u otros datos ajenos al puesto.",
    },
    {"role": "user", "content": f"{pedido}\n\nVACANTE: {vacante}\nNOMBRE: {nombres}\nMOTIVO DEL EQUIPO: {motivo or 'no indicado'}"},
  ]
  respuesta = completar_json(mensajes, "correo", ESQUEMA_CORREO, max_tokens=900)
  return respuesta.datos["asunto"][:200], respuesta.datos["cuerpo"]
