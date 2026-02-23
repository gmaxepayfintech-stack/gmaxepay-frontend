import { Upload, Plus, Trash2 } from "lucide-react";
import { HiArrowLeft } from "react-icons/hi2";
import PropTypes from "prop-types";
import React, { useRef, useState, useEffect } from "react";
import { uploadFeviicon, getCompanySettingImages } from "../../redux/action/walletAction";
import { useDispatch, useSelector } from "react-redux";
import { useNotification } from "../../context/NotificationContext";
import { useCompany } from "../../context/CompanyContext";
import { deleteCompanySettingSlider } from "../../redux/action/walletAction";

const UploadCard = ({ onFileSelect, image, label, isUploading }) => {
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
      className="cursor-pointer border-2 border-dashed border-[#1B1717]/80 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-[249px] hover:bg-gray-50 transition relative overflow-hidden"
    >
      {isUploading && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-[#039155] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-[Gilroy-Medium] text-[#1B1717]">Uploading...</p>
          </div>
        </div>
      )}

      {image ? (
        <div className="flex flex-col items-center gap-3">
          <img
            src={image}
            alt="Preview"
            className="max-h-[160px] max-w-full object-contain"
          />
          <span className="text-xs text-[#1B1717]/60 font-[Gilroy-Medium]">
            Click to change
          </span>
        </div>
      ) : (
        <>
          <Upload className="w-8 h-8 text-[#1B1717] mb-2" />

          <p className="text-lg text-[#1B1717] font-[Gilroy-Medium] mb-1">
            {label || "Click To Upload"}
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
        </>
      )}

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
  image: PropTypes.string,
  label: PropTypes.string,
  isUploading: PropTypes.bool,
};

const PreviewCard = ({ image, label }) => (
  <div className="border border-gray-200 rounded-2xl p-4 h-[249px] flex flex-col bg-gray-50/30">
    <p className="text-sm text-[#1B1717]/60 font-[Gilroy-Medium] mb-2">{label}</p>
    <div className="flex-1 flex items-center justify-center overflow-hidden">
      {image ? (
        <img
          src={image}
          alt="Current"
          className="max-h-[160px] max-w-full object-contain drop-shadow-sm"
        />
      ) : (
        <p className="text-sm text-[#1B1717]/40 font-[Gilroy-Medium]">No active image</p>
      )}
    </div>
  </div>
);

PreviewCard.propTypes = {
  image: PropTypes.string,
  label: PropTypes.string,
};

const SliderPreviewCard = ({ image, onDelete, isUploading }) => (
  <div className="border border-[#1B1717]/80 rounded-[14px] p-4 flex flex-col justify-center h-[527px] relative group">
    {isUploading && (
      <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 backdrop-blur-sm rounded-[14px]">
        <div className="w-8 h-8 border-4 border-[#039155] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )}

    {image ? (
      <img
        src={image}
        alt="Slider Preview"
        className="max-h-[480px] w-full object-contain mx-auto rounded-lg"
      />
    ) : (
      <p className="text-sm text-center text-[#1B1717]/60 font-[Gilroy-Medium]">
        No slider image
      </p>
    )}

    {/* Delete Icon Overlay */}
    <div className="absolute top-4 right-4 translate-x-1 translate-y--1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete?.();
        }}
        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
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
  const [selectedLogoPreview, setSelectedLogoPreview] = useState(null);
  const [selectedFaviconPreview, setSelectedFaviconPreview] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [existingSliders, setExistingSliders] = useState([]);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [isFaviconUploading, setIsFaviconUploading] = useState(false);
  const [isSliderUploading, setIsSliderUploading] = useState(false);

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

  // Sync state with fetched images (Right side - Current)
  useEffect(() => {
    if (companySettingImages.length > 0) {
      const logo = companySettingImages.find(
        (img) => img.type === "signature" && img.subtype === "logo",
      );
      if (logo) setLogoPreview(logo.image);

      const favicon = companySettingImages.find(
        (img) => img.type === "signature" && img.subtype === "favicon",
      );
      if (favicon) setFaviconPreview(favicon.image);

      const sliders = companySettingImages.filter(
        (img) => img.type === "loginSlider",
      );
      setExistingSliders(sliders);
    }
  }, [companySettingImages]);

  const handleLogoUpload = (file) => {
    setSelectedLogoPreview(URL.createObjectURL(file));
    uploadLogoAPI(file);
  };

  const handleFaviconUpload = (file) => {
    setSelectedFaviconPreview(URL.createObjectURL(file));
    uploadFaviconAPI(file);
  };

  const handleSliderSelect = (file) => {
    uploadSliderAPI(file);
  };

  const uploadLogoAPI = async (file) => {
    if (!file) return;
    setIsLogoUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("name", file.name);
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
        refreshCompany();
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
        message: error?.response?.data?.message || error?.message || "Unexpected error.",
        isCritical: true,
      });
    } finally {
      setIsLogoUploading(false);
    }
  };

  const uploadFaviconAPI = async (file) => {
    if (!file) return;
    setIsFaviconUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("name", file.name);
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
        refreshCompany();
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
        message: error?.response?.data?.message || error?.message || "Unexpected error.",
        isCritical: true,
      });
    } finally {
      setIsFaviconUploading(false);
    }
  };

  const uploadSliderAPI = async (file) => {
    if (!file) return;
    setIsSliderUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("name", file.name);
    formData.append("type", "loginSlider");

    try {
      const response = await dispatch(uploadFeviicon(formData));
      if (response?.status === "SUCCESS") {
        showNotification({
          type: "success",
          message: response.message || "Slider uploaded successfully!",
          isCritical: false,
        });
        refreshCompany();
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
        message: error?.response?.data?.message || error?.message || "Unexpected error.",
        isCritical: true,
      });
    } finally {
      setIsSliderUploading(false);
    }
  };

  const handleDeleteSlider = async (id) => {
    if (!id) return;

    try {
      const response = await dispatch(deleteCompanySettingSlider(id));
      if (response?.status === "SUCCESS") {
        showNotification({
          type: "success",
          message: response.message || "Slider deleted successfully!",
        });
        refreshCompany();
        // Refresh local image list after success
        dispatch(getCompanySettingImages({
          query: { isActive: true },
          options: { order: [["createdAt", "DESC"]], limit: 10, offset: 0 }
        }));
      } else {
        showNotification({
          type: "error",
          message: response?.message || "Failed to delete slider.",
        });
      }
    } catch (error) {
      console.error("Delete error:", error);
      showNotification({
        type: "error",
        message: error?.response?.data?.message || error?.message || "An unexpected error occurred while deleting slider.",
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
        <h3 className="text-xl md:text-2xl font-[Gilroy-Medium] text-[#1B1717] mb-4">
          Logo Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UploadCard
            image={selectedLogoPreview}
            label="Click to Upload Logo"
            onFileSelect={handleLogoUpload}
            isUploading={isLogoUploading}
          />
          <PreviewCard
            image={logoPreview}
            label="Current Active Logo"
          />
        </div>
      </div>

      {/* Upload Favicon */}
      <div className="bg-white rounded-3xl shadow-sm p-5">
        <h3 className="text-xl md:text-2xl font-[Gilroy-Medium] text-[#1B1717] mb-4">
          Favicon Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UploadCard
            image={selectedFaviconPreview}
            label="Click to Upload Favicon"
            onFileSelect={handleFaviconUpload}
            isUploading={isFaviconUploading}
          />
          <PreviewCard
            image={faviconPreview}
            label="Current Active Favicon"
          />
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

          {/* EXISTING sliders from API */}
          {existingSliders.map((slider) => (
            <SliderPreviewCard
              key={`existing-${slider.id}`}
              image={slider.image}
              onDelete={() => handleDeleteSlider(slider.id)}
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
