#!/usr/bin/env bash
# Richtet die Git-Hooks aus .githooks/ ein.
#
# Die Hooks liegen versioniert im Repo, nicht in .git/hooks/. Der Unterschied
# ist wichtig: Was in .git/hooks/ liegt, existiert nur auf einer Maschine und
# wird nie mitgeklont. Ein Gate, das nur bei einer Person läuft, ist kein Gate.
#
# core.hooksPath zeigt Git auf den versionierten Ordner. Ein Aufruf genügt,
# auch nach einem frischen Klon.

set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

git config core.hooksPath .githooks
chmod +x .githooks/* 2>/dev/null || true

echo "core.hooksPath zeigt jetzt auf .githooks/"
echo
echo "Zum Prüfen ohne Commit:"
echo "  bash .githooks/pre-commit"
