import type { CSSProperties } from 'react'
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
 * - Milestone timeline with red connecting line and node points: all milestones side by side on desktop, swipe on phones/tablets
 */
export function SupriyaJourneySection({
  b,
  locale = 'mr',
}: {
  b?: JourneyBlock
  locale?: 'mr' | 'en'
}) {
  const isMr = locale !== 'en'

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

  // desktop: every milestone in full, side by side in equal columns (up to five in a row); phones and tablets swipe through them
  const cols = Math.min(milestones.length, 5)

  return (
    <section className="bg-gradient-to-b from-[#f8fafc] via-white to-[#f0f6fc] border-b border-stone-200 py-6 sm:py-10 lg:py-12 overflow-hidden">
      {/* Political Journey Heading, Parliament Emblem & Slogan */}
      <div className="container-x text-center mb-6 sm:mb-8">
        <Reveal>
          {/* <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-red-600">
            {isMr ? 'कारकीर्द' : 'Political Journey'}
          </span> */}

          <h2 className="mt-1 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#000d3d]">
            {isMr ? 'प्रवास' : 'Journey'}
          </h2>

          <div className="mt-2.5 flex justify-center items-center gap-1.5">
            <span className="h-1 w-14 rounded-full bg-red-600" />
            <span className="h-1 w-3 rounded-full bg-saffron-500" />
          </div>

        </Reveal>
      </div>

      {/* 3. Horizontal Interactive Milestone Timeline with Red Connecting Line */}
      <div className="container-x relative">
        {/* Timeline Track with Red Line and Node Points */}
        <div className="relative">
          {/* Continuous Red Connecting Line (Desktop) */}
          <div
            aria-hidden
            className="hidden lg:block absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-red-600 z-0"
          />

          <div
            className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0 lg:grid lg:overflow-visible lg:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]"
            style={{ '--cols': cols } as CSSProperties}
          >
            {milestones.map((m, i) => (
              <div
                key={i}
                className="w-[84vw] max-w-[340px] shrink-0 snap-center sm:w-[320px] lg:w-auto lg:max-w-none relative z-10"
              >
                <div
                  className={cn(
                    'flex flex-col justify-between h-full rounded-2xl bg-white border p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl',
                    i === 0 ? 'border-red-500 ring-2 ring-red-500/20 shadow-md' : 'border-stone-200/90',
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
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center text-xs font-semibold text-red-600">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-red-600 animate-pulse" />
                      <span>{m.year}</span>
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
