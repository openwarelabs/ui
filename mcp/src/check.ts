/*
 * check_code: the ESLint plugin's rules (eslint/src) run on a snippet or a file an AI tool wrote, without ESLint
 * being set up in the project. ESLint's core is bundled in with the plugin; TypeScript is stripped first, which
 * keeps every line where it was, so the line numbers reported are the code's own.
 */
import { Linter } from "eslint";
import { transform } from "sucrase";

import plugin from "@plugin/index";

import type { CheckResult, Problem } from "./check.types";

const rulePrefix = "openware-ui/";

/** The recommended config with every language option the bundled parser needs; its files match the name below. */
const config = [
    {
        ...plugin.configs.recommended,
        languageOptions: { ecmaVersion: "latest" as const, sourceType: "module" as const, parserOptions: { ecmaFeatures: { jsx: true } } },
    },
];

let linter: Linter | undefined;

/** TypeScript (and TSX) as JavaScript, line for line. Plain JavaScript passes through. */
function strip(code: string, filename: string): { code: string; error?: string } {
    if (/\.(?:js|jsx|mjs|cjs)$/.test(filename)) return { code };
    try {
        return { code: transform(code, { transforms: ["typescript", "jsx"], jsxRuntime: "preserve", filePath: filename }).code };
    } catch (error) {
        return { code, error: error instanceof Error ? error.message : String(error) };
    }
}

export function checkCode(code: string, filename = "component.tsx"): CheckResult {
    const stripped = strip(code, filename);
    if (stripped.error) return { problems: [], parseError: stripped.error, lines: code.split("\n").length };

    linter ??= new Linter();
    const messages = linter.verify(stripped.code, config, { filename: "file.jsx" });
    const lines = code.split("\n");
    const problems: Problem[] = [];
    let parseError: string | undefined;
    for (const message of messages) {
        if (message.fatal) {
            parseError = `line ${message.line}: ${message.message}`;
            continue;
        }
        if (!message.ruleId?.startsWith(rulePrefix)) continue;
        problems.push({
            line: message.line,
            column: message.column,
            rule: message.ruleId.slice(rulePrefix.length),
            message: message.message,
            source: lines[message.line - 1]?.trim() ?? "",
            fix: message.fix && message.fix.text.length <= 120 ? message.fix.text : undefined,
            inserts: message.fix ? message.fix.range[0] === message.fix.range[1] : undefined,
            suggestion: message.suggestions?.[0]?.desc,
        });
    }
    return { problems, parseError, lines: lines.length };
}

/** The result as Markdown for the tool's answer. */
export function formatCheck(result: CheckResult, filename: string): string {
    if (result.parseError && !result.problems.length) return `Couldn't parse ${filename}: ${result.parseError}. Fix the syntax and call check_code again.`;
    if (!result.problems.length) return `No problems in ${filename}: ${result.lines} lines, and every component, prop, token and class checks out against Openware UI ${plugin.meta?.version ?? ""}.`.replace(/ \.$/, ".");
    const count = result.problems.length;
    const out = [`# ${count} problem${count === 1 ? "" : "s"} in ${filename}`, ""];
    for (const problem of result.problems) {
        out.push(`- **Line ${problem.line}** (${problem.rule}): ${problem.message}`);
        if (problem.source) out.push(`  \`${problem.source.length > 140 ? `${problem.source.slice(0, 140)}…` : problem.source}\``);
        if (problem.fix !== undefined) out.push(`  ${problem.inserts ? "Insert" : "Replace with"} ${problem.fix.trim() ? `\`${problem.fix.trim()}\`` : "nothing (remove it)"}.`);
        else if (problem.suggestion) out.push(`  ${problem.suggestion}`);
    }
    if (result.parseError) out.push("", `Part of the file couldn't be parsed (${result.parseError}), so there may be more.`);
    out.push("", "Fix these, then call check_code again on the whole file. For a component's props and examples, call get_component; for the tokens, get_tokens.");
    return out.join("\n");
}
