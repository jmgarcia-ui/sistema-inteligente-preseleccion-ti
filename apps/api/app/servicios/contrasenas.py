#herramienta que crea y comprueba hashes
from pwdlib import PasswordHash

#crear gestor con algoritmo seguro recomendado (argon2)
gestor_contrasenas = PasswordHash.recommended()


def generar_hash(contrasena: str) -> str:
  return gestor_contrasenas.hash(contrasena) #transforma a hash

def verificar_contrasena(contrasena: str, contrasena_hash: str) -> bool:
  return gestor_contrasenas.verify(contrasena, contrasena_hash,)