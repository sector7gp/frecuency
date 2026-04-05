const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'frecuency.db');
const db = new Database(dbPath);

console.log('🚀 Iniciando migración v1.4.2 (Soporte Multipaís)...');

try {
    db.transaction(() => {
        // 1. Crear tabla de países
        db.prepare(`
            CREATE TABLE IF NOT EXISTS paises (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                codigo_iso TEXT -- Opcional, para futuros iconos de banderas
            )
        `).run();

        // 2. Poblar países (Priorizando Argentina y Cono Sur)
        const insertPais = db.prepare('INSERT OR IGNORE INTO paises (id, nombre, codigo_iso) VALUES (?, ?, ?)');
        const paises = [
            [1, 'Argentina', 'AR'],
            [2, 'Brasil', 'BR'],
            [3, 'Chile', 'CL'],
            [4, 'Uruguay', 'UY'],
            [5, 'Paraguay', 'PY'],
            [6, 'Bolivia', 'BO'],
            [7, 'Perú', 'PE'],
            [8, 'Colombia', 'CO'],
            [9, 'Ecuador', 'EC'],
            [10, 'Venezuela', 'VE'],
            [11, 'México', 'MX'],
            [12, 'España', 'ES'],
            [13, 'Estados Unidos', 'US'],
            [14, 'Canadá', 'CA'],
            [15, 'Panamá', 'PA'],
            [16, 'Costa Rica', 'CR'],
            [17, 'Guatemala', 'GT'],
            [18, 'Honduras', 'HN'],
            [19, 'El Salvador', 'SV'],
            [20, 'Nicaragua', 'NI'],
            [21, 'Cuba', 'CU'],
            [22, 'República Dominicana', 'DO'],
            [23, 'Puerto Rico', 'PR'],
            [24, 'Reino Unido', 'GB'],
            [25, 'Alemania', 'DE'],
            [26, 'Francia', 'FR'],
            [27, 'Italia', 'IT'],
            [28, 'Portugal', 'PT'],
            [29, 'Suiza', 'CH'],
            [30, 'Países Bajos', 'NL'],
            [31, 'Bélgica', 'BE'],
            [32, 'China', 'CN'],
            [33, 'Japón', 'JP'],
            [34, 'Corea del Sur', 'KR'],
            [35, 'Australia', 'AU'],
            [36, 'Nueva Zelanda', 'NZ'],
            [37, 'Sudáfrica', 'ZA'],
            [38, 'Israel', 'IL'],
            [39, 'Rusia', 'RU'],
            [40, 'India', 'IN'],
            [41, 'Jamaica', 'JM'],
            [42, 'Trinidad y Tobago', 'TT'],
            [43, 'Guyana', 'GY'],
            [44, 'Surinam', 'SR'],
            [45, 'Belice', 'BZ'],
            [46, 'Andorra', 'AD'],
            [47, 'Luxemburgo', 'LU'],
            [48, 'Suecia', 'SE'],
            [49, 'Noruega', 'NO'],
            [50, 'Dinamarca', 'DK']
        ];

        for (const [id, nombre, iso] of paises) {
            insertPais.run(id, nombre, iso);
        }

        // 3. Añadir columna id_pais a la tabla 'datos' si no existe
        const tableInfo = db.prepare("PRAGMA table_info(datos)").all();
        const columns = tableInfo.map(col => col.name);

        if (!columns.includes('id_pais')) {
            console.log('➕ Añadiendo columna: id_pais');
            db.prepare('ALTER TABLE datos ADD COLUMN id_pais INTEGER REFERENCES paises(id)').run();
            
            // 4. Setear Argentina (ID: 1) por defecto a los registros existentes
            console.log('🇦🇷 Actualizando registros existentes a Argentina...');
            db.prepare('UPDATE datos SET id_pais = 1 WHERE id_pais IS NULL').run();
        } else {
            console.log('✅ La columna id_pais ya existe.');
        }
    })();

    console.log('✨ Migración v1.4.2 finalizada con éxito.');
} catch (error) {
    console.error('❌ Error durante la migración:');
    console.error(error.message);
    process.exit(1);
} finally {
    db.close();
}
