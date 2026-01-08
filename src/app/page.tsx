'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'

type HeartFloater = {
  id: string
  emoji: string
  fs: number
  op: number
  dur: number
  x0: number
  y0: number
  x1: number
  y1: number
  r0: number
  r1: number
}

type BurstHeart = {
  id: string
  emoji: string
  x: number
  y: number
  dx: number
  dy: number
  rot: number
  fs: number
  dur: number
  delay: number
}

type CSSVars = React.CSSProperties & {
  ['--op']?: string
  ['--dur']?: string
  ['--x0']?: string
  ['--y0']?: string
  ['--x1']?: string
  ['--y1']?: string
  ['--r0']?: string
  ['--r1']?: string
  ['--fs']?: string

  ['--x']?: string
  ['--y']?: string
  ['--dx']?: string
  ['--dy']?: string
  ['--rot']?: string
  ['--bdur']?: string
  ['--bfs']?: string
  ['--bdel']?: string
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export default function Page() {
  const heartEmojis = useMemo(() => ['❤️'], [])

  const [introOn, setIntroOn] = useState(true)
  const [introUnlocking, setIntroUnlocking] = useState(false)
  const [revealed, setRevealed] = useState(false)

  const [running, setRunning] = useState(false)
  const [hearts, setHearts] = useState<HeartFloater[]>([])
  const [bursts, setBursts] = useState<BurstHeart[]>([])

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const btnRef = useRef<HTMLButtonElement | null>(null)

  const burstCooldownRef = useRef<number>(0)
  const warmedUpRef = useRef(false)

  // Audio hazırla
  useEffect(() => {
    const audio = new Audio('/song.m4a')
    audio.loop = true
    audio.volume = 0.85
    audioRef.current = audio
  }, [])

  // INTRO: kilide dokununca sinematik reveal + audio warmup (iOS için)
  const unlock = async () => {
    if (introUnlocking) return
    setIntroUnlocking(true)

    // iOS autoplay engeline karşı "warm-up" (user gesture içinde)
    try {
      const a = audioRef.current
      if (a) {
        await a.play()
        a.pause()
        a.currentTime = 0
      }
    } catch {
      // önemli değil; kalbe basınca zaten play denenecek
    }

    // kilit dönüş animasyonu başlasın
    window.setTimeout(() => {
      setIntroOn(false)
      setRevealed(true)

      // içerik geldiğinde arka kalpleri biraz gecikmeyle başlat
      window.setTimeout(() => setRunning(true), 420)
    }, 720)
  }

  const spawnBurst = () => {
    const now = Date.now()
    if (now - burstCooldownRef.current < 550) return
    burstCooldownRef.current = now

    const el = btnRef.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 520

    const count = warmedUpRef.current
      ? (isMobile ? 105 : 150)
      : (isMobile ? 65 : 100)

    warmedUpRef.current = true

    const created: BurstHeart[] = Array.from({ length: count }).map((_, i) => {
      const a = rand(-Math.PI, Math.PI)
      const speed = rand(isMobile ? 360 : 440, isMobile ? 720 : 900)
      const dx = Math.cos(a) * rand(0.30, 0.70) * speed
      const dy = -Math.abs(Math.sin(a)) * speed - rand(300, 600)

      return {
        id: `burst-${now}-${i}-${Math.random().toString(16).slice(2)}`,
        emoji: '❤️',
        x: cx,
        y: cy,
        dx,
        dy,
        rot: rand(-120, 120),
        fs: rand(isMobile ? 20 : 22, isMobile ? 34 : 48),
        dur: rand(1900, 2600),
        delay: rand(0, 120),
      }
    })

    setBursts((prev) => [...prev, ...created])

    window.setTimeout(() => {
      const ids = new Set(created.map((b) => b.id))
      setBursts((prev) => prev.filter((b) => !ids.has(b.id)))
    }, 3200)
  }

  // Kalp aksiyonu: müzik + burst
  const start = () => {
    if (!revealed) return

    audioRef.current?.play().catch(() => {})
    requestAnimationFrame(() => spawnBurst())

    if (!running) {
      window.setTimeout(() => setRunning(true), 200)
    }
  }

  // ✅ ARKA KALPLERİ ARTIRDIK (mobil + desktop) + daha soft yaptık
  useEffect(() => {
    if (!running) return

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 520

    // önceki: mobile 34 / desktop 78
    // yeni:   mobile 46 / desktop 108  (çok abartmadan yoğunluk artışı)
    const heartCount = isMobile ? 46 : 108

    const created: HeartFloater[] = Array.from({ length: heartCount }).map((_, i) => {
      const x0 = rand(-10, 110)
      const y0 = rand(-10, 110)
      const x1 = x0 + rand(-70, 70)
      const y1 = y0 + rand(-80, 80)

      return {
        id: `heart-${Date.now()}-${i}-${Math.random().toString(16).slice(2)}`,
        emoji: '❤️',
        fs: rand(isMobile ? 16 : 18, isMobile ? 28 : 40),

        // ✅ op artık 1 değil: kalabalık ama rahatsız etmeyen
        op: rand(0.10, 0.22),

        dur: rand(16, 28),
        x0,
        y0,
        x1,
        y1,
        r0: rand(-12, 12),
        r1: rand(-80, 80),
      }
    })

    setHearts(created)
  }, [running, heartEmojis])

  return (
    <>
      {/* INTRO (sadece kilit) */}
      {introOn && (
        <div
          className={`intro ${introUnlocking ? 'unlocking fadeout' : ''}`}
          role="dialog"
          aria-label="Kilit ekranı"
        >
          <div className="intro-inner">
            <button className="lock-btn" onClick={unlock} aria-label="Kilidi aç">
              <div className="lock-icon" aria-hidden="true">
                {introUnlocking ? '🔓' : '🔒'}
              </div>
              <h2 className="lock-title">İyi ki doğdun gülüşüm...</h2>
            </button>

            <div className="intro-hint" aria-hidden="true">
              <span className="dot">❤️</span>
              <span>Sevgiyle dokun, hikâyemiz başlasın</span>
            </div>
          </div>
        </div>
      )}

      <main className={`page ${revealed ? 'revealed' : ''}`}>
        {/* ARKA PLAN: uçuşan kalpler */}
        <div className="float-layer" aria-hidden="true">
          {hearts.map((h) => {
            const styleVars: CSSVars = {
              ['--op']: String(h.op),
              ['--dur']: `${h.dur}s`,
              ['--x0']: `${h.x0}vw`,
              ['--y0']: `${h.y0}vh`,
              ['--x1']: `${h.x1}vw`,
              ['--y1']: `${h.y1}vh`,
              ['--r0']: `${h.r0}deg`,
              ['--r1']: `${h.r1}deg`,
              ['--fs']: `${h.fs}px`,
            }
            return (
              <div key={h.id} className="heart-floater" style={styleVars}>
                {h.emoji}
              </div>
            )
          })}
        </div>

        {/* BUTONDAN ÇIKAN KALPLER */}
        <div className="burst-layer" aria-hidden="true">
          {bursts.map((b) => {
            const styleVars: CSSVars = {
              ['--x']: `${b.x}px`,
              ['--y']: `${b.y}px`,
              ['--dx']: `${b.dx}px`,
              ['--dy']: `${b.dy}px`,
              ['--rot']: `${b.rot}deg`,
              ['--bdur']: `${b.dur}ms`,
              ['--bfs']: `${b.fs}px`,
              ['--bdel']: `${b.delay}ms`,
            }
            return (
              <span key={b.id} className="burst-heart" style={styleVars}>
                {b.emoji}
              </span>
            )
          })}
        </div>

        <div className="glow" aria-hidden="true" />
        <div className="vignette" />

        {/* ÖN PLAN */}
        <div className="content">
          <section className="card">
            <div className="photo-wrap">
              <Image
                className="photo"
                src="/bg.jpeg"
                alt="photo"
                width={1600}
                height={1100}
                sizes="(max-width: 520px) 92vw, 520px"
                priority
              />
            </div>

            <div className="card-text">
              <h1 className="title">
                İyi ki doğdun aşkım 💖
                <br />
                Ülkeler ayrı olsa da,
                <br />
                kalbimin yönü hep sana dönük.
              </h1>

              <p className="subtitle">
                Saatler farklı, yollar uzun…
                <br />
                ama seni sevmek hep aynı saat:
                <br />
                her an.
              </p>

              <div className="actions">
                <button
                  ref={btnRef}
                  className="heart-btn"
                  onClick={start}
                  aria-label="Kalbe dokun"
                >
                  <span>❤️</span>
                </button>

                <div className="tap-text">
                  <span className="tap-dot">❤️</span>
                  <span>Kalbime dokun</span>
                </div>
              </div>
            </div>
          </section>

          <div className="sparkles" aria-hidden="true">
            <span className="spark s1">✦</span>
            <span className="spark s2">✦</span>
            <span className="spark s3">✦</span>
            <span className="spark s4">✦</span>
          </div>
        </div>
      </main>
    </>
  )
}
