import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

// https://vitejs.dev/config
export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    assetsInclude: "src/assets",
    test: {
        globals: true,
        // necessary for jest-canvas-mock to work
        threads: false,
        environment: "jsdom",
        environmentOptions: {
            jsdom: {
                resources: "usable",
            },
        },
        setupFiles: ".vitest/setup",
        include: ["src/tests/**/*.test.ts", "src/tests/**/*.test.tsx"],
    },
});
