/**
 * Die Inhalte des Fixture-Betriebs.
 *
 * Format ist bewusst das Antwortformat der Storyblok Content Delivery API,
 * nicht das eigene Format aus lib/types.ts. Der Grund steht in DECISIONS.md,
 * Punkt 11: Diese Dateien ersetzen den Transport, nicht das Datenformat. Der
 * Adapter laeuft also mit, statt uebersprungen zu werden — sonst pruefte ein
 * Build gegen Fixtures die Stelle nicht, an der die meiste Logik liegt.
 *
 * Der Text stammt aus den Mockups in docs/entwurf/. Bilder fehlen absichtlich:
 * Ein Asset-Feld ohne Datei ist der Fall, den toImage() abfangen muss.
 */

type Blok = Record<string, unknown>;

/** Storyblok liefert Datumsfelder als "YYYY-MM-DD HH:mm". */
function artikel(
  slug: string,
  felder: {
    title: string;
    teaser: string;
    date: string;
    author: string;
    author_bio?: string;
    topic?: string;
    reading_minutes: number;
    body: Blok;
  },
) {
  return {
    name: felder.title,
    slug,
    full_slug: `artikel/${slug}`,
    content: { component: "article", ...felder },
  };
}

function absatz(text: string): Blok {
  return { type: "paragraph", content: [{ type: "text", text }] };
}

function ueberschrift(text: string): Blok {
  return { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text }] };
}

function zitat(text: string): Blok {
  return { type: "blockquote", content: [absatz(text)] };
}

function liste(...punkte: string[]): Blok {
  return {
    type: "bullet_list",
    content: punkte.map((punkt) => ({
      type: "list_item",
      content: [absatz(punkt)],
    })),
  };
}

export const ARTIKEL = [
  artikel("design-tokens-vor-dem-redesign", {
    title: "Design-Tokens vor dem Redesign einführen",
    teaser:
      "Wer Farben und Abstände zuerst benennt, diskutiert im Entwurf über Struktur statt über Geschmack.",
    date: "2026-07-14 09:00",
    author: "Marlene Roth",
    author_bio:
      "Marlene Roth gestaltet bei Blokwerk Oberflächen und kümmert sich um alles, was mehr als einmal vorkommt.",
    topic: "Gestaltung",
    reading_minutes: 6,
    body: {
      type: "doc",
      content: [
        absatz(
          "Ein Redesign beginnt selten mit einer Frage nach Farben. Es beginnt mit einer Seite, die niemand mehr ändern will, weil unklar ist, was dabei kaputtgeht.",
        ),
        ueberschrift("Erst benennen, dann entwerfen"),
        absatz(
          "Wir schreiben vor dem ersten Entwurf auf, welche Abstände es geben soll und welche nicht. Vier Schritte, keine Zwischenwerte. Das klingt nach einer Einschränkung und ist eine: Genau deshalb hört die Diskussion über einzelne Pixel auf.",
        ),
        liste(
          "Farben bekommen Rollen, keine Namen aus dem Farbkreis.",
          "Abstände sind eine Reihe, kein Vorrat.",
          "Schriftgrössen folgen der Reihe, nicht dem Gefühl.",
        ),
        zitat(
          "Ein Token, das niemand benennen kann, ist kein Token, sondern ein Sonderfall mit besserem Namen.",
        ),
        absatz(
          "Nach zwei Projekten mit dieser Reihenfolge dauert die Entwurfsphase etwa gleich lang. Was kürzer wird, ist alles danach.",
        ),
      ],
    },
  }),
  artikel("cms-modell-ohne-bremse", {
    title: "Ein CMS-Modell, das Redaktionen nicht ausbremst",
    teaser:
      "Zwölf Inhaltstypen für eine Hochschule: wie wir von 40 Feldern auf 14 gekommen sind.",
    date: "2026-06-02 09:00",
    author: "Tobias Frei",
    author_bio:
      "Tobias Frei arbeitet bei Blokwerk an Inhaltsmodellen und Redaktionsprozessen.",
    topic: "Inhaltsmodellierung",
    reading_minutes: 9,
    body: {
      type: "doc",
      content: [
        absatz(
          "Das alte System hatte für Studiengänge 40 Felder. Ausgefüllt wurden im Schnitt elf. Der Rest stand leer, weil niemand mehr wusste, wofür er gedacht war, oder weil die Angabe längst in einem anderen System gepflegt wurde. Solche Felder verschwinden nicht von allein, sie werden mit jedem Relaunch mitgenommen.",
        ),
        ueberschrift("Wir haben mit den Fällen begonnen, nicht mit den Feldern"),
        absatz(
          "Statt das bestehende Modell zu bereinigen, haben wir gefragt, welche zwölf Seiten die Redaktion im letzten Jahr wirklich angelegt hat. Daraus ergaben sich vier Inhaltstypen: Studiengang, Modul, Person, Meldung. Alles andere war eine Variante davon.",
        ),
        absatz(
          "Für jeden Typ haben wir dann eine Regel aufgestellt: Ein Feld bleibt nur, wenn eine Person im Raum benennen kann, wer es pflegt und wo es erscheint. Neun Felder haben diese Frage nicht überlebt, drei weitere sind in einen Baustein gewandert, der nur auf Kampagnenseiten vorkommt.",
        ),
        zitat("Ein Feld bleibt nur, wenn jemand benennen kann, wer es pflegt."),
        ueberschrift("Bausteine statt Sonderseiten"),
        absatz(
          "Die Redaktion hatte vorher für jede besondere Seite eine Vorlage bestellt. Heute gibt es sieben Bausteine, die sich frei stapeln lassen: Text, Text mit Bild, Zitat, Teaser-Liste, Kennzahlen, Kontaktkarte, Download-Liste. Das reicht für alles, was in zwölf Monaten angefragt wurde.",
        ),
        absatz(
          "Ein Nebeneffekt: Wenn ein Baustein aus einem Import stammt, den das Frontend nicht kennt, zeigt die Seite einen ruhigen Platzhalter mit dem technischen Namen an. Die Seite bleibt lesbar, und in der Entwicklung sieht man sofort, was fehlt.",
        ),
        absatz(
          "Nach vier Monaten pflegt die Hochschule 340 Seiten selbst. Unsere Wartungsstunden liegen bei durchschnittlich zwei pro Monat, vorher waren es elf.",
        ),
      ],
    },
  }),
  artikel("barrierefreiheit-im-bestand", {
    title: "Barrierefreiheit im Bestand: was ein Audit kostet",
    teaser:
      "Eine Aufstellung aus vier Projekten, von der Prüfung bis zur letzten korrigierten Vorlage.",
    date: "2026-04-21 09:00",
    author: "Anja Wettstein",
    author_bio:
      "Anja Wettstein prüft bei Blokwerk Bestandsseiten und begleitet die Korrekturen bis zur Abnahme.",
    topic: "Barrierefreiheit",
    reading_minutes: 11,
    body: {
      type: "doc",
      content: [
        absatz(
          "Die Frage kommt fast immer in derselben Form: Was kostet es, eine bestehende Seite barrierefrei zu machen? Die ehrliche Antwort beginnt mit einer Gegenfrage — wie viele Vorlagen hat sie?",
        ),
        ueberschrift("Nicht Seiten zählen, sondern Vorlagen"),
        absatz(
          "Eine Website mit 900 Seiten und sechs Vorlagen ist günstiger zu korrigieren als eine mit 60 Seiten, die jede anders gebaut ist. Der Aufwand hängt an der Anzahl der Muster, nicht an der Menge der Inhalte.",
        ),
        liste(
          "Prüfung von sechs Vorlagen: rund vier Tage.",
          "Korrektur der Befunde: zwischen zwei und zehn Tagen, je nach Alter des Codes.",
          "Nachprüfung und Protokoll: ein Tag.",
        ),
        absatz(
          "Was in dieser Rechnung nicht steht, ist die Redaktion. Alternativtexte für 900 Bilder schreibt kein Audit.",
        ),
      ],
    },
  }),
  artikel("180-kilobyte-als-gestaltungsentscheid", {
    title: "180 Kilobyte als Gestaltungsentscheid",
    teaser:
      "Was ein festes Seitenbudget an Schriften, Bildern und Skripten übrig lässt.",
    date: "2026-03-09 09:00",
    author: "Marlene Roth",
    topic: "Technik",
    reading_minutes: 7,
    body: {
      type: "doc",
      content: [
        absatz(
          "Ein Seitenbudget ist keine technische Vorgabe, sondern eine gestalterische. Es beantwortet Fragen, die sonst offen bleiben, bis es zu spät ist.",
        ),
        absatz(
          "Zwei Schriftschnitte statt fünf. Ein Bild oben statt drei. Kein Karussell, weil ein Karussell Skript ist und Skript vom selben Budget abgeht wie das Bild, das man wirklich zeigen will.",
        ),
        zitat("Ein Budget entscheidet nicht, was fehlt, sondern was zuerst kommt."),
      ],
    },
  }),
  artikel("bausteine-statt-sonderseiten", {
    title: "Bausteine statt Sonderseiten",
    teaser:
      "Warum wir Vorlagen abschaffen und der Redaktion stattdessen sieben Bausteine geben.",
    date: "2026-02-10 09:00",
    author: "Tobias Frei",
    topic: "Redaktion",
    reading_minutes: 5,
    body: {
      type: "doc",
      content: [
        absatz(
          "Eine Sonderseite ist ein Entwicklungsauftrag mit anderem Namen. Sie entsteht, wenn ein Inhalt nicht in die Vorlagen passt, und sie bleibt danach für immer stehen.",
        ),
        absatz(
          "Bausteine drehen das um: Die Redaktion stapelt, was sie braucht, und wir bauen nur, was mehr als einmal vorkommt.",
        ),
      ],
    },
  }),
];

function teaserGrid(headline: string): Blok {
  return {
    component: "teaser_grid",
    _uid: "grid-1",
    headline,
    more_label: "Alle Beiträge",
    more_link: { linktype: "story", cached_url: "journal" },
    // Storyblok liefert hier bei gesetztem resolve_relations die ganzen
    // Stories, sonst nur deren UUIDs. Der Fixture-Betrieb bildet den
    // aufgeloesten Fall ab.
    articles: ARTIKEL.slice(0, 3),
  };
}

export const SEITEN = [
  {
    name: "Startseite",
    slug: "home",
    full_slug: "home",
    content: {
      component: "page",
      title: "Blokwerk",
      seo_title: "Blokwerk — Digitalstudio in Zürich",
      seo_description:
        "Websites, die man in fünf Jahren noch pflegen kann. Wir beginnen mit dem Inhaltsmodell, nicht mit dem Entwurf.",
      body: [
        {
          component: "hero",
          _uid: "hero-1",
          eyebrow: "Digitalstudio in Zürich · seit 2014",
          headline: "Websites, die man in fünf Jahren noch pflegen kann.",
          intro:
            "Wir sind vier Leute und arbeiten an wenigen Projekten gleichzeitig. Meist beginnen wir mit einem Inhaltsmodell, nicht mit einem Entwurf. Was danach entsteht, soll eine Redaktion ohne uns weiterführen können.",
          primary_label: "Projekt anfragen",
          primary_link: { linktype: "story", cached_url: "kontakt" },
          secondary_label: "Journal lesen",
          secondary_link: { linktype: "story", cached_url: "journal" },
        },
        {
          component: "text_image",
          _uid: "ti-1",
          eyebrow: "Arbeitsweise",
          headline: "Erst das Inhaltsmodell, dann die Oberfläche",
          text: "Bevor wir gestalten, schreiben wir auf, welche Inhaltstypen eine Website wirklich braucht und wie sie zusammenhängen. Das dauert zwei Wochen und erspart später die Hälfte der Diskussionen.\n\nAus dem Modell entstehen Bausteine, die die Redaktion frei kombiniert. Neue Seiten brauchen danach keinen Entwicklungsauftrag mehr.",
          image_position: "right",
        },
        {
          component: "text_image",
          _uid: "ti-2",
          eyebrow: "Technik",
          headline: "Wenig Abhängigkeiten, klare Übergaben",
          text: "Wir setzen auf ein schlankes Frontend mit einem festen Seitenbudget von 180 Kilobyte. Kein Framework, das in zwei Jahren migriert werden muss, nur weil es eine neue Hauptversion gibt.\n\nAm Ende erhalten Sie Repository, Dokumentation und eine Stunde Aufzeichnung, in der wir alles einmal durchgehen.",
          image_position: "left",
        },
        teaserGrid("Aus dem Journal"),
        {
          component: "quote",
          _uid: "quote-1",
          text: "Nach der Übergabe haben wir sechzig Seiten selbst gebaut, ohne einmal nachzufragen. Das war vorher nie so.",
          author: "Katrin Bühler",
          role: "Leitung Kommunikation, Stiftung Perron",
        },
      ],
    },
  },
  {
    name: "Arbeiten",
    slug: "arbeiten",
    full_slug: "arbeiten",
    content: {
      component: "page",
      title: "Arbeiten",
      seo_title: "Arbeiten — Blokwerk",
      body: [
        {
          component: "hero",
          _uid: "hero-arbeiten",
          eyebrow: "Arbeiten",
          headline: "Wenige Projekte, dafür ganze",
          intro:
            "Eine Auswahl aus den letzten Jahren. Was hier nicht steht, hat meist eine Geheimhaltung als Grund und keine schlechte Geschichte.",
        },
        {
          component: "text_image",
          _uid: "ti-arbeiten",
          eyebrow: "Hochschule Wallis",
          headline: "Zwölf Inhaltstypen, 340 Seiten in Redaktionshand",
          text: "Vom Inhaltsmodell über die Migration bis zur Schulung. Vier Monate nach der Übergabe liegen die Wartungsstunden bei zwei pro Monat.\n\nDie lange Fassung steht im Journal.",
          image_position: "right",
        },
        teaserGrid("Dazu im Journal"),
      ],
    },
  },
  {
    name: "Studio",
    slug: "studio",
    full_slug: "studio",
    content: {
      component: "page",
      title: "Studio",
      seo_title: "Studio — Blokwerk",
      body: [
        {
          component: "hero",
          _uid: "hero-studio",
          eyebrow: "Studio",
          headline: "Vier Leute, ein Raum an der Josefstrasse",
          intro:
            "Seit 2014. Wir stellen selten ein und arbeiten lieber länger an weniger Projekten.",
        },
        // Absichtlich nicht in components.ts registriert: Damit zeigt der
        // Fixture-Betrieb das Abnahmekriterium aus SCHEMA.md, ohne dass jemand
        // dafuer einen Blok im CMS anlegen muss.
        {
          component: "interactive_timeline",
          _uid: "timeline-1",
          headline: "Seit 2014",
        },
        {
          component: "quote",
          _uid: "quote-studio",
          text: "Am Anfang steht immer die Frage, wer den Inhalt später pflegt. Alles andere ergibt sich daraus.",
          author: "Tobias Frei",
          role: "Blokwerk",
        },
      ],
    },
  },
  {
    name: "Kontakt",
    slug: "kontakt",
    full_slug: "kontakt",
    content: {
      component: "page",
      title: "Kontakt",
      seo_title: "Kontakt — Blokwerk",
      body: [
        {
          component: "hero",
          _uid: "hero-kontakt",
          eyebrow: "Kontakt",
          headline: "Eine kurze Beschreibung genügt",
          intro:
            "hallo@blokwerk.ch · +41 44 271 08 12 · Josefstrasse 148, 8005 Zürich. Wir nehmen ab Oktober 2026 wieder neue Projekte an.",
        },
      ],
    },
  },
];
