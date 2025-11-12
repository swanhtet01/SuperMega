import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "my";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
  en: {
    // App
    "app.title": "Yangon Tyre Factory",
    "app.subtitle": "Business Management System",
    
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.production": "Production",
    "nav.quality": "Quality Control",
    "nav.sales": "Sales",
    "nav.inventory": "Inventory",
    "nav.financial": "Financial",
    "nav.communication": "Communication",
    "nav.settings": "Settings",
    "nav.logout": "Logout",
    
    // Dashboard
    "dashboard.title": "Executive Dashboard",
    "dashboard.production": "Production",
    "dashboard.sales": "Sales",
    "dashboard.inventory": "Inventory",
    "dashboard.financial": "Financial",
    "dashboard.quality": "Quality",
    "dashboard.totalProduced": "Total Produced",
    "dashboard.approvalRate": "Approval Rate",
    "dashboard.defectRate": "Defect Rate",
    "dashboard.rejectionRate": "Rejection Rate",
    "dashboard.totalOrders": "Total Orders",
    "dashboard.revenue": "Revenue",
    "dashboard.lowStock": "Low Stock Items",
    "dashboard.insights": "AI Insights",
    "dashboard.announcements": "Announcements",
    
    // Production
    "production.title": "Production Entry",
    "production.date": "Production Date",
    "production.batch": "Batch Number",
    "production.shift": "Shift Type",
    "production.tireSize": "Tire Size",
    "production.batchCode": "Batch Code",
    "production.curingA": "Curing A (Approved)",
    "production.curingB": "Curing B (Defect)",
    "production.curingR": "Curing R (Rejected)",
    "production.total": "Total Produced",
    "production.supervisor": "Supervisor",
    "production.notes": "Notes",
    "production.submit": "Submit Production Record",
    
    // Common
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.export": "Export",
    "common.loading": "Loading...",
    "common.success": "Success",
    "common.error": "Error",
    "common.confirm": "Confirm",
    "common.yes": "Yes",
    "common.no": "No",
  },
  my: {
    // App
    "app.title": "ရန်ကုန်တာယာစက်ရုံ",
    "app.subtitle": "စီမံခန့်ခွဲမှုစနစ်",
    
    // Navigation
    "nav.dashboard": "ဒက်ရှ်ဘုတ်",
    "nav.production": "ထုတ်လုပ်မှု",
    "nav.quality": "အရည်အသွေးထိန်းချုပ်မှု",
    "nav.sales": "အရောင်း",
    "nav.inventory": "စာရင်းစစ်",
    "nav.financial": "ဘဏ္ဍာရေး",
    "nav.communication": "ဆက်သွယ်ရေး",
    "nav.settings": "ဆက်တင်များ",
    "nav.logout": "ထွက်မည်",
    
    // Dashboard
    "dashboard.title": "အမှုဆောင်ဒက်ရှ်ဘုတ်",
    "dashboard.production": "ထုတ်လုပ်မှု",
    "dashboard.sales": "အရောင်း",
    "dashboard.inventory": "စာရင်းစစ်",
    "dashboard.financial": "ဘဏ္ဍာရေး",
    "dashboard.quality": "အရည်အသွေး",
    "dashboard.totalProduced": "စုစုပေါင်းထုတ်လုပ်မှု",
    "dashboard.approvalRate": "အတည်ပြုနှုန်း",
    "dashboard.defectRate": "ချွတ်ယွင်းမှုနှုန်း",
    "dashboard.rejectionRate": "ငြင်းပယ်မှုနှုန်း",
    "dashboard.totalOrders": "စုစုပေါင်းအော်ဒါများ",
    "dashboard.revenue": "ဝင်ငွေ",
    "dashboard.lowStock": "စတော့နည်းပါးသောပစ္စည်းများ",
    "dashboard.insights": "AI ထိုးထွင်းသိမြင်မှုများ",
    "dashboard.announcements": "ကြေညာချက်များ",
    
    // Production
    "production.title": "ထုတ်လုပ်မှုမှတ်တမ်း",
    "production.date": "ထုတ်လုပ်သည့်ရက်",
    "production.batch": "အသုတ်နံပါတ်",
    "production.shift": "အလုပ်ချိန်",
    "production.tireSize": "တာယာအရွယ်အစား",
    "production.batchCode": "အသုတ်ကုဒ်",
    "production.curingA": "Curing A (အတည်ပြု)",
    "production.curingB": "Curing B (ချွတ်ယွင်း)",
    "production.curingR": "Curing R (ငြင်းပယ်)",
    "production.total": "စုစုပေါင်းထုတ်လုပ်မှု",
    "production.supervisor": "ကြီးကြပ်ရေးမှူး",
    "production.notes": "မှတ်ချက်များ",
    "production.submit": "ထုတ်လုပ်မှုမှတ်တမ်းတင်သွင်းမည်",
    
    // Common
    "common.save": "သိမ်းမည်",
    "common.cancel": "ပယ်ဖျက်မည်",
    "common.edit": "ပြင်ဆင်မည်",
    "common.delete": "ဖျက်မည်",
    "common.search": "ရှာမည်",
    "common.filter": "စစ်ထုတ်မည်",
    "common.export": "ပို့ထုတ်မည်",
    "common.loading": "တင်နေသည်...",
    "common.success": "အောင်မြင်သည်",
    "common.error": "အမှားအယွင်း",
    "common.confirm": "အတည်ပြုမည်",
    "common.yes": "ဟုတ်ကဲ့",
    "common.no": "မဟုတ်ပါ",
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("ytf-language");
    return (saved as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("ytf-language", language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}

