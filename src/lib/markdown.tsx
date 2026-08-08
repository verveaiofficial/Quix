import React from "react";
import CodeEmbedBlock, { CodeLanguage } from "../components/coder/CodeEmbedBlock";
import { buildPreviewDoc } from "./codePreview";

const mdCSS = `
.md-rich { width: 100%; }
.md-p { margin: 0 0 12px; line-height: 1.6; color: #e5e7eb; }
.md-h1 { font-size: 20px; font-weight: 700; color: #fff; margin: 16px 0 10px; }
.md-h2 { font-size: 17px; font-weight: 600; color: #fff; margin: 14px 0 8px; }
.md-h3 { font-size: 15px; font-weight: 600; color: #fff; margin: 12px 0 6px; }
.md-list { margin: 0 0 12px; padding-left: 20px; display: flex; flex-direction: column; gap: 4px; }
.md-list li { color: #e5e7eb; line-height: 1.5; }
.md-inline-code {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 5px;
  padding: 1px 6px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #7dd3fc;
}
.md-link { color: #7dd3fc; text-decoration: underline; }
.md-fence-wrap { margin: 0 0 12px; }
`;

function normalizeLang(info: string): CodeLanguage {
  const l = (info || "").toLowerCase();

  if (l.includes("html")) return "HTML";
  if (l.includes("tsx") || l.includes("typescript")) return "TSX";
  if (l.includes("jsx") || l.includes("react")) return "JSX";

  return "HTML";
}

function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text))) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }

    const token = match[0];

    if (token.startsWith("**")) {
      nodes.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      nodes.push(
        <code key={key++} className="md-inline-code">
          {token.slice(1, -1)}
        </code>
      );
    } else {
      const link = /\[([^\]]+)\]\(([^)]+)\)/.exec(token);

      if (link) {
        nodes.push(
          <a
            key={key++}
            className="md-link"
            href={link[2]}
            target="_blank"
            rel="noreferrer"
          >
            {link[1]}
          </a>
        );
      }
    }

    last = regex.lastIndex;
  }

  if (last < text.length) {
    nodes.push(text.slice(last));
  }

  return nodes;
}

function RichText({ text }: { text: string }) {
  const lines = text.split("\n");
  const out: React.ReactNode[] = [];

  let key = 0;
  let list: string[] = [];

  const flush = () => {
    if (list.length) {
      out.push(
        <ul key={key++} className="md-list">
          {list.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      list = [];
    }
  };

  for (const raw of lines) {
    const trimmed = raw.trim();

    if (!trimmed) {
      flush();
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flush();
      out.push(
        <h4 key={key++} className="md-h3">
          {renderInline(trimmed.slice(4))}
        </h4>
      );
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flush();
      out.push(
        <h3 key={key++} className="md-h2">
          {renderInline(trimmed.slice(3))}
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith("# ")) {
      flush();
      out.push(
        <h2 key={key++} className="md-h1">
          {renderInline(trimmed.slice(2))}
        </h2>
      );
      continue;
    }

    if (/^[-*] /.test(trimmed)) {
      list.push(trimmed.slice(2));
      continue;
    }

    if (/^\d+\. /.test(trimmed)) {
      list.push(trimmed.replace(/^\d+\. /, ""));
      continue;
    }

    flush();
    out.push(
      <p key={key++} className="md-p">
        {renderInline(trimmed)}
      </p>
    );
  }

  flush();

  return <div className="md-rich">{out}</div>;
}

interface MarkdownTextProps {
  text: string;
  enablePreview?: boolean;
}

export function MarkdownText({ text, enablePreview = false }: MarkdownTextProps) {
  const blocks: React.ReactNode[] = [];
  const regex = /```(\w+)?\n?([\s\S]*?)```/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text))) {
    if (match.index > lastIndex) {
      blocks.push(
        <RichText key={key++} text={text.slice(lastIndex, match.index)} />
      );
    }

    const lang = normalizeLang(match[1] || "");
    const code = match[2];

    blocks.push(
      <div key={key++} className="md-fence-wrap">
        <CodeEmbedBlock
          codeText={code}
          lang={lang}
          iframeDoc={enablePreview ? buildPreviewDoc(code, lang) : undefined}
        />
      </div>
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    blocks.push(<RichText key={key++} text={text.slice(lastIndex)} />);
  }

  return (
    <>
      <style>{mdCSS}</style>
      {blocks}
    </>
  );
}
