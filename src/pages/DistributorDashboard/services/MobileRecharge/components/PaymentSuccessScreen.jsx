import { useRef } from "react";
import PropTypes from "prop-types";
import jsPDF from "jspdf";

const PaymentSuccessScreen = ({
  transactionDetails,
  mobileNumber,
  selectedPlanForRecharge,
}) => {
  const receiptRef = useRef(null);

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = margin;

    // Title
    doc.setFontSize(20);
    doc.setTextColor(3, 145, 85); // #039155
    doc.text("Payment Receipt", pageWidth / 2, yPos, { align: "center" });
    yPos += 15;

    // Success message
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Your Payment Has Been Completed", pageWidth / 2, yPos, {
      align: "center",
    });
    yPos += 15;

    // Amount box
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    const boxWidth = 60;
    const boxHeight = 15;
    const boxX = (pageWidth - boxWidth) / 2;
    doc.rect(boxX, yPos - 10, boxWidth, boxHeight);
    doc.setFontSize(18);
    doc.setFont(undefined, "bold");
    doc.text(`₹ ${transactionDetails.amount}`, pageWidth / 2, yPos, {
      align: "center",
    });
    yPos += 20;

    // Transaction Details
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    const details = [
      {
        label: "Transaction ID",
        value: transactionDetails.transactionId || "N/A",
      },
      {
        label: "Mobile Number",
        value: transactionDetails.number || mobileNumber,
      },
      {
        label: "Transaction Status",
        value: transactionDetails.status || "Success",
      },
      { label: "Validity", value: selectedPlanForRecharge?.validity || "N/A" },
      {
        label: "B-Connect Transaction ID",
        value: transactionDetails.bConnectId || "N/A",
      },
      { label: "Order ID", value: transactionDetails.orderid || "N/A" },
      { label: "Date", value: transactionDetails.dateTime || "N/A" },
    ];

    details.forEach((detail, index) => {
      if (index % 2 === 0 && index > 0) {
        yPos += 8;
      }
      const xPos = index % 2 === 0 ? margin : pageWidth / 2 + 5;

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(detail.label + ":", xPos, yPos);

      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, "bold");
      doc.text(detail.value, xPos, yPos + 5);

      if (index % 2 === 1) {
        yPos += 12;
      }
    });

    return doc;
  };

  const handleDownload = () => {
    const doc = generatePDF();
    const fileName = `Recharge_Receipt_${transactionDetails.orderid || Date.now()}.pdf`;
    doc.save(fileName);
  };

  const handleShare = async () => {
    try {
      const doc = generatePDF();
      const pdfBlob = doc.output("blob");
      const file = new File(
        [pdfBlob],
        `Recharge_Receipt_${transactionDetails.orderid || Date.now()}.pdf`,
        {
          type: "application/pdf",
        },
      );

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: "Recharge Receipt",
          text: "Mobile Recharge Payment Receipt",
          files: [file],
        });
      } else {
        // Fallback: download if share is not available
        handleDownload();
      }
    } catch (error) {
      console.error("Error sharing:", error);
      // Fallback to download
      handleDownload();
    }
  };

  return (
    <div className="bg-green-100 rounded-xl relative overflow-hidden max-w-md mx-auto">
      {/* Notches */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-10 bg-[#FAFAFA] rounded-b-full"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-10 bg-[#FAFAFA] rounded-t-full"></div>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-16 w-10 bg-[#FAFAFA] rounded-r-full"></div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-16 w-10 bg-[#FAFAFA] rounded-l-full"></div>

      <div className="relative z-10 pt-12 pb-12 px-12" ref={receiptRef}>
        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-full bg-[#039155] flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-[20px] font-['Gilroy-SemiBold'] text-[#1B1717]">
            Payment Successful
          </h2>
          <p className="text-[12px] text-[#1B1717]/80">
            Your Payment Has Been Completed
          </p>
        </div>

        {/* Amount */}
        <div className="border-2 border-dashed border-[#1B1717] rounded-lg p-3 text-center mb-5">
          <div className="text-[24px] font-['Gilroy-SemiBold'] text-[#1B1717]">
            ₹ {transactionDetails.amount}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-20">
          <div>
            <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
              Transaction ID
            </div>
            <div className="font-['Gilroy-Medium'] text-[#1B1717] text-sm">
              {transactionDetails.transactionId || "N/A"}
            </div>
          </div>

          <div>
            <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
              Mobile Number
            </div>
            <div className="font-['Gilroy-Medium'] text-sm">
              {transactionDetails.number || mobileNumber}
            </div>
          </div>

          <div>
            <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
              Transaction Status
            </div>
            <div className="font-['Gilroy-Medium'] text-[#039155]">
              {transactionDetails.status || "Success"}
            </div>
          </div>

          <div>
            <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
              Validity
            </div>
            <div className="font-['Gilroy-Medium']">
              {selectedPlanForRecharge?.validity || "N/A"}
            </div>
          </div>

          <div>
            <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
              B-Connect Transaction ID
            </div>
            <div className="font-['Gilroy-Medium']">
              {transactionDetails.bConnectId || "N/A"}
            </div>
          </div>

          <div>
            <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
              Order ID
            </div>
            <div className="font-['Gilroy-Medium']">
              {transactionDetails.orderid || "N/A"}
            </div>
          </div>

          <div>
            <div className="text-[#1B1717]/80 text-[11px]">Date</div>
            <div className="font-['Gilroy-Medium']">
              {transactionDetails.dateTime || "N/A"}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="absolute left-5 right-5 bottom-2 flex gap-28">
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 border border-[#039155] rounded-lg py-2 text-sm text-[#039155] font-['Gilroy-Medium'] hover:bg-[#039155] hover:text-white transition"
          >
            Share
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 bg-[#039155] text-white rounded-lg py-2 text-sm font-['Gilroy-semibold'] hover:bg-[#027a44] transition"
          >
            Download Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

PaymentSuccessScreen.propTypes = {
  transactionDetails: PropTypes.object.isRequired,
  mobileNumber: PropTypes.string.isRequired,
  selectedPlanForRecharge: PropTypes.object,
};

export default PaymentSuccessScreen;
