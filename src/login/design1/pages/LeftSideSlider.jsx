import React from "react";
import Baground2 from "../../../../public/img/Baground2.png";
import Baground1 from "../../../../public/img/background.jpg";

const LeftSideSlider = ({ company, currentSlide, setCurrentSlide, currentIndex, setCurrentIndex }) => {
  const images = company?.sliderImages?.length
    ? company.sliderImages.map((img) => img.image)
    : [Baground1, Baground2];

  const displayImages =
    company?.sliderImages && company.sliderImages.length > 0
      ? company.sliderImages
      : images.map((img, idx) => ({ id: idx, image: img }));

  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      {displayImages.map((slider, index) => (
        <div
          key={slider.id || index}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            company?.sliderImages && company.sliderImages.length > 0
              ? index === currentSlide
                ? "opacity-100"
                : "opacity-0"
              : index === currentIndex
              ? "opacity-100"
              : "opacity-0"
          }`}
          style={{
            backgroundImage: `url(${slider.image || slider})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 via-green-800/30 to-transparent"></div>
        </div>
      ))}

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
              className={`transition-all duration-300 rounded-full ${
                (company?.sliderImages && company.sliderImages.length > 0
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

