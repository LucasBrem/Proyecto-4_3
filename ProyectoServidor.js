const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// cnexión con la base de datos MySQL
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tp'
});
app.post('/api/alumnos', (req, res) => {
const { nombres, apellidos, curso } = req.body;
const insert = `
INSERT INTO alumnos (nombres, apellidos, curso)
VALUES (?, ?, ?)
`;
conn.query(insert, [nombres, apellidos, curso], (err) => {
if (err) return res.status(500).json({ error: err });
res.status(201).json({ msg: 'Alumno registrado correctamente' });
    });
})

app.get('/api/asistencias/:materia/:fecha', (req, res) => {
const params = [req.params.materia, req.params.fecha];
const q = `
        SELECT a.apellidos, a.nombres, tipo, TIME(creado) AS creado
        FROM registros r
        JOIN alumnos a ON a.id = r.alumno
        WHERE materia = ? AND DATE(creado) = ?
    `;
    
conn.query(q, params, (err, rs) => {
if (err) return res.status(500).json({ error: err });
let i = 1;
for (let r of rs) {
r.orden = i++;
        }
res.status(200).json(rs);
    });
});
app.get('/api/cursos', async (req, res) => {
try {
const [rows] = await pool.query('SELECT id, anio, division, especialidad FROM Cursos');
res.json(rows);
} catch (err) {
res.status(500).json({ error: 'Error al obtener cursos', detalle: err.message });
    }
  });
  
app.get('/api/materias/:num_curso', async (req, res) => {
try {
const num_curso = req.params.num_curso;
const [rows] = await pool.query(
'SELECT num_curso, nombre FROM Materias WHERE curso = ?',
[num_curso]
      );
res.json(rows);
} catch (err) {
res.status(500).json({ error: 'Error al obtener materias', detalle: err.message });
    }

  });
app.get('/api/alumnos/:num_curso', async (req, res) => {
try {
const num_curso = req.params.num_curso;
const [rows] = await pool.query(
'SELECT num_curso, nombre, apellido FROM Alumnos WHERE curso = ?',
[num_curso]
      );
res.json(rows);
    } catch (err) {
res.status(500).json({ error: 'Error al obtener alumnos', detalle: err.message });
    }
  });
app.post('/api/asistencias', async (req, res) => {
const { tipo, alumno, materia } = req.body;
  
if (!tipo || !alumno || !materia) {
return res.status(400).json({ error: 'Faltan datos requeridos' });
}
  
try {
const tipoAbreviado = abreviarTipo(tipo);
  
      
const [existentes] = await pool.query(
`SELECT num_curso FROM Asistencias
WHERE alumno = ? AND materia = ?
AND DATE(creado) = CURDATE()`,
[alumno, materia]
      );
  
if (existentes.length > 0) {
return res.status(409).json({
error: 'Ya se registró asistencia para este alumno y materia hoy.'
        });
      }
  
const [result] = await pool.query(
'INSERT INTO Asistencias (tipo, alumno, materia) VALUES (?, ?, ?)',
[tipoAbreviado, alumno, materia]
      );
  
res.status(201).json({
mensaje: 'Asistencia registrada con éxito',
asistencia: {
id: result.insertId,
tipo: tipoAbreviado,
alumno,
materia
        }
      });
} catch (err) {
res.status(500).json({ error: 'Error al guardar asistencia', detalle: err.message });
    }
  });

app.post('/api/asistencias', (req, res) => {
const { tipo, alumno, materia } = req.body;

const check = `
SELECT * FROM registros 
WHERE alumno = ? AND materia = ? 
AND DATE(creado) = CURDATE()
    `;
conn.query(check, [alumno, materia], (err, rs) => {
if (err) return res.status(500).json({ error: err });
if (rs.length > 0)
return res.status(400).json({ msg: 'No se puede registrar dos veces el mismo día' });

const insert = `
INSERT INTO registros (tipo, alumno, materia)
VALUES (?, ?, ?)
`;
conn.query(insert, [tipo, alumno, materia], (err2) => {
if (err2) return res.status(500).json({ error: err2 });
res.status(201).json({ msg: 'Asistencia registrada correctamente' });
        });
    });
});

app.listen(3000, () => console.log('Servidor corriendo en http://localhost:3000'));