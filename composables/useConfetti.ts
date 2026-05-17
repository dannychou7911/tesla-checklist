import confetti, { type Options as ConfettiOptions } from 'canvas-confetti'

export const CONFETTI_PRESET: ConfettiOptions = {
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 },
}

function prefersReducedMotion(): boolean {
  if (typeof matchMedia === 'undefined') return false
  return matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useConfetti() {
  return {
    async celebrate(options: ConfettiOptions = CONFETTI_PRESET): Promise<void> {
      if (prefersReducedMotion()) return
      await confetti(options)
    },
  }
}
