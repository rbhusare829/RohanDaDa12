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
    <section className="container-x relative z-30 -mt-12 sm:-mt-16 lg:-mt-20">
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
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff7a00] hover:bg-[#e65100] px-7 py-3.5 text-sm sm:text-base font-bold uppercase tracking-wider text-white shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <span>{isMr ? 'अधिक जाणून घ्या' : 'Apply Now'}</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* Scrolling Updates Ticker */}
        <div className="border-t border-stone-200/80 bg-[#fbf9f5] px-4 sm:px-6 py-2.5 overflow-hidden flex items-center">
          <div className="shrink-0 flex items-center gap-2 pr-3 sm:pr-4 border-r border-stone-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#e65100]">
            <span className="size-2 rounded-full bg-red-500 animate-pulse" />
            <span>{isMr ? 'महत्त्वाचे दुवे' : 'Updates'}</span>
          </div>
          <div className="overflow-hidden whitespace-nowrap flex-1 ml-3 relative">
            <div className="inline-flex items-center gap-8 text-xs sm:text-sm text-charcoal-700 font-medium animate-[marquee_25s_linear_infinite] hover:[animation-play-state:paused]">
              <Link to="/blog/lotus-blog-merit-determination-opportunity" className="inline-flex items-center gap-1.5 hover:text-[#e65100] transition-colors">
                <span className="text-[#ff7a00] font-bold">&rarr;</span> लोटस शिष्यवृत्ती योजना
              </Link>
              <span className="text-stone-300">|</span>
              <Link to="/blog/lokmangal-annapurna-yojana" className="inline-flex items-center gap-1.5 hover:text-[#e65100] transition-colors">
                <span className="text-[#ff7a00] font-bold">&rarr;</span> लोकमंगल अन्नपूर्णा मोफत भोजन योजना
              </Link>
              <span className="text-stone-300">|</span>
              <Link to="/blog/lokmangal-samudayik-vivah-sohala" className="inline-flex items-center gap-1.5 hover:text-[#e65100] transition-colors">
                <span className="text-[#ff7a00] font-bold">&rarr;</span> सर्वधर्मीय सामुदायिक विवाह सोहळा
              </Link>
              <span className="text-stone-300">|</span>
              <Link to="/social-work" className="inline-flex items-center gap-1.5 hover:text-[#e65100] transition-colors">
                <span className="text-[#ff7a00] font-bold">&rarr;</span> ग्रामीण विकास व जलसंधारण प्रकल्प
              </Link>
              <span className="text-stone-300">|</span>
              <Link to="/vision" className="inline-flex items-center gap-1.5 hover:text-[#e65100] transition-colors">
                <span className="text-[#ff7a00] font-bold">&rarr;</span> नव्या भारताचा संकल्पनामा (Vision 2047)
              </Link>
              <span className="text-stone-300">|</span>
              <Link to="/media/photos" className="inline-flex items-center gap-1.5 hover:text-[#e65100] transition-colors">
                <span className="text-[#ff7a00] font-bold">&rarr;</span> छायाचित्र दालन व महत्त्वाचे क्षण
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
