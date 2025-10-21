import bcrypt from 'bcrypt';
import { sequelize } from '../db';
import { Model } from 'sequelize';
import { UsuarioAttributes, UsuarioCreationAttributes } from '../interfaces/IUsuario';
import { createAuthResponse } from '../helpers/authHelpers';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../config/nodemailer/emailSender';
import { DateTime } from "luxon";
import { RegisterUserData } from '../interfaces/IAuth';
import { generateToken } from '../config/middleware/authenticate';
import { UsuarioLoginAttributes, UsuarioLoginCreationAttributes } from '../interfaces/IUsuarioLogin';
import { UbigeoAttributes, UbigeoCreationAttributes } from '../interfaces/IUbigeos';
const {
  Usuarios,
  Roles,
  Ubigeos,
  Usuarios_Roles,
  Direcciones,
  Usuarios_Login,
  Usuario_TipoNotificaciones ,
  TipoNotificaciones
} = sequelize.models;

export const loginUser = async (
  correo: string,
  proveedor: 'correo' | 'google' | 'facebook',
  contraseña?: string
): Promise<{ success: boolean; accessToken: string; refreshToken: string; message: string }> => {
  try {
    // Buscar login directamente por correo del proveedor
    const loginData = await Usuarios_Login.findOne({
      where: { USL_Email_Proveedor: correo, USL_Proveedor: proveedor }
    }) as Model<UsuarioLoginAttributes, UsuarioLoginCreationAttributes> & UsuarioLoginAttributes;

    if (!loginData) {
      throw new Error(`No existe cuenta vinculada con ${proveedor} usando ${correo}`);
    }

    // Buscar el usuario dueño de ese login
    const usuario = await Usuarios.findByPk(loginData.USUA_Interno) as Model<UsuarioAttributes, UsuarioCreationAttributes> & UsuarioAttributes;
    if (!usuario) throw new Error("Usuario no encontrado");

    // Validar credenciales solo si es proveedor correo
    if (proveedor === 'correo') {
      const match = await bcrypt.compare(contraseña || '', loginData.USL_Clave || '');
      if (!match) throw new Error('Contraseña incorrecta');
    }

    // Actualizar última sesión
    const limaNow = DateTime.now().setZone('America/Lima').toJSDate();
    await usuario.update({ USUA_UltimaSesion: limaNow });

    return createAuthResponse(usuario.USUA_Correo);

  } catch (error: any) {
    console.error(error);
    throw new Error(JSON.stringify({ success: false, message: error.message }));
  }
};

//Registro de un nuevo usuario
export const registerUser = async (data: RegisterUserData) => {
  const {
    nombre,
    apellido,
    correo,
    telefono,
    dni,
    contrasena,
    fotoPerfil,
    proveedor
  } = data;

  // Valores por defecto
  const rolId = 2;
  const ubigeoCodigo = "150101";
  const direccion = "Sin dirección";
  const tipoDireccion = "Residencia";

  // Detectar proveedor
  let proveedorFinal = proveedor || 'correo';

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

  // Validar si ya existe usuario
  const existeUsuario = await Usuarios.findOne({ where: { USUA_Correo: correo } });
  if (existeUsuario) throw new Error("El usuario ya existe");

  // Generar nuevo código interno
  const ultimoUsuario = await Usuarios.findOne({
    order: [['USUA_Interno', 'DESC']],
    attributes: ['USUA_Interno']
  }) as Model<UsuarioAttributes, UsuarioCreationAttributes>;

  let nuevoCodigoUsuario: string;
  if (ultimoUsuario) {
    const nuevoCodUsuario = ultimoUsuario.getDataValue('USUA_Interno');
    const numero = parseInt(nuevoCodUsuario.slice(3)) + 1;
    nuevoCodigoUsuario = `USU${numero.toString().padStart(4, '0')}`;
  } else {
    nuevoCodigoUsuario = 'USU0001';
  }

  // Validar rol y ubigeo
  const rol = await Roles.findByPk(rolId);
  if (!rol) throw new Error("El rol por defecto no existe");

  const ubigeo = await Ubigeos.findOne({ where: { UBIG_Codigo: ubigeoCodigo } }) as Model<UbigeoAttributes, UbigeoCreationAttributes>;
  if (!ubigeo) throw new Error('Ubigeo no encontrado');
  const cod_ubigeo = ubigeo.getDataValue('UBIG_Codigo');

  // Crear usuario
  const nuevoUsuario = (await Usuarios.create({
    USUA_Interno: nuevoCodigoUsuario,
    USUA_Nombre: nombre || null,
    USUA_Apellido: apellido || null,
    USUA_Correo: correo,
    USUA_Telefono: telefono || null,
    USUA_Dni: dni || null,
    USUA_FotoPerfil: fotoPerfil || null,
    USUA_Estado: true,
    USUA_FechaRegistro: new Date(),
    USUA_UltimaSesion: new Date(),
  })) as Model<UsuarioAttributes, UsuarioCreationAttributes> & UsuarioAttributes;

  // Guardar relación en usuarios_roles
  await Usuarios_Roles.create({
    USUA_Interno: nuevoUsuario.USUA_Interno,
    USRO_Rol: rolId
  });

  // Guardar dirección
  await Direcciones.create({
    DIUS_CodigoUbigeo: cod_ubigeo,
    DIUS_Direccion: direccion,
    DIUS_Referencia: null,
    DIUS_Tipo: tipoDireccion,
    DIUS_Predeterminada: true,
    DIUS_Tipo_Entidad: 'usuario',
    DIUS_Cod_Entidad: nuevoUsuario.USUA_Interno
  });

  // Guardar login
  let claveLogin = null;
  if (proveedorFinal === 'correo') {
    claveLogin = await bcrypt.hash(contrasena, 10);
  } else {
    claveLogin = contrasena || null;
  }

  await Usuarios_Login.create({
    USUA_Interno: nuevoUsuario.USUA_Interno,
    USL_Proveedor: proveedorFinal,
    USL_Email_Proveedor: correo,
    USL_Clave: claveLogin,
    USL_FechaVinculacion: new Date()
  });

  const tiposNotifs = await TipoNotificaciones.findAll();
  if (tiposNotifs.length > 0) {
    const registros = tiposNotifs.map((tipo: any) => ({
      USUA_Interno: nuevoUsuario.USUA_Interno,
      TINO_Id: tipo.getDataValue("TINO_Codigo"), // 👈 aquí corregido
      UTNO_Activo: false
    }));


    await Usuario_TipoNotificaciones .bulkCreate(registros);
  }

  // Generar tokens
  const { accessToken, refreshToken } = generateToken(correo, { correo });
  return { success: true, accessToken, refreshToken, message: 'Registro exitoso' };
};

//Refresh token para obtener un nuevo access token
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY as string;
const ACCESS_SECRET_KEY = process.env.ACCESS_SECRET_KEY as string;
export const refreshAccessToken = async (refreshToken: string): Promise<{ success: boolean; accessToken?: string; message: string }> => {
    if (!refreshToken) {
        return {
        success: false,
        message: 'No se proporcionó el refresh token',
        };
    }
    try {
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET_KEY) as { username: string };

        const newAccessToken = jwt.sign(
        { username: decoded.username },
        ACCESS_SECRET_KEY,
        { expiresIn: '1h' }
        );

        return {
        success: true,
        accessToken: newAccessToken,
        message: 'Nuevo token generado exitosamente',
        };
    } catch (err) { 
        return {
        success: false,
        message: 'Refresh token inválido o expirado',
        };
    }
};
//Enviar correo de recuperación de contraseña
const RESET_SECRET = process.env.RESET_SECRET_KEY as string;
export const sendResetPasswordEmail = async (correo: string) => {
  const usuario = await Usuarios.findOne({ where: { USUA_Correo: correo } });

  if (!usuario) {
    throw new Error('Correo no registrado');
  }

  const token = jwt.sign({ correo }, RESET_SECRET, { expiresIn: '15m' });
  const resetUrl = `http://localhost:5173/?resetToken=${token}`;

  const logoUrl = 'https://mappidevbucket.s3.amazonaws.com/mapp_228';

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        
        <div style="text-align: center;">
          <img src="${logoUrl}" alt="Logo" style="width: 140px; margin-bottom: 25px;" />
        </div>

        <h2 style="color: #333; text-align: center;">Hola ${correo},</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.5; text-align: center;">
          Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para continuar.
        </p>

        <div style="text-align: center; margin: 40px 0;">
          <a href="${resetUrl}" style="background-color: #FF6C4F; color: #ffffff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">
            Restablecer Contraseña
          </a>
        </div>

        <p style="color: #777; font-size: 14px; text-align: center;">
          Este enlace expirará en <strong>15 minutos</strong>. Si no solicitaste este cambio, puedes ignorar este mensaje.
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;" />

        <p style="font-size: 12px; color: #aaa; text-align: center;">
          © 2025 Mappi. Todos los derechos reservados.
        </p>
      </div>
    </div>
  `;

  await sendEmail(correo, 'Recuperación de contraseña', htmlContent);

  return { success: true, message: 'Correo de recuperación enviado' };
};
//Validar el token de restablecimiento de contraseña
export const validateResetToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, RESET_SECRET);
    return {
      success: true,
      data: decoded,
      message: 'Token válido',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Token inválido o expirado',
    };
  }
};

export const resetPassword = async (token: string, nuevaContraseña: string) => {
  try {
    const decoded = jwt.verify(token, RESET_SECRET) as { correo: string };

    // 1️⃣ Buscar usuario por correo
    const usuario = await Usuarios.findOne({
      where: { USUA_Correo: decoded.correo },
    }) as Model<UsuarioAttributes, UsuarioCreationAttributes> & UsuarioAttributes;

    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    // 2️⃣ Buscar login tipo correo
    let loginCorreo = await Usuarios_Login.findOne({
      where: {
        USUA_Interno: usuario.USUA_Interno,
        USL_Proveedor: "correo",
      },
    }) as Model<UsuarioLoginAttributes, UsuarioLoginCreationAttributes> & UsuarioLoginAttributes;

    // 3️⃣ Generar hash de la nueva contraseña
    const contraseñaHash = await bcrypt.hash(nuevaContraseña, 10);

    if (!loginCorreo) {
      // 🚀 Crear el registro si no existe
      loginCorreo = await Usuarios_Login.create({
        USUA_Interno: usuario.USUA_Interno,
        USL_Proveedor: "correo",
        USL_Clave: contraseñaHash,
      }) as Model<UsuarioLoginAttributes, UsuarioLoginCreationAttributes> & UsuarioLoginAttributes;
    } else {
      // 🚀 Actualizar contraseña si ya existe
      await loginCorreo.update({ USL_Clave: contraseñaHash });
    }

    return {
      success: true,
      message: "Contraseña actualizada exitosamente",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Token inválido o expirado",
    };
  }
};
