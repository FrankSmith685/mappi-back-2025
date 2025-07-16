import { sequelize } from '../db';
import { Model, ModelStatic } from 'sequelize';
import { TipoUsuarioAttributes, TipoUsuarioCreationAttributes } from '../interfaces/TipoUsuario';

const TipoUsuarios = sequelize.models.TipoUsuarios as ModelStatic<Model<TipoUsuarioAttributes, TipoUsuarioCreationAttributes>>;

const tipoUsuarios = ["Particular", "Inmobiliaria", "Constructora", "Agente"];

export const getTipoUsuarios = async (): Promise<void> => {
  try {
    const tipo_usuario = await TipoUsuarios.findAll();

    if (tipo_usuario.length === 0) {
      const dataUsuario: TipoUsuarioCreationAttributes[] = tipoUsuarios.map((nombre) => ({
        descripcion: nombre,
      }));

      await TipoUsuarios.bulkCreate(dataUsuario);
      console.log("Se agregó datos de tipo usuario a la tabla");
    } else {
      console.log("Ya existe datos en la tabla de tipo usuario");
    }
  } catch (error: any) {
    console.log("Error: " + error.message);
  }
};
