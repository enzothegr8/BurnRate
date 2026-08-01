// An empty list is rendered, never omitted.
//
// Building the structure and showing the gap is the house style: a section that
// silently disappears when it has nothing in it tells the reader the section
// does not exist, which is a different and less honest statement than saying it
// is empty. The same instinct is why a category with no entries counts as a
// figure elsewhere in this codebase rather than as nothing at all.
export function EmptyList({ note }: { note: string }) {
  return (
    <div className="empty">
      <p className="meta">{note}</p>
    </div>
  );
}
