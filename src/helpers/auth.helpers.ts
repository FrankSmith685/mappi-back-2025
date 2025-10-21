import { generateToken } from "../config/middleware/authenticate";

export const createAuthResponse = (correo: string) => {
  const { accessToken, refreshToken } = generateToken(correo, { correo });

  return {
    success: true,
    accessToken,
    refreshToken,
    message: 'Autenticación exitosa',
  };
};