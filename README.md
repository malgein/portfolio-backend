# Portfolio Backend

API REST para gestionar proyectos personales de mi portafolio.

## Tecnologías

- Node.js
- Express
- MongoDB + Mongoose
- JWT
- bcryptjs
- Cloudinary
- Multer
- CORS

## Versión de Node.js

Este proyecto requiere Node.js 20.x. En Render, configura el servicio para usar Node 20.

Para desplegar en Render, configura **Build Command** como `npm ci` y **Start Command** como `npm start`. Mantén `package-lock.json` versionado; `npm ci` instala exactamente las dependencias fijadas en ese archivo y falla si no coincide con `package.json`.

En **Environment** del servicio Render, configura `CLIENT_URL` con el origen público del frontend, por ejemplo `https://mi-portfolio.vercel.app` (sin ruta ni barra final). Si el frontend tiene más de un dominio válido, sepáralos con comas, por ejemplo `https://mi-portfolio.vercel.app,https://www.mi-portfolio.com`. `CLIENT_URL` no debe ser la URL del backend salvo que el navegador cargue el frontend desde ese mismo dominio. Después de guardar la variable, vuelve a desplegar el servicio. Si falta, la API solo permite `http://localhost:3000`.

Un origen no permitido devuelve HTTP 403 con `Origin not allowed by CORS`; esto indica una discrepancia en `CLIENT_URL`, no un fallo al iniciar el servidor ni al conectar MongoDB.

`GET /api/health` comprueba también que MongoDB responda a un ping. Devuelve HTTP 200 cuando está disponible y HTTP 503 cuando no lo está.

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

Al crear un proyecto, `name`, `description`, `code`, `url` y el archivo `image` son obligatorios. `url` debe ser una cadena no vacía; si falta, la API responde HTTP 400 antes de subir la imagen a Cloudinary.

Genera un `JWT_SECRET` largo y aleatorio. No subas `.env` a GitHub.

`JWT_SECRET` debe tener al menos 64 bytes y ser criptográficamente aleatorio. Genera uno con `node -e "console.log(require('node:crypto').randomBytes(64).toString('base64url'))"`. El servidor rechaza secretos cortos o claramente predecibles. Se ha generado un secreto local de producción en `.env.production`, excluido de Git; copia su valor a la variable `JWT_SECRET` del servicio Render y no lo compartas ni lo reutilices en otros entornos.

El endpoint `POST /api/auth/login` permite hasta 10 intentos fallidos por IP cada 15 minutos. Los inicios de sesión correctos no cuentan para el límite.

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
- `url` 


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
