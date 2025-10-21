import { sequelize } from "../db";
import { CategoriaAttributes } from "../interfaces/ICategoria";
import { SubcategoriaAttributes } from "../interfaces/ISubcategoria";

const { Categorias, Subcategorias, Direcciones, Servicios } = sequelize.models;

// Obtener todas las categorías con sus subcategorías
export const getCategorias = async (): Promise<{
  success: boolean;
  message: string;
  data: (CategoriaAttributes & { Subcategorias: SubcategoriaAttributes[] })[];
}> => {
  try {
    const categorias = await Categorias.findAll({
      include: [
        {
          model: Subcategorias,
          as: "Subcategorias",
        },
      ],
    });

    if (categorias.length === 0) {
      throw new Error("No se encontraron categorías");
    }

    const categoriasPlain = categorias.map((cat: any) =>
      cat.get({ plain: true })
    );

    return {
      success: true,
      message: "Categorías encontradas",
      data: categoriasPlain,
    };
  } catch (error: any) {
    throw new Error(
      JSON.stringify({ success: false, message: error.message })
    );
  }
};

// Crear una categoría
export const createCategoria = async (
  data: Omit<CategoriaAttributes, "CATE_Id">
): Promise<{ success: boolean; message: string; data?: CategoriaAttributes }> => {
  try {
    const categoria = await Categorias.create(data);

    return {
      success: true,
      message: "Categoría creada correctamente",
      data: categoria.get({ plain: true }) as CategoriaAttributes,
    };
  } catch (error: any) {
    throw new Error(
      JSON.stringify({ success: false, message: error.message })
    );
  }
};

// Actualizar una categoría
export const updateCategoria = async (
  id: number,
  data: Partial<CategoriaAttributes>
): Promise<{ success: boolean; message: string; data?: CategoriaAttributes }> => {
  try {
    const categoria = await Categorias.findByPk(id);

    if (!categoria) {
      throw new Error("Categoría no encontrada");
    }

    await categoria.update(data);

    return {
      success: true,
      message: "Categoría actualizada correctamente",
      data: categoria.get({ plain: true }) as CategoriaAttributes,
    };
  } catch (error: any) {
    throw new Error(
      JSON.stringify({ success: false, message: error.message })
    );
  }
};

export const getCategoriasConServiciosActivosPorDepartamento = async (
  codDepartamento: string
): Promise<{ codigo_categoria: number; categoria: string; total_servicios: number }[]> => {
  try {
    type Direccion = { DIUS_CodigoUbigeo: string; DIUS_Cod_Entidad: string };
    type Servicio = { SERV_Interno: string; SUBC_Id: number };
    type Subcategoria = { SUBC_Id: number; CATE_Id: number };
    type Categoria = { CATE_Id: number; CATE_Nombre: string };

    // Direcciones de servicios
    const direccionesServicios = (await Direcciones.findAll({
      attributes: ["DIUS_CodigoUbigeo", "DIUS_Cod_Entidad"],
      where: { DIUS_Tipo_Entidad: "servicio" },
      raw: true,
    })) as unknown as Direccion[];

    //  Servicios activos
    const serviciosActivos = (await Servicios.findAll({
      where: { SERV_Estado: true },
      attributes: ["SERV_Interno", "SUBC_Id"],
      raw: true,
    })) as unknown as Servicio[];

    const serviciosActivosSet = new Set(serviciosActivos.map(s => s.SERV_Interno));

    // Subcategorías y categorías
    const subcategorias = (await Subcategorias.findAll({
      attributes: ["SUBC_Id", "CATE_Id"],
      raw: true,
    })) as unknown as Subcategoria[];

    const categorias = (await Categorias.findAll({
      attributes: ["CATE_Id", "CATE_Nombre"],
      raw: true,
    })) as unknown as Categoria[];

    // Filtrar servicios por departamento
    const serviciosEnDepartamento = direccionesServicios
      .filter(d => d.DIUS_CodigoUbigeo.startsWith(codDepartamento))
      .map(d => d.DIUS_Cod_Entidad)
      .filter(id => serviciosActivosSet.has(id));

    // Contar servicios por categoría
    const conteoPorCategoria: Record<number, number> = {};

    for (const servicioId of serviciosEnDepartamento) {
      const servicio = serviciosActivos.find(s => s.SERV_Interno === servicioId);
      if (servicio) {
        const subcat = subcategorias.find(sc => sc.SUBC_Id === servicio.SUBC_Id);
        if (subcat) {
          conteoPorCategoria[subcat.CATE_Id] = (conteoPorCategoria[subcat.CATE_Id] || 0) + 1;
        }
      }
    }

    // Siempre retornar TODAS las categorías (aunque total_servicios = 0)
    const resultado = categorias.map(c => ({
      codigo_categoria: c.CATE_Id,
      categoria: c.CATE_Nombre,
      total_servicios: conteoPorCategoria[c.CATE_Id] || 0,
    }));

    return resultado;
  } catch (error: any) {
    console.error("❌ Error al obtener categorías con servicios activos:", error);
    return [];
  }
};



export const getSubcategoriasConServiciosActivos = async (
  codUbigeo: string,
  cateId: number
): Promise<{ subcategoria: string; total_servicios: number }[]> => {
  try {
    type Direccion = { DIUS_CodigoUbigeo: string; DIUS_Cod_Entidad: string };
    type Servicio = { SERV_Interno: string; SUBC_Id: number };
    type Subcategoria = { SUBC_Id: number; SUBC_Nombre: string; CATE_Id: number };

    // Direcciones de servicios
    const direccionesServicios = (await Direcciones.findAll({
      attributes: ["DIUS_CodigoUbigeo", "DIUS_Cod_Entidad"],
      where: { DIUS_Tipo_Entidad: "servicio" },
      raw: true,
    })) as unknown as Direccion[];

    // Servicios activos
    const serviciosActivos = (await Servicios.findAll({
      where: { SERV_Estado: true },
      attributes: ["SERV_Interno", "SUBC_Id"],
      raw: true,
    })) as unknown as Servicio[];

    const serviciosActivosSet = new Set(serviciosActivos.map(s => s.SERV_Interno));

    // Subcategorías
    const subcategorias = (await Subcategorias.findAll({
      attributes: ["SUBC_Id", "SUBC_Nombre", "CATE_Id"],
      raw: true,
    })) as unknown as Subcategoria[];

    // Filtrar por ubigeo
    const serviciosEnUbigeo = direccionesServicios
      .filter(d => d.DIUS_CodigoUbigeo.startsWith(codUbigeo))
      .map(d => d.DIUS_Cod_Entidad)
      .filter(id => serviciosActivosSet.has(id));

    // Contar servicios por subcategoría dentro de la categoría seleccionada
    const conteoPorSubcategoria: Record<number, number> = {};

    for (const servicioId of serviciosEnUbigeo) {
      const servicio = serviciosActivos.find(s => s.SERV_Interno === servicioId);
      if (servicio) {
        const subcat = subcategorias.find(
          sc => sc.SUBC_Id === servicio.SUBC_Id && sc.CATE_Id === cateId
        );
        if (subcat) {
          conteoPorSubcategoria[subcat.SUBC_Id] =
            (conteoPorSubcategoria[subcat.SUBC_Id] || 0) + 1;
        }
      }
    }

    // Siempre retornar TODAS las subcategorías de la categoría (aunque total_servicios = 0)
    const resultado = subcategorias
      .filter(sc => sc.CATE_Id === cateId)
      .map(sc => ({
        subcategoria: sc.SUBC_Nombre,
        total_servicios: conteoPorSubcategoria[sc.SUBC_Id] || 0,
      }));

    return resultado;
  } catch (error: any) {
    console.error("❌ Error al obtener subcategorías con servicios activos:", error);
    return [];
  }
};

