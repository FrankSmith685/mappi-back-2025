import { Router, Request, Response } from 'express';
import { changeEmail, changePassword, deleteUserAccount, getUserInfo, updateUser, userType } from '../controllers/userController';
import { authenticate } from '../config/middleware/authenticate';


const router = Router();

router.get('/user-type', async (req: Request, res: Response) => {
  try {
    const tipoUsuario = await userType();
    res.status(200).json(tipoUsuario);
  } catch (error: any) {
    return res.status(404).send(error.message);
  }
});

router.get('/user-info', authenticate, async (req: Request, res: Response) => {
  try {
    console.log(req.user);
    const username = req.user?.username;

    if (!username) {
      return res.status(400).json({ success: false, message: 'Usuario no encontrado en el token' });
    }

    const userInfo = await getUserInfo(username);
    res.status(200).json(userInfo);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: error.success ?? false,
      message: error.message ?? 'Error inesperado',
      data: null
    });
  }
});

router.put('/update-user', authenticate, async (req: Request, res: Response) => {
  try {
    const usernameFromToken = req.user?.username;
    if (!usernameFromToken) {
      return res.status(401).json({
        success: false,
        message: 'Token no válido o usuario no autenticado',
      });
    }
    const userInfo = await getUserInfo(usernameFromToken);
    if (!userInfo.success) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado con el token',
      });
    }
    if (userInfo.data.cod_usuario !== req.body.cod_usuario) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para actualizar este usuario',
      });
    }
    const result = await updateUser(req.body);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al actualizar el usuario',
    });
  }
});

router.put('/change-password', authenticate, async (req: Request, res: Response) => {
  try {
    const username = req.user?.username;

    if (!username) {
      return res.status(401).json({ success: false, message: 'Token no válido o usuario no autenticado' });
    }

    const userInfo = await getUserInfo(username);
    if (!userInfo.success || !userInfo.data) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'La contraseña actual y la nueva son requeridas' });
    }

    const result = await changePassword(userInfo.data.cod_usuario, currentPassword, newPassword);
    return res.status(result.success ? 200 : 400).json(result);

  } catch (error: any) {
    console.error('Error en el endpoint /change-password:', error);
    return res.status(500).json({ success: false, message: 'Error al cambiar la contraseña' });
  }
});

router.put('/change-email', authenticate, async (req: Request, res: Response) => {
  try {
    const username = req.user?.username;

    if (!username) {
      return res.status(401).json({ success: false, message: 'Token no válido o usuario no autenticado' });
    }

    const userInfo = await getUserInfo(username);

    if (!userInfo.success || !userInfo.data) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const { currentEmail, newEmail } = req.body;

    if (!currentEmail || !newEmail) {
      return res.status(400).json({ success: false, message: 'El correo actual y el nuevo correo son requeridos' });
    }

    const result = await changeEmail(userInfo.data.cod_usuario, currentEmail, newEmail);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    console.error('Error en el endpoint /change-email:', error);
    return res.status(500).json({ success: false, message: 'Error al cambiar el correo' });
  }
});

router.delete('/delete-account', authenticate, async (req: Request, res: Response) => {
  try {
    const username = req.user?.username;
    const { password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Usuario o contraseña faltante',
      });
    }

    const userInfo = await getUserInfo(username);
    if (!userInfo.success || !userInfo.data) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    const result = await deleteUserAccount(userInfo.data.cod_usuario, password);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    console.error('Error al eliminar cuenta:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error interno al eliminar la cuenta',
    });
  }
});

export default router;