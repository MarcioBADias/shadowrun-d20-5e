export class ShadowrunActorSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["shadowrun-d20", "sheet", "actor"],
      template: "systems/shadowrun-d20-5e/templates/actor/character-sheet.hbs",
      width: 720,
      height: 800,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "pericias",
        },
      ],
    });
  }

  // Prepara os dados para exibição na ficha
  getData() {
    const context = super.getData();
    context.system = context.actor.system;
    return context;
  }
}
