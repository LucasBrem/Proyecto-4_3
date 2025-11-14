function manejarSeleccion(e) {
    const materias_select = e.target;
    const materiaId= materias_select.value;
    if (!materiaId) {
      const tbody = document.querySelector('tbody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="4" style="color: grey;">Por favor, selecciona una <b>Materia</b> y una <b>División</b>.</td></tr>';
    } else{
    CargadodeAlumnosEnTabla(materiaId);}
}


function CargadodeAlumnosEnTabla(materiaId,fecha) {
    if(!fecha) { fecha = new Intl.DateTimeFormat('sv-SE', {
year: 'numeric',
month: '2-digit',
day: '2-digit'
}).format(new Date());}
fetch('http://localhost:3000/api/alumnos/'+materiaId,{headers: {'Content-Type': 'application/json'}})
.then(res => res.json())
.then( data => {
    const alumnosDelCurso = data;
    let tbody = document.querySelector('tbody');
    tbody.innerHTML = '';
    if (alumnosDelCurso.length === 0) {
         tbody.innerHTML = '<tr><td colspan="4">No se encontraron alumnos para este curso.</td></tr>';
         return;

    }
    fetch('http://localhost:3000/api/asistencias/'+materiaId+'/'+fecha,{headers: {'Content-Type': 'application/json'}}).then(res => res.json()).then(data => {
    let tr;
      for (let alumno of alumnosDelCurso) {
          tr = document.createElement('tr');
          tr.setAttribute('data-materia-id', materiaId);
          tr.setAttribute('data-alumno-id', alumno.id);
          tr.innerHTML = `
          <td>${alumno.nombre}</td>
          <td>${alumno.apellido}</td>
          <td>
          <button value="P" onclick="RegistrarAsistencia(event)">Presente</button>
          <button value="T" onclick="RegistrarAsistencia(event)">Tarde</button>
          <button value="A" onclick="RegistrarAsistencia(event)">Ausente</button>
          <button value="RA" onclick="RegistrarAsistencia(event)">Retiro antes</button>
          <button value="AP" onclick="RegistrarAsistencia(event)">Ausente con presencia</button>
          <button onclick="borrarAsistencia(event)">←</button>
          </td>
      `;


      const asistencia = data.find(asistencia => asistencia.alumno === alumno.id);
      if (asistencia) {
        console.log(asistencia)
        tr.setAttribute('data-asistencia-id', asistencia.id);
      Array.from(tr.children[2].children).forEach(boton => {
          if(boton.value == asistencia.tipo) {boton.classList = asistencia.tipo;Array.from(tr.children[2].children).forEach(boton => {if(boton.textContent != '←') boton.disabled = true;});boton.style.opacity = 1;}
        });
        }
            tbody.appendChild(tr);
        }

      
  });
      }
  ).catch(error => {
        let tr;
      for (let alumno of alumnosDelCurso) {
          tr = document.createElement('tr');
          tr.setAttribute('data-materia-id', materiaId);
          tr.setAttribute('data-alumno-id', alumno.id);
          tr.innerHTML = `
          <td>${alumno.nombre}</td>
          <td>${alumno.apellido}</td>
          <td>
          <button value="P" onclick="RegistrarAsistencia(event)">Presente</button>
          <button value="T" onclick="RegistrarAsistencia(event)">Tarde</button>
          <button value="A" onclick="RegistrarAsistencia(event)">Ausente</button>
          <button value="RA" onclick="RegistrarAsistencia(event)">Retiro antes</button>
          <button value="AP" onclick="RegistrarAsistencia(event)">Ausente con presencia</button>
          <button onclick="borrarAsistencia(event)">←</button>
          </td>
      `;
      tbody.appendChild(tr);
      }
    });
};

function RegistrarAsistencia(e) {
    let boton = e.target;
    const tipo = boton.value; 
    boton.classList = tipo; 
    const row = boton.parentNode.parentNode;
    
    const alumnoId = row.getAttribute('data-alumno-id');
    const materiaId = row.getAttribute('data-materia-id');
    if (!tipo || !alumnoId) {
         console.error('Faltan datos para registrar la asistencia.');
         return;
    }
    const body = {
        tipo: tipo,
        alumno: alumnoId,
        materia: materiaId,
        fecha: document.querySelector('#fecha').value
    };
    let botones = Array.from(Array.from(row.children)[2].children);
    botones.forEach(boton => {
        if(boton.textContent != '←') boton.disabled = true;
    });
    fetch('http://localhost:3000/api/asistencias', {
        method: 'POST',
        headers: {
             'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
    .then(res => {
        
        return res.json();
    })
    .then(data => {
        console.log(data);
        row.setAttribute('data-asistencia-id', data.id);
    })
    .catch(error => {
        console.error('Fallo el registro de asistencia:', error);
        boton.classList = '';
        row.style.backgroundColor = '#ffe6e6';
    });
}
function crearCurso(e) {
    e.preventDefault();
    let form = e.target;
    const anio = form.querySelector('input[name="anio"]').value;
    const division = form.querySelector('input[name="division"]').value;
    const especialidad = form.querySelector('input[name="especialidad"]').value;
    const body = {
        anio: anio,
        division: division,
        especialidad: especialidad
    };
    fetch('http://localhost:3000/api/cursos', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(data => {
        console.log('Alumno registrado:', data);
    })
    .catch(error => {
        console.error('Fallo el registro de alumno:', error);
        alert(`ERROR: No se pudo registrar el alumno. Causa: ${error}`);
    });
    form.reset();
}
function crearMateria(e) {
  e.preventDefault();
  let form = e.target;
  const materia = form.querySelector('input[name="nombre"]').value;
  const body = {
      nombre: materia,
      cursoId: form.querySelector('select[name="cursos"]').value
  };
  fetch('http://localhost:3000/api/materias', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  .then(res => res.json())
  .then(data => {
      console.log('Materia registrada:', data);
  })
  .catch(error => {
      console.error('Fallo el registro la materia:', error);
      alert(`ERROR: No se pudo registrar la materia. Causa: ${error}`);});
  form.reset();
}
function agregarAlumno(e) {
    e.preventDefault();
    const materia = document.querySelector("#materias").value;
    if (materia != "Materia"){
    let form = e.target;
    const nombre = form.querySelector('input[name="nombre"]').value;
    const apellido = form.querySelector('input[name="apellido"]').value;
    const body = {
        nombre: nombre,
        apellido: apellido,
        materia: materia
    };
    fetch('http://localhost:3000/api/alumnos', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(data => {
        console.log('Alumno registrado:', data);
    })
    .catch(error => {
        console.error('Fallo el registro de alumno:', error);
        alert(`ERROR: No se pudo registrar el alumno. Causa: ${error}`);
    });
    form.reset();
    CargadodeAlumnosEnTabla(materia);
    } else {
      alert("Seleccione una materia");
    }
}
function agregarMaterias(e) {
  const curso = e.target.value;

  fetch('http://localhost:3000/api/materias/'+curso, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
  })
  .then(res => res.json())
  .then(data => {
    const select_materias = document.querySelector('#materias');  
    select_materias.innerHTML = '<option>Materia</option>';
    for(let materia of data){
        const option = document.createElement('option');
        option.value = materia.id;
        option.textContent = materia.nombre;
        select_materias.appendChild(option);
      }
  })
  .catch(error => {
      console.error(error);
  });
}
function agregarCursos() {
  const select_cursos = document.querySelector('#cursos');
  select_cursos.innerHTML = '<option>Curso</option>';
    fetch('http://localhost:3000/api/cursos', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
  })
  .then(res => res.json())
  .then(data => {
  for (let curso of data) {
      const option = document.createElement('option');
      option.value = curso.id;
      option.textContent = curso.anio + " " + curso.division + " " + curso.especialidad;
      select_cursos.appendChild(option);
  }
  if(!document.querySelector('#selector-cursos')){
  const form = document.querySelector('#crear-materia');
  const select = select_cursos.cloneNode(true);
  select.id = 'selector-cursos';
  select.name = 'cursos';
  form.appendChild(select);}
})
  .catch(error => {
      console.error('Fallo el registro de curso:', error);
      alert(`ERROR: No se pudo registrar el curso. Causa: ${error}`);
  });

}
function borrarAsistencia(e) {
  e.preventDefault();
  const asistenciaId = e.target.parentNode.parentNode.getAttribute('data-asistencia-id');
  fetch(`http://localhost:3000/api/asistencias/${asistenciaId}`, {
    method: 'DELETE',
    headers: {
        'Content-Type': 'application/json'
    }
  })
  .then(res => res.json())
  .then(data => {
      console.log('Asistencia eliminada:', data);
      CargadodeAlumnosEnTabla(document.querySelector("#materias").value);
  })
  .catch(error => {
      console.error('Fallo la eliminación de asistencia:', error);
  });
}
if(document.querySelector("#fecha") == null){
    let fechaInput = document.createElement("input");
fechaInput.type = "date";fechaInput.id = "fecha";
const fechaFormateada = new Intl.DateTimeFormat('sv-SE', {
year: 'numeric',
month: '2-digit',
day: '2-digit'
}).format(new Date());
fechaInput.onchange = () => CargadodeAlumnosEnTabla(document.querySelector("#materias").value,fechaInput.value);
    fechaInput.value = fechaFormateada;
    fechaInput.setAttribute("max",fechaFormateada);
document.querySelector(".contenedor-selects").appendChild(fechaInput);
    }
document.querySelector('#cursos').addEventListener('change', agregarMaterias);
document.querySelector('#materias').addEventListener('change', manejarSeleccion);
agregarCursos();