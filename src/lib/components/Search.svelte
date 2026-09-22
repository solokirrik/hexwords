<script lang="ts">
    import type { IHexWord } from "../types";
    import ColorPicker from "./ColorPicker.svelte";
    import Switch from "./Switch.svelte";

    interface Props {
        search: string;
        alpha: boolean;
        color: string;
        selectedColor: IHexWord;
        groupByHue: boolean;
        tileWidth: number;
    }
    let {
        search = $bindable(),
        alpha = $bindable(),
        color = $bindable(),
        selectedColor,
        groupByHue = $bindable(),
        tileWidth = $bindable(),
    }: Props = $props();
</script>

<h1><pre>#HEXWORDS</pre></h1>
<h2>Why bother with a random green when you can choose to be a #BADA55!</h2>
<div class="credits">
    <a target="_blank" href="https://github.com/solokirrik">@solokirrik</a>
</div>
<div class="search" style:--selected-color={selectedColor.background}>
    <input type="search" bind:value={search} placeholder="search..." />
    <ColorPicker bind:color />
    <div class="view">
        <Switch
            bind:checked={alpha}
            id="toggle-alpha"
            trackSize="2rem"
            label="Alpha"
        />
        <Switch
            bind:checked={groupByHue}
            id="toggle-group"
            trackSize="2rem"
            label="Group by hue"
        />
        <label>
            Tile width
            <input
                type="range"
                min="4"
                max="15"
                step="0.5"
                bind:value={tileWidth}
            />
        </label>
    </div>
</div>

<style>
    h1 {
        text-align: center;
        padding: 0.5rem;
        margin: 0;
    }
    h2 {
        text-align: center;
        font-weight: 100;
        max-width: 90vw;
        margin: auto;
    }
    pre {
        margin: 0;
    }
    .credits {
        text-align: center;
        margin-top: 0.5rem;
        font-size: 0.7rem;
        opacity: 0.6;
    }
    .credits > a {
        color: inherit;
    }
    .search {
        position: sticky;
        top: 0;
        background-color: var(--selected-color);
        padding-block: 1rem;
        display: grid;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        grid-template-columns: max-content;
        z-index: 10;
    }
    .view {
        grid-column: 1/-1;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
    }
    .view label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    input:not([type="checkbox"]):not([type="range"]) {
        width: min(30rem, 50vw);
        display: block;
        box-shadow: 0 0 0.3rem 0 rgba(0 0 0 / 0.3);
        outline: 0;
        border: 0;
        border-radius: 10rem;
        padding: 0.3rem 0.7rem;
    }
    input:not([type="checkbox"]):not([type="range"]):focus {
        box-shadow: 0 0 0.5rem 0 rgba(0 0 0 / 0.7);
    }
</style>
