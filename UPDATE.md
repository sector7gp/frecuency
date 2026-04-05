# Guía de Actualización (v1.2.0 -> v1.4.1) 🚀

Esta guía detalla los pasos necesarios para actualizar tu instancia de **Frequency Management System** desde la versión v1.2.0 a la v1.4.1.

## 📋 Requisitos Previos
- Tener acceso a la terminal en el servidor.
- Realizar un backup del archivo `frecuency.db` antes de comenzar.

---

## 🛠 Paso 1: Actualización de la Base de Datos

En esta actualización se han añadido capacidades de privacidad. Debes ejecutar los siguientes comandos SQL en tu base de datos SQLite:

```sql
-- Añadir columna para el creador de la frecuencia
ALTER TABLE datos ADD COLUMN id_usuario_creador INTEGER REFERENCES usuarios(id);

-- Añadir bandera de privacidad (por defecto 0 = pública)
ALTER TABLE datos ADD COLUMN es_privada BOOLEAN DEFAULT 0;

-- (Opcional) Marcar todos los registros existentes como públicos
UPDATE datos SET es_privada = 0 WHERE es_privada IS NULL;
```

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
