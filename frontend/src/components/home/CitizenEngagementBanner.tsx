import { Link } from 'react-router'
import { ArrowRight, Calendar, FileText, Mail, Quote } from 'lucide-react'
import { AccentBar } from '../ui/Motion'
import { Reveal } from './HomeMotion'

/** the founder application on the New India Manifesto website */
const APPLY_URL = 'https://newindiamanifesto.com/apply/founder'

/**
 * 1. New India Manifesto Spotlight Banner (sits directly under the Hero Slider)
 */
export function NewIndiaManifestoBanner({
  locale = 'mr',
}: {
  locale?: 'mr' | 'en'
}) {
  const isMr = locale !== 'en'

  return (
    <section className="container-x relative z-30 -mt-6 sm:-mt-8 lg:-mt-10">
      <Reveal delay={0.3} y={30} className="overflow-hidden rounded-2xl border-t-4 border-saffron-600 bg-cream shadow-[0_20px_50px_rgba(24,33,38,0.14)]">
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 sm:p-8 lg:px-10 lg:py-8">
          {/* Reliance Foundation style elegant background quote watermark */}
          <span aria-hidden className="pointer-events-none absolute right-4 -bottom-10 select-none text-[10rem] font-bold text-saffron-600/10 leading-none">”</span>
          <div className="min-w-0 max-w-4xl flex-1 space-y-2.5">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.14em] text-saffron-700">
              {isMr ? 'न्यू इंडिया मॅनिफेस्टो' : 'New India Manifesto'}
            </p>

            <h2 className="font-display text-xl sm:text-2xl lg:text-[1.4rem] font-bold leading-snug text-pretty tracking-tight text-charcoal-900">
              {isMr
                ? 'आजच्या नव्या कल्पना, उद्याच्या आत्मनिर्भर भारताचा पाया!'
                : 'Building a self-reliant India from its rural heartland, with integrity and enterprise.'}
            </h2>

            <p className="flex items-start gap-2 pt-1 text-sm sm:text-base leading-relaxed text-muted">
              <Quote aria-hidden className="mt-0.5 size-4 shrink-0 rotate-180 fill-saffron-600 text-saffron-600" />
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
              className="group inline-flex items-center justify-center gap-2 rounded-xl btn-sweep bg-btn px-7 py-3.5 text-sm sm:text-base font-bold text-ink hover:text-white shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <span>{isMr ? 'आपल्या उद्योजकीय प्रवासाची नोंद करा!' : 'Join the Movement'}</span>
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

/**
 * 2. Citizen Service Section (नागरिक सेवा केंद्र: तुमचे काम. थेट रोहनदादांपर्यंत.)
 * Rendered after "सामाजिक उपक्रम" (Social Activities) on the home page, on the white page with one Cloud card.
 */
export function CitizenServiceSection({
  locale = 'mr',
}: {
  locale?: 'mr' | 'en'
}) {
  const isMr = locale !== 'en'

  const actionCards = [
    {
      num: isMr ? '०१' : '01',
      icon: FileText,
      title: isMr ? 'कामाचे निवेदन' : 'Work Petition',
      desc: isMr
        ? 'आपल्या परिसरातील समस्या किंवा विकासकामांचे निवेदन थेट रोहनदादांपर्यंत पोहोचवा.'
        : 'Submit petitions regarding local development or civic issues directly to Rohan Deshmukh.',
      linkText: isMr ? 'निवेदन द्या' : 'Submit Petition',
      href: '/grievance',
    },
    {
      num: isMr ? '०२' : '02',
      icon: Calendar,
      title: isMr ? 'भेटीची विनंती' : 'Meeting Request',
      desc: isMr
        ? 'रोहनदादांना प्रत्यक्ष भेटून चर्चा करण्यासाठी व विचार मांडण्यासाठी वेळ निश्चित करा.'
        : 'Schedule a personal meeting to discuss ideas and development initiatives.',
      linkText: isMr ? 'वेळ मागा' : 'Request Meeting',
      href: '/appointment',
    },
    {
      num: isMr ? '०३' : '03',
      icon: Mail,
      title: isMr ? 'शुभकार्य आमंत्रण' : 'Event Invitation',
      desc: isMr
        ? 'विवाह सोहळा, उद्घाटन किंवा सामाजिक व कौटुंबिक कार्यक्रमाचे आमंत्रण पाठवा.'
        : 'Invite Rohan Deshmukh to weddings, inaugurations, or cultural celebrations.',
      linkText: isMr ? 'आमंत्रण पाठवा' : 'Send Invitation',
      href: '/invitation',
    },
  ]

  return (
    <section className="bg-paper py-16 sm:py-20 border-t border-line">
      <div className="container-x">
        <div className="mb-8 sm:mb-10 text-center sm:text-left">
          <span className="text-xs font-extrabold uppercase tracking-widest text-saffron-700">
            {isMr ? 'नागरिक सेवा केंद्र' : 'Citizen Service Portal'}
          </span>
          <h2 className="mt-1.5 font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-charcoal-900">
            {isMr ? (
              <>
                तुमचे काम. <span className="hl-saffron">थेट रोहनदादांपर्यंत.</span>
              </>
            ) : (
              <>
                Direct Citizen Access to <span className="hl-saffron">Rohan Deshmukh</span>
              </>
            )}
          </h2>
          <AccentBar className="mt-2.5 justify-center sm:justify-start" bar="h-1 w-14" dot="h-1.5 w-3" />
        </div>

        {/* Unified 3-Card Citizen Service Block (Exact subhashdeshmukh.com layout & animation) */}
        <Reveal delay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-line rounded-2xl sm:rounded-3xl bg-cream border border-line shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
            {actionCards.map((card) => {
              const Icon = card.icon
              return (
                <Link
                  key={card.title}
                  to={card.href}
                  className="group relative flex flex-col justify-between p-6 sm:p-8 hover:bg-paper transition-colors duration-300"
                >
                  {/* a saffron bar along the top on hover (the saffron · gold · green strip is kept for under the header) */}
                  <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-saffron-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Header: Icon on Left, Number on Right */}
                  <div className="flex items-start justify-between mb-5">
                    <span className="flex size-12 sm:size-13 items-center justify-center rounded-2xl bg-saffron-100 text-charcoal-900 group-hover:bg-saffron-600 group-hover:text-ink transition-all duration-300 shadow-sm group-hover:scale-108 group-hover:ring-4 group-hover:ring-saffron-200 group-hover:-translate-y-1">
                      <Icon className="size-6" />
                    </span>
                    {/* the big number is decoration only: drawn by CSS (::before), so it is not text that has to meet a contrast ratio */}
                    <span aria-hidden data-n={card.num} className="text-4xl sm:text-5xl font-black text-gold/45 group-hover:text-gold transition-colors duration-300 select-none leading-none font-display before:content-[attr(data-n)]" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-lg sm:text-xl text-charcoal-900 group-hover:text-saffron-700 transition-colors mb-2">
                      {card.title}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed mb-6">
                      {card.desc}
                    </p>
                  </div>

                  {/* Action Link with Slide Arrow */}
                  <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-saffron-700 group-hover:text-charcoal-900 transition-colors">
                    <span>{card.linkText}</span>
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </div>
                </Link>
              )
            })}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
