# Einrichtung

Von einem leeren Storyblok-Konto bis zur deployten Seite mit Webhook. Rund
eine Stunde, davon die Hälfte Wartezeit.

Die Schritte bauen aufeinander auf: Ohne Komponenten schlägt das Seeding fehl,
ohne Inhalte startet die Anwendung nicht, ohne Deployment gibt es keine
Vorschau im Visual Editor. In der Reihenfolge bleiben.

Was am Ende jedes Schritts steht, ist eine Prüfung. Wenn sie nicht zutrifft,
weiter unten unter [Wenn etwas klemmt](#wenn-etwas-klemmt) nachsehen, statt
zum nächsten Schritt zu gehen.

---

## 1. Space anlegen

Auf [app.storyblok.com](https://app.storyblok.com) einen neuen Space anlegen.

**Region EU.** Das ist keine Vorliebe: `src/lib/storyblok/server.ts` setzt
`apiOptions: { region: "eu" }`. Bei einer anderen Region kommen leere Antworten
zurück, ohne verständlichen Fehler.

Die **Space-ID** steht unter *Settings → General*, eine sechs- bis
siebenstellige Zahl. Notieren, sie wird zweimal gebraucht.

*Geprüft:* Der Space existiert und du kennst seine ID.

---

## 2. Komponenten anlegen

Die sechs Komponenten aus [SCHEMA.md](../SCHEMA.md) liegen als
[storyblok/components.json](../storyblok/components.json) bereit, im Format, das
die CLI liest: ein blankes Array.

```bash
npx storyblok login
node scripts/komponenten-bereitstellen.mjs <space-id>
npx storyblok components push --space <space-id>
```

Der mittlere Schritt kopiert die Datei dorthin, wo die CLI sie sucht:
`.storyblok/components/<space-id>/components.json`. Die v4-CLI nimmt keinen
Dateipfad entgegen — `--from` ist eine Space-ID, kein Verzeichnis. Dieses
Verzeichnis ist ihr Arbeitsordner und steht in `.gitignore`; gepflegt wird
weiterhin die Fassung im Repo.

*Geprüft:* Unter *Block Library* stehen die sechs Komponenten. Öffne `page` und
sieh nach, dass `body` unter *Allowed components* nur `hero`, `text_image`,
`teaser_grid` und `quote` zulässt — und dass `teaser_grid.articles` auf den
Content-Type `article` gefiltert ist. Diese beiden Einschränkungen sind das, was
das Modell von einem Formular unterscheidet.

Ein neuer Space bringt vier Komponenten des Starter-Templates mit: `feature`,
`grid`, `teaser` und ein eigenes `page`. Unser Push überschreibt `page`; die
anderen drei löschst du in der *Block Library*. Sie gehören nicht zum Modell,
und wer sie einsetzt, bekommt im Frontend den Platzhalter für unbekannte Bloks.

---

## 3. Inhalte anlegen

Die neun Stories stehen in `src/lib/storyblok/fixtures/inhalte.ts` — dieselben,
gegen die die CI baut. Es gibt zwei Wege, sie in den Space zu bekommen.

**Über die CLI**, empfohlen, weil `storyblok login` ohnehin gelaufen ist und
kein zweites Geheimnis nötig wird:

```bash
node scripts/stories-bereitstellen.mjs <space-id> --artikel
npx storyblok stories push --space <space-id> --publish
npx storyblok stories pull --space <space-id>
node scripts/stories-bereitstellen.mjs <space-id> --seiten
npx storyblok stories push --space <space-id> --publish
```

Fünf Befehle statt einem, und der Grund steht im Inhaltsmodell: Das Teaser-Grid
referenziert Artikel über ihre UUID. Die vergibt Storyblok beim Anlegen, also
müssen die Artikel existieren, bevor die Seiten geschrieben werden. Der
`pull` dazwischen holt die vergebenen UUIDs.

**Über die Management API**, falls du lieber einen Personal Access Token
benutzt (*My Account → Personal access tokens*):

```powershell
$env:STORYBLOK_SPACE_ID="<space-id>"
$env:STORYBLOK_MANAGEMENT_TOKEN="<token>"
node scripts/storyblok-seed.mjs
```

Der Trockenlauf `node scripts/storyblok-seed.mjs --dry-run` zeigt vorher, was
passieren würde.

*Geprüft:* Im *Content*-Bereich stehen `home`, `arbeiten`, `studio`, `kontakt`
und ein Ordner `artikel` mit fünf Einträgen, alle *Published*. Öffne `home` und
sieh im Teaser-Grid nach, dass dort drei Artikel referenziert sind und nicht
drei leere Felder.

**Was beim ersten Lauf schiefgehen kann**, aus Erfahrung:

Die CLI legt neue Stories auf der obersten Ebene an, auch wenn die Datei einen
Pfad nennt. Liegen die Artikel neben statt in `artikel/`, läuft `/artikel/<slug>`
ins Leere — das Skript setzt deshalb `parent_id`, aber erst, wenn der Ordner
existiert. Bleiben aus einem Fehlversuch leere Stories auf der obersten Ebene
liegen, löschst du sie im *Content*-Bereich; sie sind unveröffentlicht und
öffentlich unsichtbar, stören aber im Editor.

---

## 4. Lokal gegen echte Inhalte starten

Beide Delivery-Token stehen unter *Settings → Access Tokens*. Der eine ist vom
Typ *Public*, der andere vom Typ *Preview*.

```bash
cp .env.example .env.local
```

Dann in `.env.local` eintragen:

| Variable | Wert |
|---|---|
| `STORYBLOK_PUBLIC_TOKEN` | der Public-Token |
| `NEXT_PUBLIC_STORYBLOK_PREVIEW_TOKEN` | der Preview-Token |
| `STORYBLOK_WEBHOOK_SECRET` | irgendeine Zeichenfolge, die du dir ausdenkst |
| `NEXT_PUBLIC_SITE_URL` | vorerst `http://localhost:3000` |

`BLOKWERK_FIXTURES` bleibt auskommentiert. Ab jetzt kommen die Inhalte aus dem
CMS.

```bash
npm run dev
```

*Geprüft:* Auf `http://localhost:3000` steht die Startseite **ohne** den grauen
Hinweisbalken über dem Header. Das ist die eigentliche Probe des ganzen
Projekts: Was du siehst, kommt jetzt über die API. Weiter prüfen:

- `/journal` listet fünf Artikel, absteigend nach Datum
- ein Artikel öffnet sich, zeigt Rich Text, Zitat und Aufzählung
- der Hero zeigt zwei Schaltflächen, das Teaser-Grid drei Karten mit Datum,
  Autor und Lesezeit

Den Platzhalter für unbekannte Bloks siehst du hier **nicht**: Der Blok
`interactive_timeline` aus den Fixtures wird beim Hochladen ausgelassen, weil
ihn das Modell nicht kennt und `page.body` ihn nicht zuliesse. Die Probe dafür
steht in [SCHEMA.md](../SCHEMA.md) und ist eine Sache von zwei Minuten: einen
Blok anlegen, einsetzen, nicht registrieren.

---

## 5. Visual Editor einrichten

Storyblok lädt die Seite in einem iframe und braucht dafür eine URL. Lokal geht
das nur über HTTPS:

```bash
npx next dev --experimental-https
```

Unter *Settings → Visual Editor → Location* eintragen:

```
https://localhost:3000/preview/
```

Der Schrägstrich am Ende gehört dazu. Die Vorschau läuft über eine eigene
Route (`src/app/preview/[[...slug]]/`), die mit dem Preview-Token liest — der
öffentliche Weg kann Entwürfe technisch nicht ausliefern.

Bequemer ist es, diesen Schritt nach dem Deployment zu machen und die
Vercel-URL einzutragen. Dann entfällt das Zertifikatstheater.

*Geprüft:* Beim Öffnen einer Story erscheint die Seite rechts im Editor, und
ein Klick auf eine Überschrift springt links zum passenden Feld.

---

## 6. Auf Vercel deployen

Repository importieren auf [vercel.com/new](https://vercel.com/new). Framework
wird als Next.js erkannt, an den Build-Einstellungen ist nichts zu ändern.

Unter *Settings → Environment Variables* dieselben vier Werte wie in
`.env.local` eintragen, mit einer Ausnahme: `NEXT_PUBLIC_SITE_URL` ist jetzt
die echte Domain.

**`BLOKWERK_FIXTURES` wird nicht gesetzt.** Warum das wichtig ist, steht in
[DECISIONS.md](../DECISIONS.md), Punkt 11: Der Schalter ist ausdrücklich, damit
ein Deployment ohne Token laut abbricht, statt still Beispielinhalte
auszuliefern.

Danach die URL in [README.md](../README.md) eintragen, dort wo bisher „noch
nicht deployt" steht. Der Verweis-Check prüft nur Pfade im Repo, nicht das
Netz — eine tote Live-URL fiele also niemandem auf ausser dem Leser.

*Geprüft:* Die Seite lädt unter der Vercel-URL, ohne Hinweisbalken, mit
Inhalten aus dem CMS.

---

## 7. Webhook einrichten

Unter *Settings → Webhooks* einen Webhook anlegen für die Ereignisse *Story
published* und *Story unpublished*:

```
https://<deine-domain>/api/revalidate?secret=<STORYBLOK_WEBHOOK_SECRET>
```

Das Geheimnis ist dasselbe wie in den Vercel-Umgebungsvariablen.

Ohne diesen Webhook erscheint eine Veröffentlichung erst nach Ablauf des
`revalidate`-Intervalls von einer Stunde. Mit ihm in Sekunden, und nur für die
betroffene Seite.

*Geprüft:* Ändere eine Überschrift in `home`, veröffentliche, lade die Live-URL
neu. Der neue Text steht da. Unter *Webhooks → deine URL* zeigt Storyblok die
letzten Auslieferungen samt Antwortcode — dort muss 200 stehen. Kommt 401,
stimmt das Geheimnis nicht überein.

---

## 8. Messen und nachtragen

Jetzt erst ist die Messung ehrlich, weil echte Bilder dabei sind.

Lighthouse in Chrome DevTools gegen die Live-URL laufen lassen, Modus *Mobile*.
Die vier Zahlen — Performance, Accessibility, Best Practices, SEO — gehören in
[docs/ANFORDERUNGEN.md](./ANFORDERUNGEN.md) unter Anforderung 4, zusammen mit
dem Datum und der URL, gegen die gemessen wurde.

Danach in derselben Datei unter *Offene Punkte* streichen, was erledigt ist.

*Geprüft:* `bash scripts/beleg-check.sh` läuft weiterhin grün.

---

## Wenn etwas klemmt

**`401` beim Seeding.** Der Token ist keiner vom Typ *Personal access token*.
Ein Delivery-Token darf nicht schreiben.

**`422` beim Seeding.** Eine Komponente fehlt oder heisst anders. Schritt 2
wiederholen und die technischen Namen vergleichen — sie müssen exakt
übereinstimmen, `text_image` mit Unterstrich, nicht `textImage`.

**Das Teaser-Grid ist leer, obwohl Artikel referenziert sind.** Dann liefert
die API UUIDs statt Stories. `RESOLVE_RELATIONS` in
`src/lib/storyblok/components.ts` muss `teaser_grid.articles` enthalten, und
das Feld im CMS muss genau `articles` heissen. Der Adapter filtert unaufgelöste
Referenzen bewusst heraus, statt kaputte Karten zu rendern — deshalb sieht es
aus wie „nichts ausgewählt".

**Leere Antworten ohne Fehler.** Fast immer die Region. Der Space liegt nicht
in der EU, `server.ts` fragt aber dort.

**Ein Artikel erscheint nicht im Journal.** Das Feld `date` ist leer. Sortiert
wird nach `content.date`; ohne Wert fällt der Artikel ans Ende oder heraus.

**Die Seite zeigt weiter Beispielinhalte.** Dann ist `BLOKWERK_FIXTURES=1`
irgendwo gesetzt — in `.env.local`, in der Shell, oder bei Vercel. Der graue
Balken über dem Header sagt es; er ist genau dafür da.

---

## Und danach

Lege eine Seite von Hand an. Nicht wegen des Repos — sondern weil im Gespräch
die Frage kommt, wie sich das Modell für eine Redaktion anfühlt, und darauf
gibt es keine Antwort aus der Dokumentation. Stapel ein paar Bausteine, versuch
absichtlich etwas Verbotenes, sieh nach, wo die Whitelist greift.
