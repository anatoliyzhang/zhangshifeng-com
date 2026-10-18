/** @jsxImportSource hono/jsx */
/**
 * @module AdminNavigation
 * @description Administrative route handlers for managing site navigation.
 * Provides a dynamic interface for editing the main navbar and footer link menus.
 * Supports per-locale label editing for all supported languages.
 */

import { Hono } from "hono";
import { AdminLayout } from "@layouts/AdminLayout";
import { saveNav, saveFooter } from "@core/kv";
import { NavSchema, FooterSchema, VERSIONS } from "@core/schema";
import { GlobalConfigVariables } from "@core/middleware";
import {
  AdminCard,
  AdminHeader,
  DynamicTable,
  SortButtons,
  AdminDeleteButton,
} from "@components/AdminUI";
import { toastResponse } from "@utils/admin-responses";
import { normalizePath } from "@utils/seo";
import { SUPPORTED_LOCALES, getSiteDefaultLocale } from "@core/i18n";
import { LocalizedString } from "@utils/i18n-helpers";

const navAdmin = new Hono<{
  Bindings: Env;
  Variables: GlobalConfigVariables;
}>();

function labelInputName(base: string, index: number, locale: string): string {
  return `${base}[${index}][${locale}]`;
}

function pathInputName(base: string, index: number): string {
  return `${base}[${index}]`;
}

function renderLocaleInputs(
  baseName: string,
  index: number,
  labelValue: LocalizedString | undefined,
): string {
  const defaults = [getSiteDefaultLocale(), "en"];
  const cells = SUPPORTED_LOCALES.map((loc) => {
    const val =
      typeof labelValue === "object" && labelValue !== null
        ? (labelValue as Record<string, string>)[loc.code] || ""
        : loc.code === "en"
          ? (labelValue as string) || ""
          : "";
    const isDefault = loc.code === defaults[0];
    return `
      <div class="ez-nav-locale ${isDefault ? "is-default" : ""}" data-locale="${loc.code}">
        <label class="ez-nav-locale-label">${loc.code}${isDefault ? " (default)" : ""}</label>
        <input type="text" name="${labelInputName(baseName, index, loc.code)}" value="${(val || "").replace(/"/g, "&quot;")}" class="ez-nav-locale-input admin-input" placeholder="${loc.name}" oninput="window.adminHasChanges = true;" />
      </div>
    `;
  }).join("");
  return `<div class="ez-nav-locales">${cells}</div>`;
}

function parseLocalizedItems(
  body: Record<string, any>,
  labelKey: string,
  pathKey: string,
): { label: LocalizedString; path: string }[] {
  const localeCodes = SUPPORTED_LOCALES.map((l) => l.code);
  const labelMap = new Map<number, Record<string, string>>();
  const pathMap = new Map<number, string>();

  const labelRe = new RegExp(`^${labelKey.replace("[", "\\[").replace("]", "\\]")}\\[(\\d+)\\]\\[([^\\]]+)\\]$`);
  const pathRe = new RegExp(`^${pathKey.replace("[", "\\[").replace("]", "\\]")}\\[(\\d+)\\]$`);

  for (const [key, val] of Object.entries(body)) {
    const labelMatch = key.match(labelRe);
    if (labelMatch) {
      const idx = parseInt(labelMatch[1], 10);
      const loc = labelMatch[2];
      if (!labelMap.has(idx)) labelMap.set(idx, {});
      const trimmed = String(val || "").trim();
      if (trimmed.length > 0) labelMap.get(idx)![loc] = trimmed;
      continue;
    }
    const pathMatch = key.match(pathRe);
    if (pathMatch) {
      const idx = parseInt(pathMatch[1], 10);
      const trimmed = String(val || "").trim();
      if (trimmed.length > 0) pathMap.set(idx, trimmed);
    }
  }

  if (!labelMap.has(0) && !pathMap.has(0)) {
    const flatLabels = body[`${labelKey}[]`];
    const flatPaths = body[`${pathKey}[]`];
    if (Array.isArray(flatLabels) || Array.isArray(flatPaths)) {
      const labels = Array.isArray(flatLabels) ? flatLabels : [];
      const paths = Array.isArray(flatPaths) ? flatPaths : [];
      const count = Math.max(labels.length, paths.length);
      for (let i = 0; i < count; i++) {
        const l = String(labels[i] ?? "").trim();
        const p = String(paths[i] ?? "").trim();
        if (l) {
          if (!labelMap.has(i)) labelMap.set(i, {});
          labelMap.get(i)!["en"] = l;
        }
        if (p) pathMap.set(i, p);
      }
    }
  }

  const indices = [...new Set([...labelMap.keys(), ...pathMap.keys()])].sort(
    (a, b) => a - b,
  );
  const items: { label: LocalizedString; path: string }[] = [];

  for (const idx of indices) {
    const paths = pathMap.get(idx) || "";
    const labels = labelMap.get(idx) || {};
    const nonEmpty: Record<string, string> = {};
    for (const l of localeCodes) {
      if (labels[l] && labels[l].length > 0) nonEmpty[l] = labels[l];
    }

    let label: LocalizedString = "";
    const keys = Object.keys(nonEmpty);
    if (keys.length === 1) {
      label = nonEmpty[keys[0]];
    } else if (keys.length > 1) {
      label = nonEmpty;
    }

    if (paths || (typeof label === "string" && label) || typeof label === "object") {
      items.push({ label, path: paths });
    }
  }
  return items;
}

navAdmin.get("/", async (c): Promise<Response> => {
  const { theme, nav, footer, site, seo } = c.var;

  const navLabels = nav.items.map((i) => i.label);
  const footerLabels = footer.links.map((i) => i.label);

  const emptyRowHtml = (labelBase: string, pathBase: string): string => {
    const localeInputs = renderLocaleInputs(labelBase, 0, undefined);
    return `
      <td class="p-2 w-80px align-middle text-center">
        <div class="flex gap-1 justify-center">
          <button type="button" class="nav-item p-1 text-0.7rem" onclick="moveDynamicRow(this, 'up')" title="Move Up">▲</button>
          <button type="button" class="nav-item p-1 text-0.7rem" onclick="moveDynamicRow(this, 'down')" title="Move Down">▼</button>
        </div>
      </td>
      <td class="p-2">${localeInputs}</td>
      <td class="p-2">
        <input type="text" name="${pathInputName(pathBase, 0)}" class="admin-input" placeholder="/path" required oninput="window.adminHasChanges = true;" />
      </td>
      <td class="w-8 text-center">
        <button type="button" class="color-[var(--color-error)] opacity-50 hover:opacity-100 transition-opacity" onclick="this.closest('tr').remove(); window.adminHasChanges = true;">✕</button>
      </td>
    `;
  };

  const navTemplate = emptyRowHtml("navLabel", "navPath");
  const footerTemplate = emptyRowHtml("footerLabel", "footerPath");

  return c.html(
    <AdminLayout title="Navigation Manager" theme={theme} site={site} seo={seo}>
      <div class="flex flex-col">
        <AdminHeader title="Navigation Manager">
          <button class="btn-primary" type="submit" form="navigation-form">
            SAVE NAVIGATION
          </button>
        </AdminHeader>

        <form
          id="navigation-form"
          hx-post="/admin/navigation/save"
          hx-target="#global-toast"
          class="flex flex-col gap-8"
        >
          <AdminCard title="Navbar Links">
            <DynamicTable
              id="nav-items"
              headers={["LABEL (multi-language)", "PATH"]}
              items={nav.items}
              addButtonLabel="+ ADD NAVBAR LINK"
              template={navTemplate}
              renderRow={(item, index) => (
                <tr class="border-b border-b-solid border-[rgba(255,255,255,0.05)]">
                  <SortButtons />
                  <td class="p-2">
                    {renderLocaleInputs("navLabel", index, navLabels[index])}
                  </td>
                  <td class="p-2">
                    <input
                      type="text"
                      name={pathInputName("navPath", index)}
                      value={item.path}
                      class="admin-input"
                      required
                      oninput="window.adminHasChanges = true;"
                    />
                  </td>
                  <AdminDeleteButton />
                </tr>
              )}
            />
          </AdminCard>

          <AdminCard title="Footer Links">
            <DynamicTable
              id="footer-items"
              headers={["LABEL (multi-language)", "PATH"]}
              items={footer.links}
              addButtonLabel="+ ADD FOOTER LINK"
              template={footerTemplate}
              renderRow={(item, index) => (
                <tr class="border-b border-b-solid border-[rgba(255,255,255,0.05)]">
                  <SortButtons />
                  <td class="p-2">
                    {renderLocaleInputs("footerLabel", index, footerLabels[index])}
                  </td>
                  <td class="p-2">
                    <input
                      type="text"
                      name={pathInputName("footerPath", index)}
                      value={item.path}
                      class="admin-input"
                      required
                      oninput="window.adminHasChanges = true;"
                    />
                  </td>
                  <AdminDeleteButton />
                </tr>
              )}
            />
          </AdminCard>
        </form>
      </div>
    </AdminLayout>,
  );
});

navAdmin.post("/save", async (c): Promise<Response> => {
  try {
    const body: Record<string, any> = await c.req.parseBody();

    const navItems = parseLocalizedItems(body, "navLabel", "navPath");
    const footerItems = parseLocalizedItems(body, "footerLabel", "footerPath");

    const validatedNav = NavSchema.parse({
      schemaVersion: VERSIONS.NAV,
      items: navItems.map((item) => ({
        label: item.label,
        path: normalizePath(item.path || "/"),
      })),
    });

    const validatedFooter = FooterSchema.parse({
      schemaVersion: VERSIONS.FOOTER,
      links: footerItems.map((item) => ({
        label: item.label,
        path: normalizePath(item.path || "/"),
      })),
    });

    await Promise.all([
      saveNav(c.env, validatedNav),
      saveFooter(c.env, validatedFooter),
    ]);

    return toastResponse(c, "NAVIGATION SAVED", "success");
  } catch (e: any) {
    return toastResponse(c, `SAVE FAILED: ${e.message}`, "error");
  }
});

export default navAdmin;