'use client'

import { useEditor } from '@/components/editor/EditorContext'
import { files } from '@/data/files'
import RunButton from '@/components/editor/RunButton'
import { useRunBuild } from '@/components/editor/RunBuildContext'

function renderLineParts(parts: (string | [string, string])[]): string {
  let html = ''
  for (const p of parts) {
    if (Array.isArray(p)) {
      const [type, val] = p
      const e = val.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      const colors: Record<string,string> = {
        key:'#569cd6', str:'#ce9178', fn:'#dcdcaa', var:'#9cdcfe',
        num:'#b5cea8', type:'#4ec9b0', tag:'#4ec9b0', attr:'#9cdcfe',
        comment:'#6a9955', log:'#4ec9b0', ini:'#9cdcfe',
      }
      html += `<span style="color:${colors[type]??'#d4d4d4'}">${e}</span>`
    } else {
      html += p.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    }
  }
  return html
}

export default function CodeEditor() {
  const { activeFile, openTabs } = useEditor()
  // Must stay above the early returns — hooks have to run in the same order every render.
  const { addBuildLines, notifyBuildStart } = useRunBuild()

  // If there are no open tabs, show an empty placeholder so the editor updates
  if (openTabs.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9d9d9d' }}>
        No file open
      </div>
    )
  }

  const file = files[activeFile]
  if (!file) return null

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
      <RunButton onBuildLines={addBuildLines} onBuildStart={notifyBuildStart} />
      {/* Breadcrumb + editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Breadcrumb */}
        <div style={{ height: '22px', background: '#1e1e1e', borderBottom: '1px solid #252526', display: 'flex', alignItems: 'center', padding: '0 14px', gap: '4px', flexShrink: 0 }}>
          {file.breadcrumb.map((b, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: i === file.breadcrumb.length - 1 ? '#ccc' : '#9d9d9d' }}>{b}</span>
              {i < file.breadcrumb.length - 1 && <span style={{ fontSize: '11px', color: '#555' }}>›</span>}
            </span>
          ))}
        </div>

        {/* Lines */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', background: '#1e1e1e' }}>
          {file.lines.map((line, i) => {
            const lineNum = i + 1
            let content = ''

            if (line === 'blank') {
              content = '&nbsp;'
            } else if (Array.isArray(line)) {
              if (typeof line[0] === 'string' && !Array.isArray(line[0])) {
                // first element is a plain string or tuple
                content = renderLineParts(line as (string | [string, string])[])
              } else {
                content = renderLineParts(line as (string | [string, string])[])
              }
            } else {
              content = String(line)
            }

            return (
              <div key={i} style={{ display: 'flex', lineHeight: '1.6' }}>
                <span style={{ width: '48px', textAlign: 'right', paddingRight: '16px', color: '#4a4a4a', fontFamily: 'monospace', fontSize: '12px', userSelect: 'none', flexShrink: 0 }}>
                  {lineNum}
                </span>
                <span
                  style={{ fontFamily: "'Cascadia Code','Fira Code',monospace", fontSize: '13px', whiteSpace: 'pre', color: '#d4d4d4' }}
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Minimap */}
      <div style={{ width: '60px', background: '#1e1e1e', borderLeft: '1px solid #252526', flexShrink: 0, overflow: 'hidden', opacity: 0.35 }}>
        {file.lines.map((line, i) => {
          // Get actual line length to determine bar width
          const raw = line === 'blank' ? '' : Array.isArray(line)
            ? line.map((p) => (Array.isArray(p) ? p[1] : p)).join('')
            : String(line)
          const len = raw.trim().length
          const width = len === 0 ? 0 : Math.min(8 + (len / 80) * 44, 52)
          return (
            <div
              key={i}
              style={{
                height: '3px',
                margin: '1px 4px',
                background: raw.trim().startsWith('//') || raw.trim().startsWith('#')
                  ? '#3a6a3a'
                  : '#3a3a3a',
                borderRadius: '1px',
                width: `${width}px`,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}