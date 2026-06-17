// Tailwind 4 reads this via `@config "../../tailwind.config.cjs"` in
// src/styles/global.css. The preset maps the justui CSS-variable tokens
// (--bg, --accent, etc.) onto Tailwind utility classes (bg-bg,
// text-accent, etc.) and adds Geist as the default sans/mono family.
const justuiPreset = require("@codellyson/justui/tailwind-preset");

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [justuiPreset],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    // Pull in the JustUI React components so utility classes used inside
    // <Button>, <Modal>, etc. survive Tailwind's content scan.
    "../../../justui/dist/react/**/*.js",
  ],
};
