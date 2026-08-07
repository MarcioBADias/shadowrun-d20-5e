import { DND5E } from "./module/config.mjs";

Hooks.once("init", async function () {
  console.log("Shadowrun D20 5e | Inicializando o Sistema Customizado");

  Object.assign(CONFIG.DND5E, DND5E);
});

Hooks.on("ready", () => {
  console.log("Shadowrun D20 5e | Sistema carregado com sucesso.");
});
