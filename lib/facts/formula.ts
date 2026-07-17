/**
 * Formula evaluator for derived facts.
 *
 * A derived fact stores its formula, never its result (data-model.md section 3).
 * This is the interpreter that recomputes it at render time.
 *
 * Grammar, deliberately small:
 *   expr    := term (('+' | '-') term)*
 *   term    := factor (('*' | '/') factor)*
 *   factor  := number | factId | funcCall | '(' expr ')'
 *   number  := 613e9, 31536000, 20e9, 342e6, 7 ...
 *   factId  := dot-namespaced id resolved against the store (may be a fact or another derived fact)
 *   funcCall:= name '(' [string arg] ')'
 *
 * Functions are the only way a formula reads the ledger:
 *   ledger_sum('base')          sum of award values, options excluded
 *   ledger_sum('with_options')  sum of award values plus unexercised options
 *   ledger_category_sum('habitat')  sum of award values in one category, options
 *     excluded. Arithmetic over an empty set is a first-class result: it is how
 *     the zero rows are computed (data-model.md section 4), and the zero it
 *     returns is the only number Burn Rate originates.
 *   days_since_max_ledger_date()  whole days from the latest ledger award date to today
 *
 * No eval(), no Function(). The parser accepts exactly the grammar above and
 * throws on anything else, at build time.
 */

export interface FormulaContext {
  /** Resolve a fact or derived-fact id to its numeric value. Throws on unknown id. */
  resolveId: (id: string) => number;
  /** Ledger reads. */
  ledgerSum: (mode: "base" | "with_options") => number;
  ledgerCategorySum: (category: string) => number;
  daysSinceMaxLedgerDate: () => number;
}

type Token =
  | { type: "number"; value: number }
  | { type: "ident"; value: string }
  | { type: "string"; value: string }
  | { type: "op"; value: "+" | "-" | "*" | "/" }
  | { type: "lparen" }
  | { type: "rparen" };

function tokenize(formula: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const numberRe = /^[0-9]+(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/;
  const identRe = /^[A-Za-z_][A-Za-z0-9_.\-]*/;
  while (i < formula.length) {
    const rest = formula.slice(i);
    const ch = rest[0];
    if (ch === " " || ch === "\t") {
      i += 1;
      continue;
    }
    if (ch === "(") {
      tokens.push({ type: "lparen" });
      i += 1;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: "rparen" });
      i += 1;
      continue;
    }
    if (ch === "+" || ch === "-" || ch === "*" || ch === "/") {
      tokens.push({ type: "op", value: ch });
      i += 1;
      continue;
    }
    if (ch === "'") {
      const end = rest.indexOf("'", 1);
      if (end === -1) throw new Error(`Unterminated string in formula: ${formula}`);
      tokens.push({ type: "string", value: rest.slice(1, end) });
      i += end + 1;
      continue;
    }
    const numMatch = rest.match(numberRe);
    if (numMatch && /[0-9]/.test(ch)) {
      tokens.push({ type: "number", value: Number(numMatch[0]) });
      i += numMatch[0].length;
      continue;
    }
    const identMatch = rest.match(identRe);
    if (identMatch) {
      tokens.push({ type: "ident", value: identMatch[0] });
      i += identMatch[0].length;
      continue;
    }
    throw new Error(`Unexpected character '${ch}' in formula: ${formula}`);
  }
  return tokens;
}

/** Every identifier a formula references, so validation can check derived_from. */
export function referencedIds(formula: string): string[] {
  const funcNames = new Set(["ledger_sum", "ledger_category_sum", "days_since_max_ledger_date"]);
  return tokenize(formula)
    .filter((t): t is Extract<Token, { type: "ident" }> => t.type === "ident")
    .map((t) => t.value)
    .filter((name) => !funcNames.has(name));
}

export function evaluateFormula(formula: string, ctx: FormulaContext): number {
  const tokens = tokenize(formula);
  let pos = 0;

  const peek = () => tokens[pos];
  const next = () => tokens[pos++];

  function parseExpr(): number {
    let left = parseTerm();
    while (peek()?.type === "op" && (peek() as { value: string }).value.match(/[+\-]/)) {
      const op = (next() as { value: "+" | "-" }).value;
      const right = parseTerm();
      left = op === "+" ? left + right : left - right;
    }
    return left;
  }

  function parseTerm(): number {
    let left = parseFactor();
    while (peek()?.type === "op" && (peek() as { value: string }).value.match(/[*/]/)) {
      const op = (next() as { value: "*" | "/" }).value;
      const right = parseFactor();
      if (op === "/") {
        if (right === 0) throw new Error(`Division by zero in formula: ${formula}`);
        left = left / right;
      } else {
        left = left * right;
      }
    }
    return left;
  }

  function parseFactor(): number {
    const token = next();
    if (!token) throw new Error(`Unexpected end of formula: ${formula}`);
    if (token.type === "number") return token.value;
    if (token.type === "lparen") {
      const value = parseExpr();
      const closing = next();
      if (!closing || closing.type !== "rparen")
        throw new Error(`Missing closing paren in formula: ${formula}`);
      return value;
    }
    if (token.type === "ident") {
      if (peek()?.type === "lparen") {
        next();
        let arg: string | null = null;
        if (peek()?.type === "string") {
          arg = (next() as { value: string }).value;
        }
        const closing = next();
        if (!closing || closing.type !== "rparen")
          throw new Error(`Missing closing paren after ${token.value}() in formula: ${formula}`);
        return callFunction(token.value, arg, ctx, formula);
      }
      return ctx.resolveId(token.value);
    }
    throw new Error(`Unexpected token in formula: ${formula}`);
  }

  const result = parseExpr();
  if (pos !== tokens.length) throw new Error(`Trailing tokens in formula: ${formula}`);
  return result;
}

function callFunction(
  name: string,
  arg: string | null,
  ctx: FormulaContext,
  formula: string
): number {
  switch (name) {
    case "ledger_sum":
      if (arg !== "base" && arg !== "with_options")
        throw new Error(`ledger_sum requires 'base' or 'with_options' in formula: ${formula}`);
      return ctx.ledgerSum(arg);
    case "ledger_category_sum":
      if (!arg)
        throw new Error(`ledger_category_sum requires a category in formula: ${formula}`);
      return ctx.ledgerCategorySum(arg);
    case "days_since_max_ledger_date":
      return ctx.daysSinceMaxLedgerDate();
    default:
      throw new Error(`Unknown function '${name}' in formula: ${formula}`);
  }
}
