/**
 * @module KVContent
 * @description Logical domain for page content management, indexing, and publication.
 */

import {
  PageConfig,
  PageListEntry,
  PageListIndex,
  VERSIONS,
} from "@core/schema";
import { parsePage } from "@core/parser";
import { KEYS, cache } from "@core/kv/base";
import { getFirstImageForPortableText } from "@utils/portabletext-parser";
import { DEFAULT_LOCALE, LocaleCode } from "@core/i18n";

/**
 * Fetches a single page configuration by its slug, environment mode, and locale.
 * Tries the requested locale first, then falls back to DEFAULT_LOCALE ("en").
 *
 * @param env - Cloudflare Worker environment bindings.
 * @param slug - The unique path identifier for the page.
 * @param mode - The environment mode to fetch from ('draft' or 'live').
 * @param locale - The language version to fetch. Falls back to DEFAULT_LOCALE.
 * @returns A promise resolving to the parsed PageConfig, or null if not found or invalid.
 */
export const getPage = async (
  env: Env,
  slug: string,
  mode: "draft" | "live" = "live",
  locale: LocaleCode = DEFAULT_LOCALE,
): Promise<PageConfig | null> => {
  const fallbackOrder =
    locale === DEFAULT_LOCALE
      ? [DEFAULT_LOCALE]
      : [locale, DEFAULT_LOCALE];

  for (const tryLocale of fallbackOrder) {
    const key = KEYS.PAGE(mode, slug, tryLocale);
    try {
      const rawText = await env.EZ_CONTENT.get(key, { type: "text" });
      if (!rawText) continue;
      const raw = typeof rawText === "string" ? JSON.parse(rawText) : rawText;
      const page = parsePage(raw);
      if (page) return page;
    } catch (e) {
      console.error(`KV Parse Error for ${key}:`, e);
    }
  }

  return null;
};

/**
 * Updates the persistent index list of page slugs for a specific environment mode.
 * Handles the v1 (string array) to v2 (object array) schema migration on-the-fly.
 *
 * @param env - Cloudflare Worker environment bindings.
 * @param pageOrSlug - The full page config (for add) or slug (for remove).
 * @param mode - The environment mode index to update.
 * @param action - Whether to 'add' or 'remove' the page from the index.
 * @returns A promise resolving when the index has been updated.
 */
const modifyPageList = async (
  env: Env,
  pageOrSlug: PageConfig | string,
  mode: "draft" | "live",
  action: "add" | "remove",
  locale: LocaleCode = DEFAULT_LOCALE,
): Promise<void> => {
  try {
    const slug = typeof pageOrSlug === "string" ? pageOrSlug : pageOrSlug.slug;
    const key = KEYS.PAGE_LIST(mode, locale);

    let raw: any = null;
    try {
      const rawText = await env.EZ_CONTENT.get(key, { type: "text" });
      raw = typeof rawText === "string" ? JSON.parse(rawText) : rawText;
    } catch (e) {
      console.warn(`Recovering corrupted page list ${key}`);
    }

    let indexObj: PageListIndex = {
      schemaVersion: VERSIONS.PAGE_LIST,
      items: [],
    };

    if (Array.isArray(raw)) {
      indexObj.items = raw.map((s) => ({
        slug: s,
        title: s,
        createdAt: new Date().toISOString(),
      }));
    } else if (raw && raw.items) {
      indexObj = raw;
    }

    const existingIndex = indexObj.items.findIndex(
      (item) => item.slug === slug,
    );

    if (action === "add" && typeof pageOrSlug !== "string") {
      const entry: PageListEntry = {
        slug: pageOrSlug.slug,
        title: pageOrSlug.title,
        description: pageOrSlug.description,
        featuredImage:
          pageOrSlug.featuredImage ||
          (Array.isArray(pageOrSlug.content)
            ? getFirstImageForPortableText(pageOrSlug.content) || undefined
            : undefined),
        createdAt: pageOrSlug.metadata.createdAt,
        publishedAt: pageOrSlug.metadata.publishedAt,
      };

      if (existingIndex === -1) {
        indexObj.items.push(entry);
      } else {
        indexObj.items[existingIndex] = entry;
      }
    } else if (action === "remove" && existingIndex !== -1) {
      indexObj.items.splice(existingIndex, 1);
    } else {
      return;
    }

    await env.EZ_CONTENT.put(key, JSON.stringify(indexObj));

    if (mode === "live") cache.pageListLive = indexObj;
    else cache.pageListDraft = indexObj;
  } catch (err) {
    console.error("PageList Update Error:", err);
  }
};

/**
 * Persists a page configuration to KV storage and updates the corresponding slug index.
 *
 * @param env - Cloudflare Worker environment bindings.
 * @param page - The page configuration object to save.
 * @param mode - The environment mode to save to ('draft' or 'live').
 * @returns A promise resolving when the save operation is complete.
 */
export const savePage = async (
  env: Env,
  page: PageConfig,
  mode: "draft" | "live" = "draft",
  locale: LocaleCode = DEFAULT_LOCALE,
): Promise<void> => {
  const key = KEYS.PAGE(mode, page.slug, locale);
  await env.EZ_CONTENT.put(key, JSON.stringify(page));
  await modifyPageList(env, page, mode, "add", locale);
};

export const publishPage = async (
  env: Env,
  slug: string,
  locale: LocaleCode = DEFAULT_LOCALE,
): Promise<boolean> => {
  const draft = await getPage(env, slug, "draft", locale);
  if (!draft) return false;

  const livePage: PageConfig = {
    ...draft,
    status: "published" as const,
    metadata: { ...draft.metadata, publishedAt: new Date().toISOString() },
  };

  await Promise.all([
    savePage(env, livePage, "live", locale),
    env.EZ_CONTENT.delete(KEYS.PAGE("draft", slug, locale)),
    modifyPageList(env, slug, "draft", "remove", locale),
  ]);

  return true;
};

export const unpublishPage = async (
  env: Env,
  slug: string,
  locale: LocaleCode = DEFAULT_LOCALE,
): Promise<boolean> => {
  const live = await getPage(env, slug, "live", locale);
  if (!live) return false;

  const draftPage: PageConfig = {
    ...live,
    status: "draft" as const,
  };

  await Promise.all([
    savePage(env, draftPage, "draft", locale),
    env.EZ_CONTENT.delete(KEYS.PAGE("live", slug, locale)),
    modifyPageList(env, slug, "live", "remove", locale),
  ]);

  return true;
};

/**
 * Permanently removes a page and its associated image assets from all environments.
 *
 * @param env - Cloudflare Worker environment bindings.
 * @param slug - The unique slug of the page to delete.
 * @returns A promise resolving when the deletion process is complete.
 */
export const deletePage = async (
  env: Env,
  slug: string,
  locale: LocaleCode = DEFAULT_LOCALE,
): Promise<void> => {
  await Promise.all([
    env.EZ_CONTENT.delete(KEYS.PAGE("draft", slug, locale)),
    env.EZ_CONTENT.delete(KEYS.PAGE("live", slug, locale)),
    modifyPageList(env, slug, "draft", "remove", locale),
    modifyPageList(env, slug, "live", "remove", locale),
  ]);

  const imageList = await env.EZ_CONTENT.list({ prefix: `img:${slug}:` });
  await Promise.all(imageList.keys.map((k) => env.EZ_CONTENT.delete(k.name)));
};

export const listPages = async (
  env: Env,
  mode: "draft" | "live" = "live",
  locale: LocaleCode = DEFAULT_LOCALE,
): Promise<PageListEntry[]> => {
  const cached = mode === "live" ? cache.pageListLive : cache.pageListDraft;
  if (cached && Array.isArray(cached.items)) return cached.items;

  const key = KEYS.PAGE_LIST(mode, locale);
  const rawText = await env.EZ_CONTENT.get(key, { type: "text" });
  let raw: any;
  try {
    raw = typeof rawText === "string" ? JSON.parse(rawText) : rawText;
  } catch (e) {
    console.error("CORRUPTED JSON FOR KEY", key, ":", rawText);
    return [];
  }

  if (!raw) return [];

  let indexObj: PageListIndex;

  if (Array.isArray(raw)) {
    indexObj = {
      schemaVersion: VERSIONS.PAGE_LIST,
      items: raw.map((s) => ({
        slug: s,
        title: s,
        createdAt: new Date().toISOString(),
      })),
    };
  } else {
    indexObj = raw as PageListIndex;
  }

  if (!indexObj.items || !Array.isArray(indexObj.items)) {
    indexObj.items = [];
  }

  if (mode === "live") cache.pageListLive = indexObj;
  else cache.pageListDraft = indexObj;

  return indexObj.items;
};

export const renamePage = async (
  env: Env,
  oldSlug: string,
  newSlug: string,
  locale: LocaleCode = DEFAULT_LOCALE,
): Promise<void> => {
  const [draftPage, livePage] = await Promise.all([
    getPage(env, oldSlug, "draft", locale),
    getPage(env, oldSlug, "live", locale),
  ]);

  const deletePromises: Promise<void>[] = [];

  if (draftPage) {
    draftPage.slug = newSlug;
    await savePage(env, draftPage, "draft", locale);
    deletePromises.push(env.EZ_CONTENT.delete(KEYS.PAGE("draft", oldSlug, locale)));
    deletePromises.push(modifyPageList(env, oldSlug, "draft", "remove", locale));
  }

  if (livePage) {
    livePage.slug = newSlug;
    await savePage(env, livePage, "live", locale);
    deletePromises.push(env.EZ_CONTENT.delete(KEYS.PAGE("live", oldSlug, locale)));
    deletePromises.push(modifyPageList(env, oldSlug, "live", "remove", locale));
  }

  const imageList = await env.EZ_CONTENT.list({ prefix: `img:${oldSlug}:` });
  const imagePromises = imageList.keys.map(async (k) => {
    const buffer = await env.EZ_CONTENT.get(k.name, { type: "arrayBuffer" });
    if (buffer) {
      const newKey = k.name.replace(`img:${oldSlug}:`, `img:${newSlug}:`);
      await env.EZ_CONTENT.put(newKey, buffer);
      await env.EZ_CONTENT.delete(k.name);
    }
  });

  await Promise.all(imagePromises);
  await Promise.all(deletePromises);
};