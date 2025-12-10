export interface AppMeta {
  id: string
  name: string
  version: string
  description: string
  author?: string
  tags?: string[]
  icon?: string
}

export interface AppWithContent {
  meta: AppMeta
  entry?: string
  html?: string
  css?: string
  js?: string
}
