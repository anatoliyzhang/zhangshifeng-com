/**
 * @module LocaleMiddleware
 * @description Hono middleware for locale detection and injection into request context.
 */

import type { MiddlewareHandler } from "hono";
import {
  LocaleCode,
  DEFAULT_LOCALE,
  detectLocaleFromHeader,
  normalizeLocale,
  isSupportedLocale,
  createT,
  getSiteDefaultLocale,
} from "./i18n";
import type { TFunction } from "./i18n";

export type LocaleVariables = {
  locale: LocaleCode;
  t: TFunction;
};

export function injectLocale(defaultLanguage?: string): MiddlewareHandler<{
  Bindings: Env;
  Variables: LocaleVariables;
}> {
  return async (c, next) => {
    const path = c.req.path;
    let locale: LocaleCode = DEFAULT_LOCALE;

    const pathParts = path.split("/").filter(Boolean);
    if (pathParts.length > 0 && isSupportedLocale(pathParts[0])) {
      locale = normalizeLocale(pathParts[0]);
    } else if (defaultLanguage) {
      locale = normalizeLocale(defaultLanguage);
    } else {
      locale = detectLocaleFromHeader(c.req.header("accept-language"));
    }

    c.set("locale", locale);
    c.set("t", createT(locale));

    await next();
  };
}

export function stripLocalePrefix(path: string): string {
  const parts = path.split("/").filter(Boolean);
  if (parts.length > 0 && isSupportedLocale(parts[0])) {
    return "/" + parts.slice(1).join("/");
  }
  return path;
}

export function withLocalePrefix(
  path: string,
  locale: LocaleCode,
  defaultLocale?: LocaleCode,
): string {
  if (!path || path === "/") return path;
  const effectiveDefault = defaultLocale ?? getSiteDefaultLocale();
  const cleanPath = stripLocalePrefix(path);
  if (locale === effectiveDefault) return cleanPath;
  return `/${locale}${cleanPath.startsWith("/") ? cleanPath : "/" + cleanPath}`;
}

export function resolveAdminLocale(
  queryLocale: string | undefined,
  siteLanguage: string = DEFAULT_LOCALE,
): LocaleCode {
  if (queryLocale && isSupportedLocale(queryLocale)) {
    return normalizeLocale(queryLocale);
  }
  const siteLocale = normalizeLocale(siteLanguage);
  return siteLocale;
}

export function withAdminLocale(
  path: string,
  locale: LocaleCode,
  defaultLocale?: LocaleCode,
): string {
  const effectiveDefault = defaultLocale ?? getSiteDefaultLocale();
  if (locale === effectiveDefault) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}locale=${locale}`;
}