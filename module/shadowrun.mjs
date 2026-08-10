import { ShadowrunActorSheet } from "./sheets/actor-sheet.mjs";
import { RunnerSheet } from "./sheets/runner-sheet.mjs";

Hooks.once("init", async function () {
  console.log("Shadowrun d20 5e | Inicializando Sistema");

  // Registrar as fichas customizadas
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("shadowrun-d20-5e", ShadowrunActorSheet, {
    types: ["character"],
    makeDefault: true,
    label: "Ficha de Runner (Shadowrun d20 5e)",
  });

  Actors.registerSheet("shadowrun-d20-5e", RunnerSheet, {
    types: ["npc"],
    makeDefault: true,
    label: "Ficha de NPC (Shadowrun d20 5e)",
  });
});
