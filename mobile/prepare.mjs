import { cp, readFile, writeFile } from "node:fs/promises";
import { basename } from "node:path";

const source = new URL("../veira-site/", import.meta.url);
const webDir = new URL("www/", import.meta.url);
await cp(source, webDir, {
  recursive: true,
  filter(path) {
    return !["aistudio", "registerSW.js", "sw.js", "workbox-9c191d2f.js"].includes(basename(path));
  },
});
const entry = new URL("index.html", webDir);
const html = await readFile(entry, "utf8");
await writeFile(entry, html.replace(/<script\b[^>]*\bsrc="\/registerSW\.js"[^>]*><\/script>/g, ""));
