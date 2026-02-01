// Merkeordninger / Certification explanations
// Forklaringer på ulike sertifiseringer og merkeordninger

export interface CertificationInfo {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  icon?: string; // emoji or icon identifier
  color: string; // Tailwind color class
  url?: string; // More info URL
}

// Common Norwegian and international certifications
export const CERTIFICATIONS: Record<string, CertificationInfo> = {
  // Norwegian certifications
  'nyt-norge': {
    id: 'nyt-norge',
    name: 'Nyt Norge',
    nameEn: 'Enjoy Norway',
    description: 'Garanterer at produktet er produsert i Norge med norske råvarer.',
    descriptionEn: 'Guarantees the product is produced in Norway with Norwegian ingredients.',
    icon: '🇳🇴',
    color: 'bg-red-100 text-red-800',
    url: 'https://www.nytnorge.no/',
  },
  'debio': {
    id: 'debio',
    name: 'Debio Økologisk',
    nameEn: 'Debio Organic',
    description: 'Norsk sertifisering for økologisk produksjon uten kunstgjødsel og syntetiske sprøytemidler.',
    descriptionEn: 'Norwegian certification for organic production without chemical fertilizers and synthetic pesticides.',
    icon: '🌱',
    color: 'bg-green-100 text-green-800',
    url: 'https://debio.no/',
  },
  'keyhole': {
    id: 'keyhole',
    name: 'Nøkkelhullet',
    nameEn: 'Keyhole',
    description: 'Nordisk merke for sunnere matvalg - produktet inneholder mindre sukker, salt, fett og mer fiber.',
    descriptionEn: 'Nordic label for healthier food choices - the product contains less sugar, salt, fat and more fiber.',
    icon: '🔑',
    color: 'bg-green-100 text-green-800',
    url: 'https://www.nokkelhullsmerket.no/',
  },

  // International certifications
  'eu-organic': {
    id: 'eu-organic',
    name: 'EU Økologisk',
    nameEn: 'EU Organic',
    description: 'EU-sertifisering for økologisk produksjon i henhold til EUs økologiforordning.',
    descriptionEn: 'EU certification for organic production according to EU organic regulations.',
    icon: '🌿',
    color: 'bg-green-100 text-green-800',
  },
  'fairtrade': {
    id: 'fairtrade',
    name: 'Fairtrade',
    nameEn: 'Fairtrade',
    description: 'Sikrer rettferdig handel og bedre arbeidsforhold for bønder og arbeidere.',
    descriptionEn: 'Ensures fair trade and better working conditions for farmers and workers.',
    icon: '🤝',
    color: 'bg-blue-100 text-blue-800',
    url: 'https://fairtrade.no/',
  },
  'rainforest-alliance': {
    id: 'rainforest-alliance',
    name: 'Rainforest Alliance',
    nameEn: 'Rainforest Alliance',
    description: 'Sertifisering for bærekraftig jordbruk som beskytter regnskog og biologisk mangfold.',
    descriptionEn: 'Certification for sustainable farming that protects rainforests and biodiversity.',
    icon: '🐸',
    color: 'bg-green-100 text-green-800',
    url: 'https://www.rainforest-alliance.org/',
  },
  'msc': {
    id: 'msc',
    name: 'MSC Bærekraftig Fiske',
    nameEn: 'MSC Sustainable Fishing',
    description: 'Marine Stewardship Council - garanterer at fisken er fanget på en bærekraftig måte.',
    descriptionEn: 'Marine Stewardship Council - guarantees the fish is caught in a sustainable way.',
    icon: '🐟',
    color: 'bg-blue-100 text-blue-800',
    url: 'https://www.msc.org/',
  },
  'asc': {
    id: 'asc',
    name: 'ASC Bærekraftig Oppdrett',
    nameEn: 'ASC Sustainable Aquaculture',
    description: 'Aquaculture Stewardship Council - sertifisering for ansvarlig oppdrett av fisk og sjømat.',
    descriptionEn: 'Aquaculture Stewardship Council - certification for responsible fish and seafood farming.',
    icon: '🦐',
    color: 'bg-teal-100 text-teal-800',
    url: 'https://www.asc-aqua.org/',
  },
  'utz': {
    id: 'utz',
    name: 'UTZ Certified',
    nameEn: 'UTZ Certified',
    description: 'Sertifisering for bærekraftig produksjon av kaffe, te, kakao og hasselnøtter.',
    descriptionEn: 'Certification for sustainable production of coffee, tea, cocoa, and hazelnuts.',
    icon: '☕',
    color: 'bg-amber-100 text-amber-800',
  },
  'vegetarian': {
    id: 'vegetarian',
    name: 'Vegetarisk',
    nameEn: 'Vegetarian',
    description: 'Produktet inneholder ingen kjøtt eller fisk.',
    descriptionEn: 'The product contains no meat or fish.',
    icon: '🥬',
    color: 'bg-green-100 text-green-800',
  },
  'vegan': {
    id: 'vegan',
    name: 'Vegansk',
    nameEn: 'Vegan',
    description: 'Produktet inneholder ingen animalske ingredienser.',
    descriptionEn: 'The product contains no animal ingredients.',
    icon: '🌱',
    color: 'bg-green-100 text-green-800',
  },
  'gluten-free': {
    id: 'gluten-free',
    name: 'Glutenfri',
    nameEn: 'Gluten Free',
    description: 'Produktet inneholder ikke gluten og er trygt for personer med cøliaki.',
    descriptionEn: 'The product does not contain gluten and is safe for people with celiac disease.',
    icon: '🌾',
    color: 'bg-yellow-100 text-yellow-800',
  },
  'lactose-free': {
    id: 'lactose-free',
    name: 'Laktosefri',
    nameEn: 'Lactose Free',
    description: 'Produktet inneholder ikke laktose og er trygt for laktoseintolerante.',
    descriptionEn: 'The product does not contain lactose and is safe for lactose intolerant people.',
    icon: '🥛',
    color: 'bg-blue-100 text-blue-800',
  },
  'green-dot': {
    id: 'green-dot',
    name: 'Grønt Punkt',
    nameEn: 'Green Dot',
    description: 'Produsenten har betalt avgift til et retursystem for emballasje. NB: Dette betyr ikke at produktet er miljøvennlig eller resirkulerbart.',
    descriptionEn: 'The producer has paid a fee to a packaging return system. Note: This does not mean the product is eco-friendly or recyclable.',
    icon: '♻️',
    color: 'bg-gray-100 text-gray-600', // Gray to indicate it's not a real eco-certification
  },
  'fsc': {
    id: 'fsc',
    name: 'FSC',
    nameEn: 'FSC',
    description: 'Forest Stewardship Council - garanterer at tre/papir kommer fra bærekraftig skogbruk.',
    descriptionEn: 'Forest Stewardship Council - guarantees wood/paper comes from sustainable forestry.',
    icon: '🌲',
    color: 'bg-green-100 text-green-800',
  },
  'pefc': {
    id: 'pefc',
    name: 'PEFC',
    nameEn: 'PEFC',
    description: 'Programme for the Endorsement of Forest Certification - sertifisering for bærekraftig skogbruk.',
    descriptionEn: 'Programme for the Endorsement of Forest Certification - certification for sustainable forestry.',
    icon: '🌳',
    color: 'bg-green-100 text-green-800',
  },
  'svanemerket': {
    id: 'svanemerket',
    name: 'Svanemerket',
    nameEn: 'Nordic Swan Ecolabel',
    description: 'Det offisielle nordiske miljømerket - strenge krav til miljøpåvirkning gjennom hele livssyklusen.',
    descriptionEn: 'The official Nordic ecolabel - strict requirements for environmental impact throughout the lifecycle.',
    icon: '🦢',
    color: 'bg-green-100 text-green-800',
    url: 'https://svanemerket.no/',
  },
};

// Find certification info by matching label text
export function findCertification(labelText: string): CertificationInfo | undefined {
  const lowerLabel = labelText.toLowerCase();

  // Check for exact matches first
  for (const [key, cert] of Object.entries(CERTIFICATIONS)) {
    if (
      lowerLabel.includes(key) ||
      lowerLabel.includes(cert.name.toLowerCase()) ||
      lowerLabel.includes(cert.nameEn.toLowerCase())
    ) {
      return cert;
    }
  }

  // Check for partial matches
  if (lowerLabel.includes('nyt norge') || lowerLabel.includes('produced-in-norway')) {
    return CERTIFICATIONS['nyt-norge'];
  }
  if (lowerLabel.includes('økologisk') || lowerLabel.includes('organic') || lowerLabel.includes('bio')) {
    return CERTIFICATIONS['debio'];
  }
  if (lowerLabel.includes('nøkkelhull') || lowerLabel.includes('keyhole')) {
    return CERTIFICATIONS['keyhole'];
  }
  if (lowerLabel.includes('fairtrade') || lowerLabel.includes('fair trade') || lowerLabel.includes('fair-trade')) {
    return CERTIFICATIONS['fairtrade'];
  }
  if (lowerLabel.includes('rainforest')) {
    return CERTIFICATIONS['rainforest-alliance'];
  }
  if (lowerLabel.includes('msc') || lowerLabel.includes('marine stewardship')) {
    return CERTIFICATIONS['msc'];
  }
  if (lowerLabel.includes('asc') || lowerLabel.includes('aquaculture stewardship')) {
    return CERTIFICATIONS['asc'];
  }
  if (lowerLabel.includes('utz')) {
    return CERTIFICATIONS['utz'];
  }
  if (lowerLabel.includes('vegan')) {
    return CERTIFICATIONS['vegan'];
  }
  if (lowerLabel.includes('vegetar')) {
    return CERTIFICATIONS['vegetarian'];
  }
  if (lowerLabel.includes('glutenfri') || lowerLabel.includes('gluten-free') || lowerLabel.includes('gluten free')) {
    return CERTIFICATIONS['gluten-free'];
  }
  if (lowerLabel.includes('laktosefri') || lowerLabel.includes('lactose-free') || lowerLabel.includes('lactose free')) {
    return CERTIFICATIONS['lactose-free'];
  }
  if (lowerLabel.includes('green-dot') || lowerLabel.includes('grønt punkt') || lowerLabel.includes('grüner punkt')) {
    return CERTIFICATIONS['green-dot'];
  }
  if (lowerLabel.includes('fsc')) {
    return CERTIFICATIONS['fsc'];
  }
  if (lowerLabel.includes('pefc')) {
    return CERTIFICATIONS['pefc'];
  }
  if (lowerLabel.includes('svanemerket') || lowerLabel.includes('nordic-swan') || lowerLabel.includes('swan')) {
    return CERTIFICATIONS['svanemerket'];
  }

  return undefined;
}

// Clean up raw tag name to a readable label
export function formatLabelName(rawLabel: string): string {
  // Remove language prefix (en:, nb:, de:, etc.)
  let cleaned = rawLabel.replace(/^[a-z]{2}:/, '');

  // Replace hyphens and underscores with spaces
  cleaned = cleaned.replace(/[-_]/g, ' ');

  // Capitalize first letter of each word
  cleaned = cleaned.replace(/\b\w/g, c => c.toUpperCase());

  return cleaned;
}

// Labels that should be hidden (not useful to show)
const HIDDEN_LABELS = [
  'green-dot', // Already shown as certification
  'point-vert',
  'grüner-punkt',
  'triman', // French recycling symbol
  'tidyman', // Litter symbol
];

// Check if a label should be hidden
export function shouldHideLabel(label: string): boolean {
  const lower = label.toLowerCase();
  return HIDDEN_LABELS.some(hidden => lower.includes(hidden));
}

// Get all certifications for a product
// allergens parameter is used to filter out contradictory certifications
export function getProductCertifications(
  labels: string[],
  labelTags: string[],
  allergens?: string[]
): CertificationInfo[] {
  const found: CertificationInfo[] = [];
  const seen = new Set<string>();

  // Check allergens to prevent contradictory certifications
  const allergenLower = (allergens || []).map(a => a.toLowerCase()).join(' ');
  const hasGluten = allergenLower.includes('gluten') || allergenLower.includes('wheat') || allergenLower.includes('hvete');
  const hasLactose = allergenLower.includes('milk') || allergenLower.includes('melk') || allergenLower.includes('lactose') || allergenLower.includes('laktose');

  // Check both labels and label tags
  const allLabels = [...labels, ...labelTags];

  for (const label of allLabels) {
    const cert = findCertification(label);
    if (cert && !seen.has(cert.id)) {
      // Skip contradictory certifications
      if (cert.id === 'gluten-free' && hasGluten) {
        continue; // Don't show gluten-free if product contains gluten
      }
      if (cert.id === 'lactose-free' && hasLactose) {
        continue; // Don't show lactose-free if product contains lactose/milk
      }
      found.push(cert);
      seen.add(cert.id);
    }
  }

  return found;
}
