/**
 * @module i18nHelpers
 * @description Utilities for working with localized content fields.
 */

import { LocaleCode, DEFAULT_LOCALE } from "@core/i18n";

export type LocalizedString = string | Record<string, string>;

export function getLocalizedString(
  value: LocalizedString | undefined,
  locale: LocaleCode = DEFAULT_LOCALE,
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value[locale] || value["en"] || Object.values(value)[0] || "";
  }
  return String(value);
}

export function isLocalizedObject(
  value: unknown,
): value is Record<string, string> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value as Record<string, unknown>).every(
      (v) => typeof v === "string",
    )
  );
}