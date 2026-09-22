const isHex = (hex: string) => /^#?[0-9a-f]{3}[0-9a-f]?$/gi.test(hex) || /^#?[0-9a-f]{6}([0-9a-f]{2})?$/gi.test(hex);

const hexToRgb = (hex: string) => {
    let [, r, rr, g, gg, b, bb, a, aa] = hex;
    if (hex.length < 6) {
        [, r, g, b, a] = hex;
        rr = r;
        gg = g;
        bb = b;
        aa = a;
    }
    const retval = [parseInt(`${r}${rr}`, 16), parseInt(`${g}${gg}`, 16), parseInt(`${b}${bb}`, 16)];
    if (a && aa) {
        retval.push(parseInt(`${a}${aa}`, 16));
    }
    return retval;
};

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
    tileColors,
    hexToOklab,
    oklabToOklch,
    oklabDistance,
    hueFamily,
    FAMILY_ORDER,
};