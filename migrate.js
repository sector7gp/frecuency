const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'frecuency.db');
const db = new Database(dbPath);

console.log('🚀 Iniciando script de migración consolidado (v1.2.0 -> v1.4.2)...');

try {
    // 1. Obtener información de las columnas actuales de la tabla 'datos' para v1.3.0 y v1.4.2
    const tableInfo = db.prepare("PRAGMA table_info(datos)").all();
    const columns = tableInfo.map(col => col.name);

    db.transaction(() => {
        // --- MIGRACIÓN v1.3.0 (Privacidad) ---
        
        // Añadir id_usuario_creador si no existe
        if (!columns.includes('id_usuario_creador')) {
            console.log('➕ [v1.3.0] Añadiendo columna: id_usuario_creador');
            db.prepare('ALTER TABLE datos ADD COLUMN id_usuario_creador INTEGER REFERENCES usuarios(id)').run();
        }

        // Añadir es_privada si no existe
        if (!columns.includes('es_privada')) {
            console.log('➕ [v1.3.0] Añadiendo columna: es_privada');
            db.prepare('ALTER TABLE datos ADD COLUMN es_privada INTEGER DEFAULT 0').run();
            // Asegurar que los datos existentes sean públicos
            db.prepare('UPDATE datos SET es_privada = 0 WHERE es_privada IS NULL').run();
        }

        // --- MIGRACIÓN v1.4.2 (Soporte Multipaís) ---

        // Crear tabla de países si no existe
        db.prepare(`
            CREATE TABLE IF NOT EXISTS paises (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                codigo_iso TEXT
            )
        `).run();

        // Poblar países (Priorizando Argentina y Cono Sur)
        const insertPais = db.prepare('INSERT OR IGNORE INTO paises (id, nombre, codigo_iso) VALUES (?, ?, ?)');
        const paisesData = [
            [1, 'Argentina', 'AR'], [2, 'Brasil', 'BR'], [3, 'Chile', 'CL'], [4, 'Uruguay', 'UY'], [5, 'Paraguay', 'PY'],
            [6, 'Bolivia', 'BO'], [7, 'Perú', 'PE'], [8, 'Colombia', 'CO'], [9, 'Ecuador', 'EC'], [10, 'Venezuela', 'VE'],
            [11, 'México', 'MX'], [12, 'España', 'ES'], [13, 'Estados Unidos', 'US'], [14, 'Canadá', 'CA'], [15, 'Panamá', 'PA'],
            [16, 'Costa Rica', 'CR'], [17, 'Guatemala', 'GT'], [18, 'Honduras', 'HN'], [19, 'El Salvador', 'SV'], [20, 'Nicaragua', 'NI'],
            [21, 'Cuba', 'CU'], [22, 'República Dominicana', 'DO'], [23, 'Puerto Rico', 'PR'], [24, 'Reino Unido', 'GB'], [25, 'Alemania', 'DE'],
            [26, 'Francia', 'FR'], [27, 'Italia', 'IT'], [28, 'Portugal', 'PT'], [29, 'Suiza', 'CH'], [30, 'Países Bajos', 'NL'],
            [31, 'Bélgica', 'BE'], [32, 'China', 'CN'], [33, 'Japón', 'JP'], [34, 'Corea del Sur', 'KR'], [35, 'Australia', 'AU'],
            [36, 'Nueva Zelanda', 'NZ'], [37, 'Sudáfrica', 'ZA'], [38, 'Israel', 'IL'], [39, 'Rusia', 'RU'], [40, 'India', 'IN'],
            [41, 'Jamaica', 'JM'], [42, 'Trinidad y Tobago', 'TT'], [43, 'Guyana', 'GY'], [44, 'Surinam', 'SR'], [45, 'Belice', 'BZ'],
            [46, 'Andorra', 'AD'], [47, 'Luxemburgo', 'LU'], [48, 'Suecia', 'SE'], [49, 'Noruega', 'NO'], [50, 'Dinamarca', 'DK']
        ];

        for (const row of paisesData) {
            insertPais.run(...row);
        }

        // Añadir columna id_pais a la tabla 'datos' si no existe
        if (!columns.includes('id_pais')) {
            console.log('➕ [v1.4.2] Añadiendo columna: id_pais');
            db.prepare('ALTER TABLE datos ADD COLUMN id_pais INTEGER REFERENCES paises(id)').run();
            // Setear Argentina (ID: 1) por defecto a los registros existentes
            db.prepare('UPDATE datos SET id_pais = 1 WHERE id_pais IS NULL').run();
        }
    })();

    console.log('✨ Migración finalizada con éxito. Tu sistema está actualizado a la v1.4.2.');
} catch (error) {
    console.error('❌ Error durante la migración:');
    console.error(error.message);
    process.exit(1);
} finally {
    db.close();
}
