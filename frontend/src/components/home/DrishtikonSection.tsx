import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import { Reveal } from './HomeMotion'

export function DrishtikonSection({
  locale = 'mr',
}: {
  locale?: 'mr' | 'en'
}) {
  const isMr = locale !== 'en'

  return (
    <section
      className="relative py-14 sm:py-18 lg:py-22 border-t border-b border-orange-100/80 overflow-hidden"
      style={{
        background:
          'linear-gradient(110deg, #fff2e8 0%, #fff7f2 35%, #ffffff 75%, #ffffff 100%)',
      }}
      aria-labelledby="vision-section-heading"
    >
      {/* Saffron watercolor texture from user reference image */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-45 bg-no-repeat bg-left-top bg-cover sm:bg-[length:auto_100%]"
        style={{
          backgroundImage: "url('/images/backgrounds/manifesto-pattern.png')",
        }}
      />
      {/* Soft warm saffron atmospheric glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 -left-12 size-96 rounded-full bg-[#fdba74]/25 blur-3xl -z-10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 right-10 size-80 rounded-full bg-[#fed7aa]/20 blur-3xl -z-10"
      />
      <div className="container-x relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14 lg:mb-16">
          <Reveal>
            <h2
              id="vision-section-heading"
              className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#000d3d]"
            >
              {isMr ? 'न्यू इंडिया मॅनिफेस्टो' : 'New India Manifesto'}
            </h2>

            <div className="mt-3 flex justify-center items-center gap-1.5">
              <span className="h-1 w-16 rounded-full bg-red-600" />
              <span className="h-1 w-3.5 rounded-full bg-saffron-500" />
            </div>

            <p className="mt-3.5 mx-auto max-w-2xl text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              {isMr
                ? 'नवभारताच्या विचारांतून सक्षम, स्वावलंबी महाराष्ट्राचा ध्यास.'
                : 'Dedicated to building an empowered, self-reliant Maharashtra through modern entrepreneurship.'}
            </p>
          </Reveal>
        </div>

        {/* Open 2-Column Layout (NO enclosing card/box) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center max-w-6xl mx-auto">
          {/* Photo & Book Column */}
          <div className="lg:col-span-6">
            <Reveal delay={0.05} x={-40}>
              <div className="relative overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/10 aspect-[4/3] sm:aspect-[16/11] bg-[#000d3d] group">
                <img
                  src="/images/hero/rohan-hero-book.webp"
                  alt={isMr ? 'रोहन देशमुख - न्यू इंडिया मॅनिफेस्टो' : 'Rohan Deshmukh - The New India Manifesto'}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover object-[80%_15%] transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none"
                />

                {/* Centered Book Cover in the left dark zone */}
                <div className="absolute top-1/2 -translate-y-1/2 left-[10%] sm:left-[14%] lg:left-[16%] z-10 flex items-center">
                  <div className="relative group/book rounded-md overflow-hidden shadow-[0_16px_36px_rgba(0,0,0,0.85)] ring-1 ring-white/25 transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1">
                    <img
                      src="/images/vision/new-india-manifesto-cover.webp"
                      alt={isMr ? 'न्यू इंडिया मॅनिफेस्टो - पुस्तक मुखपृष्ठ' : 'The New India Manifesto - Book Cover'}
                      loading="lazy"
                      decoding="async"
                      className="h-32 sm:h-38 lg:h-44 w-auto aspect-[1260/1946] object-cover rounded-md"
                    />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Text Column */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <Reveal delay={0.2} x={40}>
              <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-[#000d3d]">
                {isMr
                  ? 'उद्योजकतेतून सक्षम महाराष्ट्राची निर्मिती'
                  : 'Building an Empowered Maharashtra through Entrepreneurship'}
              </h3>

              <div className="mt-3 mb-5 flex items-center gap-1.5">
                <span className="h-1 w-12 rounded-full bg-red-600" />
                <span className="h-1 w-3 rounded-full bg-saffron-500" />
              </div>

              <div className="space-y-4">
                {(isMr
                  ? [
                      '‘न्यू इंडिया मॅनिफेस्टो’ या पुस्तकातून रोहन सुभाष देशमुख यांनी नवभारताच्या निर्मितीविषयीचा आपला दृष्टिकोन मांडला आहे. याच विचारांतून प्रेरणा घेत संपूर्ण महाराष्ट्रात सक्षम उद्योजकीय परिसंस्था उभारण्याचा त्यांचा संकल्प आहे. शहरांपासून गावांपर्यंतच्या तरुणांना योग्य मार्गदर्शन, सहकार्य आणि संधी उपलब्ध करून देत त्यांच्या कल्पनांचे यशस्वी व्यवसायांत रूपांतर व्हावे, हा त्यांच्या प्रयत्नांचा मुख्य उद्देश आहे.',
                      'तरुणांनी स्वतःच्या क्षमतेवर विश्वास ठेवून स्वावलंबी व्हावे आणि रोजगार शोधण्याऐवजी रोजगारनिर्मिती करावी, हा त्यांच्या दृष्टिकोनाचा केंद्रबिंदू आहे.',
                    ]
                  : [
                      'In his book New India Manifesto, Rohan Subhash Deshmukh shares his ideas for building a better India. Inspired by these ideas, he wants to build a strong business community across Maharashtra.',
                      'He works with young people from both cities and villages. He helps them with guidance, support, and chances to grow, so their ideas can become real businesses.',
                      'He believes young people should trust themselves, stand on their own feet, and create jobs for others instead of only looking for jobs.',
                    ]
                ).map((text) => (
                  <p key={text} className="text-base sm:text-[17px] leading-relaxed text-slate-700 font-normal">
                    {text}
                  </p>
                ))}
              </div>

              <div className="mt-8 flex max-lg:justify-center">
                <Link
                  to="/vision"
                  className="inline-flex items-center gap-2.5 rounded-full bg-red-600 px-7 py-3 text-sm sm:text-base font-bold text-white shadow-md transition-all duration-300 hover:bg-[#000d3d] hover:shadow-lg hover:-translate-y-0.5"
                >
                  <span>{isMr ? 'व्हिजन सविस्तर वाचा' : 'Read Full Vision'}</span>
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
