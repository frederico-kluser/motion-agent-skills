#!/usr/bin/env bash
#
# install.sh — liga as skills deste repositório aos agentes de código instalados.
#
# Não copia nada: cria um symlink por skill em cada diretório de agente, apontando para
# a pasta aqui dentro. Editar um SKILL.md no repo passa a valer na hora, em todos os
# agentes, sem passo de deploy.
#
#   ./install.sh              instala/atualiza os links
#   ./install.sh --check      só relata o que faria
#   ./install.sh --uninstall  remove os links (nunca toca em diretório real)
#   ./install.sh --setup      instala e roda o bootstrap de cada skill (token, MCP, /motion)
#
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS=(motion-plus-ui motion-plus-animation)

# Diretórios de skill dos agentes. Um que não existir é simplesmente pulado — não criamos
# árvore de agente que a pessoa não usa.
AGENT_DIRS=(
  "$HOME/.claude/skills"
  "$HOME/.claude-secundaria/skills"
  "$HOME/.agents/skills"
  "$HOME/.codex/skills"
  "$HOME/.copilot/skills"
  "$HOME/.config/opencode/skill"
  "$HOME/.gemini/skills"
  "$HOME/.cursor/skills"
)

MODE=install
for arg in "$@"; do
  case "$arg" in
    --check|--dry-run) MODE=check ;;
    --uninstall)       MODE=uninstall ;;
    --setup)           MODE=setup ;;
    -h|--help)
      sed -n '3,12p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 0 ;;
    *) echo "argumento desconhecido: $arg (use --help)" >&2; exit 2 ;;
  esac
done

green() { printf '\033[32m%s\033[0m\n' "$1"; }
yellow() { printf '\033[33m%s\033[0m\n' "$1"; }
red()   { printf '\033[31m%s\033[0m\n' "$1"; }

linked=0; skipped=0; removed=0; problems=0

for dir in "${AGENT_DIRS[@]}"; do
  [[ -d "$dir" ]] || continue
  for skill in "${SKILLS[@]}"; do
    target="$REPO/$skill"
    link="$dir/$skill"

    if [[ "$MODE" == uninstall ]]; then
      if [[ -L "$link" ]]; then
        rm "$link"; removed=$((removed + 1)); echo "  removido  $link"
      elif [[ -e "$link" ]]; then
        yellow "  !! $link é um diretório REAL — não removido"
        problems=$((problems + 1))
      fi
      continue
    fi

    # Nunca sobrescrever um diretório de verdade: pode ser skill instalada por outro caminho.
    if [[ -e "$link" && ! -L "$link" ]]; then
      yellow "  !! $link é um diretório REAL — pulado (mova ou apague antes)"
      problems=$((problems + 1))
      continue
    fi

    current="$([[ -L "$link" ]] && readlink -f "$link" || true)"
    if [[ "$current" == "$target" ]]; then
      skipped=$((skipped + 1)); echo "  ok        $link"
      continue
    fi

    if [[ "$MODE" == check ]]; then
      echo "  criaria   $link -> $target"
      linked=$((linked + 1))
      continue
    fi

    ln -sfn "$target" "$link"
    linked=$((linked + 1))
    echo "  ligado    $link -> $target"
  done
done

echo
case "$MODE" in
  uninstall) green "$removed link(s) removido(s)." ;;
  check)     green "$linked a criar, $skipped já corretos. (nada foi alterado)" ;;
  *)         green "$linked link(s) criado(s)/atualizado(s), $skipped já corretos." ;;
esac
(( problems > 0 )) && yellow "$problems caminho(s) exigem atenção (ver acima)."

if [[ "$MODE" == install || "$MODE" == setup ]]; then
  # Prova de que o link resolve de verdade — symlink quebrado passa despercebido.
  fail=0
  for dir in "${AGENT_DIRS[@]}"; do
    [[ -d "$dir" ]] || continue
    for skill in "${SKILLS[@]}"; do
      [[ -L "$dir/$skill" ]] || continue
      [[ -f "$dir/$skill/SKILL.md" ]] || { red "  link quebrado: $dir/$skill"; fail=1; }
    done
  done
  (( fail == 0 )) && green "Todos os links resolvem até um SKILL.md."
fi

if [[ "$MODE" == setup ]]; then
  echo
  echo "— bootstrap das skills —"
  if [[ -z "${MOTION_TOKEN:-}${MOTION_API_KEY:-}" ]] && ! grep -qs 'MOTION_\(TOKEN\|API_KEY\)' "$HOME/.secrets"; then
    yellow "Sem token do Motion+ no ambiente. O pacote 'motion' (grátis) ainda funciona."
    yellow "Para MCP, AI Kit e motion-plus, salve o token uma vez:"
    echo   "  node $REPO/motion-plus-ui/scripts/ensure-setup.mjs --save-token <token>"
    echo   "  (gere em https://motion.dev/dashboard/tokens — exige Motion+)"
  else
    # As duas compartilham a camada global; rodar a da UI já cobre token + MCP + /motion.
    node "$REPO/motion-plus-ui/scripts/ensure-setup.mjs" --global-only
  fi
fi

if [[ "$MODE" == install ]]; then
  echo
  echo "Próximo passo (opcional): ./install.sh --setup  — token, MCP 'motion' 6.2.0 e a skill /motion."
fi
