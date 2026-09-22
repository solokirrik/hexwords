import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig(({ command, isPreview }) => ({
    plugins: [svelte()],
    // GitHub Pages serves the site from /hexwords/, not the domain root.
    // The build and `vite preview` use it; the dev server stays at the root.
    base: command === "build" || isPreview ? "/hexwords/" : "/",
    publicDir: "static",
    build: {
        outDir: "build",
    },
    server: {
        port: 3009,
    },
}));
