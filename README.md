# Gestión de Productos (frontend)

Página hecha con HTML, CSS y JavaScript que consume la API de productos.

**Recorrido:** Página → backend (Express) → PostgreSQL → respuesta en la página.

## Configuración

Edita `config.js` y pon la URL pública del backend:

```js
const API_URL = 'https://tu-backend.onrender.com';
```

El frontend solo conoce la URL de la API. **No** contiene credenciales de la base de datos.

## Funciones

- Listar productos
- Crear producto
- Buscar por nombre
- Consultar por id
- Editar producto
- Eliminar producto

## Publicación

Se publica en Render como **Static Site**, con el campo Build Command vacío y `.` como Publish Directory.
