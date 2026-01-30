// Oversettelser for GrønnValg
// Norwegian (nb) er hovedspråket, English (en) er alternativ

export type Language = 'nb' | 'en';

export interface Translations {
  // App
  appName: string;
  appTagline: string;

  // Navigation & Actions
  scanProduct: string;
  tapToScan: string;
  close: string;
  back: string;
  next: string;
  save: string;
  cancel: string;
  confirm: string;
  delete: string;
  clear: string;
  search: string;
  searchPlaceholder: string;

  // Scanner
  scanBarcode: string;
  scanning: string;
  productNotFound: string;
  tryAnotherProduct: string;
  scanNewProduct: string;

  // Product Card
  unknownProduct: string;
  unknownBrand: string;
  unknownCategory: string;
  unknownOrigin: string;
  producedInNorway: string;

  // Scores
  gronnScore: string;
  whyThisScore: string;
  healthInfo: string;
  nutritionInfo: string;
  dataQuality: string;
  dataNotAvailable: string;
  estimatedValue: string;
  limitedData: string;
  limitedDataDescription: string;

  // Score Categories
  transport: string;
  packaging: string;
  ecoscore: string;
  norwegian: string;
  certifications: string;

  // Score Descriptions
  localProduction: string;
  importedProduct: string;
  unknownOriginDesc: string;
  recyclablePackaging: string;
  mixedPackaging: string;
  unknownPackaging: string;
  excellentEcoscore: string;
  goodEcoscore: string;
  averageEcoscore: string;
  poorEcoscore: string;
  noEcoscore: string;
  norwegianBonus: string;
  foreignProduct: string;
  hasCertifications: string;
  noCertifications: string;

  // Health
  nutriScore: string;
  novaGroup: string;
  novaUnprocessed: string;
  novaMinimallyProcessed: string;
  novaProcessed: string;
  novaUltraProcessed: string;

  // Allergens
  allergens: string;
  allergenWarning: string;
  contains: string;
  mayContainTracesOf: string;
  noAllergens: string;
  allergenInfo: string;

  // Alternatives
  norwegianAlternatives: string;
  similarNorwegianProducts: string;
  otherNorwegianProducts: string;
  noNorwegianProductsFound: string;

  // Shopping List
  shoppingList: string;
  shoppingListEmpty: string;
  addItem: string;
  addCustomItem: string;
  searchOrAddItem: string;
  removeCompleted: string;
  itemsCompleted: string;

  // Filters
  filters: string;
  norwegianOnly: string;
  organicOnly: string;

  // Stats
  averageScore: string;
  productsScanned: string;
  compareProducts: string;

  // Welcome
  welcomeTitle: string;
  welcomeSubtitle: string;
  welcomeDescription: string;

  // How It Works
  howItWorks: string;
  step1Title: string;
  step1Description: string;
  step2Title: string;
  step2Description: string;
  step3Title: string;
  step3Description: string;

  // Trust Signals
  openSource: string;
  openSourceDescription: string;
  noAds: string;
  noAdsDescription: string;
  privacyFirst: string;
  privacyFirstDescription: string;

  // Settings
  settings: string;
  darkMode: string;
  lightMode: string;
  language: string;
  profile: string;

  // Footer
  aboutUs: string;
  privacyPolicy: string;
  termsOfService: string;
  methodology: string;
  contact: string;
  dataFrom: string;

  // Chat
  aiAssistant: string;
  askAboutProduct: string;

  // Errors
  somethingWentWrong: string;
  tryAgain: string;

  // Labels & Certifications
  labels: string;
  nytNorge: string;
  organic: string;
  fairtrade: string;
  mscCertified: string;
  learnMore: string;
  certificationExplained: string;
  whatDoesThisMean: string;

  // Time
  today: string;
  yesterday: string;
  daysAgo: string;

  // Confirmation
  confirmClearHistory: string;

  // More info
  seeMoreOnOFF: string;
}

export const translations: Record<Language, Translations> = {
  nb: {
    // App
    appName: 'GrønnValg',
    appTagline: 'Velg grønnere, lev bedre',

    // Navigation & Actions
    scanProduct: 'Skann produkt',
    tapToScan: 'Trykk for å skanne en strekkode',
    close: 'Lukk',
    back: 'Tilbake',
    next: 'Neste',
    save: 'Lagre',
    cancel: 'Avbryt',
    confirm: 'Bekreft',
    delete: 'Slett',
    clear: 'Tøm',
    search: 'Søk',
    searchPlaceholder: 'Søk etter produkter...',

    // Scanner
    scanBarcode: 'Skann strekkode',
    scanning: 'Skanner...',
    productNotFound: 'Produktet ble ikke funnet',
    tryAnotherProduct: 'Prøv et annet produkt',
    scanNewProduct: 'Skann nytt produkt',

    // Product Card
    unknownProduct: 'Ukjent produkt',
    unknownBrand: 'Ukjent merke',
    unknownCategory: 'Ukjent kategori',
    unknownOrigin: 'Ukjent opprinnelse',
    producedInNorway: 'Norskprodusert',

    // Scores
    gronnScore: 'GrønnScore',
    whyThisScore: 'Hvorfor denne scoren?',
    healthInfo: 'Helseinformasjon',
    nutritionInfo: 'Næringsinfo',
    dataQuality: 'Datakvalitet',
    dataNotAvailable: 'Data ikke tilgjengelig',
    estimatedValue: 'Estimert verdi',
    limitedData: 'Begrenset data tilgjengelig',
    limitedDataDescription: 'Scorer merket med ~ er estimerte nøytrale verdier.',

    // Score Categories
    transport: 'Transport',
    packaging: 'Emballasje',
    ecoscore: 'Miljøpåvirkning',
    norwegian: 'Norskprodusert',
    certifications: 'Sertifiseringer',

    // Score Descriptions
    localProduction: 'Lokal produksjon',
    importedProduct: 'Importert produkt',
    unknownOriginDesc: 'Ukjent opprinnelse',
    recyclablePackaging: 'Resirkulerbar emballasje',
    mixedPackaging: 'Blandet emballasje',
    unknownPackaging: 'Ukjent emballasje',
    excellentEcoscore: 'Utmerket miljøpåvirkning',
    goodEcoscore: 'God miljøpåvirkning',
    averageEcoscore: 'Gjennomsnittlig miljøpåvirkning',
    poorEcoscore: 'Svak miljøpåvirkning',
    noEcoscore: 'Ingen Eco-Score data',
    norwegianBonus: 'Bonus for norsk produkt',
    foreignProduct: 'Utenlandsk produkt',
    hasCertifications: 'Har sertifiseringer',
    noCertifications: 'Ingen sertifiseringer',

    // Health
    nutriScore: 'Nutri-Score',
    novaGroup: 'NOVA-gruppe',
    novaUnprocessed: 'Ubearbeidet',
    novaMinimallyProcessed: 'Lite bearbeidet',
    novaProcessed: 'Bearbeidet',
    novaUltraProcessed: 'Ultrabearbeidet',

    // Allergens
    allergens: 'Allergener',
    allergenWarning: 'Allergenvarsel',
    contains: 'Inneholder',
    mayContainTracesOf: 'Kan inneholde spor av',
    noAllergens: 'Ingen kjente allergener',
    allergenInfo: 'Allergeninformasjon',

    // Alternatives
    norwegianAlternatives: 'Norske alternativer',
    similarNorwegianProducts: 'Lignende norske produkter',
    otherNorwegianProducts: 'Andre norske produkter',
    noNorwegianProductsFound: 'Ingen lignende norske produkter funnet',

    // Shopping List
    shoppingList: 'Handleliste',
    shoppingListEmpty: 'Handlelisten er tom. Søk etter produkter ovenfor eller legg til egne varer.',
    addItem: 'Legg til',
    addCustomItem: 'Legg til som egendefinert vare',
    searchOrAddItem: 'Søk eller legg til vare...',
    removeCompleted: 'Fjern fullførte',
    itemsCompleted: 'fullført',

    // Filters
    filters: 'Filtre',
    norwegianOnly: 'Kun norske',
    organicOnly: 'Kun økologisk',

    // Stats
    averageScore: 'Gjennomsnittlig score',
    productsScanned: 'produkter skannet',
    compareProducts: 'Sammenlign produkter',

    // Welcome
    welcomeTitle: 'Velkommen til GrønnValg',
    welcomeSubtitle: 'Din guide til bærekraftige valg',
    welcomeDescription: 'Skann produkter for å se miljø- og helsepoeng, finn grønnere alternativer og bygg bærekraftige vaner.',

    // How It Works
    howItWorks: 'Slik fungerer det',
    step1Title: 'Skann strekkoden',
    step1Description: 'Bruk kameraet til å skanne strekkoden på produktet',
    step2Title: 'Se scoren',
    step2Description: 'Få umiddelbar oversikt over miljø- og helsepoeng',
    step3Title: 'Velg grønnere',
    step3Description: 'Finn bedre alternativer og gjør bærekraftige valg',

    // Trust Signals
    openSource: 'Åpen kildekode',
    openSourceDescription: 'All kode er tilgjengelig på GitHub',
    noAds: 'Ingen reklame',
    noAdsDescription: 'Vi selger aldri dine data',
    privacyFirst: 'Personvern først',
    privacyFirstDescription: 'Data lagres kun på din enhet',

    // Settings
    settings: 'Innstillinger',
    darkMode: 'Mørkt tema',
    lightMode: 'Lyst tema',
    language: 'Språk',
    profile: 'Profil',

    // Footer
    aboutUs: 'Om oss',
    privacyPolicy: 'Personvernerklæring',
    termsOfService: 'Vilkår',
    methodology: 'Metodikk',
    contact: 'Kontakt',
    dataFrom: 'Data fra Open Food Facts',

    // Chat
    aiAssistant: 'AI-assistent',
    askAboutProduct: 'Spør meg om produktet',

    // Errors
    somethingWentWrong: 'Noe gikk galt',
    tryAgain: 'Prøv igjen',

    // Labels & Certifications
    labels: 'Merkeordninger',
    nytNorge: 'Nyt Norge',
    organic: 'Økologisk',
    fairtrade: 'Fairtrade',
    mscCertified: 'MSC-sertifisert',
    learnMore: 'Les mer',
    certificationExplained: 'Om merkeordningen',
    whatDoesThisMean: 'Hva betyr dette?',

    // Time
    today: 'I dag',
    yesterday: 'I går',
    daysAgo: 'dager siden',

    // Confirmation
    confirmClearHistory: 'Er du sikker på at du vil slette all historikk?',

    // More info
    seeMoreOnOFF: 'Se mer på Open Food Facts',
  },

  en: {
    // App
    appName: 'GrønnValg',
    appTagline: 'Choose greener, live better',

    // Navigation & Actions
    scanProduct: 'Scan product',
    tapToScan: 'Tap to scan a barcode',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    clear: 'Clear',
    search: 'Search',
    searchPlaceholder: 'Search for products...',

    // Scanner
    scanBarcode: 'Scan barcode',
    scanning: 'Scanning...',
    productNotFound: 'Product not found',
    tryAnotherProduct: 'Try another product',
    scanNewProduct: 'Scan new product',

    // Product Card
    unknownProduct: 'Unknown product',
    unknownBrand: 'Unknown brand',
    unknownCategory: 'Unknown category',
    unknownOrigin: 'Unknown origin',
    producedInNorway: 'Made in Norway',

    // Scores
    gronnScore: 'GrønnScore',
    whyThisScore: 'Why this score?',
    healthInfo: 'Health information',
    nutritionInfo: 'Nutrition info',
    dataQuality: 'Data quality',
    dataNotAvailable: 'Data not available',
    estimatedValue: 'Estimated value',
    limitedData: 'Limited data available',
    limitedDataDescription: 'Scores marked with ~ are estimated neutral values.',

    // Score Categories
    transport: 'Transport',
    packaging: 'Packaging',
    ecoscore: 'Environmental impact',
    norwegian: 'Made in Norway',
    certifications: 'Certifications',

    // Score Descriptions
    localProduction: 'Local production',
    importedProduct: 'Imported product',
    unknownOriginDesc: 'Unknown origin',
    recyclablePackaging: 'Recyclable packaging',
    mixedPackaging: 'Mixed packaging',
    unknownPackaging: 'Unknown packaging',
    excellentEcoscore: 'Excellent environmental impact',
    goodEcoscore: 'Good environmental impact',
    averageEcoscore: 'Average environmental impact',
    poorEcoscore: 'Poor environmental impact',
    noEcoscore: 'No Eco-Score data',
    norwegianBonus: 'Bonus for Norwegian product',
    foreignProduct: 'Foreign product',
    hasCertifications: 'Has certifications',
    noCertifications: 'No certifications',

    // Health
    nutriScore: 'Nutri-Score',
    novaGroup: 'NOVA group',
    novaUnprocessed: 'Unprocessed',
    novaMinimallyProcessed: 'Minimally processed',
    novaProcessed: 'Processed',
    novaUltraProcessed: 'Ultra-processed',

    // Allergens
    allergens: 'Allergens',
    allergenWarning: 'Allergen warning',
    contains: 'Contains',
    mayContainTracesOf: 'May contain traces of',
    noAllergens: 'No known allergens',
    allergenInfo: 'Allergen information',

    // Alternatives
    norwegianAlternatives: 'Norwegian alternatives',
    similarNorwegianProducts: 'Similar Norwegian products',
    otherNorwegianProducts: 'Other Norwegian products',
    noNorwegianProductsFound: 'No similar Norwegian products found',

    // Shopping List
    shoppingList: 'Shopping list',
    shoppingListEmpty: 'Your shopping list is empty. Search for products above or add custom items.',
    addItem: 'Add',
    addCustomItem: 'Add as custom item',
    searchOrAddItem: 'Search or add item...',
    removeCompleted: 'Remove completed',
    itemsCompleted: 'completed',

    // Filters
    filters: 'Filters',
    norwegianOnly: 'Norwegian only',
    organicOnly: 'Organic only',

    // Stats
    averageScore: 'Average score',
    productsScanned: 'products scanned',
    compareProducts: 'Compare products',

    // Welcome
    welcomeTitle: 'Welcome to GrønnValg',
    welcomeSubtitle: 'Your guide to sustainable choices',
    welcomeDescription: 'Scan products to see environmental and health scores, find greener alternatives and build sustainable habits.',

    // How It Works
    howItWorks: 'How it works',
    step1Title: 'Scan the barcode',
    step1Description: 'Use your camera to scan the product barcode',
    step2Title: 'See the score',
    step2Description: 'Get instant overview of environmental and health scores',
    step3Title: 'Choose greener',
    step3Description: 'Find better alternatives and make sustainable choices',

    // Trust Signals
    openSource: 'Open source',
    openSourceDescription: 'All code is available on GitHub',
    noAds: 'No ads',
    noAdsDescription: 'We never sell your data',
    privacyFirst: 'Privacy first',
    privacyFirstDescription: 'Data is only stored on your device',

    // Settings
    settings: 'Settings',
    darkMode: 'Dark mode',
    lightMode: 'Light mode',
    language: 'Language',
    profile: 'Profile',

    // Footer
    aboutUs: 'About us',
    privacyPolicy: 'Privacy policy',
    termsOfService: 'Terms of service',
    methodology: 'Methodology',
    contact: 'Contact',
    dataFrom: 'Data from Open Food Facts',

    // Chat
    aiAssistant: 'AI assistant',
    askAboutProduct: 'Ask me about the product',

    // Errors
    somethingWentWrong: 'Something went wrong',
    tryAgain: 'Try again',

    // Labels & Certifications
    labels: 'Labels',
    nytNorge: 'Nyt Norge',
    organic: 'Organic',
    fairtrade: 'Fairtrade',
    mscCertified: 'MSC certified',
    learnMore: 'Learn more',
    certificationExplained: 'About this certification',
    whatDoesThisMean: 'What does this mean?',

    // Time
    today: 'Today',
    yesterday: 'Yesterday',
    daysAgo: 'days ago',

    // Confirmation
    confirmClearHistory: 'Are you sure you want to clear all history?',

    // More info
    seeMoreOnOFF: 'See more on Open Food Facts',
  },
};

export function getTranslation(lang: Language): Translations {
  return translations[lang];
}
