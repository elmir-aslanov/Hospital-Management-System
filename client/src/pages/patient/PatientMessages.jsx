import { useState, useEffect, useRef } from 'react'
import api from '../../api/axios'

const TEAL = '#00848e'
const NAVY = '#0a1628'
const FONT = "'Source Sans 3', sans-serif"

export default function PatientMessages() {
  const [doctors,  setDoctors]  = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [text,     setText]     = useState('')
  const [sending,  setSending]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const bottomRef = useRef()

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // Load doctors list
  useEffect(() => {
    api.get('/doctors/public/all')
      .then(r => setDoctors(r.data?.data || []))
      .catch(() => {})
  }, [])

  // Load messages when doctor selected
  useEffect(() => {
    if (!selected) return
    setLoading(true)
    api.get(`/messages/${selected.userId?._id || selected._id}`)
      .then(r => {
        setMessages(r.data?.data || [])
        api.patch(`/messages/${selected.userId?._id || selected._id}/read`).catch(() => {})
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selected])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!text.trim() || !selected) return
    setSending(true)
    try {
      const doctorUserId = selected.userId?._id || selected._id
      const r = await api.post(`/messages/${doctorUserId}`, { text: text.trim() })
      setMessages(prev => [...prev, r.data?.data || r.data])
      setText('')
    } catch {}
    finally { setSending(false) }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', fontFamily: FONT, paddingTop: 130 }}>

      {/* LEFT — Doctor list */}
      <div style={{ width: 280, background: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: NAVY }}>Mesajlar</h3>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>Həkimlərlə əlaqə</p>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {doctors.map(d => {
            const name     = d.userId?.fullName || '—'
            const spec     = d.specialization || ''
            const isActive = selected?._id === d._id
            return (
              <div key={d._id} onClick={() => setSelected(d)}
                style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #f8fafc', background: isActive ? '#f0fafb' : 'white', borderLeft: isActive ? `3px solid ${TEAL}` : '3px solid transparent', transition: 'all 0.15s' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${TEAL}, ${NAVY})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
                  {name[0].toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: NAVY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Dr. {name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{spec}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* RIGHT — Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {!selected ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: '#94a3b8' }}>
            <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p style={{ fontSize: 14, fontWeight: 500 }}>Həkim seçin</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div style={{ padding: '14px 20px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg, ${TEAL}, ${NAVY})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 700 }}>
                {(selected.userId?.fullName || '?')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Dr. {selected.userId?.fullName || '—'}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{selected.specialization}</div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
                  <div style={{ width: 28, height: 28, border: '3px solid #e2e8f0', borderTopColor: TEAL, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, marginTop: 32 }}>
                  Hələ mesaj yoxdur. İlk mesajı siz göndərin.
                </div>
              ) : messages.map((m, i) => {
                const isMine = m.senderId?._id === user._id || m.senderId === user._id
                return (
                  <div key={m._id || i} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '68%', padding: '10px 14px', borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: isMine ? TEAL : 'white', color: isMine ? 'white' : NAVY, fontSize: 13, lineHeight: 1.5, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                      {m.text}
                      <div style={{ fontSize: 10, color: isMine ? 'rgba(255,255,255,0.6)' : '#94a3b8', marginTop: 4, textAlign: 'right' }}>
                        {m.createdAt ? new Date(m.createdAt).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '12px 16px', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                placeholder="Mesaj yazın... (Enter göndər)"
                rows={1}
                style={{ flex: 1, border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 13, fontFamily: FONT, outline: 'none', resize: 'none', maxHeight: 100, lineHeight: 1.5 }}
                onFocus={e => e.target.style.borderColor = TEAL}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
              <button onClick={send} disabled={sending || !text.trim()}
                style={{ width: 42, height: 42, borderRadius: 10, border: 'none', background: sending || !text.trim() ? '#e2e8f0' : TEAL, color: 'white', cursor: sending || !text.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
