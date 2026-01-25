import { useRef } from "react";
import PropTypes from "prop-types";
import jsPDF from "jspdf";
import { useCompany } from "../../../../../context/CompanyContext";
import { getOperatorLogo } from "../utils";

const PaymentSuccessScreen = ({ transactionDetails, mobileNumber, selectedPlanForRecharge, selectedOperator }) => {
  const receiptRef = useRef(null);
  const { company } = useCompany();

  const getCurrentDateTime = () => {
    let date;
    if (transactionDetails.dateTime) {
      // If dateTime is already a formatted string, try to parse it
      if (typeof transactionDetails.dateTime === 'string') {
        date = new Date(transactionDetails.dateTime);
        // If parsing failed, return the original string
        if (isNaN(date.getTime())) {
          return transactionDetails.dateTime;
        }
      } else {
        date = new Date(transactionDetails.dateTime);
      }
    } else {
      date = new Date();
    }
    
    // Format: "25 January 2026 at 07:35:15 pm"
    const day = date.getDate();
    const month = date.toLocaleString("en-IN", { month: 'long' });
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    const displayHours = (hours % 12 || 12).toString().padStart(2, '0');
    
    return `${day} ${month} ${year} at ${displayHours}:${minutes}:${seconds} ${ampm}`;
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    // Extract data from nested structure
    const apiResponse = transactionDetails.apiResponse || transactionDetails.data?.apiResponse || {};
    const orderId = transactionDetails.orderid || transactionDetails.data?.orderid || "N/A";
    const txId = transactionDetails.transactionId || apiResponse.txid?.toString() || "N/A";
    const refId = transactionDetails.bConnectId || apiResponse.opid?.toString() || "N/A";
    const mobileNum = transactionDetails.number || apiResponse.number || mobileNumber || "N/A";
    const amount = transactionDetails.amount || apiResponse.amount || "0.00";
    const status = transactionDetails.status || apiResponse.status || "Success";
    const dateTime = getCurrentDateTime();

    // Get operator name and logo
    const operatorName = selectedOperator?.name || selectedPlanForRecharge?.operator || "OPERATOR";
    const operatorLogoPath = getOperatorLogo(operatorName);

    // Header with logos
    const logoSize = 24;
    const logoY = margin;
    
    // Left side - Operator logo placeholder
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(margin, logoY, logoSize, logoSize, "D");
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, "bold");
    doc.text("OPERATOR", margin + logoSize / 2, logoY + logoSize / 2, { align: "center" });

    // Right side - Company logo placeholder
    const companyLogoX = pageWidth - margin - logoSize;
    doc.rect(companyLogoX, logoY, logoSize, logoSize, "D");
    doc.text("YOUR LOGO", companyLogoX + logoSize / 2, logoY + logoSize / 2, { align: "center" });

    // Try to load and add company logo if available
    if (company?.logo) {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = company.logo;
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("Timeout loading company logo"));
          }, 3000);
          
          img.onload = () => {
            clearTimeout(timeout);
            try {
              const format = company.logo.toLowerCase().endsWith('.svg') ? 'SVG' : 'PNG';
              doc.addImage(img, format, companyLogoX + 2, logoY + 2, logoSize - 4, logoSize - 4);
              resolve();
            } catch (e) {
              reject(e);
            }
          };
          img.onerror = () => {
            clearTimeout(timeout);
            reject(new Error("Failed to load company logo"));
          };
        });
      } catch (e) {
        console.log("Could not load company logo:", e);
        // Continue without logo
      }
    }

    // Try to load operator logo if available
    if (operatorLogoPath) {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = operatorLogoPath;
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("Timeout loading operator logo"));
          }, 3000);
          
          img.onload = () => {
            clearTimeout(timeout);
            try {
              const format = operatorLogoPath.toLowerCase().endsWith('.svg') ? 'SVG' : 'PNG';
              doc.addImage(img, format, margin + 2, logoY + 2, logoSize - 4, logoSize - 4);
              resolve();
            } catch (e) {
              reject(e);
            }
          };
          img.onerror = () => {
            clearTimeout(timeout);
            reject(new Error("Failed to load operator logo"));
          };
        });
      } catch (e) {
        console.log("Could not load operator logo:", e);
        // Continue without logo
      }
    }

    // Divider line after header
    yPos = logoY + logoSize + 10;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.setLineDash([5, 5], 0);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    doc.setLineDash([], 0);

    // Invoice Title
    yPos += 15;
    doc.setFontSize(24);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, "bold");
    doc.text("INVOICE", pageWidth / 2, yPos, { align: "center" });
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Transaction Receipt", pageWidth / 2, yPos, { align: "center" });

    // Divider line after title
    yPos += 10;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.setLineDash([5, 5], 0);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    doc.setLineDash([], 0);

    // Content section
    yPos += 15;
    const tableStartY = yPos;
    const rowHeight = 12;
    const labelWidth = pageWidth * 0.4;
    const valueWidth = pageWidth - 2 * margin - labelWidth;

    // Helper function to draw table row
    const drawRow = (label, value, isLast = false) => {
      // Label cell (left)
      doc.setFillColor(240, 240, 240);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(margin, yPos, labelWidth, rowHeight, "FD");
      
      doc.setFontSize(9);
      doc.setFont(undefined, "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(label, margin + 5, yPos + 8);

      // Value cell (right)
      doc.setFillColor(255, 255, 255);
      doc.rect(margin + labelWidth, yPos, valueWidth, rowHeight, "FD");
      
      doc.setFontSize(9);
      doc.setFont(undefined, "bold");
      doc.setTextColor(51, 51, 51);
      doc.text(value, margin + labelWidth + 5, yPos + 8);

      yPos += rowHeight;
    };

    // Table rows
    drawRow("Order ID", orderId);
    drawRow("Transaction ID", txId);
    drawRow("Ref ID", refId);
    drawRow("Mobile Number", mobileNum);
    
    // Status row with badge
    doc.setFillColor(240, 240, 240);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(margin, yPos, labelWidth, rowHeight, "FD");
    doc.setFontSize(9);
    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Status", margin + 5, yPos + 8);

    // Status badge (black background, white text)
    doc.setFillColor(0, 0, 0);
    doc.rect(margin + labelWidth + 5, yPos + 2, 30, rowHeight - 4, "F");
    doc.setFontSize(8);
    doc.setFont(undefined, "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(status, margin + labelWidth + 20, yPos + 8, { align: "center" });
    yPos += rowHeight;

    // Amount row
    drawRow("Amount", `₹${parseFloat(amount).toFixed(2)}`);
    
    // Date & Time row
    drawRow("Date & Time", dateTime, true);

    // Footer section
    const footerY = pageHeight - 40;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.setLineDash([5, 5], 0);
    doc.line(margin, footerY, pageWidth - margin, footerY);
    doc.setLineDash([], 0);

    // Footer text
    yPos = footerY + 10;
    doc.setFontSize(9);
    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Thank you for your transaction!", pageWidth / 2, yPos, { align: "center" });

    yPos += 8;
    doc.setFontSize(8);
    doc.setFont(undefined, "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("This is a computer-generated invoice.", pageWidth / 2, yPos, { align: "center" });

    return doc;
  };

  const handleDownload = async () => {
    const doc = await generatePDF();
    const orderId = transactionDetails.orderid || transactionDetails.data?.orderid || Date.now();
    const fileName = `Invoice_${orderId}.pdf`;
    doc.save(fileName);
  };

  const handleShare = async () => {
    try {
      const doc = await generatePDF();
      const pdfBlob = doc.output("blob");
      const orderId = transactionDetails.orderid || transactionDetails.data?.orderid || Date.now();
      const file = new File([pdfBlob], `Invoice_${orderId}.pdf`, {
        type: "application/pdf",
      });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
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
              {transactionDetails.transactionId || transactionDetails.apiResponse?.txid?.toString() || transactionDetails.data?.apiResponse?.txid?.toString() || 'N/A'}
            </div>
          </div>

          <div>
            <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
              Mobile Number
            </div>
            <div className="font-['Gilroy-Medium'] text-sm">
              {transactionDetails.number || transactionDetails.apiResponse?.number || transactionDetails.data?.apiResponse?.number || mobileNumber || 'N/A'}
            </div>
          </div>

          <div>
            <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
              Transaction Status
            </div>
            <div className="font-['Gilroy-Medium'] text-[#039155]">
              {transactionDetails.status || transactionDetails.apiResponse?.status || transactionDetails.data?.apiResponse?.status || 'Success'}
            </div>
          </div>

          <div>
            <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
              Validity
            </div>
            <div className="font-['Gilroy-Medium']">
              {selectedPlanForRecharge?.validity || 'N/A'}
            </div>
          </div>

          <div>
            <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
              Ref ID
            </div>
            <div className="font-['Gilroy-Medium']">
              {transactionDetails.bConnectId || transactionDetails.apiResponse?.opid?.toString() || transactionDetails.data?.apiResponse?.opid?.toString() || 'N/A'}
            </div>
          </div>

          <div>
            <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
              Order ID
            </div>
            <div className="font-['Gilroy-Medium']">
              {transactionDetails.orderid || transactionDetails.data?.orderid || transactionDetails.apiResponse?.orderid || 'N/A'}
            </div>
          </div>

          <div>
            <div className="text-[#1B1717]/80 text-[11px]">Date</div>
            <div className="font-['Gilroy-Medium']">
              {transactionDetails.dateTime || 'N/A'}
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
  selectedOperator: PropTypes.object,
};

export default PaymentSuccessScreen;
