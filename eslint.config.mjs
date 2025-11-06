import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "src/generated/**",
    ],
  },
  {
    rules: {
      // Disable unused variable warnings
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "warn", // Keep as warning, not error
      "react/no-unescaped-entities": "warn", // Keep as warning, not error
      "@typescript-eslint/ban-ts-comment": "warn", // Keep as warning, not error
      "@typescript-eslint/no-require-imports": "off", // Allow require() in generated files
      "@typescript-eslint/no-this-alias": "off", // Allow this aliasing
      "@typescript-eslint/no-unused-expressions": "off", // Allow unused expressions
    },
  },
];

export default eslintConfig;
