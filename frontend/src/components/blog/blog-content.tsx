import { BlogImage } from '@/components/blog/blog-image'
import { RichText } from '@/components/blog/rich-text'
import { type PostBlock } from '@/types/content'

export function BlogContent({ blocks }: { blocks: PostBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading':
            return (
              <h2
                key={index}
                className="text-charcoal pt-4 text-2xl font-bold sm:text-3xl"
              >
                {block.text}
              </h2>
            )
          case 'subheading':
            return (
              <h3
                key={index}
                className="text-charcoal pt-2 text-xl font-semibold"
              >
                {block.text}
              </h3>
            )
          case 'list':
            return (
              <ul
                key={index}
                className="text-slate list-disc space-y-2 pl-6 text-lg leading-relaxed"
              >
                {block.items.map((item, i) => (
                  <li key={i}>
                    <RichText text={item} />
                  </li>
                ))}
              </ul>
            )
          case 'image':
            return (
              <figure key={index} className="my-8">
                <div className="border-border overflow-hidden rounded-2xl border shadow-sm">
                  <BlogImage
                    image={block.image}
                    illustration={block.illustration}
                    alt={block.alt}
                    width={block.width}
                    height={block.height}
                    className="aspect-[16/9] w-full object-cover"
                  />
                </div>
                {block.caption && (
                  <figcaption className="text-slate mt-3 text-center text-sm">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            )
          case 'table':
            return (
              <div
                key={index}
                className="border-border my-6 overflow-x-auto rounded-2xl border shadow-sm"
              >
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-mist">
                      {block.headers.map((header, i) => (
                        <th
                          key={i}
                          className="text-charcoal px-4 py-3 font-semibold whitespace-nowrap"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, r) => (
                      <tr
                        key={r}
                        className="border-border text-slate border-t align-top"
                      >
                        {row.map((cell, c) => (
                          <td key={c} className="px-4 py-3">
                            <RichText text={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          default:
            return (
              <p key={index} className="text-slate text-lg leading-relaxed">
                <RichText text={block.text} />
              </p>
            )
        }
      })}
    </div>
  )
}
