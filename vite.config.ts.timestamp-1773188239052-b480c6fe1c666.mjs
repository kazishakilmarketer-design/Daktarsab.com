// vite.config.ts
import { defineConfig } from "file:///C:/Users/HP/.gemini/antigravity/playground/Daktarsab.com/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/HP/.gemini/antigravity/playground/Daktarsab.com/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { VitePWA } from "file:///C:/Users/HP/.gemini/antigravity/playground/Daktarsab.com/node_modules/vite-plugin-pwa/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\HP\\.gemini\\antigravity\\playground\\Daktarsab.com";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false
    }
  },
  esbuild: {
    drop: mode === "production" ? ["console", "debugger"] : []
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt"],
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/]
      },
      manifest: {
        name: "\u09A1\u09BE\u0995\u09CD\u09A4\u09BE\u09B0 \u09B8\u09BE\u09AC - AI Doctor",
        short_name: "\u09A1\u09BE\u0995\u09CD\u09A4\u09BE\u09B0 \u09B8\u09BE\u09AC",
        description: "\u0986\u09AA\u09A8\u09BE\u09B0 AI \u09B8\u09CD\u09AC\u09BE\u09B8\u09CD\u09A5\u09CD\u09AF \u09AA\u09B0\u09BE\u09AE\u09B0\u09CD\u09B6\u09A6\u09BE\u09A4\u09BE",
        theme_color: "#0d9668",
        background_color: "#f5f7fa",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxIUFxcXFwuZ2VtaW5pXFxcXGFudGlncmF2aXR5XFxcXHBsYXlncm91bmRcXFxcRGFrdGFyc2FiLmNvbVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcSFBcXFxcLmdlbWluaVxcXFxhbnRpZ3Jhdml0eVxcXFxwbGF5Z3JvdW5kXFxcXERha3RhcnNhYi5jb21cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL0hQLy5nZW1pbmkvYW50aWdyYXZpdHkvcGxheWdyb3VuZC9EYWt0YXJzYWIuY29tL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gXCJ2aXRlLXBsdWdpbi1wd2FcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiOjpcIixcbiAgICBwb3J0OiA4MDgwLFxuICAgIGhtcjoge1xuICAgICAgb3ZlcmxheTogZmFsc2UsXG4gICAgfSxcbiAgfSxcbiAgZXNidWlsZDoge1xuICAgIGRyb3A6IG1vZGUgPT09ICdwcm9kdWN0aW9uJyA/IFsnY29uc29sZScsICdkZWJ1Z2dlciddIDogW10sXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIFZpdGVQV0Eoe1xuXG4gICAgICByZWdpc3RlclR5cGU6IFwiYXV0b1VwZGF0ZVwiLFxuICAgICAgaW5jbHVkZUFzc2V0czogW1wiZmF2aWNvbi5pY29cIiwgXCJyb2JvdHMudHh0XCJdLFxuICAgICAgd29ya2JveDoge1xuICAgICAgICBuYXZpZ2F0ZUZhbGxiYWNrRGVueWxpc3Q6IFsvXlxcL35vYXV0aC9dLFxuICAgICAgfSxcbiAgICAgIG1hbmlmZXN0OiB7XG4gICAgICAgIG5hbWU6IFwiXHUwOUExXHUwOUJFXHUwOTk1XHUwOUNEXHUwOUE0XHUwOUJFXHUwOUIwIFx1MDlCOFx1MDlCRVx1MDlBQyAtIEFJIERvY3RvclwiLFxuICAgICAgICBzaG9ydF9uYW1lOiBcIlx1MDlBMVx1MDlCRVx1MDk5NVx1MDlDRFx1MDlBNFx1MDlCRVx1MDlCMCBcdTA5QjhcdTA5QkVcdTA5QUNcIixcbiAgICAgICAgZGVzY3JpcHRpb246IFwiXHUwOTg2XHUwOUFBXHUwOUE4XHUwOUJFXHUwOUIwIEFJIFx1MDlCOFx1MDlDRFx1MDlBQ1x1MDlCRVx1MDlCOFx1MDlDRFx1MDlBNVx1MDlDRFx1MDlBRiBcdTA5QUFcdTA5QjBcdTA5QkVcdTA5QUVcdTA5QjBcdTA5Q0RcdTA5QjZcdTA5QTZcdTA5QkVcdTA5QTRcdTA5QkVcIixcbiAgICAgICAgdGhlbWVfY29sb3I6IFwiIzBkOTY2OFwiLFxuICAgICAgICBiYWNrZ3JvdW5kX2NvbG9yOiBcIiNmNWY3ZmFcIixcbiAgICAgICAgZGlzcGxheTogXCJzdGFuZGFsb25lXCIsXG4gICAgICAgIHN0YXJ0X3VybDogXCIvXCIsXG4gICAgICAgIGljb25zOiBbXG4gICAgICAgICAgeyBzcmM6IFwiL3B3YS0xOTJ4MTkyLnBuZ1wiLCBzaXplczogXCIxOTJ4MTkyXCIsIHR5cGU6IFwiaW1hZ2UvcG5nXCIgfSxcbiAgICAgICAgICB7IHNyYzogXCIvcHdhLTUxMng1MTIucG5nXCIsIHNpemVzOiBcIjUxMng1MTJcIiwgdHlwZTogXCJpbWFnZS9wbmdcIiB9LFxuICAgICAgICAgIHsgc3JjOiBcIi9wd2EtNTEyeDUxMi5wbmdcIiwgc2l6ZXM6IFwiNTEyeDUxMlwiLCB0eXBlOiBcImltYWdlL3BuZ1wiLCBwdXJwb3NlOiBcIm1hc2thYmxlXCIgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgfSksXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgIH0sXG4gIH0sXG59KSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXdXLFNBQVMsb0JBQW9CO0FBQ3JZLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyxlQUFlO0FBSHhCLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sS0FBSztBQUFBLE1BQ0gsU0FBUztBQUFBLElBQ1g7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNLFNBQVMsZUFBZSxDQUFDLFdBQVcsVUFBVSxJQUFJLENBQUM7QUFBQSxFQUMzRDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sUUFBUTtBQUFBLE1BRU4sY0FBYztBQUFBLE1BQ2QsZUFBZSxDQUFDLGVBQWUsWUFBWTtBQUFBLE1BQzNDLFNBQVM7QUFBQSxRQUNQLDBCQUEwQixDQUFDLFdBQVc7QUFBQSxNQUN4QztBQUFBLE1BQ0EsVUFBVTtBQUFBLFFBQ1IsTUFBTTtBQUFBLFFBQ04sWUFBWTtBQUFBLFFBQ1osYUFBYTtBQUFBLFFBQ2IsYUFBYTtBQUFBLFFBQ2Isa0JBQWtCO0FBQUEsUUFDbEIsU0FBUztBQUFBLFFBQ1QsV0FBVztBQUFBLFFBQ1gsT0FBTztBQUFBLFVBQ0wsRUFBRSxLQUFLLG9CQUFvQixPQUFPLFdBQVcsTUFBTSxZQUFZO0FBQUEsVUFDL0QsRUFBRSxLQUFLLG9CQUFvQixPQUFPLFdBQVcsTUFBTSxZQUFZO0FBQUEsVUFDL0QsRUFBRSxLQUFLLG9CQUFvQixPQUFPLFdBQVcsTUFBTSxhQUFhLFNBQVMsV0FBVztBQUFBLFFBQ3RGO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0gsRUFBRSxPQUFPLE9BQU87QUFBQSxFQUNoQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
