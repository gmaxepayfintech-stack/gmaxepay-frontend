import { Upload, Plus } from "lucide-react";
import { HiArrowLeft } from "react-icons/hi2";
import PropTypes from "prop-types";
import React, { useRef, useState, useEffect } from "react";
import { uploadFeviicon, getCompanySettingImages } from "../../redux/action/walletAction";
import { useDispatch, useSelector } from "react-redux";
import { useNotification } from "../../context/NotificationContext";
import { useCompany } from "../../context/CompanyContext";

const UploadCard = ({ onFileSelect }) => {
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
        SVG, PNG Format
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
    ${image
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
        ${image
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
        SVG/PNG Format
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
  const dispatch = useDispatch();
  const { showNotification } = useNotification();
  const { refreshCompany } = useCompany();

  // Get images from Redux
  const companySettingImages = useSelector(
    (state) => state?.wallet?.companySettingImages?.data || [],
  );

  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [sliderPreviews, setSliderPreviews] = useState([]);
  const [existingSliders, setExistingSliders] = useState([]);

  // Fetch existing images on mount
  useEffect(() => {
    const payload = {
      query: { isActive: true },
      options: {
        order: [["createdAt", "DESC"]],
        limit: 10,
        offset: 0,
      },
    };
    dispatch(getCompanySettingImages(payload));
  }, [dispatch]);

  // Sync state with fetched images
  useEffect(() => {
    if (companySettingImages.length > 0) {
      // Set logo if not manually selected
      if (!logoFile) {
        const logo = companySettingImages.find(
          (img) => img.type === "signature" && img.subtype === "logo",
        );
        if (logo) setLogoPreview(logo.image);
      }

      // Set favicon if not manually selected
      if (!faviconFile) {
        const favicon = companySettingImages.find(
          (img) => img.type === "signature" && img.subtype === "favicon",
        );
        if (favicon) setFaviconPreview(favicon.image);
      }

      // Filter existing sliders
      const sliders = companySettingImages.filter(
        (img) => img.type === "loginSlider",
      );
      setExistingSliders(sliders);
    }
  }, [companySettingImages, logoFile, faviconFile]);

  const handleLogoUpload = (file) => {
    const url = URL.createObjectURL(file);
    setLogoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setLogoFile(file);
  };

  const handleFaviconUpload = (file) => {
    const url = URL.createObjectURL(file);
    setFaviconPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setFaviconFile(file);
  };

  const handleSliderSelect = (file) => {
    const url = URL.createObjectURL(file);
    setSliderPreviews((prev) => {
      const newPreviews = [...prev];
      // Only keep up to 3 previews and always append to end or fill empty slot if we were tracking slots
      // For now, simpler to just append
      if (newPreviews.length < 3) {
        return [...newPreviews, { file, url }];
      }
      return newPreviews;
    });
  };

  const uploadLogoAPI = async () => {
    if (!logoFile) return;

    const formData = new FormData();
    formData.append("image", logoFile);
    formData.append("name", logoFile.name);
    formData.append("type", "signature");
    formData.append("subtype", "logo");

    try {
      const response = await dispatch(uploadFeviicon(formData));
      if (response?.status === "SUCCESS") {
        showNotification({
          type: "success",
          message: response.message || "Logo uploaded successfully!",
          isCritical: true,
        });
        setLogoPreview(null);
        setLogoFile(null);
        refreshCompany();
        // Refresh local image list after success
        dispatch(getCompanySettingImages({
          query: { isActive: true },
          options: { order: [["createdAt", "DESC"]], limit: 10, offset: 0 }
        }));
      } else {
        showNotification({
          type: "error",
          message: response?.message || "Failed to upload logo.",
          isCritical: true,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      showNotification({
        type: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "An unexpected error occurred while uploading company details.",
        isCritical: true,
      });
    }
  };



  const uploadFaviconAPI = async () => {
    if (!faviconFile) return;

    const formData = new FormData();
    formData.append("image", faviconFile);
    formData.append("name", faviconFile.name);
    formData.append("type", "signature");
    formData.append("subtype", "favicon");

    try {
      const response = await dispatch(uploadFeviicon(formData));
      if (response?.status === "SUCCESS") {
        showNotification({
          type: "success",
          message: response.message || "Favicon uploaded successfully!",
          isCritical: false,
        });
        setFaviconPreview(null);
        setFaviconFile(null);
        refreshCompany();
        // Refresh local image list after success
        dispatch(getCompanySettingImages({
          query: { isActive: true },
          options: { order: [["createdAt", "DESC"]], limit: 10, offset: 0 }
        }));
      } else {
        showNotification({
          type: "error",
          message: response?.message || "Failed to upload favicon.",
          isCritical: true,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      showNotification({
        type: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "An unexpected error occurred while uploading company details.",
        isCritical: true,
      });
    }
  };

  const uploadSliderAPI = async (index) => {
    const sliderItem = sliderPreviews[index];
    if (!sliderItem?.file) return;

    const formData = new FormData();
    formData.append("image", sliderItem.file);
    formData.append("name", sliderItem.file.name);
    // As per request: type: loginSlider
    formData.append("type", "loginSlider");
    // subtype might not be needed for slider if type is loginSlider, but keeping consistency if needed or omitting if strictly following "send attributes name, type: loginSlider, image"
    // The user request said: "send the attributes name, type: loginSlider, image"

    try {
      const response = await dispatch(uploadFeviicon(formData));
      if (response?.status === "SUCCESS") {
        showNotification({
          type: "success",
          message: response.message || "Slider uploaded successfully!",
          isCritical: false,
        });

        // Remove the uploaded slider from preview list or update its status? 
        // For now, let's remove it to allow new uploads
        setSliderPreviews(prev => prev.filter((_, i) => i !== index));

        refreshCompany();
        // Refresh local image list after success
        dispatch(getCompanySettingImages({
          query: { isActive: true },
          options: { order: [["createdAt", "DESC"]], limit: 10, offset: 0 }
        }));
      } else {
        showNotification({
          type: "error",
          message: response?.message || "Failed to upload slider.",
          isCritical: true,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      showNotification({
        type: "error",
        message: error?.response?.data?.message || error?.message || "An unexpected error occurred while uploading slider.",
        isCritical: true,
      });
    }
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
            <UploadCard onFileSelect={handleLogoUpload} />
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
            <UploadCard onFileSelect={handleFaviconUpload} />
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

          {/* NEW slider Previews */}
          {sliderPreviews.map((preview, i) => (
            <SliderPreviewCard
              key={`new-${i}`}
              image={preview.url}
              onUpload={() => uploadSliderAPI(i)}
            />
          ))}

          {/* EXISTING sliders from API */}
          {existingSliders.map((slider) => (
            <SliderPreviewCard
              key={`existing-${slider.id}`}
              image={slider.image}
              onUpload={() => { }} // Existing ones don't need upload
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
