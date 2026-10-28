import { ArrowRight, Quote } from 'lucide-react'

/** the founder application on the New India Manifesto website (the same link as "Apply now" on the Vision page) */
const APPLY_URL = 'https://newindiamanifesto.com/apply/founder'

/**
 * The New India Manifesto card that overlaps the bottom of the homepage hero: a white card with an orange top border — the
 * label, the line about building a self-reliant India from its rural heartland, the guidance / funding / 1,00,000
 * entrepreneurs line after a quote mark, and the red "Join the Movement" button (navy on hover, like every homepage button).
 */
export function CitizenEngagementBanner({
  locale = 'mr',
}: {
  locale?: 'mr' | 'en'
}) {
  const isMr = locale !== 'en'

  return (
    <section className="container-x relative z-30 -mt-6 sm:-mt-8 lg:-mt-10">
      <div className="overflow-hidden rounded-2xl bg-white border-t-4 border-[#ff7a00] shadow-[0_20px_50px_rgba(0,13,61,0.18)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 sm:p-8 lg:px-10 lg:py-8">
          <div className="min-w-0 max-w-4xl flex-1 space-y-2.5">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.14em] text-[#e65100]">
              {isMr ? 'न्यू इंडिया मॅनिफेस्टो' : 'New India Manifesto'}
            </p>

            <h2 className="font-display text-xl sm:text-2xl lg:text-[1.4rem] font-bold leading-snug text-pretty tracking-tight text-[#000d3d]">
              {isMr
                ? 'आजच्या नव्या कल्पना, उद्याच्या आत्मनिर्भर भारताचा पाया!'
                : 'Building a self-reliant India from its rural heartland, with integrity and enterprise.'}
            </h2>

            <p className="flex items-start gap-2 pt-1 text-sm sm:text-base leading-relaxed text-slate-600">
              <Quote aria-hidden className="mt-0.5 size-4 shrink-0 rotate-180 fill-[#ff7a00] text-[#ff7a00]" />
              <span>
                {isMr
                  ? 'ग्रामीण भारतातील उद्यमशीलतेला प्रोत्साहन देत, नवउद्योजकांना मार्गदर्शन आणि आर्थिक पाठबळ उपलब्ध करून देत, १ लाख उद्योजकांच्या माध्यमातून विकासाच्या नव्या शक्यता साकारण्याचा निर्धार!'
                  : 'Guidance and funding for new founders. A new startup ecosystem for 1,00,000 entrepreneurs.'}
              </span>
            </p>
          </div>

          <div className="flex shrink-0 max-lg:justify-center">
            <a
              href={APPLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-[#000d3d] px-7 py-3.5 text-sm sm:text-base font-bold text-white shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <span>{isMr ? 'आपल्या उद्योजकीय प्रवासाची नोंद करा!' : 'Join the Movement'}</span>
              <ArrowRight aria-hidden className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
