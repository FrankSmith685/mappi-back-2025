import { Router, Request, Response } from "express";
import { authenticate } from "../config/middleware/authenticate";
import {
  getCategorias,
  createCategoria,
  updateCategoria,
  getSubcategoriasConServiciosActivos,
  getCategoriasConServiciosActivosPorDepartamento,
} from "../controllers/categoriaController";

const router = Router();

// Obtener todas las categorías con subcategorías
router.get(
  "/obtener-categorias",
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const result = await getCategorias();
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error inesperado",
      });
    }
  }
);

// Crear categoría
router.post(
  "/categorias",
  authenticate,
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const data = req.body;
      const result = await createCategoria(data);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error inesperado",
      });
    }
  }
);

// Actualizar categoría
router.put(
  "/categorias/:id",
  authenticate,
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const data = req.body;

      const result = await updateCategoria(Number(id), data);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error inesperado",
      });
    }
  }
);



router.get("/obtener-categorias/activos/:codDepartamento", async (req: Request, res: Response) => {
  try {
    const { codDepartamento } = req.params;

    if (!codDepartamento) {
      return res.status(400).json({
        success: false,
        message: "El parámetro 'codDepartamento' es requerido",
      });
    }

    const categorias = await getCategoriasConServiciosActivosPorDepartamento(codDepartamento);

    if (categorias.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No se encontraron categorías con servicios activos en este departamento",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Categorías con servicios activos obtenidas correctamente",
      data: categorias,
    });
  } catch (error: any) {
    console.error("Error en GET /direcciones/categorias/activos/:codDepartamento:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error inesperado al obtener las categorías",
    });
  }
});

router.get(
  "/obtener-subcategorias/activos/:codDepartamento/:cateId",
  async (req: Request, res: Response) => {
    try {
      const { codDepartamento, cateId } = req.params;

      if (!codDepartamento || !cateId) {
        return res.status(400).json({
          success: false,
          message: "Los parámetros 'codDepartamento' y 'cateId' son requeridos",
        });
      }

      const subcategorias = await getSubcategoriasConServiciosActivos(
        codDepartamento,
        Number(cateId)
      );

      if (subcategorias.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "No se encontraron subcategorías con servicios activos para este departamento y categoría",
          data: [],
        });
      }

      return res.status(200).json({
        success: true,
        message: "Subcategorías con servicios activos obtenidas correctamente",
        data: subcategorias,
      });
    } catch (error: any) {
      console.error(
        "Error en GET /direcciones/subcategorias/activos/:codDepartamento/:cateId:",
        error
      );
      return res.status(500).json({
        success: false,
        message: error.message || "Error inesperado al obtener las subcategorías",
      });
    }
  }
);

export default router;
