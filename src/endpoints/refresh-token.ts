import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { sign, verify, decode } from '@tsndr/cloudflare-worker-jwt';
import { type AppContext } from "../types";
import bcrypt from "bcryptjs";
import { he } from "zod/v4/locales";

export class RefreshToken extends OpenAPIRoute {
	schema = {
		tags: ["Auth"],
		summary: "User refresh token",
		   security: [
        {
            BearerAuth: [],
        },
    ],
		responses: {
			"200": {
				description: "Successful refresh, returns new access token.",
				content: {
					"application/json": {
						schema: z.object({
							accessToken: z.string(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		// get authorization from header
		const authHeader = c.req.header("authorization");
		if (!authHeader) {
			return c.json({ error: "Authorization header missing" }, 401);
		}
		const oldToken = authHeader.split(" ")[1];
		if (!oldToken) {
			return c.json({ error: "Invalid authorization header" }, 401);
		}

		const secret = "b7f8c2e4a9d1f3e6c5b2a8d4e7f1c3b6a2d9e8f4c1b7a6d3e5f2c8b4a1d6e3f9";
		// verify
		const isValid = await verify(oldToken, secret);
		if (!isValid) {
			return c.json({ error: "Invalid or expired token" }, 401);
		}
		// decode old token using secret
		const res = await decode(oldToken);
		const uid = res?.payload?.sub;
		if (!uid) {
			return c.json({ error: "Invalid token payload" }, 401);
		}
		const newToken = await sign({
			sub: uid,
			exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15分钟过期
		}, secret);
		return {
			accessToken: newToken,
		};
	}
}
