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
  he: { code: "he", name: "Hebrew", nativeName: "עברית", rtl: true },
};

export const COUNTRY_LANGUAGES: Record<string, string[]> = {
  GB: ["en"], US: ["en", "es"], AE: ["en", "ar"], ZA: ["en"], AU: ["en"], NZ: ["en"],
  CA: ["en", "fr"], IE: ["en"], DE: ["de", "en"], ES: ["es", "en"], IN: ["en", "hi"],
  FR: ["fr", "en"], NL: ["en"], SG: ["en"], IT: ["it", "en"], PT: ["pt", "en"],
  CH: ["de", "fr", "en"], JP: ["ja", "en"], MX: ["es", "en"], BR: ["pt", "en"],
  BE: ["fr", "en"], AT: ["de", "en"], PL: ["en"], SA: ["ar", "en"], QA: ["ar", "en"], HK: ["en"], IL: ["he", "en"],
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
    "nav.overview": "Home", "nav.properties": "Properties", "nav.contacts": "Contacts",
    "nav.income": "Income & expenses", "nav.invoices": "Invoices", "nav.rent": "Rent",
    "nav.court": "Court ready", "nav.maintenance": "Maintenance", "nav.tasks": "Tasks",
    "nav.notice": "Notices", "nav.agreement": "Tenancy agreements", "nav.compliance": "Compliance", "nav.region": "Region rules",
    "nav.documents": "Documents", "nav.toolkit": "Toolkit", "nav.reports": "Reports",
    "nav.assistant": "AI assistant", "nav.tax": "Tax & MTD", "nav.accountant": "Accountant", "nav.settings": "Settings", "nav.leads": "Leads",
  },
  es: {
    "nav.overview": "Resumen", "nav.properties": "Propiedades", "nav.contacts": "Contactos",
    "nav.income": "Ingresos y gastos", "nav.invoices": "Facturas", "nav.rent": "Libro de alquileres",
    "nav.court": "Preparación judicial", "nav.maintenance": "Mantenimiento", "nav.tasks": "Tareas",
    "nav.notice": "Generador de notificaciones", "nav.agreement": "Contratos de arrendamiento", "nav.compliance": "Cumplimiento", "nav.region": "Normas regionales",
    "nav.documents": "Documentos", "nav.toolkit": "Herramientas", "nav.reports": "Informes",
    "nav.assistant": "Asistente", "nav.tax": "Impuestos", "nav.accountant": "Contable", "nav.settings": "Ajustes", "nav.leads": "Leads",
  },
  fr: {
    "nav.overview": "Aperçu", "nav.properties": "Biens", "nav.contacts": "Contacts",
    "nav.income": "Revenus et dépenses", "nav.invoices": "Factures", "nav.rent": "Registre des loyers",
    "nav.court": "Préparation au tribunal", "nav.maintenance": "Maintenance", "nav.tasks": "Tâches",
    "nav.notice": "Générateur d'avis", "nav.agreement": "Contrats de location", "nav.compliance": "Conformité", "nav.region": "Règles régionales",
    "nav.documents": "Documents", "nav.toolkit": "Boîte à outils", "nav.reports": "Rapports",
    "nav.assistant": "Assistant", "nav.tax": "Impôts", "nav.accountant": "Comptable", "nav.settings": "Paramètres", "nav.leads": "Leads",
  },
  de: {
    "nav.overview": "Übersicht", "nav.properties": "Immobilien", "nav.contacts": "Kontakte",
    "nav.income": "Einnahmen & Ausgaben", "nav.invoices": "Rechnungen", "nav.rent": "Mietbuch",
    "nav.court": "Gerichtsbereitschaft", "nav.maintenance": "Instandhaltung", "nav.tasks": "Aufgaben",
    "nav.notice": "Kündigungsgenerator", "nav.agreement": "Mietverträge", "nav.compliance": "Compliance", "nav.region": "Regionale Regeln",
    "nav.documents": "Dokumente", "nav.toolkit": "Werkzeuge", "nav.reports": "Berichte",
    "nav.assistant": "Assistent", "nav.tax": "Steuern", "nav.accountant": "Steuerberater", "nav.settings": "Einstellungen", "nav.leads": "Leads",
  },
  ar: {
    "nav.overview": "نظرة عامة", "nav.properties": "العقارات", "nav.contacts": "جهات الاتصال",
    "nav.income": "الدخل والمصروفات", "nav.invoices": "الفواتير", "nav.rent": "سجل الإيجارات",
    "nav.court": "الجاهزية القضائية", "nav.maintenance": "الصيانة", "nav.tasks": "المهام",
    "nav.notice": "منشئ الإشعارات", "nav.agreement": "عقود الإيجار", "nav.compliance": "الامتثال", "nav.region": "قواعد المنطقة",
    "nav.documents": "المستندات", "nav.toolkit": "الأدوات", "nav.reports": "التقارير",
    "nav.assistant": "المساعد", "nav.tax": "الضرائب", "nav.accountant": "المحاسب", "nav.settings": "الإعدادات", "nav.leads": "العملاء المحتملون",
  },
  hi: {
    "nav.overview": "अवलोकन", "nav.properties": "संपत्तियाँ", "nav.contacts": "संपर्क",
    "nav.income": "आय और व्यय", "nav.invoices": "चालान", "nav.rent": "किराया बही",
    "nav.court": "न्यायालय तैयारी", "nav.maintenance": "रखरखाव", "nav.tasks": "कार्य",
    "nav.notice": "नोटिस जनरेटर", "nav.agreement": "किरायेदारी अनुबंध", "nav.compliance": "अनुपालन", "nav.region": "क्षेत्रीय नियम",
    "nav.documents": "दस्तावेज़", "nav.toolkit": "टूलकिट", "nav.reports": "रिपोर्ट",
    "nav.assistant": "सहायक", "nav.tax": "कर", "nav.accountant": "लेखाकार", "nav.settings": "सेटिंग्स", "nav.leads": "लीड्स",
  },
  it: { "nav.overview": "Panoramica", "nav.properties": "Immobili", "nav.contacts": "Contatti", "nav.income": "Entrate e spese", "nav.invoices": "Fatture", "nav.rent": "Registro affitti", "nav.court": "Pronto per il tribunale", "nav.maintenance": "Manutenzione", "nav.tasks": "Attività", "nav.notice": "Generatore di avvisi", "nav.agreement": "Contratti di locazione", "nav.compliance": "Conformità", "nav.region": "Regole regionali", "nav.documents": "Documenti", "nav.toolkit": "Strumenti", "nav.reports": "Report", "nav.assistant": "Assistente", "nav.tax": "Tasse", "nav.accountant": "Commercialista", "nav.settings": "Impostazioni", "nav.leads": "Lead" },
  pt: { "nav.overview": "Visão geral", "nav.properties": "Imóveis", "nav.contacts": "Contactos", "nav.income": "Receitas e despesas", "nav.invoices": "Faturas", "nav.rent": "Registo de rendas", "nav.court": "Preparação judicial", "nav.maintenance": "Manutenção", "nav.tasks": "Tarefas", "nav.notice": "Gerador de notificações", "nav.agreement": "Contratos de arrendamento", "nav.compliance": "Conformidade", "nav.region": "Regras regionais", "nav.documents": "Documentos", "nav.toolkit": "Ferramentas", "nav.reports": "Relatórios", "nav.assistant": "Assistente", "nav.tax": "Impostos", "nav.accountant": "Contabilista", "nav.settings": "Definições", "nav.leads": "Leads" },
  ja: { "nav.overview": "概要", "nav.properties": "物件", "nav.contacts": "連絡先", "nav.income": "収入と経費", "nav.invoices": "請求書", "nav.rent": "家賃台帳", "nav.court": "訴訟準備", "nav.maintenance": "メンテナンス", "nav.tasks": "タスク", "nav.notice": "通知ジェネレーター", "nav.agreement": "賃貸借契約書", "nav.compliance": "コンプライアンス", "nav.region": "地域ルール", "nav.documents": "書類", "nav.toolkit": "ツール", "nav.reports": "レポート", "nav.assistant": "アシスタント", "nav.tax": "税金", "nav.accountant": "会計士", "nav.settings": "設定", "nav.leads": "リード" },
  he: { "nav.overview": "בית", "nav.properties": "נכסים", "nav.contacts": "אנשי קשר", "nav.income": "הכנסות והוצאות", "nav.invoices": "חשבוניות", "nav.rent": "שכר דירה", "nav.court": "מוכנות משפטית", "nav.maintenance": "תחזוקה", "nav.tasks": "משימות", "nav.notice": "מחולל הודעות", "nav.agreement": "הסכמי שכירות", "nav.compliance": "תאימות", "nav.region": "כללי אזור", "nav.documents": "מסמכים", "nav.toolkit": "ערכת כלים", "nav.reports": "דוחות", "nav.assistant": "עוזר AI", "nav.tax": "מס", "nav.accountant": "רואה חשבון", "nav.settings": "הגדרות", "nav.leads": "לידים" },
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
  he: { "dash.title": "סקירה", "dash.getting_started": "תחילת עבודה", "dash.step_property": "הוספת נכס", "dash.step_tenancy": "הוספת שכירות", "dash.step_compliance": "מעקב תאימות", "dash.step_documents": "העלאת מסמכים", "dash.stat_properties": "נכסים", "dash.stat_income": "הכנסה (שנה)", "dash.stat_expenses": "הוצאות (שנה)", "dash.stat_arrears": "פיגורים", "dash.compliance_due": "תאימות לקראת מועד", "dash.tasks": "משימות" },
};

const PAGE_DICT: Record<string, Record<string, string>> = {
  en: { "p.props_title": "Properties", "p.props_sub": "Each property loads its nation's tenancy and compliance rules.", "p.add_property": "Add property", "p.no_props": "No properties yet", "p.no_props_body": "Add your first property to start tracking income, compliance and rent.", "p.rent_title": "Rent ledger", "p.rent_sub": "Charges and payments across your tenancies.", "p.overdue": "Overdue", "p.overdue_total": "Overdue total", "p.no_rent": "No rent records", "p.docs_title": "Documents", "p.docs_sub": "Every document across your portfolio, filter by type, property or status." },
  es: { "p.props_title": "Propiedades", "p.props_sub": "Cada propiedad carga las normas de su país.", "p.add_property": "Añadir propiedad", "p.no_props": "Aún no hay propiedades", "p.no_props_body": "Añade tu primera propiedad para empezar.", "p.rent_title": "Libro de alquileres", "p.rent_sub": "Cargos y pagos de tus contratos.", "p.overdue": "Atrasado", "p.overdue_total": "Total atrasado", "p.no_rent": "Sin registros de alquiler", "p.docs_title": "Documentos", "p.docs_sub": "Todos tus documentos, filtra por tipo, propiedad o estado." },
  fr: { "p.props_title": "Biens", "p.props_sub": "Chaque bien charge les règles de son pays.", "p.add_property": "Ajouter un bien", "p.no_props": "Aucun bien", "p.no_props_body": "Ajoutez votre premier bien pour commencer.", "p.rent_title": "Registre des loyers", "p.rent_sub": "Charges et paiements de vos locations.", "p.overdue": "En retard", "p.overdue_total": "Total en retard", "p.no_rent": "Aucun enregistrement", "p.docs_title": "Documents", "p.docs_sub": "Tous vos documents, filtrez par type, bien ou statut." },
  de: { "p.props_title": "Immobilien", "p.props_sub": "Jede Immobilie lädt die Regeln ihres Landes.", "p.add_property": "Immobilie hinzufügen", "p.no_props": "Noch keine Immobilien", "p.no_props_body": "Fügen Sie Ihre erste Immobilie hinzu.", "p.rent_title": "Mietbuch", "p.rent_sub": "Forderungen und Zahlungen Ihrer Mietverhältnisse.", "p.overdue": "Überfällig", "p.overdue_total": "Überfällig gesamt", "p.no_rent": "Keine Mieteinträge", "p.docs_title": "Dokumente", "p.docs_sub": "Alle Dokumente, nach Typ, Immobilie oder Status filtern." },
  ar: { "p.props_title": "العقارات", "p.props_sub": "كل عقار يحمّل قواعد بلده.", "p.add_property": "إضافة عقار", "p.no_props": "لا توجد عقارات بعد", "p.no_props_body": "أضف أول عقار للبدء.", "p.rent_title": "سجل الإيجارات", "p.rent_sub": "الرسوم والمدفوعات عبر عقودك.", "p.overdue": "متأخر", "p.overdue_total": "إجمالي المتأخر", "p.no_rent": "لا سجلات إيجار", "p.docs_title": "المستندات", "p.docs_sub": "كل مستنداتك, صفِّ حسب النوع أو العقار أو الحالة." },
  hi: { "p.props_title": "संपत्तियाँ", "p.props_sub": "हर संपत्ति अपने देश के नियम लोड करती है.", "p.add_property": "संपत्ति जोड़ें", "p.no_props": "अभी कोई संपत्ति नहीं", "p.no_props_body": "शुरू करने के लिए पहली संपत्ति जोड़ें.", "p.rent_title": "किराया बही", "p.rent_sub": "आपकी किरायेदारियों के शुल्क और भुगतान.", "p.overdue": "बकाया", "p.overdue_total": "कुल बकाया", "p.no_rent": "कोई किराया रिकॉर्ड नहीं", "p.docs_title": "दस्तावेज़", "p.docs_sub": "सभी दस्तावेज़, प्रकार, संपत्ति या स्थिति से फ़िल्टर करें." },
  it: { "p.props_title": "Immobili", "p.props_sub": "Ogni immobile carica le regole del suo paese.", "p.add_property": "Aggiungi immobile", "p.no_props": "Ancora nessun immobile", "p.no_props_body": "Aggiungi il primo immobile per iniziare.", "p.rent_title": "Registro affitti", "p.rent_sub": "Canoni e pagamenti delle tue locazioni.", "p.overdue": "Scaduto", "p.overdue_total": "Totale scaduto", "p.no_rent": "Nessun registro affitti", "p.docs_title": "Documenti", "p.docs_sub": "Tutti i documenti, filtra per tipo, immobile o stato." },
  pt: { "p.props_title": "Imóveis", "p.props_sub": "Cada imóvel carrega as regras do seu país.", "p.add_property": "Adicionar imóvel", "p.no_props": "Ainda sem imóveis", "p.no_props_body": "Adicione o primeiro imóvel para começar.", "p.rent_title": "Registo de rendas", "p.rent_sub": "Encargos e pagamentos dos seus arrendamentos.", "p.overdue": "Em atraso", "p.overdue_total": "Total em atraso", "p.no_rent": "Sem registos de renda", "p.docs_title": "Documentos", "p.docs_sub": "Todos os documentos, filtre por tipo, imóvel ou estado." },
  ja: { "p.props_title": "物件", "p.props_sub": "各物件はその国のルールを読み込みます。", "p.add_property": "物件を追加", "p.no_props": "物件がまだありません", "p.no_props_body": "最初の物件を追加して始めましょう。", "p.rent_title": "家賃台帳", "p.rent_sub": "賃貸借の請求と支払い。", "p.overdue": "延滞", "p.overdue_total": "延滞合計", "p.no_rent": "家賃記録なし", "p.docs_title": "書類", "p.docs_sub": "すべての書類, 種類・物件・状態で絞り込み。" },
  he: { "p.props_title": "נכסים", "p.props_sub": "כל נכס טוען את כללי השכירות והתאימות של מדינתו.", "p.add_property": "הוספת נכס", "p.no_props": "אין נכסים עדיין", "p.no_props_body": "הוסף נכס ראשון כדי להתחיל לעקוב אחר הכנסות, תאימות ושכר דירה.", "p.rent_title": "ספר שכר דירה", "p.rent_sub": "חיובים ותשלומים בכל השכירויות שלך.", "p.overdue": "באיחור", "p.overdue_total": "סך באיחור", "p.no_rent": "אין רשומות שכר דירה", "p.docs_title": "מסמכים", "p.docs_sub": "כל המסמכים בתיק, סינון לפי סוג, נכס או סטטוס." },
};

export function translate(lang: string, key: string): string {
  return DICTIONARIES[lang]?.[key] ?? DASH_DICT[lang]?.[key] ?? PAGE_DICT[lang]?.[key]
    ?? DICTIONARIES.en[key] ?? DASH_DICT.en[key] ?? PAGE_DICT.en[key] ?? key;
}
