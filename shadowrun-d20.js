import { ShadowrunActorSheet } from "./module/sheets/actor-sheet.js";

// Função para carregar os templates Handlebars na memória
async function preloadHandlebarsTemplates() {
  const templatePaths = [
    "systems/shadowrun-d20-5e/templates/actors/character-sheet.hbs",
  ];
  return loadTemplates(templatePaths);
}

Hooks.once("init", async function () {
  console.log("Shadowrun D20 5e | Inicializando Sistema");

  // 1. Desregistra fichas genéricas padrão
  Actors.unregisterSheet("core", ActorSheet);

  // 2. Registra a ficha customizada
  Actors.registerSheet("shadowrun-d20-5e", ShadowrunActorSheet, {
    types: ["character"],
    makeDefault: true,
    label: "Ficha Shadowrun D20 5e",
  });

  // 3. Pré-carrega os arquivos HBS
  return preloadHandlebarsTemplates();
});
