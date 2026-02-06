import React, { useEffect, useState } from "react";
const Baground2 = "/img/Baground2.svg";
const Baground1 = "/img/Baground1.svg";

const LeftSideSlider = ({ company, currentSlide, setCurrentSlide, currentIndex, setCurrentIndex }) => {
  const [imagesLoaded, setImagesLoaded] = useState({});
  
  const images = company?.sliderImages?.length
    ? company.sliderImages.map((img) => img.image)
    : [Baground1, Baground2];

  const displayImages =
    company?.sliderImages && company.sliderImages.length > 0
      ? company.sliderImages
      : images.map((img, idx) => ({ id: idx, image: img }));

  // Preload first image for better LCP
  useEffect(() => {
    const firstImage = displayImages[0]?.image || displayImages[0];
    if (firstImage) {
      const img = new Image();
      img.src = firstImage;
      img.onload = () => {
        setImagesLoaded(prev => ({ ...prev, [firstImage]: true }));
      };
    }
  }, [displayImages]);

  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      {displayImages.map((slider, index) => {
        const isActive = company?.sliderImages && company.sliderImages.length > 0
          ? index === currentSlide
          : index === currentIndex;
        const opacityClass = isActive ? "opacity-100" : "opacity-0";
        const imageUrl = slider.image || slider;
        const isFirstImage = index === 0;

        return (
          <div
            key={slider.id || index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${opacityClass}`}
          >
            <img
              src={imageUrl}
              alt=""
              className="w-full h-full object-cover"
              loading={isFirstImage ? "eager" : "lazy"}
              fetchPriority={isFirstImage ? "high" : "auto"}
              decoding="async"
              aria-hidden="true"
              onLoad={() => {
                setImagesLoaded(prev => ({ ...prev, [imageUrl]: true }));
              }}
            />
            <div className="absolute inset-0"></div>
          </div>
        );
      })}

      {displayImages.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex gap-3">
          {displayImages.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (company?.sliderImages && company.sliderImages.length > 0) {
                  setCurrentSlide(index);
                } else {
                  setCurrentIndex(index);
                }
              }}
              className={`transition-all duration-300 rounded-full ${(company?.sliderImages && company.sliderImages.length > 0
                  ? index === currentSlide
                  : index === currentIndex)
                  ? "w-8 h-2 bg-white shadow-lg"
                  : "w-2 h-2 bg-white/50 hover:bg-white/70"
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LeftSideSlider;

