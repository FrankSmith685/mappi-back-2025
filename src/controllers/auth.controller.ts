import { ILoginInput } from "../interfaces/auth";
import { loginUserService, registerUserService } from "../services/auth.service";
import { IRegisterInput } from "../interfaces/auth";

export const loginUserController = async (input: ILoginInput) => {
  const { correo, proveedor, contraseña } = input;
  if (!correo || (proveedor === "correo" && !contraseña)) {
    throw new Error("Correo y contraseña son requeridos.");
  }

  const result = await loginUserService(correo, proveedor, contraseña);
  return result;
};

export const registerUserController = async (input: IRegisterInput) => {
  const { nombre, apellido, correo, telefono, dni, contrasena, proveedor } = input;

  if (!correo) {
    throw new Error("El correo es obligatorio.");
  }

  if (proveedor === "correo" && !contrasena) {
    throw new Error("La contraseña es obligatoria para registro con correo.");
  }

  const result = await registerUserService({
    nombre,
    apellido,
    correo,
    telefono,
    dni,
    contrasena,
    proveedor,
  });

  return result;
};