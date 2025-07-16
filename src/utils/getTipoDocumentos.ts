import { sequelize } from '../db';
import { Model, ModelStatic } from 'sequelize';
import { TipoDocumentoAttributes, TipoDocumentoCreationAttributes } from '../interfaces/TipoDocumentos';

const TipoDocumentos = sequelize.models.TipoDocumentos as ModelStatic<Model<TipoDocumentoAttributes, TipoDocumentoCreationAttributes>>;



const tiposDocumentos = ["DNI", "RUC", "Otro Tipo Doc"];

export const getTipoDocumentos = async (): Promise<void> => {
  try {
    const tipo_documento = await TipoDocumentos.findAll();

    if (tipo_documento.length === 0) {
      const dataDocumentos: TipoDocumentoCreationAttributes[] = tiposDocumentos.map((nombre) => ({
        nombre,
      }));

      await TipoDocumentos.bulkCreate(dataDocumentos);
      console.log("Se agregaron los datos de tipo documento a la tabla.");
    } else {
      console.log("Ya existen datos en la tabla de tipo documentos.");
    }
  } catch (err: any) {
    console.log("Error: " + err.message);
  }
};
