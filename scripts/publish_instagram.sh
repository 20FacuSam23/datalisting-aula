#!/usr/bin/env bash
set -euo pipefail

# This script owns a disposable Actions checkout. Never reset a developer's
# checkout or run this publisher on the production hosting directory.
if [[ "${GITHUB_ACTIONS:-}" != "true" || -z "${GITHUB_WORKSPACE:-}" ]]; then
  echo 'Este publicador sólo se ejecuta dentro de GitHub Actions.' >&2
  exit 2
fi
cd "$GITHUB_WORKSPACE"
if [[ "$(git rev-parse --show-toplevel)" != "$(pwd -P)" ]]; then
  echo 'El directorio de trabajo no coincide con el checkout de Actions.' >&2
  exit 2
fi
mode="${1:-new}"
case "$mode" in new|today|latest|previous) ;; *) exit 2 ;; esac

for attempt in 1 2 3; do
  # Always read and merge against the latest feed. On a rejected push, repeat
  # the import from the new branch head rather than rebasing conflicting JSON.
  git fetch origin main
  git reset --hard origin/main
  python3 scripts/sync_instagram.py --mode "$mode"
  git add a-remarla/data/instagram.json assets/a-remarla-instagram/
  if git diff --cached --quiet; then exit 0; fi
  git -c user.name='github-actions[bot]' -c user.email='41898282+github-actions[bot]@users.noreply.github.com' commit -m 'Actualizar novedades de Instagram de A Remarla'
  if git push origin HEAD:main; then exit 0; fi
  echo "La rama cambió durante la lectura; se repetirá la importación ($attempt/3)." >&2
done
echo 'No se publicó la actualización: la rama siguió cambiando. Se conserva lo publicado.' >&2
exit 1
