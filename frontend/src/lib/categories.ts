/**
 * Initiative categories (labels "मराठी / English"). A copy of INITIATIVE_CATEGORIES in
 * backend/src/schema/collections/content.js — keep the two lists in step.
 */
export const INITIATIVE_CATEGORIES = [
  { label: 'अन्न व पोषण / Food & Nutrition', value: 'food' },
  { label: 'जल व शेती / Water & Agriculture', value: 'agriculture' },
  { label: 'शिक्षण / Education', value: 'education' },
  { label: 'आरोग्य / Healthcare', value: 'health' },
  { label: 'सामाजिक कल्याण / Social Welfare', value: 'community' },
  { label: 'महिला व रोजगार / Women & Employment', value: 'women' },
  { label: 'संस्कृती व पर्यावरण / Culture & Environment', value: 'culture' },
  { label: 'ज्येष्ठ नागरिक / Senior Citizens', value: 'senior-citizens' },
  { label: 'युवा व रोजगार / Youth & Employment', value: 'youth' },
]

/** "अन्न व पोषण / Food & Nutrition" → the part in the visitor's language */
export const categoryLabel = (value: string, locale: 'en' | 'mr') => {
  const [mr, en] = (INITIATIVE_CATEGORIES.find((c) => c.value === value)?.label ?? value).split(' / ')
  return locale === 'mr' ? mr : (en ?? mr)
}
