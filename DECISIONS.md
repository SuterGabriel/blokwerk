# Entscheidungen

Kurze Notizen zu den Punkten, an denen es eine Alternative gab.

## 1. Eigener Content-Type `article` statt einer Seite mit Textblock

Ein Artikel hätte sich auch als `page` mit einem Textblock bauen lassen. Dann
wäre er aber nicht mehr abfragbar: kein Sortieren nach Datum, kein Filtern nach
Typ, keine Referenz aus einem Teaser-Grid.

Die Regel dahinter ist dieselbe wie beim Domänenmodellieren: Was später
abgefragt, sortiert oder verknüpft werden soll, braucht einen Namen und ein
Feld. Freitext kann man nur anzeigen.

## 2. Teaser-Grid referenziert Artikel, statt sie zu kopieren

Das Feld `articles` in `teaser_grid` ist ein Referenzfeld auf Stories vom Typ
`article`. Die Alternative wäre gewesen, Titel und Bild direkt in den Blok zu
schreiben.

Der Preis der Referenz ist ein Parameter beim Abruf: ohne
`resolve_relations: ["teaser_grid.articles"]` liefert die API nur UUIDs. Der
Gewinn ist, dass ein Artikeltitel an einer Stelle gepflegt wird und nicht an
fünf.

Der Adapter behandelt den unaufgelösten Fall trotzdem: Kommt ein String statt
eines Objekts, wird der Eintrag herausgefiltert statt zu einer leeren Karte zu
werden.

## 3. Webhook-Revalidierung statt kurzem `revalidate`-Intervall

Ein Intervall von 60 Sekunden hätte denselben Effekt scheinbar billiger
erreicht. Es hat zwei Nachteile: Die Redaktion sieht ihre Änderung im
schlechtesten Fall eine Minute lang nicht und meldet einen Fehler, der keiner
ist. Und jede Seite wird dauernd neu gebaut, auch wenn sich nichts geändert hat.

Der Webhook baut genau den Pfad neu, der betroffen ist. Das `revalidate` von
einer Stunde bleibt als Netz für den Fall, dass ein Webhook verloren geht.

## 4. Adapter zwischen API und Komponenten

Storyblok-JSON liesse sich direkt bis in die Komponenten durchreichen. Dann
kennt aber jede Komponente die Feldnamen des Anbieters, und ein Wechsel des CMS
bedeutet, jede Komponente anzufassen.

Stattdessen übersetzt `lib/storyblok/adapters.ts` einmalig in die Typen aus
`lib/types.ts`. Die Komponenten unter `components/ui/` importieren nichts aus
dem SDK. Ein Wechsel wäre eine neue Adapterdatei, keine neue Oberfläche.

Nebeneffekt, der sich in der Praxis mehr gelohnt hat als die Austauschbarkeit:
Alle Sonderfälle liegen an einer Stelle. Ein leeres Asset-Feld liefert bei
Storyblok ein Objekt mit `filename: null`, was ungeprüft als leerer `src` im DOM
landet. Das wird einmal im Adapter abgefangen statt in jeder Komponente.

## 5. Zwei Stellen, an denen die Entkopplung nicht hält

Ehrlichkeitshalber, weil das im Gespräch die interessantere Frage ist als die
Entkopplung selbst:

**`storyblokEditable`** braucht das rohe Blok-Objekt, damit der Visual Editor
DOM-Element und Inhaltsobjekt verknüpfen kann. Deshalb gibt es die dünne Schicht
`components/blocks/`, die das Attribut setzt und den übersetzten Rest
weitergibt. Die Alternative wäre, auf den Visual Editor zu verzichten — also auf
das Merkmal, wegen dem man Storyblok wählt.

**Rich Text** ist ein verschachtelter Baum im Format des jeweiligen CMS.
Storyblok, Sanitys Portable Text und Contentful sind untereinander nicht
kompatibel. Eine eigene Zwischendarstellung wäre ein zweiter Renderer und stünde
in keinem Verhältnis zum Nutzen. Der Typ heisst deshalb `RichTextDocument` und
ist in `lib/types.ts` benannt statt versteckt — wer wechselt, sieht dort, was zu
ersetzen ist.

## 6. Getrennte `/preview`-Route statt einer Bedingung im Abruf

Draft und Published hätten sich auch über einen Parameter in derselben Route
unterscheiden lassen. Die getrennte Route ist belastbarer: Die öffentlichen
Routen benutzen einen Token, der Entwürfe technisch gar nicht herausgibt. Ein
Leck ist damit nicht durch Vergessen möglich, sondern nur durch eine falsche
Token-Konfiguration — und die fällt sofort auf.

## 7. Keine Tests

Bei einer Demo dieser Grösse würden Tests Zeit kosten und wenig zeigen. Die
Stelle, die tatsächlich Logik enthält, ist der Adapter; wäre das Projekt grösser,
würde ich dort anfangen.

## 8. Keine Datenbank

Es gibt keinen Zustand, der nicht aus dem CMS kommt. Formulare, Suche und
Authentifizierung sind bewusst weggelassen.
