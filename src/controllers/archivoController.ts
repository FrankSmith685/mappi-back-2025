import { sequelize } from "../db";
import { v4 as uuidv4 } from "uuid";
import AWS from "aws-sdk";
import { Model } from "sequelize";
import { ArchivoAttributes } from "../interfaces/IArchivos";

const { Archivos } = sequelize.models;

// Configuración AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "us-east-1",
});

// Subir archivos
export const subirArchivo = async (
  entidad: string,        // Ej: "usuario", "producto", "negocio"
  entidadId: string,      // Ej: id del usuario
  tipo: string,           // Ej: "perfil", "portada", "documento"
  file: Express.Multer.File
): Promise<{
  success: boolean;
  message: string;
  data: ArchivoAttributes;
}> => {
  try {
    if (!file) {
      throw new Error("Debe subir un archivo");
    }

    if (!entidad || !entidadId) {
      throw new Error("Entidad y EntidadId son obligatorios");
    }

    if (!tipo) {
      throw new Error("Debe especificar el tipo de archivo (perfil, portada, documento, etc.)");
    }

    // Generar ID único para el archivo
    const archivoId = uuidv4();
    const extension = file.originalname.split(".").pop();
    const key = `${entidad}/${entidadId}/${tipo}_${archivoId}.${extension}`;

    // Subir archivo a S3
    await s3
      .upload({
        Bucket: process.env.AWS_BUCKET_NAME || "mappidevbucket",
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
      .promise();

    const urlS3 = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    // Guardar en BD
    const archivo = await Archivos.create({
      ARCH_ID: archivoId,
      ARCH_Entidad: entidad,
      ARCH_EntidadId: entidadId,
      ARCH_Tipo: tipo,
      ARCH_NombreOriginal: file.originalname,
      ARCH_Ruta: urlS3,
    });

    return {
      success: true,
      message: "Archivo subido correctamente",
      data: archivo.get() as ArchivoAttributes,
    };
  } catch (error: any) {
    throw {
      success: false,
      message: error.message,
      data: null,
    };
  }
};

// Actualizar archivo
export const actualizarArchivo = async (
  entidad: string,
  entidadId: string,
  tipo: string,
  file: Express.Multer.File
): Promise<{
  success: boolean;
  message: string;
  data: ArchivoAttributes;
}> => {
  try {
    if (!file) {
      throw new Error("Debe subir un archivo");
    }

    // Buscar si ya existe un archivo previo para esa entidad/tipo
    const archivoExistente = await Archivos.findOne({
      where: { ARCH_Entidad: entidad, ARCH_EntidadId: entidadId, ARCH_Tipo: tipo },
    });

    // Si existe, eliminarlo de S3 y BD
    if (archivoExistente) {
      // Obtener la key desde la URL guardada
      const url = archivoExistente.getDataValue("ARCH_Ruta") as string;
      const key = url.split(".com/")[1];

      await s3
        .deleteObject({
          Bucket: process.env.AWS_BUCKET_NAME || "mappidevbucket",
          Key: key,
        })
        .promise();

      await archivoExistente.destroy();
    }

    // Reusar la lógica de subirArchivo
    return await subirArchivo(entidad, entidadId, tipo, file);
  } catch (error: any) {
    throw {
      success: false,
      message: error.message,
      data: null,
    };
  }
};


// Obtener archivos por entidad
export const getArchivos = async (
  entidad: string,
  entidadId: string,
  tipo?: string
): Promise<{
  success: boolean;
  message: string;
  data: any;
}> => {
  try {
    const where: any = { ARCH_Entidad: entidad, ARCH_EntidadId: entidadId };
    if (tipo) {
      where.ARCH_Tipo = tipo;
    }

    const archivos = await Archivos.findAll({
      where,
      attributes: ["ARCH_ID", "ARCH_Tipo", "ARCH_Ruta", "ARCH_NombreOriginal"],
    });

    return {
      success: true,
      message: "Archivos obtenidos correctamente",
      data: archivos,
    };
  } catch (error: any) {
    throw {
      success: false,
      message: error.message,
      data: null,
    };
  }
};


// Guardar directamente una URL en la BD sin subir a S3
export const subirArchivoUrl = async (
  entidad: string,        // Ej: "usuario", "producto", "servicio"
  entidadId: string,      // Ej: id de la entidad
  tipo: string,           // Ej: "video", "documento"
  url: string             // URL externa (YouTube, Vimeo, etc.)
): Promise<{
  success: boolean;
  message: string;
  data: ArchivoAttributes;
}> => {
  try {
    if (!url) {
      throw new Error("Debe proporcionar una URL válida");
    }

    if (!entidad || !entidadId) {
      throw new Error("Entidad y EntidadId son obligatorios");
    }

    if (!tipo) {
      throw new Error("Debe especificar el tipo de archivo (video, documento, etc.)");
    }

    // Generar ID único para la fila
    const archivoId = uuidv4();

    // Guardar en BD (sin pasar por S3)
    const archivo = await Archivos.create({
      ARCH_ID: archivoId,
      ARCH_Entidad: entidad,
      ARCH_EntidadId: entidadId,
      ARCH_Tipo: tipo,
      ARCH_NombreOriginal: url, // aquí guardamos la URL como nombre
      ARCH_Ruta: url,           // y también como ruta
    });

    return {
      success: true,
      message: "URL guardada correctamente",
      data: archivo.get() as ArchivoAttributes,
    };
  } catch (error: any) {
    throw {
      success: false,
      message: error.message,
      data: null,
    };
  }
};


// Actualizar múltiples archivos
export const actualizarArchivosMultiples = async (
  entidad: string,
  entidadId: string,
  tipo: string,
  files: Express.Multer.File[]
): Promise<{
  success: boolean;
  message: string;
  data: ArchivoAttributes[];
}> => {
  try {
    if (!files || files.length === 0) {
      throw new Error("Debe subir al menos un archivo");
    }

    // Buscar archivos existentes para esa entidad/tipo
    const archivosExistentes = await Archivos.findAll({
      where: { ARCH_Entidad: entidad, ARCH_EntidadId: entidadId, ARCH_Tipo: tipo },
    });

    // Eliminar archivos existentes de S3 y BD
    if (archivosExistentes.length > 0) {
      await Promise.all(
        archivosExistentes.map(async (archivo: any) => {
          const url = archivo.getDataValue("ARCH_Ruta") as string;
          const key = url.split(".com/")[1];

          await s3
            .deleteObject({
              Bucket: process.env.AWS_BUCKET_NAME || "mappidevbucket",
              Key: key,
            })
            .promise();

          await archivo.destroy();
        })
      );
    }

    // Subir los nuevos archivos y registrar en BD
    const nuevosArchivos: ArchivoAttributes[] = [];

    for (const file of files) {
      const archivoId = uuidv4();
      const extension = file.originalname.split(".").pop();
      const key = `${entidad}/${entidadId}/${tipo}_${archivoId}.${extension}`;

      await s3
        .upload({
          Bucket: process.env.AWS_BUCKET_NAME || "mappidevbucket",
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
        .promise();

      const urlS3 = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

      const archivo = await Archivos.create({
        ARCH_ID: archivoId,
        ARCH_Entidad: entidad,
        ARCH_EntidadId: entidadId,
        ARCH_Tipo: tipo,
        ARCH_NombreOriginal: file.originalname,
        ARCH_Ruta: urlS3,
      });

      nuevosArchivos.push(archivo.get() as ArchivoAttributes);
    }

    return {
      success: true,
      message: "Archivos actualizados correctamente",
      data: nuevosArchivos,
    };
  } catch (error: any) {
    throw {
      success: false,
      message: error.message,
      data: [],
    };
  }
};

// Eliminar un archivo por ID
export const eliminarArchivo = async (
  archivoId: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    if (!archivoId) throw new Error("Debe proporcionar el ID del archivo");

    // Buscar el archivo en BD
    const archivo = await Archivos.findByPk(archivoId);
    if (!archivo) throw new Error("El archivo no existe");

    // Obtener la key de S3 desde la URL
    const url = archivo.getDataValue("ARCH_Ruta") as string;
    const key = url.split(".com/")[1];

    // Eliminar el archivo de S3
    await s3
      .deleteObject({
        Bucket: process.env.AWS_BUCKET_NAME || "mappidevbucket",
        Key: key,
      })
      .promise();

    // Eliminar el registro de BD
    await archivo.destroy();

    return {
      success: true,
      message: "Archivo eliminado correctamente",
    };
  } catch (error: any) {
    throw {
      success: false,
      message: error.message,
    };
  }
};


// Eliminar múltiples archivos por IDs
export const eliminarArchivosMultiples = async (
  ids: string[]
): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  try {
    if (!ids || ids.length === 0) {
      throw new Error("Debe proporcionar una lista de IDs de archivos");
    }

    // Buscar archivos existentes en la BD
    const archivos = await Archivos.findAll({
      where: { ARCH_ID: ids },
    });

    if (archivos.length === 0) {
      throw new Error("No se encontraron archivos con los IDs proporcionados");
    }

    // Eliminar archivos de S3 y luego de la BD
    await Promise.all(
      archivos.map(async (archivo: any) => {
        const url = archivo.getDataValue("ARCH_Ruta") as string;
        const key = url.split(".com/")[1];

        try {
          // Eliminar del bucket
          await s3
            .deleteObject({
              Bucket: process.env.AWS_BUCKET_NAME || "mappidevbucket",
              Key: key,
            })
            .promise();
        } catch (err) {
          console.warn(`⚠️ No se pudo eliminar el archivo ${key} de S3`);
        }

        // Eliminar registro de BD
        await archivo.destroy();
      })
    );

    return {
      success: true,
      message: "Archivos eliminados correctamente",
      data: ids,
    };
  } catch (error: any) {
    throw {
      success: false,
      message: error.message || "Error al eliminar múltiples archivos",
    };
  }
};
