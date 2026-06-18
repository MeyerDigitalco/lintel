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

type Dict = Record<string, string>;
const D: Record<string, Dict> = {
  en: { home: "Home", properties: "Properties", rent: "Rent", repairs: "Repairs", more: "More", compliance: "Compliance", documents: "Documents", court: "Court-readiness", scan: "Scan a receipt", assistant: "Assistant", tasks: "Tasks", region: "Region rules", language: "Language", signout: "Sign out" },
  es: { home: "Inicio", properties: "Propiedades", rent: "Alquiler", repairs: "Reparaciones", more: "Más", compliance: "Cumplimiento", documents: "Documentos", court: "Preparación judicial", scan: "Escanear recibo", assistant: "Asistente", tasks: "Tareas", region: "Normas regionales", language: "Idioma", signout: "Cerrar sesión" },
  fr: { home: "Accueil", properties: "Biens", rent: "Loyer", repairs: "Réparations", more: "Plus", compliance: "Conformité", documents: "Documents", court: "Préparation au tribunal", scan: "Scanner un reçu", assistant: "Assistant", tasks: "Tâches", region: "Règles régionales", language: "Langue", signout: "Déconnexion" },
  de: { home: "Start", properties: "Immobilien", rent: "Miete", repairs: "Reparaturen", more: "Mehr", compliance: "Compliance", documents: "Dokumente", court: "Gerichtsbereitschaft", scan: "Beleg scannen", assistant: "Assistent", tasks: "Aufgaben", region: "Regionale Regeln", language: "Sprache", signout: "Abmelden" },
  ar: { home: "الرئيسية", properties: "العقارات", rent: "الإيجار", repairs: "الإصلاحات", more: "المزيد", compliance: "الامتثال", documents: "المستندات", court: "الجاهزية القضائية", scan: "مسح إيصال", assistant: "المساعد", tasks: "المهام", region: "قواعد المنطقة", language: "اللغة", signout: "تسجيل الخروج" },
  hi: { home: "होम", properties: "संपत्तियाँ", rent: "किराया", repairs: "मरम्मत", more: "अधिक", compliance: "अनुपालन", documents: "दस्तावेज़", court: "न्यायालय तैयारी", scan: "रसीद स्कैन", assistant: "सहायक", tasks: "कार्य", region: "क्षेत्रीय नियम", language: "भाषा", signout: "साइन आउट" },
  it: { home: "Home", properties: "Immobili", rent: "Affitto", repairs: "Riparazioni", more: "Altro", compliance: "Conformità", documents: "Documenti", court: "Pronto per il tribunale", scan: "Scansiona ricevuta", assistant: "Assistente", tasks: "Attività", region: "Regole regionali", language: "Lingua", signout: "Esci" },
  pt: { home: "Início", properties: "Imóveis", rent: "Renda", repairs: "Reparações", more: "Mais", compliance: "Conformidade", documents: "Documentos", court: "Preparação judicial", scan: "Digitalizar recibo", assistant: "Assistente", tasks: "Tarefas", region: "Regras regionais", language: "Idioma", signout: "Terminar sessão" },
  ja: { home: "ホーム", properties: "物件", rent: "家賃", repairs: "修繕", more: "その他", compliance: "コンプライアンス", documents: "書類", court: "訴訟準備", scan: "領収書をスキャン", assistant: "アシスタント", tasks: "タスク", region: "地域ルール", language: "言語", signout: "サインアウト" },
};

export function t(lang: string, key: string): string {
  return D[lang]?.[key] ?? D.en[key] ?? key;
}
