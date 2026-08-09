export class ShadowrunActorSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["shadowrun-d20-5e", "sheet", "actor"],
      template: "systems/shadowrun-d20-5e/templates/actor/character-sheet.hbs",
      width: 720,
      height: 800,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "stats",
        },
      ],
    });
  }

  getData() {
    const context = super.getData();
    const actorData = context.data;

    context.system = actorData.system;
    context.flags = actorData.flags;

    return context;
  }
}
