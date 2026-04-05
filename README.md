# Frecuency Management System - v1.0.0

## [1.0.0] - 2025-04-05

Sistema de gestión de frecuencias de radio con control de versiones, sugerencias de usuarios, aprobación administrativa y gestión de favoritos personalizados.

## 🚀 Características
- **Multi-usuario y Roles**: Admins y Usuarios con permisos diferenciados.
- **Flujo de Trabajo (Sugerencias)**: Los usuarios proponen cambios que deben ser validados por un administrador.
- **Diff View**: Los administradores ven qué campos han cambiado exactamente antes de aprobar.
- **Favoritos con Memoria Personal**: Cada usuario puede guardar sus frecuencias favoritas y asignarles un número de memoria propio.
- **Administración de Usuarios (ABM)**: Panel para gestionar las cuentas del sistema.
- **Interfaz Moderna**: Diseño con efecto de cristal (glassmorphism) y modo oscuro optimizado.

---

## 🛠 Instalación

Sigue estos pasos para poner en marcha el sistema por primera vez:

### 1. Requisitos
- **Node.js** (v14.x o superior recomendado)
- **NPM** (incluido con Node.js)

### 2. Clonar el repositorio e instalar dependencias
Abre tu terminal en la carpeta del proyecto y ejecuta:
```bash
npm install
```

### 3. Iniciar el servidor
Para producción u uso normal:
```bash
npm start
```

Para desarrollo con auto-recarga (usa nodemon):
```bash
npm run dev
```

El sistema estará disponible en: [http://localhost:3003](http://localhost:3003)

---

## 📖 Manual de Primer Uso

Al iniciar el servidor por primera vez, el sistema creará automáticamente una base de datos local `frecuency.db` con dos usuarios predeterminados:

### Credenciales por defecto:
- **Administrador**:
  - Usuario: `admin`
  - Contraseña: `admin123`
- **Usuario Regular**:
  - Usuario: `usuario`
  - Contraseña: `user123`

### Pasos iniciales recomendados:
1.  **Entra como Administrador** (`admin` / `admin123`).
2.  Ve a la pestaña **Usuarios** y crea tu propia cuenta de administrador personal.
3.  Elimina o cambia la contraseña del usuario `admin` por defecto por seguridad.
4.  Comienza a cargar o sugerir frecuencias desde la pestaña **General**.

---

## 🏗 Estructura del Proyecto
- `server.js`: Lógica del servidor Express y rutas API.
- `database.js`: Configuración de SQLite3 y esquema de tablas.
- `views/`: Plantillas EJS para el frontend.
- `public/`: Archivos estáticos (CSS, imágenes).
- `frecuency.db`: Archivo de base de datos (se genera automáticamente).

---

## 🛡 Seguridad y Datos Sensibles
Para publicar este código en un repositorio público:
- El archivo `frecuency.db` **no debe subirse** si contiene datos reales. Está incluido en el `.gitignore` por defecto.
- Al clonar el repo, el sistema generará una base de datos limpia con los usuarios maestros definidos en `database.js`.

---

© 2025 Desarrollado por **sector7gp** | [GitHub Repository](https://github.com/sector7gp/frecuency)
