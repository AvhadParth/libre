import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The legal documents, read from the Markdown they were supplied as.
 *
 * The copy lives in `content/legal/*.md` and is parsed at build time, so the
 * client edits one Markdown file and the page follows. Nothing here runs in the
 * browser — `node:fs` keeps it server-only by construction.
 *
 * The parser handles exactly the Markdown these three documents use and
 * deliberately no more: headings, bold, italic, both kinds of list, a rule, and
 * paragraphs. It returns data, never HTML, so the page renders React elements
 * and there is no string of markup to sanitise.
 */

/* ------------------------------------------------------------------ types --- */

export type Inline =
  | { kind: 'text'; text: string }
  | { kind: 'strong'; text: string }
  | { kind: 'em'; text: string }
  /** A `[bracketed]` gap in the template, so the page can mark it as unfilled. */
  | { kind: 'blank'; text: string };

export type Block =
  | { kind: 'heading'; number: string | null; text: Inline[] }
  | { kind: 'para'; lines: Inline[][] }
  | { kind: 'list'; ordered: boolean; items: Inline[][] }
  | { kind: 'rule' };

export type LegalDoc = {
  slug: string;
  /** Short label for the nav and the footer. */
  label: string;
  /** The document's own `# ` title. */
  title: string;
  description: string;
  updated: string | null;
  blocks: Block[];
  /** The closing `*…*` note the templates carry, if present. */
  note: string | null;
  /** How many `[bracketed]` gaps are still unfilled. */
  blanks: number;
};

/* ---------------------------------------------------------------- sources --- */

const SOURCES = [
  {
    slug: 'privacy',
    label: 'Privacy',
    file: 'privacy-policy.md',
    description: 'How LIBRE collects, uses and protects personal information.',
  },
  {
    slug: 'terms',
    label: 'Terms',
    file: 'terms-and-conditions.md',
    description: 'The terms that apply to using this site and buying from it.',
  },
  {
    slug: 'contact',
    label: 'Contact & Grievance',
    file: 'contact-grievance.md',
    description: 'How to reach us, and how complaints are handled.',
  },
] as const;

export const LEGAL_SLUGS = SOURCES.map((s) => s.slug);

/* ----------------------------------------------------------------- inline --- */

/*
 * `**bold**`, `*italic*` and `[unfilled]` in one pass.
 *
 * Bold is matched before italic so the `**` of a bold run is never mistaken for
 * the `*` of an italic one — the usual way a naive Markdown parser mangles
 * `**Email:**` into an italic fragment.
 */
const INLINE = /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]/g;

function inline(source: string): Inline[] {
  const out: Inline[] = [];
  let at = 0;

  for (const m of source.matchAll(INLINE)) {
    if (m.index > at) out.push({ kind: 'text', text: source.slice(at, m.index) });
    if (m[1] !== undefined) out.push({ kind: 'strong', text: m[1] });
    else if (m[2] !== undefined) out.push({ kind: 'em', text: m[2] });
    else out.push({ kind: 'blank', text: m[3] });
    at = m.index + m[0].length;
  }

  if (at < source.length) out.push({ kind: 'text', text: source.slice(at) });
  return out;
}

/* ------------------------------------------------------------------ parse --- */

/** `## 3. Grievance Redressal Process` → number "03", text "Grievance…". */
function splitHeading(text: string): { number: string | null; rest: string } {
  const m = /^(\d+)\.\s+(.*)$/.exec(text);
  return m ? { number: m[1].padStart(2, '0'), rest: m[2] } : { number: null, rest: text };
}

function parse(markdown: string) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let title = '';
  let updated: string | null = null;
  let note: string | null = null;

  /* Paragraphs collect their own lines: a single newline inside one is a real
     line break here, not whitespace. The contact blocks depend on it — each
     "**Label:** value" is its own line and would otherwise run together. */
  let para: Inline[][] = [];
  const flushPara = () => {
    if (para.length) blocks.push({ kind: 'para', lines: para });
    para = [];
  };

  let list: { ordered: boolean; items: Inline[][] } | null = null;
  const flushList = () => {
    if (list) blocks.push({ kind: 'list', ...list });
    list = null;
  };

  const flush = () => {
    flushPara();
    flushList();
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (!line.trim()) {
      flush();
      continue;
    }

    if (line.startsWith('# ')) {
      flush();
      title = line.slice(2).trim();
      continue;
    }

    if (line.startsWith('## ')) {
      flush();
      const { number, rest } = splitHeading(line.slice(3).trim());
      blocks.push({ kind: 'heading', number, text: inline(rest) });
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      flush();
      blocks.push({ kind: 'rule' });
      continue;
    }

    /* "**Last Updated:** …" is metadata, not body copy — the page prints it in
       its own slot under the title rather than as a first paragraph. */
    const stamp = /^\*\*Last Updated:\*\*\s*(.+)$/.exec(line.trim());
    if (stamp) {
      flush();
      updated = stamp[1].trim();
      continue;
    }

    /* The closing "*This document is a general template…*" advisory. It is an
       instruction to whoever publishes the page, not copy for a reader, so it
       is lifted out and rendered as a pending note. */
    const advisory = /^\*([^*].*[^*])\*$/.exec(line.trim());
    if (advisory && /template|legal professional/i.test(advisory[1])) {
      flush();
      note = advisory[1].trim();
      continue;
    }

    const bullet = /^[-*]\s+(.*)$/.exec(line);
    if (bullet) {
      flushPara();
      if (!list || list.ordered) {
        flushList();
        list = { ordered: false, items: [] };
      }
      list.items.push(inline(bullet[1]));
      continue;
    }

    const numbered = /^\d+\.\s+(.*)$/.exec(line);
    if (numbered) {
      flushPara();
      if (!list || !list.ordered) {
        flushList();
        list = { ordered: true, items: [] };
      }
      list.items.push(inline(numbered[1]));
      continue;
    }

    flushList();
    para.push(inline(line.trim()));
  }

  flush();
  return { title, updated, note, blocks };
}

/* ------------------------------------------------------------------ read --- */

const countBlanks = (blocks: Block[]) => {
  let n = 0;
  const walk = (parts: Inline[]) => parts.forEach((p) => p.kind === 'blank' && (n += 1));
  for (const b of blocks) {
    if (b.kind === 'heading') walk(b.text);
    if (b.kind === 'para') b.lines.forEach(walk);
    if (b.kind === 'list') b.items.forEach(walk);
  }
  return n;
};

export function legalDocs(): LegalDoc[] {
  return SOURCES.map((source) => {
    const raw = readFileSync(join(process.cwd(), 'content/legal', source.file), 'utf8');
    const { title, updated, note, blocks } = parse(raw);
    return {
      slug: source.slug,
      label: source.label,
      title,
      description: source.description,
      updated,
      blocks,
      note,
      blanks: countBlanks(blocks),
    };
  });
}

export function legalDoc(slug: string): LegalDoc | undefined {
  return legalDocs().find((d) => d.slug === slug);
}
