function Step4({ formData, setFormData, onNext }) {
  const fetchPanFromDigilocker = () => {
    setFormData(d => {
      const updated = { ...d, panDocFetched: true };
      if (updated.panDocFetched && updated.aadhaarDocFetched) {
        updated.digilockerLinked = true;
      }
      return updated;
    });
  };

  return (
    <form className="space-y-5" onSubmit={e => e.preventDefault()}>
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-2">PAN Card Verification</h3>
        <p className="text-sm text-gray-600 mb-4">Fetch PAN document securely from your DigiLocker.</p>
        <div className="flex items-center gap-2 text-purple-700 mb-4">
          <img src="/img/digilocker.png" alt="DigiLocker" className="h-6 w-auto" />
          <div className="font-medium">PAN via DigiLocker</div>
        </div>
        <button
          type="button"
          onClick={fetchPanFromDigilocker}
          className={"px-6 py-2 rounded-lg border font-medium "+(formData.panDocFetched?"border-green-600 text-green-700 bg-white":"border-purple-600 text-purple-700 bg-white")}
        >{formData.panDocFetched?"Added ✓":"Add to DigiLocker"}</button>
        <div className="flex items-center justify-end mt-6">
          <button type="button" onClick={onNext} className="bg-blue-600 text-white px-4 py-2 rounded" disabled={!formData.panDocFetched}>Next</button>
        </div>
      </div>
    </form>
  );
}

export default Step4;

