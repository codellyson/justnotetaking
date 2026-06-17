export type Note = {
  id: string;
  x: number;
  y: number;
  t: number;
  text: string;
};

export type Recency = "fresh" | "recent" | "older" | "ancient";

export const GRID = 28;
export const WARM_MS = 2 * 60 * 1000;
export const INK_MS = 1000;

/**
 * Maps a note's `t` (last-touched timestamp) to one of four recency
 * buckets. Used to derive paper opacity + the recency-key legend in
 * Chrome. The thresholds (6h / 48h / 14d) are tuned for the canvas
 * vibe — "fresh" should still feel warm hours later, "ancient" should
 * feel like archive.
 */
export function recencyOf(ms: number): Recency {
  const h = (Date.now() - ms) / 3.6e6;
  if (h < 6) return "fresh";
  if (h < 48) return "recent";
  if (h < 24 * 14) return "older";
  return "ancient";
}

/**
 * Opacity multiplier per recency bucket. The base note style uses the
 * theme's bg-secondary token; multiplying by this number is what gives
 * older notes the faded-paper feeling without needing per-theme color
 * tables. The values are tuned against dark themes — light themes get
 * close-to-correct because the canvas bg behind them is also light.
 */
export const RECENCY_ALPHA: Record<Recency, number> = {
  fresh: 1.0,
  recent: 0.92,
  older: 0.78,
  ancient: 0.55,
};

export const uid = () => Math.random().toString(36).slice(2, 10);

export const firstNonEmpty = (s: string) => {
  for (const line of s.split("\n")) if (line.trim()) return line;
  return "";
};

export const restAfterFirst = (s: string) => {
  const lines = s.split("\n");
  let i = 0;
  while (i < lines.length && !lines[i].trim()) i++;
  return lines.slice(i + 1).join("\n").replace(/^\n+/, "");
};

export type Tweaks = {
  grid: "dots" | "lines" | "off";
  radius: number;
  glow: boolean;
  noteWidth: number;
  showRecencyKey: boolean;
  snap: boolean;
  editMode: "in place" | "focused";
  ink: boolean;
  warmTrail: boolean;
  paperAge: boolean;
  compass: boolean;
};

export const TWEAK_DEFAULTS: Tweaks = {
  grid: "dots",
  radius: 6,
  glow: true,
  noteWidth: 220,
  showRecencyKey: false,
  snap: true,
  editMode: "in place",
  ink: true,
  warmTrail: true,
  paperAge: true,
  compass: true,
};

const NOW = Date.now();
const HOUR = 3.6e6;
const DAY = 24 * HOUR;

export const SEED: Omit<Note, "id">[] = [
  { x: -340, y: -180, t: NOW - 0.3 * HOUR, text: "the answer is that capture is the problem.\nnot organization." },
  { x:   20, y: -260, t: NOW - 1.5 * HOUR, text: "call mom\nthursday after 6" },
  { x:  300, y: -200, t: NOW - 3   * HOUR, text: "# groceries\n- oat milk\n- eggs\n- rye bread\n- clementines" },
  { x: -480, y:   30, t: NOW - 8   * HOUR, text: "ship date moved to the 14th\nemail eli, push the design review one week" },
  { x: -140, y:   60, t: NOW - 14  * HOUR, text: "if folders are the answer, **search** is broken" },
  { x:  210, y:   40, t: NOW - 26  * HOUR, text: "tuesday 11:30 — coffee w/ priya\nbluestone lane on greenwich\nhttps://maps.app.goo.gl/x" },
  { x:  500, y:    0, t: NOW - 1.8 * DAY,  text: "# book idea\na week with no calendar. you only get the next 30 minutes." },
  { x: -380, y:  240, t: NOW - 3.5 * DAY,  text: "rent due fri\nremember the parking permit" },
  { x:  -70, y:  280, t: NOW - 5   * DAY,  text: "rewatch tampopo. the food in it." },
  { x:  240, y:  260, t: NOW - 9   * DAY,  text: "dentist moved to thu 3:30\nthe new place on 6th" },
  { x:  540, y:  220, t: NOW - 16  * DAY,  text: "the second album is always the production. nobody remembers the songs." },
  { x: -620, y:  340, t: NOW - 20  * DAY,  text: "# interview prep — staff PM, fintech\n- the story: shipped X, learned Y, moved Z.\n- frame everything as a tradeoff, never a win.\n- questions to ask them: what's the last thing the team killed? who decided? what would have to be true for this product to exist in 5 years?\n- practice the comp number out loud. don't flinch." },
  { x: -240, y:  460, t: NOW - 28  * DAY,  text: "library card expires aug" },
  { x:  140, y:  470, t: NOW - 45  * DAY,  text: "passport. renew before sept. one photo left in the drawer." },
  { x:  460, y:  440, t: NOW - 78  * DAY,  text: "address for the cabin\n412 spruce, hwy 50 mile 8" },
];
