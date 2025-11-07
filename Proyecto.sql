mysql -u root

create database proyecto;
use proyecto;

create table cursos
(
id int auto_increment primary key,
curso varchar(50) not null
);

create table alumnos
(
id int auto_increment primary key,
nombre varchar (100),
apellido varchar (100),
num_curso int, 
foreign key (num_curso) references cursos(id)
);

create table asis(
id int auto_increment primary key,
alumno_num int,
tipo enum("p","t","a","lt","ra"),
hora timestamp not null default current_timestamp,
fecha date default (current_date),
foreign key (alumno_num) references alumnos(id)
);

insert into cursos (curso) values 
("4_3"),
("4_4"),
("4_5");

insert into alumnos (nombre,apellido,num_curso) values
("Lucas","Brem",1),
("Marcos","Maddonni",1),
("Franco","Choque",1),
("Jano","Lejano",1),
("Fran","Aumas",1);

insert into alumnos (nombre,apellido,num_curso) values
("Andres","Maddonni",2),
("Verna","Brem",2),
("Nahir","Torres",2),
("Miguel","Lopez",2),
("Thiago","Gomez",2);

insert into alumnos (nombre,apellido,num_curso) values
("Natalia","Bottaro",3),
("Ana","Rocha",3),
("Rene","Garcia",3),
("Rocky","Balboa",3),
("Homero","Simpson",3);