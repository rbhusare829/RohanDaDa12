import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import { Reveal } from './HomeMotion'

export function SocialWorkSection({
  locale = 'mr',
}: {
  locale?: 'mr' | 'en'
}) {
  const isMr = locale !== 'en'

  return (
    <section
      className="relative py-14 sm:py-18 lg:py-22 border-t border-b border-sky-100/80 overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #ffffff 0%, #f1f8fe 35%, #e1f3fd 75%, #d5eefc 100%)',
      }}
      aria-labelledby="social-work-heading"
    >
      {/* Crowd silhouette background pattern from user reference image */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 sm:h-40 md:h-44 opacity-40 bg-repeat-x bg-bottom"
        style={{
          backgroundImage: "url('/images/backgrounds/social-work-pattern.png')",
          backgroundSize: 'auto 100%',
        }}
      />
      {/* Soft atmospheric blue glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 right-10 size-96 rounded-full bg-[#bae6fd]/30 blur-3xl -z-10"
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

            <div className="mt-3 flex justify-center items-center gap-1.5">
              <span className="h-1 w-16 rounded-full bg-red-600" />
              <span className="h-1 w-3.5 rounded-full bg-saffron-500" />
            </div>

            <p className="mt-3.5 mx-auto max-w-2xl text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              {isMr
                ? 'लोकमंगल फाउंडेशनच्या माध्यमातून समाजाच्या गरजांनुसार विविध उपक्रम राबवून जनसेवा आणि सक्षमीकरणाचा ध्यास.'
                : 'Dedicated to community service and empowering those in need through Lokmangal Foundation.'}
            </p>
          </Reveal>
        </div>

        {/* Open 2-Column Layout (NO enclosing card/box) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center max-w-6xl mx-auto">
          {/* Photo Column */}
          <div className="lg:col-span-6">
            <Reveal delay={0.05} x={-40}>
              <div className="relative overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/5 aspect-[4/3] sm:aspect-[16/11] bg-stone-100 group">
                <img
                  src="/images/social-work/rohan-lokmangal-914A2588.webp"
                  alt={isMr ? 'लोकमंगल फाउंडेशन समाजकार्य - सर्वधर्मीय सामुदायिक विवाह सोहळा' : 'Lokmangal Foundation Social Work'}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover object-[center_20%] transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
            </Reveal>
          </div>

          {/* Text Column */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <Reveal delay={0.2} x={40}>
              <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-[#000d3d]">
                {isMr ? 'लोकमंगल फाउंडेशनच्या माध्यमातून जनसेवा' : 'Community Service through Lokmangal Foundation'}
              </h3>

              <div className="mt-3 mb-5 flex items-center gap-1.5">
                <span className="h-1 w-12 rounded-full bg-red-600" />
                <span className="h-1 w-3 rounded-full bg-saffron-500" />
              </div>

              {/* Marathi: one paragraph; English: two */}
              <div className="space-y-3">
                {(isMr
                  ? ['लोकमंगल फाउंडेशनच्या माध्यमातून रोहन सुभाष देशमुख समाजाच्या गरजांनुसार विविध उपक्रम राबवतात. महाराष्ट्रभर कार्यरत असलेल्या या फाउंडेशनचा मुख्य उद्देश गरजू व्यक्तींना योग्य वेळी मदतीचा हात देणे, त्यांच्या अडचणी दूर करण्यासाठी प्रयत्न करणे आणि त्यांना प्रगतीच्या नव्या संधी उपलब्ध करून देणे हा आहे. समाजातील विविध घटकांचे जीवनमान उंचावावे आणि त्यांना स्वावलंबी होण्यासाठी बळ मिळावे, यासाठी फाउंडेशन सातत्याने प्रयत्नशील आहे.']
                  : [
                      'Through the Lokmangal Foundation, Rohan Subhash Deshmukh leads initiatives that respond to the real needs of society. Working across Maharashtra, the foundation lends a helping hand to people in need at the right time, works to solve their challenges, and opens up new opportunities for growth.',
                      'The foundation works to improve the quality of life for every section of society and gives people the strength to become self-reliant. It continues to work towards this vision every day.',
                    ]
                ).map((text) => (
                  <p key={text} className="text-base sm:text-[17px] leading-relaxed text-slate-700 font-normal">
                    {text}
                  </p>
                ))}
              </div>

              <div className="mt-8 flex max-lg:justify-center">
                <Link
                  to="/lokmangal/foundation"
                  className="inline-flex items-center gap-2.5 rounded-full bg-red-600 px-7 py-3 text-sm sm:text-base font-bold text-white shadow-md transition-all duration-300 hover:bg-[#000d3d] hover:shadow-lg hover:-translate-y-0.5"
                >
                  <span>{isMr ? 'फाउंडेशन कार्य सविस्तर पहा' : 'Explore Foundation Work'}</span>
                  <ArrowUpRight className="size-5" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
