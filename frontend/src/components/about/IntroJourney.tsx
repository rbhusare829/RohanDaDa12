import {
  Building,
  Calendar,
  CheckCircle2,
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
import { Reveal } from '@/components/ui/Motion'

type Block = NonNullable<Page['layout']>[number]

interface IntroJourneyProps {
  blocks?: Block[] | null
  locale?: 'mr' | 'en'
}

/**
 * स्वपरिचय (About / Introduction) Page — 100% modeled on Supriya Sule's official layout. Its words come from the client's
 * "RD Content" document (Oct 2026), in Marathi and English as written there:
 * 1. Early Life, Ideals & Core Philosophy (Left portrait, right narrative with philosophy quote)
 * 2. Family Upbringing, Mass Connect & Featured Milestone Photo (With signature blue caption box)
 * 3. Signature Dark Blue Section: "कार्यगौरव व उपक्रम" (Performance & Key Initiatives) + "Profile" Card
 * 4. Political & Social Journey Timeline: "Leadership. Experience. Values."
 * 5. Positions Held ("महत्त्वाच्या जबाबदाऱ्या व पदे")
 */
export function IntroJourney({ locale = 'mr' }: IntroJourneyProps) {
  const isMr = locale === 'mr'

  return (
    <div className="space-y-16 sm:space-y-20 lg:space-y-24">
      {/* 1. Early Life, Ideals & Core Philosophy */}
      <PhilosophySection isMr={isMr} />

      {/* 2. Family Upbringing, Mass Connect & Milestone Photo Banner */}
      <MilestoneSection isMr={isMr} />

      {/* 3. Signature Dual Navy Blue Section: Performance & Profile Card */}
      <DualPerformanceProfileSection isMr={isMr} />

      {/* 4. Political & Social Journey Timeline: "Leadership. Experience. Values." */}
      <JourneyTimelineSection isMr={isMr} />

      {/* 5. Positions Held (भूषविलेली पदे व जबाबदाऱ्या) */}
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
              src="/images/portraits/rohan-deshmukh-introduction.webp"
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
          <div className="mt-3.5 flex items-center gap-1.5">
            <span className="h-1.5 w-14 rounded-full bg-red-600" />
            <span className="h-1.5 w-3.5 rounded-full bg-saffron-500" />
          </div>
        </div>

        {/* Structured biographical paragraphs */}
        <div className="space-y-4 text-base leading-relaxed text-charcoal-800 sm:text-[1.03rem]">
          <p>
            {isMr ? 'रोहन सुभाष देशमुख हे सोलापूर येथील उद्योजक, लेखक आणि समाजकार्यकर्ते आहेत. नव्या विचारांकडे सकारात्मक दृष्टिकोनातून पाहत, नावीन्यपूर्ण उपक्रम राबवण्याची आणि समाजाच्या प्रगतीत योगदान देण्याची जिद्द बाळगणारे ते एक तरुण नेतृत्व. स्वामी विवेकानंदांच्या विचारांपासून प्रेरणा घेत त्यांनी आपल्या कार्याची दिशा निश्चित केली. आत्मविश्वासू आणि स्वावलंबी तरुणाई हाच सक्षम राष्ट्राचा पाया, असा त्यांचा ठाम विश्वास आहे. युवाशक्ती, उद्योजकता आणि स्वावलंबन हे त्यांच्या कार्याचे तीन प्रमुख आधारस्तंभ असून, तरुणांनी केवळ रोजगाराच्या संधी शोधण्यापुरते मर्यादित न राहता रोजगारनिर्मिती करणारे व्हावे, हा त्यांच्या विचारांचा केंद्रबिंदू आहे.' : 'Rohan Subhash Deshmukh is an entrepreneur, author and social worker from Solapur. A young leader with a positive outlook, he is driven to do things differently, to turn fresh ideas into action and to contribute to society’s progress in his own way. Inspired by the thoughts of Swami Vivekananda, he has built his work around one belief: confident, self-reliant young people are the foundation of a strong nation. Youth power, enterprise and self-reliance are the three pillars of his work. His message to young people is clear: do not just look for jobs, become the ones who create them.'}
          </p>
          <p>
            {isMr ? 'आमदार श्री. सुभाष बापू देशमुख यांचे पुत्र म्हणून वाढताना त्यांना वडिलांच्या कामाचा, विचारांचा आणि समाजाशी असलेल्या नात्याचा जवळून अनुभव घेता आला. त्यांच्या वाटचालीतून कष्ट, सातत्य, धाडस आणि समाजाप्रती बांधिलकी या मूल्यांचे संस्कार रोहन यांच्यावर झाले. मात्र वडिलांकडून मिळालेले संस्कार ही त्यांच्या प्रवासाची केवळ सुरुवात आहे. समाजकार्याकडे ते केवळ तात्कालिक मदत म्हणून पाहत नाहीत. लोकांशी प्रत्यक्ष संवाद साधणे, त्यांच्या अडचणी समजून घेणे आणि समस्यांच्या मूळ कारणांचा शोध घेऊन शाश्वत उपाययोजना करणे, ही त्यांची कार्यपद्धती आहे.' : 'As the son of MLA Shri Subhash Bapu Deshmukh, Rohan grew up watching his father’s work, his thinking and his bond with the people up close. That journey taught him the value of hard work, consistency, courage and commitment to society. But this legacy is only the beginning of his own path. For Rohan, social work is not about temporary relief. He speaks to people directly, listens to their problems and looks for the root cause, so that the solutions last.'}
          </p>
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
   Section 2: Family Upbringing, Mass Connect & Milestone Photo Banner
   ========================================================================== */
function MilestoneSection({ isMr }: { isMr: boolean }) {
  return (
    <section className="space-y-6">
      <Reveal className="space-y-4 text-base leading-relaxed text-charcoal-800 sm:text-[1.03rem]">
        <p className="text-xs font-extrabold uppercase tracking-widest text-red-600">{isMr ? 'समाजकार्य' : 'Social Work'}</p>
        <p>
          {isMr ? 'लोकमंगल फाउंडेशनच्या माध्यमातून रोहन सुभाष देशमुख समाजाच्या गरजांनुसार विविध उपक्रम राबवतात. सोलापूर आणि धाराशिव जिल्ह्यांमध्ये कार्यरत असलेल्या या फाउंडेशनचा मुख्य उद्देश गरजू व्यक्तींना योग्य वेळी मदत करणे, त्यांच्या अडचणी दूर करण्यासाठी प्रयत्न करणे आणि त्यांना प्रगतीच्या संधी उपलब्ध करून देणे हा आहे. समाजातील विविध घटकांचे जीवनमान उंचावावे आणि त्यांना स्वावलंबी होण्यासाठी बळ मिळावे, यासाठी फाउंडेशन सातत्याने प्रयत्नशील आहे.' : 'Through Lokmangal Foundation, Rohan turns his ideas into action on the ground. The Foundation runs a range of social initiatives across Solapur and Dharashiv districts with one simple aim: to stand with people when they need it most and help them move forward.'}
        </p>
      </Reveal>

      {/* Featured Milestone Photo Banner (100% Supriya Sule style with blue caption pill bar) */}
      <Reveal delay={0.1}>
        <div className="group overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-[0_20px_50px_-12px_rgba(9,20,34,0.14)]">
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-charcoal-950 sm:aspect-[21/9] lg:aspect-[2.4/1]">
            <Img
              src="/images/gallery/political/rd-political-26.webp"
              alt={isMr ? 'जनसंवाद व युवा नेतृत्व' : 'Public address and youth leadership'}
              fill
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-102"
              sizes="100vw"
            />
          </div>

          {/* Signature Light Blue Caption Bar (Exact replica of Supriya Sule milestone caption) */}
          <div className="border-t border-sky-100 bg-[#e8f1fc] px-6 py-3.5 text-center">
            <p className="font-display text-base font-bold text-[#0c4a8a] sm:text-lg">
              {isMr ? 'लोकमंगल फाउंडेशन — सोलापूर आणि धाराशिव' : 'Lokmangal Foundation — Solapur and Dharashiv'}
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.15} className="space-y-4 text-base leading-relaxed text-charcoal-800 sm:text-[1.03rem]">
        <p className="text-xs font-extrabold uppercase tracking-widest text-red-600">{isMr ? 'दृष्टिकोन' : 'Vision'}</p>
        <p>
          {isMr ? '‘न्यू इंडिया मॅनिफेस्टो’ या पुस्तकातून रोहन सुभाष देशमुख यांनी नवभारताच्या निर्मितीविषयीचा आपला दृष्टिकोन मांडला आहे. याच विचारांतून प्रेरणा घेत संपूर्ण महाराष्ट्रात सक्षम उद्योजकीय परिसंस्था उभारण्याचा त्यांचा संकल्प आहे. शहरांपासून गावांपर्यंतच्या तरुणांना योग्य मार्गदर्शन, सहकार्य आणि संधी उपलब्ध करून देत त्यांच्या कल्पनांचे यशस्वी व्यवसायांत रूपांतर व्हावे, हा त्यांच्या प्रयत्नांचा मुख्य उद्देश आहे.' : 'Rohan is the author of New India Manifesto, a book that sets out his ideas for a new India. Inspired by it, he has set out to build a strong startup ecosystem across Maharashtra, where young people with ideas get the right guidance, support and opportunity to grow, whether they come from a big city or a small town.'}
        </p>
        <p className="font-display text-lg font-bold text-charcoal-950">
          {isMr ? 'तरुणांनी स्वतःच्या क्षमतेवर विश्वास ठेवून स्वावलंबी व्हावे आणि रोजगार शोधण्याऐवजी रोजगारनिर्मिती करावी, हा त्यांच्या दृष्टिकोनाचा केंद्रबिंदू आहे.' : 'Rooted in Solapur and focused on the future, Rohan’s journey has one clear goal: to give the next generation the confidence and the chance to build something of their own.'}
        </p>
      </Reveal>
    </section>
  )
}

/* ==========================================================================
   Section 3: Signature Dual Navy Blue Section ("कार्यगौरव व उपक्रम" + "Profile")
   (Exact replica of Supriya Sule's 'Performance In Lok Sabha' and 'Profile' layout)
   ========================================================================== */
function DualPerformanceProfileSection({ isMr }: { isMr: boolean }) {
  const initiatives = [
    {
      icon: Heart,
      title: isMr ? 'वैयक्तिक माहिती' : 'Personal Details',
      desc: isMr ? 'जन्म: १२ डिसेंबर १९८७ · जन्मस्थळ: सोलापूर, देशमुख कुटुंब' : 'Born: 12 December 1987 · Birthplace: Solapur, into the Deshmukh family',
    },
    {
      icon: GraduationCap,
      title: isMr ? 'शालेय शिक्षण' : 'School Education',
      desc: isMr ? 'लिटल फ्लॉवर कॉन्व्हेंट स्कूल, सोलापूर · राष्ट्रीय छात्र सेना (NCC): इयत्ता नववीपासून सक्रिय सहभाग' : 'Little Flower Convent School, Solapur · National Cadet Corps (NCC): Active cadet from Class 9',
    },
    {
      icon: Landmark,
      title: isMr ? 'महाविद्यालयीन शिक्षण' : 'College Education',
      desc: isMr ? 'संगमेश्वर महाविद्यालय, सोलापूर' : 'Sangameshwar College, Solapur',
    },
    {
      icon: Trophy,
      title: isMr ? 'उच्च शिक्षण' : 'Higher Education',
      desc: isMr ? 'अमेरिकेतील उच्च शिक्षणासाठी प्रयाण: बारावी उत्तीर्ण झाल्यानंतर · रोचेस्टर इन्स्टिट्यूट ऑफ टेक्नॉलॉजी (RIT): जैवतंत्रज्ञान व उद्योजकता विकास (Biotechnology & Entrepreneurship Development) या विषयात पदवी' : 'Move to the USA: Went abroad for higher studies after Class 12 · Rochester Institute of Technology (RIT): Earned a degree in Biotechnology and Entrepreneurship Development',
    },
  ]

  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-gradient-to-b from-[#000d3d] via-[#05164d] to-[#000d3d] py-16 text-white sm:py-20 lg:py-24">
      {/* Subtle dotted background grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] opacity-[0.06] [background-size:24px_24px]"
      />
      
      {/* Top & Bottom Accent Lines */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-saffron-500 to-transparent" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent" />

      <div className="container-x relative">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Performance In Social Work / Key Initiatives */}
          <div className="flex flex-col lg:col-span-7">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {isMr ? 'जीवनचरित्र' : 'Biography'}
              </h2>
              {/* Signature red line with white dot */}
              <div className="mt-2.5 mb-6 flex items-center gap-1.5">
                <span className="h-1 w-14 rounded-full bg-red-600" />
                <span className="h-1 w-2 rounded-full bg-white" />
              </div>
            </div>

            {/* Initiatives 2x2 Grid */}
            <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
              {initiatives.map((item, idx) => {
                const Icon = item.icon
                return (
                  <div
                    key={idx}
                    className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.06] p-5.5 backdrop-blur-md transition-all duration-300 hover:border-saffron-400/50 hover:bg-white/[0.1] hover:-translate-y-1"
                  >
                    <div>
                      <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-saffron-600 to-red-600 text-white shadow-md">
                        <Icon className="size-5.5" />
                      </div>
                      <h3 className="mt-3.5 font-display text-lg font-bold text-white transition-colors group-hover:text-saffron-300">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Profile Card (Replica of Supriya Sule Namaskar Card) */}
          <div className="flex flex-col lg:col-span-5">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {isMr ? 'Profile' : 'Profile'}
              </h2>
              {/* Signature red line with white dot */}
              <div className="mt-2.5 mb-6 flex items-center gap-1.5">
                <span className="h-1 w-14 rounded-full bg-red-600" />
                <span className="h-1 w-2 rounded-full bg-white" />
              </div>
            </div>

            {/* White Framed Profile Card */}
            <div className="relative flex flex-1 flex-col overflow-hidden rounded-2xl border-4 border-white/20 bg-white p-5 text-charcoal-950 shadow-2xl transition-transform duration-300 hover:scale-[1.01] sm:p-7">
              {/* Top Watermark / Emblem */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <span className="font-display text-xs font-bold uppercase tracking-wider text-saffron-600">
                  {isMr ? 'अधिकृत परिचय' : 'Official Profile'}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#000d3d]">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  {isMr ? 'लोकमंगल परिवार' : 'Lokmangal Parivar'}
                </span>
              </div>

              {/* Leader Photo */}
              <div className="relative my-4 aspect-[4/3] w-full overflow-hidden rounded-xl bg-stone-100 sm:aspect-[16/10]">
                <Img
                  src="/images/portraits/rohan-deshmukh-office.webp"
                  alt={isMr ? 'रोहन सुभाष देशमुख' : 'Rohan Subhash Deshmukh'}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width:1024px) 92vw, 420px"
                />
              </div>

              {/* Authentic Greeting Signature Typography */}
              <div className="mt-auto space-y-2 text-center">
                <p className="font-display text-2xl font-bold text-red-600 sm:text-3xl">
                  {isMr ? 'नमस्कार...' : 'Greetings...'}
                </p>
                <h3 className="font-display text-xl font-extrabold tracking-tight text-[#000d3d] sm:text-2xl">
                  {isMr ? 'रोहन सुभाष देशमुख' : 'Rohan Subhash Deshmukh'}
                </h3>
                <p className="text-xs font-semibold text-stone-600 sm:text-sm">
                  {isMr
                    ? 'अध्यक्ष — लोकमंगल फाउंडेशन | संचालक — लोकमंगल मल्टिस्टेट'
                    : 'President — Lokmangal Foundation | Director — Lokmangal Multistate'}
                </p>

                {/* Signature Tagline Pill */}
                <div className="pt-2">
                  <span className="inline-block rounded-full bg-[#000d3d] px-4 py-1.5 text-xs font-bold text-white shadow-xs">
                    {isMr ? 'आपला नम्र, जनसेवेसाठी सदैव कटिबद्ध!' : 'Always at your service with humility!'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ==========================================================================
   Section 4: Political & Social Journey Timeline: "Leadership. Experience. Values."
   (100% Supriya Sule Journey Timeline layout)
   ========================================================================== */
function JourneyTimelineSection({ isMr }: { isMr: boolean }) {
  const milestones = [
    {
      year: isMr ? 'सोलापूर' : 'Solapur',
      badge: isMr ? 'शालेय शिक्षण' : 'School Education',
      title: isMr ? 'लिटल फ्लॉवर कॉन्व्हेंट स्कूल व NCC' : 'Little Flower Convent School & NCC',
      desc: isMr ? 'लिटल फ्लॉवर कॉन्व्हेंट स्कूल, सोलापूर. राष्ट्रीय छात्र सेना (NCC): इयत्ता नववीपासून सक्रिय सहभाग.' : 'Little Flower Convent School, Solapur. National Cadet Corps (NCC): Active cadet from Class 9.',
      image: '/images/gallery/political/rd-political-08.webp',
    },
    {
      year: isMr ? 'अमेरिका' : 'USA',
      badge: isMr ? 'उच्च शिक्षण' : 'Higher Education',
      title: isMr ? 'रोचेस्टर इन्स्टिट्यूट ऑफ टेक्नॉलॉजी (RIT)' : 'Rochester Institute of Technology (RIT)',
      desc: isMr ? 'अमेरिकेतील उच्च शिक्षणासाठी प्रयाण: बारावी उत्तीर्ण झाल्यानंतर. जैवतंत्रज्ञान व उद्योजकता विकास (Biotechnology & Entrepreneurship Development) या विषयात पदवी.' : 'Went abroad for higher studies after Class 12. Earned a degree in Biotechnology and Entrepreneurship Development.',
      image: '/images/gallery/political/rd-political-12.webp',
    },
    {
      year: isMr ? 'धाराशिव' : 'Dharashiv',
      badge: isMr ? 'राजकीय वाटचाल' : 'Political Journey',
      title: isMr ? 'विवेकानंद विचार यात्रा' : 'Swami Vivekananda Vichar Yatra',
      desc: isMr ? 'स्वामी विवेकानंदांचे विचार युवकांपर्यंत पोहोचवण्याच्या ध्येयातून रोहन देशमुख यांनी या यात्रेची संकल्पना मांडली. धाराशिव जिल्ह्यातील विविध भागांतून प्रवास करत यात्रेने युवकांना स्वामी विवेकानंदांच्या विचारांशी जोडण्याचा प्रयत्न केला.' : 'Rohan Deshmukh conceived the yatra to connect today’s youth with Swami Vivekananda’s ideas. It travelled through towns and villages across Dharashiv district, reaching young people where they live.',
      image: '/images/gallery/political/rd-political-20.webp',
    },
    {
      year: isMr ? '२००९' : '2009',
      badge: isMr ? 'भारतीय जनता युवा मोर्चा' : 'Bharatiya Janata Yuva Morcha',
      title: isMr ? 'सरचिटणीस, भारतीय जनता युवा मोर्चा' : 'General Secretary, Bharatiya Janata Yuva Morcha',
      desc: isMr ? 'महाराष्ट्रभर दौरे करून त्यांनी युवकांशी संवाद साधला आणि त्यांना राजकीय व सामाजिक घडामोडींमध्ये सक्रिय सहभाग घेण्यासाठी प्रोत्साहित केले. २००९ मध्ये माननीय श्री. सुभाष देशमुख यांच्या माढा लोकसभा मतदारसंघातील निवडणूक प्रचारात त्यांनी सक्रिय सहभाग घेतला.' : 'He travelled across Maharashtra, meeting young people and encouraging them to take an active interest in politics. In 2009, he played an active role in Hon. Shri Subhash Deshmukh’s Madha Lok Sabha campaign.',
      image: '/images/gallery/political/rd-political-16.webp',
    },
    {
      year: isMr ? 'धाराशिव' : 'Dharashiv',
      badge: isMr ? 'लोकसभा निवडणूक' : 'Lok Sabha Election',
      title: isMr ? 'धाराशिव (उस्मानाबाद) लोकसभा निवडणूक' : 'Lok Sabha Election, Dharashiv (Osmanabad)',
      desc: isMr ? 'कोणत्याही राजकीय पक्षाच्या पाठिंब्याशिवाय त्यांनी अपक्ष उमेदवार म्हणून निवडणूक लढवली. मतदारसंघातील विविध गावांना भेटी देत त्यांनी नागरिकांशी थेट संवाद साधला आणि आपले विचार त्यांच्यापर्यंत पोहोचवले.' : 'He contested as an Independent candidate, without the backing of any political party. He took his ideas directly to voters, reaching every corner of the constituency.',
      image: '/images/gallery/political/rd-political-04.webp',
    },
    {
      year: isMr ? 'सध्या' : 'Today',
      badge: isMr ? 'लोकमंगल' : 'Lokmangal',
      title: isMr ? 'अध्यक्ष, लोकमंगल फाउंडेशन' : 'President, Lokmangal Foundation',
      desc: isMr ? 'या वारशाला पुढे नेत रोहन देशमुख लोकमंगल मल्टिस्टेटचे संचालक आणि लोकमंगल फाउंडेशनचे अध्यक्ष म्हणून जबाबदारी सांभाळत आहेत.' : 'Today, Rohan carries this legacy forward as Director of Lokmangal Multistate and President of Lokmangal Foundation.',
      image: '/images/gallery/political/rd-political-26.webp',
    },
  ]

  return (
    <section className="space-y-10">
      {/* Centered Heading with Emblem Icon */}
      <div className="mx-auto max-w-3xl text-center">
        {/* Emblem / Monument Icon */}
        <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-[#000d3d] text-white shadow-lg">
          <Landmark className="size-7 text-saffron-400" />
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-saffron-600 sm:text-sm">
          {isMr ? 'राजकीय व सामाजिक प्रवास' : 'Political & Social Journey'}
        </p>

        <h2 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-charcoal-950 sm:text-4xl lg:text-5xl">
          Leadership. Experience. Values.
        </h2>

        {/* Signature red and saffron line */}
        <div className="mx-auto mt-3.5 mb-3 flex items-center justify-center gap-1.5">
          <span className="h-1.5 w-16 rounded-full bg-red-600" />
          <span className="h-1.5 w-3.5 rounded-full bg-saffron-500" />
        </div>

        <p className="text-base text-stone-600 sm:text-lg">
          {isMr
            ? 'सोलापूरच्या विकासासाठी आणि जनतेच्या सेवेसाठी अविरत समर्पित वाटचाल.'
            : 'A dedicated journey committed to Solapur’s holistic progress and the welfare of its people.'}
        </p>
      </div>

      {/* Horizontal / Alternating Timeline Cards */}
      <div className="relative pt-4">
        {/* Central Connecting Vertical Line (on desktop) */}
        <div
          aria-hidden="true"
          className="absolute bottom-8 left-4 top-8 w-1 bg-gradient-to-b from-red-600 via-saffron-500 to-[#000d3d] sm:left-1/2 sm:-ml-0.5"
        />

        <div className="space-y-8 sm:space-y-12">
          {milestones.map((item, idx) => {
            const isEven = idx % 2 === 0
            return (
              <div
                key={idx}
                className={cn(
                  'relative flex flex-col items-start gap-4 sm:flex-row sm:items-center',
                  isEven ? 'sm:flex-row-reverse' : '',
                )}
              >
                {/* Timeline Card */}
                <div className="ml-10 w-[calc(100%-2.5rem)] sm:ml-0 sm:w-[calc(50%-2rem)]">
                  <div className="group overflow-hidden rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm transition-all duration-300 hover:border-saffron-300 hover:shadow-lg hover:-translate-y-1 sm:p-6">
                    {/* Year & Badge Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                      <span className="rounded-full bg-[#000d3d] px-3 py-1 font-display text-xs font-bold text-white">
                        {item.year}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-saffron-600">
                        {item.badge}
                      </span>
                    </div>

                    {/* Milestone Image Thumbnail */}
                    <div className="relative my-3 aspect-[16/9] w-full overflow-hidden rounded-xl bg-stone-100">
                      <Img
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-103"
                        sizes="(max-width:768px) 90vw, 400px"
                      />
                    </div>

                    {/* Title & Description */}
                    <h3 className="font-display text-base font-bold text-charcoal-950 sm:text-lg">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-stone-600 sm:text-sm">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* Timeline Center Node Badge */}
                <div className="absolute left-1.5 top-5 z-10 flex size-6 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-red-600 shadow-md sm:left-1/2">
                  <span className="size-2 rounded-full bg-white" />
                </div>

                {/* Empty opposite spacer on desktop */}
                <div className="hidden sm:block sm:w-[calc(50%-2rem)]" />
              </div>
            )
          })}
        </div>
      </div>
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
