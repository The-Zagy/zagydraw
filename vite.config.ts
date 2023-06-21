import { defineConfig, UserConfigExport } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
const config: UserConfigExport = {
    plugins: [react(), tsconfigPaths()],
    assetsInclude: "src/assets",

    test: {
        globals: true,
        environment: "happy-dom",
        setupFiles: ".vitest/setup",
        include: ["**/test.{ts,tsx}"],
    },
};
// https://vitejs.dev/config
export default defineConfig(config);
