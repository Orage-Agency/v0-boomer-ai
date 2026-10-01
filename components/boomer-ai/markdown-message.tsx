import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

/** Renders model and user message text as Markdown without enabling raw HTML. */
export function MarkdownMessage({ text, isUser = false }: { text: string; isUser?: boolean }) {
  const muted = isUser ? "text-white/90" : "text-slate-600"

  return (
    <div className={`min-w-0 break-words text-sm sm:text-base leading-relaxed ${isUser ? "text-white" : "text-slate-900"}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0 whitespace-pre-wrap">{children}</p>,
          h1: ({ children }) => <h1 className="mt-4 mb-2 text-xl font-bold first:mt-0">{children}</h1>,
          h2: ({ children }) => <h2 className="mt-4 mb-2 text-lg font-bold first:mt-0">{children}</h2>,
          h3: ({ children }) => <h3 className="mt-3 mb-1 text-base font-bold first:mt-0">{children}</h3>,
          ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-6">{children}</ul>,
          ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-6">{children}</ol>,
          li: ({ children }) => <li className="pl-1">{children}</li>,
          blockquote: ({ children }) => <blockquote className={`my-3 border-l-4 border-current/30 pl-3 ${muted}`}>{children}</blockquote>,
          strong: ({ children }) => <strong className="font-bold">{children}</strong>,
          em: ({ children }) => <em>{children}</em>,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noreferrer" className={isUser ? "underline text-white" : "underline text-blue-700"}>
              {children}
            </a>
          ),
          code: ({ children, className }) =>
            className ? (
              <code className="font-mono text-sm">{children}</code>
            ) : (
              <code className={`rounded px-1 py-0.5 font-mono text-[0.9em] ${isUser ? "bg-white/15" : "bg-slate-200"}`}>{children}</code>
            ),
          pre: ({ children }) => <pre className={`my-3 overflow-x-auto rounded-lg p-3 text-sm ${isUser ? "bg-black/20" : "bg-slate-200"}`}>{children}</pre>,
          table: ({ children }) => <div className="my-3 overflow-x-auto"><table className="border-collapse text-sm">{children}</table></div>,
          th: ({ children }) => <th className="border border-current/20 px-2 py-1 text-left font-bold">{children}</th>,
          td: ({ children }) => <td className="border border-current/20 px-2 py-1">{children}</td>,
          hr: () => <hr className="my-3 border-current/20" />,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
}
