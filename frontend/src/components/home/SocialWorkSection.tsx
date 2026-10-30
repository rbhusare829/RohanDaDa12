import { Link } from 'react-router'
import { m } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { AccentBar, Reveal } from '../ui/Motion'

export function SocialWorkSection({
  locale = 'mr',
}: {
  locale?: 'mr' | 'en'
}) {
  const isMr = locale !== 'en'

  return (
    <section
      className="relative py-14 sm:py-18 lg:py-22 border-t border-b border-stone-200/80 overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #ffffff 0%, #faf8f5 45%, #f4f0e8 100%)',
      }}
      aria-labelledby="social-work-heading"
    >
      {/* Subtle warm atmospheric glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 -right-12 size-96 rounded-full bg-[#fef3c7]/25 blur-3xl -z-10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -left-12 size-80 rounded-full bg-[#fed7aa]/20 blur-3xl -z-10"
      />

      <div className="container-x relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14 lg:mb-16">
          <Reveal>
            <h2
              id="social-work-heading"
              className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#000d3d]"
            >
              {isMr ? 'समाजकार्य' : 'Social Work'}
            </h2>

            <AccentBar center className="mt-3" bar="h-1 w-20" dot="h-1.5 w-4" />

            <p className="mt-3.5 mx-auto max-w-2xl text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              {isMr
                ? 'लोकमंगल फाउंडेशनच्या माध्यमातून समाजाच्या गरजांनुसार विविध उपक्रम राबवून जनसेवा आणि सक्षमीकरणाचा ध्यास.'
                : 'Dedicated to community service and empowering those in need through Lokmangal Foundation.'}
            </p>
          </Reveal>
        </div>

        {/* Open 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center max-w-6xl mx-auto">
          {/* Photo Column */}
          <div className="lg:col-span-6">
            <Reveal x={-28} delay={0.08}>
              <m.div
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl ring-1 ring-black/5 aspect-[4/3] sm:aspect-[16/11] bg-stone-100 group transition-shadow duration-300"
              >
                <img
                  src="/images/social-work/rohan-lokmangal-914A2588.webp"
                  alt={isMr ? 'लोकमंगल फाउंडेशन समाजकार्य - सर्वधर्मीय सामुदायिक विवाह सोहळा' : 'Lokmangal Foundation Social Work'}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover object-[center_20%] transition-transform duration-700 ease-out group-hover:scale-106"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"
                />
                <div className="absolute bottom-4 left-5 right-5 z-10">
                  <p className="text-xs sm:text-sm font-semibold text-white/95 drop-shadow">
                    {isMr ? 'सोलापूर आणि धाराशिव जिल्हा कार्यक्षेत्र' : 'Active in Solapur and Dharashiv Districts'}
                  </p>
                </div>
              </m.div>
            </Reveal>
          </div>

          {/* Text Column */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <Reveal x={28} delay={0.14}>
              <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-[#000d3d]">
                {isMr ? 'लोकमंगल फाउंडेशनच्या माध्यमातून जनसेवा' : 'Community Service through Lokmangal Foundation'}
              </h3>

              <AccentBar className="mt-3 mb-5" bar="h-1 w-14" dot="h-1.5 w-3" />

              <p className="text-base sm:text-[17px] leading-relaxed text-slate-700 font-normal">
                {isMr
                  ? 'लोकमंगल फाउंडेशनच्या माध्यमातून रोहन सुभाष देशमुख समाजाच्या गरजांनुसार विविध उपक्रम राबवतात. सोलापूर आणि धाराशिव जिल्ह्यांमध्ये कार्यरत असलेल्या या फाउंडेशनचा मुख्य उद्देश गरजू व्यक्तींना योग्य वेळी मदत करणे, त्यांच्या अडचणी दूर करण्यासाठी प्रयत्न करणे आणि त्यांना प्रगतीच्या संधी उपलब्ध करून देणे हा आहे. समाजातील विविध घटकांचे जीवनमान उंचावावे आणि त्यांना स्वावलंबी होण्यासाठी बळ मिळावे, यासाठी फाउंडेशन सातत्याने प्रयत्नशील आहे.'
                  : 'Through Lokmangal Foundation, Rohan Subhash Deshmukh carries out diverse initiatives tailored to societal needs. Active in Solapur and Dharashiv districts, the foundation’s primary goal is to provide timely assistance to those in need, address their challenges, and open new avenues of growth. The foundation continuously strives to uplift the living standards of all sections of society and empower them toward self-reliance.'}
              </p>

              <div className="mt-8">
                <Link
                  to="/lokmangal/foundation"
                  className="group inline-flex items-center gap-2.5 rounded-full bg-red-600 px-7 py-3 text-sm sm:text-base font-bold text-white shadow-md transition-all duration-300 hover:bg-[#000d3d] hover:shadow-xl hover:-translate-y-0.5"
                >
                  <span>{isMr ? 'फाउंडेशन कार्य सविस्तर पहा' : 'Explore Foundation Work'}</span>
                  <ArrowUpRight className="size-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
