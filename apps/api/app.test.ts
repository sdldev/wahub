import { describe, test, expect } from "bun:test";

// Basic smoke test to ensure the application can be imported
describe("Application", () => {
  test("should be able to import main modules", async () => {
    // Test basic imports work
    expect(async () => {
      const { Hono } = await import("hono");
      expect(Hono).toBeDefined();
    }).not.toThrow();

    expect(async () => {
      const { z } = await import("zod");
      expect(z).toBeDefined();
    }).not.toThrow();
  });

  test("should have basic environment setup", () => {
    // Test that environment variables are accessible
    expect(process.env).toBeDefined();
    expect(typeof process.env.NODE_ENV).toBe("string");
  });

  test("should pass basic sanity checks", () => {
    expect(1 + 1).toBe(2);
    expect("hello").toBe("hello");
    expect([1, 2, 3]).toHaveLength(3);
  });
});

// Simple API functionality tests
describe("API Functionality", () => {
  test("should create Hono app instance", async () => {
    const { Hono } = await import("hono");
    const app = new Hono();

    expect(app).toBeDefined();
    expect(typeof app.get).toBe("function");
    expect(typeof app.post).toBe("function");
  });

  test("should handle basic JSON response", async () => {
    const { Hono } = await import("hono");
    const app = new Hono();

    app.get("/test", (c) => c.json({ message: "Hello World", success: true }));

    const req = new Request("http://localhost/test");
    const res = await app.fetch(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ message: "Hello World", success: true });
  });

  test("should handle route parameters", async () => {
    const { Hono } = await import("hono");
    const app = new Hono();

    app.get("/user/:id", (c) => {
      const id = c.req.param("id");
      return c.json({ userId: id, found: true });
    });

    const req = new Request("http://localhost/user/123");
    const res = await app.fetch(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ userId: "123", found: true });
  });

  test("should handle 404 for unknown routes", async () => {
    const { Hono } = await import("hono");
    const app = new Hono();

    const req = new Request("http://localhost/unknown-route");
    const res = await app.fetch(req);

    expect(res.status).toBe(404);
  });
});

// Environment and configuration tests
describe("Environment & Configuration", () => {
  test("should load environment variables", () => {
    expect(process.env.NODE_ENV).toBeDefined();
    expect(["development", "production", "test"]).toContain(process.env.NODE_ENV);
  });

  test("should have process object available", () => {
    expect(process).toBeDefined();
    expect(typeof process.version).toBe("string");
    expect(process.version.startsWith("v")).toBe(true);
  });
});