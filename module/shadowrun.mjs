import { ShadowrunActorSheet } from "./sheets/actor-sheet.mjs";

Hooks.once("init", async function () {
  console.log("Shadowrun d20 5e | Inicializando Sistema");

  // Registrar a Ficha Customizada
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("shadowrun-d20-5e", ShadowrunActorSheet, {
    types: ["character"],
    makeDefault: true,
    label: "Ficha de Runner (Shadowrun d20 5e)",
  });
});
