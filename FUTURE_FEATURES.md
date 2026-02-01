# Grønnest - Fremtidige Funksjoner

Basert på brukeranmeldelser fra Bestemor Gerd (74), Pappa Erik (42) og Emma (16).

---

## 1. 🔤 Større tekst-valg (Tilgjengelighet)

**Bruker:** Bestemor Gerd
**Kompleksitet:** 🟢 Enkel
**Prioritet:** Høy

### Beskrivelse
Legg til innstilling for å velge tekststørrelse (Normal, Stor, Ekstra stor).

### Implementasjon
```typescript
// src/lib/accessibility.ts
type TextSize = 'normal' | 'large' | 'xl';

// CSS-variabler i globals.css
:root {
  --text-scale: 1;
}
.text-large { --text-scale: 1.15; }
.text-xl { --text-scale: 1.3; }

// Bruk: font-size: calc(1rem * var(--text-scale));
```

### Filer som må endres
- `src/app/globals.css` - CSS-variabler for tekststørrelse
- `src/app/page.tsx` - Lagre preferanse i localStorage
- `src/components/LanguageSelector.tsx` → Utvide til `SettingsSelector`
- Ny komponent: `src/components/TextSizeSelector.tsx`

### Estimert tid: 2-3 timer

---

## 2. 👨‍👩‍👧‍👦 Familie-modus med delt handleliste

**Bruker:** Pappa Erik
**Kompleksitet:** 🔴 Kompleks
**Prioritet:** Medium

### Beskrivelse
Flere familiemedlemmer kan dele samme handleliste i sanntid.

### Arkitektur-alternativer

#### A) Enkel: Delt kode/QR
- Generer unik liste-ID
- Del via QR-kode eller link
- Synkroniser via polling eller WebSocket
- Ingen brukerkontoer nødvendig

#### B) Full: Backend med auth
- Supabase/Firebase for realtime database
- Brukerkontoer (Google/Apple login)
- Familie-grupper med invitasjoner

### Teknologi-stack (Alternativ A)
```
- Supabase Realtime (gratis tier)
- eller PartyKit for WebSocket
- QR-kode: qrcode.react
```

### Database-skjema
```sql
-- Supabase
CREATE TABLE shared_lists (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP,
  items JSONB,
  last_updated TIMESTAMP
);
```

### Estimert tid: 1-2 uker

---

## 3. 🔔 Push-varsler i butikken

**Bruker:** Pappa Erik
**Kompleksitet:** 🟡 Medium
**Prioritet:** Lav

### Beskrivelse
Påminnelse om handleliste når bruker er i nærheten av en matbutikk.

### Teknisk løsning
```typescript
// Service Worker + Geolocation API
// 1. Registrer geofences rundt butikker
// 2. Trigger push-notifikasjon ved inngang

// Butikk-koordinater fra Kassalapp API eller manuell liste
const STORE_LOCATIONS = [
  { name: 'Kiwi', lat: 59.9139, lng: 10.7522, radius: 100 },
  // ...
];
```

### Utfordringer
- Krever bakgrunns-lokasjon (battery drain)
- iOS har begrensninger på geofencing
- Personvern-hensyn

### Alternativ: Manuell påminnelse
- Bruker setter selv påminnelse-tid
- Enklere å implementere
- Ingen personvern-problemer

### Estimert tid: 3-5 dager

---

## 4. 📸 Bilde-skanning av produkter

**Bruker:** Emma
**Kompleksitet:** 🔴 Kompleks
**Prioritet:** Medium

### Beskrivelse
Ta bilde av produktet (ikke strekkode) og få info via bildegjenkjenning.

### Teknologi-alternativer

#### A) Google Cloud Vision API
```typescript
// Kost: $1.50 per 1000 bilder
const response = await vision.labelDetection(image);
// Søk i Open Food Facts basert på labels
```

#### B) Open Food Facts Image Search
```typescript
// Gratis, men eksperimentell
POST https://world.openfoodfacts.org/cgi/product_image_search.pl
```

#### C) On-device ML (TensorFlow.js)
- Trene egen modell på matvare-bilder
- Kjører lokalt, ingen API-kostnader
- Krever betydelig utviklingstid

### Implementasjon (Cloud Vision)
```typescript
// src/lib/imageRecognition.ts
export async function recognizeProduct(imageBase64: string) {
  const response = await fetch('/api/vision', {
    method: 'POST',
    body: JSON.stringify({ image: imageBase64 })
  });
  const labels = await response.json();
  // Søk OFF med labels
  return searchByLabels(labels);
}
```

### Estimert tid: 1-2 uker

---

## 5. 💰 Priser i sammenligning

**Bruker:** Pappa Erik
**Kompleksitet:** 🟢 Enkel
**Prioritet:** Høy

### Beskrivelse
Vis priser side-om-side når man sammenligner produkter.

### Implementasjon
Priser hentes allerede fra Kassalapp! Bare vise dem i ComparisonModal.

```typescript
// src/components/modals/ComparisonModal.tsx
// Legg til pris-rad i sammenlignings-tabellen

<tr>
  <td>Laveste pris</td>
  <td>{product1.prices?.[0]?.price || '-'} kr</td>
  <td>{product2.prices?.[0]?.price || '-'} kr</td>
</tr>
```

### Filer som må endres
- `src/components/modals/ComparisonModal.tsx`

### Estimert tid: 1-2 timer

---

## Prioritert rekkefølge

| # | Funksjon | Tid | Verdi |
|---|----------|-----|-------|
| 1 | Priser i sammenligning | 1-2t | ⭐⭐⭐ |
| 2 | Større tekst-valg | 2-3t | ⭐⭐⭐ |
| 3 | Bilde-skanning | 1-2u | ⭐⭐ |
| 4 | Familie-modus | 1-2u | ⭐⭐ |
| 5 | Push-varsler | 3-5d | ⭐ |

---

*Generert: Februar 2026*
