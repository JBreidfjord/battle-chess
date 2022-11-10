import { VitePluginFonts } from "vite-plugin-fonts";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePluginFonts({
      custom: {
        families: [
          {
            name: "Press Start 2P",
            local: "Press Start 2P",
            src: "./src/assets/fonts/PressStart2P-Regular.ttf",
          },
        ],
      },
    }),
  ],
});
