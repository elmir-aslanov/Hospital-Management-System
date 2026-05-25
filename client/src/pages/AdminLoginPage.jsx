import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"
const TABS = ['Admin', 'Staff', 'Həkim']

const ROLE_MAP = {
  Admin: ['ADMIN', 'SUPER_ADMIN'],
  Staff: ['NURSE', 'RECEPTIONIST', 'LAB_TECHNICIAN'],
  Həkim: ['DOCTOR'],
}

const ROLE_ERROR = {
  Admin: 'Bu hesab admin deyil',
  Staff: 'Bu hesab staff deyil',
  Həkim: 'Bu hesab həkim deyil',
}

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState('Admin')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Xəta baş verdi')

      const user = data.data.user
      const allowedRoles = ROLE_MAP[selectedRole]

      if (!allowedRoles.includes(user.role)) {
        setError(ROLE_ERROR[selectedRole])
        setLoading(false)
        return
      }

      localStorage.setItem('adminToken', data.data.accessToken)
      localStorage.setItem('adminUser', JSON.stringify(user))

      if (user.role === 'DOCTOR') {
        navigate('/doctor/dashboard')
      } else {
        navigate('/admin/dashboard')
      }
    } catch (err) {
      setError(err.message === ROLE_ERROR[selectedRole] ? err.message : 'E-poçt və ya şifrə yanlışdır')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px', border: '1px solid #ddd',
    borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box',
    fontFamily: FONT, outline: 'none', marginBottom: '16px',
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a1628',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: FONT,
    }}>
      <div style={{
        background: 'white', borderRadius: '16px', padding: '48px',
        width: '420px', maxWidth: '90vw',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <img src="/logo.png" alt="Aslan Medical" style={{ height: '48px', display: 'block', margin: '0 auto 8px' }} />

        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0a1628', textAlign: 'center', marginBottom: '4px' }}>
          Sistem Girişi
        </h2>
        <p style={{ fontSize: '13px', color: '#888', textAlign: 'center', marginBottom: '24px' }}>
          Hesabınızı seçin
        </p>

        {/* Role tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {TABS.map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => { setSelectedRole(tab); setError('') }}
              style={{
                flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer',
                fontSize: '13px', fontWeight: 500, fontFamily: FONT,
                border: selectedRole === tab ? '1px solid #00848e' : '1px solid #ddd',
                background: selectedRole === tab ? '#00848e' : 'white',
                color: selectedRole === tab ? 'white' : '#555',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="E-poçt ünvanı"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle}
            required
          />
          <input
            type="password"
            placeholder="Şifrə"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={inputStyle}
            required
          />

          {error && (
            <p style={{ color: '#e53e3e', fontSize: '13px', marginBottom: '12px' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', background: loading ? '#aaa' : '#00848e',
              color: 'white', border: 'none', padding: '14px',
              borderRadius: '8px', fontSize: '15px', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: FONT,
            }}
          >
            {loading ? 'Yüklənir...' : 'Daxil ol'}
          </button>
        </form>
      </div>
    </div>
  )
}
