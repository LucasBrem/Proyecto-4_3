const express = require('express');
const mysql = require('mysql2/promise'); 
const cors = require('cors');
const morgan = require('morgan');
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
const pool = mysql.createPool({
    host: 'localhost', 
    user: 'root',
    password: '',
    database: 'proyecto'
});
app.get("/", (req, res) => {
    res.send("API funcionando");
});

app.get('/api/cursos', async (req, res) => {
    try {
        const query = 'select * from cursos';
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener cursos:', err);
        res.status(500).json({ error: 'Error al obtener cursos', detalle: err.message });
    }
})
app.get('/api/materias/:curso', async (req, res) => {
    const curso = req.params.curso;
    try {
        const query = 'select * from materias where curso = ?';
        const [rows] = await pool.query(query, [curso]);
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener materias:', err);
        res.status(500).json({ error: 'Error al obtener materias', detalle: err.message });
    }
})
app.post('/api/cursos', async (req, res) => {
    const { anio, division, especialidad } = req.body; 
    if (!anio || !division || !especialidad) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    try {
        const query = 'insert into cursos (anio, division, especialidad) values (?, ?, ?)';
        const [result] = await pool.query(query, [ anio, division, especialidad ]);
        res.status(201).json(result);
    } catch (err) {
        console.error('Error al crear curso:', err);
        res.status(500).json({ error: 'Error al crear curso', detalle: err.message });
    }
})
app.post('/api/materias', async (req, res) => {
    const { nombre, cursoId } = req.body; 
    if (!nombre || !cursoId) {
        return res.status(400).json({ error: 'Faltan datos requeridos (nombre o curso).' });
    }
    try {
        const query = 'insert into materias (nombre, curso) values (?, ?)';
        const [result] = await pool.query(query, [nombre, cursoId]);
        res.status(201).json(result);
    } catch (err) {
        console.error('Error al crear materia:', err);
        res.status(500).json({ error: 'Error al crear materia', detalle: err.message });
    }
})
app.post('/api/alumnos', async (req, res) => {
    const { nombre, apellido, materia } = req.body; 
    if (!nombre || !apellido || !materia) {
        return res.status(400).json({ error: 'Faltan datos requeridos (nombre, apellido o materia).' });
    }
    try {
        const query = 'insert into alumnos (nombre, apellido, materia) values (?, ?, ?)';
        const [result] = await pool.query(query, [nombre, apellido, materia]);
        res.status(201).json(result);
    } catch (err) {
        console.error('Error al crear alumno:', err);
        res.status(500).json({ error: 'Error al crear alumno', detalle: err.message });
    }
})
app.get('/api/alumnos/:materia_id', async (req, res) => {
    try {
        const materia_id = req.params.materia_id;
        const query = 'select alumnos.id, alumnos.nombre, alumnos.apellido from alumnos join materias on alumnos.materia = materias.id where alumnos.materia = ?';
        const [rows] = await pool.query(query, [materia_id]); 
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener alumnos:', err);
        res.status(500).json({ error: 'Error al obtener alumnos', detalle: err.message });
    }
});
app.post('/api/asistencias', async (req, res) => {
    const { tipo, alumno, materia, fecha } = req.body; 
    if (!tipo || !alumno || !materia || !fecha) {
        return res.status(400).json({ error: 'Faltan datos requeridos (tipo, alumno o materia).' });
    }
    try {
        const checkQuery = `
    SELECT id FROM asistencias
    WHERE alumno = ?
    AND DATE(fecha) = ?
`;
        const [existentes] = await pool.query(checkQuery, [alumno,fecha]);
        if (existentes.length > 0) {
            return res.status(409).json({ 
                error: 'Ya se registró asistencia para este alumno hoy.',
                msg: 'No se puede registrar dos veces el mismo día'
            });
        }
        const insertQuery = `
    INSERT INTO asistencias (alumno, tipo, fecha)
    VALUES (?, ?, ?)
`;
        const [result] = await pool.query(insertQuery, [alumno, tipo,fecha]);

        res.status(201).json({
                id: result.insertId,
                tipo: tipo,
                alumno: alumno,
                materia: materia 
        });

    } catch (err) {
        console.error('Error al guardar asistencia:', err);
        res.status(500).json({ error: 'Error al guardar asistencia', detalle: err.message });
    }
});
app.get('/api/asistencias/:materia/:fecha', async (req, res) => {
    try {
        const materia = req.params.materia;
        const fecha = req.params.fecha;
        const query = 'select asistencias.alumno, alumnos.nombre, alumnos.apellido, asistencias.id AS id, asistencias.tipo, asistencias.fecha from asistencias join alumnos on asistencias.alumno = alumnos.id where alumnos.materia = ? and DATE(fecha) = ?';
        const [rows] = await pool.query(query, [materia, fecha]); 
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener asistencias:', err);
        res.status(500).json({ error: 'Error al obtener asistencias', detalle: err.message });
    }
    
})
app.delete('/api/asistencias/:asistenciaId', async (req, res) => {
    const asistenciaId = req.params.asistenciaId;
    if (!asistenciaId) {
        return res.status(400).json({ error: 'Faltan datos requeridos (asistenciaId).' });
    }

    
    try {
        const deleteQuery = `
        DELETE FROM asistencias
        WHERE id = ? 
        `
        ;
        const [result] = await pool.query(deleteQuery, [asistenciaId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Registro de asistencia no encontrado con ese id' });
        }
        
        res.status(200).json({ 
            mensaje: 'Registro de asistencia eliminado con éxito', 
            asistenciaId: asistenciaId 
        });
        
    } catch (err) {
        console.error('Error al eliminar asistencia:', err);
        res.status(500).json({ error: 'Error al eliminar asistencia', detalle: err.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));