import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { sign } from '@tsndr/cloudflare-worker-jwt';
import { type AppContext } from "../types";
import bcrypt from "bcryptjs";

export class Login extends OpenAPIRoute {
	schema = {
		tags: ["Auth"],
		summary: "User login",
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							email: z.string().email(),
							password: z.string().min(6).max(100),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Returns the user login token",
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
		const data = await this.getValidatedData<typeof this.schema>();

		const userCredentials = data.body;
		// 验证email 和 password 的正确性
		const user = await c.env.auth_db.prepare(
			"SELECT * FROM users WHERE email = ?"
		).bind(userCredentials.email).first();

		if (
			!user ||
			!(await bcrypt.compare(userCredentials.password, user.password as string))
		) {
			return c.json({ success: false, error: "Invalid email or password" }, 401);
		}

		const secret = "b7f8c2e4a9d1f3e6c5b2a8d4e7f1c3b6a2d9e8f4c1b7a6d3e5f2c8b4a1d6e3f9";

		const token = await sign({
			sub: user.id as string,
			exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15分钟过期
		}, secret);

		return {
			accessToken: token,
		};
	}
}
