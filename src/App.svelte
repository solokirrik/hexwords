<script lang="ts">
    import Search from "./lib/components/Search.svelte";

    import HexWords from "./lib/components/HexWords.svelte";
    import type { IHexWord, IWordEntry } from "./lib/types";
    import { tileColors } from "./lib/utils";
    import wordsJson from "./lib/words/words.json";
    import Snackbars from "./lib/components/Snackbars.svelte";
    const words: IHexWord[] = (wordsJson as IWordEntry[]).map((entry) => ({
        ...entry,
        ...tileColors(entry.hex),
    }));
    let query = $state("");
    let alpha = $state(false);
    let selectedColor: IHexWord = $state({
        background: "#ffffff",
        color: "black",
        hex: "#ffffff",
        word: "default",
    });
    let queryColor = $state("");
    let groupByHue = $state(true);
    let tileWidth = $state(8);
</script>

<Snackbars />
<main
    style:color={selectedColor.color}
    style:--selected-color={selectedColor.background}
>
    <Search
        bind:search={query}
        bind:color={queryColor}
        bind:alpha
        {selectedColor}
        bind:groupByHue
        bind:tileWidth
    />
    <HexWords
        {words}
        {query}
        onselect={(word) => (selectedColor = word)}
        {alpha}
        {queryColor}
        {groupByHue}
        {tileWidth}
    />
</main>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        font-family: monospace;
    }
    :global(*) {
        box-sizing: border-box;
    }
    main {
        width: 100%;
        min-height: 100vh;
        background-color: var(--selected-color, white);
    }
</style>
