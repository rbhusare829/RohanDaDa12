import { Link } from 'react-router'
import { ArrowUpRight, CheckCircle2, HeartHandshake, Lightbulb, Sparkles } from 'lucide-react'
import { m } from 'motion/react'
import { Reveal } from '../ui/Motion'

export function SocialAndVisionSection({
  locale = 'mr',
}: {
  locale?: 'mr' | 'en'
}) {
  const isMr = locale !== 'en'

  return (
    <section
      className="relative isolate overflow-hidden bg-gradient-to-b from-[#000d3d] via-[#02134d] to-[#000a2f] py-12 sm:py-16 lg:py-20 text-white border-b border-white/10"
      aria-labelledby="social-vision-heading"
    >
      {/* Ambient background glows for rich depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/4 -z-10 size-96 rounded-full bg-saffron-500/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 right-1/4 -z-10 size-96 rounded-full bg-blue-500/15 blur-3xl"
      />

      <div className="container-x">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-saffron-400/30 bg-saffron-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-saffron-400 mb-3 shadow-sm">
              <Sparkles className="size-3.5 text-saffron-400" />
              <span>{isMr ? 'सेवा आणि संकल्प' : 'SERVICE & VISION'}</span>
            </div>

            <h2
              id="social-vision-heading"
              className="mt-1 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white"
            >
              {isMr ? 'समाजकार्य आणि दृष्टिकोन' : 'Social Work & Vision'}
            </h2>

            <div className="mt-3.5 flex justify-center items-center gap-1.5">
              <span className="h-1 w-16 rounded-full bg-red-600" />
              <span className="h-1 w-3.5 rounded-full bg-saffron-500" />
            </div>

            <p className="mt-4 mx-auto max-w-2xl text-sm sm:text-base text-slate-300/90 leading-relaxed font-normal">
              {isMr
                ? 'लोकमंगल फाउंडेशनच्या माध्यमातून जनसेवा आणि नवभारताच्या विचारांतून सक्षम, स्वावलंबी महाराष्ट्राचा ध्यास.'
                : 'Dedicated to community service through Lokmangal Foundation and building an empowered, self-reliant Maharashtra.'}
            </p>
          </Reveal>
        </div>

        {/* 2-Column Responsive Cards Grid with Framer Motion Stagger */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
          {/* Card 1: समाजकार्य (Social Work) */}
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="group flex flex-col justify-between rounded-3xl bg-white text-slate-900 overflow-hidden shadow-[0_20px_50px_-20px_rgba(0,13,61,0.35)] ring-1 ring-stone-200/90 transition-all duration-300 hover:shadow-[0_28px_65px_-20px_rgba(0,13,61,0.55)] hover:-translate-y-2"
          >
            {/* Top Photo Header with Category Badge */}
            <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden bg-stone-100">
              <img
                src="/images/social-work/community-weddings.webp"
                alt={isMr ? 'लोकमंगल फाउंडेशन समाजकार्य' : 'Lokmangal Foundation Social Work'}
                loading="lazy"
                decoding="async"
                className="size-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
              />

              {/* Top Floating Badge */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full bg-[#000d3d]/90 backdrop-blur-md px-3.5 py-1.5 border border-white/20 text-xs font-bold text-white shadow-md">
                <span className="size-2 rounded-full bg-saffron-500 animate-pulse" />
                <span>{isMr ? 'लोकमंगल फाउंडेशन' : 'Lokmangal Foundation'}</span>
              </div>

              {/* Bottom Tagline on Image */}
              <div className="absolute bottom-3 left-4 right-4 z-10">
                <p className="text-xs sm:text-sm font-semibold text-white/90 drop-shadow">
                  {isMr ? 'सोलापूर आणि धाराशिव जिल्हा कार्यक्षेत्र' : 'Active in Solapur and Dharashiv Districts'}
                </p>
              </div>
            </div>

            {/* Card Content Area */}
            <div className="p-6 sm:p-8 flex flex-col justify-between flex-1">
              <div>
                {/* Header Row: Icon + Title */}
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/70 shadow-xs transition-colors group-hover:bg-amber-600 group-hover:text-white">
                    <HeartHandshake className="size-6 transition-transform group-hover:scale-110" />
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-700">
                      {isMr ? 'जनसेवा व सक्षमीकरण' : 'COMMUNITY SERVICE'}
                    </span>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold leading-tight text-[#000d3d]">
                      {isMr ? 'समाजकार्य' : 'Social Work'}
                    </h3>
                  </div>
                </div>

                {/* Main Paragraph */}
                <p className="text-sm sm:text-[15px] leading-relaxed text-slate-700 font-normal">
                  {isMr
                    ? 'लोकमंगल फाउंडेशनच्या माध्यमातून रोहन सुभाष देशमुख समाजाच्या गरजांनुसार विविध उपक्रम राबवतात. सोलापूर आणि धाराशिव जिल्ह्यांमध्ये कार्यरत असलेल्या या फाउंडेशनचा मुख्य उद्देश गरजू व्यक्तींना योग्य वेळी मदत करणे, त्यांच्या अडचणी दूर करण्यासाठी प्रयत्न करणे आणि त्यांना प्रगतीच्या संधी उपलब्ध करून देणे हा आहे. समाजातील विविध घटकांचे जीवनमान उंचावावे आणि त्यांना स्वावलंबी होण्यासाठी बळ मिळावे, यासाठी फाउंडेशन सातत्याने प्रयत्नशील आहे.'
                    : 'Through Lokmangal Foundation, Rohan Subhash Deshmukh carries out diverse initiatives tailored to societal needs. Active in Solapur and Dharashiv districts, the foundation’s primary goal is to provide timely assistance to those in need, address their challenges, and open new avenues of growth. The foundation continuously strives to uplift the living standards of all sections of society and empower them toward self-reliance.'}
                </p>

                {/* Key Points / Value Chips */}
                <div className="mt-6 flex flex-wrap gap-2.5">
                  {(isMr
                    ? ['गरजू व्यक्तींना वेळेवर मदत', 'अडचणी निवारण व प्रगती', 'स्वावलंबन व जीवनमान विकास']
                    : ['Timely Assistance', 'Uplifting Lives', 'Empowering Self-Reliance']
                  ).map((item, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-200/80 px-3 py-1.5 text-xs font-semibold text-slate-700"
                    >
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Action Area */}
              <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to="/lokmangal/foundation"
                  className="group/btn inline-flex items-center gap-2 text-sm font-bold text-amber-700 hover:text-amber-800 transition-colors"
                >
                  <span>{isMr ? 'फाउंडेशन कार्य सविस्तर पहा' : 'Explore Foundation Work'}</span>
                  <ArrowUpRight className="size-4.5 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </Link>

                <span className="text-xs font-medium text-slate-400">
                  {isMr ? 'लोकमंगल उपक्रम' : 'Initiatives'}
                </span>
              </div>
            </div>
          </m.div>

          {/* Card 2: दृष्टिकोन (Vision) */}
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="group flex flex-col justify-between rounded-3xl bg-white text-slate-900 overflow-hidden shadow-[0_20px_50px_-20px_rgba(0,13,61,0.35)] ring-1 ring-stone-200/90 transition-all duration-300 hover:shadow-[0_28px_65px_-20px_rgba(0,13,61,0.55)] hover:-translate-y-2"
          >
            {/* Top Photo Header with Category Badge */}
            <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden bg-[#000d3d]">
              <img
                src="/images/hero/rohan-hero-book.webp"
                alt={isMr ? 'रोहन देशमुख - न्यू इंडिया मॅनिफेस्टो' : 'Rohan Deshmukh - The New India Manifesto'}
                loading="lazy"
                decoding="async"
                className="size-full object-cover object-[75%_15%] transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
              />

              {/* Top Floating Badge */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full bg-[#000d3d]/90 backdrop-blur-md px-3.5 py-1.5 border border-white/20 text-xs font-bold text-white shadow-md">
                <span className="size-2 rounded-full bg-red-500 animate-pulse" />
                <span>{isMr ? 'न्यू इंडिया मॅनिफेस्टो' : 'The New India Manifesto'}</span>
              </div>

              {/* Bottom Tagline on Image */}
              <div className="absolute bottom-3 left-4 right-4 z-10">
                <p className="text-xs sm:text-sm font-semibold text-white/90 drop-shadow">
                  {isMr ? 'नवभारताच्या उभारणीविषयीचा आधुनिक दृष्टिकोन' : 'A Vision for Modern India'}
                </p>
              </div>
            </div>

            {/* Card Content Area */}
            <div className="p-6 sm:p-8 flex flex-col justify-between flex-1">
              <div>
                {/* Header Row: Icon + Title */}
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/70 shadow-xs transition-colors group-hover:bg-blue-600 group-hover:text-white">
                    <Lightbulb className="size-6 transition-transform group-hover:scale-110" />
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-red-600">
                      {isMr ? 'दृष्टिकोन' : 'VISION'}
                    </span>
                    <h3 className="font-display text-xl sm:text-2xl font-bold leading-snug text-[#000d3d]">
                      {isMr
                        ? 'उद्योजकतेतून सक्षम महाराष्ट्राची निर्मिती'
                        : 'Building an Empowered Maharashtra through Entrepreneurship'}
                    </h3>
                  </div>
                </div>

                {/* Main Paragraph */}
                <p className="text-sm sm:text-[15px] leading-relaxed text-slate-700 font-normal">
                  {isMr
                    ? '‘न्यू इंडिया मॅनिफेस्टो’ या पुस्तकातून रोहन सुभाष देशमुख यांनी नवभारताच्या निर्मितीविषयीचा आपला दृष्टिकोन मांडला आहे. याच विचारांतून प्रेरणा घेत संपूर्ण महाराष्ट्रात सक्षम उद्योजकीय परिसंस्था उभारण्याचा त्यांचा संकल्प आहे. शहरांपासून गावांपर्यंतच्या तरुणांना योग्य मार्गदर्शन, सहकार्य आणि संधी उपलब्ध करून देत त्यांच्या कल्पनांचे यशस्वी व्यवसायांत रूपांतर व्हावे, हा त्यांच्या प्रयत्नांचा मुख्य उद्देश आहे.'
                    : 'In his book ‘The New India Manifesto’, Rohan Subhash Deshmukh articulated his vision for building a new India. Drawing inspiration from these ideals, his resolution is to cultivate a robust entrepreneurial ecosystem across Maharashtra. Providing youth from cities to villages with the right mentorship, collaboration, and opportunities to transform their ideas into thriving ventures is the core objective of his endeavors.'}
                </p>

                {/* Prominent Quote Callout */}
                <div className="mt-5 rounded-2xl bg-gradient-to-r from-red-50/70 via-amber-50/50 to-blue-50/60 p-4 border border-red-200/60">
                  <p className="text-xs sm:text-sm font-semibold leading-relaxed text-[#000d3d] italic">
                    “ {isMr
                      ? 'तरुणांनी स्वतःच्या क्षमतेवर विश्वास ठेवून स्वावलंबी व्हावे आणि रोजगार शोधण्याऐवजी रोजगारनिर्मिती करावी, हा त्यांच्या दृष्टिकोनाचा केंद्रबिंदू आहे.'
                      : 'Instilling confidence in young people to become self-reliant and shift from job seekers to job creators is the focal point of his vision.'} ”
                  </p>
                </div>

                {/* Key Points / Value Chips */}
                <div className="mt-5 flex flex-wrap gap-2.5">
                  {(isMr
                    ? ['सक्षम उद्योजकीय परिसंस्था', 'कल्पनांचे व्यवसायात रूपांतर', 'रोजगारनिर्मितीचे ध्येय']
                    : ['Robust Startup Ecosystem', 'Idea to Enterprise', 'Job Creators']
                  ).map((item, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-200/80 px-3 py-1.5 text-xs font-semibold text-slate-700"
                    >
                      <CheckCircle2 className="size-3.5 text-blue-600" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Action Area */}
              <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to="/vision"
                  className="group/btn inline-flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700 transition-colors"
                >
                  <span>{isMr ? 'व्हिजन सविस्तर वाचा' : 'Read Full Vision'}</span>
                  <ArrowUpRight className="size-4.5 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </Link>

                <span className="text-xs font-medium text-slate-400">
                  {isMr ? 'पुस्तकाविषयी' : 'About Book'}
                </span>
              </div>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  )
}
