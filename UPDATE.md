# Guía de Actualización (v1.2.0 -> v1.4.2) 🚀

Esta guía detalla los pasos necesarios para actualizar tu instancia de **Frequency Management System** a la última versión disponible.

## 📋 Requisitos Previos
- Tener acceso a la terminal en el servidor.
- **IMPORTANTE**: Realiza un backup del archivo `frecuency.db` antes de comenzar.

---

## 🛠 Paso 1: Actualización del Código

1. Descarga la última versión del repositorio:
   ```bash
   git pull origin main
   ```

2. Instala o actualiza las dependencias necesarias:
   ```bash
   npm install
   ```

---

## 📂 Paso 2: Migración de la Base de Datos

Ahora solo necesitas ejecutar un único comando que actualizará tu base de datos desde cualquier versión anterior (v1.2.0, v1.3.0, v1.4.1) a la **v1.4.2**:

```bash
npm run migrate
```

> [!NOTE]
> Este script es **idempotente**, lo que significa que detectará automáticamente qué columnas o tablas ya existen y solo aplicará los cambios necesarios. Es seguro ejecutarlo varias veces.

---

## 🚀 Paso 3: Reinicio del Servicio

Una vez finalizada la migración, reinicia el servidor para aplicar los cambios:

```bash
npm start
```
*(O `npm run dev` si estás en entorno de desarrollo)*.

---

## 🌟 Resumen de Novedades (v1.4.2)
- **Soporte Multipaís**: Ahora puedes asignar un país a cada frecuencia (50 países incluidos).
- **Internacionalización**: Vista de revisiones mejorada para mostrar nombres de países en lugar de IDs.
- **Importación CSV Pro**: Reconocimiento automático de la columna "PAIS" durante la importación masiva.
- **Refactorización Core**: Migraciones consolidadas para facilitar futuras actualizaciones.

---
**Frequency Management System** 📡
