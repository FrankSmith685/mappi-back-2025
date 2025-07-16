import { sequelize } from '../db';
import { Model, ModelStatic } from 'sequelize';
import { TipoNotificacionesAttributes, TipoNotificacionesCreationAttributes } from '../interfaces/TipoNotificaciones';

const TipoNotificaciones = sequelize.models.TipoNotificaciones as ModelStatic<Model<TipoNotificacionesAttributes, TipoNotificacionesCreationAttributes>>;



const tipoNotificaciones = [
    {
        title:"NewSletter",
        description:"Recibe nuestras últimas noticias y actualizaciones."
    },
    {
        title:"Envío Anunciante",
        description:"Recibe información de nuestros anunciantes."
    },
    {
        title:"Recomendaciones de Avisos",
        description:"Recibe recomendaciones personalizadas de avisos."
    },
    {
        title:"Panoramix: Consejos para mejorar tus avisos",
        description:"Recibe consejos personalizados para mejorar tus avisos."
    },
    {
        title:"Recomendaciones de Proyectos",
        description:"Recibe recomendaciones personalizadas de proyectos."
    }
];

export const getTipoNotificaciones = async (): Promise<void> => {
  try {
    const tipo_documento = await TipoNotificaciones.findAll();

    if (tipo_documento.length === 0) {
      const dataNotificaciones: TipoNotificacionesCreationAttributes[] = tipoNotificaciones.map((el) => ({
        nombre:el.title,
        description:el.description,
      }));

      await TipoNotificaciones.bulkCreate(dataNotificaciones);
      console.log("Se agregaron los datos de tipo de notificaciones a la tabla.");
    } else {
      console.log("Ya existen datos en la tabla de tipo de notificaciones.");
    }
  } catch (err: any) {
    console.log("Error: " + err.message);
  }
};
