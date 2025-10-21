import { Sequelize } from 'sequelize';

export const defineRelations = (sequelize: Sequelize) => {
  const {
    Usuarios,
    Roles,
    Usuarios_Roles,
    Usuarios_Login,
    Ubigeos,
    Direcciones,
    Archivos,
    Usuario_TipoNotificaciones,
    TipoNotificaciones,
    Empresas,
    Servicios,
    Categorias,
    Subcategorias,
    Avisos,
    TipoPlanes,
    Planes,
    PlanesBeneficios,
    PlanesUsuarios,
    Cursos,
    ModulosCurso,
    Usuarios_Modulos,
    Usuarios_Cursos
  } = sequelize.models;
    //Relaciones - Usuarios - Roles
    Usuarios.belongsToMany(Roles, {
    through: Usuarios_Roles,
    foreignKey: 'USUA_Interno',
    otherKey: 'USRO_Rol',
    as: 'Roles',
    });

    Roles.belongsToMany(Usuarios, {
    through: Usuarios_Roles,
    foreignKey: 'USRO_Rol', 
    otherKey: 'USUA_Interno',
    as: 'Usuarios',
    });

    // Relaciones Ubigeo - Direcciones
    Ubigeos.hasMany(Direcciones, {
      foreignKey: 'DIUS_CodigoUbigeo',
      as: "Direcciones",
    });

    Direcciones.belongsTo(Ubigeos, {
      foreignKey: 'DIUS_CodigoUbigeo',
      as: "Ubigeo",
    });

    // Relaciones Usuarios - Direcciones
    Usuarios.hasOne(Direcciones, {
      foreignKey: 'DIUS_Cod_Entidad',
      constraints: false,
      scope: {
        DIUS_Tipo_Entidad: 'usuario'
      },
      as: "Direcciones",
    });

    Direcciones.belongsTo(Usuarios, {
      foreignKey: 'DIUS_Cod_Entidad',
      constraints: false,
      scope: {
        DIUS_Tipo_Entidad: 'usuario'
      },
      as: "Usuario",
    });

    // Relaciones Usuarios - Archivos
    Usuarios.hasMany(Archivos, {
      foreignKey: 'ARCH_EntidadId',
      constraints: false,
      scope: {
        ARCH_Entidad: 'usuario',
      },
      as: 'Archivos', // alias para incluir archivos del usuario
    });

    Archivos.belongsTo(Usuarios, {
      foreignKey: 'ARCH_EntidadId',
      constraints: false,
      scope: {
        ARCH_Entidad: 'usuario',
      },
      as: 'Usuario',
    });

    Usuarios.hasMany(Usuarios_Login, { foreignKey: 'USUA_Interno' });
    Usuarios_Login.belongsTo(Usuarios, { foreignKey: 'USUA_Interno' });

    Usuarios.belongsToMany(TipoNotificaciones, {
      through: Usuario_TipoNotificaciones,
      foreignKey: 'USUA_Interno',
      otherKey: 'TINO_Id',
      as: 'TiposNotificacion',
    });

    TipoNotificaciones.belongsToMany(Usuarios, {
      through: Usuario_TipoNotificaciones,
      foreignKey: 'TINO_Id',
      otherKey: 'USUA_Interno',
      as: 'Usuarios',
    });

    Usuario_TipoNotificaciones.belongsTo(TipoNotificaciones, {
      foreignKey: "TINO_Id",
      as: "TipoNotificacion", // 👈 este alias es el que usas en el include
    });

    TipoNotificaciones.hasMany(Usuario_TipoNotificaciones, {
      foreignKey: "TINO_Id",
      as: "UsuarioTipoNotificaciones",
    });

    //Relaciones Empresas - Usuarios
    Usuarios.hasMany(Empresas, {
      foreignKey: "USUA_Interno",
      as: "Empresas",
    });

    Empresas.belongsTo(Usuarios, {
      foreignKey: "USUA_Interno",
      as: "Usuario",
    });
    //Relaciones Empresas - Direcciones
    Empresas.hasOne(Direcciones, {
      foreignKey: "DIUS_Cod_Entidad",
      constraints: false,
      scope: {
        DIUS_Tipo_Entidad: "empresa", // diferencia de usuario
      },
      as: "Direccion",
    });

    Direcciones.belongsTo(Empresas, {
      foreignKey: "DIUS_Cod_Entidad",
      constraints: false,
      scope: {
        DIUS_Tipo_Entidad: "empresa",
      },
      as: "Empresa",
    });

    //Relaciones Empresas - Archivos
    Empresas.hasMany(Archivos, {
      foreignKey: "ARCH_EntidadId",
      constraints: false,
      scope: {
        ARCH_Entidad: "empresa", // diferencia de usuario
      },
      as: "Archivos",
    });

    Archivos.belongsTo(Empresas, {
      foreignKey: "ARCH_EntidadId",
      constraints: false,
      scope: {
        ARCH_Entidad: "empresa",
      },
      as: "Empresa",
    });

    // RELACIONES PARA SERVICIOS

    // Servicios - Subcategorias
    Subcategorias.hasMany(Servicios, { foreignKey: "SUBC_Id", as: "Servicios" });
    Servicios.belongsTo(Subcategorias, { foreignKey: "SUBC_Id", as: "Subcategoria" });

    // Subcategorias - Categorias
    Categorias.hasMany(Subcategorias, { foreignKey: "CATE_Id", as: "Subcategorias" });
    Subcategorias.belongsTo(Categorias, { foreignKey: "CATE_Id", as: "Categoria" });

    // Servicios - Usuarios
    Usuarios.hasMany(Servicios, { foreignKey: "USUA_Interno", as: "Servicios" });
    Servicios.belongsTo(Usuarios, { foreignKey: "USUA_Interno", as: "Usuario" });

    // Servicios - Direcciones
    Servicios.hasOne(Direcciones, {
      foreignKey: "DIUS_Cod_Entidad",
      constraints: false,
      scope: { DIUS_Tipo_Entidad: "servicio" },
      as: "Direccion",
    });

    Direcciones.belongsTo(Servicios, {
      foreignKey: "DIUS_Cod_Entidad",
      constraints: false,
      scope: { DIUS_Tipo_Entidad: "servicio" },
      as: "Servicio",
    });

    // Servicios - Archivos
    Servicios.hasMany(Archivos, {
      foreignKey: "ARCH_EntidadId",
      constraints: false,
      scope: { ARCH_Entidad: "servicio" },
      as: "Archivos",
    });

    Archivos.belongsTo(Servicios, {
      foreignKey: "ARCH_EntidadId",
      constraints: false,
      scope: { ARCH_Entidad: "servicio" },
      as: "Servicio",
    });

    // Avisos - Servicios
    Servicios.hasOne(Avisos, {
      foreignKey: "SERV_Interno",
      as: "Aviso",
    });

    Avisos.belongsTo(Servicios, {
      foreignKey: "SERV_Interno",
      as: "Servicio",
    });

    Usuarios.hasMany(Avisos, { foreignKey: "USUA_Interno", as: "Avisos" });
    Avisos.belongsTo(Usuarios, { foreignKey: "USUA_Interno", as: "Usuarios" });


    // Aviso puede pertenecer a una Empresa
    Avisos.belongsTo(Empresas, { foreignKey: "EMPR_Interno", as: "Empresa" });
    Empresas.hasMany(Avisos, { foreignKey: "EMPR_Interno", as: "Avisos" });

    // Planes
    TipoPlanes.hasMany(Planes, {
      foreignKey: "TIPL_Id",
      as: "Planes",
    });

    Planes.belongsTo(TipoPlanes, {
      foreignKey: "TIPL_Id",
      as: "TipoPlan",
    });

    Planes.hasMany(PlanesBeneficios, {
      foreignKey: "PLAN_Id",
      as: "Beneficios",
    });

    PlanesBeneficios.belongsTo(Planes, {
      foreignKey: "PLAN_Id",
      as: "Plan",
    });

    // TipoPlanes → PlanesUsuarios
    TipoPlanes.hasMany(PlanesUsuarios, {
      foreignKey: "TIPL_Id",
      as: "PlanesUsuarios",
    });

    PlanesUsuarios.belongsTo(TipoPlanes, {
      foreignKey: "TIPL_Id",
      as: "TipoPlan",
    });

    // Planes → PlanesUsuarios
    Planes.hasMany(PlanesUsuarios, {
      foreignKey: "PLAN_Id",
      as: "UsuariosAsociados",
    });

    PlanesUsuarios.belongsTo(Planes, {
      foreignKey: "PLAN_Id",
      as: "Plan",
    });

    // Usuarios → PlanesUsuarios
    Usuarios.hasMany(PlanesUsuarios, {
      foreignKey: "USUA_Interno",
      as: "PlanesAsignados",
    });

    PlanesUsuarios.belongsTo(Usuarios, {
      foreignKey: "USUA_Interno",
      as: "Usuario",
    });

    // Curso > Modulo
     Cursos.hasMany(ModulosCurso, {
      foreignKey: "CURS_Id"
    });

    ModulosCurso.belongsTo(Cursos, {
      foreignKey: "CURS_Id"
    });

    Usuarios.belongsToMany(ModulosCurso, {
      through: Usuarios_Modulos,
      foreignKey: "USUA_Interno",
    });
    ModulosCurso.belongsToMany(Usuarios, {
      through: Usuarios_Modulos,
      foreignKey: "MODU_Id",
    });

    Usuarios.hasMany(Usuarios_Cursos, {
      foreignKey: "USUA_Interno",
    });

    Usuarios_Cursos.belongsTo(Usuarios, {
      foreignKey: "USUA_Interno",
    });

    Cursos.hasMany(Usuarios_Cursos, {
      foreignKey: "CURS_Id",
    });

    Usuarios_Cursos.belongsTo(Cursos, {
      foreignKey: "CURS_Id",
    });

  };

