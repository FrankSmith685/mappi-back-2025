import { Sequelize } from 'sequelize';

export const defineRelations = (sequelize: Sequelize) => {
  const {
    Usuarios,
    TipoUsuarios,
    TipoDocumentos, 
    UsuaDocumentos,
    Ubigeos,
    Multimedias,
    Notificaciones,
    TipoNotificaciones,
    Medios,
    UsuaTipNotificaciones,
    UsuaNotificaciones
  } = sequelize.models;

  // === RELACIONES DE USUARIOS ===
  Usuarios.belongsTo(TipoUsuarios, { foreignKey: 'cod_tipo_usuario',as: 'TipoUsuarios'});

  Usuarios.belongsToMany(TipoDocumentos, { through: UsuaDocumentos, foreignKey: 'cod_usuario' });
  TipoDocumentos.belongsToMany(Usuarios, { through: UsuaDocumentos, foreignKey: 'cod_tipo_documento' });
  UsuaDocumentos.belongsTo(Usuarios, { foreignKey: 'cod_usuario' });
  UsuaDocumentos.belongsTo(TipoDocumentos, { foreignKey: 'cod_tipo_documento' });

  Usuarios.belongsTo(Ubigeos, { foreignKey: 'cod_ubigeo' });

  Usuarios.hasMany(Multimedias, { foreignKey: 'cod_usuario' });
  Multimedias.belongsTo(Usuarios, { foreignKey: 'cod_usuario' });

  TipoNotificaciones.hasMany(Notificaciones, { foreignKey: 'cod_tipo_notificacion' });
  Notificaciones.belongsTo(TipoNotificaciones, { foreignKey: 'cod_tipo_notificacion' });

  Medios.hasMany(Notificaciones, { foreignKey: 'cod_medios' });
  Notificaciones.belongsTo(Medios, { foreignKey: 'cod_medios' });

  Usuarios.belongsToMany(TipoNotificaciones, {
    through: UsuaTipNotificaciones,
    foreignKey: 'cod_usuario',
    otherKey: 'cod_tipo_notificaciones',
  });

  TipoNotificaciones.belongsToMany(Usuarios, {
    through: UsuaTipNotificaciones,
    foreignKey: 'cod_tipo_notificaciones',
    otherKey: 'cod_usuario',
  });
  

  UsuaTipNotificaciones.belongsTo(Usuarios, {
    foreignKey: 'cod_usuario'
  });

  UsuaTipNotificaciones.belongsTo(TipoNotificaciones, {
    foreignKey: 'cod_tipo_notificaciones'
  });

  Usuarios.belongsToMany(Notificaciones, {
    through: UsuaNotificaciones,
    foreignKey: 'cod_usuario',
    otherKey: 'cod_notificacion',
  });

  Notificaciones.belongsToMany(Usuarios, {
    through: UsuaNotificaciones,
    foreignKey: 'cod_notificacion',
    otherKey: 'cod_usuario',
  });

  UsuaNotificaciones.belongsTo(Usuarios, {
    foreignKey: 'cod_usuario'
  });

  UsuaNotificaciones.belongsTo(Notificaciones, {
    foreignKey: 'cod_notificacion'
  });

  // === RELACIONES DE INMUEBLES ===
};
