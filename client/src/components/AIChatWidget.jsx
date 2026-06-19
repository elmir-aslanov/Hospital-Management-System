import { useState, useRef, useEffect } from 'react'
import { Sparkles, X, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '../api/axios'
import { useBreakpoint } from '../hooks/useBreakpoint'

const AI_BLUE = 'var(--aslan-ai-blue)'
const NAVY   = '#0a1628'
const BORDER = '#E2E8F0'
const FONT   = "'Source Sans 3', sans-serif"

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
  const { t } = useTranslation()
  const { isMobile } = useBreakpoint()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState(() => [
    { role: 'assistant', content: t('aiChat.greeting') },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef(null)

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, sending])

  // Lets other parts of the public site (e.g. the header "AI köməkçi" button)
  // open this same widget instance instead of building a parallel chat UI.
  useEffect(() => {
    const openChat = () => setOpen(true)
    window.addEventListener('aslan:open-ai-chat', openChat)
    return () => window.removeEventListener('aslan:open-ai-chat', openChat)
  }, [])

  const send = async () => {
    const text = input.trim()
    if (!text || sending) return

    const nextMessages = [...messages, { role: 'user', content: text }]
    setMessages(nextMessages)
    setInput('')
    setSending(true)

    try {
      const res = await api.post('/ai/chat', { messages: nextMessages })
      const reply = res.data?.data?.response || t('aiChat.fallbackError')
      setMessages((m) => [...m, { role: 'assistant', content: reply }])
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: t('aiChat.fallbackError') }])
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
            bottom: isMobile ? '144px' : '106px',
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
          aria-label={t('aiChat.dialogLabel')}
        >
          {/* Header */}
          <div style={{
            background: AI_BLUE, color: 'white', padding: '14px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} />
              <span style={{ fontWeight: 700, fontSize: 15 }}>{t('aiChat.title')}</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label={t('aiChat.close')}
              className="ai-chat-close"
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
                background: m.role === 'user' ? AI_BLUE : 'white',
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
              placeholder={t('aiChat.placeholder')}
              style={{
                flex: 1, border: `1px solid ${BORDER}`, borderRadius: '999px',
                padding: '8px 16px', fontSize: 13.5, outline: 'none',
                fontFamily: 'inherit', color: NAVY, boxSizing: 'border-box',
              }}
            />
            <button
              onClick={send}
              disabled={sending || !input.trim()}
              aria-label={t('aiChat.send')}
              className="ai-chat-send"
              style={{
                border: 'none',
                background: sending || !input.trim() ? 'var(--aslan-ai-blue-disabled)' : AI_BLUE,
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

      <style>{`
        @keyframes ai-chat-dot-pulse {
          0%, 60%, 100% { opacity: 0.3; transform: scale(0.85); }
          30% { opacity: 1; transform: scale(1); }
        }
        .ai-chat-dot {
          display: inline-block;
          animation: ai-chat-dot-pulse 1.2s ease-in-out infinite;
        }
        .ai-chat-input:focus {
          border-color: var(--aslan-ai-blue-dark) !important;
          box-shadow: 0 0 0 3px var(--aslan-ai-blue-ring);
        }
        .ai-chat-send:not(:disabled):hover,
        .ai-chat-send:not(:disabled):focus-visible {
          background: var(--aslan-ai-blue-dark) !important;
        }
        .ai-chat-send:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px var(--aslan-ai-blue-ring);
        }
        .ai-chat-close:focus-visible {
          outline: 2px solid white;
          outline-offset: 2px;
        }
        .ai-chat-close:hover {
          background: rgba(255,255,255,0.14) !important;
        }
      `}</style>
    </>
  )
}
