import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

/**
 * Renders a lightweight inline-markup subset used in blog copy:
 *   - **bold**
 *   - [label](href)  (internal paths use react-router <Link>, http(s) opens safely)
 *   - `code`
 *
 * Anything not matching is passed through as plain text. This keeps article
 * content authorable as simple strings without pulling in a full Markdown
 * dependency for a handful of inline styles.
 */

// Order matters: links first (may contain no other markup inside the label here),
// then bold, then code.
const TOKEN_RE = /(\[[^\]]+\]\([^)]+\))|(\*\*[^*]+\*\*)|(`[^`]+`)/g

export function RichText({ text }: { text: string }): ReactNode {
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let key = 0

  for (const match of text.matchAll(TOKEN_RE)) {
    const index = match.index ?? 0
    if (index > lastIndex) {
      nodes.push(<Fragment key={key++}>{text.slice(lastIndex, index)}</Fragment>)
    }

    const [token] = match
    if (token.startsWith('[')) {
      const labelEnd = token.indexOf(']')
      const label = token.slice(1, labelEnd)
      const href = token.slice(labelEnd + 2, -1)
      nodes.push(renderLink(label, href, key++))
    } else if (token.startsWith('**')) {
      nodes.push(
        <strong key={key++} className="text-charcoal font-semibold">
          {token.slice(2, -2)}
        </strong>
      )
    } else {
      nodes.push(
        <code
          key={key++}
          className="bg-mist text-charcoal rounded px-1.5 py-0.5 text-[0.9em]"
        >
          {token.slice(1, -1)}
        </code>
      )
    }

    lastIndex = index + token.length
  }

  if (lastIndex < text.length) {
    nodes.push(<Fragment key={key++}>{text.slice(lastIndex)}</Fragment>)
  }

  return nodes
}

function renderLink(label: string, href: string, key: number): ReactNode {
  const isExternal = /^https?:\/\//i.test(href)
  const className =
    'text-brand-blue hover:text-brand-blue-dark font-medium underline underline-offset-2 transition-colors'

  if (isExternal) {
    return (
      <a
        key={key}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {label}
      </a>
    )
  }

  return (
    <Link key={key} to={href} className={className}>
      {label}
    </Link>
  )
}
