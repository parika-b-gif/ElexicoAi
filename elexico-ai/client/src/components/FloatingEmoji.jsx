import { useMemo } from 'react'
import { motion } from 'framer-motion'

const COUNT = 10

const FloatingEmoji = ({ emoji, id }) => {
  const { originLeft, sparks } = useMemo(() => {

    const originLeft = 15 + Math.random() * 70

    const sparks = Array.from({ length: COUNT }, (_, i) => {

      const angleDeg = -75 + (i / (COUNT - 1)) * 150 + (Math.random() * 14 - 7)
      const rad      = (angleDeg * Math.PI) / 180
      const dist     = 100 + Math.random() * 170

      return {

        x:        Math.sin(rad) * dist,
        y:       -Math.cos(rad) * dist,
        delay:    Math.random() * 0.12,
        duration: 1.5 + Math.random() * 0.7,
      }
    })

    return { originLeft, sparks }
  }, [id])

  return (
    <>
      {sparks.map((s, i) => (
    <motion.div
      key={`${id}-${i}`}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{
        x:       s.x,
        y:       s.y,
        opacity: [1, 0.95, 0.55, 0],
        scale:   [1, 0.9, 0.65],
      }}
      transition={{
        duration: s.duration,
        delay:    s.delay,
        ease:     [0.15, 0.85, 0.35, 1],
        opacity:  { times: [0, 0.25, 0.7, 1], duration: s.duration, delay: s.delay },
        scale:    { times: [0, 0.5,  1],       duration: s.duration, delay: s.delay },
      }}
      className="fixed pointer-events-none select-none"
      style={{
        left:        `${originLeft}%`,
        bottom:      '4.5rem',
        fontSize:    '1.1rem',
        zIndex:      99999,
        lineHeight:  1,
        willChange:  'transform, opacity',
      }}
    >
      {emoji}
    </motion.div>
      ))}
    </>
  )
}

export default FloatingEmoji
