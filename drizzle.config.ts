import { loadEnvConfig } from '@next/env';
import { defineConfig } from 'drizzle-kit';

loadEnvConfig(process.cwd());

export default defineConfig({
	schema: './src/server/databases/schemas',
	out: './src/server/databases/migrations',
	// driver: '',
	dialect: 'postgresql',
	// dbCredentials: {
	// 	url: process.env.DB_URL as string,
	// },
	verbose: true,
	strict: true,
});
