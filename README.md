# Blokwerk

Eine kleine Website eines fiktiven Digitalstudios, die ihre Inhalte aus
[Storyblok](https://www.storyblok.com) bezieht und mit Next.js im App Router
gerendert wird.

Das Projekt ist als Einarbeitung entstanden, nicht als Kundenarbeit. Es soll
den vollständigen Weg einmal zeigen: vom Inhaltsmodell im CMS über die
Auslieferung per API bis zur statisch gebauten Seite, die sich bei einer
Veröffentlichung gezielt selbst erneuert.

**Live:** noch nicht deployt. Die URL wird hier eingetragen, sobald der
Storyblok-Space steht — bis dahin wäre sie ein totes Versprechen. Welche
Schritte dafür offen sind, steht in [docs/ANFORDERUNGEN.md](./docs/ANFORDERUNGEN.md).

## Welche Konzepte darin vorkommen

**Next.js**

- App Router mit React Server Components
- Statische Generierung über `generateStaticParams`, ISR über `revalidate`
- Gezielte Neuvalidierung über `revalidatePath` in einer Route Handler,
  ausgelöst von einem Storyblok-Webhook
- `generateMetadata` je Artikel, inklusive Open Graph
- Draft Mode für die Vorschau, `next/image` mit Storybloks Image Service

**Storyblok**

- Zwei Content-Types (`page`, `article`) und vier verschachtelbare Bloks
- Komponenten-Map mit registriertem Fallback für unbekannte Bloks
- Aufgelöste Relationen (`resolve_relations`), damit ein Teaser-Grid Artikel
  referenzieren statt kopieren kann
- Visual Editor über die Storyblok Bridge, getrennt nach Draft und Published

## Architektur

Der Kern ist die Trennung zwischen CMS-Format und Anwendungsformat:

```
Storyblok JSON
  └─ lib/storyblok/fetch.ts       Abruf, Draft oder Published
      └─ lib/storyblok/adapters.ts   Uebersetzung in eigene Typen
          └─ components/blocks/*.tsx    duenne Naht, setzt storyblokEditable
              └─ components/ui/*.tsx       Darstellung, kennt kein CMS
```

Komponenten unter `components/ui/` importieren nichts aus `@storyblok/react`.
Das ist keine Absichtserklärung, sondern ein Gate:

```bash
bash scripts/entkopplung-check.sh
```

Es prüft drei Zusagen — dass die Darstellungsschicht das CMS nicht kennt, dass
`storyblokEditable` in der Naht bleibt, und dass die eigenen Typen nur
`import type` benutzen. Zusammen mit dem Beleg- und dem Verweis-Check läuft es
vor jedem Commit und in der CI. Was die Gates prüfen und warum, steht in
[docs/PIPELINE.md](./docs/PIPELINE.md).

Warum das so gebaut ist, steht in [DECISIONS.md](./DECISIONS.md).

## Lokal starten

```bash
npm install
bash scripts/hooks-installieren.sh   # Gates vor dem Commit
cp .env.example .env.local   # Token aus dem Storyblok-Space eintragen
npm run dev
```

Die beiden Token liegen in Storyblok unter *Settings → Access Tokens*. Der
Preview-Token darf Entwürfe lesen, der Public-Token nicht — deshalb sind es
zwei.

Für den Visual Editor braucht Storyblok eine HTTPS-URL. Am einfachsten ist es,
die Vercel-Preview-URL als Preview-URL im Space einzutragen und `/preview/` als
Pfad zu setzen. Lokal geht auch `npx next dev --experimental-https`.

## Webhook einrichten

In Storyblok unter *Settings → Webhooks*, Ereignis *Story published* und
*Story unpublished*:

```
https://<domain>/api/revalidate?secret=<STORYBLOK_WEBHOOK_SECRET>
```

Ohne diesen Webhook erscheint eine Veröffentlichung erst nach Ablauf des
`revalidate`-Intervalls von einer Stunde.

## Wofür das Projekt als Nachweis dient

Blokwerk tritt als Arbeitsprobe gegen eine konkrete Ausschreibung an. Welche
Anforderung durch welche Datei belegt ist — und welche nicht —, steht in
[docs/ANFORDERUNGEN.md](./docs/ANFORDERUNGEN.md).

## Inhaltsmodell

Siehe [SCHEMA.md](./SCHEMA.md).
