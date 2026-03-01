/**
 * RichContent - HTML / Markdown 自動判定レンダリングコンポーネント
 *
 * wojp_admin の Tiptap エディタが出力するコンテンツを正しくレンダリングします。
 *
 * 対応パターン:
 *   1. 通常の HTML（Tiptap が正しく出力した場合）→ dangerouslySetInnerHTML
 *   2. <pre><code>...</code></pre> 内に Markdown が入っている場合
 *      → Markdown を抽出して react-markdown でレンダリング
 *   3. プレーンな Markdown テキスト → react-markdown でレンダリング
 */

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import DOMPurify from "dompurify";

interface RichContentProps {
  content: string;
  className?: string;
}

/**
 * コンテンツが <pre><code>...</code></pre> のみで構成されているか判定し、
 * その場合は内部のテキストを返す（Markdown として扱う）
 */
function extractMarkdownFromPreCode(text: string): string | null {
  const trimmed = text.trim();
  // <pre><code>...</code></pre> または <pre><code class="...">...</code></pre> のパターン
  const match = trimmed.match(/^<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>(<p><\/p>)?$/i);
  if (match) {
    // HTML エンティティをデコード
    return match[1]
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }
  return null;
}

/**
 * テキストが HTML タグを含むか判定
 */
function isHtml(text: string): boolean {
  if (!text) return false;
  return /<\/?[a-z][\s\S]*>/i.test(text);
}

/**
 * HTML 内に <pre><code> ブロックが含まれており、
 * その中身が Markdown 記法かどうかを判定
 */
function hasMarkdownInPreCode(text: string): boolean {
  const preCodeMatch = text.match(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi);
  if (!preCodeMatch) return false;
  // 中身に Markdown 記法（#, *, -, >, ``` など）が含まれているか
  return preCodeMatch.some((block) => {
    const inner = block.replace(/<[^>]+>/g, "");
    return /^#{1,6}\s|^\*\s|^-\s|^\d+\.\s|^>\s|```/m.test(inner);
  });
}

export default function RichContent({ content, className }: RichContentProps) {
  if (!content) return null;

  // パターン1: <pre><code>Markdown</code></pre> のみの場合
  const markdownFromPreCode = extractMarkdownFromPreCode(content);
  if (markdownFromPreCode !== null) {
    return (
      <div className={className}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {markdownFromPreCode}
        </ReactMarkdown>
      </div>
    );
  }

  // パターン2: HTML の中に <pre><code>Markdown</code></pre> が混在している場合
  if (isHtml(content) && hasMarkdownInPreCode(content)) {
    // <pre><code>...</code></pre> ブロックを Markdown レンダリングに置き換える
    const processed = content.replace(
      /<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>(<p><\/p>)?/gi,
      (_match, inner) => {
        // HTML エンティティをデコードして Markdown テキストを取得
        const markdown = inner
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");
        // Markdown を簡易的に HTML に変換（見出し、リスト、太字など）
        return markdownToHtml(markdown);
      }
    );
    const clean = DOMPurify.sanitize(processed, { USE_PROFILES: { html: true } });
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    );
  }

  // パターン3: 通常の HTML（Tiptap 出力）
  if (isHtml(content)) {
    const clean = DOMPurify.sanitize(content, { USE_PROFILES: { html: true } });
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    );
  }

  // パターン4: プレーンな Markdown テキスト
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

/**
 * 簡易 Markdown → HTML 変換
 * react-markdown を使わずにサーバーサイドでも動作する軽量変換
 */
function markdownToHtml(markdown: string): string {
  let html = markdown;

  // コードブロック（```...```）
  html = html.replace(/```[\w]*\n?([\s\S]*?)```/g, "<pre><code>$1</code></pre>");

  // 見出し
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // 水平線
  html = html.replace(/^---+$/gm, "<hr>");

  // 太字
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // 斜体
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // インラインコード
  html = html.replace(/`(.+?)`/g, "<code>$1</code>");

  // 箇条書きリスト（連続する * または - 行をまとめる）
  html = html.replace(/((?:^[*-] .+\n?)+)/gm, (match) => {
    const items = match
      .trim()
      .split("\n")
      .map((line) => `<li>${line.replace(/^[*-] /, "")}</li>`)
      .join("");
    return `<ul>${items}</ul>`;
  });

  // 番号付きリスト
  html = html.replace(/((?:^\d+\. .+\n?)+)/gm, (match) => {
    const items = match
      .trim()
      .split("\n")
      .map((line) => `<li>${line.replace(/^\d+\. /, "")}</li>`)
      .join("");
    return `<ol>${items}</ol>`;
  });

  // 引用
  html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");

  // 段落（空行で区切られたテキスト）
  html = html
    .split(/\n\n+/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      // すでにブロック要素で囲まれている場合はそのまま
      if (/^<(h[1-6]|ul|ol|li|blockquote|pre|hr)/.test(trimmed)) return trimmed;
      // 改行を <br> に変換して <p> で囲む
      return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");

  return html;
}
