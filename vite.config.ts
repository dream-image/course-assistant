import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { visualizer } from "rollup-plugin-visualizer";
// https://vite.dev/config/
const VISUALIZER = process.env.VISUALIZER;
export default defineConfig({
  plugins: [
    react(),
    VISUALIZER
      ? visualizer({
          gzipSize: true,
          brotliSize: true,
          emitFile: false,
          filename: "dist.html", //分析图生成的文件名
          open: true, //如果存在本地服务端口，将在打包后自动展示
        })
      : undefined,
  ],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          antd: ["antd", "@ant-design/icons"],
          antdPro: ["@ant-design/pro-components", "@ant-design/x"],
          heroui: ["@heroui/react"],
          lodash: ["lodash-es"],
          highlight: ["highlight.js"],
          latex: ["katex", "rehype-katex", "remark-math"],
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
});
