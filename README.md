# Portfolio Backend

API REST para gestionar proyectos personales de un portafolio.

## Tecnologías

- Node.js
- Express
- MongoDB + Mongoose
- JWT
- bcryptjs
- Cloudinary
- Multer
- CORS

## Seguridad / autorización

No existe una ruta pública de registro.

El administrador se crea desde la terminal mediante:

```bash
npm run create-admin
```

Las rutas de lectura de proyectos son públicas para que tu frontend pueda mostrar el portafolio.

Crear, editar y eliminar proyectos requiere:

```http
Authorization: Bearer TU_TOKEN
```

## 1. Instalación

```bash
npm install
```

## 2. Variables de entorno

Copia:

```bash
cp .env.example .env
```

Completa `.env` con MongoDB, Cloudinary y tus credenciales de administrador.

Genera un `JWT_SECRET` largo y aleatorio. No subas `.env` a GitHub.

## 3. Crear el administrador

```bash
npm run create-admin
```

La contraseña queda almacenada como hash bcrypt en MongoDB.

Después de crear el usuario puedes eliminar `ADMIN_PASSWORD` de `.env` si no vas a ejecutar nuevamente el script.

## 4. Ejecutar

Desarrollo:

```bash
npm run dev
```

Producción:

```bash
npm start
```

Servidor por defecto:

```text
http://localhost:5000
```

## Endpoints

### Comprobar API

```http
GET /api/health
```

### Login

```http
POST /api/auth/login
Content-Type: application/json
```

Body:

```json
{
  "email": "you@example.com",
  "password": "your-password"
}
```

Respuesta:

```json
{
  "token": "JWT...",
  "user": {
    "id": "...",
    "name": "Portfolio Admin",
    "email": "you@example.com",
    "role": "admin"
  }
}
```

# Actualizar perfil

El usuario autenticado puede modificar su nombre, email y password mediante:

PATCH /api/auth/me

La ruta requiere autenticación mediante JWT.

## Headers

Authorization:

Bearer TU_TOKEN

Content-Type:

application/json

---

## Cambiar nombre

Request:

PATCH /api/auth/me

Body:

```json
{
  "name": "Wilmer Pocaterra"
}

### Usuario autenticado

```http
GET /api/auth/me
Authorization: Bearer JWT
```

### Obtener todos los proyectos

```http
GET /api/projects
```

### Obtener un proyecto

```http
GET /api/projects/:id
```

### Crear proyecto

Ruta protegida.

```http
POST /api/projects
Authorization: Bearer JWT
Content-Type: multipart/form-data
```

Campos de `form-data`:

- `name`
- `description`
- `code`
- `image` (archivo)

Ejemplo de `code`:

```text
https://github.com/usuario/proyecto
```

Cloudinary devuelve la URL pública de la imagen y esa URL queda guardada en `Project.image`.

### Actualizar proyecto

```http
PATCH /api/projects/:id
Authorization: Bearer JWT
Content-Type: multipart/form-data
```

Puedes enviar solamente los campos que quieras modificar.

Si envías una nueva `image`, se sube a Cloudinary y la imagen anterior se elimina.

### Eliminar proyecto

```http
DELETE /api/projects/:id
Authorization: Bearer JWT
```

Al eliminar el proyecto también se intenta eliminar su imagen de Cloudinary.

## Modelo Project

```js
{
  image: String,
  description: String,
  name: String,
  code: String,
  imagePublicId: String,
  createdAt: Date,
  updatedAt: Date
}
```

`imagePublicId` es un campo interno necesario para gestionar la eliminación y sustitución de archivos en Cloudinary. Está oculto en las consultas normales.

## Ejemplo desde React

### Obtener proyectos

```js
const response = await fetch('http://localhost:5000/api/projects')
const projects = await response.json()
```

### Login

```js
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email,
    password,
  }),
})

const data = await response.json()

localStorage.setItem('token', data.token)
```

### Crear proyecto

```js
const formData = new FormData()

formData.append('name', name)
formData.append('description', description)
formData.append('code', code)
formData.append('image', imageFile)

const token = localStorage.getItem('token')

const response = await fetch('http://localhost:5000/api/projects', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
})

const project = await response.json()
```

No agregues manualmente `Content-Type: multipart/form-data`; el navegador genera el boundary automáticamente.

## Nota sobre el token

Para una primera integración con un dashboard React, `localStorage` es sencillo, pero si vas a convertir el panel en una aplicación con mayor exposición pública, considera migrar a una cookie `httpOnly`, `secure` y `sameSite` para reducir el riesgo ante XSS.
