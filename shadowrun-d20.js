import { ShadowrunActorSheet } from "./module/sheets/actor-sheet.js";

Hooks.once("init", async function () {
  console.log("Shadowrun D20 5e | Inicializando Sistema");

  // 1. Unregistra a ficha padrão genérica do Foundry
  Actors.unregisterSheet("core", ActorSheet);

  // 2. Registra a ficha customizada do seu Shadowrun
  Actors.registerSheet("shadowrun-d20-5e", ShadowrunActorSheet, {
    types: ["character"],
    makeDefault: true,
    label: "Ficha Shadowrun D20 5e",
  });
});
