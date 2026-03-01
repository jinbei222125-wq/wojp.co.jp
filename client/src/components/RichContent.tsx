/**
 * RichContent - HTML / Markdown 自動判定レンダリングコンポーネント
 *
 * wojp_admin の Tiptap エディタが出力するコンテンツを正しくレンダリングします。
 *
 * 対応パターン:
 *   1. 正常な HTML（Tiptap が正しく出力した場合）→ Markdown記法を前処理してから dangerouslySetInnerHTML
 *   2. <pre><code>Markdown</code></pre> のみ → Markdown → HTML 変換して dangerouslySetInnerHTML
 *   3. <p># 見出し</p> のように <p> 内に行頭 Markdown 記法がある → htmlToMarkdown → markdownToHtml
 *   4. プレーンな Markdown テキスト → markdownToHtml
 */

import DOMPurify from "dompurify";

interface RichContentProps {
  content: string;
  className?: string;
}

/**
 * HTML エンティティをデコード
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * テキストが HTML タグを含むか判定
 */
function isHtml(text: string): boolean {
  if (!text) return false;
  return /<\/?[a-z][\s\S]*>/i.test(text);
}

/**
 * コンテンツが <pre><code>...</code></pre> のみで構成されているか判定し、
 * その場合は内部のテキストを返す（Markdown として扱う）
 */
function extractMarkdownFromPreCode(text: string): string | null {
  const trimmed = text.trim();
  const match = trimmed.match(/^<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>(<p><\/p>)?$/i);
  if (match) {
    return decodeHtmlEntities(match[1]);
  }
  return null;
}

/**
 * HTML の <p> タグ内に行頭 Markdown 記法が含まれているか判定
 * 例: <p># 見出し</p>, <p>## 見出し2</p>, <p>---</p>
 */
function hasLineStartMarkdownInParagraphs(text: string): boolean {
  const pContents = text.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
  const lineStartPatterns = [
    /^#{1,6}\s/,   // 見出し: # ## ###
    /^---+$/,      // 水平線: ---
    /^\* /,        // 箇条書き: * item
    /^- /,         // 箇条書き: - item
    /^\d+\. /,     // 番号付きリスト: 1. item
    /^> /,         // 引用: > text
  ];

  return pContents.some((pTag) => {
    const inner = pTag.replace(/<[^>]+>/g, "").trim();
    return lineStartPatterns.some((p) => p.test(inner));
  });
}

/**
 * HTML から全タグを除去してプレーンテキスト（Markdown）を取得
 * <p> → 改行2つ、<br> → 改行、<hr> → --- に変換
 */
function htmlToMarkdown(html: string): string {
  let text = html;

  // <pre><code>...</code></pre> ブロックは内容をそのまま保持
  text = text.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (_match, inner) => {
    return "\n\n```\n" + decodeHtmlEntities(inner) + "\n```\n\n";
  });

  // <hr> → ---
  text = text.replace(/<hr[^>]*\/?>/gi, "\n\n---\n\n");

  // </p> → 改行2つ
  text = text.replace(/<\/p>/gi, "\n\n");

  // <br> → 改行
  text = text.replace(/<br[^>]*\/?>/gi, "\n");

  // 残りの HTML タグを除去
  text = text.replace(/<[^>]+>/g, "");

  // HTML エンティティをデコード
  text = decodeHtmlEntities(text);

  // 連続する空行を最大2行に正規化
  text = text.replace(/\n{3,}/g, "\n\n");

  return text.trim();
}

/**
 * Markdown テキストを HTML に変換
 * react-markdown を使わず、正規表現で変換する
 */
function markdownToHtml(markdown: string): string {
  const lines = markdown.split("\n");
  const htmlLines: string[] = [];
  let i = 0;
  let inList = false;
  let listType = "";
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];

  while (i < lines.length) {
    const line = lines[i];

    // コードブロック
    if (line.trim() === "```") {
      if (inCodeBlock) {
        htmlLines.push("<pre><code>" + codeBlockLines.join("\n") + "</code></pre>");
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      i++;
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(escapeHtml(line));
      i++;
      continue;
    }

    // リストの終了
    if (inList && !line.match(/^(\*|-|\d+\.)\s/)) {
      htmlLines.push(listType === "ul" ? "</ul>" : "</ol>");
      inList = false;
    }

    // 空行
    if (line.trim() === "") {
      i++;
      continue;
    }

    // 水平線
    if (line.match(/^---+$/)) {
      htmlLines.push("<hr>");
      i++;
      continue;
    }

    // 見出し
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = processInlineMarkdown(headingMatch[2]);
      htmlLines.push(`<h${level}>${text}</h${level}>`);
      i++;
      continue;
    }

    // 箇条書き（* または -）
    const ulMatch = line.match(/^[*-]\s+(.+)$/);
    if (ulMatch) {
      if (!inList || listType !== "ul") {
        if (inList) htmlLines.push(listType === "ul" ? "</ul>" : "</ol>");
        htmlLines.push("<ul>");
        inList = true;
        listType = "ul";
      }
      htmlLines.push(`<li>${processInlineMarkdown(ulMatch[1])}</li>`);
      i++;
      continue;
    }

    // 番号付きリスト
    const olMatch = line.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      if (!inList || listType !== "ol") {
        if (inList) htmlLines.push(listType === "ul" ? "</ul>" : "</ol>");
        htmlLines.push("<ol>");
        inList = true;
        listType = "ol";
      }
      htmlLines.push(`<li>${processInlineMarkdown(olMatch[1])}</li>`);
      i++;
      continue;
    }

    // 引用
    const blockquoteMatch = line.match(/^>\s+(.+)$/);
    if (blockquoteMatch) {
      htmlLines.push(`<blockquote><p>${processInlineMarkdown(blockquoteMatch[1])}</p></blockquote>`);
      i++;
      continue;
    }

    // 通常の段落
    htmlLines.push(`<p>${processInlineMarkdown(line)}</p>`);
    i++;
  }

  // リストが閉じられていない場合
  if (inList) {
    htmlLines.push(listType === "ul" ? "</ul>" : "</ol>");
  }

  return htmlLines.join("\n");
}

/**
 * HTML エスケープ
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * インライン Markdown 記法を HTML に変換
 * **太字**, *斜体*, `コード`, [リンク](url) を処理
 */
function processInlineMarkdown(text: string): string {
  let result = text;

  // **太字** → <strong>太字</strong>
  result = result.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");

  // *斜体* → <em>斜体</em> （**太字** の変換後に実行）
  result = result.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>");

  // `コード` → <code>コード</code>
  result = result.replace(/`([^`\n]+)`/g, "<code>$1</code>");

  // [テキスト](url) → <a href="url">テキスト</a>
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  return result;
}

/**
 * HTML を前処理して、<p> タグ内の Markdown 記法（**太字**, *斜体*）を
 * HTML タグ（<strong>, <em>）に変換する
 */
function preprocessHtml(html: string): string {
  // <p> タグの内容を処理
  return html.replace(/<p([^>]*)>([\s\S]*?)<\/p>/gi, (_match, attrs, inner) => {
    let processed = inner;

    // **太字** → <strong>太字</strong>
    processed = processed.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");

    // *斜体* → <em>斜体</em> （**太字** の変換後に実行）
    processed = processed.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>");

    return `<p${attrs}>${processed}</p>`;
  });
}

export default function RichContent({ content, className }: RichContentProps) {
  if (!content) return null;

  let html = "";

  // パターン2: <pre><code>Markdown</code></pre> のみの場合
  const markdownFromPreCode = extractMarkdownFromPreCode(content);
  if (markdownFromPreCode !== null) {
    html = markdownToHtml(markdownFromPreCode);
  }
  // パターン3: HTML の <p> 内に行頭 Markdown 記法（見出し、水平線など）が混在している場合
  // → HTML タグを除去して Markdown テキストとして markdownToHtml でレンダリング
  else if (isHtml(content) && hasLineStartMarkdownInParagraphs(content)) {
    const markdown = htmlToMarkdown(content);
    html = markdownToHtml(markdown);
  }
  // パターン1: 正常な HTML（Tiptap 出力）
  // → **太字** などの Markdown 記法を前処理で HTML に変換してからレンダリング
  else if (isHtml(content)) {
    html = preprocessHtml(content);
  }
  // パターン4: プレーンな Markdown テキスト
  else {
    html = markdownToHtml(content);
  }

  const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
