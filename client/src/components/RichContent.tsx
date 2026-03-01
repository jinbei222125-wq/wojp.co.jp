/**
 * RichContent - HTML / Markdown 自動判定レンダリングコンポーネント
 *
 * wojp_admin の Tiptap エディタが出力するコンテンツを正しくレンダリングします。
 *
 * 対応パターン:
 *   1. 正常な HTML（Tiptap が正しく出力した場合）→ Markdown記法を前処理してから dangerouslySetInnerHTML
 *   2. <pre><code>Markdown</code></pre> のみ → Markdown として react-markdown でレンダリング
 *   3. <p># 見出し</p> のように <p> 内に行頭 Markdown 記法がある → htmlToMarkdown で変換して react-markdown
 *   4. プレーンな Markdown テキスト → react-markdown でレンダリング
 */

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
 * ※ 段落途中の **太字** は別途 preprocessHtml で処理するため、ここでは行頭のみ判定
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
 * HTML を前処理して、<p> タグ内の Markdown 記法（**太字**, *斜体*）を
 * HTML タグ（<strong>, <em>）に変換する
 */
function preprocessHtml(html: string): string {
  // <p> タグの内容を処理
  return html.replace(/<p([^>]*)>([\s\S]*?)<\/p>/gi, (_match, attrs, inner) => {
    // <p> 内のテキストノード部分の Markdown 記法を HTML に変換
    let processed = inner;

    // **太字** → <strong>太字</strong>
    processed = processed.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");

    // *斜体* → <em>斜体</em> （**太字** の変換後に実行）
    processed = processed.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>");

    return `<p${attrs}>${processed}</p>`;
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

export default function RichContent({ content, className }: RichContentProps) {
  if (!content) return null;

  // パターン2: <pre><code>Markdown</code></pre> のみの場合
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

  // パターン3: HTML の <p> 内に行頭 Markdown 記法（見出し、水平線など）が混在している場合
  // → HTML タグを除去して Markdown テキストとして react-markdown でレンダリング
  if (isHtml(content) && hasLineStartMarkdownInParagraphs(content)) {
    const markdown = htmlToMarkdown(content);
    return (
      <div className={className}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {markdown}
        </ReactMarkdown>
      </div>
    );
  }

  // パターン1: 正常な HTML（Tiptap 出力）
  // → **太字** などの Markdown 記法を前処理で HTML に変換してからレンダリング
  if (isHtml(content)) {
    const preprocessed = preprocessHtml(content);
    const clean = DOMPurify.sanitize(preprocessed, { USE_PROFILES: { html: true } });
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
