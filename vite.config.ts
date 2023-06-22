import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config
export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    assetsInclude: "src/assets",
    test: {
        globals: true,
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
