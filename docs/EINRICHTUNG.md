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
[storyblok/components.json](../storyblok/components.json) bereit.

```bash
npx storyblok login
npx storyblok push-components storyblok/components.json --space <space-id>
```

Heisst die CLI-Version das anders — neuere Fassungen haben die Befehle
umgruppiert —, ist es:

```bash
npx storyblok components push --space <space-id> --from storyblok/components.json
```

Notfalls tippst du die sechs Komponenten nach [SCHEMA.md](../SCHEMA.md) von
Hand ab. Das dauert zwanzig Minuten und ist der einzige Schritt, der sich
wirklich klicken lässt.

*Geprüft:* Unter *Block Library* stehen sechs Komponenten. Öffne `page` und
sieh nach, dass das Feld `body` unter *Allowed components* nur `hero`,
`text_image`, `teaser_grid` und `quote` zulässt — und dass `teaser_grid.articles`
auf den Content-Type `article` gefiltert ist. Diese beiden Einschränkungen sind
das, was das Modell von einem Formular unterscheidet.

---

## 3. Inhalte anlegen

Der **Management-Token** steht unter *My Account → Personal access tokens*.
Das ist ein anderer als die beiden Delivery-Token aus Schritt 4: Er darf
schreiben. Er gehört nicht ins Repo, nicht in `.env.local` und nicht in ein
Deployment — nur in die eine Befehlszeile hier.

Erst ansehen, was passieren würde:

```bash
node scripts/storyblok-seed.mjs --dry-run
```

Dann echt (PowerShell-Fassung, weil du unter Windows arbeitest):

```powershell
$env:STORYBLOK_SPACE_ID="<space-id>"
$env:STORYBLOK_MANAGEMENT_TOKEN="<personal-access-token>"
node scripts/storyblok-seed.mjs
```

In Git Bash oder auf einem Mac:

```bash
STORYBLOK_SPACE_ID=<space-id> STORYBLOK_MANAGEMENT_TOKEN=<token> \
  node scripts/storyblok-seed.mjs
```

Das Skript legt einen Ordner `artikel/`, fünf Artikel und vier Seiten an, in
dieser Reihenfolge — das Teaser-Grid referenziert Artikel über ihre UUID, und
die gibt es erst nach dem Anlegen. Ein zweiter Lauf aktualisiert, statt zu
verdoppeln.

*Geprüft:* Im *Content*-Bereich stehen `home`, `arbeiten`, `studio`, `kontakt`
und ein Ordner `artikel` mit fünf Einträgen. Öffne `home` und sieh im
Teaser-Grid nach, dass dort drei Artikel referenziert sind und nicht drei leere
Felder.

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
- `/studio` zeigt den ruhigen Platzhalter für `interactive_timeline` — der Blok
  existiert im CMS, ist aber absichtlich nicht registriert. Die Seite kippt
  nicht, sie sagt es.

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
