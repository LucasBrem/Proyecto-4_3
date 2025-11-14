create database proyecto;
use proyecto;

create table cursos(
id int auto_increment primary key,
anio int not null,
division int not null,
especialidad varchar(50)
);
create table materias(
id int auto_increment primary key,
nombre varchar (100),
curso int, 
foreign key (curso) references cursos(id)
);
create table alumnos(
id int auto_increment primary key,
nombre varchar (100),
apellido varchar (100),
materia int, 
foreign key (materia) references materias(id)
);

create table asistencias(
id int auto_increment primary key,
alumno int not null,
tipo enum("P","T","A","AP","RA"),
hora timestamp not null default current_timestamp,
fecha date default (current_date),
foreign key (alumno) references alumnos(id)
);

insert into cursos (anio,division,especialidad) values 
(4,3,"computacion"),
(4,4,"computacion"),
(4,5,"computacion"),
(5,2,"computacion"),
(6,1,"computacion");


insert into materias (nombre,curso) values
("Proyecto",1),
("Base de datos",2),
("Lengua",3),
("Geografia",4),
("Historia",5);


insert into alumnos (nombre,apellido,materia) values
("Lucas","Brem",1),
("Marcos","Maddonni",1),
("Franco","Choque",1),
("Jano","Lejano",1),
("Fran","Aumas",1),
("Andres","Maddonni",2),
("Verna","Brem",2),
("Nahir","Torres",2),
("Miguel","Lopez",2),
("Thiago","Gomez",2),
("Natalia","Bottaro",3),
("Ana","Rocha",3),
("Rene","Garcia",3),
("Rocky","Balboa",3),
("Homero","Simpson",3);