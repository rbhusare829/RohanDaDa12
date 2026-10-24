/**
 * Types of the documents the website reads from the API (GET /api/…, localized to English).
 * Generated once from the old Payload CMS types, then adjusted: rich text is an HTML string, photos are
 * { url, sizes: { thumb, card, hero } } (see backend/src/lib/uploads.js), `_status`/`globalType` come with the API.
 * When a field is added to the backend schema (backend/src/schema), add it here too.
 */

export interface Page {
  id: number;
  title: string;
  /**
   * Page URL, e.g. /about/biography
   */
  path: string;
  /**
   * Pages in the same section are listed in the side menu
   */
  section?: ('about' | 'lokmangal' | 'constituency' | 'political' | 'vision' | 'engage' | 'legal' | 'other') | null;
  menuOrder?: number | null;
  showSideMenu?: boolean | null;
  subtitle?: string | null;
  bannerImage?: (number | null) | Media;
  layout?:
    | (
        | {
            /**
             * Small label above the heading
             */
            eyebrow?: string | null;
            heading?: string | null;
            /**
             * Hide this block on the site
             */
            hidden?: boolean | null;
            body?: string | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'content';
          }
        | {
            /**
             * Small label above the heading
             */
            eyebrow?: string | null;
            heading?: string | null;
            /**
             * Hide this block on the site
             */
            hidden?: boolean | null;
            image?: (number | null) | Media;
            imagePosition?: ('left' | 'right') | null;
            body?: string | null;
            buttons?:
              | {
                  label?: string | null;
                  /**
                   * Internal path like /about/biography or full https:// link
                   */
                  url?: string | null;
                  newTab?: boolean | null;
                  id?: string | null;
                }[]
              | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'mediaText';
          }
        | {
            /**
             * Small label above the heading
             */
            eyebrow?: string | null;
            heading?: string | null;
            /**
             * Hide this block on the site
             */
            hidden?: boolean | null;
            items?:
              | {
                  /**
                   * e.g. ३,२२१+ (Marathi) / 3,221+ (English)
                   */
                  value: string;
                  label: string;
                  id?: string | null;
                }[]
              | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'stats';
          }
        | {
            /**
             * Small label above the heading
             */
            eyebrow?: string | null;
            heading?: string | null;
            /**
             * Hide this block on the site
             */
            hidden?: boolean | null;
            intro?: string | null;
            columns?: ('2' | '3' | '4') | null;
            items?:
              | {
                  /**
                   * Not shown on the website (emoji are not used)
                   */
                  icon?: string | null;
                  image?: (number | null) | Media;
                  title: string;
                  /**
                   * e.g. "स्थापना: २००२"
                   */
                  meta?: string | null;
                  text?: string | null;
                  tags?: string[] | null;
                  url?: string | null;
                  id?: string | null;
                }[]
              | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'cards';
          }
        | {
            /**
             * Small label above the heading
             */
            eyebrow?: string | null;
            heading?: string | null;
            /**
             * Hide this block on the site
             */
            hidden?: boolean | null;
            layout?: ('grid' | 'masonry') | null;
            images?: (number | Media)[] | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'gallery';
          }
        | {
            /**
             * Small label above the heading
             */
            eyebrow?: string | null;
            heading?: string | null;
            /**
             * Hide this block on the site
             */
            hidden?: boolean | null;
            items?:
              | {
                  question: string;
                  answer?: string | null;
                  id?: string | null;
                }[]
              | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'faq';
          }
        | {
            /**
             * Small label above the heading
             */
            eyebrow?: string | null;
            heading?: string | null;
            /**
             * Hide this block on the site
             */
            hidden?: boolean | null;
            youtubeUrl: string;
            caption?: string | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'video';
          }
        | {
            hidden?: boolean | null;
            text: string;
            author?: string | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'quote';
          }
        | {
            /**
             * Small label above the heading
             */
            eyebrow?: string | null;
            heading?: string | null;
            /**
             * Hide this block on the site
             */
            hidden?: boolean | null;
            files?:
              | {
                  label: string;
                  file: number | DocumentFile;
                  id?: string | null;
                }[]
              | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'downloads';
          }
        | {
            /**
             * Small label above the heading
             */
            eyebrow?: string | null;
            heading?: string | null;
            /**
             * Hide this block on the site
             */
            hidden?: boolean | null;
            text?: string | null;
            image?: (number | null) | Media;
            buttons?:
              | {
                  label?: string | null;
                  /**
                   * Internal path like /about/biography or full https:// link
                   */
                  url?: string | null;
                  newTab?: boolean | null;
                  id?: string | null;
                }[]
              | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'cta';
          }
      )[]
    | null;
  meta?: {
    title?: string | null;
    description?: string | null;
    /**
     * Maximum upload file size: 12MB. Recommended file size for images is <500KB.
     */
    image?: (number | null) | Media;
  };
  updatedAt: string;
  createdAt: string;
  _status?: ('draft' | 'published') | null;
}

export interface Media {
  id: number;
  /**
   * Describe the photo (for accessibility & SEO)
   */
  alt?: string | null;
  caption?: string | null;
  folder?: number | null;
  updatedAt: string;
  createdAt: string;
  url?: string | null;
  thumbnailURL?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  focalX?: number | null;
  focalY?: number | null;
  sizes?: {
    thumb?: {
      url?: string | null;
      width?: number | null;
      height?: number | null;
      mimeType?: string | null;
      filesize?: number | null;
      filename?: string | null;
    };
    card?: {
      url?: string | null;
      width?: number | null;
      height?: number | null;
      mimeType?: string | null;
      filesize?: number | null;
      filename?: string | null;
    };
    hero?: {
      url?: string | null;
      width?: number | null;
      height?: number | null;
      mimeType?: string | null;
      filesize?: number | null;
      filename?: string | null;
    };
  };
}

export interface DocumentFile {
  id: number;
  title?: string | null;
  prefix?: string | null;
  _objectKey?: string | null;
  updatedAt: string;
  createdAt: string;
  url?: string | null;
  thumbnailURL?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  focalX?: number | null;
  focalY?: number | null;
}

export interface Office {
  id: number;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  /**
   * Form submissions for this office are emailed here
   */
  notifyEmails?: string[] | null;
  /**
   * Google Maps → Share → Embed a map → copy the src URL
   */
  mapEmbedUrl?: string | null;
  order?: number | null;
  updatedAt: string;
  createdAt: string;
}

export interface Post {
  id: number;
  title: string;
  subtitle?: string | null;
  /**
   * URL part, e.g. "annapurna-yojana". Auto-filled from the title if empty.
   */
  slug: string;
  publishedAt?: string | null;
  author?: string | null;
  categories?: (number | Category)[] | null;
  tags?: string[] | null;
  coverImage?: (number | null) | Media;
  excerpt?: string | null;
  content?: string | null;
  meta?: {
    title?: string | null;
    description?: string | null;
    /**
     * Maximum upload file size: 12MB. Recommended file size for images is <500KB.
     */
    image?: (number | null) | Media;
  };
  updatedAt: string;
  createdAt: string;
  _status?: ('draft' | 'published') | null;
}

export interface Category {
  id: number;
  title: string;
  /**
   * URL part, e.g. "annapurna-yojana". Auto-filled from the title if empty.
   */
  slug: string;
  updatedAt: string;
  createdAt: string;
}

export interface Initiative {
  id: number;
  title: string;
  /**
   * URL part, e.g. "annapurna-yojana". Auto-filled from the title if empty.
   */
  slug: string;
  category:
    'food' | 'agriculture' | 'education' | 'health' | 'community' | 'women' | 'culture' | 'senior-citizens' | 'youth';
  organisation?: ('foundation' | 'parivar' | 'vishwamangal') | null;
  /**
   * Show on homepage
   */
  featured?: boolean | null;
  order?: number | null;
  /**
   * One short line shown on the card, e.g. "500 Beneficiaries" or "48 Ceremonies | 3,221 Couples Married"
   */
  stat?: string | null;
  excerpt?: string | null;
  /**
   * Shown in a highlighted box below the cover photo
   */
  objective?: string | null;
  heroImage?: (number | null) | Media;
  body?: string | null;
  counters?:
    | {
        /**
         * e.g. ३,२२१+ (Marathi) / 3,221+ (English)
         */
        value: string;
        label: string;
        id?: string | null;
      }[]
    | null;
  gallery?: (number | Media)[] | null;
  youtubeUrl?: string | null;
  /**
   * Extra YouTube videos shown under the main video
   */
  videos?:
    | {
        url: string;
        title?: string | null;
        id?: string | null;
      }[]
    | null;
  relatedPosts?: (number | Post)[] | null;
  meta?: {
    title?: string | null;
    description?: string | null;
    /**
     * Maximum upload file size: 12MB. Recommended file size for images is <500KB.
     */
    image?: (number | null) | Media;
  };
  updatedAt: string;
  createdAt: string;
  _status?: ('draft' | 'published') | null;
}

export interface Event {
  id: number;
  title: string;
  /**
   * URL part, e.g. "annapurna-yojana". Auto-filled from the title if empty.
   */
  slug: string;
  initiative?: (number | null) | Initiative;
  coverImage?: (number | null) | Media;
  description?: string | null;
  /**
   * Section on the Lokmangal Foundation → कार्यक्रम tab
   */
  group?: ('youth' | 'sports') | null;
  /**
   * Short line under the title, e.g. "A stage for thousands of young talents"
   */
  tagline?: string | null;
  body?: string | null;
  /**
   * e.g. Year → 2011, Solapur · Partner → Solapur University
   */
  facts?:
    | {
        label: string;
        value: string;
        id?: string | null;
      }[]
    | null;
  /**
   * Optional: year-wise photo galleries
   */
  editions?:
    | {
        year: number;
        title?: string | null;
        text?: string | null;
        images?: (number | Media)[] | null;
        id?: string | null;
      }[]
    | null;
  updatedAt: string;
  createdAt: string;
}

export interface Album {
  id: number;
  title: string;
  /**
   * URL part, e.g. "annapurna-yojana". Auto-filled from the title if empty.
   */
  slug: string;
  category?: ('events' | 'social' | 'political' | 'public') | null;
  date?: string | null;
  cover?: (number | null) | Media;
  description?: string | null;
  photos: (number | Media)[];
  updatedAt: string;
  createdAt: string;
}

export interface Video {
  id: number;
  title: string;
  youtubeUrl: string;
  /**
   * Category / playlist name, e.g. "लोकमंगल फाऊंडेशन"
   */
  playlist?: string | null;
  featured?: boolean | null;
  publishedAt?: string | null;
  updatedAt: string;
  createdAt: string;
}

export interface Home {
  id: number;
  sections?:
    | (
        | {
            hidden?: boolean | null;
            /**
             * "photo" shows the Photo behind the words, with buttons; "text" is the navy band without buttons.
             */
            heroStyle?: ('photo' | 'text') | null;
            /**
             * The photo behind the words on wide screens (landscape, Rohan on the right)
             */
            photo?: (number | null) | Media;
            /**
             * Portrait photo for phones and tablets
             */
            photoMobile?: (number | null) | Media;
            autoplaySeconds?: number | null;
            slides?:
              | {
                  /**
                   * Older field, not used by the current hero
                   */
                  image?: (number | null) | Media;
                  /**
                   * Older field, not used by the current hero
                   */
                  imageMobile?: (number | null) | Media;
                  /**
                   * Short orange line, e.g. रोहन सुभाष देशमुख
                   */
                  kicker?: string | null;
                  heading?: string | null;
                  subheading?: string | null;
                  buttons?:
                    | {
                        label?: string | null;
                        /**
                         * Internal path like /about/biography or full https:// link
                         */
                        url?: string | null;
                        newTab?: boolean | null;
                        id?: string | null;
                      }[]
                    | null;
                  id?: string | null;
                }[]
              | null;
            badge?:
              | {
                  /**
                   * e.g. ३,२२१+ (Marathi) / 3,221+ (English)
                   */
                  value: string;
                  label: string;
                  id?: string | null;
                }[]
              | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'heroSlider';
          }
        | {
            /**
             * Hide this section on the homepage
             */
            hidden?: boolean | null;
            eyebrow?: string | null;
            heading?: string | null;
            items?:
              | {
                  icon?:
                    | (
                        | 'user'
                        | 'heart'
                        | 'book'
                        | 'camera'
                        | 'video'
                        | 'vote'
                        | 'pen'
                        | 'phone'
                        | 'info'
                        | 'flag'
                        | 'leaf'
                        | 'award'
                      )
                    | null;
                  label?: string | null;
                  /**
                   * Internal path like /about/biography or full https:// link
                   */
                  url?: string | null;
                  newTab?: boolean | null;
                  id?: string | null;
                }[]
              | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'quickLinks';
          }
        | {
            /**
             * Hide this section on the homepage
             */
            hidden?: boolean | null;
            eyebrow?: string | null;
            heading?: string | null;
            image?: (number | null) | Media;
            text?: string | null;
            /**
             * Personal pledge quote
             */
            pledge?: string | null;
            stats?:
              | {
                  /**
                   * e.g. ३,२२१+ (Marathi) / 3,221+ (English)
                   */
                  value: string;
                  label: string;
                  id?: string | null;
                }[]
              | null;
            buttonLabel?: string | null;
            buttonUrl?: string | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'aboutIntro';
          }
        | {
            /**
             * Hide this section on the homepage
             */
            hidden?: boolean | null;
            eyebrow?: string | null;
            heading?: string | null;
            items?:
              | {
                  place?: string | null;
                  title?: string | null;
                  text?: string | null;
                  id?: string | null;
                }[]
              | null;
            buttonLabel?: string | null;
            buttonUrl?: string | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'homeJourney';
          }
        | {
            /**
             * Hide this section on the homepage
             */
            hidden?: boolean | null;
            eyebrow?: string | null;
            heading?: string | null;
            image?: (number | null) | Media;
            intro?: string | null;
            items?:
              | {
                  title?: string | null;
                  text?: string | null;
                  url?: string | null;
                  id?: string | null;
                }[]
              | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'biography';
          }
        | {
            /**
             * Hide this section on the homepage
             */
            hidden?: boolean | null;
            eyebrow?: string | null;
            heading?: string | null;
            youtubeUrl: string;
            text?: string | null;
            links?:
              | {
                  label?: string | null;
                  /**
                   * Internal path like /about/biography or full https:// link
                   */
                  url?: string | null;
                  newTab?: boolean | null;
                  description?: string | null;
                  id?: string | null;
                }[]
              | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'featuredVideo';
          }
        | {
            /**
             * Hide this section on the homepage
             */
            hidden?: boolean | null;
            eyebrow?: string | null;
            heading?: string | null;
            items?:
              | {
                  image?: (number | null) | Media;
                  title?: string | null;
                  text?: string | null;
                  url?: string | null;
                  id?: string | null;
                }[]
              | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'workHighlights';
          }
        | {
            /**
             * Hide this section on the homepage
             */
            hidden?: boolean | null;
            eyebrow?: string | null;
            heading?: string | null;
            intro?: string | null;
            /**
             * Leave empty to show featured initiatives automatically
             */
            initiatives?: (number | Initiative)[] | null;
            stats?:
              | {
                  /**
                   * e.g. ३,२२१+ (Marathi) / 3,221+ (English)
                   */
                  value: string;
                  label: string;
                  id?: string | null;
                }[]
              | null;
            buttonLabel?: string | null;
            buttonUrl?: string | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'initiativesShowcase';
          }
        | {
            /**
             * Hide this section on the homepage
             */
            hidden?: boolean | null;
            eyebrow?: string | null;
            heading?: string | null;
            members?:
              | {
                  image?: (number | null) | Media;
                  relation?: string | null;
                  name?: string | null;
                  text?: string | null;
                  id?: string | null;
                }[]
              | null;
            intro?: string | null;
            buttonLabel?: string | null;
            buttonUrl?: string | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'family';
          }
        | {
            /**
             * Hide this section on the homepage
             */
            hidden?: boolean | null;
            eyebrow?: string | null;
            heading?: string | null;
            text?: string | null;
            items?:
              | {
                  /**
                   * Big number, e.g. 4
                   */
                  value?: string | null;
                  title?: string | null;
                  text?: string | null;
                  id?: string | null;
                }[]
              | null;
            buttonLabel?: string | null;
            buttonUrl?: string | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'homeParivar';
          }
        | {
            /**
             * Hide this section on the homepage
             */
            hidden?: boolean | null;
            eyebrow?: string | null;
            heading?: string | null;
            text?: string | null;
            items?:
              | {
                  /**
                   * Card photo (landscape, about 16:10)
                   */
                  image?: (number | null) | Media;
                  /**
                   * Small label above the title
                   */
                  tag?: string | null;
                  title?: string | null;
                  text?: string | null;
                  url?: string | null;
                  id?: string | null;
                }[]
              | null;
            buttonLabel?: string | null;
            buttonUrl?: string | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'homeHighlights';
          }
        | {
            /**
             * Hide this section on the homepage
             */
            hidden?: boolean | null;
            eyebrow?: string | null;
            heading?: string | null;
            limit?: number | null;
            buttonLabel?: string | null;
            buttonUrl?: string | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'homeEvents';
          }
        | {
            /**
             * Hide this section on the homepage
             */
            hidden?: boolean | null;
            eyebrow?: string | null;
            heading?: string | null;
            /**
             * Book cover
             */
            image?: (number | null) | Media;
            text?: string | null;
            buttonLabel?: string | null;
            buttonUrl?: string | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'homeVision';
          }
        | {
            /**
             * Hide this section on the homepage
             */
            hidden?: boolean | null;
            eyebrow?: string | null;
            heading?: string | null;
            images?: (number | Media)[] | null;
            buttonLabel?: string | null;
            buttonUrl?: string | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'homeGallery';
          }
        | {
            /**
             * Hide this section on the homepage
             */
            hidden?: boolean | null;
            eyebrow?: string | null;
            heading?: string | null;
            image?: (number | null) | Media;
            items?:
              | {
                  /**
                   * e.g. ३,२२१+ (Marathi) / 3,221+ (English)
                   */
                  value: string;
                  label: string;
                  id?: string | null;
                }[]
              | null;
            buttonLabel?: string | null;
            buttonUrl?: string | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'homeStats';
          }
        | {
            /**
             * Hide this section on the homepage
             */
            hidden?: boolean | null;
            eyebrow?: string | null;
            heading?: string | null;
            text?: string | null;
            items?:
              | {
                  question: string;
                  answer?: string | null;
                  id?: string | null;
                }[]
              | null;
            buttons?:
              | {
                  label?: string | null;
                  /**
                   * Internal path like /about/biography or full https:// link
                   */
                  url?: string | null;
                  newTab?: boolean | null;
                  id?: string | null;
                }[]
              | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'homeFaq';
          }
        | {
            /**
             * Hide this section on the homepage
             */
            hidden?: boolean | null;
            eyebrow?: string | null;
            heading?: string | null;
            limit?: number | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'latestBlog';
          }
        | {
            /**
             * Hide this section on the homepage
             */
            hidden?: boolean | null;
            eyebrow?: string | null;
            heading?: string | null;
            text?: string | null;
            /**
             * Instagram post/reel URLs to embed
             */
            instagramPosts?:
              | {
                  url: string;
                  title?: string | null;
                  id?: string | null;
                }[]
              | null;
            showFacebook?: boolean | null;
            /**
             * Shows latest videos from the Video Gallery
             */
            showYoutube?: boolean | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'socialFeeds';
          }
        | {
            /**
             * Hide this section on the homepage
             */
            hidden?: boolean | null;
            eyebrow?: string | null;
            heading?: string | null;
            text?: string | null;
            showWhatsapp?: boolean | null;
            image?: (number | null) | Media;
            buttonLabel?: string | null;
            buttonUrl?: string | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'appealBand';
          }
      )[]
    | null;
  meta?: {
    title?: string | null;
    description?: string | null;
    /**
     * Maximum upload file size: 12MB. Recommended file size for images is <500KB.
     */
    image?: (number | null) | Media;
  };
  _status?: ('draft' | 'published') | null;
  updatedAt?: string | null;
  createdAt?: string | null;
}

export interface Header {
  id: number;
  nav?:
    | {
        label: string;
        /**
         * Leave empty for a heading-only item
         */
        url?: string | null;
        newTab?: boolean | null;
        children?:
          | {
              label: string;
              /**
               * Leave empty for a heading-only item
               */
              url?: string | null;
              newTab?: boolean | null;
              subItems?:
                | {
                    label: string;
                    /**
                     * Leave empty for a heading-only item
                     */
                    url?: string | null;
                    newTab?: boolean | null;
                    id?: string | null;
                  }[]
                | null;
              id?: string | null;
            }[]
          | null;
        id?: string | null;
      }[]
    | null;
  updatedAt?: string | null;
  createdAt?: string | null;
}

export interface Footer {
  id: number;
  columns?:
    | {
        title: string;
        links?:
          | {
              label?: string | null;
              /**
               * Internal path like /about/biography or full https:// link
               */
              url?: string | null;
              newTab?: boolean | null;
              id?: string | null;
            }[]
          | null;
        id?: string | null;
      }[]
    | null;
  legalLinks?:
    | {
        label?: string | null;
        /**
         * Internal path like /about/biography or full https:// link
         */
        url?: string | null;
        newTab?: boolean | null;
        id?: string | null;
      }[]
    | null;
  copyright?: string | null;
  developerCredit?: string | null;
  developerUrl?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
}

export interface SiteSetting {
  id: number;
  siteName: string;
  tagline?: string | null;
  /**
   * Logo for dark backgrounds
   */
  logoLight?: (number | null) | Media;
  /**
   * Logo for light backgrounds
   */
  logoDark?: (number | null) | Media;
  defaultShareImage?: (number | null) | Media;
  /**
   * Profile PDF (Biography download)
   */
  profilePdf?: (number | null) | DocumentFile;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  /**
   * For click-to-chat button, digits only with country code, e.g. 918208737624
   */
  whatsappNumber?: string | null;
  social?: {
    facebook?: string | null;
    instagram?: string | null;
    twitter?: string | null;
    youtube?: string | null;
    linkedin?: string | null;
    whatsappChannel?: string | null;
    telegram?: string | null;
  };
  /**
   * Default recipients for all form submissions
   */
  formNotifyEmails?: string[] | null;
  formConsentText?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
}

export interface Popup {
  id: number;
  enabled?: boolean | null;
  image?: (number | null) | Media;
  title?: string | null;
  text?: string | null;
  linkLabel?: string | null;
  linkUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  delaySeconds?: number | null;
  updatedAt?: string | null;
  createdAt?: string | null;
}
