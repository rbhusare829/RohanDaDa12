import {
  Calendar,
  GraduationCap,
  Heart,
  MapPin,
} from 'lucide-react'
import type { Page } from '@/types/cms'
import { cn } from '@/lib/utils'
import { Img } from '@/components/ui/Img'
import { Reveal } from '@/components/ui/Motion'
import { ROHAN_BIO } from '@/lib/rohan-bio'

type Block = NonNullable<Page['layout']>[number]

interface IntroJourneyProps {
  blocks?: Block[] | null
  locale?: 'mr' | 'en'
}

/**
 * स्वपरिचय (About / Introduction) Page — 100% modeled on Supriya Sule's official layout. Its words come from the client's
 * "RD Content" document (Oct 2026), in Marathi and English as written there:
 * 1. Early Life, Ideals & Core Philosophy (Left portrait, right narrative with philosophy quote)
 * 2. Positions Held ("महत्त्वाच्या जबाबदाऱ्या व पदे")
 * (Oct 2026: the dark-blue "जीवनचरित्र / Biography" + "Profile" section, and the Social Work and Vision sections, were removed)
 */
export function IntroJourney({ locale = 'mr' }: IntroJourneyProps) {
  const isMr = locale === 'mr'

  return (
    <div className="space-y-10 sm:space-y-20 lg:space-y-24">
      {/* 1. Early Life, Ideals & Core Philosophy */}
      <PhilosophySection isMr={isMr} />

      {/* 2. Positions Held (भूषविलेली पदे व जबाबदाऱ्या) */}
      <PositionsHeldSection isMr={isMr} />
    </div>
  )
}

/* ==========================================================================
   Section 1: Philosophy, Ideals & Early Life (विचारसरणी आणि समाजकारण)
   ========================================================================== */
function PhilosophySection({ isMr }: { isMr: boolean }) {
  return (
    <section className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
      {/* Left Column: Portrait Card */}
      <Reveal className="flex flex-col lg:col-span-5">
        <div className="group relative overflow-hidden rounded-3xl border border-stone-200/90 bg-white p-2.5 shadow-[0_20px_50px_-12px_rgba(9,20,34,0.18)] transition-all duration-500 hover:shadow-[0_28px_65px_-16px_rgba(9,20,34,0.28)]">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#000d3d]">
            <Img
              src="/images/portraits/rohan-blue-jacket-book.webp"
              alt={isMr ? 'रोहन सुभाष देशमुख' : 'Rohan Subhash Deshmukh'}
              fill
              priority
              className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-103"
              sizes="(max-width:1024px) 92vw, 460px"
            />
            {/* Subtle bottom badge */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#000d3d] via-[#000d3d]/60 to-transparent p-5 text-white">
              <p className="font-display text-xl font-bold">
                {isMr ? 'रोहन सुभाष देशमुख' : 'Rohan Subhash Deshmukh'}
              </p>
              <p className="text-xs font-semibold text-saffron-300">
                {isMr ? 'अध्यक्ष, लोकमंगल फाउंडेशन' : 'President, Lokmangal Foundation'}
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Right Column: Narrative & Ideals */}
      <Reveal delay={0.1} className="flex flex-col space-y-6 lg:col-span-7">
        <div>
          {/* Heading / Core Tagline */}
          {/* phones: the Marathi line stays on one line, sized to the screen width */}
          <h2
            className={cn(
              'font-display font-bold leading-snug text-charcoal-950 sm:text-3xl lg:text-[2.1rem]',
              isMr ? 'whitespace-nowrap text-[clamp(0.85rem,3.9vw,1.5rem)] sm:whitespace-normal' : 'text-2xl',
            )}
          >
            {isMr ? 'सर्वसामान्यांच्या हितासाठी आणि सर्वांगीण विकासासाठी कटिबद्ध' : "I'm committed to the betterment of the people"}
          </h2>

          {/* Signature red and saffron underline bar */}
          <div className="mt-3.5 flex items-center gap-1.5">
            <span className="h-1.5 w-14 rounded-full bg-red-600" />
            <span className="h-1.5 w-3.5 rounded-full bg-saffron-500" />
          </div>
        </div>

        {/* Structured biographical paragraphs */}
        <div className="space-y-4 text-base leading-relaxed text-charcoal-800 sm:text-[1.03rem]">
          {(isMr ? ROHAN_BIO.mr : ROHAN_BIO.en).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        {/* Quick Facts Grid */}
        <div className="grid grid-cols-2 gap-3.5 pt-2 sm:grid-cols-4">
          <QuickFactCard
            icon={Calendar}
            label={isMr ? 'जन्म' : 'Born'}
            val={isMr ? '१२ डिसेंबर १९८७' : '12 December 1987'}
          />
          <QuickFactCard
            icon={MapPin}
            label={isMr ? 'जन्मस्थान' : 'Birthplace'}
            val={isMr ? 'सोलापूर, देशमुख कुटुंब' : 'Solapur, into the Deshmukh family'}
          />
          <QuickFactCard
            icon={GraduationCap}
            label={isMr ? 'शिक्षण' : 'Education'}
            val={isMr ? 'रोचेस्टर इन्स्टिट्यूट ऑफ टेक्नॉलॉजी (RIT)' : 'Rochester Institute of Technology (RIT)'}
          />
          <QuickFactCard
            icon={Heart}
            label={isMr ? 'प्रेरणा' : 'Inspiration'}
            val={isMr ? 'स्वामी विवेकानंद' : 'Swami Vivekananda'}
          />
        </div>
      </Reveal>
    </section>
  )
}

function QuickFactCard({
  icon: Icon,
  label,
  val,
}: {
  icon: typeof Calendar
  label: string
  val: string
}) {
  return (
    <div className="rounded-2xl border border-stone-200/90 bg-stone-50/70 p-3.5 transition-all hover:border-saffron-300 hover:bg-white hover:shadow-sm">
      <div className="flex items-center gap-2 text-saffron-600">
        <Icon className="size-4" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">{label}</span>
      </div>
      <p className="mt-1 font-display text-sm font-bold text-charcoal-950 sm:text-[0.95rem]">{val}</p>
    </div>
  )
}

/* ==========================================================================
   Section 5: Positions Held (भूषविलेली पदे व जबाबदाऱ्या)
   (100% Supriya Sule "Positions Held" layout)
   ========================================================================== */
function PositionsHeldSection({ isMr }: { isMr: boolean }) {
  const positions = [
    {
      role: isMr ? 'अध्यक्ष' : 'President',
      org: isMr ? 'लोकमंगल फाउंडेशन' : 'Lokmangal Foundation',
      desc: isMr ? 'सन २००५ मध्ये माननीय श्री. सुभाष (बापू) देशमुख यांनी लोकमंगल फाउंडेशनची स्थापना केली. गरजू कुटुंबांना आधार देणे, प्रत्येक व्यक्तीला प्रगतीची संधी उपलब्ध करून देणे आणि ग्रामीण भागाच्या विकासाला चालना देणे, ही या संस्थेची प्रमुख उद्दिष्टे आहेत. फाउंडेशनचे अध्यक्ष म्हणून रोहन देशमुख विविध उपक्रमांचे नियोजन, अंमलबजावणी आणि प्रत्यक्ष कार्याचा आढावा घेण्याची जबाबदारी सांभाळतात.' : 'As President of Lokmangal Foundation, Rohan Deshmukh leads the Foundation and oversees every initiative, from planning to work on the ground. Founded in 2005 by Hon. Shri Subhash (Bapu) Deshmukh, the Foundation was built on a clear belief: every family in need should find support, every person should get a chance to grow, and every village should move forward.',
      image: '/images/positions/position-foundation-president.webp',
      imgPos: '30% 40%',
    },
    {
      role: isMr ? 'संचालक' : 'Director',
      org: isMr ? 'लोकमंगल मल्टीस्टेट' : 'Lokmangal Multistate',
      desc: isMr ? 'लोकमंगल मल्टीस्टेटच्या माध्यमातून रोहन सुभाष देशमुख यांनी अर्थकारणाच्या क्षेत्रातही आपला ठसा उमटवला. दोन राज्यांमध्ये ६० शाखांचे विस्तृत जाळे आणि ७०० कोटी रुपयांहून अधिक ठेवींच्या बळावर संस्थेने अल्पावधीत विश्वासार्हता व लौकिक मिळवला. प्रशिक्षित कर्मचारीवर्ग, तत्पर सेवा आणि पारदर्शक व्यवहारांच्या माध्यमातून आर्थिक साक्षरता वाढवणे आणि सर्वसामान्यांमध्ये आर्थिक जागरूकता निर्माण करणे, हा त्यांचा महत्त्वपूर्ण प्रयत्न राहिला आहे.' : 'Through Lokmangal Multistate, Rohan Subhash Deshmukh has made his mark in the world of finance as well. With a network of 60 branches across two states and deposits exceeding ₹700 crore, the institution has earned trust and a strong reputation in a short span of time. Backed by a trained team, prompt service, and transparent dealings, he has made it his mission to improve financial literacy and build financial awareness among ordinary people.',
      image: '/images/positions/position-lokmangal-multistate.webp',
      imgPos: '20% 50%',
    },
    {
      role: isMr ? 'अध्यक्ष' : 'Chairman',
      org: isMr ? 'लोकमंगल कॉलेज' : 'Lokmangal College',
      desc: isMr ? 'लोकमंगल कॉलेजचे अध्यक्ष रोहन सुभाष देशमुख यांचे जैवतंत्रज्ञान आणि उद्योजकतेतील शैक्षणिक पार्श्वभूमीमुळे या क्षेत्रांकडे पाहण्याची स्वतंत्र दृष्टी लाभली आहे. याच दृष्टिकोनातून वडाळा, ता. उत्तर सोलापूर येथे २०० एकरांच्या विस्तीर्ण परिसरात लोकमंगल जैवतंत्रज्ञान महाविद्यालयाची स्थापना करण्यात आली. आज येथे सुमारे १२०० विद्यार्थी शिक्षण घेत आहेत.' : 'Rohan Subhash Deshmukh, Chairman of Lokmangal College, draws on his background in biotechnology and entrepreneurship to bring a fresh vision to both fields. That vision led to the founding of Lokmangal College of Biotechnology on a 200-acre campus in Wadala, North Solapur, where around 1,200 students now study.',
      /* the Lokmangal Colleges crest, shown whole on a light panel */
      image: '/images/positions/position-lokmangal-college.webp',
      contain: true,
    },
    {
      role: isMr ? 'सरचिटणीस' : 'General Secretary',
      org: isMr ? 'भारतीय जनता युवा मोर्चा' : 'Bharatiya Janata Yuva Morcha',
      desc: isMr ? 'भारतीय जनता युवा मोर्चाचे सरचिटणीस म्हणून रोहन देशमुख यांनी महाराष्ट्रभर दौरे करून युवकांशी संवाद साधला.' : 'As General Secretary of the Bharatiya Janata Yuva Morcha, Rohan Deshmukh travelled across Maharashtra to connect with young people and raise their political awareness.',
      image: '/images/positions/position-bjym.webp',
      imgPos: '50% 20%',
    },
    {
      role: isMr ? 'अपक्ष उमेदवार' : 'Independent Candidate',
      org: isMr ? 'धाराशिव (उस्मानाबाद) लोकसभा निवडणूक' : 'Lok Sabha Election, Dharashiv (Osmanabad)',
      desc: isMr ? 'मतदारसंघातील विविध गावांना भेटी देत त्यांनी नागरिकांशी थेट संवाद साधला आणि आपले विचार त्यांच्यापर्यंत पोहोचवले.' : 'He took his ideas directly to voters, reaching every corner of the constituency.',
      image: '/images/positions/position-loksabha.webp',
      imgPos: '50% 30%',
    },
  ]

  return (
    <section className="rounded-3xl border border-stone-200/90 bg-stone-50/50 p-6 sm:p-10 lg:p-12">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-saffron-600">
          {isMr ? 'प्रशासकीय व संस्थात्मक अनुभव' : 'Governance & Institutional Experience'}
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-charcoal-950 sm:text-3xl">
          {isMr ? 'भूषविलेली पदे व जबाबदाऱ्या' : 'Positions Held'}
        </h2>
        {/* Signature red and saffron underline */}
        <div className="mt-2.5 flex items-center gap-1.5">
          <span className="h-1.5 w-14 rounded-full bg-red-600" />
          <span className="h-1.5 w-3.5 rounded-full bg-saffron-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {positions.map((item, idx) => {
          return (
            <div
              key={idx}
              className="group flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs transition-all duration-300 hover:border-saffron-300 hover:shadow-md hover:-translate-y-1"
            >
              <div>
                {/* the photo for this position */}
                <div className={cn('relative aspect-[4/3] overflow-hidden rounded-xl', item.contain || !item.image ? 'bg-[#f0f6fc]' : 'bg-stone-100')}>
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={`${item.role}, ${item.org}`}
                      loading="lazy"
                      decoding="async"
                      className={cn('size-full transition-transform duration-500 group-hover:scale-105', item.contain ? 'object-contain p-3' : 'object-cover')}
                      style={item.contain ? undefined : { objectPosition: item.imgPos }}
                    />
                  ) : (
                    <div className="flex size-full flex-col items-center justify-center gap-2 p-4 text-center text-[#000d3d]">
                      <GraduationCap aria-hidden className="size-10 text-red-600" />
                      <span className="font-display text-sm font-bold">{item.org}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-saffron-600">
                    {item.role}
                  </span>
                  <h3 className="font-display text-base font-bold text-charcoal-950 sm:text-lg">
                    {item.org}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-stone-600 sm:text-sm">
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
