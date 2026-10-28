import { useState, useRef } from 'react'
import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import { m } from 'motion/react'
import { Reveal } from '../ui/Motion'

export function SocialAndVisionSection({
  locale = 'mr',
}: {
  locale?: 'mr' | 'en'
}) {
  const isMr = locale !== 'en'
  const [activeSlide, setActiveSlide] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const scrollLeft = el.scrollLeft
    const width = el.clientWidth * 0.75
    if (width > 0) {
      const idx = Math.round(scrollLeft / width)
      setActiveSlide(Math.min(Math.max(idx, 0), 1))
    }
  }

  const scrollToSlide = (index: number) => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.clientWidth * 0.86
    el.scrollTo({ left: index * cardWidth, behavior: 'smooth' })
    setActiveSlide(index)
  }

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

        {/* Responsive Container: Horizontal swipe/slide on mobile, 2-column grid on desktop */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-8 sm:overflow-visible sm:px-0 sm:pb-0 lg:gap-10 items-stretch"
        >
          {/* Card 1: समाजकार्य (Social Work) */}
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="group flex w-[86vw] max-w-[420px] shrink-0 snap-center sm:w-auto sm:max-w-none flex-col justify-between rounded-3xl bg-white text-slate-900 overflow-hidden shadow-[0_20px_50px_-20px_rgba(0,13,61,0.35)] ring-1 ring-stone-200/90 transition-all duration-300 hover:shadow-[0_28px_65px_-20px_rgba(0,13,61,0.55)] hover:-translate-y-2"
          >
            {/* Top Photo Header */}
            <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden bg-stone-100">
              <img
                src="/images/social-work/rohan-lokmangal-914A2588.webp"
                alt={isMr ? 'लोकमंगल फाउंडेशन समाजकार्य - सर्वधर्मीय सामुदायिक विवाह सोहळा' : 'Lokmangal Foundation Social Work - Community Weddings'}
                loading="lazy"
                decoding="async"
                className="size-full object-cover object-[center_20%] transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
              />

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
                {/* Header Row: Title */}
                <div className="mb-4">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold leading-tight text-[#000d3d]">
                    {isMr ? 'समाजकार्य' : 'Social Work'}
                  </h3>
                </div>

                {/* Main Paragraph */}
                <p className="text-sm sm:text-[15px] leading-relaxed text-slate-700 font-normal">
                  {isMr
                    ? 'लोकमंगल फाउंडेशनच्या माध्यमातून रोहन सुभाष देशमुख समाजाच्या गरजांनुसार विविध उपक्रम राबवतात. सोलापूर आणि धाराशिव जिल्ह्यांमध्ये कार्यरत असलेल्या या फाउंडेशनचा मुख्य उद्देश गरजू व्यक्तींना योग्य वेळी मदत करणे, त्यांच्या अडचणी दूर करण्यासाठी प्रयत्न करणे आणि त्यांना प्रगतीच्या संधी उपलब्ध करून देणे हा आहे. समाजातील विविध घटकांचे जीवनमान उंचावावे आणि त्यांना स्वावलंबी होण्यासाठी बळ मिळावे, यासाठी फाउंडेशन सातत्याने प्रयत्नशील आहे.'
                    : 'Through Lokmangal Foundation, Rohan Subhash Deshmukh carries out diverse initiatives tailored to societal needs. Active in Solapur and Dharashiv districts, the foundation’s primary goal is to provide timely assistance to those in need, address their challenges, and open new avenues of growth. The foundation continuously strives to uplift the living standards of all sections of society and empower them toward self-reliance.'}
                </p>
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
              </div>
            </div>
          </m.div>

          {/* Card 2: दृष्टिकोन (Vision) */}
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="group flex w-[86vw] max-w-[420px] shrink-0 snap-center sm:w-auto sm:max-w-none flex-col justify-between rounded-3xl bg-white text-slate-900 overflow-hidden shadow-[0_20px_50px_-20px_rgba(0,13,61,0.35)] ring-1 ring-stone-200/90 transition-all duration-300 hover:shadow-[0_28px_65px_-20px_rgba(0,13,61,0.55)] hover:-translate-y-2"
          >
            {/* Top Photo Header */}
            <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden bg-[#000d3d]">
              <img
                src="/images/hero/rohan-hero-book.webp"
                alt={isMr ? 'रोहन देशमुख - न्यू इंडिया मॅनिफेस्टो' : 'Rohan Deshmukh - The New India Manifesto'}
                loading="lazy"
                decoding="async"
                className="size-full object-cover object-[80%_15%] transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
              />

              {/* The Book Cover - Positioned Inward / Centered in the left dark zone */}
              <div className="absolute top-1/2 -translate-y-1/2 left-[12%] sm:left-[16%] lg:left-[18%] z-10 flex items-center">
                <div className="relative group/book rounded-md overflow-hidden shadow-[0_16px_36px_rgba(0,0,0,0.85)] ring-1 ring-white/25 transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1">
                  <img
                    src="/images/vision/new-india-manifesto-cover.webp"
                    alt={isMr ? 'न्यू इंडिया मॅनिफेस्टो - पुस्तक मुखपृष्ठ' : 'The New India Manifesto - Book Cover'}
                    loading="lazy"
                    decoding="async"
                    className="h-28 sm:h-36 lg:h-40 w-auto aspect-[1260/1946] object-cover rounded-md"
                  />
                </div>
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
                {/* Header Row: Title */}
                <div className="mb-4">
                  <h3 className="font-display text-xl sm:text-2xl font-bold leading-snug text-[#000d3d]">
                    {isMr
                      ? 'उद्योजकतेतून सक्षम महाराष्ट्राची निर्मिती'
                      : 'Building an Empowered Maharashtra through Entrepreneurship'}
                  </h3>
                </div>

                {/* Main Paragraph */}
                <p className="text-sm sm:text-[15px] leading-relaxed text-slate-700 font-normal">
                  {isMr
                    ? '‘न्यू इंडिया मॅनिफेस्टो’ या पुस्तकातून रोहन सुभाष देशमुख यांनी नवभारताच्या निर्मितीविषयीचा आपला दृष्टिकोन मांडला आहे. याच विचारांतून प्रेरणा घेत संपूर्ण महाराष्ट्रात सक्षम उद्योजकीय परिसंस्था उभारण्याचा त्यांचा संकल्प आहे. शहरांपासून गावांपर्यंतच्या तरुणांना योग्य मार्गदर्शन, सहकार्य आणि संधी उपलब्ध करून देत त्यांच्या कल्पनांचे यशस्वी व्यवसायांत रूपांतर व्हावे, हा त्यांच्या प्रयत्नांचा मुख्य उद्देश आहे.'
                    : 'In his book ‘The New India Manifesto’, Rohan Subhash Deshmukh articulated his vision for building a new India. Drawing inspiration from these ideals, his resolution is to cultivate a robust entrepreneurial ecosystem across Maharashtra. Providing youth from cities to villages with the right mentorship, collaboration, and opportunities to transform their ideas into thriving ventures is the core objective of his endeavors.'}
                </p>

                {/* Second Paragraph */}
                <p className="mt-3.5 text-sm sm:text-[15px] leading-relaxed text-slate-700 font-normal">
                  {isMr
                    ? 'तरुणांनी स्वतःच्या क्षमतेवर विश्वास ठेवून स्वावलंबी व्हावे आणि रोजगार शोधण्याऐवजी रोजगारनिर्मिती करावी, हा त्यांच्या दृष्टिकोनाचा केंद्रबिंदू आहे.'
                    : 'Instilling confidence in young people to become self-reliant and shift from job seekers to job creators is the focal point of his vision.'}
                </p>
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
              </div>
            </div>
          </m.div>
        </div>

        {/* Mobile Slide Indicators */}
        <div className="mt-4 flex sm:hidden justify-center items-center gap-2">
          <button
            type="button"
            onClick={() => scrollToSlide(0)}
            aria-label={isMr ? 'पहिले कार्ड: समाजकार्य' : 'First card: Social Work'}
            className={`h-2 rounded-full transition-all duration-300 ${activeSlide === 0 ? 'w-6 bg-red-500' : 'w-2 bg-white/40'}`}
          />
          <button
            type="button"
            onClick={() => scrollToSlide(1)}
            aria-label={isMr ? 'दुसरे कार्ड: दृष्टिकोन' : 'Second card: Vision'}
            className={`h-2 rounded-full transition-all duration-300 ${activeSlide === 1 ? 'w-6 bg-red-500' : 'w-2 bg-white/40'}`}
          />
        </div>
      </div>
    </section>
  )
}
