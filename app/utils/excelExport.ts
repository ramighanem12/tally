import ExcelJS from 'exceljs';
import { Matrix, MatrixDocument, MatrixColumn, MatrixCell } from '@/types/matrix';

export const exportMatrixToExcel = async (
  matrix: Matrix,
  documents: MatrixDocument[],
  columns: MatrixColumn[],
  cells: Record<string, Record<string, MatrixCell>>
) => {
  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Matrix');

  // Add headers
  const headers = ['Documents', ...columns.map(col => col.name)];
  worksheet.addRow(headers);

  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF3F4F6' }
  };

  // Add data rows
  documents.forEach((doc, docIndex) => {
    const rowData = [
      doc.document.name,
      ...columns.map(column => {
        const cell = cells[doc.document_id]?.[column.id];
        // Add citation [1] to completed cells with extracted text
        return cell?.status === 'completed' && cell.extracted_text 
          ? `${cell.extracted_text} [${docIndex + 1}]` 
          : '';
      })
    ];
    worksheet.addRow(rowData);
  });

  // Set column widths
  worksheet.columns = headers.map(() => ({ width: 40 }));

  // Generate Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${matrix.name}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
}; 