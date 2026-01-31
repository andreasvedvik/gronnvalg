'use client';

import { ArrowLeft, Shield, Database, Cookie, Mail, Lock, Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function PersonvernPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="px-6 pt-8 pb-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            aria-label="Tilbake til forsiden"
            className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-soft border border-gray-100 dark:border-gray-700 hover:scale-105 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Personvern</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Sist oppdatert: 30. januar 2026</p>
          </div>
        </div>
      </header>

      <div className="px-6 pb-12 max-w-2xl mx-auto">
        {/* Introduction */}
        <section className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ditt personvern er viktig</h2>
              <p className="text-sm text-gray-500">Grønnest tar personvern på alvor</p>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Grønnest er utviklet med personvern som en kjerneprioritet. Vi samler inn minimalt med data
            og alt lagres lokalt på din enhet. Denne personvernerklæringen forklarer hvordan vi håndterer
            informasjon når du bruker appen vår.
          </p>
        </section>

        {/* Data Collection */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Hvilke data samler vi inn?</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <h3 className="font-medium text-green-800 dark:text-green-300 mb-2">Data vi IKKE samler inn:</h3>
              <ul className="space-y-2 text-sm text-green-700 dark:text-green-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Personlig identifiserbar informasjon (navn, e-post, telefon)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Plasseringsdata eller GPS-koordinater
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Bilder fra kameraet ditt (utover strekkodeskanning)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Handlehistorikk sendes ikke til våre servere
                </li>
              </ul>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Data som lagres lokalt på din enhet:</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  Skannehistorikk (produkter du har skannet)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  Handleliste (varer du har lagt til)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  App-innstillinger (mørk modus, filtre)
                </li>
              </ul>
              <p className="mt-3 text-xs text-gray-500">
                Denne informasjonen lagres kun i nettleserens localStorage og sendes aldri til våre servere.
              </p>
            </div>
          </div>
        </section>

        {/* External Services */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Eksterne tjenester</h2>
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Open Food Facts API</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Når du skanner en strekkode, sender vi kun strekkoden til Open Food Facts for å hente produktinformasjon.
              Vi sender ingen personlig informasjon.
            </p>
            <a
              href="https://world.openfoodfacts.org/terms-of-use"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-green-600 hover:underline"
            >
              Les Open Food Facts sine vilkår →
            </a>
          </div>
        </section>

        {/* Cookies */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Cookie className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Informasjonskapsler (cookies)</h2>
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Grønnest bruker ikke informasjonskapsler for sporing eller markedsføring.
              Vi bruker kun localStorage for å lagre dine innstillinger og skannehistorikk lokalt på din enhet.
            </p>
          </div>
        </section>

        {/* Analytics */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Anonym bruksstatistikk</h2>
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              For å forbedre appen samler vi anonym bruksstatistikk. Dette inkluderer:
            </p>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></span>
                Antall skanninger (uten produktidentifikasjon)
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></span>
                Hvilke funksjoner som brukes (filter, sammenligning, etc.)
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></span>
                Generell enhetsinformasjon (skjermstørrelse, språk)
              </li>
            </ul>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-300">
                <strong>Viktig:</strong> Vi samler aldri inn personlig identifiserbar informasjon,
                IP-adresser lagres ikke, og det er ingen sporing på tvers av nettsider.
              </p>
            </div>
          </div>
        </section>

        {/* Your Rights */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dine rettigheter (GDPR)</h2>
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              I henhold til EUs personvernforordning (GDPR) og norsk personopplysningslov har du følgende rettigheter:
            </p>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></span>
                <span><strong>Rett til innsyn:</strong> Du kan se all data som er lagret lokalt i nettleserens utviklerverktøy.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></span>
                <span><strong>Rett til sletting:</strong> Du kan slette all lokal data ved å tømme nettleserdata eller bruke "Slett alt"-knappen i appen.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></span>
                <span><strong>Rett til dataportabilitet:</strong> Siden vi ikke lagrer data på våre servere, er all din data allerede på din enhet.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Delete Data */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Trash2 className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Slett dine data</h2>
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              For å slette all data som Grønnest har lagret på din enhet:
            </p>
            <button
              onClick={() => {
                if (confirm('Er du sikker på at du vil slette all Grønnest-data? Dette inkluderer skannehistorikk, handleliste, innstillinger og bruksstatistikk.')) {
                  localStorage.removeItem('gronnest-history');
                  localStorage.removeItem('gronnest-shopping');
                  localStorage.removeItem('gronnest-darkmode');
                  localStorage.removeItem('gronnest_analytics');
                  sessionStorage.removeItem('gronnest_session');
                  alert('All data er slettet. Siden vil nå lastes på nytt.');
                  window.location.href = '/';
                }
              }}
              className="w-full py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium rounded-xl border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              Slett all lokal data
            </button>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Kontakt oss</h2>
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Hvis du har spørsmål om personvern eller ønsker å utøve dine rettigheter, kontakt oss på:
            </p>
            <a
              href="mailto:personvern@gronnest.no"
              className="text-green-600 hover:underline font-medium"
            >
              personvern@gronnest.no
            </a>
          </div>
        </section>

        {/* Updates */}
        <section className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Denne personvernerklæringen kan oppdateres fra tid til annen.
            Vi vil varsle om vesentlige endringer gjennom appen.
            <br />
            <br />
            Grønnest © 2026 | Org.nr: [Kommer]
          </p>
        </section>
      </div>
    </main>
  );
}
