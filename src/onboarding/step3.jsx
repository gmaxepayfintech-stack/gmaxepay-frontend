function Step3({ formData, setFormData, onNext }) {
  const fetchAadhaarFromDigilocker = () => {
    setFormData(d => {
      const updated = { ...d, aadhaarDocFetched: true };
      if (updated.panDocFetched && updated.aadhaarDocFetched) {
        updated.digilockerLinked = true;
      }
      return updated;
    });
  };

  return (
    <form className="space-y-5" onSubmit={e => e.preventDefault()}>
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-2">Aadhar Card Verification</h3>
        <p className="text-sm text-gray-600 mb-4">Fetch Aadhaar document securely from your DigiLocker.</p>
        <div className="flex items-center gap-2 text-purple-700 mb-4">
          <img src="/img/digilocker.png" alt="DigiLocker" className="h-6 w-auto" />
          <div className="font-medium">Aadhaar via DigiLocker</div>
        </div>
        <button
          type="button"
          onClick={fetchAadhaarFromDigilocker}
          className={"px-6 py-2 rounded-lg border font-medium "+(formData.aadhaarDocFetched?"border-green-600 text-green-700 bg-white":"border-purple-600 text-purple-700 bg-white")}
        >{formData.aadhaarDocFetched?"Added ✓":"Add to DigiLocker"}</button>
        <div className="flex items-center justify-end mt-6">
          <button type="button" onClick={onNext} className="bg-blue-600 text-white px-4 py-2 rounded" disabled={!formData.aadhaarDocFetched}>Next</button>
        </div>
      </div>
    </form>
  );
}

export default Step3;

