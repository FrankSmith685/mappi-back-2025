import bcrypt from 'bcrypt';
import { generateToken } from '../config/middleware/authenticate';
import { sequelize } from '../db';
import { UsuarioAttributes, UsuarioCreationAttributes } from '../interfaces/Usuario';
import { Model } from 'sequelize';
import { createAuthResponse } from '../helpers/authHelpers';
import { TipoUsuarioAttributes, TipoUsuarioCreationAttributes } from '../interfaces/TipoUsuario';
import { TipoDocumentoAttributes, TipoDocumentoCreationAttributes } from '../interfaces/TipoDocumentos';
import { UbigeoAttributes, UbigeoCreationAttributes } from '../interfaces/Ubigeos';
import { MediosAttributes, MediosCreationAttributes } from '../interfaces/Medios';
import { RegisterUserData } from '../interfaces/Auth';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { sendEmail } from '../config/nodemailer/emailSender';
dotenv.config();

const {
  Usuarios,
  TipoUsuarios,
  TipoDocumentos,
  UsuarioDocumentos,
  Ubigeos,
  Medios,
  TipoNotificaciones,
  Notificaciones
} = sequelize.models;

// Verifica si el correo existe en la base de datos
export const verifyEmail = async (
    email: string
): Promise<{ success: boolean; message: string }> => {
    try {
        const usuario = await Usuarios.findOne({ where: { correo: email } });

        if (!usuario) {
        throw new Error('Usuario no encontrado');
        }

        return { success: true, message: 'Usuario encontrado' };
    } catch (error: any) {
        throw new Error(JSON.stringify({ success: false, message: error.message }));
    }
};

// Login del usuario
export const loginUser = async (
  correo: string,
  contraseña: string
): Promise<{ success: boolean; accessToken: string; refreshToken: string; message: string }> => {
  try {
    const existUser = await Usuarios.findOne({ where: { correo } }) as Model<UsuarioAttributes, UsuarioCreationAttributes>;

    if (!existUser) {
      throw new Error('Usuario no encontrado');
    }

    const correoUsuario = existUser.getDataValue('correo');
    const contraseñaUsuario = existUser.getDataValue('contraseña');

    const match = await bcrypt.compare(contraseña, contraseñaUsuario || '');

    if (!match) {
      throw new Error('La contraseña del usuario es incorrecta');
    }

    return createAuthResponse(correoUsuario);
  } catch (error: any) {
    console.error(error);
    throw new Error(JSON.stringify({ success: false, message: error.message }));
  }
};

//Registro de un nuevo usuario
export const registerUser = async (data: RegisterUserData) => {
  try {
     const {
        tipoUsuario,
        correo,
        contraseña,
        nombre,
        apellido,
        razon_social,
        tipoDocumento,
        nroDocumento,
        telefono,
        telefono_movil,
    } = data;
    const existeUsuario = await Usuarios.findOne({ where: { correo } }) as Model<UsuarioAttributes, UsuarioCreationAttributes>;
    if (existeUsuario) throw new Error('El usuario ya existe');

    const ultimoUsuario = await Usuarios.findOne({
      order: [['cod_usuario', 'DESC']],
      attributes: ['cod_usuario']
    }) as Model<UsuarioAttributes, UsuarioCreationAttributes>;

    let nuevoCodigoUsuario: string;

    if (ultimoUsuario) {
    const nuevoCodUsuario = ultimoUsuario.getDataValue('cod_usuario');
    const numero = parseInt(nuevoCodUsuario.slice(3)) + 1;
    nuevoCodigoUsuario = `COD${numero.toString().padStart(4, '0')}`;
    } else {
    nuevoCodigoUsuario = 'COD0001';
    }

    const tipo_usuario = await TipoUsuarios.findByPk(tipoUsuario) as Model<TipoUsuarioAttributes, TipoUsuarioCreationAttributes>;
    if (!tipo_usuario) throw new Error('Tipo de usuario no encontrado');
    const cod_tipo_usuario = tipo_usuario.getDataValue('cod_tipo_usuario');
    

    const tipo_documento = await TipoDocumentos.findByPk(tipoDocumento) as Model<TipoDocumentoAttributes, TipoDocumentoCreationAttributes>;
    if (!tipo_documento) throw new Error('Tipo de documento no encontrado');
    const cod_tipo_documento = tipo_documento.getDataValue('cod_tipo_documento');

    const ubigeo = await Ubigeos.findByPk(1386) as Model<UbigeoAttributes, UbigeoCreationAttributes>;
    if (!ubigeo) throw new Error('Ubigeo no encontrado');
    const cod_ubigeo = ubigeo.getDataValue('cod_ubigeo');

    const tipo_registro =
      nombre && nroDocumento && telefono_movil && (apellido || razon_social)
        ? 'Completo'
        : 'Parcial';

    const hashContraseña = await bcrypt.hash(contraseña, 10);
    

    const nuevoUsuario = await Usuarios.create({
      cod_usuario: nuevoCodigoUsuario,
      cod_tipo_usuario: cod_tipo_usuario,
      correo,
      contraseña: hashContraseña,
      nombre,
      apellido,
      razon_social,
      telefono,
      telefono_movil,
      cod_ubigeo: cod_ubigeo,
      tipo_registro,
      estado: 'Activo',
      fecha_registro: new Date(),
    }) as Model<UsuarioAttributes, UsuarioCreationAttributes>;

    const cod_nuevoUsuario = nuevoUsuario.getDataValue('cod_usuario');

    await UsuarioDocumentos.create({
      cod_usuario: cod_nuevoUsuario,
      cod_tipo_documento: cod_tipo_documento,
      nro_documento: nroDocumento
    });

    const medioEmail = await Medios.findOne({ where: { nombre: 'email' } }) as Model<MediosAttributes, MediosCreationAttributes>;
    if (!medioEmail) throw new Error("Medio 'email' no encontrado");
    const cod_medios = medioEmail.getDataValue('cod_medios');

    const tiposNotificaciones = await TipoNotificaciones.findAll();

    const notificacionesUsuario = tiposNotificaciones.map((tipo: any) => ({
      cod_usuario: cod_nuevoUsuario,
      cod_tipo_notificacion: tipo.cod_tipo_notificaciones,
      cod_medios: cod_medios,
      titulo: tipo.nombre,
      mensaje: '',
      fecha_envio: new Date(),
      leida: false,
      link: '',
    }));

    await Notificaciones.bulkCreate(notificacionesUsuario);

    const {accessToken, refreshToken} = generateToken(correo, { correo });

    return { success: true, accessToken, refreshToken, message: 'Registro exitoso' };
  } catch (error: any) {
    console.error(error);
    throw new Error(JSON.stringify({ success: false, message: error.message }));
  }
};

//RefreshToken
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

//sendResetPasswordEmail
const RESET_SECRET = process.env.RESET_SECRET_KEY as string;
export const sendResetPasswordEmail = async (correo: string) => {
  const usuario = await Usuarios.findOne({ where: { correo } });

  if (!usuario) {
    throw new Error('Correo no registrado');
  }

  const token = jwt.sign({ correo }, RESET_SECRET, { expiresIn: '15m' });
  const resetUrl = `http://localhost:5173/?resetToken=${token}`;

  const logoUrl = 'https://www.starmobiliario.com/logo_black.png';

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
          <a href="${resetUrl}" style="background-color: #4CAF50; color: #ffffff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">
            Restablecer Contraseña
          </a>
        </div>

        <p style="color: #777; font-size: 14px; text-align: center;">
          Este enlace expirará en <strong>15 minutos</strong>. Si no solicitaste este cambio, puedes ignorar este mensaje.
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;" />

        <p style="font-size: 12px; color: #aaa; text-align: center;">
          © ${new Date().getFullYear()} Starmobiliario. Todos los derechos reservados.
        </p>
      </div>
    </div>
  `;

  await sendEmail(correo, 'Recuperación de contraseña', htmlContent);

  return { success: true, message: 'Correo de recuperación enviado' };
};

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

    const usuario = await Usuarios.findOne({ where: { correo: decoded.correo } }) as Model<UsuarioAttributes, UsuarioCreationAttributes>;
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    const contraseñaHash = await bcrypt.hash(nuevaContraseña, 10);
    await usuario.update({ contraseña: contraseñaHash });

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

