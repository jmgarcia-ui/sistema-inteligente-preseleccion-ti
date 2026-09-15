from app.seguridad.contrasenas import generar_hash, verificar_contrasena

#definir test de python
def test_generar_y_verificar_contrasena():
  # usaremos una contraseña ficticia
  contrasena = "123vamos!"

  #generamos el hash
  hash_generado = generar_hash(contrasena)
  #comprobar que el hash no sea igual que la contrasena sin hash
  assert hash_generado != contrasena

  #comprobar contrasena ingresante con la contrasena guardada 
  assert verificar_contrasena(contrasena, hash_generado)

  #comprobar que una contrasena incorrecta es rechazada
  assert not verificar_contrasena("incorrecto", hash_generado)