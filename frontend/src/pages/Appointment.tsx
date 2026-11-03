import { useState } from 'react'
import { Link } from 'react-router'
import { CalendarCheck, CheckCircle2, ChevronRight, Clock, Home, Loader2, MapPin, Paperclip, Send } from 'lucide-react'
import { api } from '@/lib/api'
import { getLocale } from '@/lib/i18n'
import { Seo } from '@/components/layout/Seo'
import { Reveal } from '@/components/ui/Motion'

export default function AppointmentPage() {
  const isMr = getLocale() !== 'en'

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    address: '',
    reason: '',
    preferredDate: '',
    preferredTime: '',
    website: '' })
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [referenceNo, setReferenceNo] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!formData.name.trim()) {
      setErrorMsg(isMr ? 'कृपया आपले पूर्ण नाव भरा.' : 'Please enter your full name.')
      return
    }
    if (!formData.mobile.trim() || !/^[6-9]\d{9}$/.test(formData.mobile.replace(/\D/g, ''))) {
      setErrorMsg(isMr ? 'कृपया वैध १० अंकी मोबाईल नंबर टाका.' : 'Please enter a valid 10-digit mobile number.')
      return
    }
    if (!formData.address.trim()) {
      setErrorMsg(isMr ? 'कृपया आपला पूर्ण पत्ता भरा.' : 'Please enter your full address.')
      return
    }
    if (!formData.reason.trim()) {
      setErrorMsg(isMr ? 'कृपया भेटीचे कारण / विषय भरा.' : 'Please enter the reason for the appointment.')
      return
    }

    setSubmitting(true)
    const body = new FormData()
    body.set('name', formData.name.trim())
    body.set('mobile', formData.mobile.trim())
    body.set('address', formData.address.trim())
    body.set('reason', formData.reason.trim())
    if (formData.preferredDate) body.set('preferredDate', formData.preferredDate)
    if (formData.preferredTime) body.set('preferredTime', formData.preferredTime)
    if (formData.website) body.set('website', formData.website)
    if (file) body.set('attachment', file, file.name)

    try {
      const res = await api.post('/api/forms/appointment', body, { validateStatus: () => true })
      const data = res.data as { ok?: boolean; referenceNo?: string; message?: string }
      if (data?.ok && data.referenceNo) {
        setReferenceNo(data.referenceNo)
      } else {
        setErrorMsg(data?.message || (isMr ? 'काहीतरी चूक झाली, कृपया पुन्हा प्रयत्न करा.' : 'Something went wrong, please try again.'))
      }
    } catch {
      setErrorMsg(isMr ? 'सर्व्हरशी संपर्क होऊ शकला नाही. कृपया थोड्या वेळाने प्रयत्न करा.' : 'Could not connect to the server. Please try again later.')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      mobile: '',
      address: '',
      reason: '',
      preferredDate: '',
      preferredTime: '',
      website: '' })
    setFile(null)
    setReferenceNo(null)
    setErrorMsg(null)
  }

  return (
    <>
      <Seo
        title={isMr ? 'भेटीची विनंती — भेटीचे विवरण' : 'Meeting Request / Appointment — Rohan Deshmukh'}
        description={isMr ? 'रोहनदादांना प्रत्यक्ष भेटून चर्चा करण्यासाठी व विचार मांडण्यासाठी वेळ निश्चित करा.' : 'Request and schedule an official appointment with Rohan Subhash Deshmukh.'}
      />
      {/* Clean page title band (no photo): Cloud, Modern Teal title, the saffron underline + jade dot (Modern Teal + Saffron) */}
      <section className="relative w-full overflow-hidden bg-cream text-charcoal-900">
        <div className="container-x py-5 sm:py-8">
          <h1 className="text-2xl font-bold leading-[1.2] tracking-tight text-[#0F5C63] sm:text-3xl lg:text-4xl">
            {isMr ? 'भेटीचे विवरण' : 'Meeting / Appointment'}
          </h1>
          <div aria-hidden className="mt-3 flex items-center gap-1.5">
            <span className="h-1.5 w-12 sm:w-14 rounded-full bg-gold" />
            <span className="h-1.5 w-3 sm:w-3.5 rounded-full bg-leaf-600" />
          </div>
        </div>
      </section>

      {/* Breadcrumbs Bar: Exact match to other pages */}
      <nav aria-label="Breadcrumb" className="border-b border-line bg-paper py-2.5 text-xs text-ink">
        <ol className="container-x pl-12 sm:pl-14 lg:pl-16 xl:pl-12 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <li>
            <Link to="/" className="inline-flex items-center gap-1.5 font-bold text-charcoal-900 transition-colors hover:text-saffron-700">
              <Home aria-hidden className="size-3.5" />
              <span>{isMr ? 'मुख्य पृष्ठ' : 'Home'}</span>
            </Link>
          </li>
          <li className="flex items-center gap-2">
            <ChevronRight aria-hidden className="size-3 text-muted" />
            <span aria-current="page" className="line-clamp-1 font-semibold text-charcoal-900">
              {isMr ? 'भेटीचे विवरण' : 'Meeting / Appointment'}
            </span>
          </li>
        </ol>
      </nav>

      <div className="min-h-[60vh] bg-paper py-8 sm:py-12">
        <div className="container-x">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Main Form: Appears FIRST on mobile (order-1), and on the right in desktop (lg:order-2) */}
          <div className="order-1 lg:order-2 lg:col-span-8">
            <Reveal className="overflow-hidden rounded-3xl border border-line bg-cream p-6 sm:p-10 shadow-[0_20px_50px_rgba(24,33,38,0.06)]">
              {referenceNo ? (
                /* Success View */
                <div className="py-8 text-center animate-tab-in" role="status">
                  <span className="mx-auto grid size-20 place-items-center rounded-full bg-leaf-600 text-white shadow-xl shadow-leaf-600/25">
                    <CheckCircle2 className="size-10" />
                  </span>
                  <span className="mt-5 inline-block text-xs font-bold uppercase tracking-widest text-leaf-700">
                    {isMr ? 'भेटीची विनंती यशस्वीरित्या प्राप्त झाली!' : 'Appointment Request Received!'}
                  </span>
                  <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-[#182126]">
                    {isMr ? 'धन्यवाद, आपली विनंती नोंदवली गेली आहे.' : 'Thank you, your appointment request has been recorded.'}
                  </h2>
                  <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
                    {isMr
                      ? 'आपल्या विनंतीची नोंद जनसंपर्क कार्यालयात झाली असून लवकरच उपलब्ध वेळेबाबत आपल्या मोबाईलवर संपर्क साधण्यात येईल.'
                      : 'Our office has received your request and will contact you via phone regarding the confirmed time slot.'}
                  </p>

                  <div className="mx-auto mt-6 inline-flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-saffron-200 bg-paper px-6 py-4">
                    <span className="text-xs font-semibold text-saffron-800">
                      {isMr ? 'आपला संदर्भ क्रमांक (Reference Number):' : 'Your Reference Number:'}
                    </span>
                    <span className="mt-1 tabular-nums text-xl sm:text-2xl font-black text-saffron-600 tracking-wider">
                      {referenceNo}
                    </span>
                    <span className="mt-1 text-[11px] text-ink">
                      {isMr ? 'भविष्यातील संदर्भासाठी हा क्रमांक कृपया जतन करून ठेवा.' : 'Please keep this reference number for future inquiries.'}
                    </span>
                  </div>

                  <div className="mt-8 flex justify-center gap-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-xl bg-charcoal-900 px-6 py-3 text-sm font-bold text-paper hover:bg-charcoal-950 transition-colors shadow-sm cursor-pointer"
                    >
                      {isMr ? 'नवीन भेटीची विनंती नोंदवा' : 'Submit Another Request'}
                    </button>
                    <Link
                      to="/"
                      className="rounded-xl border-2 border-charcoal-900 px-6 py-3 text-sm font-bold text-charcoal-900 hover:bg-charcoal-900 hover:text-paper transition-colors"
                    >
                      {isMr ? 'मुख्य पृष्ठ' : 'Go to Home'}
                    </Link>
                  </div>
                </div>
              ) : (
                /* Form View */
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />

                  <div className="border-b border-line pb-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-saffron-700">
                      {isMr ? 'भेटीचे तपशील' : 'Appointment Details'}
                    </p>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-[#182126]">
                      {isMr ? 'आपली माहिती व भेटीचे कारण' : 'Enter Your Meeting Request Details'}
                    </h2>
                  </div>

                  {errorMsg && (
                    <div className="rounded-xl border border-danger/30 bg-danger-soft p-4 text-sm text-danger">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {/* Full Name */}
                    <div>
                      <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-1.5">
                        {isMr ? 'पूर्ण नाव *' : 'Full Name *'}
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={isMr ? 'उदा. महेश बाबुराव पाटील' : 'e.g. Ramesh Patil'}
                        className="w-full rounded-xl border border-field bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-saffron-600 focus:ring-2 focus:ring-saffron-200 outline-none transition-all"
                      />
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label htmlFor="mobile" className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-1.5">
                        {isMr ? 'मोबाईल नंबर *' : 'Mobile Number *'}
                      </label>
                      <input
                        id="mobile"
                        type="tel"
                        required
                        maxLength={10}
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                        placeholder={isMr ? 'उदा. ९८XXXXXXXX' : '10-digit mobile number'}
                        className="w-full rounded-xl border border-field bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-saffron-600 focus:ring-2 focus:ring-saffron-200 outline-none transition-all tabular-nums"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label htmlFor="address" className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-1.5">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-saffron-600" />
                        {isMr ? 'पूर्ण पत्ता (गाव / शहर / तालुका) *' : 'Full Address (Village / Town / City) *'}
                      </span>
                    </label>
                    <input
                      id="address"
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder={isMr ? 'उदा. मु. पो. बोरामणी, ता. दक्षिण सोलापूर' : 'e.g. Boramani, South Solapur'}
                      className="w-full rounded-xl border border-field bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-saffron-600 focus:ring-2 focus:ring-saffron-200 outline-none transition-all"
                    />
                  </div>

                  {/* Reason for Meeting */}
                  <div>
                    <label htmlFor="reason" className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-1.5">
                      {isMr ? 'भेटीचे कारण / विषय *' : 'Reason / Agenda for Meeting *'}
                    </label>
                    <textarea
                      id="reason"
                      rows={4}
                      required
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder={isMr ? 'भेटीचे कारण किंवा ज्या विषयावर चर्चा करायची आहे त्याचा थोडक्यात तपशील लिहा...' : 'Briefly describe the purpose of meeting or the topics you wish to discuss...'}
                      className="w-full rounded-xl border border-field bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-saffron-600 focus:ring-2 focus:ring-saffron-200 outline-none transition-all resize-y"
                    />
                  </div>

                  {/* Preferred Date & Time */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="preferredDate" className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-1.5">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarCheck className="size-3.5 text-saffron-600" />
                          {isMr ? 'अपेक्षित / इच्छित तारीख (पर्यायी)' : 'Preferred Date (Optional)'}
                        </span>
                      </label>
                      <input
                        id="preferredDate"
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                        className="w-full rounded-xl border border-field bg-white px-4 py-3 text-sm text-ink focus:border-saffron-600 focus:ring-2 focus:ring-saffron-200 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="preferredTime" className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-1.5">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="size-3.5 text-saffron-600" />
                          {isMr ? 'अपेक्षित वेळ (पर्यायी)' : 'Preferred Time (Optional)'}
                        </span>
                      </label>
                      <input
                        id="preferredTime"
                        type="time"
                        value={formData.preferredTime}
                        onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                        className="w-full rounded-xl border border-field bg-white px-4 py-3 text-sm text-ink focus:border-saffron-600 focus:ring-2 focus:ring-saffron-200 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Optional File Attachment */}
                  <div>
                    <label htmlFor="attachment" className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-1.5">
                      <span className="inline-flex items-center gap-1.5">
                        <Paperclip className="size-3.5 text-saffron-600" />
                        {isMr ? 'संबंधित कागदपत्र किंवा फाईल (पर्यायी - PDF किंवा फोटो, कमाल 10MB)' : 'Related Document (Optional - PDF or Image, max 10MB)'}
                      </span>
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        id="attachment"
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        className="w-full text-xs text-ink file:mr-4 file:rounded-xl file:border-0 file:bg-charcoal-900 file:px-4 file:py-2.5 file:text-xs file:font-semibold file:text-paper hover:file:bg-saffron-600 cursor-pointer"
                      />
                      {file && (
                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          className="shrink-0 rounded-lg px-2 py-1 text-xs text-danger hover:bg-danger-soft"
                        >
                          {isMr ? 'काढा' : 'Remove'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl btn-sweep bg-btn px-6 py-4 text-base font-bold text-ink shadow-md shadow-saffron-600/20 transition-all hover:text-white active:scale-[0.99] disabled:opacity-60 cursor-pointer sm:w-auto sm:min-w-[220px]"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="size-5 animate-spin" />
                          <span>{isMr ? 'नोंदणी होत आहे...' : 'Submitting...'}</span>
                        </>
                      ) : (
                        <>
                          <Send className="size-5" />
                          <span>{isMr ? 'भेटीची विनंती पाठवा' : 'Request Appointment'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </Reveal>
          </div>

          {/* Quick Links: Appears BELOW the form on mobile (order-2), and on the left in desktop (lg:order-1) */}
          <div className="order-2 lg:order-1 lg:col-span-4">
            <div className="lg:sticky lg:top-28 rounded-3xl border border-line bg-cream p-6 sm:p-7 shadow-xs">
              <h2 className="font-display text-base sm:text-lg font-bold text-[#182126]">
                {isMr ? 'इतर नागरिक सेवा' : 'Other Citizen Services'}
              </h2>
              <div className="mt-4 space-y-2 text-sm">
                <Link to="/grievance" className="flex items-center justify-between rounded-xl p-3 font-semibold text-charcoal-900 hover:bg-paper hover:text-saffron-700 transition-colors">
                  <span>{isMr ? 'कामाचे निवेदन' : 'Grievance / Work Petition'}</span>
                  <span aria-hidden className="text-base text-saffron-700">→</span>
                </Link>
                <Link to="/invitation" className="flex items-center justify-between rounded-xl p-3 font-semibold text-charcoal-900 hover:bg-paper hover:text-saffron-700 transition-colors">
                  <span>{isMr ? 'शुभकार्य आमंत्रण' : 'Event Invitation'}</span>
                  <span aria-hidden className="text-base text-saffron-700">→</span>
                </Link>
                <Link to="/contact" className="flex items-center justify-between rounded-xl p-3 font-semibold text-charcoal-900 hover:bg-paper hover:text-saffron-700 transition-colors">
                  <span>{isMr ? 'संपर्क साधा' : 'Contact Office'}</span>
                  <span aria-hidden className="text-base text-saffron-700">→</span>
                </Link>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </>
  )
}

