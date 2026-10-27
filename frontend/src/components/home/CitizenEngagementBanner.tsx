import { ArrowRight, Quote } from 'lucide-react'
import { Reveal } from '../ui/Motion'

/** the founder application on the New India Manifesto website (the same link as "Apply now" on the Vision page) */
const APPLY_URL = 'https://newindiamanifesto.com/apply/founder'

/**
 * The New India Manifesto card that overlaps the bottom of the homepage hero: a white card with an orange top border — the
 * label, the line about building a self-reliant India from its rural heartland, the mentorship / investors / 1,00,000
 * entrepreneurs line after a quote mark, and the red "Apply now" button (navy on hover, like every homepage button).
 */
export function CitizenEngagementBanner({
  locale = 'mr',
}: {
  locale?: 'mr' | 'en'
}) {
  const isMr = locale !== 'en'

  return (
    <section className="container-x relative z-30 -mt-6 sm:-mt-8 lg:-mt-10">
      {/* it rises over the bottom of the hero a moment after the hero's words have arrived */}
      <Reveal delay={0.45} y={36} className="overflow-hidden rounded-2xl bg-white border-t-4 border-[#ff7a00] shadow-[0_20px_50px_rgba(0,13,61,0.18)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 sm:p-8 lg:px-10 lg:py-8">
          <div className="min-w-0 max-w-4xl flex-1 space-y-2.5">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.14em] text-[#e65100]">
              {isMr ? 'न्यू इंडिया मॅनिफेस्टो' : 'New India Manifesto'}
            </p>

            <h2 className="font-display text-xl sm:text-2xl lg:text-[1.4rem] font-bold leading-snug text-pretty tracking-tight text-[#000d3d]">
              {isMr
                ? 'ग्रामीण भारताच्या मातीतून आत्मनिर्भर भारताची उभारणी — प्रामाणिकपणा आणि उद्योजकतेच्या बळावर.'
                : 'Building a self-reliant India from its rural heartland — with integrity and enterprise.'}
            </h2>

            <p className="flex items-start gap-2 pt-1 text-sm sm:text-base leading-relaxed text-slate-600">
              <Quote aria-hidden className="mt-0.5 size-4 shrink-0 rotate-180 fill-[#ff7a00] text-[#ff7a00]" />
              <span>
                {isMr
                  ? 'शहरे आणि गावांतील नवउद्योजकांसाठी मार्गदर्शन, संपर्काचे जाळे आणि विश्वासार्ह गुंतवणूकदार. ध्येय: १,००,००० उद्योजक.'
                  : 'Mentorship, a network and vetted investors for founders from towns and villages. The goal: 1,00,000 entrepreneurs.'}
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
              <span>{isMr ? 'आत्ताच अर्ज करा' : 'Apply now'}</span>
              <ArrowRight aria-hidden className="size-4" />
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
