/**
 * RichContent - HTML / Markdown 自動判定レンダリングコンポーネント
 *
 * wojp_admin の Tiptap エディタが出力するコンテンツを正しくレンダリングします。
 *
 * 対応パターン:
 *   1. 正常な HTML（Tiptap が正しく出力した場合）→ dangerouslySetInnerHTML
 *   2. <pre><code>Markdown</code></pre> のみ → Markdown として react-markdown でレンダリング
 *   3. <p># 見出し</p> や <p>**太字**</p> のように <p> 内に Markdown 記法が混在
 *      → HTML タグを除去して Markdown として react-markdown でレンダリング
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
 * HTML の <p> タグ内に Markdown 記法が含まれているか判定
 * 例: <p># 見出し</p>, <p>**太字**</p>, <p>---</p>
 */
function hasMarkdownInParagraphs(text: string): boolean {
  // <p> タグの内容を抽出
  const pContents = text.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
  const markdownPatterns = [
    /^#{1,6}\s/,          // 見出し: # ## ###
    /^\*\*[\s\S]+\*\*/,   // 太字: **text**
    /^---+$/,             // 水平線: ---
    /^\* /,               // 箇条書き: * item
    /^- /,                // 箇条書き: - item
    /^\d+\. /,            // 番号付きリスト: 1. item
    /^> /,                // 引用: > text
    /^## /,               // 見出し2
  ];

  return pContents.some((pTag) => {
    // <p> タグ内のテキストを取得（HTMLタグを除去）
    const inner = pTag.replace(/<[^>]+>/g, "").trim();
    return markdownPatterns.some((pattern) => pattern.test(inner));
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

  // パターン3: HTML の <p> 内に Markdown 記法が混在している場合
  if (isHtml(content) && hasMarkdownInParagraphs(content)) {
    // HTML タグを除去して Markdown テキストとして取得
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
