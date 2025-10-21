// controllers/empresaController.ts
import { sequelize } from "../db";
import { EmpresaAttributes, EmpresaCreationAttributes } from "../interfaces/IEmpresa";
import { DireccionAttributes } from "../interfaces/IDirecciones";
import { Model } from "sequelize";

const { Empresas, Direcciones, Usuarios } = sequelize.models;


export const getEmpresaByUserId = async (userId: string) => {
  const empresa = await Empresas.findOne({
    where: { USUA_Interno: userId },
    include: [
      {
        model: Direcciones,
        as: "Direccion",
        attributes: [
          "DIUS_Direccion",
          "DIUS_Referencia",
          "DIUS_Latitud",
          "DIUS_Longitud",
          "DIUS_CodigoUbigeo",
        ],
      }
    ],
  });

  if (!empresa) return null;

  const plain = empresa.get({ plain: true });

  return {
    cod_empresa: plain.EMPR_Interno,
    razon_social: plain.EMPR_RazonSocial,
    ruc: plain.EMPR_Ruc,
    telefono: plain.EMPR_Telefono,
    estado: plain.EMPR_Estado,
    fechaRegistro: plain.EMPR_FechaRegistro,
    cod_usuario: plain.USUA_Interno,

    direccion: plain.Direccion
      ? {
          direccion: plain.Direccion.DIUS_Direccion,
          referencia: plain.Direccion.DIUS_Referencia,
          latitud: plain.Direccion.DIUS_Latitud,
          longitud: plain.Direccion.DIUS_Longitud,
          idUbigeo: plain.Direccion.DIUS_CodigoUbigeo,
        }
      : null,
  };
};



// =====================
// 🔹 Obtener empresa por ID
// =====================
export const getEmpresaById = async (empresaId: string) => {
  const empresa = await Empresas.findOne({
    where: { EMPR_Interno: empresaId },
    include: [
      {
        model: Direcciones,
        as: "Direccion",
        attributes: [
          "DIUS_Direccion",
          "DIUS_Referencia",
          "DIUS_Latitud",
          "DIUS_Longitud",
          "DIUS_CodigoUbigeo",
        ],
      },
    ],
  });

  if (!empresa) throw new Error("Empresa no encontrada");

  const plain = empresa.get({ plain: true });

  return {
    cod_empresa: plain.EMPR_Interno,
    razon_social: plain.EMPR_RazonSocial,
    ruc: plain.EMPR_Ruc,
    telefono: plain.EMPR_Telefono,
    estado: plain.EMPR_Estado,
    fechaRegistro: plain.EMPR_FechaRegistro,
    cod_usuario: plain.USUA_Interno,

    direccion: plain.Direccion
      ? {
          direccion: plain.Direccion.DIUS_Direccion,
          referencia: plain.Direccion.DIUS_Referencia,
          latitud: plain.Direccion.DIUS_Latitud,
          longitud: plain.Direccion.DIUS_Longitud,
          idUbigeo: plain.Direccion.DIUS_CodigoUbigeo,
        }
      : null,
  };
};


// =====================
// 🔹 Crear o actualizar empresa
// =====================
export const createEmpresa = async (
  data: {
    USUA_Interno: string;
    EMPR_RazonSocial: string;
    EMPR_Ruc?: string;
    EMPR_Telefono?: string;
    DIUS_Direccion?: string;
    DIUS_CodigoUbigeo?: string;
    DIUS_Latitud?: number;
    DIUS_Longitud?: number;
  }
): Promise<{ success: boolean; message: string; data?: any }> => {
  const transaction = await sequelize.transaction();

  try {

    const ultimoEmpresa = await Empresas.findOne({
        order: [['EMPR_Interno', 'DESC']],
        attributes: ['EMPR_Interno']
      }) as Model<EmpresaAttributes, EmpresaCreationAttributes>;

     let nuevoCodigoEmpresa: string;
    if (ultimoEmpresa) {
        const nuevoCodEmpresa = ultimoEmpresa.getDataValue('EMPR_Interno');
        const numero = parseInt(nuevoCodEmpresa.slice(3)) + 1;
        nuevoCodigoEmpresa = `EMP${numero.toString().padStart(4, '0')}`;
    } else {
        nuevoCodigoEmpresa = 'EMP0001';
    }
    // Crear empresa
    await Empresas.create(
      {
        EMPR_Interno:nuevoCodigoEmpresa,
        EMPR_RazonSocial: data.EMPR_RazonSocial,
        EMPR_Ruc: data.EMPR_Ruc,
        EMPR_Telefono: data.EMPR_Telefono,
        EMPR_Estado: true,
        USUA_Interno: data.USUA_Interno,
      },
      { transaction }
    );

    // Crear dirección (si viene)
    if (data.DIUS_Direccion || data.DIUS_CodigoUbigeo) {
      await Direcciones.create(
        {
          DIUS_Direccion: data.DIUS_Direccion,
          DIUS_CodigoUbigeo: data.DIUS_CodigoUbigeo,
          DIUS_Latitud: data.DIUS_Latitud,
          DIUS_Longitud: data.DIUS_Longitud,
          DIUS_Tipo: "principal",
          DIUS_Tipo_Entidad: "empresa",
          DIUS_Cod_Entidad: nuevoCodigoEmpresa,
        },
        { transaction }
      );
    }

    await transaction.commit();

    const empresaData = await getEmpresaById(nuevoCodigoEmpresa);

    return {
      success: true,
      message: "Empresa creada correctamente",
      data: empresaData,
    };
  } catch (error: any) {
    await transaction.rollback();
    return { success: false, message: error.message };
  }
};

export const updateEmpresa = async (
  data: {
    EMPR_Interno: string;
    EMPR_RazonSocial?: string;
    EMPR_Ruc?: string;
    EMPR_Telefono?: string;
    EMPR_Estado?: string;
    DIUS_Direccion?: string;
    DIUS_CodigoUbigeo?: string;
    DIUS_Latitud?: number;
    DIUS_Longitud?: number;
  }
): Promise<{ success: boolean; message: string; data?: any }> => {
  const transaction = await sequelize.transaction();

  try {
    const { EMPR_Interno, ...fields } = data;

    const empresa = await Empresas.findByPk(EMPR_Interno, { transaction });
    if (!empresa) {
      throw new Error("Empresa no encontrada");
    }

    // Update empresa
    await empresa.update(
      {
        EMPR_RazonSocial: fields.EMPR_RazonSocial,
        EMPR_Ruc: fields.EMPR_Ruc,
        EMPR_Telefono: fields.EMPR_Telefono,
        EMPR_Estado: fields.EMPR_Estado,
      },
      { transaction }
    );

    // Update/create dirección
    if (
      fields.DIUS_Direccion ||
      fields.DIUS_CodigoUbigeo ||
      fields.DIUS_Latitud ||
      fields.DIUS_Longitud
    ) {
      const direccion = await Direcciones.findOne({
        where: { DIUS_Cod_Entidad: EMPR_Interno, DIUS_Tipo_Entidad: "empresa" },
        transaction,
      });

      if (direccion) {
        await direccion.update(
          {
            DIUS_Direccion: fields.DIUS_Direccion,
            DIUS_CodigoUbigeo: fields.DIUS_CodigoUbigeo,
            DIUS_Latitud: fields.DIUS_Latitud,
            DIUS_Longitud: fields.DIUS_Longitud,
          },
          { transaction }
        );
      } else {
        await Direcciones.create(
          {
            DIUS_Direccion: fields.DIUS_Direccion,
            DIUS_CodigoUbigeo: fields.DIUS_CodigoUbigeo,
            DIUS_Latitud: fields.DIUS_Latitud,
            DIUS_Longitud: fields.DIUS_Longitud,
            DIUS_Tipo: "principal",
            DIUS_Tipo_Entidad: "empresa",
            DIUS_Cod_Entidad: EMPR_Interno,
          },
          { transaction }
        );
      }
    }

    await transaction.commit();

    const empresaData = await getEmpresaById(EMPR_Interno);

    return {
      success: true,
      message: "Empresa actualizada correctamente",
      data: empresaData,
    };
  } catch (error: any) {
    await transaction.rollback();
    return { success: false, message: error.message };
  }
};

// =====================
// 🔹 Eliminar empresa (opcional)
// =====================
export const deleteEmpresa = async (empresaId: string) => {
  const transaction = await sequelize.transaction();
  try {
    // Eliminar direcciones asociadas
    await Direcciones.destroy({
      where: { DIUS_Cod_Entidad: empresaId, DIUS_Tipo_Entidad: "empresa" },
      transaction,
    });

    // Eliminar empresa
    await Empresas.destroy({
      where: { EMPR_Interno: empresaId },
      transaction,
    });

    await transaction.commit();
    return { success: true, message: "Empresa eliminada correctamente" };
  } catch (error: any) {
    await transaction.rollback();
    return { success: false, message: error.message };
  }
};
