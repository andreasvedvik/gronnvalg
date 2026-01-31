'use client';

import { ArrowLeft, FileText, CheckCircle, AlertCircle, Scale, Ban, Mail } from 'lucide-react';
import Link from 'next/link';

export default function VilkarPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="px-6 pt-8 pb-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-soft border border-gray-100 dark:border-gray-700 hover:scale-105 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Brukervilkår</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Sist oppdatert: 30. januar 2026</p>
          </div>
        </div>
      </header>

      <div className="px-6 pb-12 max-w-2xl mx-auto">
        {/* Introduction */}
        <section className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Velkommen til Grønnest</h2>
              <p className="text-sm text-gray-500">Les vilkårene før du bruker appen</p>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Ved å bruke Grønnest godtar du disse brukervilkårene. Hvis du ikke godtar vilkårene,
            ber vi deg om å ikke bruke appen. Vi anbefaler at du leser gjennom disse vilkårene nøye.
          </p>
        </section>

        {/* Acceptance */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">1. Godkjenning av vilkår</h2>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ved å laste ned, installere eller bruke Grønnest-appen godtar du å være bundet av disse
              brukervilkårene. Hvis du bruker appen på vegne av en organisasjon, godtar du vilkårene
              på vegne av denne organisasjonen.
            </p>
          </div>
        </section>

        {/* Service Description */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Scale className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">2. Beskrivelse av tjenesten</h2>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Grønnest er en gratis app som lar brukere:
            </p>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></span>
                Skanne strekkoder på matvarer for å se miljøinformasjon
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></span>
                Se Miljøscore basert på produktets miljøpåvirkning
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></span>
                Finne alternative produkter med bedre miljøprofil
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></span>
                Lagre handlelister og skannehistorikk lokalt
              </li>
            </ul>
          </div>
        </section>

        {/* Disclaimers */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">3. Ansvarsfraskrivelser</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <h3 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">Viktig informasjon</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Grønnest gir informasjon og veiledning, men erstatter ikke profesjonell rådgivning
                innen ernæring, helse eller miljø.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">3.1 Datanøyaktighet</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Produktinformasjon hentes fra Open Food Facts, en åpen database vedlikeholdt av frivillige.
                Vi kan ikke garantere at all informasjon er korrekt, fullstendig eller oppdatert.
                Sjekk alltid produktemballasjen for offisiell informasjon.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">3.2 Miljøscore og Næringsinfo</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Miljøscore er et estimat basert på tilgjengelige data og vår metodikk. Scoren er ment
                som veiledning for å sammenligne produkter, ikke som en absolutt vurdering.
                Næringsinfo (Nutri-Score, NOVA) er basert på europeiske klassifiseringssystemer
                og utgjør ikke medisinsk eller ernæringsmessig rådgivning.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">3.3 Allergener og helseinformasjon</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Grønnest viser allergeninformasjon hentet fra Open Food Facts-databasen. Denne informasjonen
                kan være ufullstendig eller utdatert. Personer med matallergier eller intoleranser må alltid
                sjekke produktemballasjen for offisiell allergeninformasjon. Ved helserelaterte spørsmål,
                kontakt helsepersonell.
              </p>
            </div>
          </div>
        </section>

        {/* Usage Rules */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Ban className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">4. Bruksregler</h2>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Du godtar å ikke:
            </p>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5"></span>
                Bruke appen til ulovlige formål
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5"></span>
                Forsøke å omgå sikkerhetstiltak i appen
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5"></span>
                Automatisert skanning eller datahøsting uten tillatelse
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5"></span>
                Distribuere eller selge informasjon hentet fra appen
              </li>
            </ul>
          </div>
        </section>

        {/* Intellectual Property */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">5. Immaterielle rettigheter</h2>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Grønnest-appen, inkludert design, kode og Miljøscore-metodikken, er beskyttet av
              opphavsrett. Produktdata fra Open Food Facts er tilgjengelig under Open Database License.
              Du kan bruke appen til personlig, ikke-kommersiell bruk.
            </p>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Scale className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">6. Ansvarsbegrensning</h2>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Grønnest leveres "som den er" uten garantier av noe slag. Vi er ikke ansvarlige for
              tap eller skade som følge av bruk av appen, inkludert men ikke begrenset til:
              feilaktig produktinformasjon, tap av data, eller beslutninger tatt basert på
              informasjon fra appen. Vår maksimale ansvar er begrenset til det beløp du har
              betalt for appen (som er null, da appen er gratis).
            </p>
          </div>
        </section>

        {/* Changes */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">7. Endringer i vilkårene</h2>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Vi forbeholder oss retten til å endre disse vilkårene når som helst. Vesentlige endringer
              vil bli varslet gjennom appen. Fortsatt bruk av appen etter endringer utgjør godkjenning
              av de nye vilkårene.
            </p>
          </div>
        </section>

        {/* Governing Law */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Scale className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">8. Gjeldende lov</h2>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Disse vilkårene er underlagt norsk lov. Eventuelle tvister skal løses ved norske domstoler
              med Oslo tingrett som verneting.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">9. Kontakt</h2>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Har du spørsmål om disse vilkårene? Kontakt oss på:
            </p>
            <a
              href="mailto:vilkar@gronnest.no"
              className="text-green-600 hover:underline font-medium"
            >
              vilkar@gronnest.no
            </a>
          </div>
        </section>

        {/* Footer */}
        <section className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Ved å bruke Grønnest bekrefter du at du har lest, forstått og godtar disse brukervilkårene.
            <br /><br />
            Grønnest © 2026 | Org.nr: [Kommer]
          </p>
        </section>
      </div>
    </main>
  );
}
