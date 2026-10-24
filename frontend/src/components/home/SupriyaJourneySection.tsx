import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Reveal } from '../ui/Motion'
import { cn } from '@/lib/utils'

interface Milestone {
  year: string
  title: string
  description: string
  category: string
  image?: string
  imgPos?: string
}

const MILESTONES: Milestone[] = [
  {
    year: '2024',
    title: 'लोकसभा संवाद व ग्रामीण विकास मोहीम',
    description: 'सोलापूर आणि धाराशिव भागातील गावागावांत थेट जनतेशी संवाद साधत, शेतकरी व तरुणांच्या हक्कासाठी व्यापक लोकचळवळ.',
    category: 'जनसंवाद व नेतृत्व',
    image: '/images/gallery/political/rd-political-06.webp',
    imgPos: 'object-top',
  },
  {
    year: '2019',
    title: 'लोकमंगल मल्टीस्टेट बँकेचा विस्तार',
    description: 'ग्रामीण महाराष्ट्रातील शेतकरी व महिला बचत गटांना आर्थिक पाठबळ देण्यासाठी सहकार क्षेत्रात व्यापक विस्तार व आधुनिकीकरण.',
    category: 'सहकार व बँकिंग',
    image: '/images/gallery/political/rd-political-05.webp',
    imgPos: 'object-top',
  },
  {
    year: '2016',
    title: 'लोकमंगल फाऊंडेशनचे अध्यक्षपद',
    description: 'सर्वोपचार मोफत विवाह सोहळे, आरोग्य शिबिरे, शिक्षण आणि युवा सक्षमीकरणाच्या सामाजिक कामांची सूत्रे स्वीकारली.',
    category: 'सामाजिक कार्य',
    image: '/images/gallery/political/rd-political-04.webp',
    imgPos: 'object-top',
  },
  {
    year: '2012',
    title: 'RIT अमेरिका येथून उच्च शिक्षण',
    description: 'अमेरिकेतील रोचेस्टर इन्स्टिट्यूट ऑफ टेक्नॉलॉजी (RIT) येथून जैवतंत्रज्ञान व उद्योजकता विकास या विषयात उच्च शिक्षण पूर्ण.',
    category: 'उच्च शिक्षण व उद्योजकता',
    image: '/images/gallery/political/rd-political-02.webp',
    imgPos: 'object-[center_20%]',
  },
  {
    year: '2008',
    title: 'नवी दिल्ली — NCC बेस्ट कॅडेट सन्मान',
    description: 'नवी दिल्लीतील प्रजासत्ताक दिन NCC संचलनात महाराष्ट्राचे प्रतिनिधित्व आणि मानाचा ‘बेस्ट कॅडेट’ सन्मान प्राप्त.',
    category: 'नेतृत्व व सन्मान',
    image: '/images/portraits/rohan-deshmukh-introduction.webp',
    imgPos: 'object-top',
  },
]

import type { Home } from '@/types/cms'

type JourneyBlock = Extract<NonNullable<Home['sections']>[number], { blockType: 'homeJourney' }>

/**
 * Political Journey & Awards Section (100% Supriya Sule Layout):
 * Connected directly to real CMS journey milestones of Rohan Deshmukh!
 * - Political Journey title, Parliament/Emblem icon, "Leadership. Experience. Values."
 * - Horizontal interactive milestone timeline with red connecting line and node points
 */
export function SupriyaJourneySection({
  b,
  locale = 'mr',
}: {
  b?: JourneyBlock
  locale?: 'mr' | 'en'
}) {
  const isMr = locale !== 'en'
  const timelineRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)

  // Map verified photos matching the specific milestone topic
  const milestonePhotos = [
    { src: '/uploads/school-supplies-notebook-01.webp', pos: 'object-top' }, // 0: Schooling / Little Flower / Education
    { src: '/images/gallery/political/rd-political-04.webp', pos: 'object-top' }, // 1: NCC Cadet / National Honour
    { src: '/images/gallery/political/rd-political-02.webp', pos: 'object-[center_20%]' }, // 2: RIT USA Higher Education
    { src: '/images/gallery/political/rd-political-05.webp', pos: 'object-top' }, // 3: Lokmangal Foundation Leadership
    { src: '/images/gallery/political/rd-political-06.webp', pos: 'object-top' }, // 4: PM Modi / Jan Samvad
  ]

  // Use real CMS items if available, else use verified default milestones
  const milestones: Milestone[] = (b?.items && b.items.length > 0)
    ? b.items.map((it, idx) => {
        const placeStr = it.place || ''
        const parts = placeStr.split('—').map((s) => s.trim())
        const yearOrPlace = parts[0] || (idx === 0 ? 'पायाभरणी' : idx === 1 ? 'अभिमानाचा क्षण' : idx === 2 ? '२०१२' : '२०१६')
        const cat = parts[1] || it.title || 'प्रवास'
        const pick = milestonePhotos[idx % milestonePhotos.length]
        return {
          year: yearOrPlace,
          title: it.title || '',
          description: it.text || '',
          category: cat,
          image: pick.src,
          imgPos: pick.pos,
        }
      })
    : MILESTONES

  const scrollTimeline = (direction: 'prev' | 'next') => {
    const el = timelineRef.current
    if (!el || !el.children.length) return
    const cardWidth = (el.children[0] as HTMLElement).offsetWidth + 24
    const next = direction === 'next' ? Math.min(activeIdx + 1, milestones.length - 1) : Math.max(activeIdx - 1, 0)
    el.scrollTo({ left: next * cardWidth, behavior: 'smooth' })
    setActiveIdx(next)
  }

  return (
    <section className="bg-gradient-to-b from-[#f8fafc] via-white to-[#f0f6fc] border-b border-stone-200 py-16 sm:py-24 overflow-hidden">
      {/* Political Journey Heading, Parliament Emblem & Slogan */}
      <div className="container-x text-center mb-12 sm:mb-16">
        <Reveal>
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-red-600">
            {isMr ? 'कारकीर्द' : 'Political Journey'}
          </span>

          <h2 className="mt-1 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#000d3d]">
            {isMr ? 'राजकीय व सामाजिक प्रवास' : 'Political Journey'}
          </h2>

          <div className="mt-2.5 mb-6 flex justify-center items-center gap-1.5">
            <span className="h-1 w-14 rounded-full bg-red-600" />
            <span className="h-1 w-3 rounded-full bg-saffron-500" />
          </div>

          {/* Parliament / Constitution Emblem Icon (Supriya Sule style) */}
          <div className="mx-auto my-4 grid size-16 place-items-center text-[#000d3d]">
            <svg viewBox="0 0 100 60" fill="currentColor" className="w-16 h-10 opacity-90">
              <path d="M 50 2 L 10 16 L 90 16 Z M 14 18 L 14 45 L 86 45 L 86 18 Z M 18 45 L 18 52 L 82 52 L 82 45 Z" />
              <rect x="22" y="22" width="6" height="20" rx="1" fill="#fff" />
              <rect x="34" y="22" width="6" height="20" rx="1" fill="#fff" />
              <rect x="47" y="22" width="6" height="20" rx="1" fill="#fff" />
              <rect x="60" y="22" width="6" height="20" rx="1" fill="#fff" />
              <rect x="72" y="22" width="6" height="20" rx="1" fill="#fff" />
            </svg>
          </div>

          <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#000d3d]">
            {isMr ? 'नेतृत्व. अनुभव. निष्ठा.' : 'Leadership. Experience. Values.'}
          </h3>

          <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-slate-600">
            {isMr
              ? 'सोलापूर आणि महाराष्ट्राच्या सर्वांगीण विकासासाठी सहकार, शिक्षण, उद्योग आणि समाजसेवेच्या माध्यमातून घेतलेली भरारी.'
              : 'Dedicated to grassroots public service, youth leadership, enterprise and rural empowerment across Maharashtra.'}
          </p>
        </Reveal>
      </div>

      {/* 3. Horizontal Interactive Milestone Timeline with Red Connecting Line */}
      <div className="container-x relative">
        {/* Timeline Navigation Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {isMr ? 'महत्त्वाचे टप्पे' : 'Key Milestones'} ({activeIdx + 1} / {milestones.length})
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollTimeline('prev')}
              disabled={activeIdx === 0}
              aria-label="Previous milestone"
              className="grid size-9 place-items-center rounded-full bg-red-600 text-white shadow-sm transition-all hover:bg-[#000d3d] disabled:opacity-30 disabled:pointer-events-none active:scale-95"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollTimeline('next')}
              disabled={activeIdx === milestones.length - 1}
              aria-label="Next milestone"
              className="grid size-9 place-items-center rounded-full bg-red-600 text-white shadow-sm transition-all hover:bg-[#000d3d] disabled:opacity-30 disabled:pointer-events-none active:scale-95"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        {/* Timeline Track with Red Line and Node Points */}
        <div className="relative">
          {/* Continuous Red Connecting Line (Desktop) */}
          <div
            aria-hidden
            className="hidden lg:block absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-red-600 z-0"
          />

          <div
            ref={timelineRef}
            className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 py-4 sm:mx-0 sm:px-0"
          >
            {milestones.map((m, i) => (
              <div
                key={i}
                className="w-[84vw] max-w-[340px] shrink-0 snap-center sm:w-[320px] relative z-10"
              >
                <div
                  className={cn(
                    'flex flex-col justify-between h-full rounded-2xl bg-white border p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl',
                    i === activeIdx ? 'border-red-500 ring-2 ring-red-500/20 shadow-md' : 'border-stone-200/90',
                  )}
                >
                  {/* Milestone Photo Header */}
                  {m.image && (
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-stone-100 mb-4">
                      <img
                        src={m.image}
                        alt={m.title}
                        loading="lazy"
                        className={cn('size-full object-cover', m.imgPos || 'object-top')}
                      />
                      <div className="absolute top-2 left-2 rounded bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
                        {m.year}
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {m.category}
                    </span>
                    <h4 className="mt-1 font-display text-base sm:text-lg font-bold leading-snug text-[#000d3d]">
                      {m.title}
                    </h4>
                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
                      {m.description}
                    </p>
                  </div>

                  {/* Red node indicator */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-red-600">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-red-600 animate-pulse" />
                      <span>{m.year}</span>
                    </span>
                    <span className="text-slate-400 font-normal">
                      {isMr ? 'टप्पा' : 'Milestone'} #{i + 1}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
