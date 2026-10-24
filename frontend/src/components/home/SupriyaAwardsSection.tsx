import { Link } from 'react-router'
import { Award, ChevronRight } from 'lucide-react'
import { Reveal } from '../ui/Motion'

interface AwardItem {
  titleMr: string
  titleEn: string
  descMr: string
  descEn: string
  image: string
  imgPos?: string
}

const AWARDS: AwardItem[] = [
  {
    titleMr: 'NCC बेस्ट कॅडेट राष्ट्रीय सन्मान',
    titleEn: 'NCC Best Cadet National Honour',
    descMr: 'नवी दिल्ली — प्रजासत्ताक दिन संचलन',
    descEn: 'Republic Day Camp, New Delhi',
    image: '/images/gallery/political/rd-political-06.webp',
    imgPos: 'object-top',
  },
  {
    titleMr: 'RIT अमेरिका उच्च शिक्षण गौरव',
    titleEn: 'RIT USA Higher Education',
    descMr: 'रोचेस्टर इन्स्टिट्यूट (जैवतंत्रज्ञान व उद्योजकता)',
    descEn: 'Rochester Institute of Tech (Biotechnology)',
    image: '/images/gallery/political/rd-political-02.webp',
    imgPos: 'object-[center_15%]',
  },
  {
    titleMr: 'सहकार गौरव व बँक नेतृत्व सन्मान',
    titleEn: 'Cooperative Banking Leadership',
    descMr: 'शेतकरी व महिला बचत गट सबलीकरण',
    descEn: 'Farmers & Women SHG Empowerment',
    image: '/images/gallery/political/rd-political-05.webp',
    imgPos: 'object-top',
  },
  {
    titleMr: 'लोकमंगल लोटस शिष्यवृत्ती गौरव',
    titleEn: 'LOTUS Scholarship Scheme',
    descMr: '२२५+ गुणवंत विद्यार्थ्यांना ९० लाखांचे साहाय्य',
    descEn: '225+ Students supported with ₹90+ Lakhs',
    image: '/images/gallery/political/rd-political-04.webp',
    imgPos: 'object-top',
  },
  {
    titleMr: 'लोकमंगल अन्नपूर्णा सेवा सन्मान',
    titleEn: 'Annapurna Seva Recognition',
    descMr: 'सिव्हिल हॉस्पिटल येथे दररोज मोफत भोजन सेवा',
    descEn: 'Daily Free Meals for Hospital Patients',
    image: '/images/gallery/political/rd-political-01.webp',
    imgPos: 'object-top',
  },
  {
    titleMr: 'सर्वधर्मीय सामूहिक विवाह सोहळे',
    titleEn: 'Mass Community Weddings',
    descMr: '३,०००+ गरीब कुटुंबांचे कर्जमुक्त विवाह',
    descEn: '3,000+ Couples Married Debt-free',
    image: '/images/gallery/political/rd-political-03.webp',
    imgPos: 'object-top',
  },
]

/**
 * Achievements & Awards Section (100% Supriya Sule speasyimagegallery Layout):
 * Deep navy background, white heading, 6-column image card gallery with title beneath.
 */
export function SupriyaAwardsSection({
  locale = 'mr',
}: {
  locale?: 'mr' | 'en'
}) {
  const isMr = locale !== 'en'

  return (
    <section className="bg-[#000d3d] py-14 sm:py-20 text-white overflow-hidden border-b border-white/10">
      <div className="container-x">
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Award className="size-5 text-saffron-400" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-saffron-400">
                {isMr ? 'गौरव व सन्मान' : 'Recognition'}
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              {isMr ? 'सन्मान आणि पुरस्कार' : 'Achievements & Awards'}
            </h2>
          </div>

          <Link
            to="/political-career"
            className="group inline-flex items-center gap-1.5 text-sm sm:text-base font-bold text-white hover:text-saffron-400 transition-colors shrink-0"
          >
            <span>{isMr ? 'सर्व पहा' : 'View all'}</span>
            <ChevronRight className="size-4.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 6-Column Speasy Image Gallery Grid */}
        <Reveal delay={0.1}>
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 py-2 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {AWARDS.map((item, i) => (
              <div key={i} className="w-[60vw] max-w-[210px] shrink-0 snap-center sm:w-auto sm:shrink">
                <Link
                  to="/political-career"
                  className="group flex flex-col h-full overflow-hidden rounded-xl bg-white/5 border border-white/15 p-2 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/10 hover:border-saffron-400"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-black/40">
                    <img
                      src={item.image}
                      alt={isMr ? item.titleMr : item.titleEn}
                      loading="lazy"
                      className={`size-full object-cover ${item.imgPos || 'object-top'} transition-transform duration-500 group-hover:scale-105`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                  </div>
                  <div className="p-2.5 text-center flex-1 flex flex-col justify-center">
                    <span className="font-display text-xs sm:text-[13px] font-bold text-white leading-snug line-clamp-2 group-hover:text-saffron-300 transition-colors">
                      {isMr ? item.titleMr : item.titleEn}
                    </span>
                    <span className="text-[11px] text-slate-300 mt-1 line-clamp-1">
                      {isMr ? item.descMr : item.descEn}
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
