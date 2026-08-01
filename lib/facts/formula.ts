// Formulas store the expression, never the result. The result is recomputed on
// read, so changing one record moves every view that depends on it. A stored
// result is a copy of a number, and a copy is a number that can go wrong
// quietly.

import type { Confidence, Domain } from "./types";

/** Seconds in a year. Not a claim about the world, so it may live in a formula.
 *  The test is not whether a number looks trivial. It is whether it could turn
 *  out to be wrong. */
export const DEFINITIONAL_CONSTANTS = new Set<number>([31536000]);

export type Node =
  | { type: "num"; value: number }
  | { type: "ref"; id: string }
  | { type: "binary"; op: "+" | "-" | "*" | "/"; left: Node; right: Node };

export class FormulaError extends Error {}

const TOKEN = /\s*([A-Za-z][A-Za-z0-9_.-]*|\d+(?:\.\d+)?|[()+\-*/])/y;

function tokenize(input: string): string[] {
  const out: string[] = [];
  let index = 0;
  while (index < input.length) {
    TOKEN.lastIndex = index;
    const match = TOKEN.exec(input);
    if (!match) {
      const rest = input.slice(index).trim();
      if (rest === "") break;
      throw new FormulaError(`Unreadable character in formula near "${rest}"`);
    }
    out.push(match[1]);
    index = TOKEN.lastIndex;
  }
  return out;
}

export function parse(formula: string): Node {
  const tokens = tokenize(formula);
  let position = 0;

  const peek = () => tokens[position];
  const take = () => tokens[position++];

  function parseExpression(): Node {
    let left = parseTerm();
    while (peek() === "+" || peek() === "-") {
      const op = take() as "+" | "-";
      left = { type: "binary", op, left, right: parseTerm() };
    }
    return left;
  }

  function parseTerm(): Node {
    let left = parseFactor();
    while (peek() === "*" || peek() === "/") {
      const op = take() as "*" | "/";
      left = { type: "binary", op, left, right: parseFactor() };
    }
    return left;
  }

  function parseFactor(): Node {
    const token = take();
    if (token === undefined) throw new FormulaError("Formula ended early");
    if (token === "(") {
      const inner = parseExpression();
      if (take() !== ")") throw new FormulaError("Unbalanced parenthesis");
      return inner;
    }
    if (/^\d/.test(token)) return { type: "num", value: Number(token) };
    if (/^[A-Za-z]/.test(token)) return { type: "ref", id: token };
    throw new FormulaError(`Unexpected token "${token}"`);
  }

  const tree = parseExpression();
  if (position !== tokens.length) {
    throw new FormulaError(`Trailing tokens in formula "${formula}"`);
  }
  return tree;
}

export function referencedIds(node: Node): string[] {
  const found = new Set<string>();
  walk(node, (n) => {
    if (n.type === "ref") found.add(n.id);
  });
  return [...found];
}

export function numericLiterals(node: Node): number[] {
  const found: number[] = [];
  walk(node, (n) => {
    if (n.type === "num") found.push(n.value);
  });
  return found;
}

function walk(node: Node, visit: (n: Node) => void) {
  visit(node);
  if (node.type === "binary") {
    walk(node.left, visit);
    walk(node.right, visit);
  }
}

function domainsIn(node: Node, domainOf: (id: string) => Domain | undefined) {
  const found = new Set<Domain>();
  walk(node, (n) => {
    if (n.type === "ref") {
      const domain = domainOf(n.id);
      if (domain) found.add(domain);
    }
  });
  return found;
}

/**
 * Never sum across domains. Datacenter capex contains energy spend, energy
 * investment contains datacenter-driven generation, space budgets contain
 * compute. The overlaps are real and unquantified, so the four are reported
 * separately and the sum is refused rather than caveated.
 *
 * Ratios across domains are legal and are the point of the publication, so only
 * additive nodes are checked. Multiplication and division pass.
 *
 * Known limitation, stated rather than hidden: this is conservative. A sum whose
 * own operand is a legal cross-domain ratio, such as `(a_space / b_ai) +
 * c_space`, is rejected because the ratio drags a second domain into the
 * additive node. That shape has not come up. If it ever does, it wants a human
 * deciding what the sum means, not a looser rule.
 */
export function additiveDomainConflicts(
  node: Node,
  domainOf: (id: string) => Domain | undefined,
): string[] {
  const problems: string[] = [];
  walk(node, (n) => {
    if (n.type !== "binary") return;
    if (n.op !== "+" && n.op !== "-") return;
    const spanned = new Set([
      ...domainsIn(n.left, domainOf),
      ...domainsIn(n.right, domainOf),
    ]);
    if (spanned.size > 1) {
      problems.push(
        `sums across domains (${[...spanned].sort().join(", ")}) at a "${n.op}"`,
      );
    }
  });
  return problems;
}

export function evaluate(node: Node, resolve: (id: string) => number): number {
  if (node.type === "num") return node.value;
  if (node.type === "ref") return resolve(node.id);
  const left = evaluate(node.left, resolve);
  const right = evaluate(node.right, resolve);
  switch (node.op) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "*":
      return left * right;
    case "/":
      return right === 0 ? Number.NaN : left / right;
  }
}

export function evaluateFormula(
  formula: string,
  resolve: (id: string) => number,
): number {
  return evaluate(parse(formula), resolve);
}

const RANK: Record<Confidence, number> = {
  confirmed: 3,
  reported: 2,
  derived: 1,
};

/** The weakest input, recorded because it is worth knowing. It does not change
 *  the mark. */
export function lowestInputConfidence(inputs: Confidence[]): Confidence {
  if (inputs.length === 0) return "derived";
  return inputs.reduce((low, next) => (RANK[next] < RANK[low] ? next : low));
}

/**
 * A derived fact inherits the lowest confidence among its inputs and then drops
 * to derived regardless. There is no code path back up, which is why this
 * function takes the inputs and ignores them: computing the floor first and
 * returning "derived" anyway is the whole rule, written so that a future edit
 * has to delete the comment to break it.
 */
export function resolveDerivedConfidence(inputs: Confidence[]): "derived" {
  void lowestInputConfidence(inputs);
  return "derived";
}
