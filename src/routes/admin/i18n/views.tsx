/** @jsxImportSource hono/jsx */

import { Hono } from "hono";
import { raw } from "hono/html";
import { GlobalConfigVariables } from "@core/middleware";
import {
  SUPPORTED_LOCALES,
  SUPPORTED_LOCALE_CODES,
  translations as defaultTranslations,
  getAllTranslationKeys,
  getSiteDefaultLocale,
} from "@core/i18n";
import { getTranslationOverrides } from "@core/kv";
import { AdminCard, AdminHeader } from "@components/AdminUI";
import { AdminLayout } from "@layouts/AdminLayout";

const views = new Hono<{ Bindings: Env; Variables: GlobalConfigVariables }>();

const MODULES: { key: string; label: string }[] = [
  { key: "archive", label: "Archive" },
  { key: "pagination", label: "Pagination" },
  { key: "notfound", label: "404" },
  { key: "nav", label: "Navigation" },
  { key: "footer", label: "Footer" },
  { key: "codeblock", label: "Code Block" },
  { key: "system", label: "System" },
];

function detectModule(key: string): string {
  for (const m of MODULES) {
    if (key.startsWith(m.key + ".")) return m.key;
  }
  return "system";
}

function renderTranslationRow(
  key: string,
  locales: string[],
  defaults: Record<string, string | undefined>,
  overrides: Record<string, string | undefined>,
): string {
  const hasOverride = Object.values(overrides).some((v) => v && v.length > 0);
  const missingLocales = locales.filter(
    (l) => !overrides[l] && !defaults[l],
  ).length;
  const badge = hasOverride
    ? `<span class="ez-pill ez-pill-sm ez-pill-accent" title="Has custom override">●</span>`
    : missingLocales > 0
      ? `<span class="ez-pill ez-pill-sm ez-pill-warn" title="${missingLocales} untranslated">${missingLocales}</span>`
      : `<span class="ez-pill ez-pill-sm ez-pill-ok" title="Complete">✓</span>`;

  const cells = locales
    .map((locale) => {
      const overrideVal = overrides[locale] ?? "";
      const defaultVal = defaults[locale] ?? "";
      const displayVal = overrideVal || defaultVal;
      const isCustom = !!overrides[locale];

      return `
        <td class="ez-i18n-cell" data-locale="${locale}">
          <textarea
            name="t[${key}][${locale}]"
            rows="1"
            class="ez-i18n-input ${isCustom ? "is-custom" : ""} ${!displayVal ? "is-empty" : ""}"
            data-key="${key}"
            data-locale="${locale}"
            placeholder="${defaultVal.replace(/"/g, "&quot;")}"
            title="Default: ${defaultVal.replace(/"/g, "&quot;")}"
          >${overrideVal}</textarea>
          ${!overrideVal && defaultVal ? `<span class="ez-i18n-default">${defaultVal}</span>` : ""}
        </td>
      `;
    })
    .join("");

  return `
    <tr class="ez-i18n-row" data-key="${key}" data-module="${detectModule(key)}">
      <td class="ez-i18n-key-cell">
        <div class="ez-i18n-key">${badge}<code>${key}</code></div>
        <div class="ez-i18n-source">${defaults[getSiteDefaultLocale()] ?? ""}</div>
      </td>
      ${cells}
    </tr>
  `;
}

views.get("/", async (c): Promise<Response> => {
  const { theme, site, seo } = c.var;
  const t = c.get("t");
  const locale = c.get("locale");
  const overrides = await getTranslationOverrides(c.env);
  const allKeys = getAllTranslationKeys();

  const keysByModule: Record<string, string[]> = {};
  for (const key of allKeys) {
    const mod = detectModule(key);
    if (!keysByModule[mod]) keysByModule[mod] = [];
    keysByModule[mod].push(key);
  }

  const siteDefaultLocale = getSiteDefaultLocale();
  const saveUrl = "/admin/i18n/save";

  const localeHeader = SUPPORTED_LOCALES.map((l) => {
    const isDefault = l.code === siteDefaultLocale;
    return `<th class="ez-i18n-col ${isDefault ? "is-default" : ""}" data-locale="${l.code}">
      <span class="ez-i18n-col-label">${l}</span>
      ${isDefault ? `<span class="ez-pill ez-pill-xs ez-pill-accent">default</span>` : ""}
    </th>`;
  }).join("");

  const moduleSections = MODULES.map((mod) => {
    const keys = (keysByModule[mod.key] || []).sort();
    if (keys.length === 0) return "";

    const rows = keys
      .map((key) => {
        const defaultEntry = defaultTranslations[key] || {};
        const overrideEntry = overrides[key] || {};
        const defaults: Record<string, string | undefined> = {};
        const over: Record<string, string | undefined> = {};
        for (const l of SUPPORTED_LOCALE_CODES) {
          defaults[l] = (defaultEntry as any)[l];
          over[l] = overrideEntry[l];
        }
        return renderTranslationRow(
          key,
          [...SUPPORTED_LOCALE_CODES],
          defaults,
          over,
        );
      })
      .join("");

    return `
      <section class="ez-i18n-module" data-module="${mod.key}">
        <h3 class="ez-i18n-module-title">${mod.label} <span class="ez-pill ez-pill-xs">${keys.length}</span></h3>
        <div class="ez-i18n-table-wrap">
          <table class="ez-table ez-i18n-table">
            <thead><tr>
              <th class="ez-i18n-key-col">Key</th>
              ${localeHeader}
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </section>
    `;
  }).join("");

  const moduleTabs = MODULES.map(
    (m) => `<button type="button" class="ez-chip" data-module-filter="${m.key}">${m.label}</button>`,
  ).join("");

  const localeTabs = SUPPORTED_LOCALE_CODES.map(
    (l) =>
      `<button type="button" class="ez-chip ez-chip-active" data-locale-col="${l}">${l}</button>`,
  ).join("");

  const script = `
  (function(){
    const form = document.getElementById('i18n-main-form');
    const saveForm = document.getElementById('i18n-save-form');
    if (saveForm) saveForm.addEventListener('submit', () => { form.requestSubmit(); });

    const modTabs = document.querySelectorAll('[data-module-filter]');
    modTabs.forEach(t => t.addEventListener('click', () => {
      modTabs.forEach(x => x.classList.remove('ez-chip-active'));
      t.classList.add('ez-chip-active');
      const m = t.dataset.moduleFilter;
      document.querySelectorAll('.ez-i18n-module').forEach(s => {
        s.style.display = (m === 'all' || s.dataset.module === m) ? '' : 'none';
      });
    }));

    const untranslatedToggle = document.getElementById('i18n-toggle-untranslated');
    untranslatedToggle.addEventListener('change', () => {
      const onlyMissing = untranslatedToggle.checked;
      document.querySelectorAll('.ez-i18n-row').forEach(row => {
        const emptyCells = row.querySelectorAll('.ez-i18n-cell.is-empty');
        const isMissing = emptyCells.length > 0;
        row.style.display = (!onlyMissing || isMissing) ? '' : 'none';
      });
    });

    const locTabs = document.querySelectorAll('[data-locale-col]');
    locTabs.forEach(t => t.addEventListener('click', () => {
      t.classList.toggle('ez-chip-active');
      const active = t.classList.contains('ez-chip-active');
      const l = t.dataset.localeCol;
      document.querySelectorAll('.ez-i18n-col[data-locale="'+l+'"]').forEach(c => c.style.display = active ? '' : 'none');
      document.querySelectorAll('.ez-i18n-cell[data-locale="'+l+'"]').forEach(c => c.style.display = active ? '' : 'none');
    }));

    document.querySelectorAll('.ez-i18n-input').forEach(ta => {
      ta.addEventListener('input', () => {
        ta.style.height = 'auto';
        ta.style.height = ta.scrollHeight + 'px';
        const val = ta.value.trim();
        ta.classList.toggle('is-custom', val.length > 0);
      });
    });

    document.getElementById('i18n-export-btn').addEventListener('click', () => {
      const fd = new FormData(form);
      const obj = {};
      fd.forEach((v, k) => {
        const m = k.match(/^t\\[([^\\]]+)\\]\\[([^\\]]+)\\]$/);
        if (m) {
          const [, key, loc] = m;
          if (!obj[key]) obj[key] = {};
          if (v.trim()) obj[key][loc] = v.trim();
        }
      });
      const blob = new Blob([JSON.stringify(obj, null, 2)], {type:'application/json'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'translations-'+new Date().toISOString().slice(0,10)+'.json';
      a.click();
      URL.revokeObjectURL(a.href);
    });

    const fileInput = document.getElementById('i18n-import-file');
    document.getElementById('i18n-import-btn').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async () => {
      const f = fileInput.files[0];
      if (!f) return;
      try {
        const text = await f.text();
        const data = JSON.parse(text);
        for (const [key, locs] of Object.entries(data)) {
          if (typeof locs !== 'object') continue;
          for (const [loc, val] of Object.entries(locs)) {
            const ta = document.querySelector('.ez-i18n-input[data-key="'+key+'"][data-locale="'+loc+'"]');
            if (ta) { ta.value = String(val); ta.dispatchEvent(new Event('input')); }
          }
        }
      } catch(e) { alert('Invalid JSON: ' + e.message); }
      fileInput.value = '';
    });
  })();
  `;

  return c.html(
    <AdminLayout
      title={t("i18n.title")}
      theme={theme}
      site={site}
      seo={seo}
      locale={locale}
    >
      <>
        <AdminHeader title={t("i18n.title")} description={t("i18n.desc")}>
          <form
            hx-post={saveUrl}
            hx-target="body"
            hx-swap="none"
            id="i18n-save-form"
            class="ez-inline-form"
          >
            <button type="submit" class="ez-btn ez-btn-primary">
              {t("i18n.save")}
            </button>
          </form>
          <button
            type="button"
            class="ez-btn ez-btn-ghost"
            id="i18n-export-btn"
            title="Export as JSON"
          >
            ⬇ Export
          </button>
          <button
            type="button"
            class="ez-btn ez-btn-ghost"
            id="i18n-import-btn"
            title="Import JSON"
          >
            ⬆ Import
          </button>
          <input
            type="file"
            id="i18n-import-file"
            accept=".json,application/json"
            style="display:none"
          />
        </AdminHeader>

        <div class="ez-i18n-filters">
          <div class="ez-i18n-filter-group">
            <label class="ez-label">{t("i18n.filter.module")}</label>
            <div class="ez-i18n-module-tabs">
              <button type="button" class="ez-chip ez-chip-active" data-module-filter="all">
                {t("i18n.filter.all")}
              </button>
              {raw(moduleTabs)}
            </div>
          </div>
          <div class="ez-i18n-filter-group">
            <label class="ez-label">{t("i18n.filter.show")}</label>
            <div class="ez-i18n-filter-toggles">
              <label class="ez-switch">
                <input type="checkbox" id="i18n-toggle-untranslated" />
                <span>{t("i18n.filter.only_untranslated")}</span>
              </label>
            </div>
          </div>
          <div class="ez-i18n-filter-group">
            <label class="ez-label">{t("i18n.filter.locale")}</label>
            <div class="ez-i18n-locale-tabs">{raw(localeTabs)}</div>
          </div>
        </div>

        <form
          hx-post={saveUrl}
          hx-target="body"
          hx-swap="none"
          id="i18n-main-form"
        >
          {raw(moduleSections)}
        </form>

        <AdminCard title={t("i18n.info.title")}>
          <p>{t("i18n.info.body", { locale: siteDefaultLocale })}</p>
        </AdminCard>

        <script dangerouslySetInnerHTML={{ __html: script }} />
      </>
    </AdminLayout>,
  );
});

export default views;