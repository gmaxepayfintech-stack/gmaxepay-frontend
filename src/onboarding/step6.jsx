function Step6({ formData, setFormData, onNext }) {
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(d => ({ ...d, [name]: value }));
  };

  return (
    <form className="space-y-5" onSubmit={e => e.preventDefault()}>
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-2">Bank Details</h3>
        <p className="text-sm text-gray-600 mb-4">Enter your bank account details.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Bank Account Number</label>
            <input
              type="text"
              name="bankAccountNumber"
              value={formData.bankAccountNumber || ''}
              onChange={handleChange}
              placeholder="Enter bank account number"
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">IFSC Code</label>
            <input
              type="text"
              name="ifscCode"
              value={formData.ifscCode || ''}
              onChange={handleChange}
              placeholder="Enter IFSC code"
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex items-center justify-end">
            <button type="button" onClick={onNext} className="bg-blue-600 text-white px-4 py-2 rounded">Next</button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default Step6;

