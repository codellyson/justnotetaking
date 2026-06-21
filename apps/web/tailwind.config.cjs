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
    // <Button>, <Modal>, <ThemeToggle>, etc. survive Tailwind's content
    // scan. Previously pointed at ../../../justui/dist/... which worked
    // only when justui was consumed via `link:`; once we swapped to
    // ^0.2.0 from npm, pnpm hoists it under .pnpm/ and that path went
    // dead. The release tauri-action then bundled CSS with NONE of the
    // utility classes used by ThemeToggle / Button / Modal — the
    // installed binary rendered them unstyled.
    //
    // Both paths below: first for direct dep resolution, second for the
    // monorepo hoisted layout. Whichever resolves wins.
    "./node_modules/@codellyson/justui/dist/**/*.js",
    "../../node_modules/@codellyson/justui/dist/**/*.js",
  ],
};
