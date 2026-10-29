/**
 * The four social activities (Oct 2026): shared by the homepage section (components/home/SupriyaSocialActivitiesSection.tsx) and the
 * "सामाजिक उपक्रम / Social Activities" tab of the Political Career page (components/social/SocialActivitiesList.tsx). Each activity's
 * `id` is its address there (/political-career?tab=social#yuva-sahitya-sammelan).
 */

/** where the activities are: the Social Activities tab of the Political Career page (/social-activities forwards here) */
export const SOCIAL_ACTIVITIES_PATH = '/political-career?tab=social'

export type Text = { mr: string; en: string }
export type Activity = {
  id: string
  /** empty: no photo yet (the list shows a navy panel with the title instead) */
  image: string
  /** where the photo is anchored when it is cropped to fit a card */
  position?: string
  /** the photo fills its frame edge to edge (no blurred border around it) */
  fill?: boolean
  title: Text
  tagline: Text
  /** the story, one entry per paragraph */
  body: { mr: string[]; en: string[] }
  facts: { label: Text; value: Text }[]
}

/**
 * The four social activities (Oct 2026), with the same text as the Social Activities page of the main website.
 * The photos are stand-ins until photos of the events themselves are added (public/images/social-activities):
 * Job Fair, a local entrepreneur with a vehicle bought through a Lokmangal Bank loan, Dandiya Festival, Lokmangal Literature Award.
 */
export const ACTIVITIES: Activity[] = [
  {
    id: 'entrepreneur-presentation-competition',
    image: '/images/social-activities/entrepreneur-presentation-competition.webp',
    position: '50% 45%',
    title: { mr: 'उद्योजक सादरीकरण स्पर्धा', en: 'Entrepreneur Presentation Competition' },
    tagline: { mr: 'तरुणांच्या कल्पनांना प्रत्यक्ष व्यवसायाचे रूप', en: 'Turning young ideas into real businesses' },
    body: {
      mr: [
        'तरुणांकडे कल्पना भरपूर असतात, पण सुरुवातीला भांडवल नसल्यामुळे त्यातील अनेक कल्पना पुढे जात नाहीत. काहीतरी मोठं करण्याची जिद्द आणि त्यासाठी लागणारं तांत्रिक शिक्षण या तरुणांकडे असतं, तरीही पैशांअभावी अनेकांना महिना केवळ ₹५,००० ते ₹१०,००० पगाराच्या नोकऱ्या स्वीकाराव्या लागतात. उद्योजक सादरीकरण स्पर्धा अशा सर्जनशील आणि कुशल तरुणांना आपल्या व्यवसाय कल्पना तज्ज्ञांच्या समितीसमोर मांडण्याची संधी देते. प्रत्येक कल्पना आर्थिक आणि उत्पादनाच्या दृष्टीने व्यवहार्य आहे का, हे तपासले जाते आणि सर्वोत्तम सादरीकरणाला व्यवसाय सुरू करण्यासाठी बिनव्याजी अर्थसाहाय्य दिले जाते.',
      ],
      en: [
        'Young people have plenty of ideas, but many of those ideas never move forward simply because there is no money to start. These young people have the drive to do something big and the technical education it takes, yet a lack of funds often forces them into jobs that pay only ₹5,000 to ₹10,000 a month. The Entrepreneur Presentation Competition gives such creative and skilled youth a chance to present their business ideas to a panel of experts. Each idea is checked to see whether it can work, both financially and in terms of production, and the best presentation wins interest-free funding to start the business.',
      ],
    },
    facts: [
      { label: { mr: 'आतापर्यंतचे सहभागी', en: 'Participants so far' }, value: { mr: 'सुमारे २५० तरुण', en: 'About 250 young people' } },
      { label: { mr: 'बक्षीस', en: 'Prize' }, value: { mr: 'विजेत्या व्यवसाय कल्पनेला बिनव्याजी अर्थसाहाय्य', en: 'Interest-free funding for the winning business idea' } },
      { label: { mr: 'दिलेले अर्थसाहाय्य', en: 'Funding given' }, value: { mr: 'लोकमंगल मल्टिस्टेटमार्फत उद्योजकांना ₹५ कोटी', en: '₹5 crore to entrepreneurs through Lokmangal Multistate' } },
      { label: { mr: 'मूल्यमापन', en: 'Evaluation' }, value: { mr: 'तज्ज्ञांकडून आर्थिक व उत्पादन व्यवहार्यतेची तपासणी', en: 'Financial and production viability checked by experts' } },
    ],
  },
  {
    id: 'chhota-udyojak-motha-udyojak',
    image: '/images/social-activities/chhota-udyojak-motha-udyojak.webp',
    position: '45% 40%',
    title: { mr: 'छोटा उद्योजक – मोठा उद्योजक', en: 'Chhota Udyojak – Motha Udyojak' },
    tagline: { mr: 'गावातील व्यवसायांना छोटीशी साथ', en: 'A small push for village businesses' },
    body: {
      mr: [
        'प्रत्येक गावात दैनंदिन जीवन चालवणारे कुशल लोक असतात: कुंभार, चर्मकार, लोहार, सुतार. त्यांचं कौशल्य पिढ्यानपिढ्या चालत आलेलं आहे आणि त्यांच्या कामावरच गावाचा गाडा चालतो. त्यांना मोठं कर्ज नको असतं. आपलं काम थोडं वाढवावं, एखादं नवं अवजार घ्यावं किंवा आणखी काही ऑर्डर घ्याव्यात, एवढीच त्यांची अपेक्षा असते. तरीही बँका त्यांना परत पाठवतात आणि त्यांच्यासाठी शब्द टाकणारं कोणी प्रभावशाली नसल्यानं त्यांना कुठेच दार उघडं नसतं.',
        'या छोट्या उद्योजकांना डोळ्यासमोर ठेवून रोहन देशमुख यांनी ही योजना सुरू केली. ती गावातील कारागीर आणि छोट्या व्यावसायिकांना एकत्र आणते, प्रत्येकाची खरी गरज काय आहे हे समजून घेण्यासाठी वेळ देते आणि मग योग्य आर्थिक साहाय्य देते. त्यांच्यापैकी अनेकांच्या वाटेतला अडथळा असतो तो फक्त ₹२०,००० ते ₹२५,००० चा.',
        'या योजनेला उदंड प्रतिसाद मिळाला आहे. या छोट्याशा मदतीतून गावातील अनेक उद्योजकांनी आपले व्यवसाय वाढवले आणि त्यांच्यासाठी मोठी स्वप्नं असलेली उद्दिष्टं साध्य केली. नावाचा अर्थही हाच आहे: योग्य वेळी योग्य मदत मिळाली, तर छोटा उद्योजकही मोठा उद्योजक होऊ शकतो.',
      ],
      en: [
        "In every village, there are skilled people who keep everyday life running: the potter, the leather worker, the blacksmith, the carpenter. Their skills have been passed down through generations, and their work is what keeps the village going. They don't ask for big loans. All they want is to grow their work a little, buy a new tool, or take on a few more orders. Yet banks turn them away, and with no one influential to speak for them, they are left with nowhere to go.",
        'Rohan Deshmukh started this scheme with these small entrepreneurs in mind. It brings village artisans and small business owners together, takes the time to understand what each one truly needs, and then provides the right financial support. For many of them, the only thing standing in the way is ₹20,000 to ₹25,000.',
        'The response has been overwhelming. With this small support, many village entrepreneurs have grown their businesses and achieved goals that, for them, were big dreams. That is what the name means: a small entrepreneur, given the right help at the right time, can become a big one.',
      ],
    },
    facts: [
      { label: { mr: 'संकल्पना', en: 'Idea by' }, value: { mr: 'रोहन देशमुख', en: 'Rohan Deshmukh' } },
      { label: { mr: 'कोणासाठी', en: 'For' }, value: { mr: 'गावातील कारागीर व छोटे व्यावसायिक', en: 'Village artisans and small business owners' } },
      { label: { mr: 'साहाय्य', en: 'Support' }, value: { mr: 'गरजेनुसार सुमारे ₹२०,००० ते ₹२५,००० ची आर्थिक मदत', en: 'Need-based financial help of around ₹20,000 to ₹25,000' } },
      { label: { mr: 'परिणाम', en: 'Result' }, value: { mr: 'वाढणारे व्यवसाय आणि सक्षम ग्रामीण अर्थव्यवस्था', en: 'Growing businesses and stronger village economies' } },
    ],
  },
  {
    id: 'solapur-university-youth-festival',
    image: '/images/social-activities/solapur-university-youth-festival.webp',
    position: '35% 50%',
    title: { mr: 'सोलापूर विद्यापीठ युवा महोत्सव', en: 'Solapur University Youth Festival' },
    tagline: { mr: 'जिथे तरुण प्रतिभेला मिळतो रंगमंच', en: 'Where young talent finds its stage' },
    body: {
      mr: [
        'युवा महोत्सव म्हणजे केवळ उत्सव नव्हे. अनेक विद्यार्थ्यांसाठी रंगमंचावर पाऊल ठेवून आपलं कौशल्य दाखवण्याची ती पहिलीच वेळ असते. सोलापूर विद्यापीठाची स्थापना २००३ मध्ये झाली आणि विद्यापीठाच्या पहिल्याच युवा महोत्सवाचे यजमानपद विद्यापीठासोबत भूषवण्याचा मान लोकमंगल फाऊंडेशनला मिळाला. विद्यापीठासाठी महत्त्वाचा टप्पा ठरलेल्या २०१३ मधील १० व्या महोत्सवाचे यजमानपदही लोकमंगलने पुन्हा भूषवले.',
        '२०१३ चा महोत्सव पूर्णपणे रोहन देशमुख यांच्या नेतृत्वाखाली आयोजित करण्यात आला. हजारो विद्यार्थी सहभागी झाले, तरीही पहिल्या दिवसापासून शेवटच्या दिवसापर्यंत कार्यक्रम सुरळीत पार पडला. प्रत्येक बारकावा काळजीपूर्वक नियोजित होता, प्रत्येक स्वयंसेवकाला आपली जबाबदारी माहीत होती आणि प्रत्येक काम योग्य हातात सोपवलेलं होतं. या महोत्सवाने हजारो विद्यार्थ्यांना सादरीकरण, स्पर्धा आणि ओळख मिळवण्याचं व्यासपीठ दिलं आणि मोठा कार्यक्रम शिस्तीने व बारकाईने हाताळण्याची रोहन यांची क्षमताही दाखवून दिली.',
      ],
      en: [
        'A youth festival is more than a celebration. For many students, it is the first time they step onto a stage and show what they can do. Solapur University was founded in 2003, and Lokmangal Foundation, together with the university, had the honour of hosting its very first Youth Festival. Lokmangal hosted it again in 2013 for the 10th edition, a milestone year for the university.',
        "The 2013 festival was organised entirely under the leadership of Rohan Deshmukh. Thousands of students took part, yet the event ran smoothly from the first day to the last. Every detail was planned with care, every volunteer knew their role, and every task was placed in the right hands. The festival gave thousands of students a platform to perform, compete and be seen, and it showed Rohan's ability to lead a large event with discipline and attention to detail.",
      ],
    },
    facts: [
      { label: { mr: 'यजमानपद भूषवलेले महोत्सव', en: 'Editions Hosted' }, value: { mr: 'पहिला (२००४) आणि १० वा (२०१३)', en: '1st (2004) and 10th (2013)' } },
      { label: { mr: 'सहआयोजक', en: 'Organised With' }, value: { mr: 'सोलापूर विद्यापीठ (आताचे पुण्यश्लोक अहिल्यादेवी होळकर सोलापूर विद्यापीठ)', en: 'Solapur University (now Punyashlok Ahilyadevi Holkar Solapur University)' } },
      { label: { mr: 'सहभागी', en: 'Participants' }, value: { mr: 'हजारो विद्यार्थी', en: 'Thousands of students' } },
      { label: { mr: 'नेतृत्व', en: 'Led By' }, value: { mr: 'रोहन देशमुख (२०१३ चा महोत्सव)', en: 'Rohan Deshmukh (2013 edition)' } },
    ],
  },
  {
    id: 'yuva-sahitya-sammelan',
    image: '/images/social-activities/yuva-sahitya-sammelan.webp',
    fill: true,
    position: '50% 40%',
    title: { mr: 'युवा साहित्य संमेलन', en: 'Yuva Sahitya Sammelan' },
    tagline: { mr: 'नव्या पिढीतील लेखकांसाठी व्यासपीठ', en: 'A platform for the next generation of writers' },
    body: {
      mr: [
        'महाराष्ट्राला साहित्य संमेलनांची समृद्ध परंपरा आहे, जिथे लेखक, कवी आणि वाचक साहित्याचा उत्सव साजरा करण्यासाठी एकत्र येतात. मात्र ही परंपरा पुढे नेणाऱ्या तरुणांना या व्यासपीठांवर क्वचितच आवाज मिळत असे. हे चित्र बदलण्यासाठी युवा साहित्य संमेलनाची सुरुवात झाली.',
        'पहिले युवा साहित्य संमेलन २०११ मध्ये सोलापुरात झाले. ७७८ तरुण सहभागींमुळे या संमेलनाने सर्वांचे लक्ष वेधले आणि वाचन, लेखन आणि आपलं म्हणणं मांडण्यासाठी तरुण किती उत्सुक आहेत हे दाखवून दिले. त्याचा उद्देश तिहेरी होता: तरुणांमध्ये वाचनाची सवय रुजवणे, तरुण लेखकांना हक्काचे व्यासपीठ देणे आणि त्यांची सर्जनशीलता व नवे विचार समाजासमोर आणणे.',
      ],
      en: [
        'Maharashtra has a rich tradition of Sahitya Sammelans, where writers, poets and readers come together to celebrate literature. Yet young people, who will carry this tradition forward, rarely had a voice on these stages. The Yuva Sahitya Sammelan was started to change that.',
        'The first Yuva Sahitya Sammelan was held in Solapur in 2011. With 778 young participants, the event drew wide attention and showed how eager young people were to read, write and be heard. Its purpose was threefold: to build a habit of reading among the youth, to give young writers a platform they could rightfully call their own, and to bring their creativity and fresh thinking before society.',
      ],
    },
    facts: [
      { label: { mr: 'वर्ष व ठिकाण', en: 'Year & Venue' }, value: { mr: '२०११, सोलापूर', en: '2011, Solapur' } },
      { label: { mr: 'सहभागी', en: 'Participants' }, value: { mr: '७७८ तरुण लेखक व वाचक', en: '778 young writers and readers' } },
      { label: { mr: 'उद्देश', en: 'Objective' }, value: { mr: 'वाचनाला प्रोत्साहन, तरुण लेखकांना पाठबळ आणि युवा सर्जनशीलतेचे दर्शन', en: 'To promote reading, support young writers and showcase youth creativity' } },
    ],
  },
]
