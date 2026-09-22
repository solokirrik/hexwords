// Read by both vite-plugin-svelte and svelte-check. Runes everywhere, so
// legacy syntax (export let, $:, on:click) is a compile error.
export default {
    compilerOptions: {
        runes: true,
    },
};
