import React from "react";
import { Upload, Plus } from "lucide-react";
import { HiArrowLeft } from "react-icons/hi2";
import PropTypes from "prop-types";

const UploadCard = () => (
  <div className="border-2 border-dashed border-[#1B1717]/80 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-[249px]">
    <Upload className="w-8 h-8 text-[#1B1717] mb-2" />
    <p className="text-lg text-[#1B1717] font-[gilroy-medium] mb-1">
      Click To Upload
    </p>
    <p className="text-sm text-[#1B1717]/80 font-[gilroy-medium]">
      SVG,PNG Format <br />
      Recommended Size: 32px x 32px
    </p>
    <button className="mt-2 p-1 text-[10px] text-[#1B1717] font-[gilroy-regular] bg-[#C5DBFF] border rounded-[4px] hover:underline">
      Select from the Browser
    </button>
    <p className="text-sm text-[#1B1717]/80 font-[gilroy-regular] mt-1">
      File Size (Max 5 MB)
    </p>
  </div>
);

const PreviewCard = ({ label }) => (
  <div className="border-2 border-dashed border-[#1B1717]/80 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-[249px]">
    <button className="px-4 py-2 bg-[#C5DBFF] text-[#1B1717] rounded-[4px] font-[gilroy-medium] text-sm hover:bg-blue-200 transition mt-auto">
      {label}
    </button>
  </div>
);

const SliderAddCard = () => (
  <div className="border-2 border-dashed border-[#1B1717]/80 rounded-[14px] p-6 flex flex-col items-center justify-center text-center h-[527px]">
    <Plus className="w-10 h-10 text-[#1B1717] mb-2" />
    <p className="text-lg font-[gilroy-medium] text-[#1B1717]">
      Add New Slider
    </p>
    <p className="text-xs text-[#1B1717] font-[gilroy-medium] mt-1">
      SVG/PNG Format <br />
      Recommended Size: 32px x 32px
    </p>
    <button className="mt-2 p-1 text-[10px] text-[#1B1717] font-[gilroy-regular] bg-[#C5DBFF] border rounded-[4px] hover:underline">
      Select from the Browser
    </button>
    <p className="text-sm text-[#1B1717]/80 font-[gilroy-regular] mt-1">
      File Size (Max 5 MB)
    </p>
  </div>
);

const SliderPreview = () => (
  <div className="border border-[#1B1717]/80 rounded-[14px] h-[527px]" />
);

const Settings = ({ onBack }) => {
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
            <h3 className="text-2xl font-[gilroy-medium] text-[#1B1717] mb-3">
              Upload Logo
            </h3>
            <UploadCard />
          </div>

          <div>
            <h3 className="text-2xl font-[gilroy-medium] text-[#1B1717] mb-3">
              Preview Logo
            </h3>
            <PreviewCard label="Change Logo" />
          </div>
        </div>
      </div>

      {/* Upload Favicon */}
      <div className="bg-white rounded-3xl shadow-sm p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-2xl font-[gilroy-medium] text-[#1B1717] mb-3">
              Upload Fevicons
            </h3>
            <UploadCard />
          </div>

          <div>
            <h3 className="text-2xl font-[gilroy-medium] text-[#1B1717] mb-3">
              Preview Fevicons
            </h3>
            <PreviewCard label="Change Fevicon" />
          </div>
        </div>
      </div>

      {/* Upload Sliders */}
      <div className="bg-white rounded-3xl shadow-sm p-5">
        <h3 className="text-2xl font-[gilroy-medium] text-[#1B1717] mb-4">
          Upload Sliders
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <SliderAddCard />
          <SliderPreview />
          <SliderPreview />
          <SliderPreview />
        </div>
      </div>
    </div>
  );
};

Settings.propTypes = {
  onBack: PropTypes.func,
};

export default Settings;
