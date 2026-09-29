/** @jsxImportSource hono/jsx */
/**
 * @module LangSwitcher
 * @description Language switcher dropdown for the site header.
 * Uses a native <select> with a small JS handler to navigate between localized URL prefixes.
 * Only renders when the site has configured multiple supported languages.
 */

import type { FC } from "hono/jsx";
import { Button as RuriButton } from "ruri-ui";
import { SiteConfig } from "@core/schema";
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LocaleCode,
  isSupportedLocale,
} from "@core/i18n";
import {
  stripLocalePrefix,
  withLocalePrefix,
} from "@core/locale-middleware";

export interface LangSwitcherProps {
  /** Current active locale. */
  locale: LocaleCode;
  /** Site config for reading supportedLanguages. */
  site: SiteConfig;
  /** Current request path (used to build localized target URLs). */
  currentPath?: string;
  /** Theme connector style identifier ('ruri' | 'astryx'). */
  styleVariant?: "ruri" | "astryx";
  class?: string;
}

function buildLocaleOptions(site: SiteConfig, current: LocaleCode) {
  const defaultLang = site.language || DEFAULT_LOCALE;
  const extraLangs = site.supportedLanguages || [];

  const allCodes = new Set<string>([defaultLang, ...extraLangs]);

  if (extraLangs.length === 0) {
    for (const loc of SUPPORTED_LOCALES) {
      allCodes.add(loc.code);
    }
  }

  const options: { code: string; name: string; flag: string }[] = [];
  for (const code of allCodes) {
    if (!isSupportedLocale(code)) continue;
    const info =
      SUPPORTED_LOCALES.find((l) => l.code === code) ||
      SUPPORTED_LOCALES.find((l) => l.code.toLowerCase() === code.toLowerCase());
    if (!info) continue;

    const flagMap: Record<string, string> = {
      en: "🇬🇧",
      zh: "🇨🇳",
      "zh-TW": "🇹🇼",
      ja: "🇯🇵",
      ko: "🇰🇷",
      fr: "🇫🇷",
      es: "🇪🇸",
      de: "🇩🇪",
      ru: "🇷🇺",
    };

    options.push({
      code: info.code,
      name: info.name,
      flag: flagMap[info.code] || "🌐",
    });
  }

  options.sort((a, b) => {
    if (a.code === current) return -1;
    if (b.code === current) return 1;
    if (a.code === defaultLang) return -1;
    if (b.code === defaultLang) return 1;
    return a.name.localeCompare(b.name);
  });

  return options;
}

function buildJumpScript(
  currentPath: string,
  defaultLocale: string = DEFAULT_LOCALE,
  localeParamName: string = "ezLocale",
): string {
  const cleanPath = stripLocalePrefix(currentPath);
  return `(function() {
    var select = document.getElementById('lang-switcher');
    if (!select) return;
    select.addEventListener('change', function() {
      var target = select.value;
      if (!target) return;
      var path = ${JSON.stringify(cleanPath)};
      if (target === ${JSON.stringify(defaultLocale)}) {
        window.location.href = path;
      } else {
        window.location.href = '/' + target + path;
      }
    });
  })();`;
}

export const LangSwitcher: FC<LangSwitcherProps> = ({
  locale,
  site,
  currentPath = "/",
  styleVariant = "ruri",
  class: className = "",
}) => {
  const options = buildLocaleOptions(site, locale);
  const siteDefaultLocale = site.language || DEFAULT_LOCALE;

  if (options.length <= 1) return null;

  const selectContent = (
    <select
      id="lang-switcher"
      value={locale}
      class={`lang-switcher-select cursor-pointer bg-transparent border-0 outline-none font-nav text-xs uppercase tracking-wider appearance-none ${className}`.trim()}
      style={
        styleVariant === "astryx"
          ? {
              color: "var(--astryx-text-muted, #475569)",
              padding: "0.5rem 1.5rem 0.5rem 0.5rem",
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.25rem center",
              backgroundSize: "0.75rem",
            }
          : {
              color: "var(--ruri-text-muted, #a0a0b0)",
              padding: "0.25rem 1.25rem 0.25rem 0.25rem",
            }
      }
      aria-label="Select language"
    >
      {options.map((opt) => (
        <option value={opt.code}>
          {opt.flag} {opt.name}
        </option>
      ))}
    </select>
  );

  if (styleVariant === "astryx") {
    return (
      <>
        {selectContent}
        <script
          dangerouslySetInnerHTML={{
            __html: buildJumpScript(currentPath, siteDefaultLocale),
          }}
        />
      </>
    );
  }

  return (
    <>
      {selectContent}
      <script
        dangerouslySetInnerHTML={{
          __html: buildJumpScript(currentPath, siteDefaultLocale),
        }}
      />
    </>
  );
};