import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
    plugins: [svelte()],
    resolve: {
        alias: {
            $lib: "/src/lib",
        },
    },
    publicDir: "static",
    build: {
        outDir: "build",
    },
    server: {
        port: 3009,
    },
});
