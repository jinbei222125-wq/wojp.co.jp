/**
 * RichContent - HTML / Markdown 自動判定レンダリングコンポーネント
 *
 * Tiptap WYSIWYG エディタが出力する HTML と、
 * 既存の Markdown テキストの両方を自動判定して正しくレンダリングします。
 *
 * 判定ロジック:
 *   - テキストが "<" で始まる、または "<p>" "<h" "<ul>" "<ol>" "<strong>" などの
 *     HTML タグを含む場合 → dangerouslySetInnerHTML で HTML レンダリング
 *   - それ以外 → react-markdown で Markdown レンダリング
 */

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface RichContentProps {
  content: string;
  className?: string;
}

function isHtml(text: string): boolean {
  if (!text) return false;
  // HTMLタグが含まれているか判定
  return /<\/?[a-z][\s\S]*>/i.test(text);
}

export default function RichContent({ content, className }: RichContentProps) {
  if (!content) return null;

  if (isHtml(content)) {
    // HTML（Tiptap出力）をそのままレンダリング
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Markdown をレンダリング
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
