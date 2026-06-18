export interface Language { code: string; name: string; nativeName: string; rtl?: boolean }

export const LANGUAGES: Record<string, Language> = {
  en: { code: "en", name: "English", nativeName: "English" },
  es: { code: "es", name: "Spanish", nativeName: "Español" },
  fr: { code: "fr", name: "French", nativeName: "Français" },
  de: { code: "de", name: "German", nativeName: "Deutsch" },
  ar: { code: "ar", name: "Arabic", nativeName: "العربية", rtl: true },
  hi: { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
};

export const COUNTRY_LANGUAGES: Record<string, string[]> = {
  GB: ["en"], US: ["en", "es"], AE: ["en", "ar"], ZA: ["en"], AU: ["en"], NZ: ["en"],
  CA: ["en", "fr"], IE: ["en"], DE: ["de", "en"], ES: ["es", "en"], IN: ["en", "hi"],
  FR: ["fr", "en"], NL: ["en"], SG: ["en"], IT: ["en"], PT: ["en"],
};

export function availableLanguages(country?: string | null): string[] {
  return COUNTRY_LANGUAGES[(country ?? "GB").toUpperCase()] ?? ["en"];
}

export function isRTL(lang: string): boolean {
  return Boolean(LANGUAGES[lang]?.rtl);
}

type Dict = Record<string, string>;

export const DICTIONARIES: Record<string, Dict> = {
  en: {
    "nav.overview": "Overview", "nav.properties": "Properties", "nav.contacts": "Contacts",
    "nav.income": "Income & expenses", "nav.invoices": "Invoices", "nav.rent": "Rent ledger",
    "nav.court": "Court-readiness", "nav.maintenance": "Maintenance", "nav.tasks": "Tasks",
    "nav.notice": "Notice generator", "nav.compliance": "Compliance", "nav.region": "Region rules",
    "nav.documents": "Documents", "nav.toolkit": "Toolkit", "nav.reports": "Reports",
    "nav.assistant": "Assistant", "nav.tax": "Tax & MTD", "nav.accountant": "Accountant", "nav.settings": "Settings",
  },
  es: {
    "nav.overview": "Resumen", "nav.properties": "Propiedades", "nav.contacts": "Contactos",
    "nav.income": "Ingresos y gastos", "nav.invoices": "Facturas", "nav.rent": "Libro de alquileres",
    "nav.court": "Preparación judicial", "nav.maintenance": "Mantenimiento", "nav.tasks": "Tareas",
    "nav.notice": "Generador de notificaciones", "nav.compliance": "Cumplimiento", "nav.region": "Normas regionales",
    "nav.documents": "Documentos", "nav.toolkit": "Herramientas", "nav.reports": "Informes",
    "nav.assistant": "Asistente", "nav.tax": "Impuestos", "nav.accountant": "Contable", "nav.settings": "Ajustes",
  },
  fr: {
    "nav.overview": "Aperçu", "nav.properties": "Biens", "nav.contacts": "Contacts",
    "nav.income": "Revenus et dépenses", "nav.invoices": "Factures", "nav.rent": "Registre des loyers",
    "nav.court": "Préparation au tribunal", "nav.maintenance": "Maintenance", "nav.tasks": "Tâches",
    "nav.notice": "Générateur d'avis", "nav.compliance": "Conformité", "nav.region": "Règles régionales",
    "nav.documents": "Documents", "nav.toolkit": "Boîte à outils", "nav.reports": "Rapports",
    "nav.assistant": "Assistant", "nav.tax": "Impôts", "nav.accountant": "Comptable", "nav.settings": "Paramètres",
  },
  de: {
    "nav.overview": "Übersicht", "nav.properties": "Immobilien", "nav.contacts": "Kontakte",
    "nav.income": "Einnahmen & Ausgaben", "nav.invoices": "Rechnungen", "nav.rent": "Mietbuch",
    "nav.court": "Gerichtsbereitschaft", "nav.maintenance": "Instandhaltung", "nav.tasks": "Aufgaben",
    "nav.notice": "Kündigungsgenerator", "nav.compliance": "Compliance", "nav.region": "Regionale Regeln",
    "nav.documents": "Dokumente", "nav.toolkit": "Werkzeuge", "nav.reports": "Berichte",
    "nav.assistant": "Assistent", "nav.tax": "Steuern", "nav.accountant": "Steuerberater", "nav.settings": "Einstellungen",
  },
  ar: {
    "nav.overview": "نظرة عامة", "nav.properties": "العقارات", "nav.contacts": "جهات الاتصال",
    "nav.income": "الدخل والمصروفات", "nav.invoices": "الفواتير", "nav.rent": "سجل الإيجارات",
    "nav.court": "الجاهزية القضائية", "nav.maintenance": "الصيانة", "nav.tasks": "المهام",
    "nav.notice": "منشئ الإشعارات", "nav.compliance": "الامتثال", "nav.region": "قواعد المنطقة",
    "nav.documents": "المستندات", "nav.toolkit": "الأدوات", "nav.reports": "التقارير",
    "nav.assistant": "المساعد", "nav.tax": "الضرائب", "nav.accountant": "المحاسب", "nav.settings": "الإعدادات",
  },
  hi: {
    "nav.overview": "अवलोकन", "nav.properties": "संपत्तियाँ", "nav.contacts": "संपर्क",
    "nav.income": "आय और व्यय", "nav.invoices": "चालान", "nav.rent": "किराया बही",
    "nav.court": "न्यायालय तैयारी", "nav.maintenance": "रखरखाव", "nav.tasks": "कार्य",
    "nav.notice": "नोटिस जनरेटर", "nav.compliance": "अनुपालन", "nav.region": "क्षेत्रीय नियम",
    "nav.documents": "दस्तावेज़", "nav.toolkit": "टूलकिट", "nav.reports": "रिपोर्ट",
    "nav.assistant": "सहायक", "nav.tax": "कर", "nav.accountant": "लेखाकार", "nav.settings": "सेटिंग्स",
  },
};

export function translate(lang: string, key: string): string {
  return DICTIONARIES[lang]?.[key] ?? DICTIONARIES.en[key] ?? key;
}
