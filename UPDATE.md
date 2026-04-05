# Guía de Actualización (v1.2.0 -> v1.4.2) 🚀

Esta guía detalla los pasos necesarios para actualizar tu instancia de **Frequency Management System**.

## 📋 Requisitos Previos
- Tener acceso a la terminal en el servidor.
- Realizar un backup del archivo `frecuency.db` antes de comenzar.

---

## 🛠 Paso 1: Actualización de la Base de Datos

Dependiendo de tu versión actual, ejecuta los scripts de migración correspondientes:

### De v1.2.0 a v1.4.1 (Privacidad)
```bash
npm run migrate
```

### De v1.4.1 a v1.4.2 (Soporte Multipaís)
```bash
npm run migrate-v1.4.2
```

> [!NOTE]
> Los scripts detectarán automáticamente si las columnas ya existen, por lo que es seguro ejecutarlos varias veces.

---

## 📂 Paso 2: Actualización de Código

1. Descarga la última versión del repositorio:
   ```bash
   git pull origin main
   ```

2. Instala dependencias (si hay cambios):
   ```bash
   npm install
   ```

3. Reinicia el servicio:
   ```bash
   npm run dev
   ```

---

## 🌟 Resumen de Cambios Mayores
- **v1.3.0**: Módulo de Frecuencias Privadas.
- **v1.4.0**: Rediseño completo de la UI (Titular primero, edición por clic).
- **v1.4.1**: Notificaciones auto-descartables y favoritos para privadas.
- **v1.4.2**: Soporte Multipaís e Internacionalización (50 países con Argentina por defecto).

---
**Frequency Management System** 📡
