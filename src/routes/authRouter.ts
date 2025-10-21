import { Router, Request, Response } from 'express';
import { loginUser, refreshAccessToken, registerUser, resetPassword, sendResetPasswordEmail, validateResetToken } from '../controllers/authController';
import { createVerifierHandler } from '../helpers/verifierHandler';
import { createCredentialHandler, createRegisterHandler } from '../helpers/credentialsHandler';
import { loginUserController, registerUserController } from '../controllers/auth.controller';



const router = Router();

//Ruta de iniciar sesión
router.post("/login", async (req: Request, res: Response) => {
  try {
    const result = await loginUserController(req.body);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Error al iniciar sesión.",
    });
  }
});

// Ruta de registro
router.post("/register", async (req: Request, res: Response) => {
  try {
    const result = await registerUserController(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post("/refresh-token",async(req: Request, res: Response)=>{
    try{
        const { refreshToken } = req.body;
        return res.status(200).json(await refreshAccessToken(refreshToken)
    );
    }catch(error){
      return res.status(400).json({
          success: false,
          message: 'Ocurrió un error al refrescar el token.',
        });
    }
});

router.post('/send-reset-email', async (req: Request, res: Response) => {
  const { correo } = req.body;

  if (!correo) {
    return res.status(400).json({
      success: false,
      message: 'El campo "correo" es obligatorio.',
    });
  }

  try {
    const response = await sendResetPasswordEmail(correo);
    return res.status(200).json(response);
  } catch (error: any) {
    console.error('Error detallado al enviar el correo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al enviar el correo de recuperación.',
      error: error.message || error,
    });
  }
});

router.post('/validate-reset-token', async (req: Request, res: Response) => {
  const { token } = req.body;
  const result = await validateResetToken(token);
  return res.status(result.success ? 200 : 401).json(result);
});

router.post('/reset-password', async (req: Request, res: Response) => {
   const { token, nuevaContraseña } = req.body;

    if (!token || !nuevaContraseña) {
      return res.status(400).json({ success: false, message: "Token y contraseña son requeridos" });
    }

    const result = await resetPassword(token, nuevaContraseña);
    return res.status(result.success ? 200 : 400).json(result);
});

export default router;
