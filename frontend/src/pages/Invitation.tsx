import { useState } from 'react'
import { Link } from 'react-router'
import { Calendar, CheckCircle2, ChevronRight, Clock, Home, Loader2, MapPin, Paperclip, Send } from 'lucide-react'
import { api } from '@/lib/api'
import { getLocale } from '@/lib/i18n'
import { Seo } from '@/components/layout/Seo'
import { Reveal } from '@/components/ui/Motion'

export default function InvitationPage() {
  const isMr = getLocale() !== 'en'

  const [formData, setFormData] = useState({
    organizerName: '',
    mobile: '',
    eventTitle: '',
    eventDate: '',
    eventTime: '',
    location: '',
    description: '',
    website: '' })
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [referenceNo, setReferenceNo] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!formData.organizerName.trim()) {
      setErrorMsg(isMr ? 'कृपया निमंत्रक किंवा कुटुंबाचे/संस्थेचे नाव भरा.' : 'Please enter organizer/family name.')
      return
    }
    if (!formData.mobile.trim() || !/^[6-9]\d{9}$/.test(formData.mobile.replace(/\D/g, ''))) {
      setErrorMsg(isMr ? 'कृपया वैध १० अंकी मोबाईल नंबर टाका.' : 'Please enter a valid 10-digit mobile number.')
      return
    }
    if (!formData.eventTitle.trim()) {
      setErrorMsg(isMr ? 'कृपया कार्यक्रमाचे नाव किंवा स्वरूप भरा.' : 'Please enter the event name/type.')
      return
    }
    if (!formData.eventDate.trim()) {
      setErrorMsg(isMr ? 'कृपया कार्यक्रमाची तारीख निवडा.' : 'Please select the event date.')
      return
    }
    if (!formData.location.trim()) {
      setErrorMsg(isMr ? 'कृपया कार्यक्रमाचे ठिकाण व पत्ता भरा.' : 'Please enter event venue and address.')
      return
    }

    setSubmitting(true)
    const body = new FormData()
    body.set('organizerName', formData.organizerName.trim())
    body.set('mobile', formData.mobile.trim())
    body.set('eventTitle', formData.eventTitle.trim())
    body.set('eventDate', formData.eventDate.trim())
    if (formData.eventTime) body.set('eventTime', formData.eventTime.trim())
    body.set('location', formData.location.trim())
    if (formData.description) body.set('description', formData.description.trim())
    if (formData.website) body.set('website', formData.website)
    if (file) body.set('attachment', file, file.name)

    try {
      const res = await api.post('/api/forms/invitation', body, { validateStatus: () => true })
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
      organizerName: '',
      mobile: '',
      eventTitle: '',
      eventDate: '',
      eventTime: '',
      location: '',
      description: '',
      website: '' })
    setFile(null)
    setReferenceNo(null)
    setErrorMsg(null)
  }

  return (
    <>
      <Seo
        title={isMr ? 'शुभकार्य आमंत्रण — रोहन सुभाष देशमुख' : 'Event Invitation — Rohan Subhash Deshmukh'}
        description={isMr ? 'विवाह सोहळा, उद्घाटन किंवा सामाजिक व कौटुंबिक कार्यक्रमाचे आमंत्रण थेट रोहनदादांना पाठवा.' : 'Send wedding, opening ceremony, and family function invitations to Rohan Subhash Deshmukh.'}
      />
      {/* Clean page title band (no photo): Cloud, Modern Teal title, the saffron underline + jade dot (Modern Teal + Saffron) */}
      <section className="relative w-full overflow-hidden bg-cream text-charcoal-900">
        <div className="container-x py-5 sm:py-8">
          <h1 className="text-2xl font-bold leading-[1.2] tracking-tight text-[#0F5C63] sm:text-3xl lg:text-4xl">
            {isMr ? 'शुभकार्य आमंत्रण' : 'Event Invitation'}
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
              {isMr ? 'शुभकार्य आमंत्रण' : 'Event Invitation'}
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
                    {isMr ? 'आमंत्रण यशस्वीरित्या प्राप्त झाले!' : 'Invitation Received Successfully!'}
                  </span>
                  <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-[#182126]">
                    {isMr ? 'मनःपूर्वक धन्यवाद! आपले आमंत्रण नोंदवले गेले आहे.' : 'Thank you! Your invitation has been recorded.'}
                  </h2>
                  <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
                    {isMr
                      ? 'आपल्या निमंत्रणाची नोंद झाली असून रोहनदादांच्या दैनंदिन दौऱ्याच्या व कार्यक्रमांच्या नियोजनात ते समाविष्ट केले जाईल.'
                      : 'Your invitation has been submitted to the office calendar for scheduling into Rohan Deshmukh’s tour program.'}
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
                      {isMr ? 'दुसरे आमंत्रण पाठवा' : 'Submit Another Invitation'}
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
                      {isMr ? 'आमंत्रण तपशील' : 'Invitation Details'}
                    </p>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-[#182126]">
                      {isMr ? 'शुभकार्याची माहिती व स्थळ' : 'Event and Venue Information'}
                    </h2>
                  </div>

                  {errorMsg && (
                    <div className="rounded-xl border border-danger/30 bg-danger-soft p-4 text-sm text-danger">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {/* Organizer / Family Name */}
                    <div>
                      <label htmlFor="organizerName" className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-1.5">
                        {isMr ? 'निमंत्रक / कुटुंबाचे नाव *' : 'Organizer / Family Name *'}
                      </label>
                      <input
                        id="organizerName"
                        type="text"
                        required
                        value={formData.organizerName}
                        onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                        placeholder={isMr ? 'उदा. श्री. पांडुरंग काळे व परिवार' : 'e.g. Mr. Ramesh Kale & Family'}
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

                  {/* Event Title */}
                  <div>
                    <label htmlFor="eventTitle" className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-1.5">
                      {isMr ? 'कार्यक्रमाचे नाव / स्वरूप *' : 'Event Title / Purpose *'}
                    </label>
                    <input
                      id="eventTitle"
                      type="text"
                      required
                      value={formData.eventTitle}
                      onChange={(e) => setFormData({ ...formData, eventTitle: e.target.value })}
                      placeholder={isMr ? 'उदा. चिरंजीव अमित व कु. स्नेहल यांचा शुभविवाह सोहळा' : 'e.g. Wedding ceremony of Amit & Snehal'}
                      className="w-full rounded-xl border border-field bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-saffron-600 focus:ring-2 focus:ring-saffron-200 outline-none transition-all"
                    />
                  </div>

                  {/* Event Date & Time */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="eventDate" className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-1.5">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="size-3.5 text-saffron-600" />
                          {isMr ? 'कार्यक्रमाची तारीख *' : 'Event Date *'}
                        </span>
                      </label>
                      <input
                        id="eventDate"
                        type="date"
                        required
                        value={formData.eventDate}
                        onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                        className="w-full rounded-xl border border-field bg-white px-4 py-3 text-sm text-ink focus:border-saffron-600 focus:ring-2 focus:ring-saffron-200 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="eventTime" className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-1.5">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="size-3.5 text-saffron-600" />
                          {isMr ? 'कार्यक्रमाची वेळ (उदा. सकाळी ११:०० वा.)' : 'Event Time (e.g. 11:00 AM)'}
                        </span>
                      </label>
                      <input
                        id="eventTime"
                        type="text"
                        value={formData.eventTime}
                        onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                        placeholder={isMr ? 'उदा. सकाळी ११:३० वा.' : 'e.g. 11:30 AM'}
                        className="w-full rounded-xl border border-field bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-saffron-600 focus:ring-2 focus:ring-saffron-200 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Venue & Location */}
                  <div>
                    <label htmlFor="location" className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-1.5">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-saffron-600" />
                        {isMr ? 'कार्यक्रमाचे स्थळ व पूर्ण पत्ता *' : 'Event Venue & Full Address *'}
                      </span>
                    </label>
                    <input
                      id="location"
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder={isMr ? 'उदा. राजलक्ष्मी मंगल कार्यालय, जुना पुणे नाका, सोलापूर' : 'e.g. Rajlakshmi Hall, Old Pune Naka, Solapur'}
                      className="w-full rounded-xl border border-field bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-saffron-600 focus:ring-2 focus:ring-saffron-200 outline-none transition-all"
                    />
                  </div>

                  {/* Description / Additional Notes */}
                  <div>
                    <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-1.5">
                      {isMr ? 'इतर माहिती / विशेष नोंद (पर्यायी)' : 'Additional Details (Optional)'}
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder={isMr ? 'कार्यक्रमाबाबत कोणतीही अधिक माहिती किंवा विशेष विनंती असल्यास येथे लिहा...' : 'Any additional instructions, VIP timing or details...'}
                      className="w-full rounded-xl border border-field bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-saffron-600 focus:ring-2 focus:ring-saffron-200 outline-none transition-all resize-y"
                    />
                  </div>

                  {/* Optional File Attachment (Invitation Card) */}
                  <div>
                    <label htmlFor="attachment" className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-1.5">
                      <span className="inline-flex items-center gap-1.5">
                        <Paperclip className="size-3.5 text-saffron-600" />
                        {isMr ? 'निमंत्रण पत्रिका / फोटो किंवा PDF (पर्यायी, कमाल 10MB)' : 'Invitation Card / Image or PDF (Optional, max 10MB)'}
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
                          <span>{isMr ? 'आमंत्रण पाठवा' : 'Send Invitation'}</span>
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
                <Link to="/appointment" className="flex items-center justify-between rounded-xl p-3 font-semibold text-charcoal-900 hover:bg-paper hover:text-saffron-700 transition-colors">
                  <span>{isMr ? 'भेटीची विनंती' : 'Meeting Request'}</span>
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
