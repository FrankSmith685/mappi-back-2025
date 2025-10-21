import { sequelize } from '../db';
import { Model, ModelStatic } from 'sequelize';
import { TipoNotificacionAttributes, TipoNotificacionCreationAttributes } from '../interfaces/ITipoNotificacion';

const TipoNotificaciones = sequelize.models.TipoNotificaciones as ModelStatic<Model<TipoNotificacionAttributes, TipoNotificacionCreationAttributes>>;

const tiposPredeterminados = [
  { 
    nombre: "Comentarios", 
    descripcion: "Recibe una alerta cuando alguien deje un comentario en uno de tus huariques. ¡No te pierdas la oportunidad de responder y mantener viva la conversación!" 
  },
  { 
    nombre: "Calificaciones", 
    descripcion: "Te avisaremos cada vez que un usuario califique tu huarique. Así podrás conocer en tiempo real qué opinan de tus espacios." 
  },
  { 
    nombre: "Respuestas", 
    descripcion: "Cuando alguien responda a una de tus opiniones o reseñas, recibirás una notificación para seguir participando en el debate." 
  },
  { 
    nombre: "Novedades de Cursos", 
    descripcion: "Mantente al día con nuevos cursos, actualizaciones y contenido exclusivo de los que sigues. ¡No te pierdas nada importante!" 
  },
  { 
    nombre: "Promociones Mappi", 
    descripcion: "Sé el primero en enterarte de eventos, descuentos especiales y noticias exclusivas de Mappi. ¡Sácale el máximo provecho a tu experiencia!" 
  },
];


export const getTipoNotificaciones = async (): Promise<void> => {
  try {
    const existentes = await TipoNotificaciones.findAll();

    if (existentes.length === 0) { 
      const data: TipoNotificacionCreationAttributes[] = tiposPredeterminados.map(t => ({
        TINO_Nombre: t.nombre,
        TINO_Descripcion: t.descripcion,
      }));

      await TipoNotificaciones.bulkCreate(data);
      console.log('Se agregaron los datos de tipo de notifiaciones');
    } else {
      console.log('Ya existen datos en la tabla tipo de notifiaciones');
    }
  } catch (error: any) {
    console.log('Error al guardar tipo de notifaciones: ' + error.message);
  }
};
