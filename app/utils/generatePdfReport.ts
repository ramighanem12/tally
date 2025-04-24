import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Strategy, strategyDescriptions, strategySteps } from '@/data/strategies';

// Create a function that returns the color object
const getDarkBlue = () => ({
  r: 28,
  g: 46,
  b: 110
});

const formatCurrency = (amount: string) => {
  // Remove $ and , from amount string and convert to number
  return parseFloat(amount.replace(/[$,]/g, '')).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatStatus = (status: string) => {
  switch(status) {
    case 'filed': return 'Completed';
    case 'on_track': return 'On track';
    case 'action_needed': return 'Action needed';
    default: return status;
  }
};

// Move lineSpacing to top level constant
const LINE_SPACING = 12;

// Remove lineSpacing from addDiagonalPattern function
const addDiagonalPattern = (doc: jsPDF, pageWidth: number, pageHeight: number, color: {r: number, g: number, b: number}) => {
  doc.setDrawColor(60, 88, 168);
  doc.setLineWidth(0.25);
  doc.setGState(new (doc as any).GState({ opacity: 0.08 }));

  // Draw diagonal lines in bottom left corner
  const patternWidth = pageWidth * 0.4;
  const patternHeight = pageHeight * 0.4;
  
  for (let i = 0; i < patternWidth + patternHeight; i += LINE_SPACING) {
    doc.line(
      0, pageHeight - patternHeight + i,
      Math.min(i, patternWidth), pageHeight
    );
  }

  doc.setGState(new (doc as any).GState({ opacity: 1 }));
};

// Add this near the top of the file
const addLogoWithOptimization = async (doc: jsPDF, x: number, y: number, isWhite: boolean = false) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      const desiredWidth = 8;
      const height = desiredWidth / aspectRatio;
      
      // Use the same image instance for all occurrences
      doc.addImage(
        isWhite ? '/tally-logomark-white.png' : '/tally-official-logomark.png',
        'PNG',
        x,
        y,
        desiredWidth,
        height,
        undefined, // alias
        'FAST' // compression option
      );
      resolve(null);
    };
    img.src = isWhite ? '/tally-logomark-white.png' : '/tally-official-logomark.png';
  });
};

export const generatePdfReport = async (strategies: Strategy[]) => {
  // Create new PDF document in landscape orientation
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Add first logo at top left of page 1
  await addLogoWithOptimization(doc, 20, 20);

  // Get page dimensions and calculate centers early
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const startX = pageWidth * 0.67;  // Start at right third
  const centerY = pageHeight / 2;

  // Add diagonal lines pattern to right third (like page 5)
  doc.setDrawColor(60, 88, 168); // Slightly lighter blue for pattern
  doc.setLineWidth(0.25); // Very thin lines

  // Draw diagonal lines pattern - use LINE_SPACING constant
  for (let i = -pageHeight; i < pageHeight * 2; i += LINE_SPACING) {
    doc.setGState(new (doc as any).GState({ opacity: 0.08 }));
    doc.line(
      startX, i,
      pageWidth, i + pageWidth/2
    );
  }

  // Reset opacity
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  // Add Assure Advisors text above header
  doc.setFontSize(24); // 4px smaller than company name (28)
  doc.setFont('Helvetica', 'normal');
  doc.text('Assure Advisors', 20, centerY - 25);

  // Title - larger and bold
  doc.setFontSize(34);
  doc.setFont('Helvetica', 'bold');
  doc.text('2023 Tax Savings Plan', 20, centerY - 10);
  
  // Subtitle - one line, larger and bold
  doc.setFontSize(28);
  doc.setFont('Helvetica', 'bold');
  doc.text('For Acme Co, Inc.', 20, centerY + 20);
  
  // Add preparer text
  doc.setFontSize(14);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(102, 102, 102); // Gray color
  doc.text('Prepared by John Doe, CPA', 20, centerY + 40);
  
  // Reset font and color for rest of document
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(26, 26, 26);
  
  // Add "What's in the plan" as page 2
  doc.addPage();
  doc.setPage(2);

  // Add diagonal lines pattern to right third
  doc.setDrawColor(60, 88, 168);
  doc.setLineWidth(0.25);
  for (let i = -pageHeight; i < pageHeight * 2; i += LINE_SPACING) {
    doc.setGState(new (doc as any).GState({ opacity: 0.08 }));
    doc.line(
      startX, i,
      pageWidth, i + pageWidth/2
    );
  }
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  // Title for What's in the plan
  doc.setFontSize(26);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(26, 26, 26);
  doc.text('What\'s in the plan', 20, 40);

  // Add table of contents items
  const addTocItem = (title: string, yPos: number) => {
    doc.setFillColor(0, 84, 166);
    const triangleHeight = 8;
    const triangleWidth = 4;
    const triangleX = 25;
    const triangleY = yPos - 2;
    
    doc.triangle(
      triangleX, triangleY - triangleHeight/2,
      triangleX, triangleY + triangleHeight/2,
      triangleX + triangleWidth, triangleY,
      'F'
    );

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(title, 35, yPos);
  };

  addTocItem('Disclaimer', 65);
  addTocItem('Year-over-year comparison', 85);
  addTocItem('Your top tax-saving strategies', 105);
  addTocItem('How to get your maximum tax savings', 125);
  addTocItem('More about your strategies', 145);

  // Add Disclaimer as page 3
  doc.addPage();
  doc.setPage(3);

  // Define disclaimer text first
  const disclaimerText = [
    'All tax planning, strategies, advice and recommendations in this plan are based on the taxpayer\'s available tax return data, information disclosed to us, and current tax law. Tax laws can and do change frequently. Federal, state, local, payroll, property and other taxes often overlap and involve complexities that rarely yield a single best strategy. Effective tax planning is a lifelong process. It requires regular updates to review the taxpayer\'s goals, life changes, investments, businesses, changes in income, pre-tax opportunities, retirement planning, state and local taxation, and more.',
    
    'Tax projections and recommendations include assumptions and should not be viewed as guarantees. The actual results will vary from projections. The actual tax savings will vary from the estimated tax savings. These plans and projections are only a guide, not a promise. These plans are generated using services provided by Assure and provided without warranty of any kind, express or implied. While effort has been made to ensure accuracy, Assure won\'t accept responsibility for any errors or omissions, or for any consequences arising from use of the services.',
    
    'Tax planning is a team exercise. Many of the tax savings estimated in this plan are dependent upon taxpayers completing certain action items. If taxpayers fail to take necessary actions, the tax strategies may not yield the estimated benefit. Success is also dependent upon regular communication about changes in the taxpayers\' circumstances to our firm, so we can evaluate the impact of changes on the taxpayer\'s tax plan.',
    
    'In addition to the taxpayers and our firm, planning often includes financial planners, insurance agents, and attorneys. We do not assume responsibility for the advice of any additional professionals.',
    
    'Third-party links provided in the report serve as a convenience and for informational purposes only, we accept no responsibility for the accuracy, legality, or content on these sites.',
    
    'We have no obligation to update this tax plan.'
  ];

  // Calculate total height of content for vertical centering
  doc.setFontSize(26);
  doc.setFont('Helvetica', 'bold');
  const headerHeight = 10;
  
  doc.setFontSize(14);
  doc.setFont('Helvetica', 'normal');
  const lineHeights = disclaimerText.map(paragraph => {
    const lines = doc.splitTextToSize(paragraph, 250);
    return lines.length * 6;
  });
  const paragraphSpacing = 3;
  const totalContentHeight = headerHeight + lineHeights.reduce((a, b) => a + b, 0) + (disclaimerText.length - 1) * paragraphSpacing;
  
  const startY = (pageHeight - totalContentHeight) / 2;
  
  // Add header for Disclaimer
  doc.setFontSize(26);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(26, 26, 26);
  doc.text('Disclaimer', 20, startY);
  
  // Add disclaimer text
  doc.setFontSize(12);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(102, 102, 102);
  
  let yPos = startY + headerHeight + 5;
  disclaimerText.forEach(paragraph => {
    const lines = doc.splitTextToSize(paragraph, 250);
    lines.forEach((line: string, index: number) => {
      doc.text(line, 20, yPos + (index * 6.5));
    });
    yPos += (lines.length * 6.5) + paragraphSpacing;
  });

  // Move tax strategies table to page 4
  doc.addPage();
  
  // Add title - match Disclaimer header style
  doc.setFontSize(26);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(26, 26, 26);
  doc.text('Your top tax-saving strategies for 2023', 20, 40);

  // After the tax strategies page title, add logo to top right
  await addLogoWithOptimization(doc, pageWidth - 28, 40 - 8); // 28 = rightMargin(20) + width(8)

  // Colors for strategies (from page.tsx bar chart)
  const colors = [
    { r: 59, g: 130, b: 246 },    // Blue
    { r: 99, g: 156, b: 248 },    // Light blue
    { r: 139, g: 182, b: 250 },   // Lighter blue
    { r: 179, g: 208, b: 252 },   // Very light blue
    { r: 219, g: 234, b: 254 }    // Lightest blue
  ];

  // Prepare table data - only strategies, fewer columns
  const tableData = strategies
    .filter(strategy => strategy.type === 'Strategy')
    .map((strategy, index) => [
      {
        content: strategy.name,
        styles: {
          cellPadding: 4,
          valign: 'middle' as 'middle',
          halign: 'left' as 'left'
        }
      },
      formatCurrency(strategy.amount).replace('.00', '')  // Remove .00
    ]);

  // Add table - adjust for landscape and left 60%
  let tableEndY = 60;  // Default to startY if cursor is null
  
  autoTable(doc, {
    head: [],
    body: tableData,
    startY: 60,
    styles: {
      fontSize: 14,
      cellPadding: { top: 6, right: 4, bottom: 6, left: 4 },  // Reduced from 8 to 6
      textColor: [26, 26, 26],
      valign: 'middle' as 'middle'
    },
    columnStyles: {
      0: { 
        fontSize: 14,
        textColor: [26, 26, 26],
        halign: 'left' as 'left'
      },
      1: { 
        halign: 'right' as 'right',
        fontSize: 18,
        fontStyle: 'normal',  // Changed from 'bold' to 'normal'
        textColor: [26, 26, 26]
      }
    },
    alternateRowStyles: {
      fillColor: [244, 245, 248],
    },
    margin: { left: 35 },
    tableWidth: (pageWidth * 0.6) - 40,  // Changed from 0.55 to 0.6
    didDrawPage: function(data) {
      if (data.cursor) {
        tableEndY = data.cursor.y;
      }
    },
    didDrawCell: function(data) {
      // Only draw squares for first column and not in header
      if (data.column.index === 0 && data.row.section === 'body') {
        const color = colors[data.row.index % colors.length];
        doc.setFillColor(color.r, color.g, color.b);
        
        // Draw color square to the left of the table
        const squareSize = 6.8;
        doc.rect(
          data.cell.x - 15,
          data.cell.y + (data.cell.height - squareSize) / 2,
          squareSize,
          squareSize,
          'F'
        );
      }
    }
  });

  // Add donut chart to right side of page (after 60% mark)
  const donutCenterX = (pageWidth * 0.6) + ((pageWidth - (pageWidth * 0.6)) / 2);  // Changed from 0.55 to 0.6
  const tableStartY = 60;
  const donutCenterY = tableStartY + ((tableEndY - tableStartY) / 2);
  const radius = 33.75;      // Reduced from 37.5 (10% smaller)
  const innerRadius = 23.6;  // Reduced from 26.25 (10% smaller)

  // Calculate total for percentages
  const total = strategies
    .filter(strategy => strategy.type === 'Strategy')
    .reduce((sum, strategy) => sum + parseFloat(strategy.amount.replace(/[$,]/g, '')), 0);

  // Draw donut segments
  let startAngle = 0;
  
  strategies
    .filter(strategy => strategy.type === 'Strategy')
    .forEach((strategy, index) => {
      const amount = parseFloat(strategy.amount.replace(/[$,]/g, ''));
      const angle = (amount / total) * (2 * Math.PI);
      
      // Draw segment using many small triangles
      const color = colors[index % colors.length];
      doc.setFillColor(color.r, color.g, color.b);
      
      // Use small angle increments for smooth curves
      const angleStep = Math.PI / 180; // 1 degree steps
      for (let currentAngle = startAngle; currentAngle < startAngle + angle; currentAngle += angleStep) {
        // Draw triangle from inner to outer radius
        doc.triangle(
          donutCenterX + innerRadius * Math.cos(currentAngle),
          donutCenterY + innerRadius * Math.sin(currentAngle),
          donutCenterX + radius * Math.cos(currentAngle),
          donutCenterY + radius * Math.sin(currentAngle),
          donutCenterX + radius * Math.cos(currentAngle + angleStep),
          donutCenterY + radius * Math.sin(currentAngle + angleStep),
          'F'
        );
        
        doc.triangle(
          donutCenterX + innerRadius * Math.cos(currentAngle),
          donutCenterY + innerRadius * Math.sin(currentAngle),
          donutCenterX + radius * Math.cos(currentAngle + angleStep),
          donutCenterY + radius * Math.sin(currentAngle + angleStep),
          donutCenterX + innerRadius * Math.cos(currentAngle + angleStep),
          donutCenterY + innerRadius * Math.sin(currentAngle + angleStep),
          'F'
        );
      }
      
      startAngle += angle;
    });

  // Draw inner white circle to create donut hole
  doc.setFillColor(255, 255, 255);
  doc.circle(donutCenterX, donutCenterY, innerRadius, 'F');

  // Add center text
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(20);  // Reduced from 24
  doc.setTextColor(26, 26, 26);
  
  // Format total amount
  const formattedTotal = total.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  // Center the amount text
  const textWidth = doc.getTextWidth(formattedTotal);
  doc.text(formattedTotal, donutCenterX - (textWidth / 2), donutCenterY - 3);

  // Add "Strategy tax savings" text below
  doc.setFontSize(12);  // Increased from 10 to 12
  doc.setFont('Helvetica', 'normal');
  const subTextWidth = doc.getTextWidth('Strategy tax savings');
  doc.text('Strategy tax savings', donutCenterX - (subTextWidth / 2), donutCenterY + 6);

  // Add "More about your strategies" page
  doc.addPage();
  
  // After the dark blue background is set, add white logo
  doc.setFillColor(getDarkBlue().r, getDarkBlue().g, getDarkBlue().b);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  await addLogoWithOptimization(doc, 20, 20, true); // true for white logo

  // Add subtle diagonal lines pattern to right third
  const rightThirdStart = pageWidth * 0.67;
  doc.setDrawColor(60, 88, 168); // Slightly lighter blue for pattern
  doc.setLineWidth(0.25); // Very thin lines

  // Draw diagonal lines pattern
  for (let i = -pageHeight; i < pageHeight * 2; i += LINE_SPACING) {
    doc.setGState(new (doc as any).GState({ opacity: 0.08 }));
    doc.line(
      rightThirdStart, i,
      pageWidth, i + pageWidth/2
    );
  }

  // Reset opacity
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  // Add centered white text
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.text(
    'More about your strategies',
    20,
    pageHeight / 2
  );

  // Add individual strategy pages after page 5
  strategies
    .filter(strategy => strategy.type === 'Strategy')
    .forEach(strategy => {
      doc.addPage();
      
      // Left 2/3 dark green background
      doc.setFillColor(getDarkBlue().r, getDarkBlue().g, getDarkBlue().b);
      doc.rect(0, 0, pageWidth * 0.67, pageHeight, 'F');

      // Add strategy name as header
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(26);
      doc.setTextColor(255, 255, 255);
      doc.text(strategy.name, 20, 35);

      // Add actual strategy description from strategyDescriptions
      const contentWidth = (pageWidth * 0.67) - 40;
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(12);  // Changed from 13 to 12
      doc.setGState(new (doc as any).GState({ opacity: 0.9 }));
      const strategyDescription = strategyDescriptions[strategy.name];
      const lines = doc.splitTextToSize(strategyDescription, contentWidth);
      
      // Draw text with increased line height
      const lineHeight = 7;
      lines.forEach((line: string, index: number) => {
        doc.text(line, 20, 51 + (index * lineHeight));
      });
      
      // Reset opacity for other elements
      doc.setGState(new (doc as any).GState({ opacity: 1 }));

      // Add "How to get started" header in right third
      const rightThirdStart = pageWidth * 0.67;
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(16);
      doc.setTextColor(26, 26, 26);
      doc.text('How to get started:', rightThirdStart + 10, 25);

      // Add steps with triangles
      doc.setFontSize(10);
      doc.setTextColor(102, 102, 102);
      
      const steps = strategySteps[strategy.name];
      let stepY = 35; // Moved up more (was 45)
      
      steps.forEach((step: string) => {
        // Draw triangle
        doc.setFillColor(0, 84, 166);
        const triangleHeight = 4;
        const triangleWidth = 2;
        const triangleX = rightThirdStart + 10;
        const triangleY = stepY;
        
        doc.triangle(
          triangleX, triangleY - triangleHeight/2,
          triangleX, triangleY + triangleHeight/2,
          triangleX + triangleWidth, triangleY,
          'F'
        );

        // Add step text
        doc.setFont('Helvetica', 'normal');
        const stepLines = doc.splitTextToSize(step, (pageWidth * 0.33) - 25);
        doc.text(stepLines, triangleX + 6, stepY);
        
        // Increment Y position based on number of lines - reduced spacing
        stepY += stepLines.length * 5 + 2; // Changed from 6+4 to 5+2
      });

      // Move the separator line even lower
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.25);
      doc.setGState(new (doc as any).GState({ opacity: 0.5 }));
      doc.line(
        rightThirdStart + 10,
        pageHeight - 38,  // Changed from -35 to -38
        pageWidth - 10,
        pageHeight - 38   // Changed from -35 to -38
      );
      doc.setGState(new (doc as any).GState({ opacity: 1 }));

      // Add "2023 Strategy tax savings" text
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(13);
      doc.setTextColor(102, 102, 102);
      doc.text(
        '2023 Strategy tax savings',
        rightThirdStart + 10,
        pageHeight - 25
      );

      // Add triangle before amount
      doc.setFillColor(102, 102, 102); // Medium gray to match text
      const amountTriangleHeight = 4;
      const amountTriangleWidth = 2;
      const amountTriangleX = rightThirdStart + 10;
      const amountTriangleY = pageHeight - 16; // Fixed position, slightly above text baseline
      
      doc.triangle(
        amountTriangleX, amountTriangleY - amountTriangleHeight/2,
        amountTriangleX, amountTriangleY + amountTriangleHeight/2,
        amountTriangleX + amountTriangleWidth, amountTriangleY,
        'F'
      );

      // Add amount (moved right to accommodate triangle)
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(23);
      doc.setTextColor(26, 26, 26);
      doc.text(
        formatCurrency(strategy.amount).replace('.00', ''),
        rightThirdStart + 16,
        pageHeight - 13
      );
    });

  // Update page count for footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    doc.setFontSize(11);
    doc.setFont('Helvetica', 'normal');
    
    if (i >= 5) {  // Pages with dark blue background
      doc.setTextColor(255, 255, 255);
      doc.setDrawColor(255, 255, 255);
      doc.setGState(new (doc as any).GState({ opacity: 0.85 }));  // Add slight transparency
    } else {
      doc.setTextColor(102, 102, 102);
      doc.setDrawColor(102, 102, 102);
      doc.setGState(new (doc as any).GState({ opacity: 1 }));
    }
    
    doc.setLineWidth(0.75);
    
    // Put all page labels in bottom left
    doc.line(8, pageHeight - 13.5, 8, pageHeight - 9.5);
    
    let pageLabel = '';
    switch(i) {
      case 1:
        pageLabel = 'Page 1 - Title page';
        break;
      case 2:
        pageLabel = 'Page 2 - What\'s in the plan';
        break;
      case 3:
        pageLabel = 'Page 3 - Disclaimer';
        break;
      case 4:
        pageLabel = 'Page 4 - Tax strategies';
        break;
      case 5:
        pageLabel = 'Page 5 - More about your strategies';
        break;
      default:
        // Get the strategy for this page
        const strategyIndex = i - 6;  // Account for first 5 pages
        const strategy = strategies
          .filter(s => s.type === 'Strategy')[strategyIndex];
        pageLabel = `Page ${i} - ${strategy.name}`;
    }
    doc.text(pageLabel, 12, pageHeight - 10);

    // Reset opacity after drawing footer
    doc.setGState(new (doc as any).GState({ opacity: 1 }));
  }

  // Save the PDF with a cleaner filename
  const today = new Date();
  const year = today.getFullYear();
  doc.save(`Acme Co Inc - Tax Plan (${year}).pdf`);
}; 