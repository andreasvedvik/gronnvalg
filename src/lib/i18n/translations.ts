// Oversettelser for Grønnest
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
  nutriScoreExplain: string;
  novaGroup: string;
  novaGroupExplain: string;
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

  // Scanner
  couldNotStartCamera: string;
  tryManualInput: string;
  searching: string;
  placeBarcode: string;
  scanningAuto: string;
  cameraNotAvailable: string;
  orEnterManually: string;
  tryTheseBarcodes: string;

  // Score Info Modal
  whatIsMiljoscore: string;
  miljoscoreDescription: string;
  environmentalImpact: string;
  environmentalImpactDesc: string;
  originLabel: string;
  originDesc: string;
  certificationsLabel: string;
  certificationsDesc: string;
  gradeScale: string;
  scoreDisclaimer: string;

  // Contact Modal
  contactUs: string;
  contactDescription: string;
  email: string;
  aboutGronnest: string;
  aboutGronnestDesc: string;

  // Chat Modal
  gronnHelper: string;
  aiAssistantDesc: string;
  chatWelcome: string;
  chatSuggestion1: string;
  chatSuggestion2: string;
  chatSuggestion3: string;
  writeMessage: string;

  // Stats Card
  yourAverageScore: string;
  basedOnScans: string;
  scoreExcellent: string;
  scoreGood: string;
  scoreAverage: string;
  scoreNeedsImprovement: string;
  scorePoor: string;

  // Export/Share
  exportList: string;
  copiedToClipboard: string;

  // Scan History
  scanHistory: string;
  exportHistory: string;
  export: string;
  clearAll: string;

  // Contribute to OFF
  productNotFoundTitle: string;
  barcodeNotInDatabase: string;
  helpUsGrow: string;
  addToOpenFoodFacts: string;
  contributeDescription: string;

  // Price Comparison
  priceComparison: string;
  lowestPrice: string;
  atStore: string;
  pricePerUnit: string;
  noPricesAvailable: string;
  pricesFrom: string;
  availableAtStores: string;
  seeAllPrices: string;

  // Family Mode
  familyMode: string;
  shareWithFamily: string;
  createSharedList: string;
  joinSharedList: string;
  shareCode: string;
  scanQrToJoin: string;
  orEnterCode: string;
  enterShareCode: string;
  joinList: string;
  createNewList: string;
  listName: string;
  creating: string;
  joining: string;
  shareThisCode: string;
  syncedList: string;
  familyListActive: string;
  leaveFamilyList: string;
  copyCode: string;
  codeCopied: string;
  invalidCode: string;
  connectionError: string;
  supabaseNotConfigured: string;
}

export const translations: Record<Language, Translations> = {
  nb: {
    // App
    appName: 'Grønnest',
    appTagline: 'Finn det grønneste valget',

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
    gronnScore: 'Miljøscore',
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
    nutriScoreExplain: 'Viser hvor sunn maten er. A er best, E er dårligst.',
    novaGroup: 'NOVA-gruppe',
    novaGroupExplain: 'Viser hvor bearbeidet maten er. 1 er naturlig, 4 er ultrabearbeidet.',
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
    welcomeTitle: 'Velkommen til Grønnest',
    welcomeSubtitle: 'Finn det grønneste valget',
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

    // Scanner
    couldNotStartCamera: 'Kunne ikke starte kameraet',
    tryManualInput: 'Prøv manuell input',
    searching: 'Søker...',
    placeBarcode: 'Plasser strekkoden i rammen',
    scanningAuto: 'Skanningen starter automatisk',
    cameraNotAvailable: 'Kamera ikke tilgjengelig',
    orEnterManually: 'Eller skriv inn strekkode manuelt...',
    tryTheseBarcodes: 'Prøv disse strekkodene:',

    // Score Info Modal
    whatIsMiljoscore: 'Hva er Miljøscore?',
    miljoscoreDescription: 'Miljøscore er vår bærekraftvurdering som hjelper deg å ta grønnere valg. Scoren beregnes basert på flere faktorer:',
    environmentalImpact: 'Miljøpåvirkning',
    environmentalImpactDesc: 'CO2-utslipp, vannforbruk og arealbruk',
    originLabel: 'Opprinnelse',
    originDesc: 'Norske produkter gir høyere score',
    certificationsLabel: 'Sertifiseringer',
    certificationsDesc: 'Nyt Norge, Debio, Svanemerket m.fl.',
    gradeScale: 'Karakterskala:',
    scoreDisclaimer: 'Miljøscore er et estimat basert på tilgjengelige data. Les mer om vår metodikk på',

    // Contact Modal
    contactUs: 'Kontakt oss',
    contactDescription: 'Har du spørsmål, tilbakemeldinger eller forslag? Vi vil gjerne høre fra deg!',
    email: 'E-post',
    aboutGronnest: 'Om Grønnest:',
    aboutGronnestDesc: 'Vi er et norsk team som ønsker å gjøre det enkelt å ta bærekraftige valg i hverdagen. Appen er gratis og samler ikke inn personlige data.',

    // Chat Modal
    gronnHelper: 'GrønnHjelper',
    aiAssistantDesc: 'AI-assistent for grønnere valg',
    chatWelcome: 'Hei! Jeg kan hjelpe deg med å finne grønnere produkter. Prøv å spørre:',
    chatSuggestion1: 'Hva er det grønneste brødet?',
    chatSuggestion2: 'Hvordan fungerer Miljøscore?',
    chatSuggestion3: 'Tips for norske produkter',
    writeMessage: 'Skriv en melding...',

    // Stats Card
    yourAverageScore: 'Din gjennomsnittlige Miljøscore',
    basedOnScans: 'Basert på {count} skann',
    scoreExcellent: 'Utmerket!',
    scoreGood: 'Bra',
    scoreAverage: 'Middels',
    scoreNeedsImprovement: 'Kan forbedres',
    scorePoor: 'Bør forbedres',

    // Export/Share
    exportList: 'Del handleliste',
    copiedToClipboard: 'Kopiert til utklippstavle!',

    // Scan History
    scanHistory: 'Skannehistorikk',
    exportHistory: 'Eksporter historikk',
    export: 'Del',
    clearAll: 'Slett alt',

    // Contribute to OFF
    productNotFoundTitle: 'Produkt ikke funnet',
    barcodeNotInDatabase: 'Denne strekkoden finnes ikke i databasen',
    helpUsGrow: 'Hjelp oss å vokse!',
    addToOpenFoodFacts: 'Legg til på Open Food Facts',
    contributeDescription: 'Open Food Facts er en åpen database med mat fra hele verden. Du kan legge til dette produktet slik at andre også kan bruke det.',

    // Price Comparison
    priceComparison: 'Prissammenligning',
    lowestPrice: 'Laveste pris',
    atStore: 'hos',
    pricePerUnit: 'per',
    noPricesAvailable: 'Prisdata ikke tilgjengelig',
    pricesFrom: 'Priser fra Kassalapp',
    availableAtStores: 'Tilgjengelig i {count} butikker',
    seeAllPrices: 'Se alle priser på Kassalapp',

    // Family Mode
    familyMode: 'Familie-modus',
    shareWithFamily: 'Del med familie',
    createSharedList: 'Opprett delt liste',
    joinSharedList: 'Bli med i liste',
    shareCode: 'Delekode',
    scanQrToJoin: 'Skann QR-kode for å bli med',
    orEnterCode: 'eller skriv inn kode',
    enterShareCode: 'Skriv inn delekode',
    joinList: 'Bli med',
    createNewList: 'Opprett ny liste',
    listName: 'Listenavn',
    creating: 'Oppretter...',
    joining: 'Blir med...',
    shareThisCode: 'Del denne koden med familien',
    syncedList: 'Synkronisert liste',
    familyListActive: 'Familie-liste aktiv',
    leaveFamilyList: 'Forlat familieliste',
    copyCode: 'Kopier kode',
    codeCopied: 'Kode kopiert!',
    invalidCode: 'Ugyldig kode. Sjekk at du har skrevet riktig.',
    connectionError: 'Kunne ikke koble til. Prøv igjen.',
    supabaseNotConfigured: 'Familie-deling er ikke konfigurert. Kontakt administrator.',
  },

  en: {
    // App
    appName: 'Grønnest',
    appTagline: 'Find the greenest choice',

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
    gronnScore: 'Eco Score',
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
    nutriScoreExplain: 'Shows how healthy the food is. A is best, E is worst.',
    novaGroup: 'NOVA group',
    novaGroupExplain: 'Shows how processed the food is. 1 is natural, 4 is ultra-processed.',
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
    welcomeTitle: 'Welcome to Grønnest',
    welcomeSubtitle: 'Find the greenest choice',
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

    // Scanner
    couldNotStartCamera: 'Could not start camera',
    tryManualInput: 'Try manual input',
    searching: 'Searching...',
    placeBarcode: 'Place the barcode in the frame',
    scanningAuto: 'Scanning starts automatically',
    cameraNotAvailable: 'Camera not available',
    orEnterManually: 'Or enter barcode manually...',
    tryTheseBarcodes: 'Try these barcodes:',

    // Score Info Modal
    whatIsMiljoscore: 'What is Eco Score?',
    miljoscoreDescription: 'Eco Score is our sustainability rating that helps you make greener choices. The score is calculated based on several factors:',
    environmentalImpact: 'Environmental impact',
    environmentalImpactDesc: 'CO2 emissions, water usage and land use',
    originLabel: 'Origin',
    originDesc: 'Norwegian products score higher',
    certificationsLabel: 'Certifications',
    certificationsDesc: 'Nyt Norge, Debio, Nordic Swan etc.',
    gradeScale: 'Grade scale:',
    scoreDisclaimer: 'Eco Score is an estimate based on available data. Learn more about our methodology at',

    // Contact Modal
    contactUs: 'Contact us',
    contactDescription: 'Have questions, feedback or suggestions? We would love to hear from you!',
    email: 'Email',
    aboutGronnest: 'About Grønnest:',
    aboutGronnestDesc: 'We are a Norwegian team that wants to make sustainable choices easy in everyday life. The app is free and does not collect personal data.',

    // Chat Modal
    gronnHelper: 'GreenHelper',
    aiAssistantDesc: 'AI assistant for greener choices',
    chatWelcome: 'Hi! I can help you find greener products. Try asking:',
    chatSuggestion1: 'What is the greenest bread?',
    chatSuggestion2: 'How does Eco Score work?',
    chatSuggestion3: 'Tips for Norwegian products',
    writeMessage: 'Write a message...',

    // Stats Card
    yourAverageScore: 'Your average Eco Score',
    basedOnScans: 'Based on {count} scans',
    scoreExcellent: 'Excellent!',
    scoreGood: 'Good',
    scoreAverage: 'Average',
    scoreNeedsImprovement: 'Needs improvement',
    scorePoor: 'Needs work',

    // Export/Share
    exportList: 'Share shopping list',
    copiedToClipboard: 'Copied to clipboard!',

    // Scan History
    scanHistory: 'Scan History',
    exportHistory: 'Export history',
    export: 'Share',
    clearAll: 'Clear all',

    // Contribute to OFF
    productNotFoundTitle: 'Product not found',
    barcodeNotInDatabase: 'This barcode is not in our database',
    helpUsGrow: 'Help us grow!',
    addToOpenFoodFacts: 'Add to Open Food Facts',
    contributeDescription: 'Open Food Facts is an open database of food from around the world. You can add this product so others can use it too.',

    // Price Comparison
    priceComparison: 'Price Comparison',
    lowestPrice: 'Lowest price',
    atStore: 'at',
    pricePerUnit: 'per',
    noPricesAvailable: 'Price data not available',
    pricesFrom: 'Prices from Kassalapp',
    availableAtStores: 'Available at {count} stores',
    seeAllPrices: 'See all prices on Kassalapp',

    // Family Mode
    familyMode: 'Family Mode',
    shareWithFamily: 'Share with family',
    createSharedList: 'Create shared list',
    joinSharedList: 'Join shared list',
    shareCode: 'Share code',
    scanQrToJoin: 'Scan QR code to join',
    orEnterCode: 'or enter code',
    enterShareCode: 'Enter share code',
    joinList: 'Join',
    createNewList: 'Create new list',
    listName: 'List name',
    creating: 'Creating...',
    joining: 'Joining...',
    shareThisCode: 'Share this code with your family',
    syncedList: 'Synced list',
    familyListActive: 'Family list active',
    leaveFamilyList: 'Leave family list',
    copyCode: 'Copy code',
    codeCopied: 'Code copied!',
    invalidCode: 'Invalid code. Please check and try again.',
    connectionError: 'Could not connect. Please try again.',
    supabaseNotConfigured: 'Family sharing is not configured. Contact administrator.',
  },
};

export function getTranslation(lang: Language): Translations {
  return translations[lang];
}
