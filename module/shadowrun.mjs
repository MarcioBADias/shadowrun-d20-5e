import { ShadowrunActorSheet } from "./sheets/actor-sheet.mjs";

Hooks.once("init", async function () {
  console.log("Shadowrun 5e24 | Inicializando Sistema");

  // Desregistra a ficha padrão e registra a do Shadowrun
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("shadowrun5e24", ShadowrunActorSheet, {
    types: ["character"],
    makeDefault: true,
    label: "Ficha de Runner (Shadowrun 5e24)",
  });
});
