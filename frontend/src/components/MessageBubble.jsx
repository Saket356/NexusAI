import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { X } from 'lucide-react'

const MessageBubble = ({ role, content, images = [] }) => {
  const isUser = role === 'user'
  const [lightBox, setLightBox] = useState(null)

  // only assistant messages show images; accept strings or { url } objects
  const imageList = !isUser && Array.isArray(images)
    ? images.map((img) => (typeof img === 'string' ? img : img?.url)).filter(Boolean)
    : []

  // close the lightbox with the Escape key
  useEffect(() => {
    if (!lightBox) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setLightBox(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [lightBox])

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[92%] md:max-w-[80%] xl:max-w-[72%] min-w-0 px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed break-words overflow-hidden
          ${isUser
            ? 'bg-gradient-to-br from-indigo-500 to-violet-700 text-white rounded-tr-sm whitespace-pre-wrap'
            : 'bg-white/[0.04] border border-white/[0.07] text-slate-200 rounded-tl-sm'
          }`}
      >
        {isUser ? (
          content
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: (props) => <h1 className="text-lg font-semibold text-slate-100 mt-3 mb-2" {...props} />,
              h2: (props) => <h2 className="text-base font-semibold text-slate-100 mt-3 mb-2" {...props} />,
              h3: (props) => <h3 className="text-sm font-semibold text-slate-100 mt-2 mb-1" {...props} />,
              p: (props) => <p className="mb-2 last:mb-0" {...props} />,
              ul: (props) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
              ol: (props) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
              a: (props) => <a className="text-indigo-400 underline break-all" target="_blank" rel="noreferrer" {...props} />,
              img: ({ src, alt }) => (
                <img
                  src={src}
                  alt={alt || ''}
                  loading="lazy"
                  onClick={() => setLightBox(src)}
                  onError={(e) => e.currentTarget.remove()}
                  className="my-2 max-w-full max-h-[420px] object-contain rounded-xl border border-white/10 cursor-zoom-in hover:opacity-90 transition"
                />
              ),
              code: ({ className, children, ...props }) =>
                className ? (
                  <code className={`${className} text-[12.5px]`} {...props}>{children}</code>
                ) : (
                  <code className="px-1.5 py-0.5 rounded bg-white/[0.08] text-indigo-300 text-[12.5px]" {...props}>{children}</code>
                ),
              pre: (props) => (
                <pre className="my-2 p-3 rounded-lg bg-black/40 border border-white/[0.06] overflow-x-auto" {...props} />
              ),
              table: (props) => (
                <div className="my-2 overflow-x-auto">
                  <table className="w-full text-left border-collapse" {...props} />
                </div>
              ),
              th: (props) => <th className="px-3 py-2 border-b border-white/[0.1] font-semibold text-slate-100" {...props} />,
              td: (props) => <td className="px-3 py-2 border-b border-white/[0.05]" {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
        )}

        {imageList.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-4">
            {imageList.map((src, i) => (
              <img
                key={`${src}-${i}`}
                src={src}
                alt=""
                loading="lazy"
                referrerPolicy="no-referrer"
                onClick={() => setLightBox(src)}
                onError={(e) => e.currentTarget.remove()}
                className="w-32 h-24 sm:w-40 sm:h-28 rounded-xl object-cover border border-white/10 cursor-zoom-in hover:opacity-90 transition"
              />
            ))}
          </div>
        )}
      </div>

      {lightBox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setLightBox(null)}
        >
          <button
            type="button"
            aria-label="Close image"
            onClick={() => setLightBox(null)}
            className="absolute top-5 right-5 flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>

          <img
            src={lightBox}
            alt=""
            referrerPolicy="no-referrer"
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-full rounded-xl object-contain"
          />
        </div>
      )}
    </div>
  )
}

export default MessageBubble