import { type PostBlock } from '@/types/content'

export function BlogContent({ blocks }: { blocks: PostBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading':
            return (
              <h2 key={index} className="text-charcoal text-2xl font-bold">
                {block.text}
              </h2>
            )
          case 'list':
            return (
              <ul
                key={index}
                className="text-slate list-disc space-y-2 pl-6 text-lg leading-relaxed"
              >
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )
          default:
            return (
              <p key={index} className="text-slate text-lg leading-relaxed">
                {block.text}
              </p>
            )
        }
      })}
    </div>
  )
}
