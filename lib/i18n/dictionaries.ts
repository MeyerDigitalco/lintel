export interface Language { code: string; name: string; nativeName: string; rtl?: boolean }

export const LANGUAGES: Record<string, Language> = {
  en: { code: "en", name: "English", nativeName: "English" },
  es: { code: "es", name: "Spanish", nativeName: "Español" },
  fr: { code: "fr", name: "French", nativeName: "Français" },
  de: { code: "de", name: "German", nativeName: "Deutsch" },
  ar: { code: "ar", name: "Arabic", nativeName: "العربية", rtl: true },
  hi: { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  it: { code: "it", name: "Italian", nativeName: "Italiano" },
  pt: { code: "pt", name: "Portuguese", nativeName: "Português" },
  ja: { code: "ja", name: "Japanese", nativeName: "日本語" },
};

export const COUNTRY_LANGUAGES: Record<string, string[]> = {
  GB: ["en"], US: ["en", "es"], AE: ["en", "ar"], ZA: ["en"], AU: ["en"], NZ: ["en"],
  CA: ["en", "fr"], IE: ["en"], DE: ["de", "en"], ES: ["es", "en"], IN: ["en", "hi"],
  FR: ["fr", "en"], NL: ["en"], SG: ["en"], IT: ["it", "en"], PT: ["pt", "en"],
  CH: ["de", "fr", "en"], JP: ["ja", "en"], MX: ["es", "en"], BR: ["pt", "en"],
  BE: ["fr", "en"], AT: ["de", "en"], PL: ["en"], SA: ["ar", "en"], QA: ["ar", "en"], HK: ["en"],
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
  it: { "nav.overview": "Panoramica", "nav.properties": "Immobili", "nav.contacts": "Contatti", "nav.income": "Entrate e spese", "nav.invoices": "Fatture", "nav.rent": "Registro affitti", "nav.court": "Pronto per il tribunale", "nav.maintenance": "Manutenzione", "nav.tasks": "Attività", "nav.notice": "Generatore di avvisi", "nav.compliance": "Conformità", "nav.region": "Regole regionali", "nav.documents": "Documenti", "nav.toolkit": "Strumenti", "nav.reports": "Report", "nav.assistant": "Assistente", "nav.tax": "Tasse", "nav.accountant": "Commercialista", "nav.settings": "Impostazioni" },
  pt: { "nav.overview": "Visão geral", "nav.properties": "Imóveis", "nav.contacts": "Contactos", "nav.income": "Receitas e despesas", "nav.invoices": "Faturas", "nav.rent": "Registo de rendas", "nav.court": "Preparação judicial", "nav.maintenance": "Manutenção", "nav.tasks": "Tarefas", "nav.notice": "Gerador de notificações", "nav.compliance": "Conformidade", "nav.region": "Regras regionais", "nav.documents": "Documentos", "nav.toolkit": "Ferramentas", "nav.reports": "Relatórios", "nav.assistant": "Assistente", "nav.tax": "Impostos", "nav.accountant": "Contabilista", "nav.settings": "Definições" },
  ja: { "nav.overview": "概要", "nav.properties": "物件", "nav.contacts": "連絡先", "nav.income": "収入と経費", "nav.invoices": "請求書", "nav.rent": "家賃台帳", "nav.court": "訴訟準備", "nav.maintenance": "メンテナンス", "nav.tasks": "タスク", "nav.notice": "通知ジェネレーター", "nav.compliance": "コンプライアンス", "nav.region": "地域ルール", "nav.documents": "書類", "nav.toolkit": "ツール", "nav.reports": "レポート", "nav.assistant": "アシスタント", "nav.tax": "税金", "nav.accountant": "会計士", "nav.settings": "設定" },
};

const DASH_DICT: Record<string, Record<string, string>> = {
  en: { "dash.title": "Overview", "dash.getting_started": "Getting started", "dash.step_property": "Add a property", "dash.step_tenancy": "Add a tenancy", "dash.step_compliance": "Track compliance", "dash.step_documents": "Upload documents", "dash.stat_properties": "Properties", "dash.stat_income": "Income (year)", "dash.stat_expenses": "Expenses (year)", "dash.stat_arrears": "Arrears", "dash.compliance_due": "Compliance due soon", "dash.tasks": "Tasks" },
  es: { "dash.title": "Resumen", "dash.getting_started": "Primeros pasos", "dash.step_property": "Añadir propiedad", "dash.step_tenancy": "Añadir contrato", "dash.step_compliance": "Seguir cumplimiento", "dash.step_documents": "Subir documentos", "dash.stat_properties": "Propiedades", "dash.stat_income": "Ingresos (año)", "dash.stat_expenses": "Gastos (año)", "dash.stat_arrears": "Atrasos", "dash.compliance_due": "Cumplimiento próximo", "dash.tasks": "Tareas" },
  fr: { "dash.title": "Aperçu", "dash.getting_started": "Prise en main", "dash.step_property": "Ajouter un bien", "dash.step_tenancy": "Ajouter une location", "dash.step_compliance": "Suivre la conformité", "dash.step_documents": "Téléverser des documents", "dash.stat_properties": "Biens", "dash.stat_income": "Revenus (année)", "dash.stat_expenses": "Dépenses (année)", "dash.stat_arrears": "Impayés", "dash.compliance_due": "Conformité à échéance", "dash.tasks": "Tâches" },
  de: { "dash.title": "Übersicht", "dash.getting_started": "Erste Schritte", "dash.step_property": "Immobilie hinzufügen", "dash.step_tenancy": "Mietverhältnis hinzufügen", "dash.step_compliance": "Compliance verfolgen", "dash.step_documents": "Dokumente hochladen", "dash.stat_properties": "Immobilien", "dash.stat_income": "Einnahmen (Jahr)", "dash.stat_expenses": "Ausgaben (Jahr)", "dash.stat_arrears": "Rückstände", "dash.compliance_due": "Compliance bald fällig", "dash.tasks": "Aufgaben" },
  ar: { "dash.title": "نظرة عامة", "dash.getting_started": "البدء", "dash.step_property": "إضافة عقار", "dash.step_tenancy": "إضافة عقد إيجار", "dash.step_compliance": "متابعة الامتثال", "dash.step_documents": "رفع المستندات", "dash.stat_properties": "العقارات", "dash.stat_income": "الدخل (السنة)", "dash.stat_expenses": "المصروفات (السنة)", "dash.stat_arrears": "المتأخرات", "dash.compliance_due": "الامتثال المستحق قريبًا", "dash.tasks": "المهام" },
  hi: { "dash.title": "अवलोकन", "dash.getting_started": "शुरूआत", "dash.step_property": "संपत्ति जोड़ें", "dash.step_tenancy": "किरायेदारी जोड़ें", "dash.step_compliance": "अनुपालन ट्रैक करें", "dash.step_documents": "दस्तावेज़ अपलोड करें", "dash.stat_properties": "संपत्तियाँ", "dash.stat_income": "आय (वर्ष)", "dash.stat_expenses": "व्यय (वर्ष)", "dash.stat_arrears": "बकाया", "dash.compliance_due": "शीघ्र देय अनुपालन", "dash.tasks": "कार्य" },
  it: { "dash.title": "Panoramica", "dash.getting_started": "Per iniziare", "dash.step_property": "Aggiungi immobile", "dash.step_tenancy": "Aggiungi locazione", "dash.step_compliance": "Monitora la conformità", "dash.step_documents": "Carica documenti", "dash.stat_properties": "Immobili", "dash.stat_income": "Entrate (anno)", "dash.stat_expenses": "Spese (anno)", "dash.stat_arrears": "Morosità", "dash.compliance_due": "Conformità in scadenza", "dash.tasks": "Attività" },
  pt: { "dash.title": "Visão geral", "dash.getting_started": "Primeiros passos", "dash.step_property": "Adicionar imóvel", "dash.step_tenancy": "Adicionar arrendamento", "dash.step_compliance": "Acompanhar conformidade", "dash.step_documents": "Carregar documentos", "dash.stat_properties": "Imóveis", "dash.stat_income": "Receitas (ano)", "dash.stat_expenses": "Despesas (ano)", "dash.stat_arrears": "Rendas em atraso", "dash.compliance_due": "Conformidade a vencer", "dash.tasks": "Tarefas" },
  ja: { "dash.title": "概要", "dash.getting_started": "はじめに", "dash.step_property": "物件を追加", "dash.step_tenancy": "賃貸借を追加", "dash.step_compliance": "コンプライアンスを管理", "dash.step_documents": "書類をアップロード", "dash.stat_properties": "物件", "dash.stat_income": "収入（年）", "dash.stat_expenses": "経費（年）", "dash.stat_arrears": "滞納", "dash.compliance_due": "近く期限のコンプライアンス", "dash.tasks": "タスク" },
};

export function translate(lang: string, key: string): string {
  return DICTIONARIES[lang]?.[key] ?? DASH_DICT[lang]?.[key] ?? DICTIONARIES.en[key] ?? DASH_DICT.en[key] ?? key;
}
