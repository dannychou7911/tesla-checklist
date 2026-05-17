import { describe, expect, it } from 'vitest'
import Ajv from 'ajv/dist/2020'
import checklistData from '../../assets/data/checklist.json'
import checklistSchema from '../../assets/data/checklist.schema.json'
import type { Checklist, ChecklistItem, ChecklistSection } from '../../utils/checklist-types'

const TOTAL_ITEMS = 40
const TOTAL_SECTIONS = 6

describe('checklist data', () => {
  const data = checklistData as unknown as Checklist

  it('符合 JSON Schema', () => {
    const ajv = new Ajv({ allErrors: true, strict: false })
    const validate = ajv.compile(checklistSchema)
    const ok = validate(data)
    if (!ok) {
      throw new Error(`schema invalid: ${ajv.errorsText(validate.errors)}`)
    }
    expect(ok).toBe(true)
  })

  it(`含 ${TOTAL_SECTIONS} 個 sections`, () => {
    expect(data.sections).toHaveLength(TOTAL_SECTIONS)
  })

  it(`所有 sections 的 items 總和為 ${TOTAL_ITEMS}`, () => {
    const total = data.sections.reduce(
      (sum: number, s: ChecklistSection) => sum + s.items.length,
      0,
    )
    expect(total).toBe(TOTAL_ITEMS)
  })

  it('每個 item id 全域唯一', () => {
    const ids = data.sections.flatMap((s: ChecklistSection) =>
      s.items.map((it: ChecklistItem) => it.id),
    )
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('每個 section id 唯一', () => {
    const ids = data.sections.map((s: ChecklistSection) => s.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('每個 item 的 label 與 description 非空', () => {
    for (const s of data.sections) {
      for (const it of s.items) {
        expect(it.label.trim().length).toBeGreaterThan(0)
        expect(it.description.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('每個 section 的 title 非空', () => {
    for (const s of data.sections) {
      expect(s.title.trim().length).toBeGreaterThan(0)
    }
  })
})
