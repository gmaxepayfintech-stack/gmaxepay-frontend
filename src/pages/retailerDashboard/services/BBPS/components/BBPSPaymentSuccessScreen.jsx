import { useRef } from "react";
import PropTypes from "prop-types";
import { useCompany } from "../../../../../context/CompanyContext";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Download } from "lucide-react";

const SuccessDetail = ({ label, value, green }) => {
  return (
    <div>
      <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
        {label}
      </div>
      <div
        className={`font-['Gilroy-Medium'] text-sm ${
          green ? "text-[#039155]" : "text-[#1B1717]"
        }`}
      >
        {value || "N/A"}
      </div>
    </div>
  );
};

const BBPSPaymentSuccessScreen = ({ transactionDetails }) => {
  const receiptRef = useRef(null);
  const { company } = useCompany();

  const getCurrentDateTime = () => {
    let date;
    if (transactionDetails?.dateTime || transactionDetails?.respBillDate) {
      const dateStr =
        transactionDetails.dateTime || transactionDetails.respBillDate;
      if (typeof dateStr === "string") {
        date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          return dateStr;
        }
      } else {
        date = new Date(dateStr);
      }
    } else {
      date = new Date();
    }

    // Format: "25 January 2026 at 07:35:15 pm"
    const day = date.getDate();
    const month = date.toLocaleString("en-IN", { month: "long" });
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    const displayHours = (hours % 12 || 12).toString().padStart(2, "0");

    return `${day} ${month} ${year} at ${displayHours}:${minutes}:${seconds} ${ampm}`;
  };

  const generateHTMLInvoice = () => {
    // Extract data from transaction details
    const orderId =
      transactionDetails?.orderid || transactionDetails?.txnRefId || "N/A";
    const txId =
      transactionDetails?.txid || transactionDetails?.txnRefId || "N/A";
    const refId =
      transactionDetails?.bConnectId ||
      transactionDetails?.utr ||
      transactionDetails?.approvalRefNumber ||
      "N/A";
    const customerName =
      transactionDetails?.customerName ||
      transactionDetails?.respCustomerName ||
      "N/A";
    const billerNumber =
      transactionDetails?.billerNumber || transactionDetails?.billerId || "N/A";
    const amount =
      transactionDetails?.amount || transactionDetails?.respAmount || "0.00";
    const status =
      transactionDetails?.status ||
      transactionDetails?.responseReason ||
      "Success";
    const dateTime = getCurrentDateTime();
    const ccf =
      transactionDetails?.custConvFee ||
      transactionDetails?.apiCustConvFee ||
      "0.00";

    const companyLogoUrl = company?.logo || "";
    const companyName = company?.name || company?.companyName || "";

    const companyLogoHtml = companyLogoUrl
      ? `<img src="${companyLogoUrl}" alt="Company Logo" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block;" onerror="this.style.display='none'; this.parentElement.style.display='none';" />`
      : "";

    const companyLogoStyle = companyLogoUrl ? "" : "display: none;";

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BBPS Invoice</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            background: white;
            padding: 40px 20px;
        }
        
        .invoice-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 40px;
        }
        
        .header {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px 0 10px 0;
            margin-bottom: 0;
        }
        
        .company-name {
            text-align: center;
            font-size: 24px;
            font-weight: 700;
            color: #000;
            margin-bottom: 20px;
            margin-top: -20px;
            padding: 15px 0;
            border-bottom: 2px solid #000;
            letter-spacing: 0.5px;
        }
        
        .company-logo {
            width: 100px;
            height: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        
        .company-logo img {
            max-width: 100%;
            max-height: 100%;
            width: auto;
            height: auto;
            object-fit: contain;
        }
        
        .invoice-title {
            text-align: center;
            padding: 30px 0;
            margin-bottom: 30px;
        }
        
        .invoice-title h1 {
            font-size: 42px;
            color: #000;
            margin-bottom: 0;
            font-weight: 900;
            letter-spacing: 3px;
            text-transform: uppercase;
        }
        
        .content {
            padding: 0;
        }
        
        .invoice-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #000;
            margin: 20px 0;
        }
        
        .invoice-table td {
            padding: 15px 20px;
            border: 1px solid #000;
            font-size: 15px;
        }
        
        .info-label {
            font-weight: 700;
            color: #000;
            font-size: 15px;
            width: 40%;
        }
        
        .info-value {
            color: #000;
            font-size: 15px;
            text-align: right;
            font-weight: 600;
        }
        
        .info-value strong {
            font-weight: 700;
            color: #000;
        }
        
        .amount-row {
            background-color: #f5f5f5;
        }
        
        .amount-row .info-label {
            font-size: 18px;
        }
        
        .amount-row .info-value {
            font-size: 18px;
        }
        
        .amount-value {
            font-size: 18px;
            font-weight: 700;
            color: #000;
            letter-spacing: 0.5px;
        }
        
        .status-success {
            color: #000;
            font-weight: 700;
            font-size: 15px;
            text-transform: uppercase;
        }
        
        .footer {
            padding: 30px 0 10px 0;
            text-align: center;
            margin-top: 40px;
            color: #000;
            font-size: 13px;
        }
        
        .footer p {
            margin: 6px 0;
            color: #000;
        }
        
        .footer p:first-child {
            font-weight: 700;
            color: #000;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .invoice-container {
                border: none;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header with Logo -->
        <div class="header">
            <div class="company-logo" style="${companyLogoStyle}">
                ${companyLogoHtml || ""}
            </div>
        </div>
        
        ${companyName ? `<div class="company-name">${companyName}</div>` : ""}
        
        <!-- Invoice Title -->
        <div class="invoice-title">
            <h1>INVOICE</h1>
        </div>
        
        <!-- Content -->
        <div class="content">
            <table class="invoice-table">
                <tr>
                    <td class="info-label">Transaction ID</td>
                    <td class="info-value"><strong>${txId}</strong></td>
                </tr>
                <tr>
                    <td class="info-label">Customer Name</td>
                    <td class="info-value"><strong>${customerName}</strong></td>
                </tr>
                <tr>
                    <td class="info-label">Biller Number</td>
                    <td class="info-value"><strong>${billerNumber}</strong></td>
                </tr>
                <tr>
                    <td class="info-label">B-Connect Transaction ID</td>
                    <td class="info-value"><strong>${refId}</strong></td>
                </tr>
                <tr>
                    <td class="info-label">Transaction Status</td>
                    <td class="info-value"><span class="status-success">${status}</span></td>
                </tr>
                <tr>
                    <td class="info-label">Date & Time</td>
                    <td class="info-value">${dateTime}</td>
                </tr>
                <tr>
                    <td class="info-label">CCF</td>
                    <td class="info-value">${ccf}</td>
                </tr>
                <tr class="amount-row">
                    <td class="info-label">Amount</td>
                    <td class="info-value amount-value">₹${parseFloat(amount).toFixed(2)}</td>
                </tr>
            </table>
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
      const orderId =
        transactionDetails?.orderid ||
        transactionDetails?.txnRefId ||
        Date.now();

      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.left = "-9999px";
      iframe.style.top = "0";
      iframe.style.width = "600px";
      iframe.style.height = "1000px";
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      return new Promise((resolve, reject) => {
        const handleLoad = async () => {
          try {
            const iframeDoc =
              iframe.contentDocument || iframe.contentWindow.document;
            iframeDoc.open();
            iframeDoc.write(htmlContent);
            iframeDoc.close();

            const images = iframeDoc.querySelectorAll("img");
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
                  resolveImg();
                };
              });
            });

            await Promise.all(imagePromises);
            await new Promise((resolve) => setTimeout(resolve, 500));

            const bodyElement = iframeDoc.body;

            const canvas = await html2canvas(bodyElement, {
              scale: 4,
              useCORS: true,
              allowTaint: false,
              logging: false,
              backgroundColor: "#ffffff",
              width: 600,
              windowWidth: 600,
            });

            document.body.removeChild(iframe);

            const imgData = canvas.toDataURL("image/jpeg", 0.95);
            const pdf = new jsPDF({
              orientation: "portrait",
              unit: "mm",
              format: "a4",
              compress: true,
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(
              (pdfWidth - 20) / imgWidth,
              (pdfHeight - 20) / imgHeight,
            );
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 10;

            pdf.addImage(
              imgData,
              "JPEG",
              imgX,
              imgY,
              imgWidth * ratio,
              imgHeight * ratio,
              undefined,
              "MEDIUM",
            );

            resolve({ pdf, fileName: `BBPS_Invoice_${orderId}.pdf` });
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
          reject(new Error("Failed to load iframe"));
        };

        iframe.src = "about:blank";
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    }
  };

  const handleDownload = async () => {
    try {
      const { pdf, fileName } = await generatePDF();
      pdf.save(fileName);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      const htmlContent = generateHTMLInvoice();
      const orderId =
        transactionDetails?.orderid ||
        transactionDetails?.txnRefId ||
        Date.now();
      const fileName = `BBPS_Invoice_${orderId}.html`;
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
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
      const pdfBlob = pdf.output("blob");
      const file = new File([pdfBlob], fileName, {
        type: "application/pdf",
      });

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: "BBPS Payment Invoice",
          text: "BBPS Bill Payment Invoice",
          files: [file],
        });
      } else {
        console.warn("Share API is not available on this device");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <div className="bg-green-100 rounded-xl relative overflow-hidden max-w-md mx-auto">
      {/* Ticket Notches */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-10 bg-[#FAFAFA] rounded-b-full" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-10 bg-[#FAFAFA] rounded-t-full" />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-16 w-10 bg-[#FAFAFA] rounded-r-full" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-16 w-10 bg-[#FAFAFA] rounded-l-full" />

      <div className="relative z-10 pt-12 pb-12 px-10" ref={receiptRef}>
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
            ₹
            {transactionDetails?.amount ||
              transactionDetails?.respAmount ||
              "0.00"}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-20">
          <SuccessDetail
            label="Transaction ID"
            value={transactionDetails?.txid || transactionDetails?.txnRefId}
          />
          <SuccessDetail
            label="Customer Name"
            value={
              transactionDetails?.customerName ||
              transactionDetails?.respCustomerName
            }
          />
          <SuccessDetail
            label="Biller Number"
            value={
              transactionDetails?.billerNumber || transactionDetails?.billerId
            }
          />
          <SuccessDetail
            label="B-Connect Transaction ID"
            value={
              transactionDetails?.bConnectId ||
              transactionDetails?.utr ||
              transactionDetails?.approvalRefNumber
            }
          />
          <SuccessDetail
            label="Transaction Status"
            value={
              transactionDetails?.status ||
              transactionDetails?.responseReason ||
              "Success"
            }
            green
          />
          <SuccessDetail label="Date" value={getCurrentDateTime()} />
          <SuccessDetail
            label="CCF"
            value={
              transactionDetails?.custConvFee ||
              transactionDetails?.apiCustConvFee ||
              "0"
            }
          />
        </div>

        {/* Buttons */}
        <div className="absolute left-5 right-5 bottom-2 flex gap-24">
          <button
            onClick={handleShare}
            className="flex-1 border border-[#039155] rounded-lg py-2 text-xs text-[#039155] font-['Gilroy-Medium'] hover:bg-[#039155] hover:text-white transition"
          >
            Share
          </button>

          <button
            onClick={handleDownload}
            className="flex-1 bg-[#039155] text-white rounded-lg py-2 text-xs font-['Gilroy-semibold'] hover:bg-[#027a44] transition flex items-center justify-center gap-2"
          >
            <Download size={16} />
            Download Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

BBPSPaymentSuccessScreen.propTypes = {
  transactionDetails: PropTypes.object.isRequired,
};

export default BBPSPaymentSuccessScreen;
