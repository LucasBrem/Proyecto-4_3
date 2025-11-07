function CargadodeCursos(){
fetch('http://localhost:3000/api/cursos')
.then(res => res.json())
.then(data => {
const select = document.querySelector('#cursos');
select.innerHTML = '';
for (let curso of data) {
const option = document.createElement('option');
const { anio, division, esp } = curso;
option.textContent = `${anio} ${division} ${esp}`;
option.value = curso.id;
select.append(option);
}
})
.catch(err => console.error(err.stack));
}


CargadodeCursos();
function cargarMaterias(e) {
const num_curso = e.target.value;
fetch('http://localhost:3000/api/materias/' + num_curso)
.then(res => res.json())
.then(data => {
const select = document.querySelector('#materias');
select.innerHTML = '';
for (let materia of data) {
const option = document.createElement('option');
option.textContent = materia.nombre;
select.append(option);
}
});
}

function CargadodeAlumnos(num_curso) {
fetch(`http://localhost:3000/api/alumnos/${num_curso}`)
.then(res => res.json())
.then(data => {
const select = document.querySelector('#alumnos');
select.innerHTML = '<option value="">Escoja un alumno</option>';
for (let alumno of data) {
const option = document.createElement('option');
option.textContent = `${alumno.apellido}, ${alumno.nombre}`;
option.value = alumno.id;
select.append(option);
}
});
}


