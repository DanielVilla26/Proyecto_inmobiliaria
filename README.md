# 🏠 CasaFácil Pro

Aplicación web para consultar propiedades en alquiler y agendar visitas.
Proyecto académico hecho con Node.js, Express y SQLite (sql.js).

## Funcionalidades

- Registro, inicio de sesión y recuperación de contraseña
- Catálogo de propiedades con filtros (ciudad, precio, tipo, habitaciones...)
- Galería de imágenes, favoritos y comparador de propiedades
- Agenda de visitas con calendario y control de horarios ocupados
- Chat en tiempo real entre usuario y administrador (Socket.io)
- Notificaciones dentro de la app y por correo
- Panel de administración: propiedades, reservas, usuarios y estadísticas
- Reportes en Excel y PDF
- Modo claro / oscuro

## Cómo ejecutarlo

Requiere [Node.js](https://nodejs.org) 18 o superior.

```bash
npm install
npm start
```

Luego abre http://localhost:3000

## Usuario administrador por defecto

| Email                 | Contraseña |
|-----------------------|------------|
| admin@casafacil.com   | admin123   |

Se crea automáticamente la primera vez que arranca la app.

## Notas

- **Recuperar contraseña:** se pide el email y el teléfono con el que se registró la cuenta.
  Si una cuenta no tiene teléfono (por ejemplo, el admin), se puede agregar desde *Perfil*.
- **Correos:** usan [Ethereal](https://ethereal.email), un servicio de pruebas. Los correos no
  llegan a bandejas reales; al iniciar, la consola muestra el enlace para verlos.
- La base de datos se guarda en `data.sqlite` y las fotos subidas en `public/uploads/`
  (ambos se crean solos y están en `.gitignore`).

## Estructura

```
server.js        API REST, sesiones, reportes y chat (Socket.io)
database.js      Tablas, datos iniciales y funciones de acceso a SQLite
mailer.js        Plantillas y envío de correos
public/          Frontend (index.html, css/ y js/ con un archivo por módulo)
```


## Reseñas y puntuaciones

Cada propiedad cuenta con una sección pública de reseñas con puntuación de 1 a 5 estrellas y comentarios. Las personas autenticadas pueden publicar una reseña por propiedad, actualizarla o eliminarla. El catálogo muestra el promedio y el número de reseñas. Las reseñas se guardan en SQLite y la tabla se crea automáticamente al iniciar el servidor.


## Estadísticas administrativas

El panel de administración incorpora un resumen ampliado que se alimenta desde `GET /api/stats` (ruta protegida para administradores):

- Reservas confirmadas y canceladas, favoritos guardados y promedio/cantidad de reseñas.
- Gráfico de actividad mensual de los últimos seis meses (usuarios, propiedades y reservas creados en cada mes).
- Ranking de propiedades con más favoritos y propiedades mejor valoradas por reseñas.
- Conserva los indicadores previos, el resumen de propiedades por ciudad, la gestión de inmuebles y la tabla de reservas.

### Archivos modificados

- `server.js`: amplía la respuesta de `/api/stats` con consultas agregadas a la base de datos.
- `public/js/dashboard-admin.js`: presenta las nuevas tarjetas, el gráfico y los rankings.
- `public/css/main.css`: estilos adaptables para escritorio y móvil, con soporte para el tema oscuro.

Las estadísticas se calculan con los datos reales guardados; si todavía no hay favoritos, reservas o reseñas, las secciones correspondientes mostrarán un estado vacío o cero.
