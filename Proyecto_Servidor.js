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
    database: 'proyecto', 
    waitForConnections: true,
    connectionLimit: 10, 
    queueLimit: 0
});
const cursoMap = {
    "4_3": 1,
    "4_4": 2,
    "4_5": 3
};
app.get('/api/alumnos/:num_curso', async (req, res) => {
    try {
        const curso_id = req.params.num_curso;
        const query = 'SELECT id, nombre, apellido, num_curso FROM alumnos WHERE num_curso = ?';
        const [rows] = await pool.query(query, [curso_id]); 
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener alumnos:', err);
        res.status(500).json({ error: 'Error al obtener alumnos', detalle: err.message });
    }
});
app.post('/api/asistencias', async (req, res) => {
    const { tipo, alumno, materia } = req.body; 
    if (!tipo || !alumno || !materia) {
        return res.status(400).json({ error: 'Faltan datos requeridos (tipo, alumno o materia).' });
    }
    try {
        const checkQuery = `
    SELECT id FROM asis
    WHERE alumno_num = ?
    AND DATE(fecha) = CURDATE()
`;
        const [existentes] = await pool.query(checkQuery, [alumno]);
        if (existentes.length > 0) {
            return res.status(409).json({ 
                error: 'Ya se registró asistencia para este alumno hoy.',
                msg: 'No se puede registrar dos veces el mismo día'
            });
        }
        const insertQuery = `
    INSERT INTO asis (alumno_num, tipo)
    VALUES (?, ?)
`;
        const [result] = await pool.query(insertQuery, [alumno, tipo]);

        res.status(201).json({
            mensaje: 'Asistencia registrada con éxito',
            asistencia: {
                id: result.insertId,
                tipo: tipo,
                alumno: alumno,
                materia: materia 
            }
        });

    } catch (err) {
        console.error('Error al guardar asistencia:', err);
        res.status(500).json({ error: 'Error al guardar asistencia', detalle: err.message });
    }
});
const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
app.delete('/api/asistencias/:alumnoId', async (req, res) => {
    const alumnoId = req.params.alumnoId;

    try {
        const deleteQuery = 
            DELETE FROM asis 
            WHERE alumno_num = ? 
            AND DATE(fecha) = CURDATE()
        ;
        const [result] = await pool.query(deleteQuery, [alumnoId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Registro de asistencia no encontrado para hoy.' });
        }

        res.status(200).json({ 
            mensaje: 'Registro de asistencia eliminado con éxito', 
            alumnoId: alumnoId 
        });

    } catch (err) {
        console.error('Error al eliminar asistencia:', err);
        res.status(500).json({ error: 'Error al eliminar asistencia', detalle: err.message });
    }
});
