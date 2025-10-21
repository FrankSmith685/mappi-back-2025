import dotenv from 'dotenv';
dotenv.config();

import server from './src/app';
import { conn } from './src/db';
import { getRoles } from './src/utils/getRoles';
import { getUbigeos } from './src/utils/getUbigeos';
import { getTipoNotificaciones } from './src/utils/getTipoNotificaciones';
import { getCategorias } from './src/utils/getCategorias';
import { getSubCategorias } from './src/utils/getSubCategorias';
import { getTipoPlanes } from './src/utils/getTipoPlanes';
import { getPlanes } from './src/utils/getPlanes';
import { getPlanesBeneficios } from './src/utils/getPlanesBeneficios';
import { getCursos } from './src/utils/getCursos';

const PORT = process.env.PORT || 3001;

conn.sync({ force: false }).then(() => {
  server.listen(PORT, async() => {
    await getRoles();
    await getUbigeos();
    await getTipoNotificaciones();
    await getCategorias();
    await getSubCategorias();
    await getTipoPlanes();
    await getPlanes();
    await getPlanesBeneficios();
    await getCursos();
    console.log(`Servidor escuchando en puerto ${PORT}`);
  });
}); 
 