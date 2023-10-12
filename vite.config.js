import { defineConfig } from 'vite'
export default defineConfig({
    plugins: [
    ],
    build: {
        rollupOptions: {
            input: {
                app: './index.html', // default
            },
        },
    },
})