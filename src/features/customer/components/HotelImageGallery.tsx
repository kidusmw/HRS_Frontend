type Props = {
  images: string[]
  hotelName: string
}

export function HotelImageGallery({ images, hotelName }: Props) {
  const mainImage = images[0]
  const sideTopImage = images[1] ?? mainImage
  const sideBottomImage = images[2] ?? mainImage
  const thumbImages = images.slice(3, 8) // up to 5 thumbs
  const extraThumbCount = Math.max(0, images.length - 3 - thumbImages.length)

  if (!mainImage) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No photos available
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-muted/10 shadow-sm md:h-[420px]">
      {/* Top collage */}
      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 md:h-full">
        {/* Main */}
        <div className="md:col-span-3 md:row-span-2">
          <img
            src={mainImage}
            alt={hotelName}
            className="h-64 w-full object-cover md:h-full"
            loading="lazy"
          />
        </div>

        {/* Right top */}
        <div className="md:col-span-1 md:row-span-1 md:border-l md:border-b">
          <img
            src={sideTopImage}
            alt={hotelName}
            className="h-40 w-full object-cover md:h-full"
            loading="lazy"
          />
        </div>

        {/* Right bottom */}
        <div className="md:col-span-1 md:row-span-1 md:border-l">
          <img
            src={sideBottomImage}
            alt={hotelName}
            className="h-40 w-full object-cover md:h-full"
            loading="lazy"
          />
        </div>
      </div>

      {/* Bottom thumbs */}
      {thumbImages.length > 0 && (
        <div className="grid grid-cols-3 border-t md:hidden">
          {thumbImages.map((src, idx) => {
            const isLast = idx === thumbImages.length - 1
            const showOverlay = isLast && extraThumbCount > 0

            return (
              <div key={`${src}-${idx}`} className="relative border-r last:border-r-0">
                <img
                  src={src}
                  alt={hotelName}
                  className="h-20 w-full object-cover md:h-24"
                  loading="lazy"
                />
                {showOverlay && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">
                    +{extraThumbCount} photos
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

