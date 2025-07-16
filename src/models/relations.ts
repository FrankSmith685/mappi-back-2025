import { Sequelize } from 'sequelize';

export const defineRelations = (sequelize: Sequelize) => {
  const {
    Usuarios,
    TipoUsuarios,
    TipoDocumentos, 
    UsuarioDocumentos,
    Ubigeos,
    Multimedias,
    Notificaciones,
    TipoNotificaciones,
    Medios
  } = sequelize.models;

  // === RELACIONES DE USUARIOS ===
  Usuarios.belongsTo(TipoUsuarios, { foreignKey: 'cod_tipo_usuario' });

  Usuarios.belongsToMany(TipoDocumentos, { through: UsuarioDocumentos, foreignKey: 'cod_usuario' });
  TipoDocumentos.belongsToMany(Usuarios, { through: UsuarioDocumentos, foreignKey: 'cod_tipo_documento' });
  UsuarioDocumentos.belongsTo(Usuarios, { foreignKey: 'cod_usuario' });
  UsuarioDocumentos.belongsTo(TipoDocumentos, { foreignKey: 'cod_tipo_documento' });

  Usuarios.belongsTo(Ubigeos, { foreignKey: 'cod_ubigeo' });

  Usuarios.hasMany(Multimedias, { foreignKey: 'cod_usuario' });
  Multimedias.belongsTo(Usuarios, { foreignKey: 'cod_usuario' });

  Usuarios.hasMany(Notificaciones, { foreignKey: 'cod_usuario' });
  Notificaciones.belongsTo(Usuarios, { foreignKey: 'cod_usuario' });

  TipoNotificaciones.hasMany(Notificaciones, { foreignKey: 'cod_tipo_notificacion' });
  Notificaciones.belongsTo(TipoNotificaciones, { foreignKey: 'cod_tipo_notificacion' });

  // Medios / 1 => Notificaciones M 
  Medios.hasMany(Notificaciones, { foreignKey: 'cod_medios' });
  Notificaciones.belongsTo(Medios, { foreignKey: 'cod_medios' });

  // === RELACIONES DE INMUEBLES ===
};
