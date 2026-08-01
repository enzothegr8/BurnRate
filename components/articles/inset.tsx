// A panel, so it carries a hairline border. Assumptions, denominators, and
// anything a reader can skip without losing the argument.
export function Inset({ children }: { children: React.ReactNode }) {
  return <div className="inset">{children}</div>;
}
