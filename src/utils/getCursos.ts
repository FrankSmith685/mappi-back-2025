import { sequelize } from "../db";
import { Model, ModelStatic } from "sequelize";
import {
  CursoAttributes,
  CursoCreationAttributes,
} from "../interfaces/ICursos";
import {
  ModuloCursoAttributes,
  ModuloCursoCreationAttributes,
} from "../interfaces/IModuloCurso";

const Cursos = sequelize.models.Cursos as ModelStatic<
  Model<CursoAttributes, CursoCreationAttributes>
>;

const ModulosCurso = sequelize.models.ModulosCurso as ModelStatic<
  Model<ModuloCursoAttributes, ModuloCursoCreationAttributes>
>;

export const getCursos = async (): Promise<void> => {
  try {
    const existentes = await Cursos.findAll();

    if (existentes.length === 0) {
      // === Datos base (audio + video) ===
      const cursos = [
        // audio
        {
          CURS_Titulo: "Curso General de Atención al Cliente",
          CURS_Descripcion:
            "Aprende cómo brindar una atención al cliente de calidad en entornos gastronómicos.",
          CURS_Tipo: "audio",
          CURS_Autor: "Juan Rodriguez",
          CURS_Avatar:
            "https://mappidevbucket.s3.us-east-1.amazonaws.com/mapp_312",
          CURS_Estado: true,
          capitulos: [
            {
              titulo: "Introducción",
              descripcion: "",
              url: "https://mappidevbucket.s3.us-east-1.amazonaws.com/1.introduccion.wav",
            },
            {
              titulo: "Servicio de excelencia",
              descripcion: "",
              url: "https://mappidevbucket.s3.us-east-1.amazonaws.com/2.servicio_de_excelencia.wav",
            },
            {
              titulo: "Escucha Activa",
              descripcion: "",
              url: "https://mappidevbucket.s3.us-east-1.amazonaws.com/3.escucha_activa.wav",
            },
            {
                titulo: "Escucha Activa",
                descripcion: "",
                url: "https://mappidevbucket.s3.us-east-1.amazonaws.com/3.escucha_activa.wav",
            },
            {
                titulo: "Modulación de la voz",
                descripcion: "",
                url: "https://mappidevbucket.s3.us-east-1.amazonaws.com/4.modulacion_de_la_voz.wav",
            },
            {
                titulo: "Comunicación Verbal",
                descripcion: "",
                url: "https://mappidevbucket.s3.us-east-1.amazonaws.com/5.comunicacion_verbal.wav",
            },
            {
                titulo: "Acercamiento con el Cliente",
                descripcion: "",
                url: "https://mappidevbucket.s3.us-east-1.amazonaws.com/6.acercamiento_con_el_cliente.wav",
            },
            {
                titulo: "Identificación de Necesidades",
                descripcion: "",
                url: "https://mappidevbucket.s3.us-east-1.amazonaws.com/7.identificacion_de_necesidades.wav",
            },
            {
                titulo: "Protocolo de atención de quejas",
                descripcion: "",
                url: "https://mappidevbucket.s3.us-east-1.amazonaws.com/8.protocolo_de_atencion_de_quejas.wav",
            },
            {
                titulo: "Evaluación del desempeño",
                descripcion: "",
                url: "https://mappidevbucket.s3.us-east-1.amazonaws.com/9.evaluacion_del_desempenio.wav",
            },
          ],
        },
        {
            CURS_Tipo: "audio",
            CURS_Titulo: "Curso de Primeros Auxilios",
            CURS_Autor: "Jheremy Perez",
            CURS_Avatar: "https://mappidevbucket.s3.us-east-1.amazonaws.com/mapp_311",
            CURS_Descripcion:
            "La capacitación en primeros auxilios es crucial en el ámbito de los restaurantes...",
            CURS_Estado: true,
            capitulos: [
            {
                titulo: "Capitulo 1",
                descripcion: "Capitulo 1",
                url: "https://audioplayer.madza.dev/Madza-Persistence.mp3",
            },
            ],
        },
        {
            CURS_Tipo: "audio",
            CURS_Titulo: "Curso de Manipulacion de Alimentos",
            CURS_Autor: "Giovanna Moreno Benavente",
            CURS_Avatar: "https://mappidevbucket.s3.us-east-1.amazonaws.com/mapp_310",
            CURS_Descripcion:
            "Aprende las mejores prácticas de higiene y manipulación de alimentos...",
            CURS_Estado: true,
            capitulos: [],
        },
        // video
        {
          CURS_Titulo: "Gestión de Restaurantes",
          CURS_Descripcion:
            "Domina la administración y gestión de restaurantes modernos.",
          CURS_Tipo: "video",
          CURS_Autor: "Giovanna Moreno Benavente",
          CURS_Avatar:
            "https://mappidevbucket.s3.us-east-1.amazonaws.com/mapp_310",
          CURS_Estado: true,
          capitulos: [
            {
                titulo: "Curso de Gestión de Restaurante",
                descripcion: "Curso de Gestión de Restaurante",
                url: "https://mappidevbucket.s3.us-east-1.amazonaws.com/Cap_1.mp4",
            },
            {
                titulo: "Idea de Negocio",
                descripcion: "Idea de Negocio",
                url: "https://mappidevbucket.s3.us-east-1.amazonaws.com/Cap_2.mp4",
            },
            {
                titulo: "Fases de idea de negocios",
                descripcion: "Fases de idea de negocio",
                url: "https://mappidevbucket.s3.us-east-1.amazonaws.com/Cap_3.mp4",
            },
            {
                titulo: "Controlar mi negocio para crecer",
                descripcion: "Controlar mi negocio para crecer",
                url: "https://mappidevbucket.s3.us-east-1.amazonaws.com/Cap_4.mp4",
            },
            {
                titulo: "¿Debo cobrarle a mi empresa por ser socio?",
                descripcion: "¿Debo cobrarle a mi empresa por ser socio?",
                url: "https://mappidevbucket.s3.us-east-1.amazonaws.com/Cap_5.mp4",
            },
          ],
        },
        {
            CURS_Tipo: "video",
            CURS_Titulo: "Atención al Cliente",
            CURS_Autor: "Andres Mendez",
            CURS_Avatar: "https://mappidevbucket.s3.us-east-1.amazonaws.com/mapp_311",
            CURS_Descripcion:
            "El marketing digital es una estrategia de marketing que utiliza los medios digitales para promocionar productos o servicios...",
            capitulos: [
            {
                titulo: "Introducción",
                descripcion: "Introducción al curso de atención al cliente",
                url: "https://upload.wikimedia.org/wikipedia/commons/a/a7/How_to_make_video.webm",
            },
            ],
        },
        {
            CURS_Tipo: "video",
            CURS_Titulo: "Marketing para Emprendedores",
            CURS_Autor: "Jonathan Paz Morales",
            CURS_Avatar: "https://mappidevbucket.s3.us-east-1.amazonaws.com/mapp_312",
            CURS_Descripcion:
            "Aprende estrategias efectivas de marketing para impulsar tu emprendimiento...",
            capitulos: [],
        },
      ];

      for (const curso of cursos) {
        // Guardar curso
        const nuevoCurso = await Cursos.create({
          CURS_Titulo: curso.CURS_Titulo,
          CURS_Descripcion: curso.CURS_Descripcion,
          CURS_Tipo: curso.CURS_Tipo as "audio" | "video",
          CURS_Autor: curso.CURS_Autor,
          CURS_Avatar: curso.CURS_Avatar,
          CURS_Estado: curso.CURS_Estado || false,
        });

        // Guardar módulos relacionados
        const modulosData: ModuloCursoCreationAttributes[] = curso.capitulos.map(
          (cap, index) => ({
            CURS_Id: nuevoCurso.getDataValue("CURS_Id"),
            MODU_Titulo: cap.titulo,
            MODU_Descripcion: cap.descripcion,
            MODU_Orden: index + 1,
            MODU_UrlContenido: cap.url,
            MODU_Estado: true,
          })
        );

        await ModulosCurso.bulkCreate(modulosData);
      }

      console.log("Se agregaron cursos y módulos predeterminados");
    } else {
      console.log(" Ya existen cursos en la base de datos");
    }
  } catch (error: any) {
    console.log("Error al sembrar cursos: " + error.message);
  }
};
