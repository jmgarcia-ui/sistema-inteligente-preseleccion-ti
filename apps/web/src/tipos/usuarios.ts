import type { Rol } from "./sesion";

//una cuenta del equipo, como la ve el administrador
export type CuentaEquipo = {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: Rol;
  activo: boolean;
  invitacion_pendiente: boolean;
  ultimo_acceso_en: string | null;
  creado_en: string;
  vacantes: number;
};

export type DatosInvitacion = { nombres: string; apellidos: string; correo: string; rol: Rol };

export type CambiosCuenta = Partial<Pick<CuentaEquipo, "nombres" | "apellidos" | "rol" | "activo">>;

export type TipoEnlace = "invitacion" | "restablecer";

//al invitar o enviar un enlace: el enlace vuelve para copiarlo si el correo no llegó
export type ResultadoEnlace = {
  usuario: CuentaEquipo;
  tipo: TipoEnlace;
  enlace: string;
  expira_en: string;
  correo_enviado: boolean;
};

export type InfoEnlace = { nombres: string; correo: string; tipo: TipoEnlace };
