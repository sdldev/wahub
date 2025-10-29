import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsparser,
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        global: "readonly",
        Response: "readonly",
        Request: "readonly",
        fetch: "readonly"
      }
    },
    plugins: {
      "@typescript-eslint": tseslint
    },
    rules: {
      // Disable unused vars checking for development
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",

      // TypeScript recommended rules (relaxed for development)
      "@typescript-eslint/no-explicit-any": "off", // Allow any for development
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-empty-object-type": "off",

      // JavaScript rules
      "prefer-const": "error",
      "no-var": "error",
      "no-async-promise-executor": "warn", // Warn instead of error
      "no-undef": "off" // Allow global types
    }
  },
  {
    ignores: [
      "node_modules/",
      "dist/",
      "*.js",
      "*.d.ts",
      "wa_credentials/",
      "*.log",
      "bun.lockb",
      "*.config.js",
      "*.config.ts"
    ]
  }
];