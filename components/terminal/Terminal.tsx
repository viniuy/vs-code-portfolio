'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { TermLine } from '@/types'
import { personalInfo } from '@/data/files'
import { useRunBuild } from '@/components/editor/RunBuildContext'

const helpLines: TermLine[] = [
  { type: 'muted',   value: '' },
  { type: 'success', value: '  Available commands:' },
  { type: 'muted',   value: '' },
  { type: 'normal',  value: '  contact          — email, GitHub & LinkedIn' },
  { type: 'normal',  value: '  skills           — full tech stack' },
  { type: 'normal',  value: '  hire             — make your case' },
  { type: 'normal',  value: '  clear            — clear terminal' },
  { type: 'normal',  value: '  chat <message>   — ask Vince\'s AI anything' },
  { type: 'muted',   value: '' },
]

// Sourced from personalInfo so the terminal can never drift from the rest of the site.
const stripScheme = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

const contactLines: TermLine[] = [
  { type: 'muted',   value: '' },
  { type: 'success', value: '  ─── Contact Vincent ───' },
  { type: 'normal',  value: `  email: ${personalInfo.email}` },
  { type: 'normal',  value: `  github: ${stripScheme(personalInfo.github)}` },
  { type: 'normal',  value: `  linkedin: ${stripScheme(personalInfo.linkedin)}` },
  { type: 'normal',  value: `  location: ${personalInfo.location}` },
  { type: 'muted',   value: '' },
]

const skillsLines: TermLine[] = [
  { type: 'muted',   value: '' },
  { type: 'success', value: '  ─── Tech Stack ───' },
  { type: 'normal',  value: '  Primary     Java · Unix/Linux' },
  { type: 'normal',  value: '  Frontend    React · Next.js · TypeScript · HTML/CSS' },
  { type: 'normal',  value: '  Backend     Node.js · PostgreSQL · Supabase · Prisma' },
  { type: 'normal',  value: '  Other       Python · PHP · C# · C++ · Lua' },
  { type: 'normal',  value: '  AI          Claude API · OpenAI API · Prompt Eng.' },
  { type: 'normal',  value: '  Tools       Git · Vite · Postman · Android Studio' },
  { type: 'normal',  value: '  3D          Blender · React Three Fiber · Three.js' },
  { type: 'muted',   value: '' },
]

const hireLines: TermLine[] = [
  { type: 'muted',   value: '' },
  { type: 'success', value: '  Initializing hire sequence...' },
  { type: 'muted',   value: '' },
  { type: 'success', value: `  → ${personalInfo.email}` },
  { type: 'muted',   value: '' },
]

const initLines: TermLine[] = [
  { type: 'muted', value: 'Vincent Dizon Portfolio — Terminal v1.0' },
  { type: 'muted', value: "Type 'help' to see available commands." },
  { type: 'muted', value: '' },
]

export default function Terminal({ fullHeight }: { fullHeight?: boolean }) {
  const [lines, setLines] = useState<TermLine[]>(initLines)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { buildLines, building } = useRunBuild()

  // Inject build output into terminal when build runs
  const prevBuildLinesRef = useRef<typeof buildLines>([])
  useEffect(() => {
    if (buildLines.length === 0) return
    if (buildLines === prevBuildLinesRef.current) return
    prevBuildLinesRef.current = buildLines

    // On first build line, add separator
    if (buildLines.length === 1) {
      setLines(prev => [
        ...prev,
        { type: 'muted', value: '' },
        { type: 'prompt', value: 'npm run dev' },
      ])
    }

    // Add the latest build line
    const latest = buildLines[buildLines.length - 1]
    if (!latest?.text) return
    const termType =
      latest.color === '#4ec9b0' ? 'success' :
      latest.color === '#569cd6' ? 'ai' :
      'muted'
    setLines(prev => [...prev, { type: termType, value: '  ' + latest.text }])
  }, [buildLines])

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [lines])

  async function handleCommand(raw: string) {
    const trimmed = raw.trim()
    if (!trimmed) return

    const cmd = trimmed.toLowerCase().split(' ')[0]
    const rest = trimmed.slice(cmd.length).trim()

    setLines((prev) => [...prev, { type: 'prompt', value: trimmed }])
    setInput('')

    if (cmd === 'clear') { setLines([]); return }
    if (cmd === 'help')    { setLines((p) => [...p, ...helpLines]); return }
    if (cmd === 'contact') { setLines((p) => [...p, ...contactLines]); return }
    if (cmd === 'skills')  { setLines((p) => [...p, ...skillsLines]); return }
    if (cmd === 'hire')    { setLines((p) => [...p, ...hireLines]); return }

    if (cmd === 'chat') {
      if (!rest) {
        setLines((p) => [...p, { type: 'error', value: "  Usage: chat <your message>" }])
        return
      }
      setLines((p) => [...p, { type: 'muted', value: '  vince-ai is thinking...' }])
      setLoading(true)
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: rest }),
        })
        const data = await res.json()
        setLines((p) => {
          const filtered = p.filter((l) => l.value !== '  vince-ai is thinking...')
          const replyLines: TermLine[] = (data.reply as string)
            .split('\n')
            .filter(Boolean)
            .map((line) => ({ type: 'ai' as const, value: '  vince-ai › ' + line }))
          return [...filtered, ...replyLines, { type: 'muted', value: '' }]
        })
      } catch {
        setLines((p) => {
          const filtered = p.filter((l) => l.value !== '  vince-ai is thinking...')
          return [...filtered, { type: 'error', value: '  vince-ai › Could not connect. Try again.' }]
        })
      } finally {
        setLoading(false)
      }
      return
    }

    setLines((p) => [...p, { type: 'error', value: `  Command not found: ${cmd}. Type 'help' for commands.` }])
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleCommand(input)
  }

  const lineColors: Record<string, string> = {
    prompt:  '#d4d4d4',
    success: '#4ec9b0',
    error:   '#f48771',
    muted:   '#858585',
    ai:      '#ce9178',
    normal:  '#d4d4d4',
  }

  return (
    <div style={{ height: fullHeight ? '100%' : '200px', background: '#1e1e1e', borderTop: '1px solid #3a3a3a', display: 'flex', flexDirection: 'column', flexShrink: 0, flex: fullHeight ? 1 : undefined }}>
      {/* Term tabs */}
      <div style={{ height: '28px', background: '#252526', display: 'flex', alignItems: 'center', borderBottom: '1px solid #1e1e1e', flexShrink: 0 }}>
        {['TERMINAL', 'PROBLEMS', 'OUTPUT'].map((t, i) => (
          <div key={t} style={{ padding: '0 14px', height: '28px', display: 'flex', alignItems: 'center', fontSize: '11px', cursor: 'pointer', color: i === 0 ? '#fff' : '#9d9d9d', borderBottom: i === 0 ? '1px solid #007acc' : 'none' }}>
            {t}
          </div>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '2px', paddingRight: '8px' }}>
          <div
            onClick={() => setLines([])}
            style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: '3px', color: '#9d9d9d' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#3a3a3a'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#9d9d9d' }}
          >
            <i className="ti ti-trash" style={{ fontSize: '14px' }} aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div
        ref={bodyRef}
        onClick={() => inputRef.current?.focus()}
        style={{ flex: 1, padding: '8px 12px', overflowY: 'auto', fontFamily: "'Cascadia Code','Fira Code',monospace", fontSize: '12px', lineHeight: '1.6', cursor: 'text' }}
      >
        {lines.map((line, i) => (
          <div key={i} style={{ color: lineColors[line.type] ?? '#d4d4d4' }}>
            {line.type === 'prompt' ? (
              <>
                <span style={{ color: '#4ec9b0' }}>~/vincent-portfolio</span>
                <span style={{ color: '#569cd6', margin: '0 4px' }}>{'>'}</span>
                {line.value}
              </>
            ) : line.value}
          </div>
        ))}

        {/* Input row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
          <span style={{ color: '#4ec9b0' }}>~/vincent-portfolio</span>
          <span style={{ color: '#569cd6', margin: '0 4px' }}>{'>'}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={loading}
            placeholder={loading ? '' : "type 'help' to get started..."}
            spellCheck={false}
            autoFocus
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              color: '#d4d4d4', fontFamily: 'inherit', fontSize: '12px',
              flex: 1, caretColor: '#fff',
            }}
          />
        </div>
      </div>
    </div>
  )
}