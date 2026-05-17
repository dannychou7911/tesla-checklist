import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('canvas-confetti', () => ({
  default: vi.fn(() => Promise.resolve(null)),
}))

import confetti from 'canvas-confetti'
import { CONFETTI_PRESET, useConfetti } from '../../composables/useConfetti'

function stubMatchMedia(reduceMotion: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)' && reduceMotion,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => false),
    })),
  )
}

beforeEach(() => {
  vi.mocked(confetti).mockClear()
  stubMatchMedia(false)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useConfetti', () => {
  it('用 CONFETTI_PRESET 呼叫 canvas-confetti', async () => {
    const { celebrate } = useConfetti()
    await celebrate()
    expect(confetti).toHaveBeenCalledTimes(1)
    expect(confetti).toHaveBeenCalledWith(CONFETTI_PRESET)
  })

  it('呼叫端可覆蓋 options', async () => {
    const { celebrate } = useConfetti()
    await celebrate({ particleCount: 30, spread: 45 })
    expect(confetti).toHaveBeenCalledWith({ particleCount: 30, spread: 45 })
  })

  it('prefers-reduced-motion 為 true 時不呼叫 canvas-confetti', async () => {
    stubMatchMedia(true)
    const { celebrate } = useConfetti()
    await celebrate()
    expect(confetti).not.toHaveBeenCalled()
  })

  it('SSR 環境（無 window.matchMedia）視為不 reduced，會正常呼叫', async () => {
    vi.unstubAllGlobals()
    vi.stubGlobal('matchMedia', undefined)
    const { celebrate } = useConfetti()
    await celebrate()
    expect(confetti).toHaveBeenCalledTimes(1)
  })

  it('CONFETTI_PRESET 含 particleCount、spread、origin.y', () => {
    expect(CONFETTI_PRESET.particleCount).toBeGreaterThan(0)
    expect(CONFETTI_PRESET.spread).toBeGreaterThan(0)
    expect(CONFETTI_PRESET.origin?.y).toBeGreaterThan(0)
  })
})
