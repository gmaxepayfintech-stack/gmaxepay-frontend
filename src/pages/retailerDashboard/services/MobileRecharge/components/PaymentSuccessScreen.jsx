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

  const generateHTMLInvoice = () => {
    // Extract data from nested structure
    const apiResponse = transactionDetails.apiResponse || transactionDetails.data?.apiResponse || {};
    const orderId = transactionDetails.orderid || transactionDetails.data?.orderid || "N/A";
    const txId = transactionDetails.transactionId || apiResponse.txid?.toString() || "N/A";
    const refId = transactionDetails.bConnectId || apiResponse.opid?.toString() || "N/A";
    const mobileNum = transactionDetails.number || apiResponse.number || mobileNumber || "N/A";
    const amount = transactionDetails.amount || apiResponse.amount || "0.00";
    const status = transactionDetails.status || apiResponse.status || "Success";
    const dateTime = getCurrentDateTime();

    // Get operator name - check multiple sources
    // Priority: selectedOperator.company (from operator API) > selectedPlanForRecharge.operator > selectedOperator.name
    const operatorName = 
      selectedOperator?.company || 
      selectedPlanForRecharge?.operator || 
      selectedOperator?.name || 
      selectedOperator?.operatorName || 
      "OPERATOR";
    
    const operatorLogoPath = getOperatorLogo(operatorName);
    const companyLogoUrl = company?.logo || "";

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recharge Invoice</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            padding: 40px 20px;
        }
        
        .invoice-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 30px;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 0;
            border-bottom: 1px solid #ddd;
            margin-bottom: 20px;
        }
        
        .company-logo {
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        
        .company-logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
        
        .operator-logo {
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        
        .operator-logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
        
        .invoice-title {
            text-align: center;
            padding: 20px 0;
            margin-bottom: 20px;
        }
        
        .invoice-title h1 {
            font-size: 24px;
            color: #000;
            margin-bottom: 5px;
        }
        
        .invoice-title p {
            color: #666;
            font-size: 14px;
        }
        
        .content {
            padding: 20px 0;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #eee;
        }
        
        .info-row:last-child {
            border-bottom: none;
        }
        
        .info-label {
            font-weight: 600;
            color: #333;
            font-size: 14px;
        }
        
        .info-value {
            color: #000;
            font-size: 14px;
            text-align: right;
        }
        
        .amount-row {
            margin-top: 10px;
            padding-top: 15px;
            border-top: 2px solid #333;
        }
        
        .amount-value {
            font-size: 28px;
            font-weight: bold;
            color: #000;
        }
        
        .status-success {
            display: inline-block;
            padding: 4px 12px;
            background: #039155;
            color: white;
            font-weight: 600;
            font-size: 12px;
            border-radius: 4px;
        }
        
        .footer {
            padding: 20px 0;
            text-align: center;
            border-top: 1px solid #ddd;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
        }
        
        .footer p {
            margin: 5px 0;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header with Logos -->
        <div class="header">
            <div class="company-logo">
                ${companyLogoUrl ? `<img src="${companyLogoUrl}" alt="Company Logo" onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=\\"font-size: 12px;\\">YOUR LOGO</span>';" />` : '<span style="font-size: 12px;">YOUR LOGO</span>'}
            </div>
            <div class="operator-logo">
                ${operatorLogoPath ? `<img src="${operatorLogoPath}" alt="${operatorName}" onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=\\"font-size: 12px;\\">${operatorName.toUpperCase()}</span>';" />` : `<span style="font-size: 12px;">${operatorName.toUpperCase()}</span>`}
            </div>
        </div>
        
        <!-- Invoice Title -->
        <div class="invoice-title">
            <h1>INVOICE</h1>
            <p>Transaction Receipt</p>
        </div>
        
        <!-- Content -->
        <div class="content">
            <div class="info-row">
                <div class="info-label">Order ID</div>
                <div class="info-value"><strong>${orderId}</strong></div>
            </div>
            <div class="info-row">
                <div class="info-label">Transaction ID</div>
                <div class="info-value"><strong>${txId}</strong></div>
            </div>
            <div class="info-row">
                <div class="info-label">Ref ID</div>
                <div class="info-value">${refId}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Mobile Number</div>
                <div class="info-value"><strong>${mobileNum}</strong></div>
            </div>
            <div class="info-row">
                <div class="info-label">Status</div>
                <div class="info-value"><span class="status-success">${status}</span></div>
            </div>
            <div class="info-row amount-row">
                <div class="info-label">Amount</div>
                <div class="info-value amount-value">₹${parseFloat(amount).toFixed(2)}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Date & Time</div>
                <div class="info-value">${dateTime}</div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p><strong>Thank you for your transaction!</strong></p>
            <p>This is a computer-generated invoice.</p>
        </div>
    </div>
</body>
</html>`;

    return htmlContent;
  };

  const generatePDF = async () => {
    try {
      const htmlContent = generateHTMLInvoice();
      const orderId = transactionDetails.orderid || transactionDetails.data?.orderid || Date.now();
      
      // Create a temporary iframe to properly render the HTML with all styles
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.top = '0';
      iframe.style.width = '600px';
      iframe.style.height = '800px';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      return new Promise((resolve, reject) => {
        const handleLoad = async () => {
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            iframeDoc.open();
            iframeDoc.write(htmlContent);
            iframeDoc.close();

            // Wait for images to load
            const images = iframeDoc.querySelectorAll('img');
            const imagePromises = Array.from(images).map((img) => {
              if (img.complete && img.naturalHeight !== 0) {
                return Promise.resolve();
              }
              return new Promise((resolveImg) => {
                const timeout = setTimeout(resolveImg, 3000);
                img.onload = () => {
                  clearTimeout(timeout);
                  resolveImg();
                };
                img.onerror = () => {
                  clearTimeout(timeout);
                  resolveImg(); // Continue even if image fails
                };
              });
            });
            
            await Promise.all(imagePromises);
            
            // Wait a bit more for rendering
            await new Promise(resolve => setTimeout(resolve, 500));

            const bodyElement = iframeDoc.body;

            // Convert HTML to canvas with high quality
            const canvas = await html2canvas(bodyElement, {
              scale: 3, // Higher scale for better quality
              useCORS: true,
              allowTaint: false,
              logging: false,
              backgroundColor: '#ffffff',
              width: 600,
              windowWidth: 600,
            });

            // Remove temporary iframe
            document.body.removeChild(iframe);

            // Create PDF
            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdf = new jsPDF({
              orientation: 'portrait',
              unit: 'mm',
              format: 'a4',
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min((pdfWidth - 20) / imgWidth, (pdfHeight - 20) / imgHeight); // 10mm margin on each side
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 10;

            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio, undefined, 'FAST');
            
            resolve({ pdf, fileName: `Invoice_${orderId}.pdf` });
          } catch (error) {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
            reject(error);
          }
        };

        iframe.onload = handleLoad;
        iframe.onerror = () => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          reject(new Error('Failed to load iframe'));
        };

        // Trigger load
        iframe.src = 'about:blank';
      });
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
      // Fallback to HTML download
      const htmlContent = generateHTMLInvoice();
      const orderId = transactionDetails.orderid || transactionDetails.data?.orderid || Date.now();
      const fileName = `Invoice_${orderId}.html`;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
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
        <div className="absolute left-1/2 -translate-x-1/2 bottom-2 flex gap-3">
          <button
            type="button"
            onClick={handleShare}
            className="w-24 border border-[#039155] rounded-lg py-1.5 text-xs text-[#039155] font-['Gilroy-Medium'] hover:bg-[#039155] hover:text-white transition"
          >
            Share
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="w-24 bg-[#039155] text-white rounded-lg py-1.5 text-xs font-['Gilroy-semibold'] hover:bg-[#027a44] transition"
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
