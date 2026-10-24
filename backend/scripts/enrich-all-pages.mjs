import { loadConfig } from '../src/config.js'
import { createApp } from '../src/app.js'

const { ctx, close } = await createApp({ cfg: loadConfig() })

try {
  const { documents } = ctx

  // ==========================================
  // 1. Enrich /lokmangal/parivar
  // ==========================================
  console.log('\n▶ Enriching /lokmangal/parivar institutions...')
  const parivarFound = await documents.find('pages', { where: { path: { equals: '/lokmangal/parivar' } }, limit: 1, overrideAccess: true, depth: 0 })
  if (parivarFound.docs.length) {
    const { id, createdAt: _c, updatedAt: _u, ...raw } = await documents.getRaw('pages', parivarFound.docs[0].id)

    // Definitions for all 24 institutions
    const institutionsData = {
      // 1. Financial Institutions
      'लोकमंगल को-ऑपरेटिव्ह बँक': {
        meta: 'सहकारी बँकिंग • सोलापूर',
        text: 'शेतकरी, व्यापारी, व्यावसायिक आणि मध्यमवर्गीय कुटुंबांना आधुनिक, सुरक्षित आणि विश्वासार्ह बँकिंग सेवा. जिल्ह्यातील अग्रगण्य सहकारी बँक.',
        tags: ['सहकारी बँक', 'बचत व ठेवी', 'सुलभ कर्ज'],
      },
      'लोकमंगल नागरी सहकारी पतसंस्था': {
        meta: 'नागरी सहकार • सूक्ष्म वित्त',
        text: 'अल्प व मध्यम उत्पन्न गटातील नागरिकांना बचतीची सवय लावून छोट्या व्यवसायांसाठी आणि उद्योजकांसाठी सुलभ कर्जपुरवठा.',
        tags: ['पतसंस्था', 'सूक्ष्म वित्त', 'लघुउद्योग'],
      },
      'लोकमंगल कर्मचारी सहकारी पतसंस्था': {
        meta: 'कर्मचारी कल्याण • सहकार',
        text: 'लोकमंगल परिवारातील हजारो कर्मचाऱ्यांच्या आर्थिक सुरक्षिततेसाठी, आपत्कालीन मदतीसाठी आणि बचतीसाठी समर्पित संस्था.',
        tags: ['कर्मचारी कल्याण', 'परस्पर साहाय्य'],
      },
      'लोकमंगल मल्टीस्टेट': {
        meta: 'महाराष्ट्र व कर्नाटक • बहुराज्यीय सहकार',
        text: 'महाराष्ट्र आणि कर्नाटक राज्यांत विस्तीर्ण शाखा जाळे. डिजिटल बँकिंग, किसान क्रेडिट आणि महिला बचत गटांसाठी विशेष आर्थिक योजना. रोहन देशमुख यांचे संचालक म्हणून सक्रिय मार्गदर्शन.',
        tags: ['मल्टीस्टेट', 'डिजिटल बँकिंग', 'शेतकरी पतपुरवठा'],
      },

      // 2. Industries
      'लोकमंगल शुगर इथेनॉल अँड को-जनरेशन इंडस्ट्रीज लि. (LSECIL)': {
        meta: 'साखर, हरित ऊर्जा व इथेनॉल • बीबीदारफळ/वडाळा',
        text: 'दैनिक ५०००+ टन ऊस गाळप क्षमता, अत्याधुनिक सहवीजनिर्मिती आणि पर्यावरणपूरक इथेनॉल प्रकल्प. हजारो ऊस उत्पादक शेतकऱ्यांना वेळेवर बिले आणि शाश्वत हमीभाव.',
        tags: ['साखर कारखाना', 'इथेनॉल', 'हरित ऊर्जा'],
      },
      'लोकमंगल माऊली इंडस्ट्रीज लि.': {
        meta: 'कृषी प्रक्रिया उद्योग • सोलापूर',
        text: 'स्थानिक शेतमालावर प्रक्रिया करून मूल्यवर्धन करणारी अत्याधुनिक औद्योगिक युनिट. ग्रामीण भागातील स्थानिक तरुणांना थेट रोजगार उपलब्ध.',
        tags: ['कृषी प्रक्रिया', 'रोजगारनिर्मिती'],
      },
      'लोकमंगल ॲग्रो इंडस्ट्रीज लि.': {
        meta: 'कृषी निविष्ठा व तंत्रज्ञान',
        text: 'शेतकऱ्यांसाठी दर्जेदार सेंद्रिय खते, सूक्ष्म अन्नद्रव्ये आणि आधुनिक कृषी तंत्रज्ञानाचा पुरवठा. जमिनीचा पोत सुधारण्यासाठी विशेष मार्गदर्शन.',
        tags: ['सेंद्रिय खते', 'ॲग्रो उत्पादने', 'मृदा आरोग्य'],
      },
      'लोकमंगल बायो-टेक प्रा. लि.': {
        meta: 'बायोटेक व टिश्यू कल्चर संशोधन',
        text: 'आधुनिक ऊती संवर्धन (टिश्यू कल्चर), दर्जेदार रोगमुक्त रोपे निर्मिती आणि जैविक खतांच्या संशोधनातील अग्रगण्य केंद्र. मनीष देशमुख यांचे नेतृत्व.',
        tags: ['बायोटेक', 'टिश्यू कल्चर', 'कृषी संशोधन'],
      },

      // 3. Education
      'लोकमंगल इंग्लिश मीडियम स्कूल अँड ज्युनियर कॉलेज': {
        meta: 'सीबीएसई व राज्य मंडळ • गुणवत्तापूर्ण शिक्षण',
        text: 'ग्रामीण भागातील विद्यार्थ्यांना जागतिक दर्जाचे इंग्रजी माध्यमाचे शिक्षण, आधुनिक संगणक लॅब आणि सर्वांगीण व्यक्तिमत्त्व विकासाचे केंद्र.',
        tags: ['इंग्रजी माध्यम', 'शालेय शिक्षण', 'क्रीडा व कला'],
      },
      'लोकमंगल आयटीआय': {
        meta: 'व्यावसायिक कौशल्य प्रशिक्षण • सोलापूर',
        text: 'ग्रामीण तरुणांना उद्योगपूरक तांत्रिक कौशल्ये (इलेक्ट्रिशियन, फिटर, वेल्डर) देऊन १००% रोजगाराभिमुख बनवणारी संस्था.',
        tags: ['कौशल्य विकास', 'आयटीआय', 'रोजगार'],
      },
      'लोकमंगल कृषी तंत्रनिकेतन': {
        meta: 'कृषी पदविका (Diploma in Agriculture)',
        text: 'शेतकऱ्यांच्या पाल्यांना आधुनिक शेती, जलव्यवस्थापन आणि पीक संरक्षणाचे व्यावहारिक प्रशिक्षण देणारी मान्यताप्राप्त संस्था.',
        tags: ['कृषी तंत्रज्ञान', 'पदविका', 'शेतकरी प्रशिक्षण'],
      },
      'लोकमंगल कृषी महाविद्यालय, वडाळा': {
        meta: 'बी.एस्सी. कृषी (B.Sc. Agriculture) • वडाळा',
        text: 'राहुरी कृषी विद्यापीठाशी संलग्न पदवी महाविद्यालय. अत्याधुनिक प्रयोगशाळा, प्रत्यक्ष प्रक्षेत्र प्रशिक्षण आणि उच्च दर्जाचे कृषी संशोधन.',
        tags: ['बी.एस्सी. कृषी', 'कृषी पदवी', 'वडाळा संकुल'],
      },
      'लोकमंगल कृषी जैवतंत्रज्ञान महाविद्यालय, वडाळा': {
        meta: 'बी.टेक. बायोटेक्नॉलॉजी • अत्याधुनिक संशोधन',
        text: 'कृषी जैवतंत्रज्ञान क्षेत्रात उच्च शिक्षण आणि जिनोम व टिशू कल्चर संशोधनात विद्यार्थ्यांना मार्गदर्शन.',
        tags: ['जैवतंत्रज्ञान', 'बी.टेक', 'कृषी विज्ञान'],
      },
      'लोकमंगल जैवतंत्रज्ञान महाविद्यालय': {
        meta: 'पदवी व पदव्युत्तर जैवतंत्रज्ञान',
        text: 'मायक्रोबायोलॉजी, जेनेटिक्स आणि बायोइन्फॉरमॅटिक्स या आधुनिक विज्ञान शाखांमधील अग्रगण्य शिक्षण संस्था.',
        tags: ['बायोटेक्नॉलॉजी', 'संशोधन', 'उच्च शिक्षण'],
      },
      'लोकमंगल कृषी व्यवसाय व्यवस्थापन महाविद्यालय (ABM)': {
        meta: 'बी.एस्सी. ॲग्री बिझनेस मॅनेजमेंट (ABM)',
        text: 'कृषी क्षेत्रातील उद्योजकता, शेतमाल विपणन, निर्यात आणि प्रक्रिया व्यवस्थापनाचे उच्च शिक्षण देणारे केंद्र.',
        tags: ['ॲग्री बिझनेस', 'उद्योजकता', 'कृषी विपणन'],
      },
      'लोकमंगल उद्योजकता महाविद्यालय': {
        meta: 'स्टार्टअप व व्यावसायिक नेतृत्व',
        text: 'तरुणांना केवळ नोकरी शोधणारे न बनवता स्वतःचा उद्योग सुरू करणारे यशस्वी उद्योजक बनवणारे प्रशिक्षण केंद्र.',
        tags: ['स्टार्टअप', 'उद्योजकता', 'नेतृत्व'],
      },
      'लोकमंगल फार्मसी महाविद्यालय (B.Pharm), वडाळा': {
        meta: 'बी.फार्मसी व डी.फार्मसी • औषधनिर्माण शास्त्र',
        text: 'फार्मसी कौन्सिल ऑफ इंडिया (PCI) मान्यताप्राप्त संस्था. औषधनिर्माण आणि आरोग्य क्षेत्रातील तज्ज्ञ मनुष्यबळ निर्मिती.',
        tags: ['फार्मसी', 'औषधनिर्माण', 'आरोग्य शिक्षण'],
      },
      'लोकमंगल पशुवैद्यकीय महाविद्यालय': {
        meta: 'पशुसंवर्धन व दुग्धव्यवसाय प्रशिक्षण',
        text: 'ग्रामीण भागातील दुग्धव्यवसाय, पशुसंवर्धन आणि पशुआरोग्य सेवेसाठी आवश्यक पदविका व पदवी शिक्षण केंद्र.',
        tags: ['पशुसंवर्धन', 'दुग्धव्यवसाय', 'ग्रामीण विकास'],
      },

      // 4. Foundations, Research & Social Work
      'लोकमंगल फाऊंडेशन': {
        meta: 'सामाजिक उपक्रम व जनकल्याण • अध्यक्ष: रोहन देशमुख',
        text: 'सामुदायिक विवाह सोहळे, अन्नपूर्णा मोफत भोजन योजना, लोटस शिष्यवृत्ती, जलसंधारण आणि रुग्णवाहिका सेवेच्या माध्यमातून जनसेवा.',
        tags: ['सामाजिक कार्य', 'अन्नपूर्णा', 'सामुदायिक विवाह', 'शिष्यवृत्ती'],
      },
      'लोकमंगल डेव्हलपमेंट फाऊंडेशन (LDF)': {
        meta: 'ग्रामीण विकास व जलसंधारण',
        text: 'दुष्काळमुक्तीसाठी जलयुक्त शिवार, शेततळी निर्मिती, ओढा खोलीकरण आणि ग्रामीण पायाभूत सुविधांचे सक्षमीकरण.',
        tags: ['जलसंधारण', 'दुष्काळमुक्ती', 'ग्रामीण विकास'],
      },
      'लोकमंगल मेडिकल फाऊंडेशन अँड रिसर्च सेंटर': {
        meta: 'आरोग्यसेवा व मोफत वैद्यकीय शिबिरे',
        text: 'ग्रामीण भागात मोफत आरोग्य तपासणी, कर्करोग निदान शिबिरे, मोतीबिंदू शस्त्रक्रिया आणि २४ तास कार्डियाक रुग्णवाहिका सेवा.',
        tags: ['आरोग्यसेवा', 'मोफत शिबिरे', 'रुग्णवाहिका'],
      },
      'श्रीराम ग्रामीण संशोधन व विकास प्रतिष्ठान, वडाळा': {
        meta: 'ग्रामीण जीवनमान सुधारणा व संशोधन',
        text: 'शेतीपूरक जोडधंदे, शेळीपालन, कुक्कुटपालन आणि महिला बचत गटांच्या सक्षमीकरणासाठी समर्पित संशोधन संस्था.',
        tags: ['ग्रामीण संशोधन', 'बचत गट', 'जोडधंदे'],
      },
      'सोलापूर सोशल फाऊंडेशन / स्वामींचे घर': {
        meta: 'निराधार व ज्येष्ठांसाठी आश्रय',
        text: 'निराधार, वृद्ध आणि गरजू नागरिकांसाठी भोजन, औषधोपचार आणि सन्मानपूर्वक जीवन जगण्यासाठी उभारलेले सेवाभावी केंद्र.',
        tags: ['ज्येष्ठ नागरिक सेवा', 'अन्नछत्र', 'मानवता'],
      },

      // 5. Media
      'लोकमंगल वृत्तांत': {
        meta: 'दैनिक वृत्तपत्र व माध्यम • सोलापूर',
        text: 'शेतकरी, सामान्य नागरिक, सहकार आणि स्थानिक प्रश्नांना अग्रस्थान देणारे सोलापूर व परिसरातील लोकप्रिय दैनिक वृत्तपत्र.',
        tags: ['वृत्तपत्र', 'माध्यम', 'जनसंवाद'],
      },
    }

    let parivarUpdated = 0
    raw.layout.forEach((block) => {
      if (block.items && Array.isArray(block.items)) {
        block.items.forEach((item) => {
          const t = item.title?.mr || item.title?.en || item.title
          const d = institutionsData[t]
          if (d) {
            item.meta = { mr: d.meta, en: d.meta }
            item.text = { mr: d.text, en: d.text }
            item.tags = { mr: d.tags, en: d.tags }
            parivarUpdated++
          }
        })
      }
    })

    await documents.update('pages', id, raw, { overrideAccess: true, locale: 'all' })
    console.log(`✓ Updated ${parivarUpdated} institutions on /lokmangal/parivar with authentic Marathi content.`)
  }

  // ==========================================
  // 2. Enrich /political-career
  // ==========================================
  console.log('\n▶ Enriching /political-career...')
  const polFound = await documents.find('pages', { where: { path: { equals: '/political-career' } }, limit: 1, overrideAccess: true, depth: 0 })
  if (polFound.docs.length) {
    const { id, createdAt: _c, updatedAt: _u, ...raw } = await documents.getRaw('pages', polFound.docs[0].id)

    // Ensure layout has 3 rich mediaText chapters + 1 gallery
    // Block 0: Vivekananda Vichar Yatra (already mediaText)
    // Block 1: BJYM (already mediaText)
    // Block 2: Dharashiv Lok Sabha & People Connect (convert from content to mediaText with photo 133 tuljapur-sabha-01)
    if (raw.layout[2] && raw.layout[2].blockType === 'content') {
      raw.layout[2] = {
        id: 'pol-chapter-dharashiv',
        blockType: 'mediaText',
        eyebrow: {
          mr: 'लोकसभा निवडणूक व जनसंपर्क',
          en: 'Lok Sabha Election & Public Connect',
        },
        heading: {
          mr: 'धाराशिव लोकसभा निवडणूक व लोकसंवाद',
          en: 'Lok Sabha Election, Dharashiv (Osmanabad)',
        },
        image: 133, // tuljapur-sabha-01.webp
        imagePosition: 'left',
        body: {
          mr: '<p>रोहन देशमुख यांनी धाराशिव (उस्मानाबाद) लोकसभा निवडणूक लढवली. कोणत्याही पारंपरिक राजकीय चौकटीबाहेर जाऊन त्यांनी जनतेशी थेट, पारदर्शक संवाद साधला.</p><p>शेतकऱ्यांचे प्रश्न, सिंचन, ग्रामीण बेरोजगारी आणि युवकांच्या रोजगारासाठी त्यांनी गावोगावी जाऊन नागरिकांशी चर्चा केली. तुळजापूर, उमरगा, भूम, परंडा आणि सोलापूरच्या सीमावर्ती भागांत प्रचंड जनसंवाद मेळावे आयोजित करून जनतेच्या मनात एक स्वतंत्र आणि विकासाभिमुख नेतृत्व म्हणून स्वतःचे स्थान निर्माण केले.</p>',
          en: '<p>Rohan Deshmukh contested the Dharashiv (Osmanabad) Lok Sabha election with a vision of direct, transparent public communication. Reaching thousands of families across villages, he championed farmer issues, water conservation, and youth employment.</p>',
        },
        buttons: [
          {
            id: 'btn-pol-1',
            label: { mr: 'राजकीय क्षणचित्रे पहा', en: 'View Political Gallery' },
            url: '/media/photos/political-moments',
          },
        ],
      }
      console.log('✓ Converted Block 2 to rich mediaText with tuljapur rally image.')
    }

    await documents.update('pages', id, raw, { overrideAccess: true, locale: 'all' })
    console.log('✓ /political-career updated successfully.')
  }

  // ==========================================
  // 3. Enrich /media/photos albums
  // ==========================================
  console.log('\n▶ Enriching photo albums...')
  const albums = await documents.find('albums', { limit: 10, depth: 0, overrideAccess: true })
  console.log(`Found ${albums.docs.length} albums in database.`)

  // Ensure title and description in Marathi for albums
  for (const a of albums.docs) {
    const raw = await documents.getRaw('albums', a.id)
    if (raw.slug === 'political-moments') {
      raw.title = { mr: 'राजकीय क्षणचित्रे व जनसंवाद', en: 'Political Career & Public Rallies' }
      raw.description = { mr: 'विविध राजकीय दौरे, जाहीर सभा, जनसंवाद यात्रा आणि मान्यवरांशी भेटीगाठी.', en: 'Public meetings, rallies, and political leadership.' }
      await documents.update('albums', a.id, raw, { overrideAccess: true, locale: 'all' })
      console.log('✓ Updated political-moments album title & description.')
    } else if (raw.slug === 'family-moments') {
      raw.title = { mr: 'कौटुंबिक स्नेह व सण-उत्सव', en: 'Family Moments & Festivities' }
      raw.description = { mr: 'कुटुंबासोबतचे आनंदाचे क्षण, सण-उत्सव, संस्कार आणि एकत्र कुटुंबाची समृद्ध परंपरा.', en: 'Family celebrations, cultural traditions and personal moments.' }
      await documents.update('albums', a.id, raw, { overrideAccess: true, locale: 'all' })
      console.log('✓ Updated family-moments album title & description.')
    } else if (raw.slug === 'celebrity-moments') {
      raw.title = { mr: 'क्रीडा व मान्यवर भेटी', en: 'Sports & Dignitaries' }
      raw.description = { mr: 'क्रीडापटू, कलाकार आणि राष्ट्रीय स्तरावरील मान्यवरांसोबतचे अविस्मरणीय क्षण.', en: 'Interactions with celebrated personalities in sports and culture.' }
      await documents.update('albums', a.id, raw, { overrideAccess: true, locale: 'all' })
      console.log('✓ Updated celebrity-moments album title & description.')
    }
  }

} catch (err) {
  console.error('✖ Error:', err)
} finally {
  await close()
  console.log('\n✓ Database update completed.')
}
