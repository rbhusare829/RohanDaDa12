import type { CSSProperties } from 'react'
import { Reveal, Stagger, StaggerItem } from './HomeMotion'
import { cn } from '@/lib/utils'

interface Milestone {
  year: string
  title: string
  description: string
  category: string
  image?: string
  imgPos?: string
}

type Text = { mr: string; en: string }

/** The four milestones of the home Journey, in both languages (Oct 2026). `place` is shown at the foot of each card. */
const MILESTONES: { title: Text; description: Text; place: Text; image: string; imgPos: string }[] = [
  {
    title: { mr: 'लिटल फ्लॉवर कॉन्व्हेंट स्कूल', en: 'Little Flower Convent School' },
    description: {
      mr: 'सोलापूरमधील लिटल फ्लॉवर कॉन्व्हेंट स्कूलमधून त्यांच्या प्रवासाची सुरुवात झाली. इयत्ता नववीत त्यांनी NCC मध्ये प्रवेश घेतला. येथे त्यांनी शिस्तीमुळे व्यक्तिमत्त्व घडते आणि नेतृत्व म्हणजे स्वतःपेक्षा इतरांच्या हिताला प्राधान्य देणे, हे शिकले.',
      en: 'His journey began at Little Flower Convent School in Solapur. In Class IX, he joined the NCC, where he learned that discipline builds character and leadership means putting the needs of others before his own.',
    },
    place: { mr: 'सोलापूर, महाराष्ट्र', en: 'Solapur, Maharashtra' },
    image: '/images/journey/journey-little-flower-school.webp',
    imgPos: 'object-center',
  },
  {
    title: { mr: 'NCC सर्वोत्कृष्ट कॅडेट', en: 'NCC Best Cadet' },
    description: {
      mr: 'NCC मधील उत्कृष्ट कामगिरीमुळे त्यांना नवी दिल्लीतील राष्ट्रीय संचलनात सहभागी होण्याची संधी मिळाली. तेथे त्यांची ‘सर्वोत्कृष्ट कॅडेट’ म्हणून निवड झाली. हा सन्मान त्यांच्या शिस्त, समर्पण आणि नेतृत्वगुणांची पोचपावती ठरला.',
      en: 'His outstanding performance in the NCC earned him the opportunity to participate in the National Parade in New Delhi. He was selected as the Best Cadet, a recognition of his discipline, dedication, and leadership.',
    },
    place: { mr: 'नवी दिल्ली, भारत', en: 'New Delhi, India' },
    // the NCC crest: shown whole (not cropped) on a white panel
    image: '/images/journey/journey-ncc-crest.webp',
    imgPos: 'object-contain bg-white p-2',
  },
  {
    title: { mr: 'रोचेस्टर इन्स्टिट्यूट ऑफ टेक्नॉलॉजी', en: 'Rochester Institute of Technology' },
    description: {
      mr: 'अमेरिकेतील रोचेस्टर इन्स्टिट्यूट ऑफ टेक्नॉलॉजी येथे त्यांनी जैवतंत्रज्ञान आणि उद्योजकता विकास या विषयांत उच्च शिक्षण घेतले. येथे विज्ञान आणि उद्योजकतेचा संगम अनुभवत, समाजाच्या जीवनात सकारात्मक बदल घडवणाऱ्या संकल्पनांना प्रत्यक्षात आणण्याची दृष्टी विकसित केली.',
      en: 'At Rochester Institute of Technology, he pursued advanced studies in Biotechnology and Entrepreneurship Development. There, he explored the intersection of science and enterprise, learning to turn discoveries into opportunities that could improve lives.',
    },
    place: { mr: 'रोचेस्टर, अमेरिका', en: 'Rochester, United States' },
    image: '/images/journey/journey-rit.webp',
    imgPos: 'object-center',
  },
  {
    title: { mr: 'लोकमंगल फाऊंडेशन | २०१६', en: 'Lokmangal Foundation | 2016' },
    description: {
      mr: 'समाजाच्या विकासासाठी योगदान देण्याच्या ध्येयाने त्यांनी २०१६ मध्ये लोकमंगल फाऊंडेशनच्या अध्यक्षपदाची जबाबदारी स्वीकारली. समाजहिताला केंद्रस्थानी ठेवून, लोकांच्या जीवनात सकारात्मक आणि दीर्घकालीन बदल घडवणाऱ्या उपक्रमांना दिशा देण्याचे कार्य त्यांनी हाती घेतले.',
      en: 'In 2016, he took on the role of President of Lokmangal Foundation with a clear purpose: to serve society. With public welfare at the heart of his work, he began guiding initiatives aimed at creating positive and lasting change in people’s lives.',
    },
    place: { mr: 'सोलापूर, महाराष्ट्र | २०१६', en: 'Solapur, Maharashtra | 2016' },
    image: '/images/lokmangal/lokmangal-foundation-rohan-speech.webp',
    imgPos: 'object-[30%_40%]',
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
  b: _b,
  locale = 'mr',
}: {
  b?: JourneyBlock
  locale?: 'mr' | 'en'
}) {
  const isMr = locale !== 'en'

  // the milestones are fixed here in both languages (the CMS Journey items are no longer used for the home page)
  const milestones: Milestone[] = MILESTONES.map((m) => ({
    year: isMr ? m.place.mr : m.place.en,
    title: isMr ? m.title.mr : m.title.en,
    description: isMr ? m.description.mr : m.description.en,
    category: '',
    image: m.image,
    imgPos: m.imgPos,
  }))

  // desktop: every milestone in full, side by side in equal columns (up to five in a row); phones and tablets swipe through them
  const cols = Math.min(milestones.length, 5)

  return (
    <section
      className="relative border-b border-stone-200 py-6 sm:py-10 lg:py-12 overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse 75% 85% at 100% 80%, #9ee0ac 0%, #cdf4d5 28%, #ebfbf0 52%, #ffffff 78%, #ffffff 100%)',
      }}
    >
      {/* Soft atmospheric bokeh lights from reference design */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 -right-10 size-80 rounded-full bg-[#9ee0ac]/35 blur-3xl -z-10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 right-[10%] size-60 rounded-full bg-[#c2f2cf]/40 blur-2xl -z-10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-1/4 right-[20%] size-24 rounded-full bg-white/70 blur-lg -z-10"
      />
      {/* Political Journey Heading, Parliament Emblem & Slogan */}
      <div className="container-x relative z-10 text-center mb-6 sm:mb-8">
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

          <Stagger
            className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0 lg:grid lg:overflow-visible lg:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]"
            style={{ '--cols': cols } as CSSProperties}
          >
            {milestones.map((m, i) => (
              <StaggerItem
                key={i}
                className="w-[84vw] max-w-[340px] shrink-0 snap-center sm:w-[320px] lg:w-auto lg:max-w-none relative z-10"
              >
                <div
                  className={cn(
                    // every card the same: photo, title, description right under it, then the place pinned to the bottom
                    'flex flex-col h-full rounded-2xl bg-white border border-stone-200/90 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-red-500',
                  )}
                >
                  {/* Milestone Photo Header */}
                  {m.image && (
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-stone-100 mb-4">
                      <img
                        src={m.image}
                        alt={m.title}
                        loading="lazy"
                        className={cn('size-full', !m.imgPos?.includes('object-contain') && 'object-cover', m.imgPos || 'object-top')}
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    <h4 className="font-display text-base sm:text-lg font-bold leading-snug text-[#000d3d]">
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
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  )
}
