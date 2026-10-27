import { Link } from 'react-router'
import { Landmark, Briefcase, GraduationCap, HeartPulse, Users, Sprout, ArrowRight } from 'lucide-react'
import { Reveal } from '../ui/Motion'

const INITIATIVES = [
  {
    icon: Landmark,
    title: 'सहकारी बँकिंग व पतसंस्था',
    enTitle: 'Cooperative Banking',
    description: 'शेतकरी, छोटे व्यावसायिक व महिला बचत गटांना स्वावलंबी बनवण्यासाठी आधुनिक व विश्वासार्ह बँकिंग सेवा.',
    enDescription: 'Modern, trustworthy banking that helps farmers, small businesses and women’s self-help groups stand on their own feet.',
    link: '/lokmangal/parivar',
    badge: '४ संस्था',
    enBadge: '4 institutions',
  },
  {
    icon: Briefcase,
    title: 'उद्योग व शेतमाल मूल्यवर्धन',
    enTitle: 'Agro-Industries & Jobs',
    description: 'साखर, इथेनॉल व सहवीज निर्मितीच्या माध्यमातून ग्रामीण भागात रोजगार निर्मिती आणि शेतकऱ्यांच्या मालाला योग्य दर.',
    enDescription: 'Sugar, ethanol and co-generation units that create rural jobs and get farmers a fair price for their produce.',
    link: '/lokmangal/parivar',
    badge: '४ उद्योग',
    enBadge: '4 industries',
  },
  {
    icon: GraduationCap,
    title: 'दर्जेदार शिक्षण व प्रशिक्षण',
    enTitle: 'Education & Academics',
    description: 'प्राथमिक शाळेपासून व्यावसायिक महाविद्यालयांपर्यंत ग्रामीण विद्यार्थ्यांना गुणवत्तापूर्ण शिक्षण व करिअर मार्गदर्शन.',
    enDescription: 'Quality education and career guidance for rural students, from primary school to professional colleges.',
    link: '/lokmangal/parivar',
    badge: '१० महाविद्यालये',
    enBadge: '10 colleges',
  },
  {
    icon: HeartPulse,
    title: 'आरोग्य व सामाजिक कल्याण',
    enTitle: 'Healthcare & Welfare',
    description: 'मोफत सर्वोपचार आरोग्य शिबिरे, मोफत सामूहिक विवाह सोहळे आणि आपत्कालीन मदतीचे सामाजिक उपक्रम.',
    enDescription: 'Free health camps, free community weddings and emergency relief for families in need.',
    link: '/social-work',
    badge: '५ उपक्रम',
    enBadge: '5 initiatives',
  },
  {
    icon: Users,
    title: 'युवा नेतृत्व व नवनिर्मिती',
    enTitle: 'Youth & Enterprise',
    description: 'स्वामी विवेकानंद विचार यात्रा, सीएम चषक क्रीडा स्पर्धा आणि स्टार्टअप परिसंस्थेच्या माध्यमातून तरुणांना संधी.',
    enDescription: 'Opportunities for young people through the Swami Vivekananda Vichar Yatra, the CM Cup sports tournament and the startup ecosystem.',
    link: '/political-career',
    badge: 'लाखो तरुण',
    enBadge: 'Lakhs of youth',
  },
  {
    icon: Sprout,
    title: 'शेतकरी विकास व जलसंधारण',
    enTitle: 'Agriculture & Water',
    description: 'जलसंधारण प्रकल्प, आधुनिक शेती तंत्रज्ञान आणि शेतकरी कुटुंबांना शाश्वत उपजीविकेसाठी थेट सहकार्य.',
    enDescription: 'Water conservation projects, modern farming techniques and direct support for sustainable livelihoods for farming families.',
    link: '/social-work',
    badge: 'ग्रामीण विकास',
    enBadge: 'Rural development',
  },
]

/**
 * Initiatives & Key Focus Areas (100% Supriya Sule Layout):
 * 6-grid clean card layout with icons, titles, descriptions, and action links.
 */
export function SupriyaInitiativesSection({
  locale = 'mr',
}: {
  locale?: 'mr' | 'en'
}) {
  const isMr = locale !== 'en'

  return (
    <section className="bg-[#f0f6fc] border-t border-stone-200 py-16 sm:py-24">
      <div className="container-x">
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-red-600">
            {isMr ? 'विकासाची ध्येये' : 'Key Focus Areas'}
          </span>
          <h2 className="mt-1 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#000d3d]">
            {isMr ? 'प्रमुख कार्यक्षेत्रे आणि उपक्रम' : 'Key Initiatives & Social Work'}
          </h2>
          <div className="mt-2.5 mb-4 flex justify-center items-center gap-1.5">
            <span className="h-1 w-14 rounded-full bg-red-600" />
            <span className="h-1 w-3 rounded-full bg-saffron-500" />
          </div>
          <p className="mx-auto max-w-2xl text-sm sm:text-base leading-relaxed text-slate-600">
            {isMr
              ? 'सहकार, उद्योग, शिक्षण, आरोग्य आणि समाजसेवेच्या माध्यमातून सोलापूर व महाराष्ट्राच्या प्रगतीसाठी अविरत कार्य.'
              : 'Working dedicatedly across banking, industries, education, healthcare and community service.'}
          </p>
        </div>

        <Reveal delay={0.08}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {INITIATIVES.map((it, i) => {
              const Icon = it.icon
              return (
                <Link
                  key={i}
                  to={it.link}
                  className="group flex flex-col justify-between h-full rounded-2xl bg-white border border-stone-200/90 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-red-400"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="grid size-12 place-items-center rounded-xl bg-red-50 text-red-600 transition-transform duration-300 group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white">
                        <Icon className="size-6" />
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">
                        {isMr ? it.badge : it.enBadge}
                      </span>
                    </div>

                    <h3 className="font-display text-lg sm:text-xl font-bold text-[#000d3d] group-hover:text-red-600 transition-colors">
                      {isMr ? it.title : it.enTitle}
                    </h3>

                    <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-600">
                      {isMr ? it.description : it.enDescription}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-red-600">
                    <span>{isMr ? 'अधिक माहिती पहा' : 'Learn more'}</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              )
            })}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
