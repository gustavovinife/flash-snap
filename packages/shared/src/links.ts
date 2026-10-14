export interface CardLink {
  url: string
  title?: string
}

/** Turns user input like "example.com/page" into a valid http(s) URL, or null when it isn't one. */
export function normalizeLinkUrl(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const url = new URL(candidate)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    if (!url.hostname.includes('.')) return null
    return url.toString()
  } catch {
    return null
  }
}

/** The title when there is one, otherwise the site name (e.g. "martinfowler.com"). */
export function linkLabel(link: CardLink): string {
  if (link.title?.trim()) return link.title.trim()
  try {
    return new URL(link.url).hostname.replace(/^www\./, '')
  } catch {
    return link.url
  }
}
