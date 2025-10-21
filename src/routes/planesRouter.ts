import { Router, Request, Response } from "express";
import { authenticate } from "../config/middleware/authenticate";
import {
  getPlanesByTipoUsuario,
  getTodosLosPlanes,
} from "../controllers/planesController";

const router = Router();

/**
 * 📘 Obtener planes filtrados por tipo de usuario
 * Ejemplo: GET /planes?tipo=empresa  o  GET /planes?tipo=independiente
 */
router.get(
  "/obtener-planes",
  authenticate,
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const tipo = req.query.tipo as "empresa" | "independiente" | undefined;

      // Si el tipo no se pasa, devolver todos los planes
      if (!tipo) {
        const result = await getTodosLosPlanes();
        return res.status(200).json(result);
      }

      if (!["empresa", "independiente"].includes(tipo)) {
        return res.status(400).json({
          success: false,
          message: "El parámetro 'tipo' debe ser 'empresa' o 'independiente'.",
        });
      }

      const result = await getPlanesByTipoUsuario(tipo);
      return res.status(200).json(result);
    } catch (error: any) {
      try {
        const parsedError = JSON.parse(error.message);
        return res.status(400).json(parsedError);
      } catch {
        return res.status(500).json({
          success: false,
          message: error.message || "Error inesperado al obtener los planes",
        });
      }
    }
  }
);

export default router;
