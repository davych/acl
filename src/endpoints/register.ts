import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import bcrypt from 'bcryptjs';
import { type AppContext } from "../types";

export class Register extends OpenAPIRoute {
	schema = {
		tags: ["Auth"],
		summary: "User registration",
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							email: z.string().email(),
							password: z.string().min(6).max(100),
							confirmPassword: z.string().min(6).max(100),
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
							success: Bool(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();

		const userCredentials = data.body;
		if (userCredentials.password !== userCredentials.confirmPassword) {
			return c.json({ success: false, error: "Passwords do not match" }, 400);
		}

		const hashedPassword = await bcrypt.hash(userCredentials.password, 10);
		try {
			const id = crypto.randomUUID()
			await c.env.auth_db.prepare(
				"INSERT INTO users (email, password, id) VALUES (?, ?, ?)"
			).bind(userCredentials.email, hashedPassword, id).run();

			return { success: true };
		} catch (e) {
			console.error("Database error:", e);
			return c.json({ success: false, error: "Database error" }, 500);
		}
	}
}
