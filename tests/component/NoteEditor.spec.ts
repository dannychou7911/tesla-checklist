import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import NoteEditor from '../../components/checklist/NoteEditor.vue'

describe('NoteEditor', () => {
  it('渲染 textarea 與字數顯示', () => {
    const w = mount(NoteEditor, { props: { modelValue: '' } })
    expect(w.find('[data-testid="note-textarea"]').exists()).toBe(true)
    expect(w.find('[data-testid="note-counter"]').exists()).toBe(true)
  })

  it('textarea value 反映 modelValue', () => {
    const w = mount(NoteEditor, { props: { modelValue: 'hello' } })
    const ta = w.get('[data-testid="note-textarea"]').element as HTMLTextAreaElement
    expect(ta.value).toBe('hello')
  })

  it('字數顯示為 currentLength / maxLength（預設 500）', () => {
    const w = mount(NoteEditor, { props: { modelValue: 'hello' } })
    expect(w.get('[data-testid="note-counter"]').text()).toContain('5')
    expect(w.get('[data-testid="note-counter"]').text()).toContain('500')
  })

  it('輸入時 emit update:modelValue', async () => {
    const w = mount(NoteEditor, { props: { modelValue: '' } })
    const ta = w.get('[data-testid="note-textarea"]')
    await ta.setValue('車門有刮痕')
    expect(w.emitted('update:modelValue')).toEqual([['車門有刮痕']])
  })

  it('輸入超過 maxLength（500）會被截斷', async () => {
    const w = mount(NoteEditor, { props: { modelValue: '' } })
    const tooLong = 'a'.repeat(600)
    await w.get('[data-testid="note-textarea"]').setValue(tooLong)
    const emitted = w.emitted('update:modelValue') as string[][]
    expect(emitted).toBeTruthy()
    expect(emitted[0][0].length).toBe(500)
  })

  it('自訂 maxLength prop 覆蓋預設', async () => {
    const w = mount(NoteEditor, {
      props: { modelValue: '', maxLength: 100 },
    })
    expect(w.get('[data-testid="note-counter"]').text()).toContain('100')
    const tooLong = 'a'.repeat(200)
    await w.get('[data-testid="note-textarea"]').setValue(tooLong)
    const emitted = w.emitted('update:modelValue') as string[][]
    expect(emitted[0][0].length).toBe(100)
  })

  it('textarea 有 maxlength 屬性（瀏覽器層第一道防線）', () => {
    const w = mount(NoteEditor, { props: { modelValue: '' } })
    expect(w.get('[data-testid="note-textarea"]').attributes('maxlength')).toBe('500')
  })
})
