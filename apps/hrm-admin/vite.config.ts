import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
// @ts-ignore
import path from "path";
import type { ConfigEnv } from "vite";

// https://vitejs.dev/config/
export default (configEnv: ConfigEnv) => {
  process.env = {
    ...process.env,
    ...loadEnv(configEnv.mode, process.cwd(), ""),
  };

  return defineConfig({
    plugins: [react()],
    server: {
      host: true,
      open: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  });
};
