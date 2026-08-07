export class ShadowrunActorSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["shadowrun-d20", "sheet", "actor"],
      // Caminho exato para o seu arquivo HTML/Handlebars
      template: "systems/shadowrun-d20-5e/templates/actor/character-sheet.hbs",
      width: 750,
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

  getData() {
    const context = super.getData();
    context.system = context.actor.system;
    return context;
  }
}
