import { fromHono } from "chanfana";
import { Hono } from "hono";
// import { sign } from '@tsndr/cloudflare-worker-jwt';
// import bcrypt from 'bcryptjs';
import { Login } from "./endpoints/login";
import { Register } from "./endpoints/register";
import { RefreshToken } from "./endpoints/refresh-token";

const app = new Hono<{ Bindings: Env }>();

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/",
	   schema: {
        info: {
            title: "Auth API",
            version: "1.0.0",
        },
    },
});
openapi.registry.registerComponent("securitySchemes", "BearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
});

openapi.post("/api/login", Login);
openapi.post("/api/register", Register);

openapi.get("/api/refresh-token", RefreshToken);


app.get('/health', (c) => c.text('ok'))

// Export the Hono app
export default app;
