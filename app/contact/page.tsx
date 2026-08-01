import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

// Two columns, spare. Corrections get their own row deliberately: a publication
// that marks its numbers should make it easy to tell it when one is wrong.
export default function ContactPage() {
  return (
    <section className="view">
      <div className="contact-grid">
        <div>
          <h2>Contact</h2>
          <p>
            Placeholder copy. A short paragraph about what is worth writing in
            about: corrections, sources, questions, and work.
          </p>
          <p>
            Corrections get their own sentence here, because a publication that
            marks its numbers should make it easy to tell it when one is wrong.
          </p>
        </div>
        <div>
          <div className="cline">
            <p className="l">Email</p>
            <p className="v">
              <a href="#">placeholder@burnrate.news</a>
            </p>
          </div>
          <div className="cline">
            <p className="l">Corrections</p>
            <p className="v">
              <a href="#">placeholder@burnrate.news</a>
            </p>
          </div>
          <div className="cline">
            <p className="l">Elsewhere</p>
            <p className="v" style={{ color: "var(--color-muted)" }}>
              Placeholder
            </p>
          </div>
          <div className="cline">
            <p className="l">Written by</p>
            <p className="v">Enzo Carvalho</p>
          </div>
          <div
            className="cline"
            style={{ borderBottom: "1px solid var(--color-rule)" }}
          />
        </div>
      </div>
    </section>
  );
}
