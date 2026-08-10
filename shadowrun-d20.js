import { RunnerSheet } from "./module/sheets/runner-sheet.mjs";
import { ShadowrunNpcSheet } from "./module/sheets/shadowrun-npc-sheet.mjs";

// Função para carregar os templates Handlebars na memória
async function preloadHandlebarsTemplates() {
  const templatePaths = [
    "systems/shadowrun-d20-5e/templates/actors/runner-sheet.hbs",
    "systems/shadowrun-d20-5e/templates/actors/shadowrun-npc-sheet.hbs",
  ];
  return loadTemplates(templatePaths);
}

Hooks.once("init", async function () {
  console.log("Shadowrun D20 5e | Inicializando Sistema");

  // 1. Desregistra fichas genéricas padrão
  Actors.unregisterSheet("core", ActorSheet);

  // 2. Registra a ficha customizada para personagens
  Actors.registerSheet("shadowrun-d20-5e", RunnerSheet, {
    types: ["character"],
    makeDefault: true,
    label: "Runner Sheet (Shadowrun D20 5e)",
  });

  // 3. Registra a ficha customizada para NPCs
  Actors.registerSheet("shadowrun-d20-5e", ShadowrunNpcSheet, {
    types: ["npc"],
    makeDefault: true,
    label: "Ficha de NPC (Shadowrun D20 5e)",
  });

  // 4. Pré-carrega os arquivos HBS
  return preloadHandlebarsTemplates();
});
