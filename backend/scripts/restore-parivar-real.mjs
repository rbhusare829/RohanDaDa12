import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadConfig } from '../src/config.js'
import { createApp } from '../src/app.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const seedHeaderPath = path.join(here, '..', 'src', 'seed', 'data', 'globals', 'header.json')
const seedPagesPath = path.join(here, '..', 'src', 'seed', 'data', 'collections', 'pages.json')

// 1. Definition of the authentic /lokmangal/parivar page data from https://www.subhashdeshmukh.com/lokmangal
const parivarPageData = {
  id: 11,
  title: {
    en: 'Lokmangal Parivar',
    mr: 'लोकमंगल परिवार'
  },
  path: '/lokmangal/parivar',
  section: 'lokmangal',
  menuOrder: 2,
  showSideMenu: false,
  subtitle: {
    en: 'A family of institutions in banking, industry, education, healthcare and social service',
    mr: 'बँकिंग, उद्योग, शिक्षण, दुग्धव्यवसाय आणि समाजसेवेतील संस्थांचा परिवार'
  },
  bannerImage: 124,
  layout: [
    {
      id: 'parivar_intro_01',
      blockType: 'content',
      eyebrow: {
        en: 'Lokmangal Group of Institutions',
        mr: 'लोकमंगल संस्था समूह'
      },
      heading: {
        en: 'A Legacy of Shared Growth, Self-Reliance and Public Service',
        mr: 'एकत्र प्रगती आणि समाजकल्याणाचा भव्य वारसा'
      },
      hidden: false,
      body: {
        en: '<p>Founded on Gudi Padwa in 1998 by Hon. Shri Subhash (Bapu) Deshmukh with the establishment of Lokmangal Co-operative Bank, the Lokmangal Group has grown into one of Maharashtra\'s most trusted conglomerates spanning banking, agro-processing, dairy, education and social welfare. With a combined business turnover exceeding ₹5,600 Crores, total deposits surpassing ₹3,401 Crores, and loans over ₹2,500 Crores disbursed across 143+ branches, the Group empowers thousands of farmers, youth and women self-help groups. Today, Rohan Deshmukh actively leads as Director of Lokmangal Multistate and President of Lokmangal Foundation, driving digital innovation, transparent governance and youth empowerment.</p><ul><li><strong>Self-Reliance & Co-operation:</strong> Providing financial dignity to the common man, small traders, farmers and self-help groups.</li><li><strong>Agro-Industries & Employment:</strong> Creating sustainable markets for agricultural produce and direct rural employment through sugar, ethanol and co-generation.</li><li><strong>169-Acre Education Hub:</strong> World-class education from KG to PG and a 100-bed hospital at Wadala campus.</li><li><strong>Unyielding Public Trust:</strong> Over ₹3,401 Crores in deposits and millions of satisfied members built on values and transparency.</li></ul>',
        mr: '<p>मा. आ. श्री. सुभाष (बापू) देशमुख यांनी १९९८ साली गुढीपाडव्याच्या शुभमुहूर्तावर लोकमंगल को-ऑप. बँकेच्या माध्यमातून लोकमंगल उद्योग समूहाची मुहूर्तमेढ रोवली. आज लोकमंगल परिवार हा बँकिंग, कृषी-उद्योग, दुग्धव्यवसाय, शिक्षण आणि समाजसेवा या क्षेत्रांत अग्रगण्य काम करणारा महाराष्ट्रातील एक विशाल व विश्वासार्ह परिवार बनला आहे. या सर्व संस्थांचा मिळून एकूण एकत्रित व्यवसाय जवळपास ५,६०० कोटी रुपये असून, ३,४०१ कोटी रुपयांपेक्षा अधिक ठेवी आणि २,५०० कोटी रुपयांचे कर्जवाटप करून लाखो शेतकरी, व्यापारी, तरुण व महिला बचत गटांना स्वावलंबी बनवले आहे. आज रोहन देशमुख लोकमंगल मल्टीस्टेटचे संचालक आणि लोकमंगल फाऊंडेशनचे अध्यक्ष म्हणून आधुनिक तंत्रज्ञान, पारदर्शकता आणि युवा नेतृत्वाच्या जोरावर हा वारसा नव्या उंचीवर नेत आहेत.</p><ul><li><strong>स्वावलंबन व सहकार:</strong> सामान्य लोकांना आर्थिक पाठबळ देऊन स्वतःच्या पायावर उभे करणे आणि प्रामाणिक सहकारातून समृद्धी साधणे.</li><li><strong>शेतकरी व रोजगार निर्मिती:</strong> शेतमालाला योग्य हमीभाव, साखर व इथेनॉल उद्योग आणि स्थानिक ग्रामीण तरुणांना हक्काचा रोजगार मिळवून देणे.</li><li><strong>दर्जेदार शिक्षण संकुल:</strong> वडाळा येथील १६९ एकर भव्य शैक्षणिक संकुलातून केजीपासून पदव्युत्तर उच्च शिक्षणापर्यंत ग्रामीण मुलांना संधी.</li><li><strong>विश्वास व पारदर्शकता:</strong> ३,४०१+ कोटींच्या ठेवी आणि लाखो समाधानी सभासदांचा लोकमंगल परिवारावर असलेला अतूट विश्वास.</li></ul>'
      }
    },
    {
      id: 'parivar_sec_financial',
      blockType: 'cards',
      eyebrow: {
        en: '4 Institutions • ₹5,600 Cr Turnover',
        mr: '४ वित्तीय संस्था • ५,६०० कोटी व्यवसाय'
      },
      heading: {
        en: 'Co-operative Banking & Credit',
        mr: 'सहकारी बँकिंग व पतसंस्था'
      },
      hidden: false,
      intro: {
        en: '365 days of uninterrupted modern banking service for farmers, entrepreneurs and families',
        mr: 'तळागाळातील सामान्य नागरिक, शेतकरी आणि उद्योजकांच्या आर्थिक उन्नतीसाठी ३६५ दिवस अविरत सेवा'
      },
      columns: '2',
      items: [
        {
          id: 'parivar_inst_01',
          icon: null,
          image: null,
          title: {
            en: 'Lokmangal Co-operative Bank Ltd.',
            mr: 'लोकमंगल को-ऑपरेटिव्ह बँक लि.'
          },
          meta: {
            en: 'Est. 28 Apr 1998 • 7 Branches • ₹1,425 Cr Business',
            mr: 'स्थापना: २८ एप्रिल १९९८ • ७ शाखा • व्यवसाय: ₹१,४२५ कोटी'
          },
          text: {
            en: 'ISO 9001:2008 certified and Grade-1 status by RBI. ₹901+ Cr deposits, ₹523+ Cr loans. Financed 2,880+ entrepreneurs through government welfare schemes. 365 days banking service.',
            mr: 'गुढीपाडव्याच्या शुभमुहूर्तावर सुरुवात. ISO 9001:2008 मानांकन आणि रिझर्व्ह बँकेचा ग्रेड वन दर्जा. ठेवी ₹९०१+ कोटी व कर्जवाटप ₹५२३+ कोटी. अण्णासाहेब पाटील महामंडळ, पीएम फूड प्रोसेसिंग व आई योजनेतून २,८८०+ उद्योजकांना कर्जवाटप. ३६५ दिवस अखंड सेवा.'
          },
          tags: {
            en: ['ISO 9001:2008', 'RBI Grade-1', 'Deposits ₹901+ Cr', '2,880+ Entrepreneurs'],
            mr: ['ISO मानांकन', 'RBI ग्रेड-१', 'ठेवी ₹९०१+ कोटी', '२,८८०+ उद्योजक']
          },
          url: 'https://lokmangal.bank.in/'
        },
        {
          id: 'parivar_inst_02',
          icon: null,
          image: null,
          title: {
            en: 'Lokmangal Multi-State Co-op Society Ltd.',
            mr: 'लोकमंगल मल्टीस्टेट को-ऑप. सोसायटी लि.'
          },
          meta: {
            en: 'Est. 2004 • 61 Branches • Maharashtra & Karnataka',
            mr: 'स्थापना: २००४ • ६१ शाखा • महाराष्ट्र व कर्नाटक'
          },
          text: {
            en: 'Interstate banking across Maharashtra and Karnataka with 61 branches. ₹751+ Cr deposits, ₹444+ Cr loans, total business of ₹1,195 Cr. Actively guided by Rohan Deshmukh as Director.',
            mr: 'महाराष्ट्राबाहेर आंतरराज्यीय बँकिंग सेवा देण्यासाठी स्थापना. महाराष्ट्र व कर्नाटकात ६१ शाखांचे जाळे, ठेवी ₹७५१+ कोटी, कर्जवाटप ₹४४४+ कोटी आणि एकूण व्यवसाय ₹१,१९५ कोटी. डिजिटल बँकिंग व शेतकरी पतपुरवठ्यात आघाडीवर. रोहन देशमुख यांचे संचालक म्हणून सक्रिय नेतृत्व.'
          },
          tags: {
            en: ['Multistate', '61 Branches', 'Deposits ₹751+ Cr', 'Interstate Network'],
            mr: ['मल्टीस्टेट', '६१ शाखा', 'ठेवी ₹७५१+ कोटी', 'महाराष्ट्र-कर्नाटक']
          },
          url: 'https://lokmangalmultistate.com/'
        },
        {
          id: 'parivar_inst_03',
          icon: null,
          image: null,
          title: {
            en: 'Lokmangal Nagari Sahakari Pat-Sanstha',
            mr: 'लोकमंगल नागरी सहकारी पतसंस्था'
          },
          meta: {
            en: 'Est. Sep 2002 • 75 Branches • ₹3,009 Cr Business',
            mr: 'स्थापना: सप्टेंबर २००२ • ७५ शाखा • व्यवसाय: ₹३,००९ कोटी'
          },
          text: {
            en: 'Serving grassroots micro-entrepreneurs across Maharashtra with 75 branches. ₹1,749+ Cr deposits, ₹1,259 Cr loans. Special Mahila Sanman Yojana with first installment sponsored by the society.',
            mr: 'तळागाळातील आर्थिकदृष्ट्या कमकुवत व छोट्या व्यावसायिकांसाठी संपूर्ण महाराष्ट्रात ७५ शाखा. ठेवी ₹१,७४९+ कोटी व कर्जवाटप ₹१,२५९ कोटी. सुलभ कर्जप्रक्रिया आणि महिलांसाठी विशेष \'महिला सन्मान योजना\' (२४ महिने कालावधी, पहिला हप्ता संस्थेकडून).'
          },
          tags: {
            en: ['75 Branches', 'Deposits ₹1,749+ Cr', 'Mahila Sanman', 'Micro Finance'],
            mr: ['७५ शाखा', 'ठेवी ₹१,७४९+ कोटी', 'महिला सन्मान योजना', 'सुलभ कर्ज']
          },
          url: null
        },
        {
          id: 'parivar_inst_04',
          icon: null,
          image: null,
          title: {
            en: 'Lokmangal Employees Co-op Credit Society & Development Foundation',
            mr: 'लोकमंगल कर्मचारी सहकारी पतसंस्था व डेव्हलपमेंट फाऊंडेशन'
          },
          meta: {
            en: 'Est. 2002 • Employee Welfare & Community Support',
            mr: 'स्थापना: २००२ • कर्मचारी कल्याण व साहाय्य'
          },
          text: {
            en: 'Affordable credit, free pilgrimages for staff, health and educational assistance for families, training, merit awards and emergency relief for thousands of employees across the Group.',
            mr: 'समूहातील हजारो कर्मचाऱ्यांसाठी कमी व्याजदरात सुलभ कर्ज. कर्मचाऱ्यांसाठी मोफत तीर्थयात्रा, मुलांच्या शिक्षणासाठी व आरोग्यासाठी मदत, गुणवंत कर्मचाऱ्यांचा गौरव, क्रीडा-सांस्कृतिक उपक्रम आणि आपत्कालीन आर्थिक साहाय्य.'
          },
          tags: {
            en: ['Employee Welfare', 'Pilgrimages', 'Health & Education', 'Mutual Support'],
            mr: ['कर्मचारी कल्याण', 'मोफत तीर्थयात्रा', 'शैक्षणिक मदत', 'परस्पर सहकार्य']
          },
          url: null
        }
      ]
    },
    {
      id: 'parivar_sec_agri',
      blockType: 'cards',
      eyebrow: {
        en: '4 Units • Limca Book of Records',
        mr: '४ उद्योग • लिम्का बुक रेकॉर्ड'
      },
      heading: {
        en: 'Agro-Industries & Clean Energy',
        mr: 'उद्योग व शेतमाल मूल्यवर्धन'
      },
      hidden: false,
      intro: {
        en: 'Fair pricing for agricultural produce, ethanol and green electricity generation',
        mr: 'शेतमालाला शाश्वत भाव आणि ग्रामीण भागात हजारो तरुणांना थेट रोजगार'
      },
      columns: '2',
      items: [
        {
          id: 'parivar_agri_01',
          icon: null,
          image: null,
          title: {
            en: 'Lokmangal Agro Industries Ltd. (Sugar, Ethanol & Power)',
            mr: 'लोकमंगल ॲग्रो इंडस्ट्रीज लि. (साखर, इथेनॉल व वीजनिर्मिती)'
          },
          meta: {
            en: 'Limca Book of Records • 3 MW Power • Export Quality',
            mr: 'लिम्का बुक ऑफ रेकॉर्ड्स • ३ मेगावॅट वीज • इथेनॉल प्रकल्प'
          },
          text: {
            en: 'Factory construction completed in a record 6 months and 6 days, registered in the Limca Book of Records. Produces international export-grade sugar, 3 MW clean co-gen electricity and eco-friendly ethanol.',
            mr: 'साखर कारखान्याचे संपूर्ण बांधकाम अवघ्या ६ महिने ६ दिवसांत पूर्ण करून लिम्का बुक ऑफ रेकॉर्ड्समध्ये नोंद! आंतरराष्ट्रीय दर्जाची निर्यातक्षम साखर निर्मिती, ३ मेगावॅट हरित सहवीजनिर्मिती आणि पर्यावरणपूरक इथेनॉल उत्पादन. हजारो ऊस उत्पादक शेतकऱ्यांना हमखास आधार.'
          },
          tags: {
            en: ['Limca Record', 'Export Sugar', '3 MW Power', 'Ethanol Energy'],
            mr: ['लिम्का रेकॉर्ड', '६ महिने ६ दिवस', 'निर्यातक्षम साखर', '३ मेगावॅट वीज']
          },
          url: null
        },
        {
          id: 'parivar_agri_02',
          icon: null,
          image: null,
          title: {
            en: 'Lokmangal Mauli Industries Ltd.',
            mr: 'लोकमंगल माऊली इंडस्ट्रीज लि.'
          },
          meta: {
            en: 'Agro-Processing & Value Addition • Solapur',
            mr: 'स्थानिक कृषी प्रक्रिया उद्योग • रोजगार निर्मिती'
          },
          text: {
            en: 'Advanced agro-processing units adding value to local crops, creating direct rural jobs and ensuring steady income for farmers in the region.',
            mr: 'स्थानिक शेतमालावर प्रक्रिया करून मूल्यवर्धन करणारी अत्याधुनिक औद्योगिक युनिट. ग्रामीण भागातील स्थानिक तरुणांना थेट रोजगाराची संधी आणि शेतकऱ्यांच्या शेतमालाला चांगला दर.'
          },
          tags: {
            en: ['Agro Processing', 'Value Addition', 'Local Jobs'],
            mr: ['कृषी प्रक्रिया', 'स्थानिक रोजगार', 'मूल्यवर्धन']
          },
          url: null
        },
        {
          id: 'parivar_agri_03',
          icon: null,
          image: null,
          title: {
            en: 'Agri Clinic & Agri Business Centre',
            mr: 'ॲग्री क्लिनिक अँड ॲग्री बिझनेस सेंटर'
          },
          meta: {
            en: 'Under MANAGE, Ministry of Agriculture, Govt. of India',
            mr: 'राष्ट्रीय कृषी विस्तार प्रबंध संस्था (MANAGE) मान्यताप्राप्त'
          },
          text: {
            en: 'Training and entrepreneurship support for agriculture graduates, connecting farmers to modern soil testing, technology and market linkages.',
            mr: 'कृषी पदवीधर तरुणांसाठी स्वतःचा कृषी व्यवसाय सुरू करण्यासाठी विशेष प्रशिक्षण व मार्गदर्शन. नवीन शेती तंत्रज्ञान, मृदा परीक्षण आणि शेतमालाची बाजारपेठ जोडणी.'
          },
          tags: {
            en: ['Agri Clinic', 'Agri Business', 'Farmer Advisory'],
            mr: ['ॲग्री क्लिनिक', 'उद्योजकता प्रशिक्षण', 'शेतकरी सल्ला']
          },
          url: null
        },
        {
          id: 'parivar_agri_04',
          icon: null,
          image: null,
          title: {
            en: 'Maharashtra Research & Development Centre',
            mr: 'महाराष्ट्र रिसर्च अँड डेव्हलपमेंट सेंटर'
          },
          meta: {
            en: 'Agronomic Research & Scientific Farming',
            mr: 'कृषी संशोधन व आधुनिक तंत्रज्ञान केंद्र'
          },
          text: {
            en: 'Scientific agronomic research helping traditional farmers adopt modern, low-cost organic practices with field demonstrations.',
            mr: 'पारंपरिक शेतीतून आधुनिक व कमी खर्चाच्या शाश्वत शेती तंत्रज्ञानाकडे जाण्यासाठी शेतकऱ्यांना तज्ज्ञांचे मार्गदर्शन व प्रक्षेत्र प्रात्यक्षिके.'
          },
          tags: {
            en: ['Agri Research', 'Tech Transfer', 'Sustainable Farming'],
            mr: ['कृषी संशोधन', 'तंत्रज्ञान प्रसार', 'शाश्वत शेती']
          },
          url: null
        }
      ]
    },
    {
      id: 'parivar_sec_dairy',
      blockType: 'cards',
      eyebrow: {
        en: '3 Units • Active in 7 States',
        mr: '३ सेवा संस्था • ७ राज्यांत कार्य'
      },
      heading: {
        en: 'Dairy, Biotech & Services',
        mr: 'दुग्धव्यवसाय व कृषी सेवा'
      },
      hidden: false,
      intro: {
        en: 'Reliable allied income for milk producers and high-quality inputs across 7 states',
        mr: 'शेतकऱ्यांना शेतीसोबत हमखास जोडधंदा आणि दर्जेदार कृषी निविष्ठांचा पुरवठा'
      },
      columns: '2',
      items: [
        {
          id: 'parivar_dairy_01',
          icon: null,
          image: null,
          title: {
            en: 'Lokmangal Products Ltd. (Dairy)',
            mr: 'लोकमंगल प्रॉडक्ट्स लि. (डेअरी)'
          },
          meta: {
            en: 'Est. 2001 • 500+ Computerised Milk Collection Centres',
            mr: 'स्थापना: २००१ • ५००+ संगणकीकृत संकलन केंद्रे'
          },
          text: {
            en: 'Solapur district\'s first modern milk powder manufacturing plant. Over 500 computerised milk collection centres providing reliable supplementary income to thousands of dairy farmers.',
            mr: 'सोलापूर जिल्ह्यातील पहिला आधुनिक दूध पावडर प्रकल्प! ५०० हून अधिक दूध संकलन केंद्रांचे जाळे पूर्णपणे संगणकीकृत. ग्रामीण शेतकऱ्यांना दुग्ध व्यवसायातून नियमित व खात्रीशीर आर्थिक उत्पन्नाचा स्त्रोत.'
          },
          tags: {
            en: ['500+ Centres', 'Milk Powder Plant', 'Farmer Income', 'Dairy Tech'],
            mr: ['५००+ संकलन केंद्रे', 'दूध पावडर प्रकल्प', 'हमखास दर', 'शेतकरी जोडधंदा']
          },
          url: null
        },
        {
          id: 'parivar_dairy_02',
          icon: null,
          image: null,
          title: {
            en: 'Lokmangal Biotech Pvt. Ltd.',
            mr: 'लोकमंगल बायोटेक प्रा. लि.'
          },
          meta: {
            en: 'Est. 2006 • Distributed Across 7 States',
            mr: 'स्थापना: २००६ • ७ राज्यांमध्ये वितरण'
          },
          text: {
            en: 'Manufacturing organic fertilisers, bio-fungicides, water-soluble nutrients and certified seeds. Distributed across Maharashtra, Karnataka, Rajasthan, Andhra Pradesh, Chhattisgarh, Punjab and Gujarat.',
            mr: 'शेतीसाठी लागणारी दर्जेदार सेंद्रिय खते, बायो-फर्टिलायझर्स, बायो-फंगिसाईड्स, विद्राव्य खते व बियाणे निर्मिती. महाराष्ट्र, कर्नाटक, राजस्थान, आंध्र प्रदेश, छत्तीसगड, पंजाब व गुजरातमध्ये वितरण.'
          },
          tags: {
            en: ['Organic Fertilisers', '7 States', 'Bio-Fungicides', 'Soil Health'],
            mr: ['सेंद्रिय खते', '७ राज्ये वितरण', 'बायो-फर्टिलायझर्स', 'मृदा आरोग्य']
          },
          url: null
        },
        {
          id: 'parivar_dairy_03',
          icon: null,
          image: null,
          title: {
            en: 'Lokmangal Consultancy Services',
            mr: 'लोकमंगल कन्सल्टन्सी सर्व्हिसेस'
          },
          meta: {
            en: 'Headquarters: Pune • National & International Advisory',
            mr: 'मुख्यालय: पुणे • राष्ट्रीय व आंतरराष्ट्रीय कामकाज'
          },
          text: {
            en: 'Financial advisory, project DPR preparation, credit syndication, turnaround solutions and startup mentorship for aspiring entrepreneurs across India.',
            mr: 'आर्थिक सल्ला, प्रकल्प अहवाल, कर्ज साहाय्य आणि नवउद्योजकांसाठी व्यवसाय मार्गदर्शन. उद्योग क्षेत्रातील व्यवस्थापकीय सल्लागार सेवा.'
          },
          tags: {
            en: ['Financial Advisory', 'Project DPR', 'Startup Guidance'],
            mr: ['आर्थिक सल्ला', 'प्रकल्प व्यवस्थापन', 'उद्योजकता']
          },
          url: null
        }
      ]
    },
    {
      id: 'parivar_sec_edu',
      blockType: 'cards',
      eyebrow: {
        en: '169-Acre Hub • KG to PG Education',
        mr: '१६९ एकर संकुल • केजी ते पीजी शिक्षण'
      },
      heading: {
        en: 'Education, Research & Healthcare Hub',
        mr: 'शिक्षण, संशोधन व आरोग्य संकुल'
      },
      hidden: false,
      intro: {
        en: 'Wadala\'s 169-acre serene green campus providing comprehensive education and a 100-bed hospital',
        mr: 'वडाळा येथील १६९ एकर विस्तीर्ण निसर्गरम्य कॅम्पसमध्ये जागतिक दर्जाचे शिक्षण व १०० खाटांचे हॉस्पिटल'
      },
      columns: '2',
      items: [
        {
          id: 'parivar_edu_01',
          icon: null,
          image: null,
          title: {
            en: 'Lokmangal Colleges & Campus, Wadala (BARAK Foundation)',
            mr: 'लोकमंगल महाविद्यालय व शैक्षणिक संकुल, वडाळा (बाराक प्रतिष्ठान)'
          },
          meta: {
            en: 'Est. 1997 • 169 Acres • KG to PG & 100-Bed Hospital',
            mr: 'स्थापना: १९९७ • १६९ एकर कॅम्पस • केजी ते पीजी'
          },
          text: {
            en: 'Founded by BARAK Rural Research & Development Foundation on 169 acres at Wadala. Offers B.Sc. Agri, M.Sc. Microbiology, B.Sc. Nursing, ITI, Junior College and a fully operational 100-bed multi-specialty hospital. Thousands of alumni serving in civil services and global industries.',
            mr: 'बाराक ग्रामीण संशोधन व विकास प्रतिष्ठान अंतर्गत वडाळा येथे १६९ एकर जागेवर उभारलेले महासंकुल. बी.एससी. अॅग्री, एम.एससी. मायक्रोबायोलॉजी, बी.एससी. नर्सिंग, आयटीआय, ज्युनिअर कॉलेज, १०० बेडचे हॉस्पिटल. केजी ते पीजी सर्व शिक्षण एकाच छताखाली. हजारो विद्यार्थी सरकारी अधिकारी व उद्योजक बनले.'
          },
          tags: {
            en: ['169-Acre Campus', 'KG to PG', 'B.Sc. Agri', '100-Bed Hospital'],
            mr: ['१६९ एकर संकुल', 'केजी ते पीजी', 'बी.एससी. अॅग्री', '१०० बेड हॉस्पिटल']
          },
          url: 'https://lokmangalcolleges.org/'
        },
        {
          id: 'parivar_edu_02',
          icon: null,
          image: null,
          title: {
            en: 'Lokmangal College of Agriculture & Biotechnology',
            mr: 'लोकमंगल कृषी महाविद्यालय व कृषी जैवतंत्रज्ञान'
          },
          meta: {
            en: 'B.Sc. Agriculture & B.Tech Biotechnology • MPKV Affiliated',
            mr: 'बी.एस्सी. कृषी व बी.टेक. बायोटेक्नॉलॉजी'
          },
          text: {
            en: 'Affiliated to Mahatma Phule Krishi Vidyapeeth, Rahuri. Advanced laboratories, extensive field trial plots and entrepreneurship coaching in agribusiness.',
            mr: 'महात्मा फुले कृषी विद्यापीठाशी संलग्न मान्यताप्राप्त महाविद्यालय. अत्याधुनिक लॅब्स, प्रत्यक्ष प्रक्षेत्र संशोधन आणि कृषी उद्योजकता प्रशिक्षण.'
          },
          tags: {
            en: ['B.Sc. Agri', 'Biotechnology', 'Agronomy Lab'],
            mr: ['बी.एस्सी. कृषी', 'बायोटेक्नॉलॉजी', 'कृषी पदवी']
          },
          url: null
        },
        {
          id: 'parivar_edu_03',
          icon: null,
          image: null,
          title: {
            en: 'Lokmangal College of Pharmacy & Nursing',
            mr: 'लोकमंगल फार्मसी व नर्सिंग महाविद्यालय'
          },
          meta: {
            en: 'B.Pharm, D.Pharm & B.Sc. Nursing • PCI & MNC Approved',
            mr: 'बी.फार्मसी, डी.फार्मसी व बी.एससी. नर्सिंग'
          },
          text: {
            en: 'Pharmacy Council of India (PCI) approved institution nurturing skilled healthcare specialists. Attached to 100-bed hospital for hands-on clinical training.',
            mr: 'आरोग्य क्षेत्रातील दर्जेदार तज्ज्ञ मनुष्यबळ घडवणारी संस्था. १०० खाटांच्या हॉस्पिटलशी संलग्न असल्याने विद्यार्थ्यांना प्रत्यक्ष क्लिनिकल अनुभव.'
          },
          tags: {
            en: ['Pharmacy', 'Nursing', 'PCI Approved', 'Hospital Attached'],
            mr: ['फार्मसी', 'नर्सिंग', 'हॉस्पिटल संलग्न', 'आरोग्य शिक्षण']
          },
          url: null
        },
        {
          id: 'parivar_edu_04',
          icon: null,
          image: null,
          title: {
            en: 'Lokmangal ITI & Vocational Training Institute',
            mr: 'लोकमंगल आयटीआय व कौशल्य विकास केंद्र'
          },
          meta: {
            en: 'Vocational Technical Skills • 100% Employability',
            mr: 'व्यावसायिक तंत्रशिक्षण व रोजगार हमी'
          },
          text: {
            en: 'Providing rural youth industry-grade skills in Electrician, Fitter, Welder and Computer Operator trades with direct campus placement support.',
            mr: 'इलेक्ट्रिशियन, फिटर, वेल्डर व कॉम्प्युटर ट्रेड्समध्ये ग्रामीण तरुणांना कौशल्याधारित प्रशिक्षण देऊन १००% रोजगाराभिमुख बनवणारी संस्था.'
          },
          tags: {
            en: ['ITI', 'Skill India', 'Vocational Training', 'Job Placement'],
            mr: ['आयटीआय', 'कौशल्य विकास', 'रोजगार']
          },
          url: null
        }
      ]
    },
    {
      id: 'parivar_sec_community',
      blockType: 'cards',
      eyebrow: {
        en: '20+ Years Citizen Outreach • 5P Model',
        mr: '२०+ वर्षे अविरत जनसंवाद • ५P मॉडेल'
      },
      heading: {
        en: 'Citizen Outreach & Social Impact',
        mr: 'लोकसंवाद व सामाजिक विकास'
      },
      hidden: false,
      intro: {
        en: 'Direct grassroots listening, prompt grievance redressal and regional brand building',
        mr: 'सामान्य जनतेच्या सुख-दुःखात सहभागी होऊन समस्यांचे तत्काळ निवारण करणारी सामाजिक चळवळ'
      },
      columns: '2',
      items: [
        {
          id: 'parivar_com_01',
          icon: null,
          image: null,
          title: {
            en: 'Lok Samvad - Janta Darbar',
            mr: 'लोकसंवाद - जनता दरबार'
          },
          meta: {
            en: 'Continuous for 20+ Years • Every Monday',
            mr: 'गेली २०+ वर्षे अविरत सुरू असलेला उपक्रम • प्रत्येक सोमवारी'
          },
          text: {
            en: 'Held continuously every Monday for over two decades by Hon. Subhash Bapu Deshmukh and Rohan Deshmukh to directly listen to citizens\' grievances and resolve them promptly with authorities.',
            mr: 'मा. आ. सुभाष बापू देशमुख आणि रोहन देशमुख गेल्या २० वर्षांपासून अविरतपणे दर सोमवारी \'लोकसंवाद जनता दरबार\' घेतात. सर्वसामान्य नागरिकांच्या अडचणी थेट ऐकून प्रशासकीय व संस्था पातळीवर तत्काळ कार्यवाही केली जाते.'
          },
          tags: {
            en: ['Janta Darbar', 'Every Monday', '20+ Years', 'Direct Redressal'],
            mr: ['जनता दरबार', 'दर सोमवारी', '२०+ वर्षे सातत्य', 'थेट संवाद']
          },
          url: null
        },
        {
          id: 'parivar_com_02',
          icon: null,
          image: null,
          title: {
            en: 'Solapur Social Foundation',
            mr: 'सोलापूर सोशल फाउंडेशन'
          },
          meta: {
            en: 'Est. 18 April 2018 • Comprehensive Development of Solapur',
            mr: 'स्थापना: १८ एप्रिल २०१८ • सोलापूरचा सर्वांगीण विकास'
          },
          text: {
            en: 'Founded to place Solapur among Maharashtra\'s top 5 districts using the 5P Model: Places, Personalities, Products, Placement and Pollution-free Environment.',
            mr: 'सोलापूर जिल्ह्याला राज्यातील पहिल्या ५ अव्वल जिल्ह्यांच्या यादीत आणण्यासाठी ५ \'P\' चे मॉडेल (Places, Personalities, Products, Placement, Pollution-free Environment). सोलापूरच्या स्थानिक उत्पादनांचे व पर्यटन स्थळांचे ब्रँडिंग.'
          },
          tags: {
            en: ['5P Model', 'Solapur Development', 'Employment', 'Branding'],
            mr: ['५ P मॉडेल', 'सोलापूर विकास', 'रोजगार निर्मिती', 'ब्रँडिंग']
          },
          url: 'https://solapursocialfoundation.com/'
        }
      ]
    }
  ]
}

// 2. Update seed header.json
const seedHeader = JSON.parse(fs.readFileSync(seedHeaderPath, 'utf8'))
seedHeader.nav = seedHeader.nav.map(item => {
  if (item.url === '/lokmangal/foundation' || item.label?.en === 'Lokmangal') {
    item.label = { en: 'Lokmangal', mr: 'लोकमंगल' }
    item.url = '/lokmangal/foundation'
    item.children = [
      {
        id: '6ad5ec2d15929451e8126610',
        label: { en: 'Lokmangal Foundation', mr: 'लोकमंगल फाऊंडेशन' },
        url: '/lokmangal/foundation',
        newTab: false,
        subItems: []
      },
      {
        id: '6ad5ec2d15929451e812660d',
        label: { en: 'Lokmangal Parivar', mr: 'लोकमंगल परिवार' },
        url: '/lokmangal/parivar',
        newTab: false,
        subItems: []
      }
    ]
  }
  return item
})
fs.writeFileSync(seedHeaderPath, JSON.stringify(seedHeader, null, 1), 'utf8')
console.log('✓ Seed header.json updated with Lokmangal Foundation & Lokmangal Parivar under Lokmangal.')

// 3. Update seed pages.json
const seedPages = JSON.parse(fs.readFileSync(seedPagesPath, 'utf8'))
const filteredSeedPages = seedPages.filter(p => p.path !== '/lokmangal/parivar')
filteredSeedPages.push(parivarPageData)
fs.writeFileSync(seedPagesPath, JSON.stringify(filteredSeedPages, null, 1), 'utf8')
console.log('✓ Seed pages.json updated with /lokmangal/parivar page data.')

// 4. Update Database
const { ctx, close } = await createApp({ cfg: loadConfig() })
try {
  const { db, documents } = ctx

  // Update header global in DB
  const header = await documents.findGlobal('header', { locale: 'all' })
  if (header && Array.isArray(header.nav)) {
    header.nav = header.nav.map(item => {
      if (item.url === '/lokmangal/foundation' || item.label?.en === 'Lokmangal') {
        item.label = { en: 'Lokmangal', mr: 'लोकमंगल' }
        item.url = '/lokmangal/foundation'
        item.children = [
          {
            id: '6ad5ec2d15929451e8126610',
            label: { en: 'Lokmangal Foundation', mr: 'लोकमंगल फाऊंडेशन' },
            url: '/lokmangal/foundation',
            newTab: false,
            subItems: []
          },
          {
            id: '6ad5ec2d15929451e812660d',
            label: { en: 'Lokmangal Parivar', mr: 'लोकमंगल परिवार' },
            url: '/lokmangal/parivar',
            newTab: false,
            subItems: []
          }
        ]
      }
      return item
    })

    console.log('Updating header global in DB...')
    await documents.updateGlobal('header', header, { overrideAccess: true, locale: 'all' })
    console.log('✓ Header global in DB updated.')
  }

  // Upsert /lokmangal/parivar page in DB
  const existingPage = await db.models.pages.findOne({ where: { path: '/lokmangal/parivar' } })
  if (existingPage) {
    console.log('Updating existing /lokmangal/parivar page in DB...')
    await documents.update('pages', existingPage.id, parivarPageData, { overrideAccess: true, locale: 'all' })
    console.log('✓ Updated /lokmangal/parivar page in DB.')
  } else {
    console.log('Creating new /lokmangal/parivar page in DB...')
    await documents.create('pages', parivarPageData, { overrideAccess: true, locale: 'all' })
    console.log('✓ Created /lokmangal/parivar page in DB.')
  }

  console.log('All updates completed successfully!')
} catch (err) {
  console.error('Error during database update:', err)
} finally {
  await close()
}
