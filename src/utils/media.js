const generatedPhotos = new Set([
  'agra',
  'alleppey',
  'baratang',
  'hampi',
  'havelock',
  'jaipur',
  'jaisalmer',
  'kaziranga',
  'munnar',
  'palolem',
  'srinagar',
  'udaipur',
  'varanasi',
])

const realTravelPhotos = {
  Heritage: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=82',
  Nature: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=82',
  Beach: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1200&q=82',
  Spiritual: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=82',
  Wildlife: 'https://images.unsplash.com/photo-1549366021-9f761d040a94?auto=format&fit=crop&w=1200&q=82',
  Adventure: 'https://images.unsplash.com/photo-1464278533981-50106e6176b1?auto=format&fit=crop&w=1200&q=82',
  City: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=1200&q=82',
  Food: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=82',
}

export const placeImage = (place) => {
  if (generatedPhotos.has(place.id)) return `/places/${place.id}.jpg`
  return realTravelPhotos[place.categories?.[0]] || realTravelPhotos.Nature
}

export const placeFallbackImage = (place) => `/places/${place.id}.svg`

export const categoryColor = (category) => ({
  Heritage: 'bg-[#E9E3D5] text-[#173D32]',
  Nature: 'bg-[#B7C9A8]/45 text-[#173D32]',
  Beach: 'bg-sky-100 text-[#173D32]',
  Spiritual: 'bg-[#D99B63]/25 text-[#173D32]',
  Wildlife: 'bg-[#B7C9A8]/60 text-[#173D32]',
  Adventure: 'bg-[#D99B63]/30 text-[#173D32]',
  City: 'bg-[#E9E3D5] text-[#173D32]',
  Food: 'bg-[#D99B63]/25 text-[#173D32]',
}[category] || 'bg-[#E9E3D5] text-[#173D32]')
