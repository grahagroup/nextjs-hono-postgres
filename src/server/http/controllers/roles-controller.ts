import { Context, Hono } from 'hono';
import { auth } from '@/server/http/middlewares';

const app = new Hono()
	.use('*', auth)
	.post('/', async (c: Context) => {
		const body = await c.req.json();

		return c.json({ message: 'OK' });
	})
	.get('/', async (c: Context) => {
		return c.json({ message: 'OK' });
	})
	.put('/:id', async (c: Context) => {
		const id = c.req.param('id');
		const body = await c.req.json();

		return c.json({ message: 'OK' });
	})
	.delete('/:id', async (c: Context) => {
		const id = c.req.param('id');
		const body = await c.req.json();

		return c.json({ message: 'OK' });
	});

export default app;
