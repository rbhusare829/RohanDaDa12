import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { MapPin } from 'lucide-react'
import type { Home } from '@/types/cms'
import { cn } from '@/lib/utils'
import { Reveal } from './HomeMotion'

type JourneyBlock = Extract<NonNullable<Home['sections']>[number], { blockType: 'homeJourney' }>

interface MilestoneData {
  id: string
  yearTag: { mr: string; en: string }
  title: { mr: string; en: string }
  subtitle: { mr: string; en: string }
  description: { mr: string; en: string }
  location: { mr: string; en: string }
  image: string
  imgPos?: string
}

/** how long each milestone stays before the next one (Oct 2026: 2 seconds) */
const AUTOPLAY_MS = 5000

const MILESTONES: MilestoneData[] = [
  {
    id: 'school-ncc',
    yearTag: { mr: 'शालेय शिक्षण', en: 'School & NCC' },
    title: { mr: 'लिटल फ्लॉवर कॉन्व्हेंट स्कूल व NCC शिस्त', en: 'Little Flower Convent School & NCC' },
    subtitle: { mr: 'नेतृत्वाची व सामाजिक सेवेची पहिली पावले', en: 'First Steps in Leadership and Discipline' },
    description: {
      mr: 'सोलापूरमधील लिटल फ्लॉवर कॉन्व्हेंट स्कूलमधून त्यांच्या जीवनप्रवासाची सुरुवात झाली. इयत्ता नववीत त्यांनी NCC मध्ये प्रवेश घेतला. येथे त्यांनी शिस्तीमुळे व्यक्तिमत्त्व घडते आणि नेतृत्व म्हणजे स्वतःपेक्षा इतरांच्या हिताला प्राधान्य देणे, हे संस्कार आत्मसात केले.',
      en: 'His journey began at Little Flower Convent School in Solapur. In Class IX, he joined the NCC, learning that true discipline builds character and leadership means prioritizing the community before self.',
    },
    location: { mr: 'सोलापूर, महाराष्ट्र', en: 'Solapur, Maharashtra' },
    image: '/images/journey/journey-little-flower-school.webp',
    imgPos: 'object-center',
  },
  {
    id: 'best-cadet',
    yearTag: { mr: 'NCC सर्वोत्कृष्ट कॅडेट', en: 'Best Cadet Award' },
    title: { mr: 'नवी दिल्ली — राष्ट्रीय संचलन व सर्वोत्कृष्ट कॅडेट बहुमान', en: 'National Parade New Delhi — Best Cadet Award' },
    subtitle: { mr: 'राष्ट्रीय पातळीवर सोलापूरचे नाव उंचावणारा सन्मान', en: 'National Recognition for Excellence & Dedication' },
    description: {
      mr: 'NCC मधील उत्कृष्ट कामगिरी व अफाट शिस्तीमुळे त्यांना नवी दिल्लीतील राष्ट्रीय संचलनात सहभागी होण्याची संधी मिळाली. तेथे त्यांची ‘सर्वोत्कृष्ट कॅडेट’ म्हणून निवड झाली. हा सन्मान त्यांच्या राष्ट्रनिष्ठा, समर्पण आणि नेतृत्वगुणांची मोठी पावती ठरला.',
      en: 'Outstanding performance in NCC earned him selection for the National Parade in New Delhi, where he was adjudged Best Cadet — an honor reflecting his discipline, dedication, and leadership.',
    },
    location: { mr: 'नवी दिल्ली, भारत', en: 'New Delhi, India' },
    image: '/images/journey/journey-ncc-crest.webp',
    imgPos: 'object-contain bg-white p-3',
  },
  {
    id: 'usa-rit',
    yearTag: { mr: 'उच्च शिक्षण (अमेरिका)', en: 'Higher Studies (USA)' },
    title: { mr: 'रोचेस्टर इन्स्टिट्यूट ऑफ टेक्नॉलॉजी (RIT, USA)', en: 'Rochester Institute of Technology (USA)' },
    subtitle: { mr: 'जैवतंत्रज्ञान व उद्योजकता विकास पदवी', en: 'Biotechnology & Entrepreneurship Development' },
    description: {
      mr: 'अमेरिकेतील नामांकित रोचेस्टर इन्स्टिट्यूट ऑफ टेक्नॉलॉजी (RIT) येथे त्यांनी जैवतंत्रज्ञान आणि उद्योजकता विकास या विषयांत उच्च शिक्षण पूर्ण केले. जागतिक विज्ञान आणि आधुनिक तंत्रज्ञानाचा वापर ग्रामीण महाराष्ट्राच्या प्रगतीसाठी करण्याची दूरदृष्टी त्यांनी येथे विकसित केली.',
      en: 'At Rochester Institute of Technology in New York, he pursued advanced studies in Biotechnology and Entrepreneurship Development, developing a vision to leverage technology for rural Maharashtra’s economic growth.',
    },
    location: { mr: 'रोचेस्टर, अमेरिका', en: 'Rochester, New York, USA' },
    image: '/images/journey/journey-rit.webp',
    imgPos: 'object-center',
  },
  {
    id: 'lokmangal-foundation',
    yearTag: { mr: 'लोकमंगल नेतृत्व', en: 'Lokmangal Leadership' },
    title: { mr: 'लोकमंगल फाऊंडेशन — सामाजिक क्रांतीचे नेतृत्व', en: 'Lokmangal Foundation — Social Welfare Leadership' },
    subtitle: { mr: 'अन्नपूर्णा, सामूहिक विवाह व जनसेवेचे महायज्ञ', en: 'Annapurna Yojana, Mass Weddings & Public Service' },
    description: {
      mr: 'समाजातील वंचित आणि गरजू घटकांच्या सक्षमीकरणासाठी त्यांनी लोकमंगल फाऊंडेशनच्या अध्यक्षपदाची धुरा सांभाळली. अन्नपूर्णा योजना, सर्वधर्मीय सामुदायिक विवाह सोहळे, मोफत आरोग्य शिबिरे आणि जलसंधारण उपक्रमांच्या माध्यमातून लाखो कुटुंबांपर्यंत मदत पोहोचवली.',
      en: 'Leading Lokmangal Foundation, he spearheaded impactful initiatives including Annapurna Yojana, mass community weddings, free health camps, and water conservation projects benefiting countless families.',
    },
    location: { mr: 'सोलापूर व धाराशिव जिल्हा', en: 'Solapur & Dharashiv' },
    image: '/images/lokmangal/lokmangal-foundation-rohan-speech.webp',
    imgPos: 'object-cover object-top',
  },
]

export function SupriyaJourneySection({
  b: _b,
  locale = 'mr',
}: {
  b?: JourneyBlock
  locale?: 'mr' | 'en'
}) {
  const isMr = locale !== 'en'
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const progressRef = useRef(0)

  const activeMilestone = MILESTONES[activeIndex]

  /** show one milestone, its bar starting from empty */
  const go = useCallback((idx: number) => {
    progressRef.current = 0
    setProgress(0)
    setActiveIndex(idx)
  }, [])

  // Auto-play (Oct 2026): the next milestone every 2 seconds, its green bar filling meanwhile; it waits while the pointer is over the
  // card and carries on from where it was
  useEffect(() => {
    if (!isPlaying) return
    const step = 50
    const timer = setInterval(() => {
      progressRef.current += (step / AUTOPLAY_MS) * 100
      if (progressRef.current >= 100) {
        progressRef.current = 0
        setActiveIndex((i) => (i + 1) % MILESTONES.length)
      }
      setProgress(progressRef.current)
    }, step)
    return () => clearInterval(timer)
  }, [isPlaying])

  return (
    <section
      className="on-dark teal-depth relative isolate py-16 sm:py-20 lg:py-24 overflow-hidden text-paper"
      aria-labelledby="journey-timeline-heading"
    >
      {/* Political Journey: a Modern Teal band; saffron only for the timeline (its rail, nodes and progress) — soft saffron and jade glows behind */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -left-20 size-96 rounded-full bg-gold/15 blur-3xl -z-10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -right-20 size-96 rounded-full bg-leaf-600/15 blur-3xl -z-10"
      />

      <div className="container-x relative z-10">
        {/* Section Header (Inspired by subhashdeshmukh.com) */}
        <div className="text-center mb-8 sm:mb-12">
          <Reveal>
            <h2
              id="journey-timeline-heading"
              className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-paper"
            >
              {isMr ? 'कारकीर्द व प्रवास' : 'Journey & Milestones'}
            </h2>

            <div className="mt-3 flex justify-center items-center gap-1.5">
              <m.span
                className="h-1 w-16 rounded-full bg-gold origin-center"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
              <m.span
                className="h-1 w-3.5 rounded-full bg-paper/70"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              />
            </div>

            <p className="mt-3.5 mx-auto max-w-2xl text-sm sm:text-base text-paper/85 leading-relaxed font-normal">
              {isMr
                ? 'शालेय जीवनातील NCC शिस्तीपासून आंतरराष्ट्रीय उच्च शिक्षण आणि जनसेवेचे समर्थ नेतृत्व — रोहन देशमुख यांची प्रेरणादायी वाटचाल.'
                : 'From NCC cadet discipline to international higher education and transformative public leadership.'}
            </p>
          </Reveal>
        </div>

        {/* phones: thin saffron progress segments over a 2x2 grid of quiet tabs (subhashdeshmukh.com style) */}
        <div className="flex gap-1.5 mb-4 max-w-5xl mx-auto sm:hidden">
          {MILESTONES.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => go(idx)}
              className="h-1 flex-1 rounded-full bg-paper/20 overflow-hidden cursor-pointer transition-colors hover:bg-paper/40"
              title={isMr ? item.title.mr : item.title.en}
            >
              <div
                className="h-full bg-gold transition-[width] duration-75"
                style={{
                  width: idx < activeIndex ? '100%' : idx === activeIndex ? `${progress}%` : '0%',
                }}
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6 max-w-5xl mx-auto sm:hidden">
          {MILESTONES.map((item, idx) => {
            const isActive = activeIndex === idx
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => go(idx)}
                className={cn(
                  'flex min-h-11 items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-bold whitespace-nowrap text-center transition-[color,background-color,border-color] duration-300 select-none',
                  isActive ? 'border-paper bg-paper text-charcoal-900' : 'border-paper/25 text-paper/90 hover:bg-paper/10 hover:text-paper',
                )}
                aria-pressed={isActive}
              >
                {isActive && <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-gold" />}
                <span>{isMr ? item.yearTag.mr : item.yearTag.en}</span>
              </button>
            )
          })}
        </div>

        {/* from tablets up: the timeline — a thin rail with a node per milestone; the saffron fill runs up to the open one and on toward the
            next while it plays */}
        <div className="relative mx-auto mb-8 hidden max-w-5xl sm:block lg:mb-10">
          <div aria-hidden className="absolute left-[12.5%] right-[12.5%] top-[9px] h-0.5 rounded-full bg-paper/20">
            <div
              className="h-full rounded-full bg-gold transition-[width] duration-75"
              style={{ width: `${Math.min(100, ((activeIndex + progress / 100) / (MILESTONES.length - 1)) * 100)}%` }}
            />
          </div>
          <ol className="relative grid grid-cols-4">
            {MILESTONES.map((item, idx) => {
              const isActive = activeIndex === idx
              const reached = idx <= activeIndex
              return (
                <li key={item.id} className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => go(idx)}
                    aria-pressed={isActive}
                    className="group flex min-h-11 flex-col items-center gap-3 px-2 text-center select-none"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'size-5 rounded-full border-2 transition-[background-color,border-color,box-shadow] duration-300',
                        reached ? 'border-gold bg-gold' : 'border-paper/50 bg-charcoal-900 group-hover:border-paper',
                        isActive && 'shadow-[0_0_0_6px_rgba(233,149,50,0.22)]',
                      )}
                    />
                    <span className={cn('text-sm font-semibold leading-snug transition-colors lg:text-base', isActive ? 'text-paper' : 'text-paper/80 group-hover:text-paper')}>
                      {isMr ? item.yearTag.mr : item.yearTag.en}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </div>

        {/* Milestone Detail Card with Smooth Animation */}
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <m.div
              key={activeMilestone.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              onMouseEnter={() => setIsPlaying(false)}
              onMouseLeave={() => setIsPlaying(true)}
              className="on-light overflow-hidden rounded-2xl sm:rounded-3xl bg-paper text-ink shadow-2xl border border-cream"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Photo Column */}
                <div className="relative aspect-[16/10] lg:aspect-auto lg:col-span-5 bg-cream overflow-hidden">
                  <img
                    src={activeMilestone.image}
                    alt={isMr ? activeMilestone.title.mr : activeMilestone.title.en}
                    className={cn('size-full object-cover transition-transform duration-700 hover:scale-105', activeMilestone.imgPos)}
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-charcoal-950/60 via-transparent to-transparent lg:hidden"
                  />
                  <div className="absolute bottom-3 left-4 right-4 lg:hidden">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-charcoal-950/90 backdrop-blur-md px-3 py-1 text-xs font-semibold text-paper">
                      <MapPin className="size-3.5 text-gold" />
                      {isMr ? activeMilestone.location.mr : activeMilestone.location.en}
                    </span>
                  </div>
                </div>

                {/* Content Column */}
                <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10 lg:col-span-7">
                  <div>
                    {/* Header Location Badge */}
                    <div className="mb-2 hidden lg:flex items-center">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-cream border border-line px-3.5 py-1 text-xs font-bold text-charcoal-900">
                        <MapPin className="size-3.5 text-saffron-600" />
                        {isMr ? activeMilestone.location.mr : activeMilestone.location.en}
                      </span>
                    </div>

                    {/* Headline */}
                    <h3 className="font-display text-2xl sm:text-3xl font-bold leading-tight text-charcoal-900">
                      {isMr ? activeMilestone.title.mr : activeMilestone.title.en}
                    </h3>

                    <p className="mt-1.5 font-display text-sm sm:text-base font-bold text-saffron-700">
                      {isMr ? activeMilestone.subtitle.mr : activeMilestone.subtitle.en}
                    </p>

                    <div aria-hidden className="mt-3 mb-4 flex items-center gap-1.5">
                      <span className="h-1 w-12 rounded-full bg-gold" />
                      <span className="h-1 w-3 rounded-full bg-leaf-600" />
                    </div>

                    {/* Description */}
                    <p className="text-sm sm:text-base leading-relaxed text-ink">
                      {isMr ? activeMilestone.description.mr : activeMilestone.description.en}
                    </p>
                  </div>

                </div>
              </div>
            </m.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
