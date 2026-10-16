/** One thing check_code found. */
export interface Problem {
    line: number;
    column: number;
    /** The rule, without its prefix: "valid-props". */
    rule: string;
    message: string;
    /** The code's own line, trimmed. */
    source: string;
    /** The text ESLint would put in, when the rule has a fix. */
    fix?: string;
    /** Whether the fix inserts that text rather than replacing something with it. */
    inserts?: boolean;
    /** The rule's first suggestion, when it has one instead of a fix. */
    suggestion?: string;
}

export interface CheckResult {
    problems: Problem[];
    /** Why the code couldn't be parsed, if it couldn't. */
    parseError?: string;
    lines: number;
}
