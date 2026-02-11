function DigilockerPanVerification() {
  return (
    <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-lg p-6 text-center">
        {/* Icon Container */}
        <div className="flex justify-center mb-5">
          <div className="w-40 h-40 flex items-center justify-center border-2 border-dashed border-[#574AE2] rounded-[50px]">
            <img
              src="/img/verification.png" // replace with your actual icon path
              alt="Verification"
              className="w-20 h-20 object-contain"
            />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg md:text-xl font-[grift-bold] text-[#1B1717] mb-3">
          Verification In Progress
        </h3>

        {/* Description */}
        <p className="text-sm md:text-base font-[grift-regular] text-gray-600 leading-relaxed">
          Please Go To Your Mobile App And Click{" "}
          <span className="text-[#574AE2] font-[grift-medium]">Connect</span> To
          Upload Your{" "}
          <span className="text-[#574AE2] font-[grift-medium]">Pan</span>{" "}
          Documents
        </p>
      </div>
    </div>
  );
}

export default DigilockerPanVerification;
