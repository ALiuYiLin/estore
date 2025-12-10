import type { AppManifest } from '../../types/app'
import { resolveFile } from './resolveFile'

export type Manifest = AppManifest

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

export async function loadHtmlText(
  byName: Map<string, File>,
  byRel: Map<string, File>,
  manifest: Manifest
): Promise<string | undefined> {
  const file = loadHtmlFile(byName, byRel, manifest)
  if (!file) return undefined
  return file.text()
}

export async function loadCssText(
  byName: Map<string, File>,
  byRel: Map<string, File>,
  manifest: Manifest
): Promise<string | undefined> {
  const files = loadCssFiles(byName, byRel, manifest)
  if (!files.length) return undefined
  const texts = await Promise.all(files.map((f) => f.text()))
  return texts.join('\n')
}

export async function loadJsText(
  byName: Map<string, File>,
  byRel: Map<string, File>,
  manifest: Manifest
): Promise<string | undefined> {
  const files = loadJsFiles(byName, byRel, manifest)
  if (!files.length) return undefined
  const texts = await Promise.all(files.map((f) => f.text()))
  return texts.join('\n;')
}
