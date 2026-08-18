'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { FileKey, Tab } from '@/types'
import { allTabs, defaultTabs } from '@/data/files'

interface EditorContextType {
  activeFile: FileKey
  openTabs: Tab[]
  openFile: (key: FileKey) => void
  closeTab: (key: FileKey) => void
}

const EditorContext = createContext<EditorContextType>({
  activeFile: 'readme',
  openTabs: defaultTabs,
  openFile: () => {},
  closeTab: () => {},
})

export function EditorProvider({ children }: { children: ReactNode }) {
  const [activeFile, setActiveFile] = useState<FileKey>('readme')
  const [openTabs, setOpenTabs] = useState<Tab[]>(defaultTabs)

  function openFile(key: FileKey) {
    setActiveFile(key)
    if (!openTabs.find((t) => t.key === key)) {
      const tab = allTabs.find((t) => t.key === key)
      if (tab) setOpenTabs((prev) => [...prev, tab])
    }
  }

  function closeTab(key: FileKey) {
    setOpenTabs((prev) => {
      const next = prev.filter((t) => t.key !== key)
      if (activeFile === key) {
        if (next.length > 0) {
          setActiveFile(next[next.length - 1].key)
        } else {
          // No open tabs left — reset to default `readme` so consumers stay consistent
          setActiveFile('readme')
        }
      }
      return next
    })
  }

  return (
    <EditorContext.Provider value={{ activeFile, openTabs, openFile, closeTab }}>
      {children}
    </EditorContext.Provider>
  )
}

export const useEditor = () => useContext(EditorContext)
