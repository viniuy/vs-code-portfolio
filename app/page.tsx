'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/sidebar/Sidebar'
import TabBar from '@/components/tabs/TabBar'
import CodeEditor from '@/components/editor/CodeEditor'
import Terminal from '@/components/terminal/Terminal'
import WelcomeModal from '@/components/welcome/WelcomeModal'
import GitPanel from '@/components/sidebar/GitPanel'
import { RunBuildProvider } from '@/components/editor/RunBuildContext'
import { useEditor } from '@/components/editor/EditorContext'
import { FileKey } from '@/types'
import { allTabs } from '@/data/files'
import MobileLayout from '@/components/mobile/MobileLayout'
import { useIsMobile } from '@/hooks/useIsMobile'

const menuItems = ['File', 'Edit', 'View', 'Go', 'Run', 'Terminal', 'Help']

const menuDropdowns: Record<string, { label: string; shortcut?: string; divider?: boolean; action?: string }[]> = {
  File: [
    { label: 'New File', shortcut: '⌘N' },
    { label: 'Open File...', shortcut: '⌘O' },
    { divider: true, label: '' },
    { label: 'readme — README.md', action: 'readme' },
    { label: 'projects — projects.tsx', action: 'projects' },
    { divider: true, label: '' },
    { label: 'Close Editor', shortcut: '⌘W' },
  ],
  Edit: [
    { label: 'Undo', shortcut: '⌘Z' },
    { label: 'Redo', shortcut: '⌘⇧Z' },
    { divider: true, label: '' },
    { label: 'Find', shortcut: '⌘F' },
    { label: 'Replace', shortcut: '⌘H' },
  ],
  View: [
    { label: 'Explorer', shortcut: '⌘⇧E', action: 'explorer' },
    { label: 'Search', shortcut: '⌘⇧F', action: 'search' },
    { label: 'Source Control', shortcut: '⌃⇧G', action: 'git' },
    { divider: true, label: '' },
    { label: 'Terminal', shortcut: '⌃`', action: 'terminal' },
    { label: 'Word Wrap', shortcut: '⌥Z' },
  ],
  Go: [
    { label: 'Go to File...', shortcut: '⌘P' },
    { label: 'Go to Line...', shortcut: '⌃G' },
    { divider: true, label: '' },
    { label: 'Back', shortcut: '⌃-' },
    { label: 'Forward', shortcut: '⌃⇧-' },
  ],
  Run: [
    { label: '▶ Start Debugging', shortcut: 'F5' },
    { label: 'Run Without Debugging', shortcut: '⌃F5' },
    { divider: true, label: '' },
    { label: 'Add Configuration...' },
  ],
  Terminal: [
    { label: 'New Terminal', shortcut: '⌃`', action: 'terminal' },
    { label: 'Split Terminal' },
    { divider: true, label: '' },
    { label: 'Clear Terminal', action: 'clearterm' },
  ],
  Help: [
    { label: 'Welcome', action: 'welcome' },
    { label: 'Take a Tour', action: 'tour' },
    { divider: true, label: '' },
    { label: 'GitHub ↗', action: 'github' },
    { label: 'LinkedIn ↗', action: 'linkedin' },
    { label: 'Email Me ↗', action: 'email' },
  ],
}

const activityIcons = [
  { icon: 'ti-files',      id: 'explorer', title: 'Explorer',       panel: 'explorer' },
  { icon: 'ti-search',     id: 'search',   title: 'Search',         panel: 'search'   },
  { icon: 'ti-git-branch', id: 'git',      title: 'Source Control', panel: 'git'      },
  { icon: 'ti-puzzle',     id: 'ext',      title: 'Extensions',     panel: 'ext'      },
]

function PageInner() {
  const [showWelcome, setShowWelcome] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [activePanel, setActivePanel] = useState<string>('explorer')
  const { openFile } = useEditor()
  const isMobile = useIsMobile()

  useEffect(() => {
    const seen = localStorage.getItem('vince-portfolio-welcomed')
    if (!seen) {
      setTimeout(() => setShowWelcome(true), 600)
      localStorage.setItem('vince-portfolio-welcomed', '1')
    }
  }, [])

  if (isMobile) {
    return <MobileLayout showWelcome={showWelcome} setShowWelcome={setShowWelcome} />
  }

  function handleMenuAction(action?: string) {
    setOpenMenu(null)
    if (!action) return
    if (allTabs.some((t) => t.key === action)) {
      openFile(action as FileKey)
    } else if (action === 'explorer') setActivePanel('explorer')
    else if (action === 'search')   setActivePanel('search')
    else if (action === 'git')      setActivePanel('git')
    else if (action === 'terminal') document.getElementById('terminal-input')?.focus()
    else if (action === 'clearterm') window.dispatchEvent(new CustomEvent('clearterm'))
    else if (action === 'welcome')  { setShowWelcome(true); localStorage.removeItem('vince-portfolio-welcomed') }
    else if (action === 'tour')     { setShowWelcome(true); localStorage.removeItem('vince-portfolio-welcomed') }
    else if (action === 'github')   window.open('https://github.com/viniuy', '_blank')
    else if (action === 'linkedin') window.open('https://www.linkedin.com/in/vincentenolpe/', '_blank')
    else if (action === 'email')    window.open('mailto:vincent.enolpe@gmail.com', '_blank')
  }

  return (
    <RunBuildProvider>
      <div
        style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden', background: '#1e1e1e', color: '#d4d4d4', fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: '13px' }}
        onClick={() => setOpenMenu(null)}
      >
        {/* Title bar */}
        <div style={{ height: '30px', background: '#323233', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '6px', flexShrink: 0, userSelect: 'none' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28c840' }} />
          <div style={{ flex: 1, textAlign: 'center', fontSize: '11px', color: '#9d9d9d' }}>
            vincent-portfolio — Visual Studio Code
          </div>
        </div>

        {/* Menu bar */}
        <div
          style={{ height: '24px', background: '#323233', borderBottom: '1px solid #252526', display: 'flex', alignItems: 'center', padding: '0 8px', gap: '2px', flexShrink: 0, position: 'relative', zIndex: 200 }}
          onClick={(e) => e.stopPropagation()}
        >
          {menuItems.map((item) => (
            <div key={item} style={{ position: 'relative' }}>
              <div
                onClick={() => setOpenMenu(openMenu === item ? null : item)}
                style={{
                  padding: '2px 8px', fontSize: '11px', color: openMenu === item ? '#fff' : '#bdbdbd',
                  cursor: 'pointer', borderRadius: '3px', background: openMenu === item ? '#3a3a3a' : 'transparent',
                  userSelect: 'none',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#3a3a3a'; if (openMenu && openMenu !== item) setOpenMenu(item) }}
                onMouseLeave={(e) => { if (openMenu !== item) e.currentTarget.style.background = 'transparent' }}
              >
                {item}
              </div>
              {openMenu === item && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, minWidth: '220px',
                  background: '#252526', border: '1px solid #3a3a3a', borderRadius: '4px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)', padding: '4px 0', zIndex: 300,
                }}>
                  {(menuDropdowns[item] || []).map((entry, i) =>
                    entry.divider ? (
                      <div key={i} style={{ height: '1px', background: '#3a3a3a', margin: '4px 0' }} />
                    ) : (
                      <div
                        key={i}
                        onClick={() => handleMenuAction(entry.action)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '5px 16px', fontSize: '12px', color: '#ccc', cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#094771'; e.currentTarget.style.color = '#fff' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ccc' }}
                      >
                        <span>{entry.label}</span>
                        {entry.shortcut && <span style={{ color: '#666', fontSize: '11px', marginLeft: '24px' }}>{entry.shortcut}</span>}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <TabBar />

        {/* Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Activity bar */}
          <div style={{ width: '48px', background: '#333333', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 0', gap: '4px', flexShrink: 0 }}>
            {activityIcons.map((item) => (
              <div
                key={item.id}
                title={item.title}
                onClick={() => setActivePanel(activePanel === item.panel ? '' : item.panel)}
                style={{
                  width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', borderRadius: '4px', position: 'relative',
                  color: activePanel === item.panel ? '#fff' : '#858585',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#fff' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = activePanel === item.panel ? '#fff' : '#858585' }}
              >
                {activePanel === item.panel && (
                  <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '2px', height: '24px', background: '#fff', borderRadius: '0 2px 2px 0' }} />
                )}
                <i className={`ti ${item.icon}`} style={{ fontSize: '22px' }} aria-hidden="true" />
              </div>
            ))}
            <div
              title="Help / Tour"
              onClick={() => { setShowWelcome(true); localStorage.removeItem('vince-portfolio-welcomed') }}
              style={{ marginTop: 'auto', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#858585' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#858585')}
            >
              <i className="ti ti-help-circle" style={{ fontSize: '22px' }} aria-hidden="true" />
            </div>
            <div
              title="Profile"
              style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#858585' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#858585')}
            >
              <i className="ti ti-user-circle" style={{ fontSize: '22px' }} aria-hidden="true" />
            </div>
          </div>

          {/* Sidebar — hidden when panel is toggled off */}
          {activePanel === 'explorer' && (
            <div id="file-explorer">
              <Sidebar />
            </div>
          )}
          {activePanel === 'search' && (
            <div style={{ width: '220px', background: '#252526', borderRight: '1px solid #1e1e1e', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '10px 12px', fontSize: '11px', color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Search</div>
              <input placeholder="Search files..." style={{ margin: '0 10px', padding: '5px 8px', background: '#3a3a3a', border: '1px solid #555', borderRadius: '3px', color: '#ccc', fontSize: '12px', outline: 'none' }} />
              <div style={{ padding: '12px', fontSize: '11px', color: '#555' }}>Type to search across files.</div>
            </div>
          )}
          {activePanel === 'git' && (
            <div style={{ width: '220px', background: '#252526', borderRight: '1px solid #1e1e1e', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '10px 12px', fontSize: '11px', color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Source Control</div>
              <GitPanel />
            </div>
          )}
          {activePanel === 'ext' && (
            <div style={{ width: '220px', background: '#252526', borderRight: '1px solid #1e1e1e', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '10px 12px', fontSize: '11px', color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Extensions</div>
              <div style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { name: 'Prettier', desc: 'Code formatter', color: '#f7b93e' },
                  { name: 'ESLint', desc: 'Linting support', color: '#4b32c3' },
                  { name: 'Tailwind CSS', desc: 'IntelliSense', color: '#38bdf8' },
                  { name: 'Claude AI', desc: 'AI assistant', color: '#23d18b' },
                  { name: 'GitLens', desc: 'Git supercharged', color: '#e05252' },
                ].map((ext) => (
                  <div key={ext.name} style={{ padding: '8px', borderRadius: '4px', cursor: 'pointer' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#2a2d2e')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <div style={{ fontSize: '12px', color: '#ccc', fontWeight: 500 }}>{ext.name}</div>
                    <div style={{ fontSize: '10px', color: '#555' }}>{ext.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main editor area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div id="code-editor" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <CodeEditor />
            </div>
            <div id="terminal-panel">
              <Terminal />
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div style={{ height: '22px', background: '#007acc', display: 'flex', alignItems: 'center', padding: '0 10px', gap: '14px', flexShrink: 0 }}>
          <div style={{ fontSize: '11px', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.9 }}>
            <i className="ti ti-git-branch" style={{ fontSize: '13px' }} aria-hidden="true" /> main
          </div>
          <div style={{ fontSize: '11px', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.9 }}>
            <i className="ti ti-check" style={{ fontSize: '13px' }} aria-hidden="true" /> 0 errors
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '14px' }}>
            {['TypeScript', 'UTF-8', 'Ln 1, Col 1'].map((s) => (
              <div key={s} style={{ fontSize: '11px', color: '#fff', opacity: 0.9 }}>{s}</div>
            ))}
            <div
              onClick={() => { setShowWelcome(true); localStorage.removeItem('vince-portfolio-welcomed') }}
              style={{ fontSize: '11px', color: '#fff', opacity: 0.9, cursor: 'pointer', textDecoration: 'underline' }}
              title="Show welcome / tour"
            >
              vincent.dev
            </div>
          </div>
        </div>

        {/* Welcome modal */}
        {showWelcome && <WelcomeModal onDismiss={() => setShowWelcome(false)} />}
      </div>
    </RunBuildProvider>
  )
}

export default function Home() {
  return <PageInner />
}
