import * as XLSX from 'xlsx';
import { createProductionRecord } from '../db';

export async function importProductionExcel(fileBuffer: Buffer) {
  const errors: string[] = [];
  let imported = 0;

  try {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Find header row
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(10, data.length); i++) {
      const row = data[i];
      if (row && row.length > 0) {
        const firstCell = String(row[0]).toLowerCase();
        if (firstCell.includes('date')) {
          headerRowIndex = i;
          break;
        }
      }
    }

    if (headerRowIndex === -1) {
      return { success: false, imported: 0, errors: ['Could not find header row'] };
    }

    const headers = data[headerRowIndex].map((h: any) => String(h).toLowerCase().trim());
    
    for (let i = headerRowIndex + 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      try {
        const record: any = {};
        
        for (let j = 0; j < row.length; j++) {
          const header = headers[j];
          const value = row[j];
          
          if (!header || value === undefined || value === null || value === '') continue;
          
          if (header.includes('date')) {
            record.date = parseExcelDate(value);
          } else if (header.includes('batch') || header.includes('bach')) {
            record.batchNumber = String(value);
          } else if (header.includes('size')) {
            record.tireSize = String(value);
          } else if (header.includes('curing a') || header.includes('a)')) {
            record.curingA = parseNumber(value);
          } else if (header.includes('curing b') || header.includes('b)')) {
            record.curingB = parseNumber(value);
          } else if (header.includes('curing r') || header.includes('r)')) {
            record.curingR = parseNumber(value);
          }
        }

        if (!record.date || !record.tireSize) continue;

        const total = (record.curingA || 0) + (record.curingB || 0) + (record.curingR || 0);

        await createProductionRecord({
          productionDate: record.date,
          batchNumber: record.batchNumber || 'N/A',
          shiftType: '3-shift',
          tireSize: record.tireSize,
          batchCode: '',
          curingA: record.curingA || 0,
          curingB: record.curingB || 0,
          curingR: record.curingR || 0,
          totalProduced: total,
        });

        imported++;
      } catch (rowError: any) {
        errors.push(`Row ${i + 1}: ${rowError.message}`);
      }
    }

    return { success: imported > 0, imported, errors };
  } catch (error: any) {
    return { success: false, imported: 0, errors: [error.message] };
  }
}

function parseExcelDate(value: any): string {
  if (typeof value === 'number') {
    const date = XLSX.SSF.parse_date_code(value);
    return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
  }
  return new Date().toISOString().split('T')[0];
}

function parseNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? 0 : num;
  }
  return 0;
}
