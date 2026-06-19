import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../api/axios'
import { useBreakpoint } from '../../hooks/useBreakpoint'

const NAVY = '#0a1628'
const TEAL = '#00848e'
const FONT = "'Source Sans 3', sans-serif"

const GREETING = 'Salam! Mən Aslan AI-yam — Aslan Medical Clinic-in süni intellekt köməkçisi. Sizə necə kömək edə bilərəm?'
const FALLBACK_ERROR = 'Hal-hazırda cavab vermək mümkün olmadı. Zəhmət olmasa bir az sonra yenidən cəhd edin və ya +994 50 836 36 94 nömrəsinə zəng edin.'

export default function AIChatWidget() {
  const { isMobile } = useBreakpoint()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'assistant', content: GREETING }])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef(null)

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, sending])

  const send = async () => {
    const text = input.trim()
    if (!text || sending) return
    setMessages(m => [...m, { role: 'user', content: text }])
    setInput('')
    setSending(true)
    try {
      const res = await api.post('/ai/medical-consult', { message: text })
      const reply = res.data?.data?.response || FALLBACK_ERROR
      setMessages(m => [...m, { role: 'assistant', content: reply }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: FALLBACK_ERROR }])
    } finally {
      setSending(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div style={{
      position: 'fixed',
      left: isMobile ? '16px' : '24px',
      bottom: isMobile ? '80px' : '32px',
      zIndex: 9990,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '10px',
      fontFamily: FONT,
    }}>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              width: isMobile ? 'calc(100vw - 32px)' : '340px',
              maxWidth: '92vw',
              height: '440px',
              maxHeight: '70vh',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.22)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{ background: NAVY, color: 'white', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Aslan AI</div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>Tibbi köməkçi</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Bağla"
                style={{ background: 'none', border: 'none', color: 'white', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>

            {/* Messages */}
            <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: 10, background: '#f8fafc' }}>
              {messages.map((m, i) => (
                <div key={i} style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: m.role === 'user' ? TEAL : 'white',
                  color: m.role === 'user' ? 'white' : '#1f2937',
                  border: m.role === 'user' ? 'none' : '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '9px 13px',
                  fontSize: 13.5,
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                }}>
                  {m.content}
                </div>
              ))}
              {sending && (
                <div style={{ alignSelf: 'flex-start', background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: '9px 13px', fontSize: 13, color: '#94a3b8' }}>
                  Yazır...
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{ display: 'flex', gap: 8, padding: '10px', borderTop: '1px solid #f1f5f9', background: 'white', flexShrink: 0 }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Sualınızı yazın..."
                rows={1}
                style={{ flex: 1, resize: 'none', border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 13, outline: 'none', fontFamily: 'inherit', maxHeight: 80, boxSizing: 'border-box' }}
              />
              <button onClick={send} disabled={sending || !input.trim()}
                style={{
                  border: 'none',
                  background: sending || !input.trim() ? '#94a3b8' : TEAL,
                  color: 'white', borderRadius: 9, padding: '0 16px', fontSize: 13, fontWeight: 700,
                  cursor: sending || !input.trim() ? 'not-allowed' : 'pointer',
                }}>
                Göndər
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle bubble */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label="AI Chat"
        style={{
          width: isMobile ? '50px' : '58px',
          height: isMobile ? '50px' : '58px',
          borderRadius: '50%',
          border: 'none',
          background: `linear-gradient(135deg, ${TEAL} 0%, #006b74 100%)`,
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,132,142,0.35)',
        }}
      >
        {open ? (
          <span style={{ fontSize: 24, lineHeight: 1 }}>×</span>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </motion.button>
    </div>
  )
}
