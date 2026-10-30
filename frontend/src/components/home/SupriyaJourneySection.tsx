import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { ChevronLeft, ChevronRight, MapPin, Pause, Play } from 'lucide-react'
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

  const activeMilestone = MILESTONES[activeIndex]

  const nextMilestone = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % MILESTONES.length)
    setProgress(0)
  }, [])

  const prevMilestone = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + MILESTONES.length) % MILESTONES.length)
    setProgress(0)
  }, [])

  // Auto-play timer with smooth segmented progress bar (identical to subhashdeshmukh.com)
  useEffect(() => {
    if (!isPlaying) return
    setProgress(0)
    const interval = 50
    const duration = 6000
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextMilestone()
          return 0
        }
        return prev + (interval / duration) * 100
      })
    }, interval)
    return () => clearInterval(timer)
  }, [isPlaying, activeIndex, nextMilestone])

  return (
    <section
      className="relative py-14 sm:py-18 lg:py-22 overflow-hidden text-white"
      style={{
        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 45%, #c2410c 100%)',
      }}
      aria-labelledby="journey-timeline-heading"
    >
      {/* Decorative Indian Tricolor Aura in background */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -left-20 size-96 rounded-full bg-[#ffedd5]/25 blur-3xl -z-10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -right-20 size-96 rounded-full bg-[#138808]/20 blur-3xl -z-10"
      />

      <div className="container-x relative z-10">
        {/* Section Header (Inspired by subhashdeshmukh.com) */}
        <div className="text-center mb-8 sm:mb-12">
          <Reveal>
            <h2
              id="journey-timeline-heading"
              className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white drop-shadow-sm"
            >
              {isMr ? 'कारकीर्द व प्रवास' : 'Journey & Milestones'}
            </h2>

            <div className="mt-3 flex justify-center items-center gap-1.5">
              <m.span
                className="h-1 w-16 rounded-full bg-white origin-center"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
              <m.span
                className="h-1 w-3.5 rounded-full bg-[#138808]"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              />
            </div>

            <p className="mt-3.5 mx-auto max-w-2xl text-sm sm:text-base text-white/90 leading-relaxed font-normal">
              {isMr
                ? 'शालेय जीवनातील NCC शिस्तीपासून आंतरराष्ट्रीय उच्च शिक्षण आणि जनसेवेचे समर्थ नेतृत्व — रोहन देशमुख यांची प्रेरणादायी वाटचाल.'
                : 'From NCC cadet discipline to international higher education and transformative public leadership.'}
            </p>
          </Reveal>
        </div>

        {/* Segmented Progress Bars (subhashdeshmukh.com style) */}
        <div className="flex gap-1.5 sm:gap-2 mb-4 max-w-5xl mx-auto">
          {MILESTONES.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => {
                setActiveIndex(idx)
                setProgress(0)
              }}
              className="h-1.5 sm:h-2 flex-1 rounded-full bg-white/40 overflow-hidden cursor-pointer transition-colors hover:bg-white/60"
              title={isMr ? item.title.mr : item.title.en}
            >
              <div
                className="h-full bg-[#138808] transition-[width] duration-75"
                style={{
                  width: idx < activeIndex ? '100%' : idx === activeIndex ? `${progress}%` : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Interactive Milestone Selector Tabs (Inspired by subhashdeshmukh.com) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6 sm:mb-8 max-w-5xl mx-auto">
          {MILESTONES.map((item, idx) => {
            const isActive = activeIndex === idx
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveIndex(idx)
                  setProgress(0)
                  setIsPlaying(false) // pause on manual user click
                }}
                className={cn(
                  'rounded-xl sm:rounded-2xl border px-2 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-base font-bold whitespace-nowrap text-center transition-all duration-300 select-none shadow-sm',
                  isActive
                    ? 'bg-[#138808] text-white border-[#138808] shadow-lg shadow-[#138808]/35 scale-[1.03]'
                    : 'bg-white/90 text-[#000d3d] border-white/80 hover:bg-white shadow-sm'
                )}
                aria-selected={isActive}
              >
                <span>{isMr ? item.yearTag.mr : item.yearTag.en}</span>
              </button>
            )
          })}
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
              className="overflow-hidden rounded-2xl sm:rounded-3xl bg-white text-[#000d3d] shadow-2xl border border-white/40"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Photo Column */}
                <div className="relative aspect-[16/10] lg:aspect-auto lg:col-span-5 bg-stone-100 overflow-hidden">
                  <img
                    src={activeMilestone.image}
                    alt={isMr ? activeMilestone.title.mr : activeMilestone.title.en}
                    className={cn('size-full object-cover transition-transform duration-700 hover:scale-105', activeMilestone.imgPos)}
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden"
                  />
                  <div className="absolute bottom-3 left-4 right-4 lg:hidden">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white">
                      <MapPin className="size-3.5 text-orange-400" />
                      {isMr ? activeMilestone.location.mr : activeMilestone.location.en}
                    </span>
                  </div>
                </div>

                {/* Content Column */}
                <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10 lg:col-span-7">
                  <div>
                    {/* Header Location Badge */}
                    <div className="mb-2 hidden lg:flex items-center">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 border border-orange-200/80 px-3.5 py-1 text-xs font-bold text-orange-700">
                        <MapPin className="size-3.5 text-orange-600" />
                        {isMr ? activeMilestone.location.mr : activeMilestone.location.en}
                      </span>
                    </div>

                    {/* Headline */}
                    <h3 className="font-display text-2xl sm:text-3xl font-bold leading-tight text-[#000d3d]">
                      {isMr ? activeMilestone.title.mr : activeMilestone.title.en}
                    </h3>

                    <p className="mt-1.5 font-display text-sm sm:text-base font-bold text-orange-600">
                      {isMr ? activeMilestone.subtitle.mr : activeMilestone.subtitle.en}
                    </p>

                    <div className="mt-3 mb-4 flex items-center gap-1.5">
                      <span className="h-1 w-12 rounded-full bg-red-600" />
                      <span className="h-1 w-3 rounded-full bg-saffron-500" />
                    </div>

                    {/* Description */}
                    <p className="text-sm sm:text-base leading-relaxed text-slate-700">
                      {isMr ? activeMilestone.description.mr : activeMilestone.description.en}
                    </p>
                  </div>

                  {/* Timeline Navigation Controls (subhashdeshmukh.com style) */}
                  <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-between gap-2 sm:gap-4">
                    {/* Previous Button */}
                    <button
                      type="button"
                      onClick={() => {
                        prevMilestone()
                        setIsPlaying(false)
                      }}
                      className="inline-flex items-center gap-1 sm:gap-1.5 rounded-xl bg-stone-100 hover:bg-orange-500 hover:text-white px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 transition-colors shrink-0"
                    >
                      <ChevronLeft className="size-4" />
                      <span>{isMr ? 'मागील' : 'Previous'}</span>
                    </button>

                    {/* Pause/Play Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="inline-flex items-center gap-1 rounded-full bg-stone-100 hover:bg-stone-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors"
                      title={isPlaying ? 'थांबवा' : 'सुरू करा'}
                    >
                      {isPlaying ? <Pause className="size-3 text-orange-600" /> : <Play className="size-3 fill-current text-emerald-600" />}
                      <span>{isPlaying ? (isMr ? 'थांबवा' : 'Pause') : (isMr ? 'सुरू करा' : 'Play')}</span>
                    </button>

                    {/* Next Button */}
                    <button
                      type="button"
                      onClick={() => {
                        nextMilestone()
                        setIsPlaying(false)
                      }}
                      className="inline-flex items-center gap-1 sm:gap-1.5 rounded-xl bg-orange-600 hover:bg-[#000d3d] px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white transition-colors shadow-sm shrink-0"
                    >
                      <span>{isMr ? 'पुढील' : 'Next'}</span>
                      <ChevronRight className="size-4" />
                    </button>
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
