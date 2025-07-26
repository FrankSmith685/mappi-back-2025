import { Router, Request, Response } from 'express';
import {  getTipoNotificaciones, getUsuarioTipoNotificacionesPorCorreo, updateUsuarioTipoNotificaciones } from '../controllers/notificacionController';
import { authenticate } from '../config/middleware/authenticate';

const router = Router();

router.get('/tipo-notificaciones', async (req: Request, res: Response) => {
  try {
    const result = await getTipoNotificaciones();
    res.status(200).json(result);
  } catch (error: any) {
    const parsedError = JSON.parse(error.message);
    res.status(500).json(parsedError);
  }
});

router.get('/obtener-notificaciones', authenticate, async (req: Request, res: Response) => {
  try {
    const correo = req.user?.username;

    if (!correo) {
      return res.status(400).json({ success: false, message: 'Correo no encontrado en el token' });
    }

    const result = await getUsuarioTipoNotificacionesPorCorreo(correo);
    res.status(200).json(result);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message ?? 'Error inesperado',
      data: []
    });
  }
});

router.patch('/actualizar-estado-notificacion/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    if (typeof activo !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'El valor de "activo" debe ser booleano.'
      });
    }

    const result = await updateUsuarioTipoNotificaciones([
        { cod_usua_tip_notificacion: Number(id), activo }
    ]);
    res.status(result.success ? 200 : 404).json(result);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message ?? 'Error inesperado',
      data: []
    });
  }
});

export default router;
