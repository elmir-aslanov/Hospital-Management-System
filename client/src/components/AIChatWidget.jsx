import { useState, useRef, useEffect } from 'react'
import { Sparkles, X, Send } from 'lucide-react'
import api from '../api/axios'
import { useBreakpoint } from '../hooks/useBreakpoint'

const PURPLE = '#7C3AED'
const NAVY   = '#0a1628'
const BORDER = '#E2E8F0'
const FONT   = "'Source Sans 3', sans-serif"

const GREETING =
  'Salam! 👋 Aslan Medical Center-ə xoş gəlmisiniz. Həkimlər, şöbələr, ' +
  'randevu və digər məsələlərdə sizə kömək edə bilərəm.'

const FALLBACK_ERROR =
  'Hal-hazırda cavab vermək mümkün olmadı. Zəhmət olmasa bir az sonra ' +
  'yenidən cəhd edin.'

function TypingIndicator() {
  return (
    <div style={{
      alignSelf: 'flex-start', display: 'flex', gap: 4,
      background: 'white', border: `1px solid ${BORDER}`,
      borderRadius: '4px 16px 16px 16px',
      padding: '12px 14px',
    }}>
      {[0, 1, 2].map((i) => (
        <span key={i} className="ai-chat-dot" style={{
          width: 6, height: 6, borderRadius: '50%', background: '#94a3b8',
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
    if (e.key === 'Enter') {
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
            right: isMobile ? 0 : '24px',
            left: isMobile ? 0 : 'auto',
            bottom: isMobile ? '196px' : '166px',
            width: isMobile ? '100%' : '370px',
            height: isMobile ? '60vh' : '520px',
            zIndex: 9996,
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
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
            background: PURPLE, color: 'white', padding: '14px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} />
              <span style={{ fontWeight: 700, fontSize: 15 }}>Aslan Medical AI</span>
            </div>
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
            flex: 1, overflowY: 'auto', padding: '16px',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: m.role === 'user' ? PURPLE : 'white',
                color: m.role === 'user' ? 'white' : NAVY,
                border: m.role === 'user' ? 'none' : `1px solid ${BORDER}`,
                borderRadius: m.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
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

          {/* Footer */}
          <div style={{
            display: 'flex', gap: 8, padding: '12px', background: 'white',
            borderTop: `1px solid ${BORDER}`, flexShrink: 0,
          }}>
            <input
              type="text"
              className="ai-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Sualınızı yazın..."
              style={{
                flex: 1, border: `1px solid ${BORDER}`, borderRadius: '999px',
                padding: '8px 16px', fontSize: 13.5, outline: 'none',
                fontFamily: 'inherit', color: NAVY, boxSizing: 'border-box',
              }}
            />
            <button
              onClick={send}
              disabled={sending || !input.trim()}
              aria-label="Göndər"
              style={{
                border: 'none',
                background: sending || !input.trim() ? '#c4b5fd' : PURPLE,
                color: 'white', borderRadius: '999px', width: 38, height: 38, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: sending || !input.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Ask AI"
        className="ai-ask-btn"
        style={{
          position: 'fixed',
          right: isMobile ? '16px' : '24px',
          bottom: isMobile ? '144px' : '106px',
          zIndex: 9995,
          background: 'white',
          color: PURPLE,
          border: `1.5px solid ${PURPLE}`,
          borderRadius: '999px',
          padding: isMobile ? '9px 16px' : '10px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          fontFamily: FONT,
          fontSize: isMobile ? 13 : 14,
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          transition: 'all 0.2s ease',
        }}
      >
        <Sparkles size={17} />
        Ask AI
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
        .ai-ask-btn:hover {
          background: ${PURPLE} !important;
          color: white !important;
        }
        .ai-chat-input:focus {
          border-color: ${PURPLE} !important;
        }
      `}</style>
    </>
  )
}
