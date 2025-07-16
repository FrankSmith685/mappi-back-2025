import dotenv from 'dotenv';
dotenv.config();

import server from './src/app';
import { conn } from './src/db';
import { getUbigeos } from './src/utils/getUbigeos';
import { getTipoUsuarios } from './src/utils/getTipoUsuarios';
import { getTipoDocumentos } from './src/utils/getTipoDocumentos';
import { getMedios } from './src/utils/getMedios';
import { getTipoNotificaciones } from './src/utils/getTipoNotificaciones';

const PORT = process.env.PORT || 3001;

conn.sync({ force: true }).then(() => {
  server.listen(PORT, async() => {
    await getTipoUsuarios();
    await getTipoDocumentos();
    await getUbigeos();
    await getMedios();
    await getTipoNotificaciones();
    console.log(`Servidor escuchando en puerto ${PORT}`);
  });
});
