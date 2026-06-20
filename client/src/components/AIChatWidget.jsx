import { useState, useRef, useEffect } from 'react'
import { Sparkles, X, Send, Square, RotateCcw, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useBreakpoint } from '../hooks/useBreakpoint'

const AI_BLUE = 'var(--aslan-ai-blue)'
const NAVY   = '#0a1628'
const BORDER = '#E2E8F0'
const FONT   = "'Source Sans 3', sans-serif"
const MAX_MESSAGE_LENGTH = 2000
const SAFE_ACTION_PATHS = ['/hekimler', '/randevu', '/services', '/departments']

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
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { isMobile } = useBreakpoint()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState(() => [
    { id: crypto.randomUUID(), role: 'assistant', content: t('aiChat.greeting') },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [conversationId, setConversationId] = useState('')
  const [lastFailedMessage, setLastFailedMessage] = useState('')
  const listRef = useRef(null)
  const abortRef = useRef(null)
  const sendingRef = useRef(false)
  const shouldAutoScrollRef = useRef(true)

  useEffect(() => {
    if (listRef.current && shouldAutoScrollRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, sending])

  useEffect(() => () => abortRef.current?.abort(), [])

  // Lets other parts of the public site (e.g. the header "AI köməkçi" button)
  // open this same widget instance instead of building a parallel chat UI.
  useEffect(() => {
    const openChat = () => setOpen(true)
    window.addEventListener('aslan:open-ai-chat', openChat)
    return () => window.removeEventListener('aslan:open-ai-chat', openChat)
  }, [])

  const send = async (overrideText) => {
    const text = String(overrideText ?? input).trim()
    if (!text || sendingRef.current) return
    if (text.length > MAX_MESSAGE_LENGTH) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: t('aiChat.errors.AI_MESSAGE_TOO_LONG'),
          error: true,
        },
      ])
      setLastFailedMessage('')
      return
    }

    const assistantId = crypto.randomUUID()
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: 'user', content: text },
      { id: assistantId, role: 'assistant', content: '', streaming: true, actions: [] },
    ])
    setInput('')
    sendingRef.current = true
    setSending(true)
    setLastFailedMessage('')
    shouldAutoScrollRef.current = true
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await api.post(
        '/ai/chat',
        {
          message: text,
          conversationId: conversationId || undefined,
          locale: ['az', 'en', 'ru'].includes(i18n.language) ? i18n.language : i18n.language?.split('-')[0],
          pageContext: { pathname: window.location.pathname },
        },
        {
          signal: controller.signal,
          silentNetworkError: true,
        },
      )
      const data = response.data?.data
      if (!data?.response) {
        const invalidResponseError = new Error('Invalid AI response')
        invalidResponseError.code = 'AI_UNAVAILABLE'
        throw invalidResponseError
      }
      setConversationId(data.conversationId || '')
      setMessages((current) => current.map((message) =>
        message.id === assistantId
          ? {
              ...message,
              content: data.response,
              streaming: false,
              actions: Array.isArray(data.actions) ? data.actions : [],
            }
          : message))
    } catch (error) {
      const wasStopped = error.name === 'CanceledError'
        || error.code === 'ERR_CANCELED'
        || error.name === 'AbortError'
      const errorCode = error.response?.data?.code
        || error.code
        || (error.response?.status === 429 ? 'AI_RATE_LIMITED' : 'AI_UNAVAILABLE')
      setLastFailedMessage(wasStopped ? '' : text)
      setMessages((current) => current.map((message) =>
        message.id === assistantId
          ? {
              ...message,
              streaming: false,
              error: !wasStopped,
              content: message.content || (wasStopped ? t('aiChat.stopped') : t(`aiChat.errors.${errorCode}`, {
                defaultValue: t('aiChat.fallbackError'),
              })),
            }
          : message))
    } finally {
      sendingRef.current = false
      setSending(false)
      abortRef.current = null
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const stop = () => abortRef.current?.abort()

  const startNewConversation = async () => {
    abortRef.current?.abort()
    sendingRef.current = false
    if (conversationId) {
      try {
        await api.post('/ai/chat/reset', { conversationId })
      } catch {
        // A reset is best-effort; clearing the opaque id starts a fresh server conversation.
      }
    }
    setConversationId('')
    setLastFailedMessage('')
    setMessages([{ id: crypto.randomUUID(), role: 'assistant', content: t('aiChat.greeting') }])
    setInput('')
  }

  const onMessagesScroll = () => {
    const element = listRef.current
    if (!element) return
    shouldAutoScrollRef.current = element.scrollHeight - element.scrollTop - element.clientHeight < 72
  }

  const openAction = (href) => {
    if (typeof href !== 'string' || !SAFE_ACTION_PATHS.some((path) => href === path || href.startsWith(`${path}/`))) return
    setOpen(false)
    navigate(href)
  }

  const hasUserMessages = messages.some((message) => message.role === 'user')
  const suggestions = t('aiChat.suggestions', { returnObjects: true })

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
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={startNewConversation}
                aria-label={t('aiChat.newConversation')}
                title={t('aiChat.newConversation')}
                className="ai-chat-close"
                style={{
                  background: 'none', border: 'none', color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4,
                }}
              >
                <RotateCcw size={17} />
              </button>
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
          </div>

          {/* Messages */}
          <div ref={listRef} onScroll={onMessagesScroll} style={{
            flex: 1, overflowY: 'auto', padding: '16px',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            {messages.map((m) => (
              <div key={m.id} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
              }}>
                <div style={{
                  background: m.role === 'user' ? AI_BLUE : 'white',
                  color: m.role === 'user' ? 'white' : NAVY,
                  border: m.role === 'user' ? 'none' : `1px solid ${m.error ? '#FCA5A5' : BORDER}`,
                  borderRadius: m.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                  padding: '10px 14px',
                  fontSize: 13.5,
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'anywhere',
                }}>
                  {m.content || (m.streaming ? t('aiChat.preparing') : '')}
                </div>
                {!!m.actions?.length && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 7 }}>
                    {m.actions.map((action) => (
                      <button
                        key={action.href}
                        type="button"
                        className="ai-chat-action"
                        onClick={() => openAction(action.href)}
                      >
                        {t(`aiChat.actions.${action.labelKey}`, { defaultValue: t('aiChat.actions.open') })}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {sending && !messages.at(-1)?.content && <TypingIndicator />}
            {!hasUserMessages && Array.isArray(suggestions) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="ai-chat-suggestion"
                    onClick={() => send(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            {lastFailedMessage && !sending && (
              <button
                type="button"
                className="ai-chat-retry"
                onClick={() => send(lastFailedMessage)}
              >
                <RefreshCw size={14} /> {t('aiChat.retry')}
              </button>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '10px 12px 9px', background: 'white', borderTop: `1px solid ${BORDER}`, flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <textarea
                rows={1}
                className="ai-chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                maxLength={MAX_MESSAGE_LENGTH + 1}
                placeholder={t('aiChat.placeholder')}
                style={{
                  flex: 1, border: `1px solid ${BORDER}`, borderRadius: '18px',
                  padding: '9px 14px', fontSize: 13.5, outline: 'none',
                  fontFamily: 'inherit', color: NAVY, boxSizing: 'border-box',
                  resize: 'none', minHeight: 38, maxHeight: 88, overflowY: 'auto',
                }}
              />
              <button
                onClick={sending ? stop : () => send()}
                disabled={!sending && !input.trim()}
                aria-label={sending ? t('aiChat.stop') : t('aiChat.send')}
                className="ai-chat-send"
                style={{
                  border: 'none',
                  background: !sending && !input.trim() ? 'var(--aslan-ai-blue-disabled)' : AI_BLUE,
                  color: 'white', borderRadius: '999px', width: 38, height: 38, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: !sending && !input.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                {sending ? <Square size={14} fill="currentColor" /> : <Send size={16} />}
              </button>
            </div>
            <div style={{ color: '#64748B', fontSize: 11, lineHeight: 1.35, marginTop: 6, textAlign: 'center' }}>
              {t('aiChat.safetyNotice')}
            </div>
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
          background: var(--aslan-ai-blue-soft);
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
        .ai-chat-suggestion,
        .ai-chat-action,
        .ai-chat-retry {
          border: 1px solid var(--aslan-ai-blue);
          background: white;
          color: var(--aslan-ai-blue-dark);
          border-radius: 999px;
          padding: 6px 10px;
          font: 600 12px/1.25 ${FONT};
          cursor: pointer;
          text-align: left;
        }
        .ai-chat-action:hover,
        .ai-chat-suggestion:hover,
        .ai-chat-retry:hover {
          background: var(--aslan-ai-blue-soft);
          border-color: var(--aslan-ai-blue-dark);
        }
        .ai-chat-action:focus-visible,
        .ai-chat-suggestion:focus-visible,
        .ai-chat-retry:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px var(--aslan-ai-blue-ring);
        }
        .ai-chat-retry {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
      `}</style>
    </>
  )
}
