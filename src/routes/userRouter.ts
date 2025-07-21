import { Router, Request, Response } from 'express';
import { getUserInfo, userType } from '../controllers/userController';
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

export default router;