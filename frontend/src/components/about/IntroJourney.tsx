import {
  Building,
  Calendar,
  GraduationCap,
  Heart,
  Landmark,
  MapPin,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react'
import type { Page } from '@/types/cms'
import { cn } from '@/lib/utils'
import { Img } from '@/components/ui/Img'
import { AccentBar, Reveal } from '@/components/ui/Motion'

type Block = NonNullable<Page['layout']>[number]

interface IntroJourneyProps {
  blocks?: Block[] | null
  locale?: 'mr' | 'en'
}

/**
 * स्वपरिचय (About / Introduction) Page — 100% modeled on Supriya Sule's official layout. Its words come from the client's
 * "RD Content" document (Oct 2026), in Marathi and English as written there:
 * 1. Early Life, Ideals & Core Philosophy (Left portrait, right narrative with philosophy quote)
 * 2. Social work (text beside a three-photo grid) and vision (with a highlighted key line)
 * 3. Positions Held ("महत्त्वाच्या जबाबदाऱ्या व पदे")
 * (Oct 2026: the dark-blue "जीवनचरित्र / Biography" + "Profile" section was removed)
 */
export function IntroJourney({ locale = 'mr' }: IntroJourneyProps) {
  const isMr = locale === 'mr'

  return (
    <div className="space-y-16 sm:space-y-20 lg:space-y-24">
      {/* 1. Early Life, Ideals & Core Philosophy */}
      <PhilosophySection isMr={isMr} />

      {/* 2. Family Upbringing, Mass Connect & Milestone Photo Banner */}
      <MilestoneSection isMr={isMr} />

      {/* 3. Positions Held (भूषविलेली पदे व जबाबदाऱ्या) */}
      <PositionsHeldSection isMr={isMr} />
    </div>
  )
}

/* ==========================================================================
   Section 1: Philosophy, Ideals & Early Life (विचारसरणी आणि समाजकारण)
   ========================================================================== */
function LeaderPortraitCard({ isMr }: { isMr: boolean }) {
  return (
    <div className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#000d3d] shadow-[0_20px_50px_-12px_rgba(9,20,34,0.22)] transition-all duration-500 hover:shadow-[0_28px_65px_-16px_rgba(9,20,34,0.32)]">
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
  )
}

function PhilosophySection({ isMr }: { isMr: boolean }) {
  return (
    <section className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
      {/* Left Column: Portrait Card (Desktop only: hidden on mobile) */}
      <Reveal className="hidden lg:flex lg:flex-col lg:col-span-5">
        <LeaderPortraitCard isMr={isMr} />
      </Reveal>

      {/* Right Column: Narrative & Ideals */}
      <Reveal delay={0.1} className="flex flex-col space-y-6 lg:col-span-7">
        <div>
          {/* Eyebrow badge */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-saffron-300 bg-saffron-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-saffron-700">
            <Sparkles className="size-3.5 text-saffron-600" />
            <span>{isMr ? 'सोलापूरच्या मातीशी जोडलेली नाळ' : 'Grounded in Solapur'}</span>
          </span>

          {/* Heading / Core Tagline */}
          <h2 className="mt-4 font-display text-2xl font-bold leading-snug text-charcoal-950 sm:text-3xl lg:text-[2.1rem]">
            {isMr ? 'सोलापूरचा नवा स्वर, नव्या भारताचा नवा विश्वास.' : 'A new voice from Solapur. A new voice for a new India.'}
          </h2>

          {/* Signature red and saffron underline bar */}
          <AccentBar className="mt-3.5" bar="h-1.5 w-14" dot="h-1.5 w-3.5" />
        </div>

        {/* Structured biographical paragraphs */}
        <div className="space-y-4 text-base leading-relaxed text-charcoal-800 sm:text-[1.03rem]">
          <p>
            {isMr ? 'रोहन सुभाष देशमुख हे सोलापूर येथील उद्योजक, लेखक आणि समाजकार्यकर्ते आहेत. नव्या विचारांकडे सकारात्मक दृष्टिकोनातून पाहत, नावीन्यपूर्ण उपक्रम राबवण्याची आणि समाजाच्या प्रगतीत योगदान देण्याची जिद्द बाळगणारे ते एक तरुण नेतृत्व. स्वामी विवेकानंदांच्या विचारांपासून प्रेरणा घेत त्यांनी आपल्या कार्याची दिशा निश्चित केली. आत्मविश्वासू आणि स्वावलंबी तरुणाई हाच सक्षम राष्ट्राचा पाया, असा त्यांचा ठाम विश्वास आहे. युवाशक्ती, उद्योजकता आणि स्वावलंबन हे त्यांच्या कार्याचे तीन प्रमुख आधारस्तंभ असून, तरुणांनी केवळ रोजगाराच्या संधी शोधण्यापुरते मर्यादित न राहता रोजगारनिर्मिती करणारे व्हावे, हा त्यांच्या विचारांचा केंद्रबिंदू आहे.' : 'Rohan Subhash Deshmukh is an entrepreneur, author and social worker from Solapur. A young leader with a positive outlook, he is driven to do things differently, to turn fresh ideas into action and to contribute to society’s progress in his own way. Inspired by the thoughts of Swami Vivekananda, he has built his work around one belief: confident, self-reliant young people are the foundation of a strong nation. Youth power, enterprise and self-reliance are the three pillars of his work. His message to young people is clear: do not just look for jobs, become the ones who create them.'}
          </p>
          <p>
            {isMr ? 'आमदार श्री. सुभाष बापू देशमुख यांचे पुत्र म्हणून वाढताना त्यांना वडिलांच्या कामाचा, विचारांचा आणि समाजाशी असलेल्या नात्याचा जवळून अनुभव घेता आला. त्यांच्या वाटचालीतून कष्ट, सातत्य, धाडस आणि समाजाप्रती बांधिलकी या मूल्यांचे संस्कार रोहन यांच्यावर झाले. मात्र वडिलांकडून मिळालेले संस्कार ही त्यांच्या प्रवासाची केवळ सुरुवात आहे. समाजकार्याकडे ते केवळ तात्कालिक मदत म्हणून पाहत नाहीत. लोकांशी प्रत्यक्ष संवाद साधणे, त्यांच्या अडचणी समजून घेणे आणि समस्यांच्या मूळ कारणांचा शोध घेऊन शाश्वत उपाययोजना करणे, ही त्यांची कार्यपद्धती आहे.' : 'As the son of MLA Shri Subhash Bapu Deshmukh, Rohan grew up watching his father’s work, his thinking and his bond with the people up close. That journey taught him the value of hard work, consistency, courage and commitment to society. But this legacy is only the beginning of his own path. For Rohan, social work is not about temporary relief. He speaks to people directly, listens to their problems and looks for the root cause, so that the solutions last.'}
          </p>

          {/* Mobile Only: Portrait Card positioned after Paragraph 2 */}
          <div className="my-5 block lg:hidden">
            <LeaderPortraitCard isMr={isMr} />
          </div>

          <p>
            {isMr ? 'त्यांनी लिहिलेल्या "न्यू इंडिया मॅनिफेस्टो" या पुस्तकातून मिळालेल्या प्रेरणेतून संपूर्ण महाराष्ट्रात स्टार्टअप परिसंस्था (इकोसिस्टम) उभारण्याचा त्यांचा संकल्प आहे. उद्योजकता, लेखन आणि समाजकार्य या तिन्ही माध्यमांतून ते तरुणांसाठी नव्या संधी निर्माण करण्यासाठी आणि समाजाच्या सर्वांगीण विकासासाठी कार्यरत आहेत.' : 'Inspired by his book New India Manifesto, he is working to build a startup ecosystem across Maharashtra. Through enterprise, writing and social work, Rohan is creating new opportunities for young people and working for the all-round development of society.'}
          </p>
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
   Section 2: Social Work (समाजकार्य) and Vision (दृष्टिकोन) — Oct 2026 layout:
   the heading and text beside a captioned grid of three photos of the Lokmangal Foundation's work (community weddings, the
   Annapurna free-meal scheme, water conservation), then the vision text with its key line in a highlighted card.
   ========================================================================== */
const SOCIAL_PHOTOS = [
  { src: '/images/social-work/community-weddings.webp', mr: 'सर्वधर्मीय सामुदायिक विवाह सोहळा', en: 'Inter-faith community weddings' },
  { src: '/images/social-work/annapurna-meals.webp', mr: 'अन्नपूर्णा मोफत भोजन योजना', en: 'Annapurna free meal scheme' },
  { src: '/images/social-work/water-conservation.webp', mr: 'लोकमंगल जलसंधारण कार्यक्रम', en: 'Lokmangal water conservation' },
]

function MilestoneSection({ isMr }: { isMr: boolean }) {
  return (
    <section className="space-y-14 sm:space-y-16">
      {/* समाजकार्य: text on the left, the photos on the right */}
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
        <Reveal className="lg:col-span-5">
          <p className="text-xs font-extrabold uppercase tracking-widest text-red-600">{isMr ? 'समाजकार्य' : 'Social Work'}</p>
          <h2 className="mt-1.5 font-display text-2xl font-bold leading-snug tracking-tight text-[#000d3d] sm:text-3xl">
            {isMr ? 'लोकमंगल फाउंडेशन — सोलापूर आणि धाराशिव' : 'Lokmangal Foundation — Solapur and Dharashiv'}
          </h2>
          <AccentBar className="mt-3 mb-5" bar="h-1 w-12" />
          <p className="text-base leading-relaxed text-slate-700 sm:text-[1.03rem]">
            {isMr ? 'लोकमंगल फाउंडेशनच्या माध्यमातून रोहन सुभाष देशमुख समाजाच्या गरजांनुसार विविध उपक्रम राबवतात. सोलापूर आणि धाराशिव जिल्ह्यांमध्ये कार्यरत असलेल्या या फाउंडेशनचा मुख्य उद्देश गरजू व्यक्तींना योग्य वेळी मदत करणे, त्यांच्या अडचणी दूर करण्यासाठी प्रयत्न करणे आणि त्यांना प्रगतीच्या संधी उपलब्ध करून देणे हा आहे. समाजातील विविध घटकांचे जीवनमान उंचावावे आणि त्यांना स्वावलंबी होण्यासाठी बळ मिळावे, यासाठी फाउंडेशन सातत्याने प्रयत्नशील आहे.' : 'Through Lokmangal Foundation, Rohan turns his ideas into action on the ground. The Foundation runs a range of social initiatives across Solapur and Dharashiv districts with one simple aim: to stand with people when they need it most and help them move forward.'}
          </p>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-7">
          {/* phones/tablets: the large photo on top, two below; desktop: the large photo on the left, two stacked on the right —
              a compact block about as tall as the text beside it */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:aspect-[16/10] lg:grid-cols-3 lg:grid-rows-2">
            {SOCIAL_PHOTOS.map((ph, i) => (
              <figure
                key={ph.src}
                className={cn('group relative overflow-hidden rounded-2xl bg-charcoal-950 shadow-sm ring-1 ring-stone-200/80', i === 0 ? 'col-span-2 aspect-[16/9] lg:row-span-2 lg:aspect-auto' : 'aspect-[4/3] lg:aspect-auto')}
              >
                <img
                  src={ph.src}
                  alt={isMr ? ph.mr : ph.en}
                  width={700}
                  height={549}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-2.5 pt-8 text-xs font-bold text-white sm:px-4 sm:pb-3 sm:text-sm">
                  {isMr ? ph.mr : ph.en}
                </figcaption>
              </figure>
            ))}
          </div>
        </Reveal>
      </div>

      {/* दृष्टिकोन: the text, then its key line in a highlighted card */}
      <Reveal delay={0.1} className="mx-auto max-w-4xl text-center">
        <p className="text-xs font-extrabold uppercase tracking-widest text-red-600">{isMr ? 'दृष्टिकोन' : 'Vision'}</p>
        <AccentBar center className="mt-2.5 mb-5" bar="h-1 w-12" />
        <p className="text-base leading-relaxed text-slate-700 sm:text-[1.03rem]">
          {isMr ? '‘न्यू इंडिया मॅनिफेस्टो’ या पुस्तकातून रोहन सुभाष देशमुख यांनी नवभारताच्या निर्मितीविषयीचा आपला दृष्टिकोन मांडला आहे. याच विचारांतून प्रेरणा घेत संपूर्ण महाराष्ट्रात सक्षम उद्योजकीय परिसंस्था उभारण्याचा त्यांचा संकल्प आहे. शहरांपासून गावांपर्यंतच्या तरुणांना योग्य मार्गदर्शन, सहकार्य आणि संधी उपलब्ध करून देत त्यांच्या कल्पनांचे यशस्वी व्यवसायांत रूपांतर व्हावे, हा त्यांच्या प्रयत्नांचा मुख्य उद्देश आहे.' : 'Rohan is the author of New India Manifesto, a book that sets out his ideas for a new India. Inspired by it, he has set out to build a strong startup ecosystem across Maharashtra, where young people with ideas get the right guidance, support and opportunity to grow, whether they come from a big city or a small town.'}
        </p>
        <p className="mt-6 rounded-2xl border-l-4 border-red-600 bg-[#f0f6fc] px-6 py-5 text-left font-display text-lg font-bold leading-snug text-[#000d3d] shadow-sm sm:px-8 sm:text-xl">
          {isMr ? 'तरुणांनी स्वतःच्या क्षमतेवर विश्वास ठेवून स्वावलंबी व्हावे आणि रोजगार शोधण्याऐवजी रोजगारनिर्मिती करावी, हा त्यांच्या दृष्टिकोनाचा केंद्रबिंदू आहे.' : 'Rooted in Solapur and focused on the future, Rohan’s journey has one clear goal: to give the next generation the confidence and the chance to build something of their own.'}
        </p>
      </Reveal>
    </section>
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
      period: isMr ? 'सध्या' : 'Today',
      desc: isMr ? 'फाउंडेशनचे अध्यक्ष म्हणून रोहन देशमुख विविध उपक्रमांचे नियोजन, अंमलबजावणी आणि प्रत्यक्ष कार्याचा आढावा घेण्याची जबाबदारी सांभाळतात.' : 'As President of Lokmangal Foundation, Rohan Deshmukh leads the Foundation and oversees every initiative, from planning to work on the ground.',
      icon: Building,
    },
    {
      role: isMr ? 'संचालक' : 'Director',
      org: isMr ? 'लोकमंगल मल्टिस्टेट' : 'Lokmangal Multistate',
      period: isMr ? 'सध्या' : 'Today',
      desc: isMr ? 'माननीय श्री. सुभाष देशमुख यांनी स्थापन केलेला लोकमंगल समूह आज बँकिंग, उद्योग, शिक्षण, आरोग्यसेवा आणि समाजसेवा अशा विविध क्षेत्रांत कार्यरत आहे.' : 'Founded by Hon. Shri Subhash Deshmukh, the Lokmangal Group has grown over the years into a large family working in banking, industry, education, healthcare and social service.',
      icon: Landmark,
    },
    {
      role: isMr ? 'सरचिटणीस' : 'General Secretary',
      org: isMr ? 'भारतीय जनता युवा मोर्चा' : 'Bharatiya Janata Yuva Morcha',
      period: isMr ? 'महाराष्ट्र' : 'Maharashtra',
      desc: isMr ? 'भारतीय जनता युवा मोर्चाचे सरचिटणीस म्हणून रोहन देशमुख यांनी महाराष्ट्रभर दौरे करून युवकांशी संवाद साधला.' : 'As General Secretary of the Bharatiya Janata Yuva Morcha, Rohan Deshmukh travelled across Maharashtra to connect with young people and raise their political awareness.',
      icon: Trophy,
    },
    {
      role: isMr ? 'अपक्ष उमेदवार' : 'Independent Candidate',
      org: isMr ? 'धाराशिव (उस्मानाबाद) लोकसभा निवडणूक' : 'Lok Sabha Election, Dharashiv (Osmanabad)',
      period: isMr ? 'धाराशिव' : 'Dharashiv',
      desc: isMr ? 'मतदारसंघातील विविध गावांना भेटी देत त्यांनी नागरिकांशी थेट संवाद साधला आणि आपले विचार त्यांच्यापर्यंत पोहोचवले.' : 'He took his ideas directly to voters, reaching every corner of the constituency.',
      icon: Users,
    },
    {
      role: isMr ? 'लेखक' : 'Author',
      org: isMr ? 'द न्यू इंडिया मॅनिफेस्टो' : 'The New India Manifesto',
      period: isMr ? 'पुस्तक' : 'Book',
      desc: isMr ? '‘द न्यू इंडिया मॅनिफेस्टो’ या पुस्तकातून रोहन सुभाष देशमुख यांनी उद्योजकतेच्या माध्यमातून भारताच्या विकासाला नवी दिशा देण्याचा विचार मांडला आहे.' : 'In The New India Manifesto, Rohan Subhash Deshmukh sets out a simple idea: India’s growth can take a new direction through enterprise.',
      icon: GraduationCap,
    },
  ]

  return (
    <section className="rounded-3xl border border-stone-200/90 bg-stone-50/50 p-6 sm:p-10 lg:p-12">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-saffron-700">
          {isMr ? 'प्रशासकीय व संस्थात्मक अनुभव' : 'Governance & Institutional Experience'}
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-charcoal-950 sm:text-3xl">
          {isMr ? 'भूषविलेली पदे व जबाबदाऱ्या' : 'Positions Held'}
        </h2>
        {/* Signature red and saffron underline */}
        <AccentBar className="mt-2.5" bar="h-1.5 w-14" dot="h-1.5 w-3.5" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {positions.map((item, idx) => {
          const Icon = item.icon
          return (
            <div
              key={idx}
              className="group flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs transition-all duration-300 hover:border-saffron-300 hover:shadow-md hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-saffron-50 text-saffron-600 transition-colors group-hover:bg-[#000d3d] group-hover:text-white">
                    <Icon className="size-5" />
                  </span>
                  <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-bold text-stone-600">
                    {item.period}
                  </span>
                </div>

                <div className="mt-3.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-saffron-700">
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
