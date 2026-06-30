import { tool, type Plugin } from "@opencode-ai/plugin"

interface HarnessState {
  active: boolean
  classification: string
  costLevel: string
  skills: string[]
  scope: string
  activatedAt: number
  messageID?: string
}

const sessionState: Map<string, HarnessState> = new Map()

const FILE_MUTATION_TOOLS = new Set([
  "edit",
  "write",
  "patch",
  "multiedit",
])

const DESTRUCTIVE_BASH_PATTERNS: RegExp[] = [
  /\brm\s+/,
  /\bmv\s+/,
  /\bcp\s+/,
  /\bgit\s+(commit|push|reset|rebase|merge|cherry-pick|revert|clean|branch\s+-[dDmM]|tag\s+-d)\b/,
  /\bnpm\s+(install|add|remove|uninstall|update|i\s)\b/,
  /\bpnpm\s+(install|add|remove|uninstall|update|i\s)\b/,
  /\byarn\s+(install|add|remove|uninstall|update)\b/,
  /\bbun\s+(add|remove|install|update)\b/,
  /\bchmod\s+/,
  /\bchown\s+/,
  /\bsed\s+-i\b/,
  /(?<!^|\|)\s*>\s*[^\s|>][^\s|]*\s*$/,
  /\bdd\s+if=/,
  /\bmkfs\b/,
  /\bshutdown\b/,
  /\breboot\b/,
]

const SYSTEM_PROMPT_BLOCK = [
  "",
  "# NeuralVerse Harness — HARD ENFORCEMENT LAYER",
  "",
  "A plugin (`harness-guard`) enforces the harness at the tool layer.",
  "Instructions in AGENTS.md and BOOTSTRAP.md are advisory; this layer is not.",
  "",
  "## Rule 1 — First tool call of every turn",
  "",
  "Your very first tool call in EVERY turn MUST be `harness_activate` with:",
  "- `task_classification`: trivial | small | medium | large | audit",
  "- `cost_level`: low | medium | high",
  "- `skills_planned`: comma-separated specialist skills (e.g. `react-ui-polish, accessibility-audit, playwright-qa`)",
  "- `context_scope`: files, directories, or components that will be touched",
  "",
  "## Rule 2 — File mutation tools are gated",
  "",
  "`edit`, `write`, `patch`, `multiedit` are BLOCKED at the tool layer unless",
  "`harness_activate` has been called in the current turn. There is no bypass.",
  "The plugin will throw an error before the tool runs.",
  "",
  "## Rule 3 — Destructive bash is gated",
  "",
  "Bash commands matching `rm`, `mv`, `cp`, `git commit/push/reset/rebase/...`,",
  "`npm/pnpm/yarn/bun install/add/remove`, `chmod`, `chown`, `sed -i`, `> file`,",
  "`dd`, `mkfs`, `shutdown`, `reboot` are also blocked without activation.",
  "",
  "## Rule 4 — Response format (when files are touched)",
  "",
  "Every response that modifies files MUST end with this exact block:",
  "",
  "```",
  "## Harness Pipeline Used",
  "",
  "- Task classification: <value>",
  "- Cost level: <value>",
  "- Skills activated: <list>",
  "- Skills skipped: <list with reason>",
  "- Context scope: <description>",
  "- Repository discovery: <commands used>",
  "- Validation: <commands run + results>",
  "- Documentation/memory decision: <updated | skipped, reason>",
  "- Git hygiene: <status, files changed>",
  "```",
  "",
  "## Rule 5 — Even for pure Q&A",
  "",
  "When the user only asks a question, the harness is still mandatory.",
  "Activate it, then read or inspect, then answer. The pipeline summary is only",
  "required when files are modified.",
  "",
  "## Rule 6 — When in doubt",
  "",
  "When in doubt: activate the harness. The cost of activation is one tool call.",
  "The cost of skipping it is a blocked tool and a non-compliant response.",
  "",
  "## State lifecycle",
  "",
  "Activation is per-turn. A new user message resets the gate to closed.",
  "You must call `harness_activate` again at the start of your next response.",
].join("\n")

function resetState(sessionId: string) {
  sessionState.set(sessionId, {
    active: false,
    classification: "",
    costLevel: "",
    skills: [],
    scope: "",
    activatedAt: 0,
    messageID: undefined,
  })
}

function getCommandString(args: unknown): string {
  if (!args || typeof args !== "object") return ""
  const a = args as Record<string, unknown>
  const c = a.command ?? a.cmd ?? a.script
  return typeof c === "string" ? c : ""
}

function isDestructiveBash(command: string): boolean {
  if (!command) return false
  return DESTRUCTIVE_BASH_PATTERNS.some((p) => p.test(command))
}

function blockedMessage(tool: string, reason: string): string {
  return [
    "",
    "## HARNESS GATE: BLOCKED",
    "",
    `Tool: ${tool}`,
    `Reason: ${reason}`,
    "",
    "Required action:",
    "1. Call `harness_activate` first with task_classification, cost_level,",
    "   skills_planned, and context_scope.",
    "2. Then call your tool again.",
    "",
    "The harness is mandatory. There is no bypass. There is no override.",
  ].join("\n")
}

export default (async () => {
  return {
    tool: {
      harness_activate: tool({
        description:
          "MANDATORY FIRST CALL. Activate the NeuralVerse Harness pipeline for the current turn. Must be called before any edit, write, patch, or destructive bash command. Returns the required pipeline template and opens the gate for the rest of the turn.",
        args: {
          task_classification: tool.schema
            .enum(["trivial", "small", "medium", "large", "audit"])
            .describe(
              "Task size: trivial (single-line, no architecture impact), small (1-2 files), medium (3-8 files), large (9+ files), audit (repository-wide analysis)"
            ),
          cost_level: tool.schema
            .enum(["low", "medium", "high"])
            .describe(
              "Token cost: low (1-3 files), medium (3-8 files focused), high (9+ files or repo-wide)"
            ),
          skills_planned: tool.schema
            .string()
            .describe(
              "Comma-separated specialist skills planned for activation (e.g. 'react-ui-polish, accessibility-audit, playwright-qa, git-hygiene')"
            ),
          context_scope: tool.schema
            .string()
            .describe(
              "Files, directories, or components that will be touched (e.g. 'src/components/Header.tsx' or 'docs/AGENTS.md only')"
            ),
        },
        async execute(args, ctx) {
          const skills = args.skills_planned
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)

          sessionState.set(ctx.sessionID, {
            active: true,
            classification: args.task_classification,
            costLevel: args.cost_level,
            skills,
            scope: args.context_scope,
            activatedAt: Date.now(),
            messageID: ctx.messageID,
          })

          return [
            "## HARNESS ACTIVATED",
            "",
            `Task class: ${args.task_classification}  |  Cost: ${args.cost_level}`,
            `Skills planned: ${args.skills_planned}`,
            `Context scope: ${args.context_scope}`,
            "",
            "Gate status: OPEN for this turn.",
            "",
            "### Pipeline reminder",
            "1. Context governance — confirm boundaries before reading.",
            "2. Repository discovery — fd → rg → ast-grep (locate before reading).",
            "3. Specialist skills — activate only the planned set above.",
            "4. Implementation — smallest safe change inside the declared scope.",
            "5. Validation — run the actual commands, paste real output.",
            "6. Report — end with `## Harness Pipeline Used` summary if files changed.",
            "7. Git hygiene — status, diff, files-changed list.",
            "",
            "Activation expires when the next user turn starts. Call `harness_activate` again at the start of your next response.",
          ].join("\n")
        },
      }),
    },

    "chat.message": async (input) => {
      resetState(input.sessionID)
    },

    "tool.execute.before": async (input, output) => {
      if (input.tool === "harness_activate") return

      const state = sessionState.get(input.sessionID)
      const isActive = state?.active === true

      if (FILE_MUTATION_TOOLS.has(input.tool)) {
        if (!isActive) {
          throw new Error(
            blockedMessage(
              input.tool,
              "harness_activate was not called this turn. The harness is mandatory before any file mutation."
            )
          )
        }
      }

      if (input.tool === "bash") {
        const cmd = getCommandString(output?.args)
        if (!isActive && isDestructiveBash(cmd)) {
          throw new Error(
            blockedMessage(
              "bash",
              `destructive command "${cmd.slice(0, 80)}…" requires harness_activate this turn.`
            )
          )
        }
      }
    },

    "experimental.chat.system.transform": async (_input, output) => {
      output.system.push(SYSTEM_PROMPT_BLOCK)
    },
  }
}) satisfies Plugin
