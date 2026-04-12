/**
 * Schreibt `data/menu.json` und `data/gift-config.json` aus dem **TypeScript-Seed** (`menu-data.ts`).
 *
 * ⚠️ Nicht in CI nach jedem Deploy laufen lassen: überschreibt lokale Dateien und setzt u. a. Stock-Bild-URLs zurück.
 * Nur bewusst für initiale Daten oder lokale Entwicklung nutzen.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { menuCategories } from "../src/lib/menu-data";

const dataDir = join(process.cwd(), "data");
mkdirSync(dataDir, { recursive: true });

writeFileSync(join(dataDir, "menu.json"), JSON.stringify(menuCategories, null, 2), "utf-8");

writeFileSync(
  join(dataDir, "gift-config.json"),
  JSON.stringify(
    {
      thresholdEur: 45,
      message: {
        en: "You unlocked a complimentary miso soup with your order.",
        de: "Sie erhalten eine kostenlose Misosuppe zu Ihrer Bestellung."
      }
    },
    null,
    2
  ),
  "utf-8"
);

console.log("Wrote data/menu.json and data/gift-config.json");
