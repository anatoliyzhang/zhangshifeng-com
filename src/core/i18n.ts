/**
 * @module i18n
 * @description Lightweight internationalization for the EZ EDGE CMS.
 * Provides UI string translation and content locale resolution without heavy dependencies.
 */

export const SUPPORTED_LOCALES = [
  { code: "en", name: "English", dir: "ltr" },
  { code: "zh", name: "简体中文", dir: "ltr" },
  { code: "zh-TW", name: "繁體中文", dir: "ltr" },
  { code: "ja", name: "日本語", dir: "ltr" },
  { code: "ko", name: "한국어", dir: "ltr" },
  { code: "fr", name: "Français", dir: "ltr" },
  { code: "es", name: "Español", dir: "ltr" },
  { code: "de", name: "Deutsch", dir: "ltr" },
  { code: "ru", name: "Русский", dir: "ltr" },
] as const;

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number]["code"];

export const SUPPORTED_LOCALE_CODES: readonly LocaleCode[] = SUPPORTED_LOCALES.map(
  (l) => l.code,
);

export const DEFAULT_LOCALE: LocaleCode = "en";

export interface TranslationEntry {
  en: string;
  [locale: string]: string;
}

export const translations: Record<string, TranslationEntry> = {
  // --- Archive / Listings ---
  "archive.title": {
    en: "ARCHIVE EXPLORER",
    zh: "归档浏览",
    "zh-TW": "歸檔瀏覽",
    ja: "アーカイブエクスプローラー",
    ko: "아카이브 탐색기",
    fr: "EXPLORATEUR D'ARCHIVES",
    es: "EXPLORADOR DE ARCHIVOS",
    de: "ARCHIV-EXPLORER",
    ru: "АРХИВНЫЙ ПРОВОДНИК",
  },
  "archive.entriesFound": {
    en: "{count} ENTRIES FOUND",
    zh: "共找到 {count} 条记录",
    "zh-TW": "共找到 {count} 條記錄",
    ja: "{count} 件のエントリが見つかりました",
    ko: "{count}개의 항목을 찾았습니다",
    fr: "{count} ENTRÉES TROUVÉES",
    es: "{count} ENTRADAS ENCONTRADAS",
    de: "{count} EINTRÄGE GEFUNDEN",
    ru: "НАЙДЕНО ЗАПИСЕЙ: {count}",
  },
  "archive.pageOf": {
    en: "PAGE {current} OF {total}",
    zh: "第 {current} / {total} 页",
    "zh-TW": "第 {current} / {total} 頁",
    ja: "{current} / {total} ページ",
    ko: "{current} / {total} 페이지",
    fr: "PAGE {current} SUR {total}",
    es: "PÁGINA {current} DE {total}",
    de: "SEITE {current} VON {total}",
    ru: "СТРАНИЦА {current} ИЗ {total}",
  },
  "archive.accessData": {
    en: "ACCESS DATA",
    zh: "查看详情",
    "zh-TW": "查看詳情",
    ja: "データにアクセス",
    ko: "데이터 접근",
    fr: "ACCÉDER",
    es: "ACCEDER",
    de: "ZUGREIFEN",
    ru: "ОТКРЫТЬ",
  },
  "archive.empty": {
    en: "SECTOR IS CURRENTLY EMPTY // NO DATA ENTRIES DETECTED",
    zh: "当前分区为空 // 未检测到数据条目",
    "zh-TW": "當前分區為空 // 未檢測到數據條目",
    ja: "このセクターは現在空です // データエントリが検出されません",
    ko: "이 섹터는 현재 비어 있습니다 // 데이터 항목이 감지되지 않았습니다",
    fr: "SECTEUR VIDE // AUCUNE ENTRÉE DE DONNÉES DÉTECTÉE",
    es: "SECTOR VACÍO // NO SE DETECTARON ENTRADAS DE DATOS",
    de: "SEKTOR IST LEER // KEINE DATENEINTRÄGE ERKANNT",
    ru: "СЕКТОР ПУСТ // ЗАПИСЕЙ НЕ ОБНАРУЖЕНО",
  },

  // --- Pagination ---
  "pagination.previous": {
    en: "← PREVIOUS SECTOR",
    zh: "← 上一页",
    "zh-TW": "← 上一頁",
    ja: "← 前のセクター",
    ko: "← 이전 섹터",
    fr: "← SECTEUR PRÉCÉDENT",
    es: "← SECTOR ANTERIOR",
    de: "← VORHERIGER SEKTOR",
    ru: "← ПРЕДЫДУЩИЙ СЕКТОР",
  },
  "pagination.next": {
    en: "NEXT SECTOR →",
    zh: "下一页 →",
    "zh-TW": "下一頁 →",
    ja: "次のセクター →",
    ko: "다음 섹터 →",
    fr: "SECTEUR SUIVANT →",
    es: "SECTOR SIGUIENTE →",
    de: "NÄCHSTER SEKTOR →",
    ru: "СЛЕДУЮЩИЙ СЕКТОР →",
  },

  // --- 404 ---
  "notfound.title": {
    en: "404: SECTOR NOT FOUND",
    zh: "404: 页面未找到",
    "zh-TW": "404: 頁面未找到",
    ja: "404: セクターが見つかりません",
    ko: "404: 섹터를 찾을 수 없습니다",
    fr: "404: SECTEUR INTROUVABLE",
    es: "404: SECTOR NO ENCONTRADO",
    de: "404: SEKTOR NICHT GEFUNDEN",
    ru: "404: СЕКТОР НЕ НАЙДЕН",
  },
  "notfound.description": {
    en: "The coordinate <strong>/{slug}</strong> does not exist in our current database.",
    zh: "坐标 <strong>/{slug}</strong> 在当前数据库中不存在。",
    "zh-TW": "座標 <strong>/{slug}</strong> 在當前數據庫中不存在。",
    ja: "座標 <strong>/{slug}</strong> は現在のデータベースに存在しません。",
    ko: "좌표 <strong>/{slug}</strong>은(는) 현재 데이터베이스에 존재하지 않습니다.",
    fr: "La coordonnée <strong>/{slug}</strong> n'existe pas dans notre base de données actuelle.",
    es: "La coordenada <strong>/{slug}</strong> no existe en nuestra base de datos actual.",
    de: "Die Koordinate <strong>/{slug}</strong> existiert nicht in unserer aktuellen Datenbank.",
    ru: "Координата <strong>/{slug}</strong> отсутствует в нашей базе данных.",
  },
  "notfound.homeLink": {
    en: "RETURN TO HOME SECTOR",
    zh: "返回首页",
    "zh-TW": "返回首頁",
    ja: "ホームセクターに戻る",
    ko: "홈 섹터로 돌아가기",
    fr: "RETOUR AU SECTEUR D'ACCUEIL",
    es: "VOLVER AL SECTOR DE INICIO",
    de: "ZURÜCK ZUM HAUPTSEKTOR",
    ru: "НА ГЛАВНУЮ",
  },

  // --- Navigation Mobile Toggle ---
  "nav.menu": {
    en: "MENU",
    zh: "菜单",
    "zh-TW": "菜單",
    ja: "メニュー",
    ko: "메뉴",
    fr: "MENU",
    es: "MENÚ",
    de: "MENÜ",
    ru: "МЕНЮ",
  },
  "nav.close": {
    en: "CLOSE",
    zh: "关闭",
    "zh-TW": "關閉",
    ja: "閉じる",
    ko: "닫기",
    fr: "FERMER",
    es: "CERRAR",
    de: "SCHLIESSEN",
    ru: "ЗАКРЫТЬ",
  },

  // --- Footer ---
  "footer.allRightsReserved": {
    en: "All rights reserved.",
    zh: "版权所有。",
    "zh-TW": "版權所有。",
    ja: "全著作権所有。",
    ko: "모든 권리 보유.",
    fr: "Tous droits réservés.",
    es: "Todos los derechos reservados.",
    de: "Alle Rechte vorbehalten.",
    ru: "Все права защищены.",
  },

  // --- Code Block ---
  "codeblock.file": {
    en: "FILE",
    zh: "文件",
    "zh-TW": "檔案",
    ja: "ファイル",
    ko: "파일",
    fr: "FICHIER",
    es: "ARCHIVO",
    de: "DATEI",
    ru: "ФАЙЛ",
  },

  // --- System Status ---
  "system.status": {
    en: "SYSTEM STATUS",
    zh: "系统状态",
    "zh-TW": "系統狀態",
    ja: "システムステータス",
    ko: "시스템 상태",
    fr: "STATUT DU SYSTÈME",
    es: "ESTADO DEL SISTEMA",
    de: "SYSTEMSTATUS",
    ru: "СТАТУС СИСТЕМЫ",
  },

  // --- Translation Admin ---
  "i18n.title": {
    en: "Translation Manager",
    zh: "翻译管理",
    "zh-TW": "翻譯管理",
    ja: "翻訳管理",
    ko: "번역 관리",
    fr: "Gestion des traductions",
    es: "Gestor de traducciones",
    de: "Übersetzungsverwaltung",
    ru: "Менеджер переводов",
  },
  "i18n.desc": {
    en: "Edit UI text strings for all supported languages. Empty values fall back to the default locale.",
    zh: "编辑所有支持语言的界面文案，空值将回退到默认语言。",
    "zh-TW": "編輯所有支援語言的介面文案，空值將回退到預設語言。",
    ja: "対応言語すべてのUI文字列を編集します。空の値はデフォルトロケールにフォールバックします。",
    ko: "지원되는 모든 언어의 UI 텍스트 문자열을 편집하세요. 빈 값은 기본 로케일로 돌아갑니다.",
    fr: "Modifiez les chaînes de texte UI pour toutes les langues prises en charge. Les valeurs vides reviennent à la langue par défaut.",
    es: "Edite las cadenas de texto de la UI para todos los idiomas admitidos. Los valores vacíos vuelven al idioma predeterminado.",
    de: "Bearbeiten Sie UI-Textstrings für alle unterstützten Sprachen. Leere Werte fallen auf das Standardgebietsschema zurück.",
    ru: "Редактируйте строки UI для всех поддерживаемых языков. Пустые значения используют язык по умолчанию.",
  },
  "i18n.save": {
    en: "Save Translations",
    zh: "保存翻译",
    "zh-TW": "儲存翻譯",
    ja: "翻訳を保存",
    ko: "번역 저장",
    fr: "Enregistrer les traductions",
    es: "Guardar traducciones",
    de: "Übersetzungen speichern",
    ru: "Сохранить переводы",
  },
  "i18n.filter.module": {
    en: "Filter by module",
    zh: "按模块筛选",
    "zh-TW": "按模組篩選",
    ja: "モジュールでフィルター",
    ko: "모듈별 필터",
    fr: "Filtrer par module",
    es: "Filtrar por módulo",
    de: "Nach Modul filtern",
    ru: "Фильтр по модулю",
  },
  "i18n.filter.show": {
    en: "Display options",
    zh: "显示选项",
    "zh-TW": "顯示選項",
    ja: "表示オプション",
    ko: "표시 옵션",
    fr: "Options d'affichage",
    es: "Opciones de visualización",
    de: "Anzeigeoptionen",
    ru: "Параметры отображения",
  },
  "i18n.filter.all": {
    en: "All",
    zh: "全部",
    "zh-TW": "全部",
    ja: "すべて",
    ko: "전체",
    fr: "Tous",
    es: "Todos",
    de: "Alle",
    ru: "Все",
  },
  "i18n.filter.only_untranslated": {
    en: "Only show entries with untranslated values",
    zh: "只显示有未翻译值的条目",
    "zh-TW": "只顯示有未翻譯值的條目",
    ja: "未翻訳の値があるエントリのみ表示",
    ko: "번역되지 않은 값이 있는 항목만 표시",
    fr: "Afficher uniquement les entrées avec des valeurs non traduites",
    es: "Mostrar solo entradas con valores sin traducir",
    de: "Nur Einträge mit unübersetzten Werten anzeigen",
    ru: "Показывать только записи с непереведёнными значениями",
  },
  "i18n.filter.locale": {
    en: "Toggle locale columns",
    zh: "切换语言列显示",
    "zh-TW": "切換語言列顯示",
    ja: "ロケール列の切り替え",
    ko: "로케일 열 전환",
    fr: "Basculer les colonnes de langue",
    es: "Alternar columnas de idioma",
    de: "Spaltenspalten umschalten",
    ru: "Переключить столбцы языков",
  },
  "i18n.info.title": {
    en: "How overrides work",
    zh: "覆盖机制说明",
    "zh-TW": "覆蓋機制說明",
    ja: "オーバーライドの仕組み",
    ko: "재정의 작동 방식",
    fr: "Fonctionnement des remplacements",
    es: "Cómo funcionan las anulaciones",
    de: "Wie Überschreibungen funktionieren",
    ru: "Как работают переопределения",
  },
  "i18n.info.body": {
    en: "Custom values entered here override the built-in defaults. Clear all fields for a key to restore it to defaults. The default locale ({locale}) is used as a fallback when a translation is missing.",
    zh: "在此处输入的值会覆盖内置默认值。清空某个 key 的所有字段即可恢复默认。当翻译缺失时，将使用默认语言（{locale}）作为回退。",
    "zh-TW": "在此處輸入的值會覆蓋內建預設值。清空某個 key 的所有欄位即可恢復預設。當翻譯缺失時，將使用預設語言（{locale}）作為回退。",
    ja: "ここで入力した値は組み込みのデフォルト値を上書きします。キーのすべてのフィールドをクリアするとデフォルトに戻ります。翻訳がない場合は、デフォルトロケール（{locale}）にフォールバックします。",
    ko: "여기에 입력한 값은 기본 제공되는 기본값을 덮어씁니다. 키의 모든 필드를 비우면 기본값으로 복원됩니다. 번역이 없는 경우 기본 로케일({locale})이 대체값으로 사용됩니다.",
    fr: "Les valeurs saisies ici remplacent les valeurs par défaut intégrées. Videz tous les champs d'une clé pour restaurer les valeurs par défaut. La langue par défaut ({locale}) est utilisée comme secours lorsqu'une traduction est manquante.",
    es: "Los valores personalizados introducidos aquí anulan los valores predeterminados integrados. Borre todos los campos de una clave para restaurar los valores predeterminados. El idioma predeterminado ({locale}) se utiliza como alternativa cuando falta una traducción.",
    de: "Hier eingegebene Werte überschreiben die eingebauten Standardwerte. Leeren Sie alle Felder eines Schlüssels, um die Standardwerte wiederherzustellen. Das Standardgebietsschema ({locale}) wird als Fallback verwendet, wenn eine Übersetzung fehlt.",
    ru: "Значения, введённые здесь, переопределяют встроенные по умолчанию. Очистите все поля ключа, чтобы восстановить значения по умолчанию. Язык по умолчанию ({locale}) используется как запасной, если перевод отсутствует.",
  },
};

export interface TFunction {
  (key: string, params?: Record<string, string | number>): string;
}

let runtimeOverrides: Record<string, Partial<Record<string, string>>> = {};
let siteDefaultLocale: LocaleCode = DEFAULT_LOCALE;

export function setTranslationOverrides(
  overrides: Record<string, Partial<Record<string, string>>>,
): void {
  runtimeOverrides = overrides || {};
}

export function getTranslationOverrides(): Record<
  string,
  Partial<Record<string, string>>
> {
  return runtimeOverrides;
}

export function setSiteDefaultLocale(locale: string | undefined | null): void {
  if (!locale) {
    siteDefaultLocale = DEFAULT_LOCALE;
    return;
  }
  siteDefaultLocale = normalizeLocale(locale);
}

export function getSiteDefaultLocale(): LocaleCode {
  return siteDefaultLocale;
}

export function getAllTranslationKeys(): string[] {
  const defaults = Object.keys(translations);
  const overrideKeys = Object.keys(runtimeOverrides);
  return [...new Set([...defaults, ...overrideKeys])].sort();
}

export function createT(locale: string = DEFAULT_LOCALE): TFunction {
  const normalizedLocale = normalizeLocale(locale);

  return (key: string, params?: Record<string, string | number>): string => {
    const overrideEntry = runtimeOverrides[key];
    if (overrideEntry && overrideEntry[normalizedLocale]) {
      let str = overrideEntry[normalizedLocale]!;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return str;
    }

    const entry = translations[key];
    if (!entry) return key;

    let str =
      entry[normalizedLocale] ??
      entry[siteDefaultLocale] ??
      entry[DEFAULT_LOCALE] ??
      key;

    if (params) {
      for (const [k, v] of Object.entries(params)) {
        str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      }
    }

    return str;
  };
}

export function normalizeLocale(locale: string): LocaleCode {
  if (!locale) return DEFAULT_LOCALE;

  const lower = locale.toLowerCase();

  const directMatch = SUPPORTED_LOCALES.find(
    (l) => l.code.toLowerCase() === lower,
  );
  if (directMatch) return directMatch.code as LocaleCode;

  const aliases: Record<string, LocaleCode> = {
    "zh-cn": "zh",
    cn: "zh",
    "zh-hans": "zh",
    "zh-hant": "zh-TW",
    tw: "zh-TW",
    jp: "ja",
    kr: "ko",
    "ru-ru": "ru",
    russian: "ru",
  };
  const aliasMatch = aliases[lower];
  if (aliasMatch) return aliasMatch;

  return DEFAULT_LOCALE;
}

export function detectLocaleFromHeader(
  acceptLanguage: string | undefined,
): LocaleCode {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const [code, weightStr] = lang.trim().split(";");
      const weight = weightStr ? parseFloat(weightStr.split("=")[1]) : 1;
      return { code: code.trim(), weight };
    })
    .sort((a, b) => b.weight - a.weight);

  for (const lang of languages) {
    const normalized = normalizeLocale(lang.code);
    if (normalized !== DEFAULT_LOCALE || lang.code.toLowerCase().startsWith("en")) {
      return normalized;
    }
  }

  return DEFAULT_LOCALE;
}

export function isSupportedLocale(locale: string): boolean {
  return SUPPORTED_LOCALES.some((l) => l.code === locale);
}