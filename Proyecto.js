
const estudiantes = [
    //  4_3 
    { id: 1, nombre: 'Lucas', apellido: 'Brem', num_curso: 1 },
    { id: 2, nombre: 'Marcos', apellido: 'Maddonni', num_curso: 1 },
    { id: 3, nombre: 'Franco', apellido: 'Choque', num_curso: 1 },
    { id: 4, nombre: 'Jano', apellido: 'Lejano', num_curso: 1 },
    { id: 5, nombre: 'Fran', apellido: 'Aumas', num_curso: 1 },
    // 4_4 
    { id: 6, nombre: 'Andres', apellido: 'Maddonni', num_curso: 2 },
    { id: 7, nombre: 'Verna', apellido: 'Brem', num_curso: 2 },
    { id: 8, nombre: 'Nahir', apellido: 'Torres', num_curso: 2 },
    { id: 9, nombre: 'Miguel', apellido: 'Lopez', num_curso: 2 },
    { id: 10, nombre: 'Thiago', apellido: 'Gomez', num_curso: 2 },
    // 4_5 
    { id: 11, nombre: 'Natalia', apellido: 'Bottaro', num_curso: 3 },
    { id: 12, nombre: 'Ana', apellido: 'Rocha', num_curso: 3 },
    { id: 13, nombre: 'Rene', apellido: 'Garcia', num_curso: 3 },
    { id: 14, nombre: 'Rocky', apellido: 'Balboa', num_curso: 3 },
    { id: 15, nombre: 'Homero', apellido: 'Simpson', num_curso: 3 },

];

const cursoMap = {
    "4_3": 1,
    "4_4": 2,
    "4_5": 3
};

const asistenciaColores = {
    "P": "asistencia-verde",   
    "T": "asistencia-naranja", 
    "A": "asistencia-rojo",   
    "AP": "asistencia-azul",   
    "RA": "asistencia-gris",   
    "": "asistencia-default"   
};
function manejarSeleccion() {
    const divisionSelect = document.querySelector('.division');
    const materiaSelect = document.querySelector('.materias');
    
    const cursoSeleccionado = divisionSelect.value;
    const materiaNombre = materiaSelect.value;
    const cursoId = cursoMap[cursoSeleccionado];
    const tbody = document.querySelector('tbody');
    if (!cursoId || materiaNombre === '') {
        if (tbody) tbody.innerHTML = '<tr><td colspan="4" style="color: grey;">Por favor, selecciona una <b>Materia</b> y una <b>División</b>.</td></tr>';
        return;
    }
    CargadodeAlumnosEnTabla(cursoId, materiaNombre);
}
document.querySelector('.division').addEventListener('change', manejarSeleccion);
document.querySelector('.materias').addEventListener('change', manejarSeleccion);
function CargadodeAlumnosEnTabla(cursoId, materiaNombre) {
    const alumnosDelCurso = estudiantes.filter(alumno => alumno.num_curso === cursoId);
    let tabla = document.querySelector('table');
    let tbody = document.querySelector('tbody');
    if (!tbody) {
        tbody = document.createElement('tbody');
        tabla.append(tbody);
    }
    tbody.innerHTML = '';
    if (alumnosDelCurso.length === 0) {
         tbody.innerHTML = '<tr><td colspan="4">No se encontraron alumnos para este curso.</td></tr>';
         return;

    }
    let numeroAlumno = 1;
    for (let alumno of alumnosDelCurso) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
             <td>${numeroAlumno++}</td>
             <td>${alumno.nombre}</td>
             <td>${alumno.apellido}</td>
             <td>
                 <select class="asistencia-select"
                         data-alumno-id="${alumno.id}"
                         data-materia-nombre="${materiaNombre}"
                         onchange="RegistrarAsistencia(event)">
                     <option value="">Seleccione</option>
                     <option value="P">P (Presente)</option>
                     <option value="T">T (Tarde)</option>
                     <option value="A">A (Ausente)</option>
                     <option value="AP">AP (Ausencia con presencia)</option>
                     <option value="RA">RA (Retiro Anticipado)</option>
                 </select>
             </td>
         `;
         tbody.append(tr);
    }
}
function AplicarColorDeAsistencia(select) {
    const tipo = select.value;
    const claseColor = asistenciaColores[tipo] || asistenciaColores[""];
    Object.values(asistenciaColores).forEach(clase => {
         select.classList.remove(clase);
    });
    select.classList.add(claseColor);

}
function RegistrarAsistencia(e) {
    const select = e.target;
    const tipo = select.value; 
    AplicarColorDeAsistencia(select);
    const alumnoId = select.getAttribute('data-alumno-id');
    const materiaNombre = select.getAttribute('data-materia-nombre');
    if (!tipo || !alumnoId || !materiaNombre) {
         console.error('Faltan datos para registrar la asistencia.');
         return;
    }
    const payload = {
        tipo: tipo,
        alumno: alumnoId,
        materia: materiaNombre
    };
    select.disabled = true;
    fetch('http://localhost:3000/api/asistencias', {
        method: 'POST',
        headers: {
             'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(res => {
        select.disabled = false;
        if (!res.ok) {
            return res.json().then(data => Promise.reject(data.msg || data.error || `Error HTTP ${res.status}`));
        }
        return res.json();
    })
    .then(data => {
        console.log('Asistencia registrada:', data);
        select.closest('tr').style.opacity = '0.7';
        setTimeout(() => select.closest('tr').style.opacity = '1', 500);
    })
    .catch(error => {
        console.error('Fallo el registro de asistencia:', error);
        alert(`ERROR: No se pudo registrar la asistencia. Causa: ${error}`);
        select.value = '';
        AplicarColorDeAsistencia(select);
        select.closest('tr').style.backgroundColor = '#ffe6e6';
    });

}