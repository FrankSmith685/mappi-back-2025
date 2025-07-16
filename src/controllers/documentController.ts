import { sequelize } from '../db';
import { TipoDocumento } from '../interfaces/TipoDocumentos';

const {
  TipoDocumentos,
} = sequelize.models;

// user type
export const documentType = async (): Promise<{ success: boolean; message: string; data: TipoDocumento[] }> => {
  try {
    const tipoDocumentos = await TipoDocumentos.findAll();

    if(tipoDocumentos.length == 0){
        throw new Error("Tipos de documento no encontrados"); 
    }

    const tipoDocumentosPlain: TipoDocumento[] = tipoDocumentos.map(documento => 
      documento.get({ plain: true })
    );

    return {
      success: true,
      message: 'Tipos de usuarios encontrados',
      data: tipoDocumentosPlain,
    };
  } catch (error: any) {
    throw new Error(JSON.stringify({ success: false, message: error.message }));
  }
};

