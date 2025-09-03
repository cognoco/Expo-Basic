// Minimal i18n implementation for Study Buddy
// Supports: English, German, Spanish

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

const translations = {
  en: {
    // Mode Selection
    howAreYouFeeling: 'How are you feeling?',
    readyToWork: 'Ready to Work!',
    needToCalmDown: 'Need to Calm Down',
    startQuickly: 'Start quickly or pick a mode below.',
    
    // Onboarding
    howOldIsYourChild: 'How old is your study superstar?',
    weWillCustomize: "We'll customize everything for their age!",
    pickYourFriend: 'Pick Your Friend!',
    whoWillHelp: 'Who will help you today?',
    whatsYourName: "What's Your Name?",
    holdToRecord: 'Hold to Record',
    recording: 'Recording...',
    skipForNow: 'Skip for now',
    weAreReady: "We're Ready!",
    
    // Main Screen
    letsWorkOn: "Let's work on",
    focusTime: 'Focus Time',
    dayStreak: 'day streak',
    studyTime: 'Study time',
    startStudying: 'Start Studying!',
    breakTime: 'Break Time!',
    finished: 'Finished!',
    
    // Subjects
    math: 'Math',
    reading: 'Reading',
    writing: 'Writing',
    science: 'Science',
    chemistry: 'Chemistry',
    biology: 'Biology',
    history: 'History',
    geography: 'Geography',
    other: 'Other',
    
    // Check-ins
    whatAreYouWorkingOn: 'What are you working on?',
    howsItGoing: "How's it going?",
    howMuchDone: 'How much done?',
    easy: 'Easy!',
    ok: 'OK',
    hard: 'Hard',
    needHelp: 'Need help',
    allDone: 'All done',
    most: 'Most',
    half: 'Half',
    justStarted: 'Just started',
    
    // Celebration
    amazingJob: 'Amazing Job!',
    sessionComplete: 'Session Complete',
    todaysFocusTime: "Today's Focus Time",
    currentStreak: 'Current Streak',
    totalFocusTime: 'Total Focus Time',
    shareSuccess: 'Share Success!',
    continue: 'Continue',
    
    // Parent Settings
    parentSettings: 'Parent Settings',
    parentAccess: 'Parent Access',
    saveSettings: 'Save Settings',
    timerSettings: 'Timer Settings',
    workDuration: 'Work Duration',
    breakDuration: 'Break Duration',
    minutes: 'minutes',
    
    // Calm Mode
    startCalming: 'Start Calming',
    breatheIn: 'Breathe In',
    breatheOut: 'Breathe Out',
    breathsCount: 'breaths',
    imReadyToTalk: "I'm ready to talk",
    
    // Quick Start Labels
    quickMath: 'Math',
    quickRead: 'Read',
    quickScience: 'Science',
    quickWrite: 'Write',
    quickChem: 'Chem'
  },
  
  de: {
    // Mode Selection
    howAreYouFeeling: 'Wie fühlst du dich?',
    readyToWork: 'Bereit zu arbeiten!',
    needToCalmDown: 'Muss mich beruhigen',
    startQuickly: 'Schnell starten oder Modus wählen.',
    
    // Onboarding
    howOldIsYourChild: 'Wie alt ist dein Lern-Superstar?',
    weWillCustomize: 'Wir passen alles an das Alter an!',
    pickYourFriend: 'Wähle deinen Freund!',
    whoWillHelp: 'Wer hilft dir heute?',
    whatsYourName: 'Wie heißt du?',
    holdToRecord: 'Halten zum Aufnehmen',
    recording: 'Aufnahme...',
    skipForNow: 'Überspringen',
    weAreReady: 'Wir sind bereit!',
    
    // Main Screen
    letsWorkOn: 'Lass uns arbeiten an',
    focusTime: 'Fokuszeit',
    dayStreak: 'Tage in Folge',
    studyTime: 'Lernzeit',
    startStudying: 'Lernen starten!',
    breakTime: 'Pausenzeit!',
    finished: 'Fertig!',
    
    // Subjects
    math: 'Mathe',
    reading: 'Lesen',
    writing: 'Schreiben',
    science: 'Wissenschaft',
    chemistry: 'Chemie',
    biology: 'Biologie',
    history: 'Geschichte',
    geography: 'Geographie',
    other: 'Andere',
    
    // Check-ins
    whatAreYouWorkingOn: 'Woran arbeitest du?',
    howsItGoing: 'Wie läuft es?',
    howMuchDone: 'Wie viel geschafft?',
    easy: 'Einfach!',
    ok: 'OK',
    hard: 'Schwer',
    needHelp: 'Brauche Hilfe',
    allDone: 'Alles fertig',
    most: 'Das meiste',
    half: 'Hälfte',
    justStarted: 'Gerade angefangen',
    
    // Celebration
    amazingJob: 'Großartige Arbeit!',
    sessionComplete: 'Sitzung abgeschlossen',
    todaysFocusTime: 'Heutige Fokuszeit',
    currentStreak: 'Aktuelle Serie',
    totalFocusTime: 'Gesamte Fokuszeit',
    shareSuccess: 'Erfolg teilen!',
    continue: 'Weiter',
    
    // Parent Settings
    parentSettings: 'Elterneinstellungen',
    parentAccess: 'Elternzugang',
    saveSettings: 'Einstellungen speichern',
    timerSettings: 'Timer-Einstellungen',
    workDuration: 'Arbeitsdauer',
    breakDuration: 'Pausendauer',
    minutes: 'Minuten',
    
    // Calm Mode
    startCalming: 'Beruhigung starten',
    breatheIn: 'Einatmen',
    breatheOut: 'Ausatmen',
    breathsCount: 'Atemzüge',
    imReadyToTalk: 'Ich bin bereit zu reden',
    
    // Quick Start Labels
    quickMath: 'Mathe',
    quickRead: 'Lesen',
    quickScience: 'Wissen',
    quickWrite: 'Schreiben',
    quickChem: 'Chemie',
    // Notifications & system
    notificationsPermissionTitle: 'Benachrichtigungen',
    notificationsPermissionBody: 'Wir verwenden gelegentliche Check-ins, um Ihr Kind zu unterstützen. Sie können dies jederzeit ändern.',
    notNow: 'Nicht jetzt',
    resume: 'Fortsetzen',
    break5: '+5 Min Pause',
    imDone: 'Ich bin fertig',
    checkinTitle: 'Study Buddy'
  },
  
  es: {
    // Mode Selection
    howAreYouFeeling: '¿Cómo te sientes?',
    readyToWork: '¡Listo para trabajar!',
    needToCalmDown: 'Necesito calmarme',
    startQuickly: 'Comienza rápido o elige un modo.',
    
    // Onboarding
    howOldIsYourChild: '¿Qué edad tiene tu superestrella?',
    weWillCustomize: '¡Personalizaremos todo para su edad!',
    pickYourFriend: '¡Elige tu amigo!',
    whoWillHelp: '¿Quién te ayudará hoy?',
    whatsYourName: '¿Cómo te llamas?',
    holdToRecord: 'Mantén para grabar',
    recording: 'Grabando...',
    skipForNow: 'Omitir por ahora',
    weAreReady: '¡Estamos listos!',
    
    // Main Screen
    letsWorkOn: 'Trabajemos en',
    focusTime: 'Tiempo de enfoque',
    dayStreak: 'días seguidos',
    studyTime: 'Tiempo de estudio',
    startStudying: '¡Empezar a estudiar!',
    breakTime: '¡Tiempo de descanso!',
    finished: '¡Terminado!',
    
    // Subjects
    math: 'Matemáticas',
    reading: 'Lectura',
    writing: 'Escritura',
    science: 'Ciencias',
    chemistry: 'Química',
    biology: 'Biología',
    history: 'Historia',
    geography: 'Geografía',
    other: 'Otro',
    
    // Check-ins
    whatAreYouWorkingOn: '¿En qué estás trabajando?',
    howsItGoing: '¿Cómo va?',
    howMuchDone: '¿Cuánto has hecho?',
    easy: '¡Fácil!',
    ok: 'OK',
    hard: 'Difícil',
    needHelp: 'Necesito ayuda',
    allDone: 'Todo listo',
    most: 'La mayoría',
    half: 'La mitad',
    justStarted: 'Recién empezado',
    
    // Celebration
    amazingJob: '¡Trabajo increíble!',
    sessionComplete: 'Sesión completada',
    todaysFocusTime: 'Tiempo de enfoque de hoy',
    currentStreak: 'Racha actual',
    totalFocusTime: 'Tiempo total de enfoque',
    shareSuccess: '¡Compartir éxito!',
    continue: 'Continuar',
    
    // Parent Settings
    parentSettings: 'Ajustes para padres',
    parentAccess: 'Acceso para padres',
    saveSettings: 'Guardar ajustes',
    timerSettings: 'Ajustes del temporizador',
    workDuration: 'Duración del trabajo',
    breakDuration: 'Duración del descanso',
    minutes: 'minutos',
    
    // Calm Mode
    startCalming: 'Empezar a calmarse',
    breatheIn: 'Inhala',
    breatheOut: 'Exhala',
    breathsCount: 'respiraciones',
    imReadyToTalk: 'Estoy listo para hablar',
    
    // Quick Start Labels
    quickMath: 'Mate',
    quickRead: 'Leer',
    quickScience: 'Ciencias',
    quickWrite: 'Escribir',
    quickChem: 'Química',
    // Notifications & system
    notificationsPermissionTitle: 'Notificaciones',
    notificationsPermissionBody: 'Usamos check-ins ocasionales para mantener a su hijo en camino. Puede cambiar esto en cualquier momento.',
    notNow: 'Ahora no',
    resume: 'Reanudar',
    break5: '+5 min de descanso',
    imDone: 'Terminé',
    checkinTitle: 'Study Buddy'
  }
};

// Current language state
let currentLanguage = 'en';

// Initialize from device settings
export const initializeLanguage = async (): Promise<void> => {
  try {
    // Try to get saved language preference
    const savedLang = await AsyncStorage.getItem('@StudyBuddy:language');
    if (savedLang && translations[savedLang]) {
      currentLanguage = savedLang;
      return;
    }
    
    // Otherwise use device language
    const deviceLang = Localization.locale.split('-')[0]; // 'en-US' -> 'en'
    if (translations[deviceLang]) {
      currentLanguage = deviceLang;
    }
  } catch (e) {
    // Default to English
  }
};

// Get current language
export const getCurrentLanguage = (): string => currentLanguage;

// Set language
export const setLanguage = async (lang: string): Promise<void> => {
  if (translations[lang]) {
    currentLanguage = lang;
    await AsyncStorage.setItem('@StudyBuddy:language', lang);
  }
};

// Get translated string
export const t = (key: string): string => {
  return translations[currentLanguage]?.[key] || translations.en[key] || key;
};

// Get all available languages
export const getAvailableLanguages = (): Array<{ code: string; name: string; flag: string }> => [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
];

// Format with parameters
export const tf = (key: string, params: Record<string, string | number> = {}): string => {
  let text = t(key);
  Object.keys(params).forEach(param => {
    text = text.replace(`{${param}}`, params[param]);
  });
  return text;
};
// Locale/timezone helpers and formatters
export const getLocale = (): string => {
  try {
    const deviceLocale = (Localization.locale || 'en-US');
    if (deviceLocale.toLowerCase().startsWith(currentLanguage.toLowerCase())) return deviceLocale;
  } catch {}
  return currentLanguage === 'en' ? 'en-US' : currentLanguage;
};

export const getTimeZone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};

export const formatDate = (d: Date, opts?: Intl.DateTimeFormatOptions): string =>
  new Intl.DateTimeFormat(getLocale(), opts).format(d);

export const formatTime = (d: Date, opts?: Intl.DateTimeFormatOptions): string =>
  new Intl.DateTimeFormat(getLocale(), { hour: 'numeric', minute: '2-digit', ...opts }).format(d);

export const formatNumber = (n: number, opts?: Intl.NumberFormatOptions): string =>
  new Intl.NumberFormat(getLocale(), opts).format(n);
