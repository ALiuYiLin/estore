import type { AppMeta } from '../../types/app'
import { resolveFile } from './resolveFile'

export type Manifest = Partial<AppMeta> & {
  entry?: string
  html?: string
  css?: string | string[]
  js?: string | string[]
}

export function loadHtmlFile(
  byName: Map<string, File>,
  byRel: Map<string, File>,
  manifest: Manifest
): File | undefined {
  return (
    resolveFile(byName, byRel, manifest.entry) ||
    resolveFile(byName, byRel, manifest.html) ||
    byName.get('index.html')
  )
}

export function loadCssFiles(
  byName: Map<string, File>,
  byRel: Map<string, File>,
  manifest: Manifest
): File[] {
  const out: File[] = []
  if (Array.isArray(manifest.css)) {
    for (const p of manifest.css) {
      const f = resolveFile(byName, byRel, p)
      if (f) out.push(f)
    }
  } else {
    const f = resolveFile(byName, byRel, manifest.css) || byName.get('index.css')
    if (f) out.push(f)
  }
  return out
}

export function loadJsFiles(
  byName: Map<string, File>,
  byRel: Map<string, File>,
  manifest: Manifest
): File[] {
  const out: File[] = []
  if (Array.isArray(manifest.js)) {
    for (const p of manifest.js) {
      const f = resolveFile(byName, byRel, p)
      if (f) out.push(f)
    }
  } else {
    const f = resolveFile(byName, byRel, manifest.js) || byName.get('index.js')
    if (f) out.push(f)
  }
  return out
}

