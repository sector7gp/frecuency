# Guía de Actualización (v1.2.0 -> v1.4.1) 🚀

Esta guía detalla los pasos necesarios para actualizar tu instancia de **Frequency Management System** desde la versión v1.2.0 a la v1.4.1.

## 📋 Requisitos Previos
- Tener acceso a la terminal en el servidor.
- Realizar un backup del archivo `frecuency.db` antes de comenzar.

---

## 🛠 Paso 1: Actualización de la Base de Datos

En esta actualización se han añadido capacidades de privacidad. Se ha incluido un script automático para realizar la migración de forma segura:

```bash
# Ejecutar migración automática
npm run migrate
```

Este script detectará si las columnas `id_usuario_creador` y `es_privada` ya existen y las añadirá solo si es necesario.

---

## 📂 Paso 2: Actualización de Código

1. Descarga la última versión del repositorio:
   ```bash
   git pull origin main
   ```

2. Instala cualquier dependencia nueva (si aplica):
   ```bash
   npm install
   ```

3. Reinicia el servicio:
   ```bash
   npm run dev  # O el comando que uses para producción
   ```

---

## 🌟 Resumen de Cambios Mayores
- **v1.3.0**: Módulo de Frecuencias Privadas e inicio de gestión personal.
- **v1.4.0**: Rediseño completo de la UI (tablas compactas, titular primero, edición por clic).
- **v1.4.1**: Notificaciones auto-descartables, soporte de favoritos para privadas y renombre a "Mi Plan de Frecuencias".

---
**Frequency management System** 📡
