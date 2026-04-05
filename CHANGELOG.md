# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

## [1.1.0] - 2025-04-05

### 🚀 Mejoras de UX y UI
- **Ordenamiento de Tablas**: Se añadió la funcionalidad de ordenar (Sort) todas las tablas al hacer clic en los encabezados.
- **Simplificación General**: Se eliminó la columna **MEM** de la vista principal y los formularios globales. Ahora la memoria es un campo **exclusivamente personal** dentro de la lista de favoritos.
- **Indicadores Visuales**: Se añadieron símbolos de ordenamiento (↕) y cursores interactivos en las tablas.

## [1.0.0] - 2024-04-05

### ✨ Funcionalidades Principales
- **Autenticación y Roles**: Sistema de inicio de sesión con roles diferenciados (Administrador y Usuario).
- **Gestión de Frecuencias (ABM)**: 
    - Vista general de frecuencias con estados y provincias.
    - Sistema de sugerencias: Los usuarios proponen cambios y los administradores los aprueban.
    - Comparación visual (Diff View) para administradores al revisar cambios.
- **Favoritos Personalizados**:
    - Cada usuario puede guardar sus frecuencias favoritas.
    - Opción de asignar un número de memoria personal para cada favorito.
- **Administración de Usuarios**: Panel completo para crear, editar y eliminar cuentas de usuario.
- **Notificaciones**: Sistema de alertas para informar a los usuarios sobre el estado de sus solicitudes.

### 🎨 Interfaz y UX
- Diseño moderno con estética "Glassmorphism" y modo oscuro.
- Dashboard organizado por pestañas dinámicas.
- Modales optimizados y compactos para edición de datos.
- Feedback visual mediante alertas y badges de colores.

### 🛠 Técnico
- Backend: Node.js + Express.
- Base de Datos: SQLite (Better-SQLite3) con inicialización automática.
- Seguridad: Encriptación de contraseñas con bcryptjs.
- Frontend: EJS + Vanilla CSS (Custom Properties).
