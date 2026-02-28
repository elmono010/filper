import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

console.log('--- DB CONNECTION TEST ---');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'DEFINED' : 'MISSING');

if (process.env.DATABASE_URL) {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

    console.log('Intentando conectar...');
    pool.connect((err, client, release) => {
        if (err) {
            console.error('❌ ERROR de pg:', err.message);
            process.exit(1);
        }
        console.log('✅ CONEXIÓN EXITOSA con pg pool');
        client.query('SELECT NOW()', (err, res) => {
            release();
            if (err) {
                console.error('❌ ERROR de query:', err.message);
                process.exit(1);
            }
            console.log('✅ QUERY EXITOSA:', res.rows[0]);
            process.exit(0);
        });
    });
} else {
    console.error('No hay DATABASE_URL en el entorno.');
    process.exit(1);
}
