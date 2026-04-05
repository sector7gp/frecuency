const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'frecuency.db');
const db = new Database(dbPath);

console.log('🚀 Iniciando migración de base de datos...');

try {
    // Obtener información de las columnas actuales de la tabla 'datos'
    const tableInfo = db.prepare("PRAGMA table_info(datos)").all();
    const columns = tableInfo.map(col => col.name);

    db.transaction(() => {
        // 1. Añadir id_usuario_creador si no existe
        if (!columns.includes('id_usuario_creador')) {
            console.log('➕ Añadiendo columna: id_usuario_creador');
            db.prepare('ALTER TABLE datos ADD COLUMN id_usuario_creador INTEGER REFERENCES usuarios(id)').run();
        } else {
            console.log('✅ La columna id_usuario_creador ya existe.');
        }

        // 2. Añadir es_privada si no existe
        if (!columns.includes('es_privada')) {
            console.log('➕ Añadiendo columna: es_privada');
            db.prepare('ALTER TABLE datos ADD COLUMN es_privada BOOLEAN DEFAULT 0').run();
            
            // Asegurar que los datos existentes sean públicos
            db.prepare('UPDATE datos SET es_privada = 0 WHERE es_privada IS NULL').run();
        } else {
            console.log('✅ La columna es_privada ya existe.');
        }
    })();

    console.log('✨ Migración finalizada con éxito.');
} catch (error) {
    console.error('❌ Error durante la migración:');
    console.error(error.message);
    process.exit(1);
} finally {
    db.close();
}
