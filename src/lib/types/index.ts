// A word as stored in words.json.
export interface IWordEntry {
    word: string;
    hex: string;
}

// A word with its tile colors, computed at load time (see tileColors).
export interface IHexWord extends IWordEntry {
    color: string;
    background: string;
}

export interface INamedColor {
    [key: string]: string;
}

type SizeUnits = "em" | "ex" | "%" | "px" | "cm" | "mm" | "in" | "pt" | "pc" | "ch" | "rem" | "vh" | "vw" | "vmin" | "vmax";

export type Size = `${number}${SizeUnits}`;
export interface Snackbar {
    id?: number;
    message: string;
    closable?: boolean;
    timeout?: number;
}
