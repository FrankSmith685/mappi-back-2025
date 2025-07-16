import { Router, Request, Response } from 'express';
import { loginUser, refreshAccessToken, registerUser, verifyEmail } from '../controllers/authController';
import { createVerifierHandler } from '../helpers/verifierHandler';
import { createCredentialHandler, createRegisterHandler } from '../helpers/credentialsHandler';


const router = Router();

router.get('/verify-email', createVerifierHandler('email', verifyEmail));

router.post('/login', createCredentialHandler(loginUser));

router.post('/register', createRegisterHandler(registerUser));

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

export default router;
