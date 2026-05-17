export interface Checklist {
  version: number
  source?: string
  sections: ChecklistSection[]
}

export interface ChecklistSection {
  id: string
  title: string
  items: ChecklistItem[]
}

export interface ChecklistItem {
  id: string
  label: string
  description: string
  link?: string
}
