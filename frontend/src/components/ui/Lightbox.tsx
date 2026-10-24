import Lightbox from 'yet-another-react-lightbox'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/captions.css'

export type LightboxSlide = { src: string; alt: string; title?: string }

/** Loaded only when a visitor opens a photo (see Gallery.tsx), so the lightbox code is not part of every page */
export default function PhotoLightbox({ slides, index, onClose }: { slides: LightboxSlide[]; index: number; onClose: () => void }) {
  return <Lightbox open={index >= 0} index={index} close={onClose} slides={slides} plugins={[Captions, Zoom]} styles={{ container: { backgroundColor: 'rgba(12,30,20,.96)' } }} />
}
