import { useRef } from "react";
import PropTypes from "prop-types";
import jsPDF from "jspdf";
import { useCompany } from "../../../../context/CompanyContext";

const PaymentSuccessScreen = ({
  transactionDetails,
  mobileNumber,
  selectedPlanForRecharge,
}) => {
  const receiptRef = useRef(null);
  const { company } = useCompany();

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const headerHeight = 50;
    let yPos = margin;

    // Brand color
    const brandColor = [3, 145, 85]; // #039155
    const lightGray = [240, 240, 240];
    const darkGray = [51, 51, 51];
    const textGray = [102, 102, 102];

    // Header with brand color background
    doc.setFillColor(...brandColor);
    doc.rect(0, 0, pageWidth, headerHeight, "F");

    // Company name or logo area
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont(undefined, "bold");
    const companyName = company?.companyName || "GMAXEPAY";
    doc.text(companyName, margin, 20, { align: "left" });

    // Invoice title
    doc.setFontSize(16);
    doc.setFont(undefined, "normal");
    doc.text("Payment Invoice", pageWidth - margin, 20, { align: "right" });

    // Success badge
    yPos = headerHeight + 15;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...brandColor);
    doc.setLineWidth(0.5);
    const badgeWidth = 40;
    const badgeHeight = 12;
    const badgeX = pageWidth - margin - badgeWidth;
    doc.rect(badgeX, yPos - 8, badgeWidth, badgeHeight, "FD");
    doc.setTextColor(...brandColor);
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("✓ SUCCESS", badgeX + badgeWidth / 2, yPos - 2, {
      align: "center",
    });

    // Invoice number and date section
    yPos += 20;
    doc.setFontSize(10);
    doc.setTextColor(...textGray);
    doc.setFont(undefined, "normal");
    doc.text("Invoice Number:", margin, yPos);
    doc.setTextColor(...darkGray);
    doc.setFont(undefined, "bold");
    const orderId = transactionDetails.orderid || transactionDetails.data?.orderid || `INV-${Date.now()}`;
    doc.text(
      orderId,
      margin + 35,
      yPos,
    );

    doc.setTextColor(...textGray);
    doc.setFont(undefined, "normal");
    doc.text("Date:", pageWidth - margin - 50, yPos);
    doc.setTextColor(...darkGray);
    doc.setFont(undefined, "bold");
    const dateTime = transactionDetails.dateTime || new Date().toLocaleString();
    doc.text(
      dateTime,
      pageWidth - margin,
      yPos,
      { align: "right" },
    );

    // Divider line
    yPos += 8;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    // Amount highlight box
    yPos += 15;
    const amountBoxWidth = pageWidth - 2 * margin;
    const amountBoxHeight = 30;
    doc.setFillColor(...lightGray);
    doc.setDrawColor(...brandColor);
    doc.setLineWidth(1);
    doc.rect(margin, yPos, amountBoxWidth, amountBoxHeight, "FD");

    // Amount label
    doc.setTextColor(...textGray);
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text("Total Amount Paid", margin + 10, yPos + 8);

    // Amount value - using "Rs." instead of ₹ symbol for better PDF compatibility
    doc.setTextColor(...brandColor);
    doc.setFontSize(24);
    doc.setFont(undefined, "bold");
    const amount = transactionDetails.amount || 
                   transactionDetails.apiResponse?.amount || 
                   transactionDetails.data?.apiResponse?.amount || 
                   "0.00";
    doc.text(
      `Rs. ${amount}`,
      margin + 10,
      yPos + 22,
    );

    // Transaction Details Section
    yPos += amountBoxHeight + 20;

    // Section header
    doc.setFillColor(...brandColor);
    doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.text("Transaction Details", margin + 5, yPos);

    yPos += 15;

    // Extract data from nested structure if needed
    const apiResponse = transactionDetails.apiResponse || transactionDetails.data?.apiResponse || {};
    const txId = transactionDetails.transactionId || apiResponse.txid?.toString() || transactionDetails.data?.apiResponse?.txid?.toString() || "N/A";
    const bConnectId = transactionDetails.bConnectId || apiResponse.opid?.toString() || transactionDetails.data?.apiResponse?.opid?.toString() || "N/A";
    const mobileNum = transactionDetails.number || apiResponse.number || transactionDetails.data?.apiResponse?.number || mobileNumber || "N/A";
    const status = transactionDetails.status || apiResponse.status || transactionDetails.data?.apiResponse?.status || "Success";
    const orderIdValue = transactionDetails.orderid || transactionDetails.data?.orderid || apiResponse.orderid || "N/A";

    // Details grid
    const details = [
      {
        label: "Transaction ID",
        value: txId,
        col: 1,
      },
      {
        label: "B-Connect Transaction ID",
        value: bConnectId,
        col: 2,
      },
      {
        label: "Mobile Number",
        value: mobileNum,
        col: 1,
      },
      {
        label: "Transaction Status",
        value: status,
        col: 2,
      },
      {
        label: "Order ID",
        value: orderIdValue,
        col: 1,
      },
      {
        label: "Validity",
        value: selectedPlanForRecharge?.validity || "N/A",
        col: 2,
      },
    ];

    const col1X = margin + 5;
    const col2X = pageWidth / 2 + 5;
    const rowHeight = 18;

    details.forEach((detail, index) => {
      const currentY = yPos + Math.floor(index / 2) * rowHeight;
      const xPos = detail.col === 1 ? col1X : col2X;

      // Label
      doc.setTextColor(...textGray);
      doc.setFontSize(9);
      doc.setFont(undefined, "normal");
      doc.text(detail.label + ":", xPos, currentY);

      // Value
      doc.setTextColor(...darkGray);
      doc.setFontSize(10);
      doc.setFont(undefined, "bold");
      const valueColor =
        detail.label === "Transaction Status" && detail.value === "Success"
          ? brandColor
          : darkGray;
      doc.setTextColor(...valueColor);
      doc.text(detail.value, xPos, currentY + 6);
    });

    // Date row (full width)
    yPos += Math.ceil(details.length / 2) * rowHeight + 10;
    doc.setTextColor(...textGray);
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.text("Transaction Date & Time:", margin + 5, yPos);
    doc.setTextColor(...darkGray);
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    const transactionDateTime = transactionDetails.dateTime || new Date().toLocaleString();
    doc.text(
      transactionDateTime,
      margin + 50,
      yPos,
    );

    // Footer section
    const footerY = pageHeight - 40;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY, pageWidth - margin, footerY);

    // Footer text
    yPos = footerY + 10;
    doc.setTextColor(...textGray);
    doc.setFontSize(8);
    doc.setFont(undefined, "normal");
    doc.text(
      "This is a computer-generated invoice. No signature is required.",
      pageWidth / 2,
      yPos,
      { align: "center" },
    );

    yPos += 5;
    doc.text(
      `Generated on ${new Date().toLocaleString()}`,
      pageWidth / 2,
      yPos,
      { align: "center" },
    );

    // Thank you message
    yPos = footerY - 25;
    doc.setTextColor(...brandColor);
    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.text("Thank you for your payment!", pageWidth / 2, yPos, {
      align: "center",
    });

    return doc;
  };

  const handleDownload = () => {
    const doc = generatePDF();
    const orderId = transactionDetails.orderid || transactionDetails.data?.orderid || Date.now();
    const fileName = `Invoice_${orderId}.pdf`;
    doc.save(fileName);
  };

  const handleShare = async () => {
    try {
      const doc = generatePDF();
      const pdfBlob = doc.output("blob");
      const orderId = transactionDetails.orderid || transactionDetails.data?.orderid || Date.now();
      const file = new File(
        [pdfBlob],
        `Invoice_${orderId}.pdf`,
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
          title: "Payment Invoice",
          text: "Mobile Recharge Payment Invoice",
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
            ₹ {transactionDetails.amount || transactionDetails.apiResponse?.amount || transactionDetails.data?.apiResponse?.amount || "0.00"}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-20">
          <div>
            <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
              Transaction ID
            </div>
            <div className="font-['Gilroy-Medium'] text-[#1B1717] text-sm">
              {transactionDetails.transactionId || transactionDetails.apiResponse?.txid?.toString() || transactionDetails.data?.apiResponse?.txid?.toString() || "N/A"}
            </div>
          </div>

          <div>
            <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
              Mobile Number
            </div>
            <div className="font-['Gilroy-Medium'] text-sm">
              {transactionDetails.number || transactionDetails.apiResponse?.number || transactionDetails.data?.apiResponse?.number || mobileNumber || "N/A"}
            </div>
          </div>

          <div>
            <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
              Transaction Status
            </div>
            <div className="font-['Gilroy-Medium'] text-[#039155]">
              {transactionDetails.status || transactionDetails.apiResponse?.status || transactionDetails.data?.apiResponse?.status || "Success"}
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
              {transactionDetails.bConnectId || transactionDetails.apiResponse?.opid?.toString() || transactionDetails.data?.apiResponse?.opid?.toString() || "N/A"}
            </div>
          </div>

          <div>
            <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
              Order ID
            </div>
            <div className="font-['Gilroy-Medium']">
              {transactionDetails.orderid || transactionDetails.data?.orderid || transactionDetails.apiResponse?.orderid || "N/A"}
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
