# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

## [1.4.1] - 2026-04-05

### ✨ Unificación y Renombre
- **Mi Plan de Frecuencias**: Se renombró el módulo de "Favoritos" para una mejor identidad del sistema.
- **Sincronización Total**: La tabla de "Mis Frecuencias" ahora es idéntica a la vista General.
- **Favoritos en Privado**: Se habilitó la posibilidad de marcar frecuencias privadas como favoritas.
- **Columnas Sincronizadas**: Todas las tablas ahora muestran Provincia, Ciudad y Estado de forma consistente.

## [1.4.0] - 2026-04-05

### 🎨 Refactorización Estética (UI/UX)
- **Compactación de Interfaz**: Se redujo el padding de celdas y botones para una vista más densa y profesional.
- **Jerarquía de Datos**: La columna **Titular** ahora es la primera y actúa como enlace para editar.
- **Headers Fix**: Los iconos de ordenación (`↕`) ahora se mantienen en la misma línea que el texto.
- **Limpieza Visual**: Se eliminó la columna de acciones; el botón de borrar se movió al modal de edición.

## [1.3.0] - 2026-04-05

### 🔒 Módulo "Mis Frecuencias"
- **Privacidad**: Nueva tabla y lógica para que los usuarios gestionen frecuencias privadas.
- **Flujo de Publicación**: Sistema de solicitudes para convertir frecuencias privadas en públicas vía administrador.
- **Nuevas Columnas**: Integración de `id_usuario_creador` y `es_privada` en la base de datos.

## [1.2.0] - 2025-04-05

### 📥 Importación Masiva
- **Nueva Herramienta**: Se añadió un sistema de importación automática de registros vía archivos CSV para administradores.
- **Mapeo Inteligente**: Se implementó una lógica de comparación flexible para provincias y estados (ignora tildes y mayúsculas).
- **Control de Duplicados**: Prevención de registros duplicados basados en TX, RX y SEÑAL.
- **Panel de Resultados**: Visualización detallada de registros exitosos y descartados con motivos claros.

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
