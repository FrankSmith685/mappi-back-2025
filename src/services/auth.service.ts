import bcrypt from "bcrypt";
import { DateTime } from "luxon";
import { createAuthResponse } from "../helpers/auth.helpers";
import { sequelize } from "../db";
import { IModels } from "../interfaces/IModel";
import { AuthProvider, IRegisterInput } from "../interfaces/auth";

const { 
  Usuarios, 
  Usuarios_Login, 
  Roles,
  Ubigeos, 
  Usuarios_Roles, 
  Direcciones,
  TipoNotificaciones,
  Usuario_TipoNotificaciones 
} = (sequelize.models as unknown as IModels);

export const loginUserService = async (
  correo: string,
  proveedor: AuthProvider,
  contraseña?: string
): Promise<{ success: boolean; accessToken: string; refreshToken: string; message: string }> => {
  const loginData = await Usuarios_Login.findOne({
    where: { USL_Email_Proveedor: correo, USL_Proveedor: proveedor },
  });

  if (!loginData) throw new Error(`No existe cuenta vinculada con ${proveedor}`);

  const { USUA_Interno, USL_Clave } = loginData.get();

  const usuario = await Usuarios.findByPk(USUA_Interno);
  if (!usuario) throw new Error("Usuario no encontrado");

  const { USUA_Correo } = usuario.get();

  if (proveedor === "correo") {
    const match = await bcrypt.compare(contraseña || "", USL_Clave || "");
    if (!match) throw new Error("Contraseña incorrecta");
  }

  const limaNow = DateTime.now().setZone("America/Lima").toJSDate();
  await usuario.update({ USUA_UltimaSesion: limaNow });

  return createAuthResponse(USUA_Correo);
};

export const registerUserService = async (data: IRegisterInput) => {
  const {
    nombre,
    apellido,
    correo,
    telefono,
    dni,
    contrasena,
    proveedor
  } = data;

  const rolId = 2;
  const ubigeoCodigo = "150101";
  const direccion = "Sin dirección";
  const tipoDireccion = "Residencia";

  let proveedorFinal = proveedor || "correo";

  if (proveedorFinal === 'correo') {
    if (!nombre || !apellido || !contrasena) {
      throw new Error("Faltan datos obligatorios para registro con correo");
    }
  } else if (['google', 'facebook'].includes(proveedorFinal)) {
    if (!correo) {
      throw new Error("El correo es obligatorio para registro con proveedor externo");
    }
  } else {
    throw new Error("Proveedor inválido");
  }

  const existeUsuario = await Usuarios.findOne({ where: { USUA_Correo: correo } });
  if (existeUsuario) throw new Error("El usuario ya existe");

  const ultimoUsuario = await Usuarios.findOne({
    order: [["USUA_Interno", "DESC"]],
    attributes: ["USUA_Interno"],
  });

  let nuevoCodigoUsuario: string;
  if (ultimoUsuario) {
    const { USUA_Interno } = ultimoUsuario.get();
    const nuevoCodUsuario = USUA_Interno;
    const numero = parseInt(nuevoCodUsuario.slice(3)) + 1;
    nuevoCodigoUsuario = `USU${numero.toString().padStart(4, "0")}`;
  } else {
    nuevoCodigoUsuario = "USU0001";
  }

  const rol = await Roles.findByPk(rolId);
  if (!rol) throw new Error("El rol por defecto no existe");

  const ubigeo = await Ubigeos.findOne({ where: { UBIG_Codigo: ubigeoCodigo } });
  if (!ubigeo) throw new Error("Ubigeo no encontrado");
  const { UBIG_Codigo } = ubigeo.get();
  const cod_ubigeo = UBIG_Codigo;

  const nuevoUsuario = await Usuarios.create({
    USUA_Interno: nuevoCodigoUsuario,
    USUA_Nombre: nombre || null,
    USUA_Apellido: apellido || null,
    USUA_Correo: correo,
    USUA_Telefono: telefono || null,
    USUA_Dni: dni || null,
    USUA_Estado: true,
    USUA_FechaRegistro: new Date(),
    USUA_UltimaSesion: new Date(),
  });

  const {USUA_Interno} = nuevoUsuario.get();

  await Usuarios_Roles.create({
    USUA_Interno: USUA_Interno,
    USRO_Rol: rolId,
  });

  await Direcciones.create({
    DIUS_CodigoUbigeo: cod_ubigeo,
    DIUS_Direccion: direccion,
    DIUS_Referencia: null,
    DIUS_Tipo: tipoDireccion,
    DIUS_Predeterminada: true,
    DIUS_Tipo_Entidad: "usuario",
    DIUS_Cod_Entidad: USUA_Interno,
  });

  let claveLogin = null;
  if (proveedorFinal === "correo") {
    claveLogin = await bcrypt.hash(contrasena, 10);
  } else {
    claveLogin = contrasena || null;
  }

  await Usuarios_Login.create({
    USUA_Interno: USUA_Interno,
    USL_Proveedor: proveedorFinal,
    USL_Email_Proveedor: correo,
    USL_Clave: claveLogin,
  });

  const tiposNotifs = await TipoNotificaciones.findAll();
  if (tiposNotifs.length > 0) {
    const registros = tiposNotifs.map((tipo: any) => ({
      USUA_Interno: USUA_Interno,
      TINO_Id: tipo.getDataValue("TINO_Codigo"),
      UTNO_Activo: false,
    }));
    await Usuario_TipoNotificaciones.bulkCreate(registros);
  }
  return createAuthResponse(correo);
};