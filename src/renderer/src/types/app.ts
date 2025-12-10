export interface AppMeta {
  id: string
  name: string
  version: string
  description: string
  author?: string
  tags?: string[]
  icon?: string
  entry?: string
  html?: string
  css?: string
  js?: string
}

export interface AppManifest {
  entry?: string
  html?: string
  css?: string | string[]
  js?: string | string[]
}

export interface AppWithContent {
  meta: AppMeta
  entry?: string
  html?: string
  css?: string
  js?: string
  upload?: {
    byName: Map<string, File>
    byRel: Map<string, File>
    manifest: AppManifest
  }
}
