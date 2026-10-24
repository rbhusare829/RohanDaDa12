import { useState } from 'react'
import { Mail, CheckCircle, ShieldCheck } from 'lucide-react'
import { Reveal } from '../ui/Motion'

/**
 * Newsletter Section (100% Supriya Sule Newsletter Bar Layout):
 * Centered navy or light section with email input, captcha verification badge, and subscribe button.
 */
export function SupriyaNewsletterSection({
  locale = 'mr',
}: {
  locale?: 'mr' | 'en'
}) {
  const isMr = locale !== 'en'
  const [email, setEmail] = useState('')
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setError(isMr ? 'कृपया वैध ईमेल पत्ता टाका.' : 'Please enter a valid email address.')
      return
    }
    if (!captchaVerified) {
      setError(isMr ? 'कृपया कॅप्चा पूर्ण करा.' : 'Please verify the captcha.')
      return
    }
    setError('')
    setSubmitted(true)
  }

  return (
    <section className="bg-stone-50 py-14 sm:py-16 border-b border-stone-200">
      <div className="container-x max-w-4xl">
        <Reveal>
          <div className="rounded-2xl bg-white border border-stone-200 p-8 sm:p-12 shadow-sm text-center">
            <div className="inline-grid size-12 place-items-center rounded-full bg-red-50 text-red-600 mb-3">
              <Mail className="size-6" />
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#000d3d]">
              {isMr ? 'ई-वृत्तपत्राची सदस्यता घ्या' : 'Subscribe to Our Newsletter'}
            </h2>
            <div className="mx-auto mt-2.5 mb-3 flex items-center justify-center gap-1.5">
              <span className="h-1 w-14 rounded-full bg-red-600" />
              <span className="h-1 w-3 rounded-full bg-saffron-500" />
            </div>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
              {isMr
                ? 'रोहन देशमुख यांचे विचार, नवीन उपक्रम आणि सोलापूरच्या विकासविषयक कामांची नियमित माहिती थेट आपल्या ईमेलवर मिळवा.'
                : 'Get the latest updates on speeches, social initiatives, and community work directly in your inbox.'}
            </p>

            {submitted ? (
              <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800">
                <CheckCircle className="size-5 shrink-0 text-emerald-600" />
                <span className="text-sm font-bold">
                  {isMr
                    ? 'धन्यवाद! आपली वर्गणी यशस्वीरित्या नोंदवली गेली आहे.'
                    : 'Thank you! You have been successfully subscribed.'}
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 max-w-xl mx-auto space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setError('')
                      }}
                      placeholder={isMr ? 'तुमचा ईमेल पत्ता टाका...' : 'Enter your email address...'}
                      required
                      className="w-full rounded-xl border border-stone-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-red-700 transition-colors shrink-0"
                  >
                    {isMr ? 'सदस्य व्हा' : 'Subscribe'}
                  </button>
                </div>

                {/* Simple Captcha Checkbox */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 bg-stone-100 hover:bg-stone-200/70 border border-stone-300 rounded-lg px-3 py-1.5 transition-colors">
                    <input
                      type="checkbox"
                      checked={captchaVerified}
                      onChange={(e) => {
                        setCaptchaVerified(e.target.checked)
                        setError('')
                      }}
                      className="size-4 rounded text-red-600 focus:ring-red-500"
                    />
                    <ShieldCheck className="size-4 text-emerald-600" />
                    <span>{isMr ? 'मी रोबोट नाही' : "I'm not a robot"}</span>
                  </label>
                </div>

                {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
