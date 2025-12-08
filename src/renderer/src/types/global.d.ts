declare global {
  interface Window {
    api?: {
      readText: (path: string) => Promise<string>
      join: (...parts: string[]) => Promise<string>
      exists: (path: string) => Promise<boolean>
    }
  }
}

export {}

