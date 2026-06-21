// Tailwind 4 reads this via `@config "../tailwind.config.cjs"` in
// src/styles/global.css. Same shape as apps/web's config.
const justuiPreset = require("@codellyson/justui/tailwind-preset");

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [justuiPreset],
  content: [
    "./src/**/*.{astro,html,ts,tsx}",
    // Astro components from justui. See apps/web's config for the
    // history on why the `../../../justui/...` paths no longer work.
    "./node_modules/@codellyson/justui/src/astro/**/*.astro",
    "../../node_modules/@codellyson/justui/src/astro/**/*.astro",
  ],
};
