import { Model } from 'sequelize';
import { sequelize } from '../db';
import { TipoUsuarios } from '../interfaces/TipoUsuario';
import { UpdateUsuarioCompleto, UsuarioResponse } from '../interfaces/Usuario';
import bcrypt from 'bcrypt';

const {
  TipoUsuarios,
  Usuarios,
  UsuaDocumentos,
  TipoDocumentos,
  UsuaTipNotificaciones,
  UsuaNotificaciones,
  Multimedias
} = sequelize.models;

// Obtener los tipos de usuario
export const userType = async (): Promise<{ success: boolean; message: string; data: TipoUsuarios[] }> => {
  try {
    const tipoUsuarios = await TipoUsuarios.findAll();

    if(tipoUsuarios.length == 0){
        throw new Error("Tipos de usuarios no encontrados"); 
    }

    const tipoUsuariosPlain: TipoUsuarios[] = tipoUsuarios.map(usuario => 
      usuario.get({ plain: true })
    );

    return {
      success: true,
      message: 'Tipos de usuarios encontrados',
      data: tipoUsuariosPlain,
    };
  } catch (error: any) {
    throw new Error(JSON.stringify({ success: false, message: error.message }));
  }
};
// Obtener información del usuario autenticado
  export const getUserInfo = async (username: string): Promise<{
    success: boolean;
    message: string;
    data: UsuarioResponse;
  }> => {
    try {
      const user = await Usuarios.findOne({
        where: { correo: username },
        include: [
          {
            model: TipoUsuarios,
            as: 'TipoUsuarios'
          }
        ]
      });

      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      const userPlain = user.get({ plain: true });

      const documentRaw = await UsuaDocumentos.findOne({
        where: { cod_usuario: userPlain.cod_usuario },
        include: [
          {
            model: TipoDocumentos,
            as: 'TipoDocumento'
          }
        ]
      });

      const document = documentRaw ? documentRaw.get({ plain: true }) : undefined;


      const filteredUser: UsuarioResponse = {
        cod_usuario: userPlain.cod_usuario,
        correo: userPlain.correo,
        nombre: userPlain.nombre,
        apellido: userPlain.apellido,
        razon_social: userPlain.razon_social,
        telefono: userPlain.telefono,
        telefono_movil: userPlain.telefono_movil,
        tipo_usuario: userPlain.TipoUsuarios
          ? {
              cod_tipo_usuario: userPlain.TipoUsuarios.cod_tipo_usuario,
              descripcion: userPlain.TipoUsuarios.descripcion,
            }
          : undefined,
        documento: document,
        tipo_registro: userPlain.tipo_registro,
      };

      return {
        success: true,
        message: 'Usuario autenticado correctamente',
        data: filteredUser,
      };
    } catch (error: any) {
      throw {
        success: false,
        message: error.message,
        data: null
      };
    }
  };
// Actualizar información del usuario
export const updateUser = async (
  data: UpdateUsuarioCompleto
): Promise<{ success: boolean; message: string; data?: UsuarioResponse }> => {
  const transaction = await sequelize.transaction();

  try {
    const { cod_usuario, documento, ...fieldsToUpdate } = data;
    const user = await Usuarios.findByPk(cod_usuario);
    if (!user) throw new Error('Usuario no encontrado');

    const esCompleto = fieldsToUpdate.nombre?.trim() &&
                       fieldsToUpdate.apellido?.trim() &&
                       fieldsToUpdate.telefono_movil?.trim() &&
                       documento?.cod_tipo_documento &&
                       documento?.nro_documento;

    if (esCompleto && user.get('tipo_registro') === 'Parcial') {
      fieldsToUpdate.tipo_registro = 'Completo';
    }

    await user.update(fieldsToUpdate, { transaction });

    if (documento) {
      const doc = await UsuaDocumentos.findOne({ 
        where: { 
          cod_usuario, 
          cod_tipo_documento: documento.cod_tipo_documento 
        } 
      });

      if (doc) {
        await doc.update({
          nro_documento: documento.nro_documento ?? doc.get('nro_documento'),
        }, { transaction });
      } else {
        await UsuaDocumentos.create({
          cod_usuario,
          cod_tipo_documento: documento.cod_tipo_documento,
          nro_documento: documento.nro_documento,
        }, { transaction });
      }
    }

    await transaction.commit();

    const updatedUser = await Usuarios.findOne({
      where: { cod_usuario },
      include: [
        {
          model: TipoUsuarios,
          as: 'TipoUsuarios'
        }
      ]
    });

    const userPlain = updatedUser!.get({ plain: true });

    const documentRaw = await UsuaDocumentos.findOne({
      where: { cod_usuario: userPlain.cod_usuario },
      include: [
        {
          model: TipoDocumentos,
          as: 'TipoDocumento'
        }
      ]
    });

    const document = documentRaw ? documentRaw.get({ plain: true }) : undefined;

    const filteredUser: UsuarioResponse = {
      cod_usuario: userPlain.cod_usuario,
      correo: userPlain.correo,
      nombre: userPlain.nombre,
      apellido: userPlain.apellido,
      razon_social: userPlain.razon_social,
      telefono: userPlain.telefono,
      telefono_movil: userPlain.telefono_movil,
      tipo_usuario: userPlain.TipoUsuarios
        ? {
            cod_tipo_usuario: userPlain.TipoUsuarios.cod_tipo_usuario,
            descripcion: userPlain.TipoUsuarios.descripcion,
          }
        : undefined,
      documento: document,
       tipo_registro: userPlain.tipo_registro,
    };

    return {
      success: true,
      message: 'Usuario actualizado correctamente',
      data: filteredUser,
    };

  } catch (error: any) {
    await transaction.rollback();
    return {
      success: false,
      message: error.message,
    };
  }
};

// Cambiar la contraseña del usuario
export const changePassword = async (
  cod_usuario: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const user = await Usuarios.findByPk(cod_usuario);

    if (!user) {
      return { success: false, message: "Usuario no encontrado" };
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.get("contraseña") as string) ;

    if (!isPasswordCorrect) {
      return { success: false, message: "La contraseña actual es incorrecta" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ contraseña: hashedPassword });

    return { success: true, message: "Contraseña actualizada correctamente" };
  } catch (error: any) {
    console.error("Error cambiando la contraseña:", error);
    return {
      success: false,
      message: "Ocurrió un error al cambiar la contraseña",
    };
  }
};

// Cambiar el correo del usuario
export const changeEmail = async (
  cod_usuario: string,
  currentEmail: string,
  newEmail: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const user = await Usuarios.findByPk(cod_usuario);

    if (!user) {
      return { success: false, message: "Usuario no encontrado" };
    }

    // Validar que el correo actual ingresado coincida con el del usuario
    if (user.get("correo") !== currentEmail) {
      return { success: false, message: "El correo actual no coincide con el registrado" };
    }

    // Verificar si el nuevo correo ya está en uso por otro usuario
    const existingUser = await Usuarios.findOne({
      where: { correo: newEmail }
    });

    if (existingUser) {
      return { success: false, message: "El nuevo correo ya está en uso" };
    }

    // Actualizar el correo
    await user.update({ correo: newEmail });

    return {
      success: true,
      message: "Correo actualizado correctamente"
    };
  } catch (error: any) {
    console.error("Error cambiando el correo:", error);
    return {
      success: false,
      message: "Ocurrió un error al cambiar el correo"
    };
  }
};

// Eliminar la cuenta del usuario
export const deleteUserAccount = async (
  cod_usuario: string,
  password: string
): Promise<{ success: boolean; message: string }> => {
  const transaction = await sequelize.transaction();

  try {
    const user = await Usuarios.findByPk(cod_usuario, { transaction });

    if (!user) {
      await transaction.rollback();
      return { success: false, message: "Usuario no encontrado" };
    }

    // Verificar que la contraseña sea correcta
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.get("contraseña") as string
    );

    if (!isPasswordCorrect) {
      await transaction.rollback();
      return { success: false, message: "Contraseña incorrecta" };
    }

    // Eliminar registros relacionados
    await UsuaDocumentos.destroy({ where: { cod_usuario }, transaction });
    await UsuaTipNotificaciones.destroy({ where: { cod_usuario }, transaction });
    await UsuaNotificaciones.destroy({ where: { cod_usuario }, transaction });
    await Multimedias.destroy({ where: { cod_usuario }, transaction });

    // Eliminar el usuario
    await Usuarios.destroy({ where: { cod_usuario }, transaction });

    await transaction.commit();

    return {
      success: true,
      message: "Cuenta eliminada exitosamente",
    };
  } catch (error: any) {
    console.error("Error al eliminar la cuenta:", error);
    await transaction.rollback();
    return {
      success: false,
      message: "Ocurrió un error al eliminar la cuenta",
    };
  }
};
