import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import type { Home } from '@/types/cms'
import { mediaUrl } from '@/lib/media'
import { AccentBar, Reveal } from '../ui/Motion'

type Block = NonNullable<Home['sections']>[number]
type VisionBlock = Extract<Block, { blockType: 'homeVision' }>

/** the same words as the main website's Vision section, for when the homepage content has none */
const FALLBACK = {
  eyebrow: { mr: 'व्हिजन', en: 'Vision' },
  heading: { mr: 'पुढच्या पिढीला स्वतःचे काहीतरी उभे करण्याचा आत्मविश्वास', en: 'Giving the next generation the confidence to build their own' },
  text: {
    mr: 'रोहन यांच्या ‘न्यू इंडिया मॅनिफेस्टो’ या पुस्तकात नव्या भारताविषयीचे विचार मांडले आहेत. त्यातून प्रेरणा घेऊन ते संपूर्ण महाराष्ट्रात सक्षम स्टार्टअप परिसंस्था उभारत आहेत — मोठ्या शहरातील असो वा छोट्या गावातील, प्रत्येक तरुणाला मार्गदर्शन, पाठबळ आणि संधी मिळावी.',
    en: 'Rohan’s book New India Manifesto sets out his ideas for a new India. Inspired by it, he is building a strong startup ecosystem across Maharashtra — so young people from big cities and small towns get guidance, support and opportunity.',
  },
  button: { mr: 'व्हिजन वाचा', en: 'Read the vision' },
  url: '/vision',
}
const COVER = '/images/vision/new-india-manifesto-cover.webp'

/**
 * Vision (Oct 2026), on the homepage below Social Activities — the main website's Vision section in this homepage's design:
 * the centred header every homepage section has (red label, navy title, red and saffron bars) on the light-blue band, then one
 * white card like the Key Focus Areas cards — the New India Manifesto cover on a light-blue panel on one side, and the words
 * about the book with the red "Read the vision" button on the other. The words come from the homepage content (Home → "Vision"
 * in the admin); hidden there = not shown.
 */
export function SupriyaVisionSection({
  b,
  locale = 'mr',
}: {
  /** null = hidden in the admin; undefined = not in the content (the main website's words are shown) */
  b?: VisionBlock | null
  locale?: 'mr' | 'en'
}) {
  if (b === null) return null
  const isMr = locale !== 'en'
  const pick = (x: { mr: string; en: string }) => (isMr ? x.mr : x.en)
  const eyebrow = (b ? b.eyebrow : null) || pick(FALLBACK.eyebrow)
  const heading = b ? b.heading : pick(FALLBACK.heading)
  const text = b ? b.text : pick(FALLBACK.text)
  const label = (b ? b.buttonLabel : null) || pick(FALLBACK.button)
  const url = (b ? b.buttonUrl : null) || FALLBACK.url
  const cover = mediaUrl(b?.image) || COVER
  const book = isMr ? 'न्यू इंडिया मॅनिफेस्टो' : 'The New India Manifesto'
  /** the book's full title, in Marathi on the Marathi site (as the RD Content document writes it) */
  const bookTitle = isMr ? 'न्यू इंडिया मॅनिफेस्टो: गोइंग बियॉन्ड पॉसिबल' : 'The New India Manifesto: Going Beyond Possible'

  return (
    <section className="bg-[#f0f6fc] border-t border-stone-200 py-16 sm:py-24" aria-labelledby="home-vision-title">
      <div className="container-x">
        <Reveal className="text-center mb-12 sm:mb-16">
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-red-600">{eyebrow}</span>
          {heading && (
            <h2 id="home-vision-title" className="mx-auto mt-1 max-w-4xl font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#000d3d]">
              {heading}
            </h2>
          )}
          <AccentBar center className="mt-2.5" />
        </Reveal>

        <Reveal className="grid grid-cols-1 overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm lg:grid-cols-12">
          {/* the book */}
          <Link to={url} aria-label={label} className="group flex items-center justify-center px-6 py-10 lg:col-span-4 lg:py-12">
            <div className="w-44 overflow-hidden rounded-lg border border-stone-200 shadow-xl transition-transform duration-500 group-hover:-translate-y-1.5 sm:w-52">
              <img src={cover} alt={isMr ? `${book} — पुस्तकाचे मुखपृष्ठ` : `${book} — book cover`} width={1260} height={1946} loading="lazy" decoding="async" className="h-auto w-full" />
            </div>
          </Link>

          {/* the words */}
          <div className="flex flex-col justify-center p-6 sm:p-10 lg:col-span-8">
            <p className="text-xs font-extrabold uppercase tracking-widest text-red-600">{isMr ? 'पुस्तक' : 'The book'}</p>
            <h3 className="mt-2 font-display text-xl font-bold leading-snug text-[#000d3d] sm:text-2xl">
              {bookTitle}
            </h3>
            <AccentBar className="mt-3 mb-4" bar="h-1 w-10" />
            {text && <p className="text-sm leading-relaxed text-slate-600 sm:text-base">{text}</p>}
            <div className="mt-6 max-md:flex max-md:justify-center">
              <Link
                to={url}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#000d3d]"
              >
                {label} <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
