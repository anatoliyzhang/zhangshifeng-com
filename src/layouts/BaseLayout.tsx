/** @jsxImportSource hono/jsx */
/**
 * @module BaseLayout
 * @description The primary layout wrapper for all public-facing pages.
 * Composes layout regions (Header, Nav, Main, Footer, Overlays) directly from
 * the active ThemeConnector specified by the theme settings.
 */

import type { FC } from "hono/jsx";
import { raw } from "hono/html";
import {
  ThemeConfig,
  NavConfig,
  SiteConfig,
  FooterConfig,
  PageConfig,
} from "@core/schema";
import { Head } from "@components/Head";
import { themeRegistry } from "@core/theme";
import { DEFAULT_LOCALE, TFunction, LocaleCode } from "@core/i18n";
import { getLocalizedString } from "@utils/i18n-helpers";
import { withLocalePrefix } from "@core/locale-middleware";

export interface BaseLayoutProps {
  title: string;
  children: any;
  theme: ThemeConfig;
  nav: NavConfig;
  site: SiteConfig;
  footer: FooterConfig;
  page?: PageConfig;
  description?: string;
  detectedUrl?: string;
  currentPath?: string;
  locale?: LocaleCode;
  t?: TFunction;
}

export const BaseLayout: FC<BaseLayoutProps> = (props) => {
  const {
    site,
    title,
    theme,
    page,
    detectedUrl,
    currentPath,
    nav,
    children,
    footer,
    locale = DEFAULT_LOCALE,
    t,
  } = props;

  const stylingSystem = theme?.values?.styling_system || "ruri";
  const connector = themeRegistry.get(stylingSystem);
  const ThemeUI = connector.components;

  const normalizedNav: NavConfig = {
    ...nav,
    items: (nav?.items || []).map((item) => ({
      ...item,
      label: getLocalizedString(item.label, locale),
      path: withLocalePrefix(item.path, locale),
    })),
  };

  const normalizedFooter: FooterConfig = {
    ...footer,
    links: (footer?.links || []).map((link) => ({
      ...link,
      label: getLocalizedString(link.label, locale),
      path: withLocalePrefix(link.path, locale),
    })),
  };

  return (
    <>
      {raw("<!DOCTYPE html>\n")}
      <html lang={locale || site.language || "en"}>
        <Head
          title={title}
          theme={theme}
          site={site}
          page={page}
          detectedUrl={detectedUrl}
          currentPath={currentPath}
        />
        <body hx-boost="true">
          {/* Theme-defined Visual Overlays */}
          <ThemeUI.Overlays />

          {/* Standalone Mobile Nav Drawer (only for connectors that use a separate Nav) */}
          {!connector.selfContainedNav && ThemeUI.Nav && (
            <ThemeUI.Nav
              site={site}
              nav={normalizedNav}
              currentPath={currentPath}
              t={t}
              locale={locale}
            />
          )}

          {/* Site Header */}
          <ThemeUI.Header
            site={site}
            nav={normalizedNav}
            title={title}
            currentPath={currentPath}
            t={t}
            locale={locale}
          />

          {ThemeUI.Main ? (
            <ThemeUI.Main>{children}</ThemeUI.Main>
          ) : (
            <main id="main-content">{children}</main>
          )}

          {/* Site Footer */}
          <ThemeUI.Footer
            site={site}
            footer={normalizedFooter}
            t={t}
            locale={locale}
          />

          {/*
           * Mobile nav toggle JS — only injected for connectors that use a
           * separate #main-nav drawer (selfContainedNav = false/undefined).
           * Connectors like Ruri handle mobile nav entirely in their Header.
           */}
          {!connector.selfContainedNav && (
            <script
              dangerouslySetInnerHTML={{
                __html: `
          (function() {
            if (!window.navListenerAdded) {
              document.addEventListener('click', (e) => {
                const nav = document.getElementById('main-nav');
                const toggle = document.getElementById('mobile-menu-toggle');
                if (nav && nav.classList.contains('open') && !nav.contains(e.target) && e.target !== toggle) {
                  nav.classList.remove('open');
                  if (toggle) toggle.innerText = ${JSON.stringify(t?.("nav.menu") || "MENU")};
                  document.body.style.overflow = '';
                }
              });
              window.navListenerAdded = true;
            }

            const initNav = () => {
              const toggle = document.getElementById('mobile-menu-toggle');
              const nav = document.getElementById('main-nav');
              const menuLabel = ${JSON.stringify(t?.("nav.menu") || "MENU")};
              const closeLabel = ${JSON.stringify(t?.("nav.close") || "CLOSE")};

              if (toggle && nav) {
                toggle.onclick = (e) => {
                  e.stopPropagation();
                  const isOpen = nav.classList.toggle('open');
                  toggle.innerText = isOpen ? closeLabel : menuLabel;
                  document.body.style.overflow = isOpen ? 'hidden' : '';
                };

                nav.querySelectorAll('a').forEach(link => {
                  link.onclick = () => {
                    nav.classList.remove('open');
                    toggle.innerText = menuLabel;
                    document.body.style.overflow = '';
                  };
                });
              }
            };

            initNav();
            document.addEventListener('htmx:afterSwap', initNav);
          })();
        `,
              }}
            />
          )}

          {/* Mouse tracking for interactive overlays */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
          if (!window.mouseListenerAdded) {
            var ticking = false;
            document.addEventListener('mousemove', function(e) {
              if (!ticking) {
                requestAnimationFrame(function() {
                  document.body.style.setProperty('--mouse-x', e.clientX + 'px');
                  document.body.style.setProperty('--mouse-y', e.clientY + 'px');
                  ticking = false;
                });
                ticking = true;
              }
            }, { passive: true });
            window.mouseListenerAdded = true;
          }
        `,
            }}
          />

          {/* Page-Specific Custom Script Injections */}
          {page?.seo?.customHeadScripts && raw(page.seo.customHeadScripts)}
        </body>
      </html>
    </>
  );
};