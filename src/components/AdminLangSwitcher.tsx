/** @jsxImportSource hono/jsx */
import type { FC } from "hono/jsx";
import { SUPPORTED_LOCALES, LocaleCode, DEFAULT_LOCALE } from "@core/i18n";
import { withAdminLocale } from "@core/locale-middleware";

export interface AdminLangSwitcherProps {
  currentLocale: LocaleCode;
  currentPath: string;
  siteLanguage?: string;
  supportedLanguages?: string[];
}

export const AdminLangSwitcher: FC<AdminLangSwitcherProps> = ({
  currentLocale,
  currentPath,
  siteLanguage = DEFAULT_LOCALE,
  supportedLanguages = [],
}) => {
  const activeLocales = new Set([siteLanguage, ...supportedLanguages]);

  return (
    <div class="admin-lang-switcher mb-4">
      <div class="text-0.7rem font-nav color-[var(--theme-text-dim)] uppercase mb-2">
        CONTENT LANGUAGE
      </div>
      <div class="flex flex-wrap gap-1">
        {SUPPORTED_LOCALES.map((loc) => {
          const isActive = loc.code === currentLocale;
          const isEnabled = activeLocales.has(loc.code);
          const href = withAdminLocale(currentPath, loc.code as LocaleCode, siteLanguage as LocaleCode);

          return (
            <a
              href={href}
              hx-boost="false"
              class={[
                "lang-chip",
                isActive ? "lang-chip-active" : "",
                !isEnabled ? "lang-chip-disabled" : "",
              ].filter(Boolean).join(" ")}
              title={
                !isEnabled
                  ? `${loc.name} is not enabled in Site Settings`
                  : loc.name
              }
            >
              {loc.code}
              {!isEnabled && <span class="lang-chip-dot">·</span>}
            </a>
          );
        })}
      </div>
      <div class="text-0.6rem color-[var(--theme-text-dim)] mt-1 opacity-70">
        Editing: {SUPPORTED_LOCALES.find((l) => l.code === currentLocale)?.name}
      </div>
    </div>
  );
};