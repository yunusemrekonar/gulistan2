'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

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
      const a = new Audio('/song.m4a')
      a.loop = true
      a.volume = 0.85
      a.play().catch(() => { })
      audioRef.current = a
    } else {
      audioRef.current.play().catch(() => { })
    }
  }

  useEffect(() => {
    if (!running) return

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 520

    // Kalpler daha büyük + sayısı dengeli
    const heartCount = isMobile ? 26 : 52

    const createdHearts: HeartFloater[] = Array.from({ length: heartCount }).map((_, i) => {
      const emoji = heartEmojis[Math.floor(Math.random() * heartEmojis.length)]

      const x0 = rand(-10, 110)
      const y0 = rand(-10, 110)

      // sağ/sol/aşağı/yukarı karışık drift
      const x1 = x0 + rand(-85, 85)
      const y1 = y0 + rand(-95, 95)

      return {
        id: `heart-${Date.now()}-${i}-${Math.random().toString(16).slice(2)}`,
        emoji,
        // daha büyük kalpler:
        fs: rand(isMobile ? 18 : 22, isMobile ? 34 : 44),
        op: rand(0.10, 0.22),
        dur: rand(7, 16),
        x0,
        y0,
        x1,
        y1,
        r0: rand(-20, 20),
        r1: rand(-260, 260),
      }
    })

    setHearts(createdHearts)
  }, [running, heartEmojis])

  return (
    <main className="page">
      {/* ARKA PLAN: uçuşan kalpler (butona basınca başlar) */}
      <div className="float-layer" aria-hidden="true">
        {hearts.map((h) => (
          <div
            key={h.id}
            className="heart-floater"
            style={{
              ['--op' as any]: h.op,
              ['--dur' as any]: `${h.dur}s`,
              ['--x0' as any]: `${h.x0}vw`,
              ['--y0' as any]: `${h.y0}vh`,
              ['--x1' as any]: `${h.x1}vw`,
              ['--y1' as any]: `${h.y1}vh`,
              ['--r0' as any]: `${h.r0}deg`,
              ['--r1' as any]: `${h.r1}deg`,
              ['--fs' as any]: `${h.fs}px`,
            }}
          >
            {h.emoji}
          </div>
        ))}
      </div>

      <div className="vignette" />

      {/* ÖN PLAN */}
      <div className="content">
        <section className="card">
          {/* Ortadaki foto */}
          <img className="photo" src="/bg.jpeg" alt="photo" />

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
              <button className="heart-btn" onClick={start} aria-label="Kalbe dokun">
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
