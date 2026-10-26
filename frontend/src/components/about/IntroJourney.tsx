import {
  Building,
  Calendar,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Heart,
  Landmark,
  MapPin,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react'
import type { Page } from '@/types/cms'
import { Img } from '@/components/ui/Img'
import { Reveal } from '@/components/ui/Motion'

type Block = NonNullable<Page['layout']>[number]

interface IntroJourneyProps {
  blocks?: Block[] | null
  locale?: 'mr' | 'en'
}

/**
 * स्वपरिचय (About / Introduction) Page — 100% modeled on Supriya Sule's official layout:
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

      {/* 4. Positions Held (भूषविलेली पदे व जबाबदाऱ्या) */}
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
                {isMr ? 'चेअरमन, लोकमंगल फाऊंडेशन' : 'Chairman, Lokmangal Foundation'}
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
            {isMr
              ? '“समाजात बदल घडवण्यासाठी केलेला छोटासा प्रयत्नही खूप मोठा असतो.”'
              : '“Even the smallest effort made to bring about positive change in society has immense significance.”'}
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
            {isMr
              ? 'स्वामी विवेकानंद, छत्रपती शिवाजी महाराज आणि संतांच्या सर्वसमावेशक विचारांनी प्रेरित होऊन रोहन सुभाष देशमुख यांनी सार्वजनिक जीवनात आणि समाजकारणात स्वतःला वाहून घेतले आहे. राजकारणापेक्षा समाजकारणाला प्राधान्य देत, ‘८० टक्के समाजकारण आणि २० टक्के राजकारण’ या जीवनमूल्यावर त्यांचा दृढ विश्वास आहे.'
              : 'Deeply inspired by the timeless ideals of Swami Vivekananda, Chhatrapati Shivaji Maharaj, and the visionary social reformers of Maharashtra, Rohan Subhash Deshmukh has dedicated himself to public service and social enterprise. Prioritizing constructive community action, he firmly adheres to the guiding principle of “80% social service and 20% politics”.'}
          </p>
          <p>
            {isMr
              ? 'लोकमंगल परिवाराच्या सेवाभावी संस्कारांमध्ये लहानाचे मोठे झालेल्या रोहनजींनी सोलापूर जिल्ह्यातील शेतकरी, कष्टकरी आणि ग्रामीण तरुणांच्या समस्या अगदी जवळून अनुभवल्या आहेत. केवळ समस्यांवर चर्चा करण्यापेक्षा त्यावर शाश्वत, ठोस आणि तंत्रज्ञानाधारित उपाय शोधणे हीच त्यांच्या कार्यपद्धतीची ओळख आहे.'
              : 'Grounded in the values and service culture of the Lokmangal family, Rohan has closely observed the ground realities, challenges, and aspirations of farmers, working families, and youth across Solapur district. His leadership focuses on building sustainable, actionable, and technology-driven solutions.'}
          </p>
          <p>
            {isMr
              ? 'शिक्षण, आरोग्य, जलसंधारण आणि सहकार या क्षेत्रांत त्यांनी आजवर अनेक नाविन्यपूर्ण उपक्रम यशस्वीरीत्या राबविले आहेत. पारदर्शक कार्यप्रणाली, उच्च व्यावसायिक शिस्त आणि तळागाळातील प्रत्येक कार्यकर्त्याशी असलेला थेट जिव्हाळ्याचा संवाद यामुळे ते सोलापूरच्या युवा पिढीचे एक विश्वासार्ह नेतृत्व म्हणून परिचित आहेत.'
              : 'He has spearheaded numerous pioneering programs across education, accessible healthcare, water conservation, and the cooperative sector. Transparent governance, professional excellence, and genuine personal connect with grassroots citizens make him a trusted and respected voice in Solapur.'}
          </p>
        </div>

        {/* Quick Facts Grid */}
        <div className="grid grid-cols-2 gap-3.5 pt-2 sm:grid-cols-4">
          <QuickFactCard
            icon={Calendar}
            label={isMr ? 'जन्म' : 'Born'}
            val={isMr ? '१७ एप्रिल १९८८' : '17 April 1988'}
          />
          <QuickFactCard
            icon={MapPin}
            label={isMr ? 'जन्मस्थान' : 'Birthplace'}
            val={isMr ? 'सोलापूर, महाराष्ट्र' : 'Solapur, Maharashtra'}
          />
          <QuickFactCard
            icon={GraduationCap}
            label={isMr ? 'शिक्षण' : 'Education'}
            val={isMr ? 'बी.बी.ए., पदव्युत्तर' : 'B.B.A., Post Graduate'}
          />
          <QuickFactCard
            icon={Heart}
            label={isMr ? 'प्रेरणा' : 'Inspiration'}
            val={isMr ? 'लोकमंगल परिवार' : 'Lokmangal Parivar'}
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
        <p>
          {isMr
            ? 'लोकमंगल परिवारातील ज्येष्ठ नेते आणि माजी कॅबिनेट मंत्री श्री. सुभाष (बापू) देशमुख यांच्या मार्गदर्शनाखाली त्यांनी समाजकारणाचे प्राथमिक धडे गिरवले. सामान्य नागरिकांशी आपुलकीचे नाते जपत ते दर आठवड्याला थेट जनसंपर्क कार्यालयात नागरिकांच्या अडीअडचणी जाणून घेतात आणि प्रशासनाच्या मदतीने त्यावर तात्काळ तोडगा काढतात.'
            : 'Raised under the mentorship of senior political leader and former Maharashtra Cabinet Minister Shri Subhash (Bapu) Deshmukh, he imbibed the core values of public service early in life. He maintains an active open-door policy, meeting citizens weekly to address their grievances and coordinate swift solutions.'}
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
              {isMr
                ? 'भाजप युवा मोर्चा, सहकार आणि समाजकारणातील सक्रिय वाटचाल'
                : 'Active Journey in Youth Leadership, Cooperative Movement, and Grassroots Service'}
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.15} className="space-y-4 text-base leading-relaxed text-charcoal-800 sm:text-[1.03rem]">
        <p>
          {isMr
            ? 'तळागाळातील प्रत्येक कार्यकर्त्याचा सन्मान राखणे आणि शिस्तबद्ध संघटनात्मक बांधणी करणे हे त्यांचे प्रमुख वैशिष्ट्य आहे. लोकमंगल फाऊंडेशनच्या माध्यमातून दुष्काळग्रस्तांना मदत, ५००० हून अधिक जोडप्यांचे मोफत सामूहिक विवाह सोहळे आणि दुष्काळी भागात जलसंधारणाचे व्यापक प्रकल्प राबवून त्यांनी हजारो कुटुंबांना आर्थिक व सामाजिक स्थैर्य मिळवून दिले आहे.'
            : 'Valuing every grassroots worker with dignity and fostering disciplined organizational teamwork are his guiding virtues. Through Lokmangal Foundation, he has delivered tangible relief to thousands of rural families through drought relief, over 5,000 free community marriages, and extensive watershed management projects.'}
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
      title: isMr ? 'लोकमंगल फाऊंडेशन (ग्रामीण विकास)' : 'Lokmangal Foundation (Rural Welfare)',
      desc: isMr
        ? '५,०००+ मोफत सामूहिक विवाह सोहळे, दुष्काळ निवारण, शेतकरी सहाय्य निधी आणि जलसंधारण प्रकल्प.'
        : '5,000+ free mass marriages, drought relief programs, farmer support funds, and watershed projects.',
    },
    {
      icon: GraduationCap,
      title: isMr ? 'युवा सक्षमीकरण व शिक्षण' : 'Youth Empowerment & Education',
      desc: isMr
        ? 'जिल्हाभरात स्पर्धा परीक्षा अभ्यासिका, मोफत ग्रंथालये आणि ५०,०००+ विद्यार्थ्यांना कौशल्य प्रशिक्षण.'
        : 'Network of competitive exam study centers, free libraries, and skill training for 50,000+ students.',
    },
    {
      icon: Landmark,
      title: isMr ? 'सहकार व शेतकरी अर्थकारण' : 'Cooperatives & Agri-Finance',
      desc: isMr
        ? 'सोलापूर जिल्हा मध्यवर्ती बँकेत संचालक म्हणून काम; शेतकरी कर्जपुरवठा आणि पारदर्शक सहकार सुधारणा.'
        : 'Director at Solapur DCC Bank; pioneering credit access for sugarcane farmers and transparent banking.',
    },
    {
      icon: Trophy,
      title: isMr ? 'न्यू इंडिया मॅनिफेस्टो (उद्योजकता)' : 'New India Manifesto (Enterprise)',
      desc: isMr
        ? 'सोलापूर व ग्रामीण महाराष्ट्रातील १,००,००० नवउद्योजकांना मार्गदर्शन, नेटवर्क आणि भांडवली सहाय्य मिशन.'
        : 'Mission to mentor and network 1,00,000 rural entrepreneurs across Solapur and Maharashtra.',
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
                {isMr ? 'कार्यगौरव व प्रमुख उपक्रम' : 'Key Initiatives & Social Impact'}
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

                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-saffron-400">
                      <span>{isMr ? 'सविस्तर पहा' : 'Learn more'}</span>
                      <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-1" />
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
                    ? 'चेअरमन — लोकमंगल फाऊंडेशन | युवा नेते, सोलापूर'
                    : 'Chairman — Lokmangal Foundation | Youth Leader, Solapur'}
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
   Section 5: Positions Held (भूषविलेली पदे व जबाबदाऱ्या)
   (100% Supriya Sule "Positions Held" layout)
   ========================================================================== */
function PositionsHeldSection({ isMr }: { isMr: boolean }) {
  const positions = [
    {
      role: isMr ? 'चेअरमन' : 'Chairman',
      org: isMr ? 'लोकमंगल फाऊंडेशन, सोलापूर' : 'Lokmangal Foundation, Solapur',
      period: isMr ? '२०२२ ते आजपर्यंत' : '2022 - Present',
      desc: isMr
        ? 'ग्रामीण भागातील जलसंधारण, सामूहिक विवाह सोहळे आणि दुष्काळ निवारण उपक्रमांचे प्रमुख नेतृत्व.'
        : 'Leading regional water conservation, free mass marriages, and drought mitigation programs.',
      icon: Building,
    },
    {
      role: isMr ? 'संचालक' : 'Director',
      org: isMr
        ? 'सोलापूर जिल्हा मध्यवर्ती सहकारी बँक मर्यादित (DCC Bank)'
        : 'Solapur District Central Co-op Bank Ltd. (DCCB)',
      period: '2016 - 2021',
      desc: isMr
        ? 'शेतकरी कर्जपुरवठा सुलभ करणे आणि सहकार बँकिंग क्षेत्रात पारदर्शक आर्थिक शिस्त निर्माण करणे.'
        : 'Pioneered farmer credit facilities and introduced transparent banking protocols.',
      icon: Landmark,
    },
    {
      role: isMr ? 'जिल्हाध्यक्ष' : 'District President',
      org: isMr
        ? 'भारतीय जनता युवा मोर्चा (BJYM), सोलापूर'
        : 'Bharatiya Janata Yuva Morcha (BJYM), Solapur',
      period: '2014 - 2016',
      desc: isMr
        ? 'सोलापूर जिल्ह्यातील हजारो युवकांचे संघटन आणि भव्य युवक मेळाव्यांचे यशस्वी आयोजन.'
        : 'Organized thousands of youth across Solapur through leadership conventions and service drives.',
      icon: Trophy,
    },
    {
      role: isMr ? 'विश्वस्त' : 'Trustee',
      org: isMr ? 'लोकमंगल शिक्षण प्रसारक मंडळ, सोलापूर' : 'Lokmangal Shikshan Prasarak Mandal',
      period: isMr ? '२०१५ ते आजपर्यंत' : '2015 - Present',
      desc: isMr
        ? 'दर्जेदार ग्रामीण शिक्षण, मोफत ग्रंथालये आणि कौशल्य विकास केंद्रांचे व्यवस्थापन.'
        : 'Overseeing quality education, competitive exam libraries, and rural vocational training.',
      icon: GraduationCap,
    },
    {
      role: isMr ? 'संस्थापक मार्गदर्शक' : 'Founder Mentor',
      org: isMr ? 'न्यू इंडिया मॅनिफेस्टो (उद्योजकता मंच)' : 'New India Manifesto (Enterprise Forum)',
      period: isMr ? '२०२२ ते आजपर्यंत' : '2022 - Present',
      desc: isMr
        ? 'ग्रामीण व निमशहरी भागातील १,००,००० तरुणांना उद्योजक बनविण्याचे ध्येय.'
        : 'National initiative to mentor and fund 1,00,000 rural youth entrepreneurs.',
      icon: Users,
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
