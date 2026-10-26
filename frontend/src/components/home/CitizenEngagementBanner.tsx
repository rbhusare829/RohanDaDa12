import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'

/**
 * Overlapping Citizen Engagement / Manifesto Banner (Matching Image 3):
 * Crisp white card with a distinctive orange top border overlapping the hero section.
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
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 sm:p-8 lg:p-10">
          <div className="max-w-3xl space-y-2.5">
            {/* Saffron Eyebrow (Matching Image 3) */}
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.14em] text-[#e65100]">
              {isMr ? 'नव्या भारताचा संकल्पनामा' : 'NEW INDIA MANIFESTO'}
            </p>

            <h2 className="font-display text-xl sm:text-2xl lg:text-[1.65rem] font-bold leading-snug tracking-tight text-charcoal-950">
              {isMr
                ? 'जनसंवाद, शाश्वत विकास आणि सामाजिक न्याय हाच आमच्या प्रत्येक धोरणाचा आणि कार्याचा गाभा आहे.'
                : 'Citizen Engagement is extremely important in legislation, governance and public development.'}
            </h2>

            <div className="flex items-start gap-2 pt-1 text-charcoal-700">
              <span className="font-serif text-3xl sm:text-4xl leading-none text-[#ff7a00] select-none">&ldquo;</span>
              <p className="text-sm sm:text-base leading-relaxed italic text-charcoal-600">
                {isMr
                  ? 'सर्वसामान्यांचे प्रश्न सोडवण्यासाठी, शेतकऱ्यांना व तरुणांना सक्षम करण्यासाठी आम्ही सातत्याने कटिबद्ध आहोत. - रोहन देशमुख'
                  : 'I will do my best to understand grassroots needs and empower youth, farmers and society. - Rohan Deshmukh'}
              </p>
              <span className="font-serif text-3xl sm:text-4xl leading-none text-[#ff7a00] select-none">&rdquo;</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link
              to="/vision"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-[#000d3d] px-7 py-3.5 text-sm sm:text-base font-bold uppercase tracking-wider text-white shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <span>{isMr ? 'अधिक जाणून घ्या' : 'Apply Now'}</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
