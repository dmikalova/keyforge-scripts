import eslint from "@eslint/js";
import parser from "@typescript-eslint/parser";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["./dist"]),
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      parser,
      globals: {
        window: "readonly",
        document: "readonly",
        chrome: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
    },
  },
]);
