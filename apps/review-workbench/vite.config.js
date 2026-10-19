import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { flowEditorPlugin } from "./vendor/flow-editor/flow-editor-plugin.js";

export default defineConfig(function (_a) {
    var mode = _a.mode;
    loadEnv(mode, process.cwd(), "");
    return {
        plugins: [react(), flowEditorPlugin({ sldbUrl: process.env.VITE_SLDB_URL || 'http://127.0.0.1:8787' })],
        resolve: {
            alias: { "@": path.resolve(__dirname, "src") },
        },
        server: {
            host: "127.0.0.1",
            port: 5173,
            proxy: {
                // Projection views are evaluated by the graph_ui server (frontends/mindmap/serve.py).
                '/api': {
                    target: process.env.VITE_GRAPH_UI_URL || 'http://127.0.0.1:8088',
                    changeOrigin: false,
                },
                '/sldb': {
                    target: process.env.VITE_SLDB_URL || 'http://127.0.0.1:8787',
                    changeOrigin: true,
                    rewrite: function (p) { return p.replace(/^\/sldb/, ''); },
                },
            },
            watch: {
                ignored: ['**/auto_user_test/**'],
            },
        },
    };
});
