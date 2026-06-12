import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PageLoader() {
  const [visible, setVisible] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setProgress(0)
    setVisible(true)
    const duration = 600
    const steps = 30
    const stepTime = duration / steps
    let current = 0

    const interval = setInterval(() => {
      current++
      setProgress(Math.min((current / steps) * 100, 100))
      if (current >= steps) {
        clearInterval(interval)
        setTimeout(() => setVisible(false), 200)
      }
    }, stepTime)

    return () => clearInterval(interval)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{
            position: 'fixed', inset: 0,
            zIndex: 99999,
            background: 'linear-gradient(135deg, #030912 0%, #0a1f3a 50%, #0d2d4a 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Animated background circles */}
          <div style={{
            position: 'absolute', inset: 0,
            overflow: 'hidden', pointerEvents: 'none',
          }}>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.08, 0.15] }}
                transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.8 }}
                style={{
                  position: 'absolute',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(0,188,212,0.2) 0%, transparent 70%)',
                  width: `${300 + i * 150}px`,
                  height: `${300 + i * 150}px`,
                  top: `${20 + i * 15}%`,
                  right: `${10 + i * 10}%`,
                  transform: 'translate(50%, -50%)',
                }}
              />
            ))}
          </div>

          {/* Subtle grid */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `
              linear-gradient(rgba(0,188,212,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,188,212,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          }} />

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ marginBottom: '40px', textAlign: 'center' }}
          >
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <img
                src="/logonew.jpg"
                alt="Aslan Medical Clinic"
                style={{
                  height: '90px',
                  maxWidth: '320px',
                  width: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 24px rgba(0,188,212,0.35))',
                  display: 'block',
                  margin: '0 auto',
                }}
              />
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                style={{
                  height: '2px',
                  width: '120px',
                  margin: '12px auto 0',
                  background: 'linear-gradient(90deg, transparent, #00BCD4, transparent)',
                  borderRadius: '1px',
                }}
              />
            </div>
          </motion.div>

          {/* ECG / Heartbeat animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ marginBottom: '40px' }}
          >
            <svg viewBox="0 0 300 60" width="300" height="60" style={{ overflow: 'visible' }}>
              <motion.path
                d="M0,30 L50,30 L65,30 L75,8 L90,52 L105,15 L115,30 L165,30 L180,30 L190,8 L205,52 L220,15 L230,30 L300,30"
                fill="none"
                stroke="#00BCD4"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  pathLength: { duration: 1.5, repeat: Infinity, ease: 'linear', repeatDelay: 0.5 },
                  opacity: { duration: 0.3 },
                }}
              />
              <motion.path
                d="M0,30 L50,30 L65,30 L75,8 L90,52 L105,15 L115,30 L165,30 L180,30 L190,8 L205,52 L220,15 L230,30 L300,30"
                fill="none"
                stroke="#00BCD4"
                strokeWidth="6"
                strokeLinecap="round"
                opacity={0.15}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', repeatDelay: 0.5 }}
              />
            </svg>
          </motion.div>

          {/* Loading text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.45)',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              fontFamily: 'Raleway, sans-serif',
              marginBottom: '24px',
            }}
          >
            Yüklənir...
          </motion.p>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              width: '220px',
              height: '3px',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #00848e, #00BCD4)',
                borderRadius: '2px',
                width: `${Math.min(progress, 100)}%`,
                transition: 'width 0.12s ease',
              }}
            />
          </motion.div>

          {/* Percentage */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.25)',
              marginTop: '10px',
              fontFamily: 'Raleway, sans-serif',
              letterSpacing: '1px',
            }}
          >
            {Math.min(Math.round(progress), 100)}%
          </motion.p>

          {/* Bottom tagline */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{
              position: 'absolute',
              bottom: '32px',
              fontSize: '12px',
              color: 'rgba(255,255,255,0.2)',
              letterSpacing: '2px',
              fontFamily: 'Raleway, sans-serif',
            }}
          >
            SAĞLAMLIĞINIZ — PRİORİTETİMİZ
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
