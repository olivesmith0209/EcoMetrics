import * as React from "react";
import { createContext, useState, useContext, useEffect, ReactNode } from "react";

// Define available languages
export type Language = "en" | "de" | "fr" | "es";

// Define translations interface
interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

// Define translations
const translations: Translations = {
  en: {
    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.summary": "Summary",
    "dashboard.emissions": "Emissions",
    "dashboard.recommendations": "Recommendations",
    "dashboard.timeframe.monthly": "Monthly",
    "dashboard.timeframe.quarterly": "Quarterly",
    "dashboard.timeframe.yearly": "Yearly",
    "dashboard.totalEmissions": "Total Emissions",
    "dashboard.scope1": "Scope 1",
    "dashboard.scope2": "Scope 2",
    "dashboard.scope3": "Scope 3",
    "dashboard.dateRange": "Date Range",
    "dashboard.recent": "Recent Emissions",
    "dashboard.emissionsByCategory": "Emissions by Category",
    
    // Profile
    "profile.title": "Settings",
    "profile.subtitle": "Manage your account settings and preferences",
    "profile.tabs.profile": "Profile",
    "profile.tabs.company": "Company",
    "profile.tabs.subscription": "Subscription",
    "profile.tabs.security": "Security",
    "profile.profileInfo": "Profile Information",
    "profile.profileDesc": "Update your personal information and preferences",
    "profile.firstName": "First Name",
    "profile.lastName": "Last Name",
    "profile.email": "Email",
    "profile.language": "Language",
    "profile.saveChanges": "Save Changes",
    "profile.saving": "Saving...",
    
    // Company
    "company.title": "Company Information",
    "company.updateDesc": "Update your company details",
    "company.createDesc": "Add your company information to enable all features",
    "company.name": "Company Name",
    "company.industry": "Industry",
    "company.size": "Company Size",
    "company.address": "Address",
    "company.city": "City",
    "company.country": "Country",
    
    // Security
    "security.title": "Security",
    "security.desc": "Manage your account security settings",
    "security.password": "Password",
    "security.passwordDesc": "Change your password to keep your account secure",
    "security.currentPassword": "Current Password",
    "security.newPassword": "New Password",
    "security.confirmPassword": "Confirm New Password",
    "security.updatePassword": "Update Password",
    "security.updatingPassword": "Updating Password...",
    "security.twoFactor": "Two-Factor Authentication",
    "security.twoFactorDesc": "Add an extra layer of security to your account",
    "security.enable2FA": "Enable 2FA",
    "security.sessions": "Active Sessions",
    "security.sessionsDesc": "Manage your active sessions across devices",
    "security.signOutAll": "Sign Out All Devices",
    
    // Subscription
    "subscription.title": "Subscription",
    "subscription.desc": "Manage your subscription plan and payment details",
    "subscription.status": "Current Plan",
    "subscription.nextPayment": "Next Payment",
    "subscription.cancelSub": "Cancel Subscription",
    "subscription.upgradeSub": "Upgrade Plan",
    
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.emissions": "Emissions",
    "nav.reports": "Reports",
    "nav.profile": "Profile",
    "nav.logout": "Logout",
    "nav.predictions": "Predictions",
    "nav.dataUpload": "Data Upload",
    "nav.integrations": "Integrations",
    "nav.history": "History",
    "nav.company": "Company",
    "nav.subscription": "Subscription",
    "nav.teamMembers": "Team Members",
    "nav.sections.main": "Main",
    "nav.sections.data": "Data",
    "nav.sections.settings": "Settings",
    
    // Emissions
    "emissions.title": "Emissions",
    "emissions.add": "Add Emission",
    "emissions.scope": "Scope",
    "emissions.category": "Category",
    "emissions.amount": "Amount",
    "emissions.date": "Date",
    "emissions.description": "Description",
    "emissions.status": "Status",
    "emissions.source": "Source",
    "emissions.delete": "Delete",
    "emissions.edit": "Edit",
    
    // Reports
    "reports.title": "Reports",
    "reports.generate": "Generate Report",
    "reports.download": "Download",
    "reports.dateRange": "Date Range",
    "reports.format": "Format",
    "reports.type": "Report Type",
    
    // General
    "general.save": "Save",
    "general.cancel": "Cancel",
    "general.delete": "Delete",
    "general.edit": "Edit",
    "general.search": "Search",
    "general.filter": "Filter",
    "general.from": "From",
    "general.to": "To",
    "general.loading": "Loading...",
    "general.error": "Error",
    "general.success": "Success",
  },
  de: {
    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.summary": "Zusammenfassung",
    "dashboard.emissions": "Emissionen",
    "dashboard.recommendations": "Empfehlungen",
    "dashboard.timeframe.monthly": "Monatlich",
    "dashboard.timeframe.quarterly": "Vierteljährlich",
    "dashboard.timeframe.yearly": "Jährlich",
    "dashboard.totalEmissions": "Gesamtemissionen",
    "dashboard.scope1": "Bereich 1",
    "dashboard.scope2": "Bereich 2",
    "dashboard.scope3": "Bereich 3",
    "dashboard.dateRange": "Datumsbereich",
    "dashboard.recent": "Neueste Emissionen",
    "dashboard.emissionsByCategory": "Emissionen nach Kategorie",
    
    // Profile
    "profile.title": "Einstellungen",
    "profile.subtitle": "Verwalten Sie Ihre Kontoeinstellungen und Präferenzen",
    "profile.tabs.profile": "Profil",
    "profile.tabs.company": "Unternehmen",
    "profile.tabs.subscription": "Abonnement",
    "profile.tabs.security": "Sicherheit",
    "profile.profileInfo": "Profilinformationen",
    "profile.profileDesc": "Aktualisieren Sie Ihre persönlichen Informationen und Präferenzen",
    "profile.firstName": "Vorname",
    "profile.lastName": "Nachname",
    "profile.email": "E-Mail",
    "profile.language": "Sprache",
    "profile.saveChanges": "Änderungen speichern",
    "profile.saving": "Speichern...",
    
    // Company
    "company.title": "Unternehmensinformationen",
    "company.updateDesc": "Aktualisieren Sie Ihre Unternehmensdetails",
    "company.createDesc": "Fügen Sie Ihre Unternehmensinformationen hinzu, um alle Funktionen zu aktivieren",
    "company.name": "Unternehmensname",
    "company.industry": "Branche",
    "company.size": "Unternehmensgröße",
    "company.address": "Adresse",
    "company.city": "Stadt",
    "company.country": "Land",
    
    // Security
    "security.title": "Sicherheit",
    "security.desc": "Verwalten Sie Ihre Kontosicherheitseinstellungen",
    "security.password": "Passwort",
    "security.passwordDesc": "Ändern Sie Ihr Passwort, um Ihr Konto zu schützen",
    "security.currentPassword": "Aktuelles Passwort",
    "security.newPassword": "Neues Passwort",
    "security.confirmPassword": "Neues Passwort bestätigen",
    "security.updatePassword": "Passwort aktualisieren",
    "security.updatingPassword": "Passwort wird aktualisiert...",
    "security.twoFactor": "Zwei-Faktor-Authentifizierung",
    "security.twoFactorDesc": "Fügen Sie eine zusätzliche Sicherheitsebene zu Ihrem Konto hinzu",
    "security.enable2FA": "2FA aktivieren",
    "security.sessions": "Aktive Sitzungen",
    "security.sessionsDesc": "Verwalten Sie Ihre aktiven Sitzungen auf allen Geräten",
    "security.signOutAll": "Von allen Geräten abmelden",
    
    // Subscription
    "subscription.title": "Abonnement",
    "subscription.desc": "Verwalten Sie Ihren Abonnementplan und Zahlungsdetails",
    "subscription.status": "Aktueller Plan",
    "subscription.nextPayment": "Nächste Zahlung",
    "subscription.cancelSub": "Abonnement kündigen",
    "subscription.upgradeSub": "Plan upgraden",
    
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.emissions": "Emissionen",
    "nav.reports": "Berichte",
    "nav.profile": "Profil",
    "nav.logout": "Abmelden",
    "nav.predictions": "Vorhersagen",
    "nav.dataUpload": "Daten-Upload",
    "nav.integrations": "Integrationen",
    "nav.history": "Verlauf",
    "nav.company": "Unternehmen",
    "nav.subscription": "Abonnement",
    "nav.teamMembers": "Teammitglieder",
    "nav.sections.main": "Hauptmenü",
    "nav.sections.data": "Daten",
    "nav.sections.settings": "Einstellungen",
    
    // Subscription additional keys
    "subscription.plan": "Plan",
    "subscription.renewsIn": "Verlängert in {{days}} Tagen",
    "subscription.upgradeText": "Auf Enterprise upgraden",
    
    // Emissions
    "emissions.title": "Emissionen",
    "emissions.add": "Emission hinzufügen",
    "emissions.scope": "Bereich",
    "emissions.category": "Kategorie",
    "emissions.amount": "Menge",
    "emissions.date": "Datum",
    "emissions.description": "Beschreibung",
    "emissions.status": "Status",
    "emissions.source": "Quelle",
    "emissions.delete": "Löschen",
    "emissions.edit": "Bearbeiten",
    
    // Reports
    "reports.title": "Berichte",
    "reports.generate": "Bericht generieren",
    "reports.download": "Herunterladen",
    "reports.dateRange": "Datumsbereich",
    "reports.format": "Format",
    "reports.type": "Berichtstyp",
    
    // General
    "general.save": "Speichern",
    "general.cancel": "Abbrechen",
    "general.delete": "Löschen",
    "general.edit": "Bearbeiten",
    "general.search": "Suche",
    "general.filter": "Filter",
    "general.from": "Von",
    "general.to": "Bis",
    "general.loading": "Wird geladen...",
    "general.error": "Fehler",
    "general.success": "Erfolg",
  },
  fr: {
    // Dashboard
    "dashboard.title": "Tableau de bord",
    "dashboard.summary": "Résumé",
    "dashboard.emissions": "Émissions",
    "dashboard.recommendations": "Recommandations",
    "dashboard.timeframe.monthly": "Mensuel",
    "dashboard.timeframe.quarterly": "Trimestriel",
    "dashboard.timeframe.yearly": "Annuel",
    "dashboard.totalEmissions": "Émissions totales",
    "dashboard.scope1": "Portée 1",
    "dashboard.scope2": "Portée 2",
    "dashboard.scope3": "Portée 3",
    "dashboard.dateRange": "Période",
    "dashboard.recent": "Émissions récentes",
    "dashboard.emissionsByCategory": "Émissions par catégorie",
    
    // Profile
    "profile.title": "Paramètres",
    "profile.subtitle": "Gérez les paramètres et préférences de votre compte",
    "profile.tabs.profile": "Profil",
    "profile.tabs.company": "Entreprise",
    "profile.tabs.subscription": "Abonnement",
    "profile.tabs.security": "Sécurité",
    "profile.profileInfo": "Informations de profil",
    "profile.profileDesc": "Mettez à jour vos informations personnelles et préférences",
    "profile.firstName": "Prénom",
    "profile.lastName": "Nom",
    "profile.email": "Email",
    "profile.language": "Langue",
    "profile.saveChanges": "Enregistrer les modifications",
    "profile.saving": "Enregistrement...",
    
    // Company
    "company.title": "Informations sur l'entreprise",
    "company.updateDesc": "Mettez à jour les détails de votre entreprise",
    "company.createDesc": "Ajoutez les informations de votre entreprise pour activer toutes les fonctionnalités",
    "company.name": "Nom de l'entreprise",
    "company.industry": "Secteur",
    "company.size": "Taille de l'entreprise",
    "company.address": "Adresse",
    "company.city": "Ville",
    "company.country": "Pays",
    
    // Security
    "security.title": "Sécurité",
    "security.desc": "Gérez les paramètres de sécurité de votre compte",
    "security.password": "Mot de passe",
    "security.passwordDesc": "Changez votre mot de passe pour garder votre compte sécurisé",
    "security.currentPassword": "Mot de passe actuel",
    "security.newPassword": "Nouveau mot de passe",
    "security.confirmPassword": "Confirmer le nouveau mot de passe",
    "security.updatePassword": "Mettre à jour le mot de passe",
    "security.updatingPassword": "Mise à jour du mot de passe...",
    "security.twoFactor": "Authentification à deux facteurs",
    "security.twoFactorDesc": "Ajoutez une couche supplémentaire de sécurité à votre compte",
    "security.enable2FA": "Activer l'authentification à deux facteurs",
    "security.sessions": "Sessions actives",
    "security.sessionsDesc": "Gérez vos sessions actives sur tous les appareils",
    "security.signOutAll": "Déconnecter tous les appareils",
    
    // Subscription
    "subscription.title": "Abonnement",
    "subscription.desc": "Gérez votre plan d'abonnement et les détails de paiement",
    "subscription.status": "Plan actuel",
    "subscription.nextPayment": "Prochain paiement",
    "subscription.cancelSub": "Annuler l'abonnement",
    "subscription.upgradeSub": "Mettre à niveau le plan",
    
    // Navigation
    "nav.dashboard": "Tableau de bord",
    "nav.emissions": "Émissions",
    "nav.reports": "Rapports",
    "nav.profile": "Profil",
    "nav.logout": "Déconnexion",
    
    // Emissions
    "emissions.title": "Émissions",
    "emissions.add": "Ajouter une émission",
    "emissions.scope": "Portée",
    "emissions.category": "Catégorie",
    "emissions.amount": "Montant",
    "emissions.date": "Date",
    "emissions.description": "Description",
    "emissions.status": "Statut",
    "emissions.source": "Source",
    "emissions.delete": "Supprimer",
    "emissions.edit": "Modifier",
    
    // Reports
    "reports.title": "Rapports",
    "reports.generate": "Générer un rapport",
    "reports.download": "Télécharger",
    "reports.dateRange": "Période",
    "reports.format": "Format",
    "reports.type": "Type de rapport",
    
    // General
    "general.save": "Enregistrer",
    "general.cancel": "Annuler",
    "general.delete": "Supprimer",
    "general.edit": "Modifier",
    "general.search": "Rechercher",
    "general.filter": "Filtrer",
    "general.from": "De",
    "general.to": "À",
    "general.loading": "Chargement...",
    "general.error": "Erreur",
    "general.success": "Succès",
  },
  es: {
    // Dashboard
    "dashboard.title": "Panel de control",
    "dashboard.summary": "Resumen",
    "dashboard.emissions": "Emisiones",
    "dashboard.recommendations": "Recomendaciones",
    "dashboard.timeframe.monthly": "Mensual",
    "dashboard.timeframe.quarterly": "Trimestral",
    "dashboard.timeframe.yearly": "Anual",
    "dashboard.totalEmissions": "Emisiones totales",
    "dashboard.scope1": "Alcance 1",
    "dashboard.scope2": "Alcance 2",
    "dashboard.scope3": "Alcance 3",
    "dashboard.dateRange": "Rango de fechas",
    "dashboard.recent": "Emisiones recientes",
    "dashboard.emissionsByCategory": "Emisiones por categoría",
    
    // Profile
    "profile.title": "Configuración",
    "profile.subtitle": "Administre la configuración y preferencias de su cuenta",
    "profile.tabs.profile": "Perfil",
    "profile.tabs.company": "Empresa",
    "profile.tabs.subscription": "Suscripción",
    "profile.tabs.security": "Seguridad",
    "profile.profileInfo": "Información de perfil",
    "profile.profileDesc": "Actualice su información personal y preferencias",
    "profile.firstName": "Nombre",
    "profile.lastName": "Apellido",
    "profile.email": "Correo electrónico",
    "profile.language": "Idioma",
    "profile.saveChanges": "Guardar cambios",
    "profile.saving": "Guardando...",
    
    // Company
    "company.title": "Información de la empresa",
    "company.updateDesc": "Actualice los detalles de su empresa",
    "company.createDesc": "Agregue la información de su empresa para habilitar todas las funciones",
    "company.name": "Nombre de la empresa",
    "company.industry": "Industria",
    "company.size": "Tamaño de la empresa",
    "company.address": "Dirección",
    "company.city": "Ciudad",
    "company.country": "País",
    
    // Security
    "security.title": "Seguridad",
    "security.desc": "Administre la configuración de seguridad de su cuenta",
    "security.password": "Contraseña",
    "security.passwordDesc": "Cambie su contraseña para mantener segura su cuenta",
    "security.currentPassword": "Contraseña actual",
    "security.newPassword": "Nueva contraseña",
    "security.confirmPassword": "Confirmar nueva contraseña",
    "security.updatePassword": "Actualizar contraseña",
    "security.updatingPassword": "Actualizando contraseña...",
    "security.twoFactor": "Autenticación de dos factores",
    "security.twoFactorDesc": "Agregue una capa adicional de seguridad a su cuenta",
    "security.enable2FA": "Habilitar 2FA",
    "security.sessions": "Sesiones activas",
    "security.sessionsDesc": "Administre sus sesiones activas en todos los dispositivos",
    "security.signOutAll": "Cerrar sesión en todos los dispositivos",
    
    // Subscription
    "subscription.title": "Suscripción",
    "subscription.desc": "Administre su plan de suscripción y detalles de pago",
    "subscription.status": "Plan actual",
    "subscription.nextPayment": "Próximo pago",
    "subscription.cancelSub": "Cancelar suscripción",
    "subscription.upgradeSub": "Mejorar plan",
    
    // Navigation
    "nav.dashboard": "Panel de control",
    "nav.emissions": "Emisiones",
    "nav.reports": "Informes",
    "nav.profile": "Perfil",
    "nav.logout": "Cerrar sesión",
    
    // Emissions
    "emissions.title": "Emisiones",
    "emissions.add": "Agregar emisión",
    "emissions.scope": "Alcance",
    "emissions.category": "Categoría",
    "emissions.amount": "Cantidad",
    "emissions.date": "Fecha",
    "emissions.description": "Descripción",
    "emissions.status": "Estado",
    "emissions.source": "Fuente",
    "emissions.delete": "Eliminar",
    "emissions.edit": "Editar",
    
    // Reports
    "reports.title": "Informes",
    "reports.generate": "Generar informe",
    "reports.download": "Descargar",
    "reports.dateRange": "Rango de fechas",
    "reports.format": "Formato",
    "reports.type": "Tipo de informe",
    
    // General
    "general.save": "Guardar",
    "general.cancel": "Cancelar",
    "general.delete": "Eliminar",
    "general.edit": "Editar",
    "general.search": "Buscar",
    "general.filter": "Filtrar",
    "general.from": "Desde",
    "general.to": "Hasta",
    "general.loading": "Cargando...",
    "general.error": "Error",
    "general.success": "Éxito",
  },
};

// Define language context type
interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, any>) => string;
}

// Create context
export const LanguageContext = createContext<LanguageContextType | null>(null);

// Language provider component
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  // Load saved language from local storage on initial render
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage && ["en", "de", "fr", "es"].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("language", language);
    // Update the HTML lang attribute for accessibility
    document.documentElement.lang = language;
  }, [language]);

  // Translation function with parameter support
  const t = (key: string, params?: Record<string, any>): string => {
    let translation = translations[language]?.[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key} in language: ${language}`);
      return key;
    }
    
    // Replace parameters in the translation string like {{paramName}}
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(`{{${paramKey}}}`, String(paramValue));
      });
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook for using language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}