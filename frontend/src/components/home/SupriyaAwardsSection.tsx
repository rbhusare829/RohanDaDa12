import { Link } from 'react-router'
import { m, type Variants } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { EASE_OUT } from '@/lib/motion'
import { AccentBar, Reveal, Stagger, StaggerItem } from '../ui/Motion'
import { cn } from '@/lib/utils'

interface FamilyItem {
  nameMr: string
  nameEn: string
  relationMr: string
  relationEn: string
  descMr: string
  descEn: string
  image: string
  link: string
}

const FAMILY_MEMBERS: FamilyItem[] = [
  {
    nameMr: 'कै. सुरेशचंद्र केशवराव देशमुख',
    nameEn: 'Late Sureshchandra Keshavrao Deshmukh',
    relationMr: 'आजोबा',
    relationEn: 'Grandfather',
    descMr: 'कै. सुरेशचंद्र देशमुख हे व्यवसायाने शिक्षक होते. निवृत्तीनंतर त्यांनी आपले जीवन अध्यात्माला समर्पित केले.',
    descEn: 'A teacher by profession and a man of deep faith, he spent his life in devotion through the Pandharpur Wari, prayer, bhajans and kirtans.',
    image: '/images/family/family-suresh-deshmukh.webp',
    link: '/about/biography',
  },
  {
    nameMr: 'मा. श्री. सुभाष (बापूसाहेब) देशमुख',
    nameEn: 'Hon. Shri Subhash (Bapusaheb) Deshmukh',
    relationMr: 'वडील',
    relationEn: 'Father',
    descMr: 'सुभाष देशमुख, ज्यांना सर्वजण बापूसाहेब म्हणून ओळखतात, हे लोकमंगल समूहाचे संस्थापक अध्यक्ष आणि दक्षिण सोलापूर मतदारसंघाचे आमदार आहेत.',
    descEn: 'Popularly known as Bapusaheb, he is the Founder President of the Lokmangal Group. As an elected representative in the Legislative Assembly and the Lok Sabha, he has worked for farmers, labourers, farm workers, unemployed youth, women and other sections of society.',
    image: '/images/family/family-subhash-deshmukh.webp',
    link: '/about/biography',
  },
  {
    nameMr: 'मनीष देशमुख',
    nameEn: 'Manish Deshmukh',
    relationMr: 'बंधू',
    relationEn: 'Brother',
    descMr: 'रोहन देशमुख यांचे थोरले बंधू मनीष देशमुख हे लोकमंगल पतसंस्थेचे अध्यक्ष, लोकमंगल बायोटेकचे चेअरमन आणि लोकमंगल फाउंडेशनचे उपाध्यक्ष म्हणून कार्यरत आहेत.',
    descEn: 'Manish is President of Lokmangal Patsanstha, Chairman of Lokmangal Biotech and Vice President of Lokmangal Foundation.',
    image: '/images/family/family-manish-deshmukh.webp',
    link: '/about/biography',
  },
]

/** the portrait rises into its panel after its card (nested in the Stagger below; `custom` = the card's number, so the portraits follow one another too) */
const rise: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: (i: number) => ({ opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, delay: 0.14 + i * 0.07, ease: EASE_OUT } }),
}

/** Same colour families as the कौटुंबिक पार्श्वभूमी page (kesariya, green, navy): the photo panel tint, the halo (father only) */
const ACCENTS = [
  { panel: 'from-saffron-100/90 via-saffron-50 to-orange-50/60', halo: '' },
  { panel: 'from-emerald-100/80 via-leaf-50 to-emerald-50/50', halo: 'bg-leaf-300/35' },
  { panel: 'from-slate-200/90 via-slate-100 to-indigo-50/50', halo: '' },
] as const

/**
 * Family Background Section on Home Page: the three family members as cards in the style of the कौटुंबिक पार्श्वभूमी page —
 * a tinted photo panel with the cut-out portrait and relation label, then the name, a short description and "अधिक वाचा".
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
        {/* Section Header */}
        <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              {isMr ? 'कौटुंबिक पार्श्वभूमी' : 'Family Background'}
            </h2>
            <AccentBar className="mt-2.5" />
          </div>
        </Reveal>

        <Stagger className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 py-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-3 lg:gap-7">
            {FAMILY_MEMBERS.map((member, i) => {
              const a = ACCENTS[i % ACCENTS.length]
              return (
                <StaggerItem
                  as="article"
                  key={i}
                  className={cn(
                    'group relative flex w-[82vw] max-w-[340px] shrink-0 snap-center flex-col rounded-3xl sm:h-full sm:w-auto sm:max-w-none sm:shrink sm:snap-align-none bg-white p-3.5 shadow-[0_16px_36px_-24px_rgba(14,30,52,0.25)] ring-1 ring-stone-200/85',
                    'transition-[box-shadow,translate] duration-300 ease-soft hover:shadow-[0_28px_56px_-24px_rgba(14,30,52,0.35)] motion-safe:hover:-translate-y-1.5',
                                  )}
                >
                  {/* Photo panel: a soft tint, a halo behind the person, the relation label */}
                  <div className={cn('relative isolate aspect-[4/3.1] overflow-hidden rounded-2xl bg-gradient-to-b', a.panel)}>
                    {a.halo && <span aria-hidden className={cn('absolute left-1/2 top-[56%] -z-10 aspect-square w-[76%] -translate-x-1/2 -translate-y-1/2 rounded-full', a.halo)} />}
                    <span className="absolute left-3 top-3 z-10 text-[11px] font-bold uppercase tracking-wider text-[#800020]">
                      {isMr ? member.relationMr : member.relationEn}
                    </span>
                    {/* the portrait settles into its panel a moment after the card has arrived */}
                    <m.div variants={rise} custom={i} className="absolute inset-x-[4%] bottom-0 top-[10%]">
                      <img
                        src={member.image}
                        alt={isMr ? member.nameMr : member.nameEn}
                        loading="lazy"
                        className="size-full origin-bottom object-contain object-bottom transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.04]"
                      />
                    </m.div>
                  </div>

                  {/* Name, rule and short description */}
                  <div className="flex flex-1 flex-col px-2 pb-2 pt-3.5">
                    <h3 className="font-display text-lg sm:text-xl font-bold leading-snug tracking-tight text-charcoal-950 line-clamp-2">
                      {isMr ? member.nameMr : member.nameEn}
                    </h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-slate-600 mb-3 flex-1 line-clamp-3">
                      {isMr ? member.descMr : member.descEn}
                    </p>

                    <Link
                      to={member.link}
                      className="group/btn tap-pad mt-auto inline-flex items-center gap-1 self-start text-xs font-bold text-red-600 hover:text-[#000d3d] transition-colors"
                    >
                      <span>{isMr ? 'अधिक वाचा' : 'Read more'}</span>
                      <ArrowRight className="size-3 transition-transform group-hover/btn:translate-x-0.5" />
                    </Link>
                  </div>
                </StaggerItem>
              )
            })}
        </Stagger>
      </div>
    </section>
  )
}
