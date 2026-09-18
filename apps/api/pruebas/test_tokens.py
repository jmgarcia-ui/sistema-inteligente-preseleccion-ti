from app.servicios.tokens import(generar_token_acceso, obtener_id_usuario_desde_token)

#comprobar q podamos crear y leer un token valido
def test_generar_y_leer_token() ->None:
  #generar token para user ficticio
  token = generar_token_acceso(123)

  #comprobar que el token sea una cadena
  assert isinstance(token,str)

  #comprobar que recuperemeos el mismo identificador
  assert obtener_id_usuario_desde_token(token) == 123
