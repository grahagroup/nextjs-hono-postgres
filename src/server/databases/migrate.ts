import { loadEnvConfig } from '@next/env';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
// central
import { createDatabase } from '@/server/databases/client';

loadEnvConfig(process.cwd());

// migrate(db, { migrationsFolder: './src/server/databases/migrations' });

async function main() {
	await createDatabase({ database: process.env.DB_DATABASE as string });

	const pool = postgres(process.env.DB_URL as string, { max: 1 });

	const db = drizzle(pool);

	await migrate(db, {
		migrationsFolder: './src/server/databases/migrations',
	});
	await pool.end();

	console.info('Migrations complete!');
	process.exit(); // default success
}

main().catch((e) => {
	console.error(e);
	process.exit(1); // 1 indicates error
});
