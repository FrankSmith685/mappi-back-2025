import { Model } from 'sequelize';
import { sequelize } from '../db';
import { UsuarioAttributes, UsuarioResponse } from '../interfaces/IUsuario';
import bcrypt from 'bcrypt';
import { DireccionAttributes } from '../interfaces/IDirecciones';

const {
  Usuarios,
  Usuarios_Login,
  Roles,
  Archivos,
  Empresas,
  Servicios,
  Direcciones,
  Ubigeos,
  PlanesUsuarios,
  Avisos
} = sequelize.models;


export const getUserById = async (userId: string): Promise<UsuarioResponse> => {
  const user = await Usuarios.findOne({
    where: { USUA_Interno: userId },
    include: [
      {
        model: Roles,
        as: "Roles",
        through: { attributes: [] },
      },
      {
        model: Archivos,
        as: "Archivos",
        attributes: ["ARCH_ID", "ARCH_Tipo", "ARCH_Ruta", "ARCH_NombreOriginal"],
      },
      {
        model: Usuarios_Login,
        as: "Usuarios_Logins",
        attributes: ["USL_Proveedor", "USL_FechaVinculacion"],
      },
      {
        model: Empresas,
        as: "Empresas",
        attributes: ["EMPR_Interno"],
      },
      {
        model: Servicios,
        as: "Servicios",
        attributes: ["SERV_Interno", "SERV_Estado", "SERV_Archivado"],
        include: [
          {
            model: Avisos,
            as: "Aviso", // el alias debe coincidir con la relación en tu modelo
            attributes: ["AVIS_Id"],
            required: false,
          },
        ],
      },
      {
        model: Direcciones,
        as: "Direcciones",
        attributes: [
          "DIUS_Direccion",
          "DIUS_Referencia",
          "DIUS_Latitud",
          "DIUS_Longitud",
          "DIUS_CodigoUbigeo",
        ],
        include: [
          {
            model: Ubigeos,
            as: "Ubigeo",
            attributes: ["UBIG_Departamento", "UBIG_Provincia", "UBIG_Distrito"],
          },
        ],
      },
      {
        model: PlanesUsuarios,
        as: "PlanesAsignados",
        attributes: ["PLUS_Id", "PLUS_EstadoPlan", "PLUS_FechaInicio", "PLUS_FechaExpiracion"],
        include: [
          {
            model: sequelize.models.Planes,
            as: "Plan",
            attributes: [
              "PLAN_Id",
              "TIPL_Id",
              "PLAN_TipoUsuario",
              "PLAN_Precio",
              "PLAN_DuracionMeses",
              "PLAN_Moneda",
              "PLAN_Estado",
            ],
            include: [
              {
                model: sequelize.models.TipoPlanes,
                as: "TipoPlan",
                attributes: ["TIPL_Nombre"],
              },
            ],
          },
        ],
      },
    ],
  });

  if (!user) throw new Error("Usuario no encontrado");

  const userPlain = user.get({ plain: true });

  const perfilArchivo = userPlain.Archivos?.find(
    (archivo: any) => archivo.ARCH_Tipo === "perfil"
  );

  const direccion = userPlain.Direcciones || null;

  // Plan activo
  const planActivoData = userPlain.PlanesAsignados?.find(
    (plan: any) => plan.PLUS_EstadoPlan === "activo"
  );

  const tienePlan = planActivoData?.Plan?.PLAN_TipoUsuario ?? null;

  const planActivo = planActivoData
    ? {
        id: planActivoData.PLUS_Id,
        fechaInicio: planActivoData.PLUS_FechaInicio,
        fechaFin: planActivoData.PLUS_FechaExpiracion,
        estado: planActivoData.PLUS_EstadoPlan,
        ...planActivoData.Plan,
      }
    : null;

  //  Calcular tipo de plan y tipo de usuario
  const tipoPlan = planActivoData?.Plan?.TipoPlan?.TIPL_Nombre?.toLowerCase() || "";
  const tipoUsuario = planActivoData?.Plan?.PLAN_TipoUsuario?.toLowerCase() || "";
  const esEmpresa = userPlain.Empresas && userPlain.Empresas.length > 0;

  // Calcular límites dinámicos
  let limiteServicios = 0;
  let limitePromocional = 0;
  let tieneVideoPromocional = false;

  if (tipoPlan.includes("básico") || tipoPlan.includes("basico")) {
    limiteServicios = esEmpresa ? 2 : 1;
    limitePromocional = 1;
  } else if (tipoPlan.includes("clásico") || tipoPlan.includes("clasico")) {
    limiteServicios = esEmpresa ? 3 : 2;
    limitePromocional = esEmpresa ? 3 : 2;

    // Video Promocional para empresa con plan clásico
    if (esEmpresa) tieneVideoPromocional = true;
  } else if (tipoPlan.includes("chévere") || tipoPlan.includes("chevere")) {
    limiteServicios = esEmpresa ? 5 : 3;
    limitePromocional = esEmpresa ? 5 : 3;

    // Video Promocional para independiente y empresa con plan chévere
    tieneVideoPromocional = true;
  }

  // Calcular cantidad de servicios activos
  const serviciosActivos = userPlain.Servicios
    ? userPlain.Servicios.filter(
        (serv: any) => serv.SERV_Estado === true && serv.SERV_Archivado === false
      ).length
    : 0;
  
 const tieneAviso =
  userPlain.Servicios?.some((serv: any) => serv.Aviso) || false;

  console.log(userPlain.Servicios)


  return {
    cod_usuario: userPlain.USUA_Interno,
    nombre: userPlain.USUA_Nombre,
    apellido: userPlain.USUA_Apellido,
    correo: userPlain.USUA_Correo,
    telefono: userPlain.USUA_Telefono,
    dni: userPlain.USUA_Dni,
    fotoPerfil: perfilArchivo?.ARCH_Ruta || null,
    estado: userPlain.USUA_Estado,
    fechaRegistro: userPlain.USUA_FechaRegistro,
    ultimaSesion: userPlain.USUA_UltimaSesion,
    tipo_usuario:
      userPlain.Roles?.map((rol: any) => ({
        cod_tipo_usuario: rol.ROLE_Interno,
        descripcion: rol.ROLE_Nombre,
      })) || [],
    metodosLogin:
      userPlain.Usuarios_Logins?.map((login: any) => login.USL_Proveedor) || [],
    tieneEmpresa: esEmpresa,
    tieneServicio:
      userPlain.Servicios &&
      userPlain.Servicios.some((serv: any) => serv.SERV_Estado === true),
    serviciosActivos,
    idUbigeo: direccion?.DIUS_CodigoUbigeo,
    tienePlan,
    planActivo,
    limiteServicios,
    limitePromocional,
    tieneVideoPromocional, //  Nuevo campo agregado
    tieneAviso,
  };
};





  // Obtener información del usuario autenticado
  export const getUserInfo = async (
    username: string
  ): Promise<{ success: boolean; message: string; data: UsuarioResponse }> => {
    try {
      const user = await Usuarios.findOne({
        where: { USUA_Correo: username },
      });

      if (!user) throw new Error("Usuario no encontrado");

      const userPlain = user.get({ plain: true }) as UsuarioAttributes;
      const data = await getUserById(userPlain.USUA_Interno);


      return {
        success: true,
        message: "Usuario autenticado correctamente",
        data,
      };
    } catch (error: any) {
      throw {
        success: false,
        message: error.message,
        data: null,
      };
    }
  };

  // Actualizar información del usuario
  export const updateUser = async (
    data: Partial<UsuarioAttributes> & { USUA_Interno: string } & Partial<DireccionAttributes>
  ): Promise<{ success: boolean; message: string; data?: any }> => {
    const transaction = await sequelize.transaction();

    try {
      const { USUA_Interno, ...fields } = data;

      const user = await Usuarios.findByPk(USUA_Interno, { transaction });
      if (!user) throw new Error("Usuario no encontrado");

      const {
        USUA_Nombre,
        USUA_Apellido,
        USUA_Telefono,
        USUA_Dni,
        USUA_Direccion,
        USUA_IdUbigeo,
        USUA_Latitud,
        USUA_Longitud,
        ...rest
      } = fields as any;

      await user.update(
        {
          USUA_Nombre,
          USUA_Apellido,
          USUA_Telefono,
          USUA_Dni,
          ...rest,
        },
        { transaction }
      );

      if (USUA_Direccion || USUA_IdUbigeo || USUA_Latitud || USUA_Longitud) {
        const direccion = await Direcciones.findOne({
          where: { DIUS_Cod_Entidad: USUA_Interno, DIUS_Tipo_Entidad: "usuario" },
          transaction,
        });

        if (direccion) {
          // update
          await direccion.update(
            {
              DIUS_Direccion: USUA_Direccion,
              DIUS_CodigoUbigeo: USUA_IdUbigeo,
              DIUS_Latitud: USUA_Latitud,
              DIUS_Longitud: USUA_Longitud,
            },
            { transaction }
          );
        } else {
          // create
          await Direcciones.create(
            {
              DIUS_Direccion: USUA_Direccion,
              DIUS_CodigoUbigeo: USUA_IdUbigeo,
              DIUS_Latitud: USUA_Latitud,
              DIUS_Longitud: USUA_Longitud,
              DIUS_Tipo: "principal",
              DIUS_Tipo_Entidad: "usuario",
              DIUS_Cod_Entidad: USUA_Interno,
            },
            { transaction }
          );
        }
      }

      await transaction.commit();

       const dataUser = await getUserById(USUA_Interno);

      return {
        success: true,
        message: "Usuario actualizado correctamente",
        data: dataUser,
      };
    } catch (error: any) {
      await transaction.rollback();
      return {
        success: false,
        message: error.message,
      };
    }
  };

  // Cambiar contraseña
  export const changePassword = async (
    cod_usuario: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      // buscar login asociado al usuario SOLO con proveedor = "correo"
      const login = await Usuarios_Login.findOne({
        where: { USUA_Interno: cod_usuario, USL_Proveedor: "correo" },
      });

      if (!login) {
        return { success: false, message: "El usuario no tiene login por correo" };
      }

      const currentHashed = login.get("USL_Clave") as string | null;

      if (!currentHashed) {
        return { success: false, message: "No existe contraseña almacenada" };
      }

      const isPasswordCorrect = await bcrypt.compare(currentPassword, currentHashed);

      if (!isPasswordCorrect) {
        return { success: false, message: "La contraseña actual es incorrecta" };
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await login.update({ USL_Clave: hashedPassword });

      return { success: true, message: "Contraseña actualizada correctamente" };
    } catch (error: any) {
      console.error("Error cambiando la contraseña:", error);
      return {
        success: false,
        message: "Ocurrió un error al cambiar la contraseña",
      };
    }
  };

  // Cambiar el correo del usuario
 export const changeEmail = async (
    cod_usuario: string,
    currentEmail: string,
    newEmail: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const user = await Usuarios.findByPk(cod_usuario);

      if (!user) {
        return { success: false, message: "Usuario no encontrado" };
      }

      // Validar que el correo actual ingresado coincida con el registrado
      if (user.get("USUA_Correo") !== currentEmail) {
        return { success: false, message: "El correo actual no coincide con el registrado" };
      }

      // Verificar si el nuevo correo ya está en uso por otro usuario
      const existingUser = await Usuarios.findOne({
        where: { USUA_Correo: newEmail },
      });

      if (existingUser) {
        return { success: false, message: "El nuevo correo ya está en uso" };
      }

      // Actualizar el correo en Usuarios
      await user.update({ USUA_Correo: newEmail });

      await Usuarios_Login.update(
        { USL_Email_Proveedor: newEmail },
        {
          where: {
            USUA_Interno: cod_usuario,
            USL_Proveedor: "correo"
          }
        }
      );

      return {
        success: true,
        message: "Correo actualizado correctamente",
      };
    } catch (error: any) {
      console.error("Error cambiando el correo:", error);
      return {
        success: false,
        message: "Ocurrió un error al cambiar el correo",
      };
    }
  };

 // Vincular una cuenta externa (Google, Facebook, etc.)
  export const linkAccount = async (
  cod_usuario: string,
  proveedor: 'correo' | 'google' | 'facebook',
  emailProveedor: string,
  clave?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // 1. Verificar si ya existe vinculación con ese proveedor para este usuario
    const existing = await Usuarios_Login.findOne({
      where: { USUA_Interno: cod_usuario, USL_Proveedor: proveedor },
    });

    if (existing) {
      return {
        success: false,
        message: `La cuenta con ${proveedor} ya está vinculada`,
      };
    }

    // 2. Verificar si ese correo ya está vinculado con otro usuario
    const emailInUse = await Usuarios_Login.findOne({
      where: { USL_Email_Proveedor: emailProveedor, USL_Proveedor: proveedor },
    });

    if (emailInUse && emailInUse.get("USUA_Interno") !== cod_usuario) {
      return {
        success: false,
        message: `El correo ${emailProveedor} ya está vinculado a otra cuenta`,
      };
    }


    // 3. Hashear clave o uid si existe
    let claveFinal = null;
    if (clave) {
      const salt = await bcrypt.genSalt(10);
      claveFinal = await bcrypt.hash(clave, salt);
    }

    // 4. Insertar nueva vinculación
    await Usuarios_Login.create({
      USUA_Interno: cod_usuario,
      USL_Proveedor: proveedor,
      USL_Email_Proveedor: emailProveedor,
      USL_Clave: claveFinal,
      USL_FechaVinculacion: new Date(),
    });

    return {
      success: true,
      message: `Cuenta de ${proveedor} vinculada correctamente`,
    };
  } catch (error: any) {
    console.error("Error vinculando cuenta:", error);
    return {
      success: false,
      message: "Ocurrió un error al vincular la cuenta",
    };
  }
  };

  // Desvincular una cuenta
  export const unlinkAccount = async (
    cod_usuario: string,
    proveedor: 'correo' | 'google' | 'facebook'
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const login = await Usuarios_Login.findOne({
        where: { USUA_Interno: cod_usuario, USL_Proveedor: proveedor },
      });

      if (!login) {
        return {
          success: false,
          message: `El usuario no tiene vinculada la cuenta de ${proveedor}`,
        };
      }

      // Validar que el usuario no se quede sin métodos de acceso
      const allLogins = await Usuarios_Login.count({
        where: { USUA_Interno: cod_usuario },
      });

      if (allLogins <= 1) {
        return {
          success: false,
          message: "No puedes desvincular esta cuenta porque es el único método de acceso",
        };
      }

      await login.destroy();

      return {
        success: true,
        message: `Cuenta de ${proveedor} desvinculada correctamente`,
      };
    } catch (error: any) {
      console.error("Error desvinculando cuenta:", error);
      return { success: false, message: "Ocurrió un error al desvincular la cuenta" };
    }
  };

  // Eliminar la cuenta del usuario
  export const deleteUserAccount = async (
    cod_usuario: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    const transaction = await sequelize.transaction();

    try {
      const user = await Usuarios.findByPk(cod_usuario, { transaction });

      if (!user) {
        await transaction.rollback();
        return { success: false, message: "Usuario no encontrado" };
      }

      // Buscar login asociado al usuario SOLO con proveedor = "correo"
      const login = await Usuarios_Login.findOne({
        where: { USUA_Interno: cod_usuario, USL_Proveedor: "correo" },
        transaction,
      });

      if (!login) {
        await transaction.rollback();
        return { success: false, message: "El usuario no tiene login por correo" };
      }

      // Verificar contraseña
      const hashedPassword = login.get("USL_Clave") as string | null;
      if (!hashedPassword) {
        await transaction.rollback();
        return { success: false, message: "El usuario no tiene contraseña registrada" };
      }

      const isPasswordCorrect = await bcrypt.compare(password, hashedPassword);
      if (!isPasswordCorrect) {
        await transaction.rollback();
        return { success: false, message: "Contraseña incorrecta" };
      }

      // Eliminar registros relacionados
      await Usuarios_Login.destroy({ where: { USUA_Interno: cod_usuario }, transaction });

      // Eliminar archivos relacionados al usuario
      await Archivos.destroy({
        where: { ARCH_Entidad: "usuario", ARCH_EntidadId: cod_usuario },
        transaction,
      });

      // Eliminar relación con Roles (si existe tabla pivote de muchos a muchos)
      if ((user as any).removeRoles) {
        await (user as any).setRoles([], { transaction }); // limpia la asociación
      }

      // Finalmente eliminar el usuario
      await Usuarios.destroy({ where: { USUA_Interno: cod_usuario }, transaction });

      await transaction.commit();

      return {
        success: true,
        message: "Cuenta eliminada exitosamente",
      };
    } catch (error: any) {
      console.error("Error al eliminar la cuenta:", error);
      await transaction.rollback();
      return {
        success: false,
        message: "Ocurrió un error al eliminar la cuenta",
      };
    }
  };

  // Eliminar cuenta del usuario de google
  export const deleteUserAccountGoogle = async (
    cod_usuario: string,
    idToken: string
  ): Promise<{ success: boolean; message: string }> => {
    const transaction = await sequelize.transaction();

    try {
      const user = await Usuarios.findByPk(cod_usuario, { transaction });
      if (!user) {
        await transaction.rollback();
        return { success: false, message: "Usuario no encontrado" };
      }

      // Buscar login asociado al usuario SOLO con proveedor = "google"
      const login = await Usuarios_Login.findOne({
        where: { USUA_Interno: cod_usuario, USL_Proveedor: "google" },
        transaction,
      });

      if (!login) {
        await transaction.rollback();
        return { success: false, message: "El usuario no tiene login por google" };
      }

      // Verificar contraseña
      const hashedPassword = login.get("USL_Clave") as string | null;
      if (!hashedPassword) {
        await transaction.rollback();
        return { success: false, message: "El idToken no esta registrada" };
      }

      if (idToken !== hashedPassword) {
        await transaction.rollback();
        return { success: false, message: "ID Token incorrecta" };
      }

      // Eliminar registros relacionados
      await Usuarios_Login.destroy({ where: { USUA_Interno: cod_usuario }, transaction });

      //  Eliminar archivos relacionados al usuario
      await Archivos.destroy({
        where: { ARCH_Entidad: "usuario", ARCH_EntidadId: cod_usuario },
        transaction,
      });

      // Eliminar relación con Roles (si existe tabla pivote de muchos a muchos)
      if ((user as any).removeRoles) {
        await (user as any).setRoles([], { transaction }); // limpia la asociación
      }

      // Finalmente eliminar el usuario
      await Usuarios.destroy({ where: { USUA_Interno: cod_usuario }, transaction });

      await transaction.commit();

      return {
        success: true,
        message: "Cuenta eliminada exitosamente",
      };
    } catch (error: any) {
      console.error("Error al eliminar la cuenta con Google:", error);
      await transaction.rollback();
      return {
        success: false,
        message: "Ocurrió un error al eliminar la cuenta con Google",
      };
    }
  };