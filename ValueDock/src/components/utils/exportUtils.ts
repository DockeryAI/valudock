import { InputData, ROIResults, CashflowData, generatePDFData, generateExcelData } from './calculations';

// PDF Export using jsPDF
// sections parameter allows selective export: 'executive', 'financial', 'internal', 'sensitivity', 'fte', 'details', 'charts'
export async function exportToPDF(data: InputData, results: ROIResults, cashflowData: CashflowData[], sections?: string[]) {
  try {
    // Import jsPDF dynamically
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    // If no sections specified, include all
    const includedSections = sections && sections.length > 0 ? sections : ['executive', 'financial', 'internal', 'sensitivity', 'fte', 'details', 'charts'];
    
    const pdfData = generatePDFData(data, results);
    
    // Add title
    doc.setFontSize(20);
    doc.text('ROI Analysis Report', 20, 30);
    
    // Add timestamp
    doc.setFontSize(10);
    doc.text(`Generated: ${pdfData.timestamp}`, 20, 40);
    
    // Add summary section
    doc.setFontSize(16);
    doc.text('Executive Summary', 20, 60);
    
    doc.setFontSize(12);
    let yPosition = 75;
    doc.text(`ROI: ${pdfData.summary.roi}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Annual Net Savings: ${pdfData.summary.annualSavings}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Payback Period: ${pdfData.summary.payback}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Process Count: ${pdfData.summary.processCount}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Seasonal Processes: ${pdfData.summary.hasSeasonality ? 'Yes' : 'No'}`, 20, yPosition);
    
    // Add assumptions section
    yPosition += 25;
    doc.setFontSize(16);
    doc.text('Key Assumptions', 20, yPosition);
    
    yPosition += 15;
    doc.setFontSize(12);
    doc.text(`Number of Processes: ${data.processes.length}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Software Cost: ${data.softwareCost}/month`, 20, yPosition);
    yPosition += 10;
    doc.text(`Implementation Timeline: ${data.implementationTimelineMonths} months`, 20, yPosition);
    
    // Add detailed results section
    yPosition += 25;
    doc.setFontSize(16);
    doc.text('Detailed Results', 20, yPosition);
    
    yPosition += 15;
    doc.setFontSize(12);
    doc.text(`Monthly Time Saved: ${results.monthlyTimeSaved.toFixed(1)} hours`, 20, yPosition);
    yPosition += 10;
    doc.text(`Peak Season Savings: ${Math.ceil(results.peakSeasonSavings).toLocaleString()}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Overtime Savings: ${Math.ceil(results.overtimeSavings).toLocaleString()}`, 20, yPosition);
    yPosition += 10;
    doc.text(`SLA Compliance Value: ${Math.ceil(results.slaComplianceValue).toLocaleString()}`, 20, yPosition);
    
    // Save the PDF
    doc.save('roi-analysis-report.pdf');
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF export');
  }
}

// Excel Export using xlsx
// sections parameter allows selective export: 'executive', 'financial', 'internal', 'sensitivity', 'fte', 'details', 'charts'
export async function exportToExcel(data: InputData, results: ROIResults, cashflowData: CashflowData[], sections?: string[]) {
  try {
    // Import xlsx dynamically
    const XLSX = await import('xlsx');
    
    // If no sections specified, include all
    const includedSections = sections && sections.length > 0 ? sections : ['executive', 'financial', 'internal', 'sensitivity', 'fte', 'details', 'charts'];
    
    const excelData = generateExcelData(data, results, cashflowData);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Add worksheets
    excelData.worksheets.forEach(worksheet => {
      const ws = XLSX.utils.aoa_to_sheet(worksheet.data);
      
      // Style the header row
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[cellAddress]) continue;
        ws[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "EEEEEE" } }
        };
      }
      
      XLSX.utils.book_append_sheet(workbook, ws, worksheet.name);
    });
    
    // Save the file
    XLSX.writeFile(workbook, 'roi-analysis-data.xlsx');
    
    return true;
  } catch (error) {
    console.error('Error generating Excel:', error);
    throw new Error('Failed to generate Excel export');
  }
}

// Email sharing functionality
export function shareViaEmail(data: InputData, results: ROIResults) {
  const subject = 'ROI Analysis Report - Automation Investment Proposal';
  const body = `
Hi,

I've completed an ROI analysis for our automation initiative. Here are the key findings:

📊 ROI: ${results.roiPercentage.toFixed(1)}%
💰 Annual Net Savings: ${Math.ceil(results.annualNetSavings).toLocaleString()}
⏱️ Payback Period: ${results.paybackPeriod.toFixed(1)} months
🕒 Monthly Time Saved: ${results.monthlyTimeSaved.toFixed(1)} hours

Key Assumptions:
• Number of Processes: ${data.processes.length}
• Software Cost: ${Math.ceil(data.softwareCost).toLocaleString()}/month
• Implementation Timeline: ${data.implementationTimelineMonths} months

Process Summary:
${data.processes.map(process => {
  const coverage = process.implementationCosts.automationCoverage;
  return `• ${process.name}: ${process.taskType} (${coverage}% coverage)`;
}).join('\n')}

${results.peakSeasonSavings > 0 ? `
Seasonal Impact:
• Peak Season Additional Savings: ${Math.ceil(results.peakSeasonSavings).toLocaleString()}
` : ''}

${results.overtimeSavings > 0 ? `
Additional Benefits:
• Overtime Cost Reduction: ${Math.ceil(results.overtimeSavings).toLocaleString()}
• SLA Compliance Value: ${Math.ceil(results.slaComplianceValue).toLocaleString()}
` : ''}

Please review and let me know if you'd like to discuss the details.

Best regards
`;

  const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoLink;
}

// Copy shareable link with encoded data (read-only mode)
export function generateShareableLink(data: InputData): string {
  try {
    const encodedData = btoa(JSON.stringify(data));
    const currentUrl = window.location.origin + window.location.pathname;
    return `${currentUrl}?data=${encodedData}&readonly=true`;
  } catch (error) {
    console.error('Error generating shareable link:', error);
    return window.location.href;
  }
}

// Parse data from URL parameters
export function parseDataFromUrl(): InputData | null {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('data');
    
    if (encodedData) {
      const decodedData = JSON.parse(atob(encodedData));
      return decodedData;
    }
  } catch (error) {
    console.error('Error parsing data from URL:', error);
  }
  
  return null;
}