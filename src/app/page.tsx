'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export default function Page() {
  const heartEmojis = useMemo(() => ['💗', '💖', '💕', '💘', '💞'], [])

  const [running, setRunning] = useState(false)
  const [hearts, setHearts] = useState<HeartFloater[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const start = () => {
    setRunning(true)

    if (!audioRef.current) {
      const audio = new Audio('/song.m4a')
      audio.loop = true
      audio.volume = 0.85
      audio.play().catch(() => {})
      audioRef.current = audio
    } else {
      audioRef.current.play().catch(() => {})
    }
  }

  useEffect(() => {
    if (!running) return

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 520
    const heartCount = isMobile ? 26 : 52

    const created: HeartFloater[] = Array.from({ length: heartCount }).map((_, i) => {
      const emoji = heartEmojis[Math.floor(Math.random() * heartEmojis.length)]

      const x0 = rand(-10, 110)
      const y0 = rand(-10, 110)
      const x1 = x0 + rand(-85, 85)
      const y1 = y0 + rand(-95, 95)

      return {
        id: `heart-${Date.now()}-${i}-${Math.random().toString(16).slice(2)}`,
        emoji,
        fs: rand(isMobile ? 18 : 22, isMobile ? 34 : 44), // büyük kalpler
        op: rand(0.1, 0.22),
        dur: rand(7, 16),
        x0,
        y0,
        x1,
        y1,
        r0: rand(-20, 20),
        r1: rand(-260, 260),
      }
    })

    setHearts(created)
  }, [running, heartEmojis])

  return (
    <main className="page">
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

      <div className="vignette" />

      {/* ÖN PLAN */}
      <div className="content">
        <section className="card">
          {/* ORTADAKİ FOTO */}
          <Image
            className="photo"
            src="/bg.jpeg"
            alt="photo"
            width={1200}
            height={800}
            priority
          />

          <div className="card-text">
            {/* ❤️ ROMANTİK METİN */}
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

            {/* ❤️ KALP + ALT YAZI */}
            <div className="actions">
              <button
                className="heart-btn"
                onClick={start}
                aria-label="Kalbe dokun"
              >
                <span>❤️</span>
              </button>

              <div className="tap-text">
                <span className="tap-dot">💗</span>
                <span>Kalbe dokun</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
