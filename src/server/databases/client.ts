/* eslint-disable @typescript-eslint/no-explicit-any */
// import { HTTPException } from 'hono/http-exception';
import { sql, SQL } from 'drizzle-orm';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { PgSelect } from 'drizzle-orm/pg-core';
// import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as schemas from './schemas';

const pool = postgres(process.env.DB_URL as string, { idle_timeout: 20000 });

export const db = drizzle(pool, { schema: schemas });

export const poolEnd = () => pool.end();

export const withPagination = async <T extends PgSelect>(query: T, orderBy: SQL, page: number = 1, limit: number = 10) => {
	const subQuery = query.as('subQuery');

	const [results, total] = await Promise.all([
		query
			.limit(limit)
			.offset((page - 1) * limit)
			.orderBy(orderBy),
		db
			.select({ total: sql<number>`count(*)` })
			.from(subQuery as any)
			.then((res: any) => Number(res[0].total)),
	]);

	const pages = Math.ceil(total / limit); // total page

	// add incrementing number (no)
	// const startNo = (page - 1) * limit + 1; // start from last data
	const startNo = total - (page - 1) * limit; // start from first data
	const resultsWithNo = results.map((item, index) => ({
		no: startNo - index,
		...item,
	})) as typeof results & { no: number }[];

	return {
		results: resultsWithNo,
		meta: { page, pages, limit, total },
	};
};

/**
 * ===============
 * CREATE DATABASE
 * ===============
 */
export async function createDatabase({ database }: { database: string }) {
	const pool = postgres({
		host: process.env.DB_HOST || '127.0.0.1',
		port: Number(process.env.DB_PORT) || 5432,
		username: process.env.DB_USERNAME || '',
		password: process.env.DB_PASSWORD || '',
	});

	try {
		// check if db exists first (optional)
		const dbExists = await pool`SELECT 1 FROM pg_database WHERE datname = ${database}`;

		if (dbExists.length === 0) {
			await pool.unsafe(`CREATE DATABASE "${database}"`);
			console.log(`Database ${database} created successfully.`);
		}
	} finally {
		await pool.end();
	}
}
