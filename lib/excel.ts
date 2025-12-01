import * as XLSX from "xlsx";
import type { DocumentContribution } from "@/types/confluence";

export const exportToExcel = (
  documents: DocumentContribution[],
  filename: string = "confluence-export.xlsx"
) => {
  // Flatten the data for Excel
  const data = documents.map((doc) => {
    const spaceName = doc.space?.name || "Unknown Space";
    const ancestors = doc.ancestors?.map((a) => a.title).join(" > ") || "";
    
    return {
      Title: doc.title,
      Space: spaceName,
      Path: ancestors,
      "Last Modified": new Date(doc.lastModified).toLocaleString(),
      "Modified By": doc.modifiedBy,
      Version: doc.version,
      URL: doc.url,
    };
  });

  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Create a worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Auto-size columns (simple approximation)
  const colWidths = [
    { wch: 40 }, // Title
    { wch: 20 }, // Space
    { wch: 50 }, // Path
    { wch: 20 }, // Last Modified
    { wch: 20 }, // Modified By
    { wch: 10 }, // Version
    { wch: 50 }, // URL
  ];
  ws["!cols"] = colWidths;

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, "Documents");

  // Generate Excel file and trigger download
  XLSX.writeFile(wb, filename);
};
