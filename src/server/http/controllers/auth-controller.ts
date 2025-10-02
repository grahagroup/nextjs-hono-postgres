import { Context, Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { sign } from 'hono/jwt';
import { setSignedCookie, deleteCookie } from 'hono/cookie';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import { db } from '@/server/databases/client';
import { signinRequest } from '@/server/http/requests/auths-request';
import { auth } from '@/server/http/middlewares/auth';
import { UsersTable } from '@/server/databases/schemas';

const app = new Hono()
	.post('/signin', signinRequest, async (c: Context) => {
		const body = await c.req.json();

		const entity = await db.query.UsersTable.findFirst({
			where: eq(UsersTable.email, body.email),
		});

		if (!entity) throw new HTTPException(401, { message: 'An invalid credentials error occurred' });

		const matchPassword = await bcrypt.compare(body.password, entity.password);

		if (!matchPassword) throw new HTTPException(401, { message: 'An invalid credentials error occurred' });

		const payload = {
			exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // expired in 24 hours
			iat: dayjs().unix(), // issued at

			auid: entity.id,
			aurl: 'admin',
			uenv: 'central',
		};

		const token = await sign(payload, process.env.APP_KEY as string);

		const maxAge = 60 * 60 * 24; // 1 day in seconds;

		await setSignedCookie(c, '__x', token, process.env.APP_COOKIE_KEY as string, {
			path: '/',
			secure: true,
			httpOnly: true,
			maxAge,
			sameSite: 'Strict',
		});

		const user = {
			id: entity.id,
			email: entity.email,
			created_at: entity.created_at,
			updated_at: entity.updated_at,
		};

		return c.json({ message: 'OK', data: { user, token, permissions: null } }, 200);
	})
	.get('/profile', auth, async (c: Context) => {
		const payload = c.get('user');

		return c.json({ message: 'OK', data: payload });
	})
	.get('/signout', async (c: Context) => {
		deleteCookie(c, '__x');

		return c.json({ message: 'OK' });
	});

export default app;
