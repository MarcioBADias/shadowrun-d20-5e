export class RunnerSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["shadowrun-d20-5e", "sheet", "actor"],
      template: "systems/shadowrun-d20-5e/templates/actors/runner-sheet.hbs",
      width: 980,
      height: 980,
      submitOnChange: true,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "main",
        },
      ],
    });
  }

  getData(options) {
    const context = super.getData(options);
    const actorData = context.data;
    const sys = actorData.system || {};
    const proficiency = Number(sys.proficiency ?? 2);
    const originBonuses = sys.origin_bonuses ?? {};

    const abilityMap = {
      strength: "FOR",
      dexterity: "DES",
      constitution: "CON",
      intelligence: "INT",
      wisdom: "SAB",
      charisma: "CAR",
    };

    const attributes = [
      "strength",
      "dexterity",
      "constitution",
      "intelligence",
      "wisdom",
      "charisma",
    ].map((key) => {
      const base = Number(sys[key] ?? 10);
      const bonus = Number(originBonuses[key] ?? 0);
      const total = base + bonus;
      const mod = Math.floor((total - 10) / 2);
      return {
        key,
        label: key,
        short: abilityMap[key],
        base,
        total,
        mod,
        proficient: false,
        saveMod: mod + proficiency,
      };
    });

    const trainedSkills = new Set(sys.trained_skills ?? []);
    const expertiseSkills = new Set(sys.expertise_skills ?? []);
    const baseSkills = [
      { id: "acrobacia", name: "Acrobacia", source: "Des", attrShort: "DES" },
      {
        id: "furtividade",
        name: "Furtividade",
        source: "Des",
        attrShort: "DES",
      },
      { id: "atletismo", name: "Atletismo", source: "For", attrShort: "FOR" },
      { id: "percepcao", name: "Percepção", source: "Int", attrShort: "INT" },
    ];

    const skills = baseSkills.map((skill) => {
      const trained = trainedSkills.has(skill.id);
      const expertise = expertiseSkills.has(skill.id);
      const bonus =
        2 + (trained ? proficiency : 0) + (expertise ? proficiency : 0);
      return {
        ...skill,
        trained,
        expertise,
        bonus,
        custom: false,
      };
    });

    const customSkills = (sys.custom_skills ?? []).map((skill, index) => ({
      id: skill.slug || `custom-${index}`,
      name: skill.name,
      source: (skill.attr || "Des").slice(0, 3).toUpperCase(),
      attrShort: (skill.attr || "Des").slice(0, 3).toUpperCase(),
      trained: false,
      expertise: false,
      bonus: 2,
      custom: true,
    }));

    const inventory = (sys.inventory ?? []).map((item) => ({
      ...item,
      equippable: ["arma", "armadura"].includes(item.category),
      equipped: !!item.equipped,
      price: item.cost,
    }));

    const attacks = inventory
      .filter((item) => item.category === "arma")
      .map((item) => ({
        id: item.id,
        name: item.name,
        toHit: "+4",
        damage: item.note || "",
        note: item.note || "",
      }));

    const entryPanels = [
      { kind: "feat", title: "Talentos", entries: sys.feats_list ?? [] },
      { kind: "spell", title: "Magias", entries: sys.spells ?? [] },
      {
        kind: "cyberware",
        title: "Cyberware",
        entries: sys.cyberware_list ?? [],
      },
    ];

    const origins = [
      {
        id: "origin-race",
        name: sys.race || "Metatipo",
        source: "Metatipo",
        text: sys.race_description || "Traços de metatipo ainda não definidos.",
      },
      {
        id: "origin-background",
        name: sys.background || "Antecedente",
        source: "Antecedente",
        text:
          sys.background_description ||
          "Traços de antecedente ainda não definidos.",
      },
    ];

    context.system = {
      ...sys,
      className: sys.class_slug || sys.className || "Runner",
      ac: sys.armor_class ?? sys.ac ?? 10,
      hp: {
        value: Number(sys.current_hp ?? sys.hp?.value ?? 0),
        max: Number(sys.max_hp ?? sys.hp?.max ?? 0),
      },
      initiative: {
        physical: Number(sys.initiative?.physical ?? 4),
        astral: Number(sys.initiative?.astral ?? 4),
        matrix: Number(sys.initiative?.matrix ?? 4),
      },
      isDead: !!sys.is_dead,
      proficiency,
      notes: sys.notes ?? "",
    };

    context.attributes = attributes;
    context.skills = [...skills, ...customSkills];
    context.attacks = attacks;
    context.inventory = inventory;
    context.entryPanels = entryPanels;
    context.features = sys.feats_list ?? [];
    context.origins = origins;
    context.editable = this.isEditable;
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.on("click", ".sr-accordion-head", (event) => {
      const header = event.currentTarget.closest(".sr-accordion");
      if (header) header.classList.toggle("is-open");
    });

    html.on("click", ".sr-title-collapsible", (event) => {
      const title = event.currentTarget;
      const panel = html.find(`[data-panel="${title.dataset.target}"]`)[0];
      if (!panel) return;
      title.classList.toggle("is-closed");
      panel.style.display = title.classList.contains("is-closed") ? "none" : "";
    });

    html.on("click", "[data-action='toggle-dead']", async () => {
      await this.actor.update({ "system.is_dead": !this.actor.system.is_dead });
    });

    html.on("click", "[data-action='edit-mode']", (event) => {
      event.preventDefault();
      this.element.toggleClass("sr-locked");
    });

    html.on("click", "[data-action='toggle-trained']", async (event) => {
      const skillId = event.currentTarget.dataset.skill;
      const trained = new Set(this.actor.system.trained_skills ?? []);
      if (trained.has(skillId)) trained.delete(skillId);
      else trained.add(skillId);
      await this.actor.update({ "system.trained_skills": Array.from(trained) });
    });

    html.on("click", "[data-action='toggle-expertise']", async (event) => {
      const skillId = event.currentTarget.dataset.skill;
      const expertise = new Set(this.actor.system.expertise_skills ?? []);
      if (expertise.has(skillId)) expertise.delete(skillId);
      else expertise.add(skillId);
      await this.actor.update({
        "system.expertise_skills": Array.from(expertise),
      });
    });

    html.on("click", "[data-action='toggle-equipped']", async (event) => {
      const itemId = event.currentTarget.dataset.item;
      const inventory = duplicate(this.actor.system.inventory ?? []);
      const item = inventory.find((i) => i.id === itemId);
      if (!item) return;
      item.equipped = !item.equipped;
      await this.actor.update({ "system.inventory": inventory });
    });

    html.on("click", "[data-action='roll-skill']", (event) => {
      const skillId = event.currentTarget.dataset.skill;
      const bonus = this.getSkillBonus(skillId);
      new Roll(`1d20 + ${bonus}`).toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      });
    });

    html.on("click", "[data-action='roll-save']", (event) => {
      const attr = event.currentTarget.dataset.attr;
      const base = Number(this.actor.system[attr] ?? 10);
      const mod = Math.floor((base - 10) / 2);
      const total = mod + Number(this.actor.system.proficiency ?? 2);
      new Roll(`1d20 + ${total}`).toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      });
    });
  }

  getSkillBonus(skillId) {
    const trained = new Set(this.actor.system.trained_skills ?? []);
    const expertise = new Set(this.actor.system.expertise_skills ?? []);
    const trainedBonus = trained.has(skillId)
      ? Number(this.actor.system.proficiency ?? 2)
      : 0;
    const expertiseBonus = expertise.has(skillId)
      ? Number(this.actor.system.proficiency ?? 2)
      : 0;
    return 2 + trainedBonus + expertiseBonus;
  }
}
