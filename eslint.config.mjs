import { dirname } from "path"
import { fileURLToPath } from "url"
import { FlatCompat } from "@eslint/eslintrc"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      prettier: (await import("eslint-plugin-prettier")).default,
    },
    rules: {
      "prettier/prettier": ["error", { semi: false }],
      semi: ["error", "never"],
      // Disable problematic rules for development
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react/no-unescaped-entities": "warn",
      "prefer-const": "warn",
      // Allow unused imports and variables during development
      "no-unused-vars": "off",
      // Disable these rules completely for easier development
      "@typescript-eslint/no-unused-imports": "off",
    },
  },
]

export default eslintConfig
