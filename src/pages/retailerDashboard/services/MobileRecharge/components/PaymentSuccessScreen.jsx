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
    const operatorName = selectedOperator?.name || selectedOperator?.operatorName || selectedPlanForRecharge?.operator || "OPERATOR";
    const operatorLogoPath = getOperatorLogo(operatorName);

    // Outer border (dashed)
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1);
    doc.setLineDash([5, 5], 0);
    doc.rect(margin - 10, margin - 10, pageWidth - 2 * (margin - 10), pageHeight - 2 * (margin - 10), "D");
    doc.setLineDash([], 0);

    // Header with logos
    const logoSize = 28;
    const headerPadding = 15;
    const headerY = margin;
    
    // Left side - Company logo
    const companyLogoX = margin + headerPadding;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1);
    doc.rect(companyLogoX, headerY, logoSize, logoSize, "D");
    
    // Try to load and add company logo if available
    let companyLogoLoaded = false;
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
              doc.addImage(img, format, companyLogoX + 2, headerY + 2, logoSize - 4, logoSize - 4);
              companyLogoLoaded = true;
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
      }
    }
    
    if (!companyLogoLoaded) {
      doc.setFontSize(7);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, "bold");
      doc.text("YOUR LOGO", companyLogoX + logoSize / 2, headerY + logoSize / 2, { align: "center" });
    }

    // Right side - Operator logo/name
    const operatorLogoX = pageWidth - margin - headerPadding - logoSize;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1);
    doc.rect(operatorLogoX, headerY, logoSize, logoSize, "D");
    
    // Try to load operator logo if available
    let operatorLogoLoaded = false;
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
              doc.addImage(img, format, operatorLogoX + 2, headerY + 2, logoSize - 4, logoSize - 4);
              operatorLogoLoaded = true;
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
      }
    }
    
    if (!operatorLogoLoaded) {
      doc.setFontSize(7);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, "bold");
      const displayOperatorName = operatorName.length > 10 ? operatorName.substring(0, 10) : operatorName;
      doc.text(displayOperatorName.toUpperCase(), operatorLogoX + logoSize / 2, headerY + logoSize / 2, { align: "center" });
    }

    // Divider line after header
    yPos = headerY + logoSize + 15;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1);
    doc.setLineDash([5, 5], 0);
    doc.line(margin + headerPadding, yPos, pageWidth - margin - headerPadding, yPos);
    doc.setLineDash([], 0);

    // Invoice Title
    yPos += 12;
    doc.setFontSize(28);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, "bold");
    doc.text("INVOICE", pageWidth / 2, yPos, { align: "center" });
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.setTextColor(102, 102, 102);
    doc.text("Transaction Receipt", pageWidth / 2, yPos, { align: "center" });

    // Divider line after title
    yPos += 10;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1);
    doc.setLineDash([5, 5], 0);
    doc.line(margin + headerPadding, yPos, pageWidth - margin - headerPadding, yPos);
    doc.setLineDash([], 0);

    // Content section
    yPos += 15;
    const contentPadding = headerPadding;
    const rowHeight = 14;
    const labelWidth = (pageWidth - 2 * margin - 2 * contentPadding) * 0.4;
    const valueWidth = pageWidth - 2 * margin - 2 * contentPadding - labelWidth;
    const tableX = margin + contentPadding;

    // Draw table border
    const tableHeight = rowHeight * 7;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1);
    doc.rect(tableX, yPos, labelWidth + valueWidth, tableHeight, "D");

    // Helper function to draw table row
    const drawRow = (label, value, isLast = false) => {
      // Label cell (left) - grey background
      doc.setFillColor(245, 245, 245);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(tableX, yPos, labelWidth, rowHeight, "FD");
      
      // Border between cells
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(tableX + labelWidth, yPos, tableX + labelWidth, yPos + rowHeight);
      
      doc.setFontSize(9);
      doc.setFont(undefined, "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(label, tableX + 10, yPos + 9);

      // Value cell (right) - white background
      doc.setFillColor(255, 255, 255);
      doc.rect(tableX + labelWidth, yPos, valueWidth, rowHeight, "FD");
      
      doc.setFontSize(9);
      doc.setFont(undefined, "bold");
      doc.setTextColor(51, 51, 51);
      doc.text(value, tableX + labelWidth + 10, yPos + 9);

      // Horizontal border
      if (!isLast) {
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(tableX, yPos + rowHeight, tableX + labelWidth + valueWidth, yPos + rowHeight);
      }

      yPos += rowHeight;
    };

    // Table rows
    drawRow("Order ID", orderId);
    drawRow("Transaction ID", txId);
    drawRow("Ref ID", refId);
    drawRow("Mobile Number", mobileNum);
    
    // Status row with badge
    doc.setFillColor(245, 245, 245);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(tableX, yPos, labelWidth, rowHeight, "FD");
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(tableX + labelWidth, yPos, tableX + labelWidth, yPos + rowHeight);
    doc.setFontSize(9);
    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Status", tableX + 10, yPos + 9);

    // Status badge (black background, white text)
    const badgeWidth = 35;
    const badgeHeight = rowHeight - 6;
    doc.setFillColor(0, 0, 0);
    doc.rect(tableX + labelWidth + 10, yPos + 3, badgeWidth, badgeHeight, "F");
    doc.setFontSize(8);
    doc.setFont(undefined, "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(status, tableX + labelWidth + 10 + badgeWidth / 2, yPos + 9, { align: "center" });
    
    // Horizontal border
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(tableX, yPos + rowHeight, tableX + labelWidth + valueWidth, yPos + rowHeight);
    yPos += rowHeight;

    // Amount row
    const amountText = `₹${parseFloat(amount).toFixed(2)}`;
    doc.setFillColor(245, 245, 245);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(tableX, yPos, labelWidth, rowHeight, "FD");
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(tableX + labelWidth, yPos, tableX + labelWidth, yPos + rowHeight);
    doc.setFontSize(9);
    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Amount", tableX + 10, yPos + 9);
    
    doc.setFillColor(255, 255, 255);
    doc.rect(tableX + labelWidth, yPos, valueWidth, rowHeight, "FD");
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(amountText, tableX + labelWidth + 10, yPos + 9);
    
    // Horizontal border
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(tableX, yPos + rowHeight, tableX + labelWidth + valueWidth, yPos + rowHeight);
    yPos += rowHeight;
    
    // Date & Time row
    drawRow("Date & Time", dateTime, true);

    // Footer section
    const footerY = pageHeight - margin - 30;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1);
    doc.setLineDash([5, 5], 0);
    doc.line(margin + headerPadding, footerY, pageWidth - margin - headerPadding, footerY);
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
    doc.setTextColor(102, 102, 102);
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
        <div className="absolute left-5 right-5 bottom-2 flex gap-3">
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
            Download
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
