import { Request, Response } from "express";
import { sequelize } from "../db";
import { DireccionAttributes } from "../interfaces/IDirecciones";
import {fn, col} from "sequelize";

const { Direcciones, Ubigeos, Servicios,Categorias, Subcategorias } = sequelize.models;

/**
 * Crear o actualizar una dirección del usuario
 */

export const saveDireccion = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      cod_entidad,
      tipo_entidad,
      direccion,
      referencia,
      latitud,
      longitud,
      codigoUbigeo,
      predeterminado,
    } = req.body as {
      cod_entidad: string;
      tipo_entidad: string;
      direccion: string;
      referencia?: string;
      latitud?: number;
      longitud?: number;
      codigoUbigeo: string;
      predeterminado: boolean;
    };

    // Validación de datos obligatorios
    if (!cod_entidad || !tipo_entidad || !direccion || !codigoUbigeo) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message:
          "Faltan datos obligatorios (entidad, tipo, dirección o ubigeo)",
      });
    }

    //  Verificar si ya existe una dirección para esa entidad
    const direccionExistente = await Direcciones.findOne({
      where: {
        DIUS_Cod_Entidad: cod_entidad,
        DIUS_Tipo_Entidad: tipo_entidad,
      },
      transaction,
    });

    if (direccionExistente) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: `Ya existe una dirección registrada para el ${tipo_entidad}`,
      });
    }

    // Crear nueva dirección
    await Direcciones.create(
      {
        DIUS_Tipo: "principal",
        DIUS_Tipo_Entidad: tipo_entidad,
        DIUS_Cod_Entidad: cod_entidad,
        DIUS_Direccion: direccion,
        DIUS_Referencia: referencia || null,
        DIUS_Latitud: latitud || null,
        DIUS_Longitud: longitud || null,
        DIUS_CodigoUbigeo: codigoUbigeo,
        DIUS_Predeterminada:predeterminado
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: `Dirección creada correctamente para ${tipo_entidad}`,
    });
  } catch (error: any) {
    console.error("Error guardando dirección:", error);
    await transaction.rollback();
    return res.status(500).json({
      success: false,
      message: "Ocurrió un error al guardar la dirección",
    });
  }
};
export const getDireccionByEntidad = async (req: Request, res: Response) => {
  try {
    const { tipo_entidad, cod_entidad } = req.params;

    if (!tipo_entidad || !cod_entidad) {
      return res.status(400).json({
        success: false,
        message: "Faltan parámetros obligatorios (tipo_entidad o cod_entidad)",
      });
    }

    const direccion = await Direcciones.findOne({
      where: {
        DIUS_Tipo_Entidad: tipo_entidad,
        DIUS_Cod_Entidad: cod_entidad,
      },
      include: [
        {
          model: Ubigeos,
          as: "Ubigeo",
          attributes: [
            "UBIG_Codigo",
            "UBIG_Departamento",
            "UBIG_Provincia",
            "UBIG_Distrito",
          ],
        },
      ],
    });

    if (!direccion) {
      return res.status(404).json({
        success: false,
        message: `No se encontró dirección para el ${tipo_entidad} con código ${cod_entidad}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Dirección obtenida correctamente",
      data: direccion,
    });
  } catch (error: any) {
    console.error("Error obteniendo dirección:", error);
    return res.status(500).json({
      success: false,
      message: "Ocurrió un error al obtener la dirección",
      error: error.message,
    });
  }
};


export const updateDireccion = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      cod_entidad,
      tipo_entidad,
      direccion,
      referencia,
      latitud,
      longitud,
      codigoUbigeo,
      predeterminado,
    } = req.body as {
      cod_entidad: string;
      tipo_entidad: string;
      direccion?: string;
      referencia?: string;
      latitud?: number;
      longitud?: number;
      codigoUbigeo?: string;
      predeterminado?: boolean;
    };

    // Validación de datos esenciales
    if (!cod_entidad || !tipo_entidad) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Faltan parámetros obligatorios (cod_entidad o tipo_entidad)",
      });
    }

    // 🔍 Buscar dirección existente
    let direccionExistente = await Direcciones.findOne({
      where: {
        DIUS_Cod_Entidad: cod_entidad,
        DIUS_Tipo_Entidad: tipo_entidad,
      },
      transaction,
    });

    if (direccionExistente) {
      // Si existe, la actualizamos
      await direccionExistente.update(
        {
          DIUS_Direccion: direccion ?? direccionExistente.get("DIUS_Direccion"),
          DIUS_Referencia: referencia ?? direccionExistente.get("DIUS_Referencia"),
          DIUS_Latitud: latitud ?? direccionExistente.get("DIUS_Latitud"),
          DIUS_Longitud: longitud ?? direccionExistente.get("DIUS_Longitud"),
          DIUS_CodigoUbigeo: codigoUbigeo ?? direccionExistente.get("DIUS_CodigoUbigeo"),
          DIUS_Predeterminada:
            predeterminado ?? direccionExistente.get("DIUS_Predeterminada"),
        },
        { transaction }
      );

      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: "Dirección actualizada correctamente",
        data: direccionExistente,
      });
    }

    // Si no existe, la creamos
    const nuevaDireccion = await Direcciones.create(
      {
        DIUS_Tipo: "principal",
        DIUS_Tipo_Entidad: tipo_entidad,
        DIUS_Cod_Entidad: cod_entidad,
        DIUS_Direccion: direccion || "Sin dirección definida",
        DIUS_Referencia: referencia || null,
        DIUS_Latitud: latitud || null,
        DIUS_Longitud: longitud || null,
        DIUS_CodigoUbigeo: codigoUbigeo || null,
        DIUS_Predeterminada: predeterminado ?? false,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: `Dirección creada correctamente para ${tipo_entidad}`,
      data: nuevaDireccion,
    });
  } catch (error: any) {
    console.error(" Error guardando o actualizando dirección:", error);
    await transaction.rollback();
    return res.status(500).json({
      success: false,
      message: "Ocurrió un error al guardar la dirección",
      error: error.message,
    });
  }
};
