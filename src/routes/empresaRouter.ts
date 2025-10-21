import { Router, Request, Response } from "express";
import { authenticate } from "../config/middleware/authenticate";
import {
  deleteEmpresa,
  getEmpresaByUserId,
  createEmpresa,
  updateEmpresa,
} from "../controllers/empresaController";
import { getUserInfo } from "../controllers/userController";

const router = Router();

router.get("/empresa-info", authenticate, async (req: Request, res: Response) => {
  try {
    const username = req.user?.username;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Usuario no encontrado en el token",
      });
    }

    // Primero buscamos el usuario dueño del token
    const userInfo = await getUserInfo(username);
    if (!userInfo.success || !userInfo.data) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Relacionamos empresa por usuario
    const empresa = await getEmpresaByUserId(userInfo.data.cod_usuario);

    return res.status(200).json({
      success: true,
      message: "Empresa obtenida correctamente",
      data: empresa,
    });
  } catch (error: any) {
    console.error("Error en /empresa-info:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error inesperado al obtener la empresa",
    });
  }
});

router.post("/create", authenticate, async (req: Request, res: Response) => {
  try {
    const usernameFromToken = req.user?.username;

    if (!usernameFromToken) {
      return res.status(401).json({
        success: false,
        message: "Token no válido o usuario no autenticado",
      });
    }

    const userInfo = await getUserInfo(usernameFromToken);
    if (!userInfo.success || !userInfo.data) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado con el token",
      });
    }

    // Verificamos si ya tiene empresa asociada
    const existingEmpresa = await getEmpresaByUserId(userInfo.data.cod_usuario);
    if (existingEmpresa) {
      return res.status(400).json({
        success: false,
        message: "El usuario ya tiene una empresa registrada",
      });
    }

    // Creamos empresa nueva vinculada al usuario
    const result = await createEmpresa({
      ...req.body,
      USUA_Interno: userInfo.data.cod_usuario,
    });

    return res.status(result.success ? 201 : 400).json(result);
  } catch (error: any) {
    console.error("Error en POST /empresa:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error al crear la empresa",
    });
  }
});

router.put("/update/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const usernameFromToken = req.user?.username;

    if (!usernameFromToken) {
      return res.status(401).json({
        success: false,
        message: "Token no válido o usuario no autenticado",
      });
    }

    const userInfo = await getUserInfo(usernameFromToken);
    if (!userInfo.success || !userInfo.data) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado con el token",
      });
    }

    const empresa = await getEmpresaByUserId(userInfo.data.cod_usuario);
    if (!empresa) {
      return res.status(404).json({
        success: false,
        message: "Empresa no encontrada para este usuario",
      });
    }

    // Validamos que la empresa a actualizar sea la del usuario autenticado
    if (req.params.id !== empresa.cod_empresa) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para actualizar esta empresa",
      });
    }

    const result = await updateEmpresa({
      ...req.body,
      EMPR_Interno: req.params.id,
      USUA_Interno: userInfo.data.cod_usuario,
    });

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    console.error("Error en PUT /empresa/:id:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error al actualizar la empresa",
    });
  }
});

// router.delete("/delete-empresa", authenticate, async (req: Request, res: Response) => {
//   try {
//     const username = req.user?.username;

//     if (!username) {
//       return res.status(400).json({
//         success: false,
//         message: "Usuario faltante en el token",
//       });
//     }

//     const userInfo = await getUserInfo(username);
//     if (!userInfo.success || !userInfo.data) {
//       return res.status(404).json({
//         success: false,
//         message: "Usuario no encontrado",
//       });
//     }
//     const empresa = await getEmpresaByUserId(userInfo.data.cod_usuario);

//     const result = await deleteEmpresa(empresa.data.cod_empresa);
//     return res.status(result.success ? 200 : 400).json(result);
//   } catch (error: any) {
//     console.error("Error en /delete-empresa:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Error al eliminar la empresa",
//     });
//   }
// });

export default router;
