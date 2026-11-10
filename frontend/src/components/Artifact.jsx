import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Check, Code2, Copy, Eye, PanelRightClose, PanelRightOpen } from 'lucide-react'
import { motion } from 'motion/react'
import Editor from '@monaco-editor/react'

const detectLanguage = (fileName = '') => {
    const name = fileName.toLowerCase()

    if (name.endsWith('.html')) return 'html'
    if (name.endsWith('.css')) return 'css'
    if (name.endsWith('.js')) return 'javascript'
    if (name.endsWith('.jsx')) return 'javascript'
    if (name.endsWith('.ts')) return 'typescript'
    if (name.endsWith('.tsx')) return 'typescript'
    if (name.endsWith('.json')) return 'json'
    if (name.endsWith('.py')) return 'python'
    if (name.endsWith('.java')) return 'java'
    if (name.endsWith('.cpp')) return 'cpp'
    if (name.endsWith('.c')) return 'c'

    return 'plaintext'
}

const Artifact = () => {
    const [collapsed, setCollapsed] = useState(false)
    const [tab, setTab] = useState('code')
    const [activeFile, setActiveFile] = useState(0)
    const [copied, setCopied] = useState(false)

    const artifacts = useSelector((state) => state.message.artifacts) || []
    const artifactId = artifacts[0]?.id

    useEffect(() => {
        setActiveFile(0)
        setTab('code')
    }, [artifactId])

    if (artifacts.length === 0) return null

    const title = artifacts[0]?.title || 'Project'
    const files = artifacts[0]?.files || []

    const file = files[activeFile] || files[0]
    const htmlFile = files.find((f) => f.name === 'index.html')
    const cssFile = files.find((f) => f.name === 'style.css')
    const jsFile = files.find((f) => f.name === 'script.js')

    const canPreview = Boolean(htmlFile)

    const buildPreviewDoc = () => {
        if (!htmlFile) return ''

        let html = htmlFile.content || ''

        html = html
            .replace(/<link[^>]*href=["'](?:\.\/)?style\.css["'][^>]*>/gi, '')
            .replace(/<script[^>]*src=["'](?:\.\/)?script\.js["'][^>]*>\s*<\/script>/gi, '')

        const styleTag = `<style>${cssFile?.content || ''}</style>`
        const scriptTag = `<script>${(jsFile?.content || '').replace(/<\/script/gi, '<\\/script')}</script>`

        if (/<\/head>/i.test(html)) {
            html = html.replace(/<\/head>/i, `${styleTag}</head>`)
        } else {
            html = styleTag + html
        }

        if (/<\/body>/i.test(html)) {
            html = html.replace(/<\/body>/i, `${scriptTag}</body>`)
        } else {
            html = html + scriptTag
        }

        return html
    }

    const previewDoc = buildPreviewDoc()

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(file?.content || '')
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.log('copy failed:', error)
        }
    }

    return (
        <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: collapsed ? 48 : 400, opacity: 1 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="hidden lg:flex h-full max-w-[40vw] border-l border-white/[0.06] flex-col overflow-hidden shrink-0"
        >
            {!collapsed ? (
                <div className="flex flex-col h-full min-h-0 bg-[#0d0f14]">
                    <div className="h-14 px-4 border-b border-white/[0.06] flex items-center gap-3 shrink-0">
                        <button
                            type="button"
                            aria-label="Collapse panel"
                            onClick={() => setCollapsed(true)}
                            className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer shrink-0"
                        >
                            <PanelRightClose size={16} />
                        </button>

                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 shrink-0">
                                <Code2 className="text-indigo-400" size={12} />
                            </div>
                            <div className="text-[13px] font-medium text-slate-200 truncate">
                                {title}
                            </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                            <button
                                type="button"
                                aria-label="Copy code"
                                onClick={handleCopy}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] rounded-lg transition-colors duration-150 bg-transparent border-none cursor-pointer"
                            >
                                {copied ? <Check size={15} /> : <Copy size={15} />}
                            </button>
                        </div>

                        {canPreview && (
                            <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] p-1 rounded-lg shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setTab('code')}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors duration-150 border-none cursor-pointer
                                        ${tab === 'code' ? 'bg-indigo-500 text-white' : 'bg-transparent text-slate-500 hover:text-slate-200'}`}
                                >
                                    <Code2 size={11} /> Code
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTab('preview')}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors duration-150 border-none cursor-pointer
                                        ${tab === 'preview' ? 'bg-indigo-500 text-white' : 'bg-transparent text-slate-500 hover:text-slate-200'}`}
                                >
                                    <Eye size={11} /> Preview
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex h-auto border-b border-white/[0.06] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0">
                        {files.map((f, index) => (
                            <button
                                key={`${f.name}-${index}`}
                                type="button"
                                onClick={() => {
                                    setActiveFile(index)
                                    setTab('code')
                                }}
                                className={`px-4 py-2.5 text-[11px] font-medium whitespace-nowrap transition-colors duration-150 border-r border-white/[0.05] relative cursor-pointer bg-transparent border-y-0 border-l-0
                                    ${activeFile === index ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {f?.name}
                                {activeFile === index && (
                                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500 rounded-t-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 min-h-0 overflow-hidden">
                        {tab === 'preview' && canPreview ? (
                            <motion.div
                                key="preview"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className="w-full h-full"
                            >
                                <iframe
                                    title="preview"
                                    srcDoc={previewDoc}
                                    sandbox="allow-scripts"
                                    className="w-full h-full bg-white"
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key={`code-${activeFile}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className="w-full h-full"
                            >
                                <Editor
                                    theme="vs-dark"
                                    path={file?.name}
                                    language={detectLanguage(file?.name)}
                                    value={file?.content || ''}
                                    options={{
                                        readOnly: true,
                                        minimap: { enabled: false },
                                        fontSize: 13,
                                        scrollBeyondLastLine: false,
                                        wordWrap: 'on',
                                    }}
                                />
                            </motion.div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center h-full bg-[#0d0f14] pt-3.5 gap-4">
                    <button
                        type="button"
                        aria-label="Expand panel"
                        onClick={() => setCollapsed(false)}
                        className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer shrink-0"
                    >
                        <PanelRightOpen size={16} />
                    </button>

                    <div
                        className="text-[10px] font-medium text-slate-600 tracking-widest uppercase whitespace-nowrap"
                        style={{ writingMode: 'vertical-lr' }}
                    >
                        {title}
                    </div>
                </div>
            )}
        </motion.div>
    )
}

export default Artifact