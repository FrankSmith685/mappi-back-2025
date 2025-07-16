import { Router, Request, Response } from 'express';
import { userType } from '../controllers/userController';


const router = Router();

router.get('/user-type', async (req: Request, res: Response) => {
  try {
    const tipoUsuario = await userType();
    res.status(200).json(tipoUsuario);
  } catch (error: any) {
    return res.status(404).send(error.message);
  }
});

export default router;