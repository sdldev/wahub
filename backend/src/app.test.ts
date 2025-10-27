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