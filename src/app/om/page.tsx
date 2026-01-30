'use client';

import { ArrowLeft, Leaf, Info, Database, Scale, TrendingUp, MapPin, Package, Award, Users, Heart, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function OmPage() {
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Om GrønnValg
              <Leaf className="w-6 h-6 text-green-500" />
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Metodikk og datakilder</p>
          </div>
        </div>
      </header>

      <div className="px-6 pb-12 max-w-2xl mx-auto">
        {/* Mission */}
        <section className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Vår misjon</h2>
              <p className="text-sm text-gray-500">Gjøre bærekraftige valg enkelt</p>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            GrønnValg hjelper deg å ta informerte valg når du handler. Ved å skanne produkter
            kan du se miljøpåvirkning og finne norske, bærekraftige alternativer. Vi tror at
            små valg i hverdagen kan gjøre en stor forskjell for miljøet.
          </p>
        </section>

        {/* GrønnScore Methodology */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Scale className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Slik beregner vi GrønnScore</h2>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 mb-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Viktig:</strong> GrønnScore er et verktøy for å sammenligne produkters miljøpåvirkning.
              Scoren er basert på tilgjengelige data og bør brukes som veiledning, ikke absolutt sannhet.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">GrønnScore (0-100)</h3>
              <p className="text-sm text-gray-500 mt-1">Vektet gjennomsnitt av fem faktorer:</p>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {/* Ecoscore */}
              <div className="p-4 flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-white">Miljøpåvirkning (Eco-Score)</h4>
                    <span className="text-sm font-bold text-green-600">40%</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Basert på produktets Eco-Score fra Open Food Facts, som vurderer klimaavtrykk,
                    vannforbruk, arealbruk og mer.
                  </p>
                </div>
              </div>

              {/* Transport */}
              <div className="p-4 flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-white">Transport</h4>
                    <span className="text-sm font-bold text-green-600">25%</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Estimert transportavstand basert på opprinnelsesland. Norske og nordiske
                    produkter scorer høyest.
                  </p>
                </div>
              </div>

              {/* Norwegian */}
              <div className="p-4 flex items-start gap-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🇳🇴</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-white">Norsk opprinnelse</h4>
                    <span className="text-sm font-bold text-green-600">15%</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Bonus for produkter produsert i Norge. Støtter lokalt næringsliv og
                    reduserer klimaavtrykk fra transport.
                  </p>
                </div>
              </div>

              {/* Packaging */}
              <div className="p-4 flex items-start gap-4">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-white">Emballasje</h4>
                    <span className="text-sm font-bold text-green-600">10%</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Vurderer type emballasje. Glass og papir scorer høyere enn plast.
                    Resirkulerbar emballasje gir bonus.
                  </p>
                </div>
              </div>

              {/* Certifications */}
              <div className="p-4 flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-white">Sertifiseringer</h4>
                    <span className="text-sm font-bold text-green-600">10%</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Anerkjente miljøsertifiseringer som Nyt Norge, Debio, Svanemerket,
                    MSC, ASC og Fairtrade gir bonus.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nutrition Info */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Næringsinfo</h2>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 mb-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              <strong>Ansvarsfraskrivelse:</strong> Næringsinfo er kun ment som generell informasjon og
              er ikke medisinsk rådgivning. Konsulter en helsepersonell for kostholdsspørsmål.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Vi viser Nutri-Score og NOVA-gruppe for å gi deg rask oversikt over næringsprofilen:
            </p>

            <div className="space-y-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Nutri-Score (A-E)</h4>
                <p className="text-xs text-gray-500">
                  Europeisk system som vurderer næringsinnhold. A er best, E er minst gunstig.
                  Tar hensyn til kalorier, sukker, mettet fett, salt, fiber, protein og frukt/grønnsaker.
                </p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">NOVA-gruppe (1-4)</h4>
                <p className="text-xs text-gray-500">
                  Klassifiserer mat etter bearbeidingsgrad. 1 = ubearbeidet, 4 = ultrabearbeidet.
                  Generelt anbefales det å velge mindre bearbeidede matvarer.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Data Sources */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Datakilder</h2>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-4 mb-4">
              <img
                src="https://static.openfoodfacts.org/images/logos/off-logo-horizontal-light.svg"
                alt="Open Food Facts"
                className="h-8 dark:invert"
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              All produktdata kommer fra <strong>Open Food Facts</strong>, en gratis, åpen database
              med matvareinformasjon fra hele verden. Databasen vedlikeholdes av frivillige og
              inneholder over 2 millioner produkter.
            </p>
            <a
              href="https://world.openfoodfacts.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-green-600 hover:underline"
            >
              Besøk Open Food Facts
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </section>

        {/* Limitations */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Begrensninger</h2>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></span>
                <span>Ikke alle produkter finnes i databasen, spesielt nyere eller lokale produkter.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></span>
                <span>Produktinformasjon oppdateres av frivillige og kan være utdatert eller ufullstendig.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></span>
                <span>GrønnScore er et estimat basert på tilgjengelige data og kan ikke fange alle miljøfaktorer.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></span>
                <span>Transport-estimater er basert på opprinnelsesland, ikke faktisk transportrute.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Team */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Om oss</h2>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              GrønnValg er utviklet av et norsk team som brenner for bærekraft og teknologi.
              Vi tror at tilgang til god informasjon er nøkkelen til bedre forbrukervalg.
              <br /><br />
              Appen er gratis å bruke og vi samler ikke inn personlige data.
              Har du spørsmål eller tilbakemeldinger? Send oss en e-post på{' '}
              <a href="mailto:hei@gronnvalg.no" className="text-green-600 hover:underline">
                hei@gronnvalg.no
              </a>
            </p>
          </div>
        </section>

        {/* Links */}
        <section className="space-y-3">
          <Link
            href="/personvern"
            className="block p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900 dark:text-white">Personvernerklæring</span>
              <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
            </div>
          </Link>

          <Link
            href="/vilkar"
            className="block p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900 dark:text-white">Brukervilkår</span>
              <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
            </div>
          </Link>
        </section>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            GrønnValg © 2026 | Versjon 1.0
          </p>
        </div>
      </div>
    </main>
  );
}
