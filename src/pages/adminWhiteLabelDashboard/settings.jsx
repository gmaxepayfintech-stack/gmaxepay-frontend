import { Upload, Plus } from "lucide-react";
import { HiArrowLeft } from "react-icons/hi2";
import PropTypes from "prop-types";
import React, { useRef, useState } from "react";

const UploadCard = ({ onFileSelect, recommendedSize }) => {
  const inputRef = useRef(null);

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5 MB");
      e.target.value = "";
      return;
    }

    onFileSelect?.(file);
    e.target.value = "";
  };

  return (
    <div
      onClick={openFilePicker}
      className="cursor-pointer border-2 border-dashed border-[#1B1717]/80 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-[249px] hover:bg-gray-50 transition"
    >
      <Upload className="w-8 h-8 text-[#1B1717] mb-2" />

      <p className="text-lg text-[#1B1717] font-[Gilroy-Medium] mb-1">
        Click To Upload
      </p>

      <p className="text-sm text-[#1B1717]/80 font-[Gilroy-Medium]">
        SVG, PNG Format <br />
        Recommended Size: {recommendedSize}
      </p>

      <span className="mt-2 p-1 text-[10px] text-[#1B1717] font-[gilroy-regular] bg-[#C5DBFF] border rounded-[4px]">
        Select from the Browser
      </span>

      <p className="text-sm text-[#1B1717]/80 font-[gilroy-regular] mt-1">
        File Size (Max 5 MB)
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/svg+xml"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

UploadCard.propTypes = {
  onFileSelect: PropTypes.func,
  recommendedSize: PropTypes.string.isRequired,
};

const PreviewCard = ({ image, buttonLabel = "Upload", onUpload }) => (
  <div className="border-2 border-dashed border-[#1B1717]/80 rounded-2xl p-4 h-[249px] flex flex-col">
    {/* Image area */}
    <div className="flex-1 flex items-center justify-center">
      {image ? (
        <img
          src={image}
          alt="Preview"
          className="max-h-[120px] max-w-[120px] object-contain"
        />
      ) : (
        <p className="text-sm text-[#1B1717]/60">No image selected</p>
      )}
    </div>

    {/* Button at bottom */}
    <button
      disabled={!image}
      onClick={onUpload}
      className={`mx-auto mt-3 px-4 py-2 w-fit rounded-[4px] font-[Gilroy-Medium] text-sm
    ${
      image
        ? "bg-[#C5DBFF] text-[#1B1717]"
        : "bg-gray-200 text-gray-400 cursor-not-allowed"
    }`}
    >
      {buttonLabel}
    </button>
  </div>
);

const SliderPreviewCard = ({ image, onUpload }) => (
  <div className="border border-[#1B1717]/80 rounded-[14px] p-4 flex flex-col justify-between h-[527px]">
    {image ? (
      <img
        src={image}
        alt="Slider Preview"
        className="max-h-[420px] object-contain mx-auto"
      />
    ) : (
      <p className="text-sm text-center text-[#1B1717]/60">No slider image</p>
    )}

    <button
      disabled={!image}
      onClick={onUpload}
      className={`mt-3 px-4 py-2 rounded-[4px] font-[Gilroy-Medium] text-sm
        ${
          image
            ? "bg-[#C5DBFF] text-[#1B1717]"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
    >
      Change Slider
    </button>
  </div>
);

const SliderAddCard = ({ onFileSelect }) => {
  const inputRef = useRef(null);

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5 MB");
      e.target.value = ""; // 👈 ADD HERE
      return;
    }

    onFileSelect?.(file);

    e.target.value = ""; // 👈 ADD HERE
  };

  return (
    <div
      onClick={openFilePicker}
      className="cursor-pointer border-2 border-dashed border-[#1B1717]/80 rounded-[14px] p-6 flex flex-col items-center justify-center text-center h-[527px] hover:bg-gray-50 transition"
    >
      <Plus className="w-10 h-10 text-[#1B1717] mb-2" />

      <p className="text-lg font-[Gilroy-Medium] text-[#1B1717]">
        Add New Slider
      </p>

      <p className="text-xs text-[#1B1717] font-[Gilroy-Medium] mt-1">
        SVG/PNG Format <br />
        Recommended Size: 768px × 674px
      </p>

      <span className="mt-2 p-1 text-[10px] text-[#1B1717] font-[gilroy-regular] bg-[#C5DBFF] border rounded-[4px]">
        Select from the Browser
      </span>

      <p className="text-sm text-[#1B1717]/80 font-[gilroy-regular] mt-1">
        File Size (Max 5 MB)
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/svg+xml"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
};

const SliderPreview = () => (
  <div className="border border-[#1B1717]/80 rounded-[14px] h-[527px]" />
);

const Settings = ({ onBack }) => {
  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);
  const [sliderPreviews, setSliderPreviews] = useState([]);

  const handleLogoUpload = (file) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      if (img.width !== 32 || img.height !== 32) {
        alert("Logo must be exactly 32 × 32 pixels");
        URL.revokeObjectURL(url);
        return;
      }

      setLogoPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    };

    img.src = url;
  };

  const handleFaviconUpload = (file) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      if (img.width !== 16 || img.height !== 16) {
        alert("Favicon must be exactly 16 × 16 pixels");
        URL.revokeObjectURL(url);
        return;
      }

      setFaviconPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    };

    img.src = url;
  };

  const handleSliderSelect = (file) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      if (img.width !== 768 || img.height !== 674) {
        alert("Slider image must be exactly 768 × 674 pixels");
        URL.revokeObjectURL(url);
        return;
      }

      setSliderPreviews((prev) => {
        if (prev.length === 3) URL.revokeObjectURL(prev[0]);
        return [...prev, url].slice(0, 3);
      });
    };

    img.src = url;
  };

  const uploadLogoAPI = () => {
    console.log("Upload logo API call");
  };

  const uploadFaviconAPI = () => {
    console.log("Upload favicon API call");
  };

  const uploadSliderAPI = (index) => {
    console.log("Upload slider API call for index:", index);
  };

  return (
    <div className="px-1 py-4 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={onBack || (() => globalThis.history?.back())}
          className="rounded-full p-2 bg-white border border-gray-400"
        >
          <HiArrowLeft className="text-xl text-gray-600" />
        </button>
        <h1 className="text-xl md:text-2xl font-[Gilroy-Medium] text-[#1B1717]">
          Settings
        </h1>
      </div>

      {/* Upload Logo */}
      <div className="bg-white rounded-3xl shadow-sm p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl md:text-2xl font-[Gilroy-Medium] text-[#1B1717] mb-3">
              Upload Logo
            </h3>
            <UploadCard
              onFileSelect={handleLogoUpload}
              recommendedSize="32px × 32px"
            />
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-[Gilroy-Medium] text-[#1B1717] mb-3">
              Preview Logo
            </h3>
            <PreviewCard
              image={logoPreview}
              buttonLabel="Change Logo"
              onUpload={uploadLogoAPI}
            />
          </div>
        </div>
      </div>

      {/* Upload Favicon */}
      <div className="bg-white rounded-3xl shadow-sm p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl md:text-2xl font-[Gilroy-Medium] text-[#1B1717] mb-3">
              Upload Fevicons
            </h3>
            <UploadCard
              onFileSelect={handleFaviconUpload}
              recommendedSize="16px × 16px"
            />
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-[Gilroy-Medium] text-[#1B1717] mb-3">
              Preview Fevicons
            </h3>
            <PreviewCard
              image={faviconPreview}
              buttonLabel="Change Favicon"
              onUpload={uploadFaviconAPI}
            />
          </div>
        </div>
      </div>

      {/* Upload Sliders */}
      <div className="bg-white rounded-3xl shadow-sm p-5">
        <h3 className="text-xl md:text-2xl font-[Gilroy-Medium] text-[#1B1717] mb-4">
          Upload Sliders
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* Select new slider */}
          <SliderAddCard onFileSelect={handleSliderSelect} />

          {/* Preview sliders */}
          {[0, 1, 2].map((i) => (
            <SliderPreviewCard
              key={i}
              image={sliderPreviews[i]}
              onUpload={() => uploadSliderAPI(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

Settings.propTypes = {
  onBack: PropTypes.func,
};

export default Settings;
