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

  return undefined;
}

// Get all certifications for a product
export function getProductCertifications(labels: string[], labelTags: string[]): CertificationInfo[] {
  const found: CertificationInfo[] = [];
  const seen = new Set<string>();

  // Check both labels and label tags
  const allLabels = [...labels, ...labelTags];

  for (const label of allLabels) {
    const cert = findCertification(label);
    if (cert && !seen.has(cert.id)) {
      found.push(cert);
      seen.add(cert.id);
    }
  }

  return found;
}
