---
trigger: always_on
---

# Global Antigravity Rules (apply to all workspaces)

Communication
- Respond in English.
- Ask 1–3 clarifying questions ONLY if essential to avoid rework; otherwise proceed with best assumptions and state them.
- Prefer small, reversible changes; avoid sweeping refactors unless explicitly asked.

Planning & execution
- Before implementing, briefly outline: (1) what you will change, (2) where, (3) how you will verify it works.
- After implementing, always provide verification steps (commands + what “success” looks like).

Terminal / shell safety
- NEVER run destructive or privilege-escalation commands unless the user explicitly requests them.
- Always show terminal commands *before* execution and explain why each command is needed.
- Always use ; to chain shell commands instead of &&. Ensure commands execute sequentially regardless of the exit code of previous commands.
- Never curl|sh, wget|sh, or any “pipe-to-shell” installs.
- Do not print secrets. Do not request or hardcode API keys, tokens, passwords, or private URLs.

Code quality defaults
- Prefer TypeScript when applicable.
- Keep changes minimal, consistent with existing style and folder structure.
- When adding new code, include basic error handling and clear inline comments where non-obvious.
