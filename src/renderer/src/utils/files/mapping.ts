/**
 * 构建文件名和相对路径的映射表。
 * @param files 文件列表，包含应用的所有文件。
 * @returns 包含两个映射表的对象：byName（文件名映射）和 byRel（相对路径映射）。
 */
export function buildFileMaps(files: FileList): {
  byName: Map<string, File>
  byRel: Map<string, File>
} {
  const byName = new Map<string, File>()
  const byRel = new Map<string, File>()
  for (const f of Array.from(files)) {
    byName.set(f.name.toLowerCase(), f)
    const rel = (f as unknown as { webkitRelativePath?: string }).webkitRelativePath?.toLowerCase()
    if (rel) byRel.set(rel, f)
  }
  return { byName, byRel }
}

