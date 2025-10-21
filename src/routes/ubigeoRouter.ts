import { Request, Response, Router } from 'express';
import { getDepartamentos, getProvincias, getDistritos, getUbigeoByCoords, getCoordsByUbigeo, searchDirecciones, getCoordsByDireccion, getCodUbigeo, getUbigeoByCodigo, getDepartamentosConServiciosActivos } from '../controllers/ubigeoController';
// import { getDepartamentosConServiciosActivos } from '../controllers/direccionController';

const router = Router();

router.get('/departamentos', async (req, res) => {
  try {
    const result = await getDepartamentos();
    res.json(result);
  } catch (err: any) {
    res.status(500).json(JSON.parse(err.message));
  }
});

router.get('/provincias/:departamento', async (req, res) => {
  try {
    const result = await getProvincias(req.params.departamento);
    res.json(result);
  } catch (err: any) {
    res.status(500).json(JSON.parse(err.message));
  }
});

router.get('/distritos/:departamento/:provincia', async (req, res) => {
  try {
    const result = await getDistritos(req.params.departamento, req.params.provincia);
    res.json(result);
  } catch (err: any) {
    res.status(500).json(JSON.parse(err.message));
  }
});

// 4. Obtener Ubigeo por coordenadas
router.get('/obtener-ubigeo-por-coordenadas', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: "Faltan parámetros lat y lng" });
    }

    const result = await getUbigeoByCoords(Number(lat), Number(lng));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Obtener coordenadas por Ubigeo
router.get('/obtener-coordenadas-por-ubigeo', async (req, res) => {
  try {
    const { dep, prov, dist } = req.query;
    if (!dep || !prov || !dist) {
      return res.status(400).json({ success: false, message: "Faltan parámetros dep, prov y dist" });
    }

    const result = await getCoordsByUbigeo(dep.toString(), prov.toString(), dist.toString());
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. Buscar direcciones (autocomplete)
router.get('/buscar-direcciones', async (req, res) => {
  try {
    const { query, dep, dist } = req.query;

    if (!dep || !dist) {
      return res.status(400).json({ success: false, message: "Faltan parámetros dep y dist" });
    }

    // 👇 si query no viene, usar "" vacío
    const queryStr = query ? query.toString() : "";

    const result = await searchDirecciones(queryStr, dep.toString(), dist.toString());
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// 7. Obtener coordenadas de una dirección
router.get('/obtener-coordenadas-por-direccion', async (req, res) => {
  try {
    const { s, dep, dist } = req.query;
    if (!s || !dep || !dist) {
      return res.status(400).json({ success: false, message: "Faltan parámetros s, dep y dist" });
    }

    const result = await getCoordsByDireccion(s.toString(), dep.toString(), dist.toString());
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// 8. Obtener cod_ubigeo por dep, prov, dist
router.get('/obtener-cod-ubigeo', async (req, res) => {
  try {
    const { dep, prov, dist } = req.query;
    if (!dep || !prov || !dist) {
      return res.status(400).json({ success: false, message: "Faltan parámetros dep, prov y dist" });
    }

    const result = await getCodUbigeo(dep.toString(), prov.toString(), dist.toString());
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});


router.get('/obtener-ubigeo-por-codigo', async (req, res) => {
  try {
    const { codigo } = req.query;
    if (!codigo) {
      return res.status(400).json({ success: false, message: "Falta el parámetro codigo" });
    }

    const result = await getUbigeoByCodigo(codigo.toString());
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});



router.get("/departamentos/activos", async (_req: Request, res: Response) => {
  try {
    const departamentos = await getDepartamentosConServiciosActivos();

    if (departamentos.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No se encontraron departamentos con servicios activos",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Departamentos con servicios activos obtenidos correctamente",
      data: departamentos,
    });
  } catch (error: any) {
    console.error("Error en GET /direcciones/departamentos/activos:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error inesperado al obtener los departamentos",
    });
  }
});



export default router;
