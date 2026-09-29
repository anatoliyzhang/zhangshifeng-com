/**
 * @module GlobalMiddleware
 * @description Global Hono middleware for the EZ EDGE CMS.
 * Handles the injection of site-wide configurations into the request context.
 */

import { MiddlewareHandler } from "hono";
import { getGlobalConfig, getTranslationOverrides } from "@core/kv";
import { ThemeConfig, SiteConfig, NavConfig, FooterConfig } from "@core/schema";
import {
  LocaleCode,
  TFunction,
  DEFAULT_LOCALE,
  detectLocaleFromHeader,
  normalizeLocale,
  createT,
  isSupportedLocale,
  setTranslationOverrides,
  setSiteDefaultLocale,
  getSiteDefaultLocale,
} from "@core/i18n";

/**
 * Type definition for global configuration variables stored in the Hono context.
 */
export type GlobalConfigVariables = {
  theme: ThemeConfig;
  site: SiteConfig;
  nav: NavConfig;
  footer: FooterConfig;
  seo: SiteConfig["seo"];
  locale: LocaleCode;
  t: TFunction;
};

/**
 * Middleware: Global Configuration Injector
 *
 * Fetches core site-wide configurations from KV in parallel and injects them
 * into the Hono context. Optimized to skip injection for non-UI requests
 * while ensuring availability for administrative mutations.
 *
 * @returns A Hono MiddlewareHandler.
 */
export const injectGlobalConfig = (): MiddlewareHandler<{
  Bindings: Env;
  Variables: GlobalConfigVariables;
}> => {
  return async (c, next) => {
    const path = c.req.path;
    const method = c.req.method;

    // Skip injection for static assets and API routes.
    if (path.startsWith("/static/") || path.startsWith("/api/")) {
      return await next();
    }

    // Optimization: Skip injection for most mutations,
    // but ALWAYS inject for Admin routes as they need config for UI and merging.
    const isUIRequest = method === "GET";
    const isAdminMutation = method !== "GET" && path.startsWith("/admin/");

    if (!isUIRequest && !isAdminMutation) {
      return await next();
    }

    // Fetch and set global configs.
    const config = await getGlobalConfig(c.env);

    c.set("theme", config.theme);
    c.set("site", config.site);
    c.set("nav", config.nav);
    c.set("footer", config.footer);
    c.set("seo", config.seo);

    const overrides = await getTranslationOverrides(c.env);
    setTranslationOverrides(overrides);

    setSiteDefaultLocale(config.site?.language);

    const siteDefault = getSiteDefaultLocale();

    let locale: LocaleCode = siteDefault;
    const pathParts = path.split("/").filter(Boolean);
    if (pathParts.length > 0 && isSupportedLocale(pathParts[0])) {
      locale = normalizeLocale(pathParts[0]);
    } else if (config.site?.language) {
      locale = normalizeLocale(config.site.language);
    } else {
      locale = detectLocaleFromHeader(c.req.header("accept-language"));
    }

    c.set("locale", locale);
    c.set("t", createT(locale));

    await next();
  };
};