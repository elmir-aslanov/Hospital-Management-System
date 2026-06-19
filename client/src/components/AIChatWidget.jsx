import { useState, useRef, useEffect } from 'react'
import { Sparkles, X, Send } from 'lucide-react'
import api from '../api/axios'
import { useBreakpoint } from '../hooks/useBreakpoint'

const TEAL  = '#00848e'
const NAVY  = '#0a1628'
const BORDER = '#E2E8F0'
const MUTED  = '#64748B'
const FONT  = "'Source Sans 3', sans-serif"

const GREETING =
  'Salam! Aslan Medical Center-ə xoş gəlmisiniz. Həkimlər, şöbələr, ' +
  'randevu və digər məsələlərdə sizə kömək edə bilərəm. Nə öyrənmək ' +
  'istəyirsiniz?'

const FALLBACK_ERROR =
  'Hal-hazırda cavab vermək mümkün olmadı. Zəhmət olmasa bir az sonra ' +
  'yenidən cəhd edin.'

function TypingIndicator() {
  return (
    <div style={{
      alignSelf: 'flex-start', display: 'flex', gap: 4,
      background: 'white', border: `1px solid ${BORDER}`, borderRadius: 14,
      padding: '11px 14px',
    }}>
      {[0, 1, 2].map((i) => (
        <span key={i} className="ai-chat-dot" style={{
          width: 6, height: 6, borderRadius: '50%', background: MUTED,
          animationDelay: `${i * 0.15}s`,
        }} />
      ))}
    </div>
  )
}

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

    const nextMessages = [...messages, { role: 'user', content: text }]
    setMessages(nextMessages)
    setInput('')
    setSending(true)

    try {
      const res = await api.post('/ai/chat', { messages: nextMessages })
      const reply = res.data?.data?.response || FALLBACK_ERROR
      setMessages((m) => [...m, { role: 'assistant', content: reply }])
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: FALLBACK_ERROR }])
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
    <>
      {/* Chat modal */}
      {open && (
        <div
          style={{
            position: 'fixed',
            right: isMobile ? '16px' : '24px',
            bottom: isMobile ? '196px' : '166px',
            left: isMobile ? '16px' : 'auto',
            width: isMobile ? 'auto' : '380px',
            height: isMobile ? '60vh' : '500px',
            zIndex: 9996,
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 50px rgba(10,22,40,0.25)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: FONT,
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Aslan Medical AI söhbət"
        >
          {/* Header */}
          <div style={{
            background: TEAL, color: 'white', padding: '14px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Aslan Medical AI</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Bağla"
              style={{
                background: 'none', border: 'none', color: 'white', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 2,
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div ref={listRef} style={{
            flex: 1, overflowY: 'auto', padding: '14px', background: '#f8fafc',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: m.role === 'user' ? TEAL : 'white',
                color: m.role === 'user' ? 'white' : NAVY,
                border: m.role === 'user' ? 'none' : `1px solid ${BORDER}`,
                borderRadius: 14,
                padding: '10px 14px',
                fontSize: 13.5,
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
              }}>
                {m.content}
              </div>
            ))}
            {sending && <TypingIndicator />}
          </div>

          {/* Input */}
          <div style={{
            display: 'flex', gap: 8, padding: '10px', background: 'white',
            borderTop: `1px solid ${BORDER}`, flexShrink: 0,
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Sualınızı yazın..."
              style={{
                flex: 1, border: `1px solid ${BORDER}`, borderRadius: 9,
                padding: '10px 12px', fontSize: 13.5, outline: 'none',
                fontFamily: 'inherit', color: NAVY, boxSizing: 'border-box',
              }}
            />
            <button
              onClick={send}
              disabled={sending || !input.trim()}
              aria-label="Göndər"
              style={{
                border: 'none',
                background: sending || !input.trim() ? '#94a3b8' : TEAL,
                color: 'white', borderRadius: 9, width: 40, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: sending || !input.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              <Send size={17} />
            </button>
          </div>
        </div>
      )}

      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="AI ilə soruşun"
        style={{
          position: 'fixed',
          right: isMobile ? '16px' : '24px',
          bottom: isMobile ? '144px' : '106px',
          zIndex: 9995,
          background: TEAL,
          color: 'white',
          border: 'none',
          borderRadius: '999px',
          padding: isMobile ? '11px 16px' : '13px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontFamily: FONT,
          fontSize: isMobile ? 13 : 14,
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 10px 25px rgba(0,132,142,0.35), 0 4px 10px rgba(0,0,0,0.12)',
        }}
      >
        <Sparkles size={18} />
        AI ilə soruşun
      </button>

      <style>{`
        @keyframes ai-chat-dot-pulse {
          0%, 60%, 100% { opacity: 0.3; transform: scale(0.85); }
          30% { opacity: 1; transform: scale(1); }
        }
        .ai-chat-dot {
          display: inline-block;
          animation: ai-chat-dot-pulse 1.2s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}
