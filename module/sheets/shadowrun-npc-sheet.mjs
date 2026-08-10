/**
 * Shadowrun DnD5e — ActorSheet de NPC / criatura / máquina.
 */

const ABILITY_LABEL = {
  str: "FOR",
  dex: "DES",
  con: "CON",
  int: "INT",
  wis: "SAB",
  cha: "CAR",
};

const SIZE_LABEL = {
  tiny: "Miúdo",
  sm: "Pequeno",
  med: "Médio",
  lg: "Grande",
  huge: "Enorme",
  grg: "Imenso",
};

const CATEGORY_LABEL = {
  npc: "NPC",
  creature: "Criatura",
  machine: "Máquina",
};

const SKILL_LABEL = {
  acr: "Acrobacia",
  ani: "Adestrar Animais",
  arc: "Arcanismo",
  ath: "Atletismo",
  dec: "Enganação",
  his: "História",
  ins: "Intuição",
  itm: "Intimidação",
  inv: "Investigação",
  med: "Medicina",
  nat: "Natureza",
  prc: "Percepção",
  prf: "Atuação",
  per: "Persuasão",
  rel: "Religião",
  slt: "Prestidigitação",
  ste: "Furtividade",
  sur: "Sobrevivência",
  tec: "Tecnologia",
};

const SKILL_ABILITY = {
  acr: "dex",
  ani: "wis",
  arc: "int",
  ath: "str",
  dec: "cha",
  his: "int",
  ins: "wis",
  itm: "cha",
  inv: "int",
  med: "wis",
  nat: "int",
  prc: "wis",
  prf: "cha",
  per: "cha",
  rel: "int",
  slt: "dex",
  ste: "dex",
  sur: "wis",
  tec: "int",
};

const signed = (n) => (n >= 0 ? `+${n}` : `${n}`);

export class ShadowrunNpcSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["shadowrun", "sheet", "actor", "npc"],
      template:
        "systems/shadowrun-d20-5e/templates/actors/shadowrun-npc-sheet.hbs",
      width: 620,
      height: 760,
      resizable: true,
      submitOnChange: true,
    });
  }

  getData(options) {
    const context = super.getData(options);
    const system = context.actor.system ?? {};

    context.abilities = {};
    for (const [key, label] of Object.entries(ABILITY_LABEL)) {
      const value = Number(system.abilities?.[key]?.value ?? 10);
      const mod = Number.isFinite(system.abilities?.[key]?.mod)
        ? Number(system.abilities[key].mod)
        : Math.floor((value - 10) / 2);
      context.abilities[key] = { label, value, mod, modLabel: signed(mod) };
    }

    const prof = Number(system.attributes?.prof ?? 2);
    context.initLabel = signed(
      Number(system.attributes?.init?.mod ?? context.abilities.dex.mod),
    );
    context.sizeLabel = SIZE_LABEL[system.traits?.size] ?? "Médio";
    context.categoryLabel = CATEGORY_LABEL[system.category] ?? "NPC";

    context.skills = Object.entries(system.skills ?? {}).map(([key, entry]) => {
      const rank = Number(entry?.value ?? 0);
      const abilityKey = SKILL_ABILITY[key] ?? "wis";
      const base = context.abilities[abilityKey]?.mod ?? 0;
      const mod = base + Math.round(prof * rank);
      return {
        key,
        label: SKILL_LABEL[key] ?? key,
        rank,
        mod,
        modLabel: signed(mod),
      };
    });

    const items = Array.from(context.actor.items.values());
    context.weapons = items
      .filter(
        (i) =>
          i.type === "weapon" ||
          (i.type === "item" && i.system?.category === "arma"),
      )
      .map((i) => {
        const bonus = Number(i.system?.attackBonus ?? 0);
        const parts = i.system?.damage?.parts ?? [];
        return {
          _id: i.id,
          name: i.name,
          attackLabel: signed(bonus),
          damageLabel: parts
            .map(([formula, type]) => `${formula} ${type ?? ""}`.trim())
            .join(", "),
          rangeLabel: i.system?.range?.value ? `${i.system.range.value}m` : "",
        };
      });

    context.feats = items
      .filter(
        (i) =>
          i.type === "feat" ||
          (i.type === "item" && i.system?.category !== "arma"),
      )
      .map((i) => ({
        _id: i.id,
        name: i.name,
        description: i.system?.description?.value ?? "",
      }));

    context.editable = this.isEditable;
    context.system = system;
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find("[data-action='toggle-body']").on("click", (ev) => {
      ev.preventDefault();
      this.element.toggleClass("is-collapsed");
    });

    html.find("[data-action='toggle-accordion']").on("click", (ev) => {
      ev.preventDefault();
      $(ev.currentTarget).closest(".sr-card--accordion").toggleClass("is-open");
    });

    html.find("[data-action='roll-ability']").on("click", (ev) => {
      ev.preventDefault();
      const key = ev.currentTarget.dataset.ability;
      const mod = this.getData().abilities[key]?.mod ?? 0;
      new Roll(`1d20 + ${mod}`).toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `Teste de ${ABILITY_LABEL[key]}`,
      });
    });

    html.find("[data-action='roll-skill']").on("click", (ev) => {
      ev.preventDefault();
      const key = ev.currentTarget.dataset.skill;
      const skill = this.getData().skills.find((s) => s.key === key);
      new Roll(`1d20 + ${skill?.mod ?? 0}`).toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `Perícia: ${skill?.label ?? key}`,
      });
    });

    html.find("[data-action='roll-item']").on("click", (ev) => {
      ev.preventDefault();
      const id = ev.currentTarget.closest("[data-item-id]")?.dataset.itemId;
      this.actor.items.get(id)?.roll?.();
    });

    html.find("[data-action='edit-item']").on("click", (ev) => {
      ev.preventDefault();
      const id = ev.currentTarget.closest("[data-item-id]")?.dataset.itemId;
      this.actor.items.get(id)?.sheet?.render(true);
    });

    html.find("[data-action='delete-item']").on("click", async (ev) => {
      ev.preventDefault();
      const id = ev.currentTarget.closest("[data-item-id]")?.dataset.itemId;
      const item = this.actor.items.get(id);
      if (!item) return;
      const confirmed = await Dialog.confirm({
        title: "Excluir",
        content: `<p>Remover <strong>${item.name}</strong>?</p>`,
      });
      if (confirmed) await item.delete();
    });

    if (this.isEditable) {
      html.find("[data-action='add-weapon']").on("click", async (ev) => {
        ev.preventDefault();
        await this.actor.createEmbeddedDocuments("Item", [
          {
            name: "Ataque",
            type: "item",
            system: {
              category: "arma",
              actionType: "mwak",
              attackBonus: 0,
              damage: { parts: [["1d6", "impact"]] },
              range: { value: 0, long: 0 },
            },
          },
        ]);
      });

      html.find("[data-action='add-feat']").on("click", async (ev) => {
        ev.preventDefault();
        await this.actor.createEmbeddedDocuments("Item", [
          {
            name: "Traço",
            type: "feat",
            system: { description: { value: "" } },
          },
        ]);
      });

      html.find("[data-action='export-json']").on("click", (ev) => {
        ev.preventDefault();
        const data = this.actor.toObject();
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${this.actor.name.replace(/\s+/g, "-").toLowerCase()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });

      html.find("[data-action='import-json']").on("click", (ev) => {
        ev.preventDefault();
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
    }
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

    if (!imported.system && imported.data?.system) {
      imported.system = imported.data.system;
    }

    try {
      await this._overwriteActorWithImportedData(imported);
      ui.notifications.info(
        "Importação concluída. A ficha foi atualizada com os dados do JSON.",
      );
      this.render(true);
    } catch (error) {
      console.error(error);
      ui.notifications.error(
        "Falha ao importar JSON. Veja o console para detalhes.",
      );
    }
  }

  _normalizeItemType(type) {
    if (!type) return "item";
    const normalized = String(type).toLowerCase();
    if (normalized === "weapon") {
      return "item";
    }
    if (normalized === "armor" || normalized === "equipment") {
      return "item";
    }
    return normalized || "item";
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
        itemData.type = this._normalizeItemType(itemData.type);
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
          {
            keepId: true,
          },
        );
      }
    }
  }
}
