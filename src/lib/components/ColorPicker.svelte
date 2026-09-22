<script lang="ts">
    import { isHex } from "$lib/utils";

    export let color: string;
</script>

<div>
    <input
        bind:value={color}
        type="search"
        size="1"
        placeholder="order by proximity to..."
    />
    <input
        value={isHex(color) ? color : "#000000"}
        on:input={(e) => (color = e.currentTarget.value)}
        type="color"
    />
</div>

<style>
    div {
        grid-column: 1;
        display: grid;
        grid-template-columns: 1fr min-content;
        align-items: center;
        background: white;
        box-shadow: 0 0 0.3rem 0 rgba(0 0 0 / 0.3);
        border-radius: 10rem;
        overflow: hidden;
    }
    div:focus-within {
        box-shadow: 0 0 0.5rem 0 rgba(0 0 0 / 0.7);
    }
    input {
        outline: 0;
        border: 0;
    }
    input[type="search"] {
        width: 100%;
        padding: 0.3rem 0.7rem;
        background: transparent;
    }
    input[type="color"] {
        width: 2.5rem;
        height: 100%;
        padding: 0;
        background: transparent;
        cursor: pointer;
    }
    input[type="color"]::-webkit-color-swatch-wrapper {
        padding: 0;
    }
    input[type="color"]::-webkit-color-swatch {
        border: 0;
    }
    input[type="color"]::-moz-color-swatch {
        border: 0;
    }
</style>
