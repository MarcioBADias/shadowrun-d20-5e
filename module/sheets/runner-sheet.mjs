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
        id: "adestrar-feras",
        name: "Adestrar Feras",
        source: "Sab",
        attrShort: "SAB",
      },
      { id: "arcanismo", name: "Arcanismo", source: "Int", attrShort: "INT" },
      { id: "atletismo", name: "Atletismo", source: "For", attrShort: "FOR" },
      { id: "atuacao", name: "Atuação", source: "Car", attrShort: "CAR" },
      { id: "enganacao", name: "Enganação", source: "Car", attrShort: "CAR" },
      {
        id: "furtividade",
        name: "Furtividade",
        source: "Des",
        attrShort: "DES",
      },
      { id: "historia", name: "História", source: "Int", attrShort: "INT" },
      {
        id: "intimidacao",
        name: "Intimidação",
        source: "Car",
        attrShort: "CAR",
      },
      { id: "intuicao", name: "Intuição", source: "Sab", attrShort: "SAB" },
      {
        id: "investigacao",
        name: "Investigação",
        source: "Int",
        attrShort: "INT",
      },
      { id: "medicina", name: "Medicina", source: "Sab", attrShort: "SAB" },
      { id: "natureza", name: "Natureza", source: "Int", attrShort: "INT" },
      { id: "percepcao", name: "Percepção", source: "Sab", attrShort: "SAB" },
      { id: "persuasao", name: "Persuasão", source: "Car", attrShort: "CAR" },
      {
        id: "prestidigitacao",
        name: "Prestidigitação",
        source: "Des",
        attrShort: "DES",
      },
      { id: "religiao", name: "Religião", source: "Int", attrShort: "INT" },
      {
        id: "sobrevivencia",
        name: "Sobrevivência",
        source: "Sab",
        attrShort: "SAB",
      },
      {
        id: "tecnologia",
        name: "Tecnologia",
        source: "Int · especialidade",
        attrShort: "INT",
      },
      { id: "pilotagem", name: "Pilotagem", source: "Des", attrShort: "DES" },
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

    const customSkills = (sys.custom_skills ?? []).map((skill, index) => {
      const skillId = skill.slug || `custom-${index}`;
      const trained = trainedSkills.has(skillId);
      const expertise = expertiseSkills.has(skillId);
      const bonus =
        2 + (trained ? proficiency : 0) + (expertise ? proficiency : 0);
      return {
        id: skillId,
        name: skill.name,
        source: (skill.attr || "Des").slice(0, 3).toUpperCase(),
        attrShort: (skill.attr || "Des").slice(0, 3).toUpperCase(),
        trained,
        expertise,
        bonus,
        custom: true,
      };
    });

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

    html.on("click", "a[data-action]", (event) => {
      event.preventDefault();
    });

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

    html.on("click", "[data-action='import-json']", async () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json,application/json";
      input.style.display = "none";
      input.addEventListener("change", async (event) => {
        const file = event.target.files?.[0];
        if (file) await this._handleImportedJSON(file);
      });
      document.body.appendChild(input);
      input.click();
      input.remove();
    });

    html.on("click", "[data-action='roll-attribute']", (event) => {
      const attr = event.currentTarget.dataset.attr;
      const mod = Number(event.currentTarget.dataset.mod ?? 0);
      const formula = `1d20 ${mod >= 0 ? "+" : "-"} ${Math.abs(mod)}`;
      new Roll(formula).toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `Teste de ${attr}`,
      });
    });

    html.on("click", "[data-action='roll-attribute-save']", (event) => {
      const attr = event.currentTarget.dataset.attr;
      const save = Number(event.currentTarget.dataset.save ?? 0);
      const formula = `1d20 ${save >= 0 ? "+" : "-"} ${Math.abs(save)}`;
      new Roll(formula).toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `Teste de resistência de ${attr}`,
      });
    });

    html.on("click", "[data-action='roll-initiative']", (event) => {
      const initType = event.currentTarget.dataset.init;
      const bonus = Number(this.actor.system.initiative?.[initType] ?? 0);
      const label =
        {
          physical: "Física",
          astral: "Astral",
          matrix: "Matrix",
        }[initType] ?? initType;
      const formula = `1d20 ${bonus >= 0 ? "+" : "-"} ${Math.abs(bonus)}`;
      new Roll(formula).toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `Iniciativa ${label}`,
      });
    });

    html.on("click", "[data-action='roll-attack']", (event) => {
      const itemId = event.currentTarget.dataset.item;
      const item =
        (this.actor.system.inventory ?? []).find((i) => i.id === itemId) || {};
      const toHit = item.toHit ?? item.attackBonus ?? "+0";
      const formula = `1d20 ${toHit}`;
      new Roll(formula).toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `Teste de ataque: ${item.name || "Arma"}`,
      });
    });

    html.on("click", "[data-action='roll-damage']", (event) => {
      const itemId = event.currentTarget.dataset.item;
      const item =
        (this.actor.system.inventory ?? []).find((i) => i.id === itemId) || {};
      const damage = item.damage || item.note || "1d6";
      const formula = damage.trim() || "1d6";
      new Roll(formula).toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `Dano de ${item.name || "Arma"}`,
      });
    });
  }

  async _handleImportedJSON(file) {
    const text = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });

    let data;
    try {
      data = JSON.parse(text);
    } catch (error) {
      ui.notifications.error(
        "JSON inválido. Verifique o arquivo e tente novamente.",
      );
      return;
    }

    const imported = data.actor ?? data.data ?? data;
    if (!imported || typeof imported !== "object") {
      ui.notifications.error(
        "O arquivo JSON não contém dados de ator válidos.",
      );
      return;
    }

    if (imported.type && imported.type !== this.actor.type) {
      ui.notifications.warn(
        "O tipo do ator importado é diferente do ator atual. A importação foi cancelada.",
      );
      return;
    }

    try {
      await this._overwriteActorWithImportedData(imported);
      ui.notifications.info(
        "Importação concluída. A ficha foi atualizada com os dados do JSON.",
      );
      this.render();
    } catch (error) {
      console.error(error);
      ui.notifications.error(
        "Falha ao importar JSON. Veja o console para detalhes.",
      );
    }
  }

  async _overwriteActorWithImportedData(imported) {
    const updateData = {};
    if (imported.name) updateData.name = imported.name;
    if (imported.img) updateData.img = imported.img;
    if (imported.avatar_url) updateData.img = imported.avatar_url;
    if (imported.data?.avatar_url) updateData.img = imported.data.avatar_url;
    if (imported.token) updateData.token = imported.token;
    if (imported.prototypeToken)
      updateData.prototypeToken = imported.prototypeToken;
    if (imported.flags) updateData.flags = imported.flags;
    if (imported.system) updateData.system = duplicate(imported.system);

    if (!foundry.utils.isEmpty(updateData)) {
      await this.actor.update(updateData);
    }

    if (Array.isArray(imported.items)) {
      const currentItemIds = this.actor.items.map((item) => item.id);
      if (currentItemIds.length) {
        await this.actor.deleteEmbeddedDocuments("Item", currentItemIds);
      }
      const itemsToCreate = imported.items.map((item) => {
        const itemData = duplicate(
          item instanceof foundry.abstract.Document ? item.toObject() : item,
        );
        itemData._id ||= randomID();
        return itemData;
      });
      if (itemsToCreate.length) {
        await this.actor.createEmbeddedDocuments("Item", itemsToCreate, {
          keepId: true,
        });
      }
    }

    if (Array.isArray(imported.effects)) {
      const currentEffectIds = this.actor.effects.map((effect) => effect.id);
      if (currentEffectIds.length) {
        await this.actor.deleteEmbeddedDocuments(
          "ActiveEffect",
          currentEffectIds,
        );
      }
      const effectsToCreate = imported.effects.map((effect) => {
        const effectData = duplicate(
          effect instanceof foundry.abstract.Document
            ? effect.toObject()
            : effect,
        );
        effectData._id ||= randomID();
        return effectData;
      });
      if (effectsToCreate.length) {
        await this.actor.createEmbeddedDocuments(
          "ActiveEffect",
          effectsToCreate,
          { keepId: true },
        );
      }
    }
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
