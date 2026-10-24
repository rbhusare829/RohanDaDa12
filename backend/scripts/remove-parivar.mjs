import { loadConfig } from '../src/config.js'
import { createApp } from '../src/app.js'

const { ctx, close } = await createApp({ cfg: loadConfig() })

try {
  const { db, documents } = ctx

  // 1. Update header global
  const header = await documents.findGlobal('header', { locale: 'all' })
  if (header && Array.isArray(header.nav)) {
    let changed = false
    header.nav = header.nav.map(item => {
      if (item.children && Array.isArray(item.children)) {
        const initialLen = item.children.length
        item.children = item.children.filter(c => c.url !== '/lokmangal/parivar')
        if (item.children.length !== initialLen) changed = true
      }
      return item
    }).filter(item => item.url !== '/lokmangal/parivar')

    if (changed) {
      console.log('Updating header global in DB...')
      await documents.updateGlobal('header', header, { overrideAccess: true, locale: 'all' })
      console.log('✓ Header global updated (removed /lokmangal/parivar).')
    } else {
      console.log('Header global had no /lokmangal/parivar.')
    }
  }

  // 2. Remove / unpublish /lokmangal/parivar from pages collection
  const parivarPage = await db.models.pages.findOne({ where: { path: '/lokmangal/parivar' } })
  if (parivarPage) {
    console.log('Found /lokmangal/parivar page in DB. Removing or unpublishing...')
    await db.models.pages.destroy({ where: { path: '/lokmangal/parivar' } })
    console.log('✓ Deleted /lokmangal/parivar from pages table.')
  } else {
    console.log('No /lokmangal/parivar page found in pages table.')
  }

  // 3. Update home global buttonUrl if pointing to /lokmangal/parivar
  const home = await documents.findGlobal('home', { locale: 'all' })
  if (home && Array.isArray(home.sections)) {
    let homeChanged = false
    home.sections = home.sections.map(sec => {
      if (sec.buttonUrl === '/lokmangal/parivar') {
        sec.buttonUrl = '/lokmangal/foundation'
        sec.buttonLabel = { en: 'Explore Lokmangal Foundation', mr: 'लोकमंगल फाऊंडेशन पहा' }
        homeChanged = true
      }
      return sec
    })
    if (homeChanged) {
      console.log('Updating home global in DB...')
      await documents.updateGlobal('home', home, { overrideAccess: true, locale: 'all' })
      console.log('✓ Home global updated.')
    }
  }

  console.log('Database cleanup completed successfully.')
} catch (err) {
  console.error('Error during cleanup:', err)
} finally {
  await close()
}
