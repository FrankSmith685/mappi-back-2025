import { sequelize } from '../db';
import { TipoUsuarios } from '../interfaces/TipoUsuario';

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

// export const existsUserByEmail = async (correo: string): Promise<{ success: boolean; message: string; exists: boolean}> => {
//   try {
//     const usuario = await Usuarios.findOne({
//       where: { correo },
//     });

//     if (usuario) {
//       const plainUser = usuario.get({ plain: true }) as UsuarioAttributes;
//       return { exists: true, data: plainUser };
//     }

//     return { exists: false, data: null };
//   } catch (error: any) {
//     throw new Error(`Error al buscar usuario por correo: ${error.message}`);
//   }
// };





