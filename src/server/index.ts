/* eslint-disable @typescript-eslint/no-unused-vars */
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { handle } from 'hono/vercel';
import * as routers from '@/server/http';

const app = new Hono()
	.basePath('/api')
	.use(
		cors({
			origin: process.env.APP_URL as string,
			allowMethods: ['GET', 'POST', 'PUT', 'OPTION', 'DELETE'],
			credentials: true,
		}),
	)
	.onError((err, c) => {
		console.error('[ERR]: ', err);
		if (err instanceof HTTPException) {
			return c.json(
				{
					message: err.message,
					data: null,
					errors: {
						name: 'Request Error',
						type: 'HTTPException',
					},
				},
				err.status,
			);
		} else {
			return c.json(
				{
					message: 'An unexpected error occurred.',
					data: null,
					errors: {
						name: 'Server Error',
						type: 'UnknownError',
					},
				},
				500,
			);
		}
	});

// Main Routes v1.0
const appRouter = app.basePath('/v1').route('/auths', routers.auths).route('/roles', routers.roles);

// The handler Next.js uses to answer API requests
export const httpHandler = handle(app);

/**
 * (Optional)
 * Exporting our API here for easy deployment
 *
 * Run `npm run deploy` for one-click API deployment to Cloudflare's edge network
 */
export default app;

// export type definition of API
export type AppType = typeof appRouter;
