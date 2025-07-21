import { sequelize } from '../db';
import { TipoUsuarios } from '../interfaces/TipoUsuario';
import { UsuarioResponse } from '../interfaces/Usuario';

const {
  TipoUsuarios,
  Usuarios
} = sequelize.models;

// user type
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


