import { loadEnvConfig } from '@next/env';
import * as schema from './schemas';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

loadEnvConfig(process.cwd());

const pool = postgres(process.env.DB_URL as string, { max: 1 });

const db = drizzle(pool);

export async function seed() {
	console.log('Start seeding..');

	const roles = await db
		.insert(schema.RolesTable)
		.values([{ title: 'admin' }, { title: 'customer-service' }])
		.onConflictDoNothing()
		.returning();

	console.log('roles: ', roles);

	await db.transaction(async (tx) => {
		const [user] = await tx
			.insert(schema.UsersTable)
			.values({
				email: 'gundala@gmail.com',
				password: bcrypt.hashSync('password', 10),
			})
			.onConflictDoNothing()
			.returning();

		const [role] = await tx.select().from(schema.RolesTable).where(eq(schema.RolesTable.title, 'admin')).limit(1);

		await tx
			.insert(schema.RoleUserTable)
			.values({
				role_id: role.id,
				user_id: user.id,
			})
			.onConflictDoNothing();

		console.log('user: ', user);
	});

	console.log('Seeding complete!');
	process.exit(0);
}

seed();
