/**
 * 解析文件路径，根据文件名或相对路径查找文件。
 * @param byName 文件名映射表，键为文件名（不包含路径），值为文件对象。
 * @param byRel 相对路径映射表，键为相对路径（包含文件名），值为文件对象。
 * @param p 文件路径，支持相对路径（如 './file.txt'）或文件名（如 'file.txt'）。
 * @returns 如果找到文件则返回文件对象，否则返回 undefined。
 */
export function resolveFile(
  byName: Map<string, File>,
  byRel: Map<string, File>,
  p?: string
): File | undefined {
  if (!p) return undefined
  const norm = p.toLowerCase()
  const base = norm.split(/[/\\]/).pop() || norm
  return byRel.get(norm) || byName.get(base)
}
