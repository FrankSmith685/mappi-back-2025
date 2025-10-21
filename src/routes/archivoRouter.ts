import { Router, Request, Response } from "express";
import multer from "multer";
import { subirArchivo, getArchivos, actualizarArchivo, subirArchivoUrl, actualizarArchivosMultiples, eliminarArchivosMultiples, eliminarArchivo } from "../controllers/archivoController";
import { authenticate } from "../config/middleware/authenticate";

const router = Router();
const upload = multer();

router.post(
  "/upload",
  authenticate,
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const { entidad, entidadId, tipo } = req.body;
      const file = req.file;

      const result = await subirArchivo(entidad, entidadId, tipo, file!);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Error al subir archivo",
        data: null,
      });
    }
  }
);

router.put(
  "/update",
  authenticate,
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const { entidad, entidadId, tipo } = req.body;
      const file = req.file;

      const result = await actualizarArchivo(entidad, entidadId, tipo, file!);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Error al actualizar archivo",
        data: null,
      });
    }
  }
);


// Obtener archivos por entidad
router.get(
  "/:entidad/:entidadId",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { entidad, entidadId } = req.params;
      const { tipo } = req.query;

      const result = await getArchivos(entidad, entidadId, tipo as string);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Error al obtener archivos",
        data: null,
      });
    }
  }
);
router.post(
  "/upload-multiple",
  authenticate,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "portada", maxCount: 1 },
    { name: "imagen", maxCount: 10 },
    { name: "video", maxCount: 1 },
    { name: "documento", maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    try {
      const { entidad, entidadId, videoUrl } = req.body;
      const files = req.files as {
        [fieldname: string]: Express.Multer.File[];
      };

      const resultados: any[] = [];

      if (files.logo) {
        const r = await subirArchivo(entidad, entidadId, "logo", files.logo[0]);
        resultados.push(r);
      }
      if (files.portada) {
        const r = await subirArchivo(entidad, entidadId, "portada", files.portada[0]);
        resultados.push(r);
      }
      if (files.imagen) {
        for (const img of files.imagen) {
          const r = await subirArchivo(entidad, entidadId, "imagen", img);
          resultados.push(r);
        }
      }
      if (files.video) {
        const r = await subirArchivo(entidad, entidadId, "video", files.video[0]);
        resultados.push(r);
      } else if (videoUrl) {
        // 🚨 Aquí guardamos la URL directamente
        const r = await subirArchivoUrl(entidad, entidadId, "video", videoUrl);
        resultados.push(r);
      }

      if (files.documento) {
        const r = await subirArchivo(entidad, entidadId, "documento", files.documento[0]);
        resultados.push(r);
      }

      res.status(200).json({
        success: true,
        message: "Archivos subidos correctamente",
        data: resultados,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Error al subir archivos",
        data: null,
      });
    }
  }
);

// Actualizar múltiples archivos (borra los anteriores y sube nuevos)
router.put(
  "/update-multiple",
  authenticate,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "portada", maxCount: 1 },
    { name: "imagen", maxCount: 10 },
    { name: "video", maxCount: 1 },
    { name: "documento", maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    try {
      const { entidad, entidadId, videoUrl } = req.body;
      const files = req.files as {
        [fieldname: string]: Express.Multer.File[];
      };

      const resultados: any[] = [];

      if (files.logo) {
        const r = await actualizarArchivosMultiples(entidad, entidadId, "logo", files.logo);
        resultados.push(r);
      }
      if (files.portada) {
        const r = await actualizarArchivosMultiples(entidad, entidadId, "portada", files.portada);
        resultados.push(r);
      }
      if (files.imagen) {
        const r = await actualizarArchivosMultiples(entidad, entidadId, "imagen", files.imagen);
        resultados.push(r);
      }
      if (files.video && files.video.length > 0) {
        const r = await actualizarArchivosMultiples(entidad, entidadId, "video", files.video);
        resultados.push(r);
      } else if (videoUrl) {
        // En caso de ser URL de video
        const r = await subirArchivoUrl(entidad, entidadId, "video", videoUrl);
        resultados.push(r);
      }
      if (files.documento) {
        const r = await actualizarArchivosMultiples(entidad, entidadId, "documento", files.documento);
        resultados.push(r);
      }

      res.status(200).json({
        success: true,
        message: "Archivos actualizados correctamente",
        data: resultados,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Error al actualizar archivos",
        data: null,
      });
    }
  }
);


router.delete(
  "/delete/:id",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await eliminarArchivo(id);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Error al eliminar archivo",
      });
    }
  }
);

// Eliminar múltiples archivos
router.delete(
  "/delete-multiple",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { ids } = req.body; // ej: { "ids": ["uuid1", "uuid2", "uuid3"] }
      const result = await eliminarArchivosMultiples(ids);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Error al eliminar archivos",
      });
    }
  }
);


export default router;
