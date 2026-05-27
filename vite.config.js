import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { readdirSync, writeFileSync } from "fs";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    solid(),
    // --- плагин автогенерации вкладок ---
    {
      name: "generate-tabs",
      buildStart() {
        const src = resolve(__dirname, "src");
        // ищем каталоги вида tab01, tab02, ..., tab10
        const dirs = readdirSync(src)
          .filter(name => /^tab\d\d$/.test(name));
        // генерируем файл
        const out = resolve(src, "tabs.generated.js");
        writeFileSync(
          out,
          `export const tabs = ${JSON.stringify(dirs, null, 2)};`
        );
        console.log("✔ tabs.generated.js создан:", dirs);
      }
    }
  ],

  build: {
    target: "esnext"
  }
});
