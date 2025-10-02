// import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const signinSchema = z.object({
	email: z.string().min(1, 'Please provide with email!').email(),
	password: z.string().min(1, 'Please provide with password!'),
});

export const signinRequest = zValidator('json', signinSchema, (result) => {
	if (!result.success) {
		throw new HTTPException(400, {
			message: `An invalid request error occurred! [ERROR]: ${JSON.stringify(result.error.stack)}`,
		});
	}
});
