import { useRef } from "react";
import PropTypes from "prop-types";
import { useCompany } from "../../../../../context/CompanyContext";
import { getOperatorLogo } from "../utils";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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

  // Helper function to load image and convert to base64
  const loadImageAsBase64 = (url) => {
    return new Promise((resolve, reject) => {
      if (!url) {
        resolve(null);
        return;
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        try {
          const base64 = canvas.toDataURL('image/png');
          resolve(base64);
        } catch (error) {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  const generatePDF = async () => {
    try {
      const orderId = transactionDetails.orderid || transactionDetails.data?.orderid || Date.now();
      
      // Get operator name and logos
      const operatorName = 
        selectedOperator?.company || 
        selectedPlanForRecharge?.operator || 
        selectedOperator?.name || 
        selectedOperator?.operatorName || 
        "OPERATOR";
      
      const operatorLogoPath = getOperatorLogo(operatorName);
      const companyLogoUrl = company?.logo || "";

      // Capture the payment success card (the inner div with receiptRef)
      if (!receiptRef.current) {
        throw new Error('Payment success card not found');
      }

      // Hide buttons temporarily for PDF capture
      const buttonsContainer = Array.from(receiptRef.current.querySelectorAll('div')).find(
        div => div.classList.contains('absolute') && div.querySelector('button')
      );
      const originalDisplay = buttonsContainer?.style.display || '';
      if (buttonsContainer) {
        buttonsContainer.style.display = 'none';
      }

      // Wait a bit for any animations or rendering to complete
      await new Promise(resolve => setTimeout(resolve, 300));

      // Capture the payment success card with maximum quality (100%)
      const cardCanvas = await html2canvas(receiptRef.current, {
        scale: 5, // Higher scale for maximum quality
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#d1fae5', // Green background
        quality: 1.0, // Maximum quality (100%)
        pixelRatio: window.devicePixelRatio || 2, // Use device pixel ratio for crisp rendering
      });

      // Restore button visibility
      if (buttonsContainer) {
        buttonsContainer.style.display = originalDisplay;
      }

      // Load logos
      const [companyLogoBase64, operatorLogoBase64] = await Promise.all([
        loadImageAsBase64(companyLogoUrl),
        loadImageAsBase64(operatorLogoPath),
      ]);

      // Create PDF with maximum compression enabled
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true, // Enable PDF compression
        precision: 16, // High precision for better quality
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      let currentY = 15; // Start position

      // Add header with logos
      const logoSize = 25; // mm
      const logoSpacing = 10; // mm
      
      if (companyLogoBase64) {
        pdf.addImage(companyLogoBase64, 'PNG', 15, currentY, logoSize, logoSize, undefined, 'SLOW');
      }
      
      if (operatorLogoBase64) {
        pdf.addImage(operatorLogoBase64, 'PNG', pdfWidth - 15 - logoSize, currentY, logoSize, logoSize, undefined, 'SLOW');
      }

      currentY += logoSize + 15;

      // Add horizontal line
      pdf.setDrawColor(229, 229, 229);
      pdf.setLineWidth(0.5);
      pdf.line(15, currentY, pdfWidth - 15, currentY);
      currentY += 10;

      // Add Invoice Title
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('INVOICE', pdfWidth / 2, currentY, { align: 'center' });
      currentY += 8;

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(102, 102, 102);
      pdf.text('Transaction Receipt', pdfWidth / 2, currentY, { align: 'center' });
      currentY += 20;

      // Add the captured payment success card
      // Convert to JPEG with high quality (0.98) for better compression while maintaining visual quality
      const cardImgData = cardCanvas.toDataURL('image/jpeg', 0.98);
      const cardWidth = pdfWidth - 30; // 15mm margin on each side
      const cardAspectRatio = cardCanvas.height / cardCanvas.width;
      const cardHeight = cardWidth * cardAspectRatio;

      // Check if card fits on current page, if not add new page
      if (currentY + cardHeight > pdfHeight - 20) {
        pdf.addPage();
        currentY = 15;
      }

      // Use JPEG format with compression for smaller file size
      pdf.addImage(cardImgData, 'JPEG', 15, currentY, cardWidth, cardHeight, undefined, 'FAST');
      currentY += cardHeight + 15;

      // Add footer
      if (currentY + 20 > pdfHeight - 20) {
        pdf.addPage();
        currentY = 15;
      }

      pdf.setDrawColor(229, 229, 229);
      pdf.line(15, currentY, pdfWidth - 15, currentY);
      currentY += 10;

      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(51, 51, 51);
      pdf.text('Thank you for your transaction!', pdfWidth / 2, currentY, { align: 'center' });
      currentY += 6;

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(102, 102, 102);
      pdf.text('This is a computer-generated invoice.', pdfWidth / 2, currentY, { align: 'center' });

      return { pdf, fileName: `Invoice_${orderId}.pdf` };
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  };

  const handleDownload = async () => {
    try {
      const { pdf, fileName } = await generatePDF();
      pdf.save(fileName);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleShare = async () => {
    try {
      const { pdf, fileName } = await generatePDF();
      const pdfBlob = pdf.output('blob');
      const file = new File([pdfBlob], fileName, {
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
        <div className="absolute left-1/2 -translate-x-1/2 bottom-2 flex gap-3 justify-center items-center">
          <button
            type="button"
            onClick={handleShare}
            className="w-28 border border-[#039155] rounded-lg py-2 text-sm text-[#039155] font-['Gilroy-Medium'] hover:bg-[#039155] hover:text-white transition"
          >
            Share
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="w-28 bg-[#039155] text-white rounded-lg py-2 text-sm font-['Gilroy-semibold'] hover:bg-[#027a44] transition"
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
