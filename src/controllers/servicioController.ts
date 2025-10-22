import { sequelize } from "../db";
import { ServicioAttributes, ServicioCreationAttributes, ServicioData } from "../interfaces/IServicios";
import { Model, fn, col, Op } from "sequelize";

const { Servicios, Subcategorias, Direcciones, Ubigeos, Categorias, Archivos, Usuarios, PlanesUsuarios, Empresas, Planes,TipoPlanes } = sequelize.models;

export interface ServicioResponse {
  success: boolean;
  message: string;
  data?: ServicioData;
}

export const getServiciosActivosPremium = async () => {
  try {
    const servicios = await Servicios.findAll({
      where: {
        SERV_Estado: true,
        SERV_Archivado: false,
      },
      include: [
        //  Subcategoría y Categoría
        {
          model: Subcategorias,
          as: "Subcategoria",
          attributes: ["SUBC_Id", "SUBC_Nombre"],
          include: [
            {
              model: Categorias,
              as: "Categoria",
              attributes: ["CATE_Id", "CATE_Nombre"],
            },
          ],
        },

        //  Archivos del servicio (logo, portada, imagen)
        {
          model: Archivos,
          as: "Archivos",
          attributes: ["ARCH_ID", "ARCH_Tipo", "ARCH_Ruta"],
          where: {
            ARCH_Tipo: {
              [Op.in]: ["logo", "portada", "imagen"],
            },
          },
          required: false,
        },

        //  Usuario con plan premium activo
        {
          model: Usuarios,
          as: "Usuario",
          attributes: ["USUA_Interno", "USUA_Nombre", "USUA_Apellido"],
          include: [
            {
              model: Empresas,
              as: "Empresas",
              attributes: ["EMPR_Interno", "EMPR_RazonSocial"],
              required: false,
            },
            {
              model: PlanesUsuarios,
              as: "PlanesAsignados",
              required: true, // Solo traer si tiene plan premium
              where: {
                PLUS_EstadoPlan: "activo",
                PLUS_EsPremium: true, //  Solo premium
                PLUS_FechaExpiracion: {
                  [Op.or]: [
                    { [Op.gte]: new Date() },
                    { [Op.is]: null },
                  ],
                },
              },
              include: [
                {
                  model: Planes,
                  as: "Plan",
                  attributes: [
                    "PLAN_Id",
                    "PLAN_TipoUsuario",
                    "PLAN_Precio",
                    "PLAN_DuracionMeses",
                  ],
                  include: [
                    {
                      model: TipoPlanes,
                      as: "TipoPlan",
                      attributes: ["TIPL_Id", "TIPL_Nombre"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      order: [["SERV_FechaRegistro", "DESC"]],
      limit: 4,
    });

    //  Convertir a objetos planos
    return servicios.map((s: any) => s.get({ plain: true }));
  } catch (error: any) {
    console.error(" Error en getServiciosActivosPremium:", error.message);
    return [];
  }
};

export const getServiciosActivosConPlanChevere = async () => {
  try {
    const servicios = await Servicios.findAll({
      where: {
        SERV_Estado: true,
        SERV_Archivado: false,
      },
      include: [
        //  Usuario con su último plan chévere activo
        {
          model: Usuarios,
          as: "Usuario",
          required: true,
          include: [
            {
              model: PlanesUsuarios,
              as: "PlanesAsignados",
              separate: true, //  Aplica limit/order internamente
              limit: 1,
              order: [["PLUS_Id", "DESC"]], // último plan asignado
              where: {
                PLUS_EstadoPlan: "activo",
                PLUS_FechaExpiracion: {
                  [Op.or]: [
                    { [Op.gte]: new Date() },
                    { [Op.is]: null },
                  ],
                },
              },
              include: [
                {
                  model: Planes,
                  as: "Plan",
                  required: true,
                  include: [
                    {
                      model: TipoPlanes,
                      as: "TipoPlan",
                      required: true,
                      where: { TIPL_Nombre: "Plan Chévere" },
                    },
                  ],
                },
              ],
            },
          ],
        },

        //  Subcategoría y categoría
        {
          model: Subcategorias,
          as: "Subcategoria",
          include: [{ model: Categorias, as: "Categoria" }],
        },

        //  Archivos
        {
          model: Archivos,
          as: "Archivos",
          attributes: ["ARCH_ID", "ARCH_Tipo", "ARCH_Ruta"],
        },
      ],

      //  Ordenar por la fecha de registro del servicio (más recientes primero)
      order: [["SERV_FechaRegistro", "DESC"]],
    });

    //  Filtrar solo los que realmente tienen el Plan Chévere activo
    const filtrados = servicios
      .map((s: any) => s.get({ plain: true }))
      .filter(
        (s: any) =>
          s.Usuario?.PlanesAsignados?.length > 0 &&
          s.Usuario.PlanesAsignados[0]?.Plan?.TipoPlan?.TIPL_Nombre === "Plan Chévere"
      );

    return filtrados;
  } catch (error: any) {
    console.error(" Error en getServiciosActivosConPlanChevere:", error.message);
    return [];
  }
};

export const getServicios = async (): Promise<ServicioData[]> => {
  try {
    const servicios = await Servicios.findAll({
      include: [
        {
          model: Subcategorias,
          as: "Subcategoria", // asegúrate de que la relación esté definida
          attributes: ["SUBC_Id", "SUBC_Nombre", "SUBC_Descripcion"],
        },
      ],
      order: [["SERV_FechaRegistro", "DESC"]],
    }) as Model<any, any>[];

    // Mapear cada servicio a ServicioData
    const serviciosData: ServicioData[] = servicios.map((s) => {
      const servicio = s.get({ plain: true });
      return {
        cod_servicio: servicio.SERV_Interno,
        nombre: servicio.SERV_Nombre,
        descripcion: servicio.SERV_Descripcion ?? null,
        estado: servicio.SERV_Estado,
        fechaRegistro: servicio.SERV_FechaRegistro,
        cod_usuario: servicio.USUA_Interno,
        subcategoria: servicio.Subcategoria
          ? {
              cod_subcategoria: servicio.Subcategoria.SUBC_Id,
              nombre: servicio.Subcategoria.SUBC_Nombre,
              descripcion: servicio.Subcategoria.SUBC_Descripcion ?? null,
            }
          : null,
        abierto24h: servicio.SERV_Abierto24h,
        horaInicio: servicio.SERV_HoraInicio ?? null,
        horaFin: servicio.SERV_HoraFin ?? null,
        delivery: servicio.SERV_Delivery,
        archivado: servicio.SERV_Archivado
      };
    });

    return serviciosData;
  } catch (error: any) {
    console.error("Error al obtener servicios:", error.message);
    return [];
  }
};

export const getServicioActivoById = async (
  servicioId: string
): Promise<ServicioResponse> => {
  try {
    const servicio = (await Servicios.findOne({
      where: { SERV_Interno: servicioId, SERV_Estado: true },
      include: [
        {
          model: Subcategorias,
          as: "Subcategoria",
          attributes: ["SUBC_Id", "SUBC_Nombre", "SUBC_Descripcion", "CATE_Id"],
          include: [
            {
              model: Categorias,
              as: "Categoria",
              attributes: ["CATE_Id", "CATE_Nombre", "CATE_Descripcion"],
            },
          ],
        },
        {
          model: Direcciones,
          as: "Direccion",
          attributes: [
            "DIUS_Interno",
            "DIUS_CodigoUbigeo",
            "DIUS_Direccion",
            "DIUS_Referencia",
            "DIUS_Tipo",
            "DIUS_Predeterminada",
            "DIUS_Tipo_Entidad",
            "DIUS_Cod_Entidad",
            "DIUS_Latitud",
            "DIUS_Longitud",
          ],
          where: { DIUS_Tipo_Entidad: "servicio" },
          required: false,
        },
        {
          model: Archivos,
          as: "Archivos",
          attributes: [
            "ARCH_ID",
            "ARCH_Entidad",
            "ARCH_EntidadId",
            "ARCH_Tipo",
            "ARCH_NombreOriginal",
            "ARCH_Ruta",
            "ARCH_FechaSubida",
          ],
        },
        {
          model: sequelize.models.Usuarios,
          as: "Usuario",
          attributes: [ 
            "USUA_Interno",
            "USUA_Nombre",
            "USUA_Apellido",
            "USUA_Correo",
            "USUA_Telefono",
          ],
          include: [
            {
              model: sequelize.models.Empresas,
              as: "Empresas",
              attributes: [
                "EMPR_Interno",
                "EMPR_RazonSocial",
                "EMPR_Ruc",
                "EMPR_Telefono",
                "EMPR_Estado",
                "EMPR_FechaRegistro",
              ],
              required: false,
            },
          ],
        },

      ],
    })) as Model<any, any> | null;

    if (!servicio)
      return {
        success: false,
        message: "Servicio no encontrado o inactivo",
      };

    const s = servicio.get({ plain: true });

    const servicioData: ServicioData = {
      cod_servicio: s.SERV_Interno,
      nombre: s.SERV_Nombre,
      descripcion: s.SERV_Descripcion ?? null,
      estado: s.SERV_Estado,
      fechaRegistro: s.SERV_FechaRegistro,
      cod_usuario: s.USUA_Interno,

      subcategoria: s.Subcategoria
        ? {
            cod_subcategoria: s.Subcategoria.SUBC_Id,
            nombre: s.Subcategoria.SUBC_Nombre,
            descripcion: s.Subcategoria.SUBC_Descripcion ?? null,
            categoria: s.Subcategoria.Categoria
              ? {
                  cod_categoria: s.Subcategoria.Categoria.CATE_Id,
                  nombre: s.Subcategoria.Categoria.CATE_Nombre,
                  descripcion: s.Subcategoria.Categoria.CATE_Descripcion ?? null,
                }
              : null,
          }
        : null,

      direccion: s.Direccion
        ? {
            interno: s.Direccion.DIUS_Interno,
            codigo_ubigeo: s.Direccion.DIUS_CodigoUbigeo,
            direccion: s.Direccion.DIUS_Direccion,
            referencia: s.Direccion.DIUS_Referencia,
            tipo: s.Direccion.DIUS_Tipo,
            predeterminada: s.Direccion.DIUS_Predeterminada,
            tipo_entidad: s.Direccion.DIUS_Tipo_Entidad,
            cod_entidad: s.Direccion.DIUS_Cod_Entidad,
            latitud: s.Direccion.DIUS_Latitud,
            longitud: s.Direccion.DIUS_Longitud,
          }
        : null,

      archivos: s.Archivos
        ? s.Archivos.map((a: any) => ({
            id: a.ARCH_ID,
            tipo: a.ARCH_Tipo,
            nombreOriginal: a.ARCH_NombreOriginal,
            ruta: a.ARCH_Ruta,
            fechaSubida: a.ARCH_FechaSubida,
          }))
        : [],

      usuario: s.Usuario
        ? {
            cod_usuario: s.Usuario.USUA_Interno,
            nombres: s.Usuario.USUA_Nombres,
            apellidos: s.Usuario.USUA_Apellidos,
            email: s.Usuario.USUA_Email,
            telefono: s.Usuario.USUA_Telefono,
          }
        : null,

      empresa:
      s.Usuario?.Empresas && s.Usuario.Empresas.length > 0
        ? {
            cod_empresa: s.Usuario.Empresas[0].EMPR_Interno,
            razonSocial: s.Usuario.Empresas[0].EMPR_RazonSocial,
            ruc: s.Usuario.Empresas[0].EMPR_RUC,
            telefono: s.Usuario.Empresas[0].EMPR_Telefono,
            email: s.Usuario.Empresas[0].EMPR_Email,
          }
        : null,


      abierto24h: s.SERV_Abierto24h,
      horaInicio: s.SERV_HoraInicio ?? null,
      horaFin: s.SERV_HoraFin ?? null,
      delivery: s.SERV_Delivery,
      archivado: s.SERV_Archivado,
    };

    return {
      success: true,
      message: "Servicio activo encontrado",
      data: servicioData,
    };
  } catch (error: any) {
    console.error(" Error en getServicioActivoById:", error.message);
    return {
      success: false,
      message: "Error al obtener el servicio activo: " + error.message,
    };
  }
};


export const getServicioById = async (servicioId: string): Promise<ServicioData | null> => {
  try {
    const servicio = await Servicios.findOne({
      where: { SERV_Interno: servicioId },
      include: [
        {
          model: Subcategorias,
          as: "Subcategoria", // asegúrate de que la relación esté definida en el modelo
          attributes: ["SUBC_Id", "SUBC_Nombre", "SUBC_Descripcion"],
        },
      ],
    }) as Model<any, any> | null;

    if (!servicio) return null;

    const s = servicio.get({ plain: true });

    const servicioData: ServicioData = {
      cod_servicio: s.SERV_Interno,
      nombre: s.SERV_Nombre,
      descripcion: s.SERV_Descripcion ?? null,
      estado: s.SERV_Estado,
      fechaRegistro: s.SERV_FechaRegistro,
      cod_usuario: s.USUA_Interno,
      subcategoria: s.Subcategoria
        ? {
            cod_subcategoria: s.Subcategoria.SUBC_Id,
            nombre: s.Subcategoria.SUBC_Nombre,
            descripcion: s.Subcategoria.SUBC_Descripcion ?? null,
          }
        : null,
      abierto24h: s.SERV_Abierto24h,
      horaInicio: s.SERV_HoraInicio ?? null,
      horaFin: s.SERV_HoraFin ?? null,
      delivery: s.SERV_Delivery,
    };

    return servicioData;
  } catch (error: any) {
    console.error("Error al obtener servicio:", error.message);
    return null;
  }
};

export const createServicio = async (
  data: ServicioCreationAttributes & { USUA_Interno: string }
): Promise<ServicioResponse> => {
  const transaction = await sequelize.transaction();

  try {
    // Obtener último código de servicio
    const ultimoServicio = await Servicios.findOne({
      order: [["SERV_Interno", "DESC"]],
      attributes: ["SERV_Interno"],
    }) as Model<ServicioAttributes, ServicioCreationAttributes> | null;

    let nuevoCodigoServicio: string;
    if (ultimoServicio) {
      const ultimoCodigo = ultimoServicio.getDataValue("SERV_Interno");
      const numero = parseInt(ultimoCodigo.slice(3)) + 1;
      nuevoCodigoServicio = `SER${numero.toString().padStart(4, "0")}`;
    } else {
      nuevoCodigoServicio = "SER0001";
    }

    // Crear servicio
    await Servicios.create(
      {
        ...data,
        SERV_Interno: nuevoCodigoServicio,
        // SERV_Estado: true, // por defecto activo
      },
      { transaction }
    );

    await transaction.commit();

    // Obtener servicio creado con la misma estructura que ServicioData
    const servicioCreado = await getServicioById(nuevoCodigoServicio);

    return {
      success: true,
      message: "Servicio creado correctamente",
      data: servicioCreado ?? undefined,
    };
  } catch (error: any) {
    await transaction.rollback();
    return {
      success: false,
      message: "Error al crear servicio: " + error.message,
    };
  }
};

export const updateServicio = async (
  servicioId: string,
  data: Partial<ServicioCreationAttributes>
): Promise<ServicioResponse> => {
  const transaction = await sequelize.transaction();

  try {
    // Buscar el servicio existente
    const servicio = await Servicios.findOne({
      where: { SERV_Interno: servicioId },
    }) as Model<ServicioAttributes, ServicioCreationAttributes> | null;

    if (!servicio) {
      await transaction.rollback();
      return {
        success: false,
        message: "Servicio no encontrado",
      };
    }

    // Actualizar los campos permitidos
    await servicio.update(
      {
        SERV_Nombre: data.SERV_Nombre ?? servicio.getDataValue("SERV_Nombre"),
        SERV_Descripcion: data.SERV_Descripcion ?? servicio.getDataValue("SERV_Descripcion"),
        SERV_Estado: data.SERV_Estado ?? servicio.getDataValue("SERV_Estado"),
        SERV_Abierto24h: data.SERV_Abierto24h ?? servicio.getDataValue("SERV_Abierto24h"),
        SERV_HoraInicio: data.SERV_HoraInicio ?? servicio.getDataValue("SERV_HoraInicio"),
        SERV_HoraFin: data.SERV_HoraFin ?? servicio.getDataValue("SERV_HoraFin"),
        SERV_Delivery: data.SERV_Delivery ?? servicio.getDataValue("SERV_Delivery"),
        SUBC_Id: data.SUBC_Id ?? servicio.getDataValue("SUBC_Id"),
      },
      { transaction }
    );

    await transaction.commit();

    // Obtener el servicio actualizado con su relación
    const servicioActualizado = await getServicioById(servicioId);

    return {
      success: true,
      message: "Servicio actualizado correctamente",
      data: servicioActualizado ?? undefined,
    };
  } catch (error: any) {
    await transaction.rollback();
    return {
      success: false,
      message: "Error al actualizar servicio: " + error.message,
    };
  }
};


export const getServiciosByUsuario = async (usuarioId: string): Promise<ServicioData[]> => {
  try {
    console.log(usuarioId);
    const servicios = await Servicios.findAll({
      where: { USUA_Interno: usuarioId },
      include: [
        {
          model: Subcategorias,
          as: "Subcategoria",
          attributes: ["SUBC_Id", "SUBC_Nombre", "SUBC_Descripcion"],
        },
      ],
      order: [["SERV_FechaRegistro", "DESC"]],
    }) as Model<any, any>[];

    const serviciosData: ServicioData[] = servicios.map((s) => {
      const servicio = s.get({ plain: true });
      return {
        cod_servicio: servicio.SERV_Interno,
        nombre: servicio.SERV_Nombre,
        descripcion: servicio.SERV_Descripcion ?? null,
        estado: servicio.SERV_Estado,
        fechaRegistro: servicio.SERV_FechaRegistro,
        cod_usuario: servicio.USUA_Interno,
        subcategoria: servicio.Subcategoria
          ? {
              cod_subcategoria: servicio.Subcategoria.SUBC_Id,
              nombre: servicio.Subcategoria.SUBC_Nombre,
              descripcion: servicio.Subcategoria.SUBC_Descripcion ?? null,
            }
          : null,
        abierto24h: servicio.SERV_Abierto24h,
        horaInicio: servicio.SERV_HoraInicio ?? null,
        horaFin: servicio.SERV_HoraFin ?? null,
        delivery: servicio.SERV_Delivery,
      };
    });

    return serviciosData;
  } catch (error: any) {
    console.error("Error al obtener servicios del usuario:", error.message);
    return [];
  }
};

export const toggleArchivarServicio = async (
  servicioIds: string | string[],
  archivado: boolean
): Promise<{ success: boolean; message: string }> => {
  try {
    const ids = Array.isArray(servicioIds) ? servicioIds : [servicioIds];

    // Buscar todos los servicios
    const servicios = await Servicios.findAll({
      where: { SERV_Interno: ids },
    });

    if (servicios.length === 0) {
      return { success: false, message: "No se encontraron servicios válidos" };
    }

    // Actualizar todos en paralelo
    await Promise.all(
      servicios.map(servicio =>
        servicio.update({ SERV_Archivado: archivado })
      )
    );

    return {
      success: true,
      message: archivado
        ? `${servicios.length} servicio(s) archivado(s) correctamente`
        : `${servicios.length} servicio(s) restaurado(s) correctamente`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Error al archivar/desarchivar servicios",
    };
  }
};


export const getServiciosActivos = async (): Promise<{
  total: number;
  servicios: ServicioData[];
}> => {
  try {
    // Obtener servicios activos con categorías, direcciones y archivos
    const servicios = (await Servicios.findAll({
      where: { SERV_Estado: true },
      include: [
        {
          model: Subcategorias,
          as: "Subcategoria",
          attributes: ["SUBC_Id", "SUBC_Nombre", "SUBC_Descripcion", "CATE_Id"],
          include: [
            {
              model: Categorias,
              as: "Categoria",
              attributes: ["CATE_Id", "CATE_Nombre", "CATE_Descripcion"],
            },
          ],
        },
        {
          model: Direcciones,
          as: "Direccion",
          attributes: [
            "DIUS_Interno",
            "DIUS_CodigoUbigeo",
            "DIUS_Direccion",
            "DIUS_Referencia",
            "DIUS_Tipo",
            "DIUS_Predeterminada",
            "DIUS_Tipo_Entidad",
            "DIUS_Cod_Entidad",
            "DIUS_Latitud",
            "DIUS_Longitud",
          ],
          where: { DIUS_Tipo_Entidad: "servicio" },
          required: true,
        },
        {
          model: Archivos,
          as: "Archivos",
          attributes: [
            "ARCH_ID",
            "ARCH_Entidad",
            "ARCH_EntidadId",
            "ARCH_Tipo",
            "ARCH_NombreOriginal",
            "ARCH_Ruta",
            "ARCH_FechaSubida",
          ],
        },
      ],
      order: [["SERV_FechaRegistro", "DESC"]],
    })) as Model<any, any>[];

    // Mapear resultados
    const serviciosData: ServicioData[] = servicios.map((s) => {
      const servicio = s.get({ plain: true });

      return {
        cod_servicio: servicio.SERV_Interno,
        nombre: servicio.SERV_Nombre,
        descripcion: servicio.SERV_Descripcion ?? null,
        estado: servicio.SERV_Estado,
        fechaRegistro: servicio.SERV_FechaRegistro,
        cod_usuario: servicio.USUA_Interno,

        subcategoria: servicio.Subcategoria
          ? {
              cod_subcategoria: servicio.Subcategoria.SUBC_Id,
              nombre: servicio.Subcategoria.SUBC_Nombre,
              descripcion: servicio.Subcategoria.SUBC_Descripcion ?? null,
              categoria: servicio.Subcategoria.Categoria
                ? {
                    cod_categoria: servicio.Subcategoria.Categoria.CATE_Id,
                    nombre: servicio.Subcategoria.Categoria.CATE_Nombre,
                    descripcion:
                      servicio.Subcategoria.Categoria.CATE_Descripcion ?? null,
                  }
                : null,
            }
          : null,

        direccion: servicio.Direccion
          ? {
              interno: servicio.Direccion.DIUS_Interno,
              codigo_ubigeo: servicio.Direccion.DIUS_CodigoUbigeo,
              direccion: servicio.Direccion.DIUS_Direccion,
              referencia: servicio.Direccion.DIUS_Referencia,
              tipo: servicio.Direccion.DIUS_Tipo,
              predeterminada: servicio.Direccion.DIUS_Predeterminada,
              tipo_entidad: servicio.Direccion.DIUS_Tipo_Entidad,
              cod_entidad: servicio.Direccion.DIUS_Cod_Entidad,
              latitud: servicio.Direccion.DIUS_Latitud,
              longitud: servicio.Direccion.DIUS_Longitud,
            }
          : null,

        archivos: servicio.Archivos
          ? servicio.Archivos.map((a: any) => ({
              id: a.ARCH_ID,
              tipo: a.ARCH_Tipo,
              nombreOriginal: a.ARCH_NombreOriginal,
              ruta: a.ARCH_Ruta,
              fechaSubida: a.ARCH_FechaSubida,
            }))
          : [],

        abierto24h: servicio.SERV_Abierto24h,
        horaInicio: servicio.SERV_HoraInicio ?? null,
        horaFin: servicio.SERV_HoraFin ?? null,
        delivery: servicio.SERV_Delivery,
        archivado: servicio.SERV_Archivado,
      };
    });

    //  Calcular total
    const totalServicios = serviciosData.length;

    return {
      total: totalServicios,
      servicios: serviciosData,
    };
  } catch (error: any) {
    console.error(" Error al obtener servicios activos con categoría:", error.message);
    return { total: 0, servicios: [] };
  }
};
