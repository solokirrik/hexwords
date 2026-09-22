<script lang="ts">
    import type { INamedColor } from "../types";
    import namedColorsJson from "$lib/words/named-colors.json";
    import type { IHexWord } from "../types";
    import { snacks } from "../stores/snackstores";
    import {
        FAMILY_ORDER,
        hexToOklab,
        hueFamily,
        isHex,
        oklabDistance,
        oklabToOklch,
    } from "../utils";
    export let words: IHexWord[];
    export let query: string = "";
    export let alpha: boolean;
    export let queryColor: string;
    export let groupByHue: boolean = true;
    export let tileWidth: number = 8;
    export let onselect: (word: IHexWord) => void = () => {};

    interface IColored {
        word: IHexWord;
        lab: [number, number, number];
        family: string;
        lightness: number;
        chroma: number;
        hue: number;
    }
    interface IGroup {
        name: string;
        words: IHexWord[];
    }

    const namedColors: INamedColor = namedColorsJson;
    const PROXIMITY_LIMIT = 60;
    const remPx = parseFloat(
        getComputedStyle(document.documentElement).fontSize
    );

    const pick = (word: IHexWord) => {
        onselect(word);
        navigator?.clipboard?.writeText(word.hex).then(() =>
            snacks.addSnack({
                message: `Color ${word.hex} copied to clipboard`,
                timeout: 5000,
                closable: true,
            })
        );
    };

    // Color data for every word, computed once per word list.
    $: colors = words.map((word): IColored => {
        const lab = hexToOklab(word.hex);
        const lch = oklabToOklch(lab);
        return {
            word,
            lab,
            family: hueFamily(lch),
            lightness: lch[0],
            chroma: lch[1],
            hue: lch[2],
        };
    });

    // Hue families, each sorted light to dark.
    $: hueGroups = FAMILY_ORDER.map((name) => ({
        name,
        colors: colors
            .filter((c) => c.family === name)
            .sort((a, b) => b.lightness - a.lightness),
    })).filter((group) => group.colors.length > 0);

    $: isVisible = (word: IHexWord) =>
        ((word.word.length !== 8 && word.word.length !== 4) || alpha) &&
        word.word.toLowerCase().includes(query.toLowerCase());

    $: queryColorFinal =
        namedColors[queryColor.toLowerCase()] ??
        (queryColor.charAt(0) === "#" ? queryColor : `#${queryColor}`);
    $: byProximity =
        !!queryColor &&
        (!!namedColors[queryColor.toLowerCase()] || isHex(queryColor));

    // All words, nearest to the query color first.
    $: orderedWords = byProximity
        ? (() => {
              const target = hexToOklab(queryColorFinal);
              return colors
                  .map((c) => ({ word: c.word, d: oklabDistance(c.lab, target) }))
                  .sort((a, b) => a.d - b.d)
                  .map(({ word }) => word);
          })()
        : words;

    // With a proximity color, only the nearest visible matches are shown.
    $: proximityRank = new Map(
        orderedWords
            .filter(isVisible)
            .slice(0, PROXIMITY_LIMIT)
            .map((word, i) => [word, i])
    );

    let width = 0;
    $: columns = Math.max(1, Math.floor(width / (tileWidth * remPx)));

    // 2D layout: each grid row is one lightness step (light at the top), and
    // colors within a row are ordered by `compare`. Rows are cut to the actual
    // column count, so this depends on the container width.
    const layoutRows = (
        colors: IColored[],
        columns: number,
        compare: (a: IColored, b: IColored) => number
    ) => {
        const result: IHexWord[] = [];
        const sorted = [...colors].sort((a, b) => b.lightness - a.lightness);
        for (let i = 0; i < sorted.length; i += columns) {
            result.push(
                ...sorted
                    .slice(i, i + columns)
                    .sort(compare)
                    .map((c) => c.word)
            );
        }
        return result;
    };
    // Within one hue family, like a Munsell hue page: vivid to muted.
    const byChroma = (a: IColored, b: IColored) => b.chroma - a.chroma;

    // Spectrum order for mixed hues: starts at red (hue shifted so pinks wrap
    // to the end), with greys last since their hue is noise.
    const spectrumPosition = (c: IColored) =>
        c.family === "grey" ? Infinity : (c.hue - 10 + 360) % 360;
    const bySpectrum = (a: IColored, b: IColored) =>
        spectrumPosition(a) - spectrumPosition(b) || b.chroma - a.chroma;

    const flatList = (
        orderedWords: IHexWord[],
        keep: (word: IHexWord) => boolean
    ): IGroup[] => [{ name: "", words: orderedWords.filter(keep) }];

    // All visible colors in one grid: lightness rows, hue across each row.
    const spectrumLayout = (
        colors: IColored[],
        keep: (word: IHexWord) => boolean,
        columns: number
    ): IGroup[] => [
        {
            name: "",
            words: layoutRows(
                colors.filter((c) => keep(c.word)),
                columns,
                bySpectrum
            ),
        },
    ];

    // Families holding the nearest matches: tiles nearest-first, and the family
    // holding the closest match first.
    const proximityGroups = (
        hueGroups: { name: string; colors: IColored[] }[],
        rank: Map<IHexWord, number>
    ): IGroup[] => {
        const byRank = (a: IHexWord, b: IHexWord) =>
            (rank.get(a) ?? 0) - (rank.get(b) ?? 0);
        return hueGroups
            .map((group) => ({
                name: group.name,
                words: group.colors
                    .map((c) => c.word)
                    .filter((word) => rank.has(word))
                    .sort(byRank),
            }))
            .filter((group) => group.words.length > 0)
            .sort((a, b) => byRank(a.words[0], b.words[0]));
    };

    // Visible colors in each family, laid out in lightness rows. Greys have no
    // meaningful chroma, so they stay in plain lightness order.
    const hueLayout = (
        hueGroups: { name: string; colors: IColored[] }[],
        keep: (word: IHexWord) => boolean,
        columns: number
    ): IGroup[] =>
        hueGroups
            .map((group) => {
                const visible = group.colors.filter((c) => keep(c.word));
                return {
                    name: group.name,
                    words:
                        group.name === "grey"
                            ? visible.map((c) => c.word)
                            : layoutRows(visible, columns, byChroma),
                };
            })
            .filter((group) => group.words.length > 0);

    $: isNear = (word: IHexWord) => proximityRank.has(word);
    $: groups = byProximity
        ? groupByHue
            ? proximityGroups(hueGroups, proximityRank)
            : flatList(orderedWords, isNear)
        : groupByHue
        ? hueLayout(hueGroups, isVisible, columns)
        : spectrumLayout(colors, isVisible, columns);
</script>

<!-- Rows depend on the measured width, which is unknown on the first render;
     stay hidden until it is, instead of flashing a one-column ordering. -->
<div class="groups" class:measuring={width === 0} bind:clientWidth={width}>
    {#each groups as group (group.name)}
        <section>
            {#if group.name}
                <h3>{group.name}</h3>
            {/if}
            <ul style:--tile-width="{tileWidth}rem">
                {#each group.words as word (word.word)}
                    <li style:--color={word.background}>
                        <button
                            style:color={word.color}
                            on:click={() => pick(word)}
                        >
                            {word.hex}
                            <br />
                            <small>({word.word})</small>
                        </button>
                    </li>
                {/each}
            </ul>
        </section>
    {/each}
</div>

<style>
    .groups {
        max-width: 90vw;
        margin: auto;
    }
    .measuring {
        visibility: hidden;
    }
    section {
        margin-bottom: 1rem;
    }
    h3 {
        margin: 0 0 0.3rem;
        font-size: 0.8rem;
        text-transform: uppercase;
        opacity: 0.7;
    }
    ul {
        margin: 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 0;
        grid-template-columns: repeat(
            auto-fill,
            minmax(var(--tile-width, 8rem), 1fr)
        );
    }
    li {
        text-align: center;
        font-weight: bold;
        background-color: var(--color, transparent);
        padding: 0.3rem 0.2rem;
        border-radius: 0;
        overflow: hidden;
    }
    button {
        width: 100%;
        height: 100%;
        padding: 0;
        background: transparent;
        border: 0;
        font-family: monospace;
        cursor: pointer;
        overflow-wrap: anywhere;
    }
    small {
        font-size: 0.6rem;
    }
</style>
