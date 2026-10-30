import { useState } from 'react'
import { Link } from 'react-router'
import { CheckCircle2, FileText, HelpCircle, Loader2, Paperclip, Send, ShieldCheck, UserCheck } from 'lucide-react'
import { api } from '@/lib/api'
import { getLocale } from '@/lib/i18n'
import { InnerPage } from '@/components/layout/InnerPage'
import { Seo } from '@/components/layout/Seo'
import { Reveal } from '@/components/ui/Motion'

export default function GrievancePage() {
  const isMr = getLocale() !== 'en'

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    inConstituency: 'yes',
    subject: '',
    description: '',
    address: '',
    website: '',
  })
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
    if (!formData.subject.trim()) {
      setErrorMsg(isMr ? 'कृपया निवेदनाचा विषय भरा.' : 'Please enter the subject of your petition.')
      return
    }
    if (!formData.description.trim()) {
      setErrorMsg(isMr ? 'कृपया निवेदनाचा सविस्तर तपशील लिहा.' : 'Please write details of your petition.')
      return
    }

    setSubmitting(true)
    const body = new FormData()
    body.set('name', formData.name.trim())
    body.set('mobile', formData.mobile.trim())
    body.set('inConstituency', formData.inConstituency)
    body.set('subject', formData.subject.trim())
    body.set('description', formData.description.trim())
    if (formData.address) body.set('address', formData.address.trim())
    if (formData.email) body.set('email', formData.email.trim())
    if (formData.website) body.set('website', formData.website)
    if (file) body.set('attachment', file, file.name)

    try {
      const res = await api.post('/api/forms/grievance', body, { validateStatus: () => true })
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
      email: '',
      inConstituency: 'yes',
      subject: '',
      description: '',
      address: '',
      website: '',
    })
    setFile(null)
    setReferenceNo(null)
    setErrorMsg(null)
  }

  return (
    <>
      <Seo
        title={isMr ? 'कामाचे निवेदन — नागरिक सेवा केंद्र' : 'Citizen Grievance & Work Petition'}
        description={isMr ? 'आपल्या परिसरातील समस्या किंवा विकासकामांचे निवेदन थेट रोहनदादांपर्यंत पोहोचवा.' : 'Submit citizen work petitions and grievances directly to Rohan Subhash Deshmukh.'}
      />
      <InnerPage
        path="/grievance"
        title={isMr ? 'कामाचे निवेदन' : 'Citizen Work Petition'}
        subtitle={isMr ? 'आपल्या परिसरातील समस्या किंवा विकासकामांचे निवेदन थेट रोहनदादांपर्यंत पोहोचवा.' : 'Direct citizen petition and grievance portal for public development and civic issues.'}
        variant="navy"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left: Info Card */}
          <div className="space-y-6 lg:col-span-4">
            <Reveal className="rounded-3xl border border-stone-200/90 bg-[#f8fafc] p-6 sm:p-8">
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-md">
                <FileText className="size-6" />
              </span>
              <h2 className="mt-4 font-display text-xl sm:text-2xl font-bold text-[#000d3d]">
                {isMr ? 'नागरिक सेवा केंद्र' : 'Citizen Service Portal'}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {isMr
                  ? 'सोलापूर व परिसरातील प्रत्येक नागरिकाच्या अडचणी, विकासकामे आणि समस्या थेट रोहनदादांपर्यंत पोहोचवण्यासाठी हे केंद्र कार्यरत आहे. प्रत्येक निवेदनाची अधिकृत नोंद ठेवली जाते.'
                  : 'This portal ensures every civic concern, infrastructure need, and petition reaches Rohan Deshmukh directly, with official tracking.'}
              </p>

              <div className="mt-6 space-y-3.5 border-t border-stone-200/80 pt-6 text-xs text-slate-600">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  <span>{isMr ? 'प्रत्येक निवेदनाला अद्वितीय संदर्भ क्रमांक दिला जातो.' : 'Each submission receives a unique tracking Reference Number.'}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <UserCheck className="mt-0.5 size-4 shrink-0 text-orange-600" />
                  <span>{isMr ? 'रोहनदादांच्या जनसंपर्क कार्यालयाकडून थेट आढावा घेतला जातो.' : 'Directly reviewed by Rohan Deshmukh’s constituency office.'}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <HelpCircle className="mt-0.5 size-4 shrink-0 text-blue-600" />
                  <span>{isMr ? 'अडचण असल्यास संपर्क: +९१ ९४२२४ ५६०००' : 'Helpline: +91 94224 56000'}</span>
                </div>
              </div>
            </Reveal>

            {/* Quick Links to other services */}
            <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-800">
                {isMr ? 'इतर नागरिक सेवा' : 'Other Citizen Services'}
              </h3>
              <div className="mt-4 space-y-2 text-sm">
                <Link to="/appointment" className="flex items-center justify-between rounded-xl p-3 font-semibold text-[#000d3d] hover:bg-orange-50 hover:text-orange-600 transition-colors">
                  <span>{isMr ? 'भेटीची विनंती' : 'Meeting Request'}</span>
                  <span>→</span>
                </Link>
                <Link to="/invitation" className="flex items-center justify-between rounded-xl p-3 font-semibold text-[#000d3d] hover:bg-orange-50 hover:text-orange-600 transition-colors">
                  <span>{isMr ? 'शुभकार्य आमंत्रण' : 'Event Invitation'}</span>
                  <span>→</span>
                </Link>
                <Link to="/contact" className="flex items-center justify-between rounded-xl p-3 font-semibold text-[#000d3d] hover:bg-orange-50 hover:text-orange-600 transition-colors">
                  <span>{isMr ? 'संपर्क साधा' : 'Contact Office'}</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right: The Form Card */}
          <div className="lg:col-span-8">
            <Reveal className="overflow-hidden rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,13,61,0.06)]">
              {referenceNo ? (
                /* Success View */
                <div className="py-8 text-center animate-tab-in" role="status">
                  <span className="mx-auto grid size-20 place-items-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/25">
                    <CheckCircle2 className="size-10" />
                  </span>
                  <span className="mt-5 inline-block text-xs font-bold uppercase tracking-widest text-emerald-600">
                    {isMr ? 'निवेदन यशस्वीरित्या प्राप्त झाले!' : 'Petition Submitted Successfully!'}
                  </span>
                  <h3 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-[#000d3d]">
                    {isMr ? 'धन्यवाद, आपले निवेदन नोंदवले गेले आहे.' : 'Thank you, your petition has been recorded.'}
                  </h3>
                  <p className="mx-auto mt-3 max-w-lg text-sm text-slate-600">
                    {isMr
                      ? 'आपल्या निवेदनाची कार्यालयात नोंद झाली असून आवश्यक कार्यवाहीसाठी संबंधित विभागाकडे वर्ग करण्यात येत आहे.'
                      : 'Your petition has been forwarded to the concerned department for review and appropriate action.'}
                  </p>

                  <div className="mx-auto mt-6 inline-flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50/60 px-6 py-4">
                    <span className="text-xs font-semibold text-orange-800">
                      {isMr ? 'आपला संदर्भ क्रमांक (Reference Number):' : 'Your Reference Number:'}
                    </span>
                    <span className="mt-1 font-mono text-xl sm:text-2xl font-black text-orange-600 tracking-wider">
                      {referenceNo}
                    </span>
                    <span className="mt-1 text-[11px] text-slate-500">
                      {isMr ? 'भविष्यातील संदर्भासाठी हा क्रमांक कृपया जतन करून ठेवा.' : 'Please keep this reference number for future inquiries.'}
                    </span>
                  </div>

                  <div className="mt-8 flex justify-center gap-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-xl bg-[#000d3d] px-6 py-3 text-sm font-bold text-white hover:bg-orange-600 transition-colors shadow-sm"
                    >
                      {isMr ? 'दुसरे निवेदन नोंदवा' : 'Submit Another Petition'}
                    </button>
                    <Link
                      to="/"
                      className="rounded-xl border border-stone-300 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-stone-50 transition-colors"
                    >
                      {isMr ? 'मुख्य पृष्ठ' : 'Go to Home'}
                    </Link>
                  </div>
                </div>
              ) : (
                /* Form View */
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />

                  <div className="border-b border-stone-200/80 pb-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                      {isMr ? 'नागरिक तपशील' : 'Citizen Details'}
                    </p>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-[#000d3d]">
                      {isMr ? 'आपली माहिती व निवेदनाचे विवरण' : 'Enter Your Petition Details'}
                    </h3>
                  </div>

                  {errorMsg && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {/* Full Name */}
                    <div>
                      <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        {isMr ? 'पूर्ण नाव *' : 'Full Name *'}
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={isMr ? 'उदा. सचिन विष्णू सावंत' : 'e.g. Ramesh Patil'}
                        className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-stone-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                      />
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label htmlFor="mobile" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        {isMr ? 'मोबाईल नंबर *' : 'Mobile Number *'}
                      </label>
                      <input
                        id="mobile"
                        type="tel"
                        required
                        maxLength={10}
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        placeholder={isMr ? '१० अंकी मोबाईल नंबर' : '10-digit mobile number'}
                        className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-stone-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Constituency check (matching subhashdeshmukh.com/grievance) */}
                  <div className="rounded-2xl border border-orange-200/80 bg-orange-50/40 p-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-orange-900 mb-2">
                      {isMr ? 'आपण दक्षिण सोलापूर मतदार संघातील आहात का? *' : 'Are you from South Solapur Constituency? *'}
                    </label>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer font-medium text-sm text-slate-800">
                        <input
                          type="radio"
                          name="inConstituency"
                          value="yes"
                          checked={formData.inConstituency === 'yes'}
                          onChange={() => setFormData({ ...formData, inConstituency: 'yes' })}
                          className="size-4 text-orange-600 focus:ring-orange-500"
                        />
                        <span>{isMr ? 'होय (Yes)' : 'Yes'}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-medium text-sm text-slate-800">
                        <input
                          type="radio"
                          name="inConstituency"
                          value="no"
                          checked={formData.inConstituency === 'no'}
                          onChange={() => setFormData({ ...formData, inConstituency: 'no' })}
                          className="size-4 text-orange-600 focus:ring-orange-500"
                        />
                        <span>{isMr ? 'नाही (No)' : 'No'}</span>
                      </label>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      {isMr ? 'निवेदनाचा विषय *' : 'Petition Subject *'}
                    </label>
                    <input
                      id="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder={isMr ? 'उदा. रस्त्यांची दुरुस्ती, पाणीपुरवठा, वीज समस्या' : 'e.g. Road repair, water supply, power grid issue'}
                      className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-stone-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      {isMr ? 'सविस्तर तपशील *' : 'Detailed Description *'}
                    </label>
                    <textarea
                      id="description"
                      rows={5}
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder={isMr ? 'आपल्या समस्येचे किंवा मागणीचे सविस्तर वर्णन येथे लिहा...' : 'Please describe the problem, location, and required action in detail...'}
                      className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-stone-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {/* Address / Village */}
                    <div>
                      <label htmlFor="address" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        {isMr ? 'पत्ता / गाव / वॉर्ड (ऐच्छिक)' : 'Address / Village (Optional)'}
                      </label>
                      <input
                        id="address"
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder={isMr ? 'उदा. मु. पो. मंद्रूप, ता. द. सोलापूर' : 'e.g. Mandrup, South Solapur'}
                        className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-stone-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        {isMr ? 'ईमेल (ऐच्छिक)' : 'Email (Optional)'}
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="example@gmail.com"
                        className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-stone-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Attachment (File/Photo upload) */}
                  <div className="rounded-2xl border border-dashed border-stone-300 p-5 bg-stone-50/50">
                    <label htmlFor="attachment" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 cursor-pointer">
                      <Paperclip className="size-4 text-orange-600" />
                      <span>{isMr ? 'कागदपत्रे / फोटो जोडा (ऐच्छिक, कमाल ५ MB)' : 'Attach Document / Photo (Optional, Max 5MB)'}</span>
                    </label>
                    <input
                      id="attachment"
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      className="block w-full text-xs text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-orange-600 file:px-4 file:py-2.5 file:text-xs file:font-semibold file:text-white hover:file:bg-orange-700 cursor-pointer"
                    />
                    {file && (
                      <p className="mt-2 text-xs font-semibold text-emerald-700">
                        ✓ {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-orange-600 px-8 py-4 text-base font-bold text-white shadow-md hover:bg-[#000d3d] active:scale-95 transition-all duration-300 cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="size-5 animate-spin" />
                          <span>{isMr ? 'नोंद होत आहे...' : 'Submitting...'}</span>
                        </>
                      ) : (
                        <>
                          <Send className="size-5" />
                          <span>{isMr ? 'निवेदन सादर करा' : 'Submit Petition'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </Reveal>
          </div>
        </div>
      </InnerPage>
    </>
  )
}

