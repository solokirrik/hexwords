import type { INamedColor } from "../types";
import namedColorsJson from "../words/named-colors.json";

const namedColors: INamedColor = namedColorsJson;

// 3, 4, 6 or 8 hex digits, with or without "#".
const isHex = (hex: string) => /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(hex);

// [r, g, b] 0–255, plus alpha 0–255 when the hex has one.
const hexToRgb = (hex: string) => {
    let digits = hex.replace(/^#/, "");
    if (digits.length <= 4) digits = [...digits].map((d) => d + d).join("");
    return digits.match(/../g)!.map((pair) => parseInt(pair, 16));
};

// A typed color, either a CSS color name or a hex code, as "#hex"; null if
// it is neither.
const resolveColor = (input: string) => {
    const named = namedColors[input.toLowerCase()];
    if (named) return named;
    if (!isHex(input)) return null;
    return input.startsWith("#") ? input : `#${input}`;
};

// <input type="color"> only accepts "#rrggbb", so short forms are expanded
// and alpha is dropped.
const toColorInputValue = (hex: string) =>
    "#" +
    hexToRgb(hex)
        .slice(0, 3)
        .map((c) => c.toString(16).padStart(2, "0"))
        .join("");

const srgbToLinear = (c: number) => {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

type Triple = [number, number, number];

// sRGB 0–255 as displayed: alpha colors are composited over white, matching
// how the tiles are rendered.
const blendOverWhite = (hex: string): Triple => {
    const [r, g, b, a] = hexToRgb(hex);
    const alpha = a === undefined ? 1 : a / 255;
    return [r, g, b].map((c) => c * alpha + 255 * (1 - alpha)) as Triple;
};

// Tile background and a readable text color on it: black when the WCAG
// relative luminance is above 0.179, where black gives the better contrast.
const tileColors = (hex: string) => {
    const rgb = blendOverWhite(hex);
    const [r, g, b] = rgb.map(srgbToLinear);
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return {
        background: hex.length === 5 || hex.length === 9 ? `rgb(${rgb.join(", ")})` : hex,
        color: luminance > 0.179 ? "black" : "white",
    };
};

// Returns [L, a, b] in OkLab, on the color as displayed.
const hexToOklab = (hex: string): Triple => {
    const [r, g, b] = blendOverWhite(hex).map(srgbToLinear);
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [
        0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
        1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
        0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
    ];
};

// Returns [L, C, h] in OkLCh.
const oklabToOklch = ([L, A, B]: Triple): Triple => {
    const h = (Math.atan2(B, A) * 180) / Math.PI;
    return [L, Math.hypot(A, B), h < 0 ? h + 360 : h];
};

// Perceptual distance: Euclidean in OkLab.
const oklabDistance = (x: Triple, y: Triple) => Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);

const NEUTRAL_CHROMA = 0.04;

// Upper hue bound (degrees, OkLCh) for each family; anything past the last wraps to "pink".
const HUE_FAMILIES: [string, number][] = [
    ["pink", 10],
    ["red", 45],
    ["orange", 80],
    ["yellow", 120],
    ["green", 175],
    ["cyan", 230],
    ["blue", 280],
    ["violet", 300],
    ["purple", 320],
    ["magenta", 340],
    ["pink", 360],
];

// Dark, moderately saturated warm colors read as brown/olive rather than
// orange/yellow, so they get their own family instead of a hue split.
const BROWN = { minHue: 35, maxHue: 100, maxLightness: 0.66, maxChroma: 0.135 };

const FAMILY_ORDER = ["red", "orange", "yellow", "brown", "green", "cyan", "blue", "violet", "purple", "magenta", "pink", "grey"];

const hueFamily = ([l, c, h]: Triple) => {
    if (c < NEUTRAL_CHROMA) return "grey";
    if (h >= BROWN.minHue && h < BROWN.maxHue && l < BROWN.maxLightness && c < BROWN.maxChroma) return "brown";
    return HUE_FAMILIES.find(([, max]) => h < max)?.[0] ?? "pink";
};

export {
    isHex,
    resolveColor,
    toColorInputValue,
    tileColors,
    hexToOklab,
    oklabToOklch,
    oklabDistance,
    hueFamily,
    FAMILY_ORDER,
};