import { useState } from 'react'

export default function Gallery({ images }) {
  const [active, setActive] = useState(null)

  return (
    <section id="gallery" className="bg-sand py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <p className="eyebrow mb-2">Matchday moments</p>
        <h2 className="section-title mb-8">Gallery</h2>

        {images.length === 0 ? (
          <p className="text-pitch-700 font-body">No photos uploaded yet.</p>
        ) : (
          <div className="columns-2 sm:columns-3 gap-3 [&>*]:mb-3">
            {images.map((img) => (
              <button
                key={img.id}
                onClick={() => setActive(img)}
                className="block w-full rounded-lg overflow-hidden border border-pitch-950/5 shadow-card"
              >
                <img src={img.image_url} alt={img.caption || 'Dragon FC'} className="w-full h-auto object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-[100] bg-pitch-950/90 flex items-center justify-center p-4"
          onClick={() => setActive(null)}
        >
          <img src={active.image_url} alt={active.caption || 'Dragon FC'} className="max-h-[85vh] max-w-full rounded-lg" />
          {active.caption && <p className="absolute bottom-6 text-white font-body text-sm">{active.caption}</p>}
        </div>
      )}
    </section>
  )
}
