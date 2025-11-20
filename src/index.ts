import { fromHono } from "chanfana";
import { Hono } from "hono";
// import { sign } from '@tsndr/cloudflare-worker-jwt';
// import bcrypt from 'bcryptjs';
import { Login } from "./endpoints/login";
import { Register } from "./endpoints/register";

const app = new Hono<{ Bindings: Env }>();

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/",
});


openapi.post("/api/login", Login);
openapi.post("/api/register", Register);

// Register OpenAPI endpoints
// openapi.get("/api/tasks", TaskList);
// openapi.post("/api/tasks", TaskCreate);
// openapi.get("/api/tasks/:taskSlug", TaskFetch);
// openapi.delete("/api/tasks/:taskSlug", TaskDelete);

// You may also register routes for non OpenAPI directly on Hono
// app.get('/test', (c) => c.text('Hono!'))

// Export the Hono app
export default app;
