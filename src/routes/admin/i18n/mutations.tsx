import { Hono } from "hono";
import { GlobalConfigVariables } from "@core/middleware";
import {
  SUPPORTED_LOCALE_CODES,
  setTranslationOverrides,
} from "@core/i18n";
import {
  TranslationOverrides,
  getTranslationOverrides,
  saveTranslationOverrides,
} from "@core/kv";

function safeLocale(loc: string): string | null {
  return (SUPPORTED_LOCALE_CODES as readonly string[]).includes(loc) ? loc : null;
}

const mutations = new Hono<{ Bindings: Env; Variables: GlobalConfigVariables }>();

mutations.post("/save", async (c) => {
  const body = await c.req.parseBody({ all: true });
  const raw = body["t"];

  const overrides: TranslationOverrides = {};
  const seenKeys = new Set<string>();

  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    for (const [key, locs] of Object.entries(raw as Record<string, any>)) {
      if (typeof locs !== "object" || Array.isArray(locs)) continue;
      seenKeys.add(key);
      const entry: Partial<Record<string, string>> = {};
      for (const [loc, val] of Object.entries(locs as Record<string, any>)) {
        const safeLoc = safeLocale(loc);
        if (!safeLoc) continue;
        const strVal = String(val ?? "").trim();
        if (strVal) {
          entry[safeLoc] = strVal;
        }
      }
      if (Object.keys(entry).length > 0) {
        overrides[key] = entry;
      }
    }
  }

  const existingOverrides = await getTranslationOverrides(c.env);
  const merged: TranslationOverrides = { ...existingOverrides };
  for (const k of seenKeys) {
    if (overrides[k]) {
      merged[k] = overrides[k];
    } else {
      delete merged[k];
    }
  }

  await saveTranslationOverrides(c.env, merged);
  setTranslationOverrides(merged);

  const t = c.get("t");
  const toast = `<div class="ez-toast ez-toast-ok ez-toast-float" role="status">${t("admin.saved")}</div>`;
  const redirect = `<script>setTimeout(() => { window.location.href = '/admin/i18n'; }, 800);</script>`;

  return c.html(`${toast}${redirect}`);
});

export default mutations;