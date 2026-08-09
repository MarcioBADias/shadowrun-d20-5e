import { ShadowrunActorSheet } from "./sheets/actor-sheet.mjs";

Hooks.once("init", async function () {
  console.log("Shadowrun 5e24 | Inicializando Sistema d20 Cyberpunk");

  // Registrar a Sheet Customizada
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("shadowrun5e24", ShadowrunActorSheet, {
    types: ["character"],
    makeDefault: true,
    label: "Ficha de Runner (Shadowrun 5e24)",
  });
});
