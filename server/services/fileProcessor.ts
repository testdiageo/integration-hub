import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { XMLParser } from 'fast-xml-parser';

export interface DetectedSchema {
  fields: Array<{
    name: string;
    type: string;
    sample?: any;
    nullable?: boolean;
  }>;
  recordCount?: number;
  format: string;
}

export class FileProcessor {
  static async processFile(filePath: string, fileName: string): Promise<DetectedSchema> {
    const ext = path.extname(fileName).toLowerCase();
    const fileContent = fs.readFileSync(filePath);

    switch (ext) {
      case '.csv':
        return this.processCSV(fileContent.toString());
      case '.json':
        return this.processJSON(fileContent.toString());
      case '.xml':
        return this.processXML(fileContent.toString());
      case '.xlsx':
      case '.xls':
        return this.processExcel(fileContent);
      default:
        throw new Error(`Unsupported file format: ${ext}`);
    }
  }

  private static processCSV(content: string): DetectedSchema {
    const parsed = Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    if (parsed.errors.length > 0) {
      throw new Error(`CSV parsing error: ${parsed.errors[0].message}`);
    }

    const data = parsed.data as Record<string, any>[];
    const fields = Object.keys(data[0] || {}).map(fieldName => ({
      name: fieldName,
      type: this.inferType(data.map(row => row[fieldName])),
      sample: data[0]?.[fieldName],
      nullable: data.some(row => row[fieldName] === null || row[fieldName] === undefined),
    }));

    return {
      fields,
      recordCount: data.length,
      format: 'csv',
    };
  }

  private static processJSON(content: string): DetectedSchema {
    try {
      const data = JSON.parse(content);
      let records: Record<string, any>[];

      // Handle both array of objects and single object
      if (Array.isArray(data)) {
        records = data;
      } else if (typeof data === 'object' && data !== null) {
        records = [data];
      } else {
        throw new Error('JSON must be an object or array of objects');
      }

      const allFields = new Set<string>();
      records.forEach(record => {
        Object.keys(record).forEach(key => allFields.add(key));
      });

      const fields = Array.from(allFields).map(fieldName => ({
        name: fieldName,
        type: this.inferType(records.map(record => record[fieldName])),
        sample: records.find(record => record[fieldName] !== undefined)?.[fieldName],
        nullable: records.some(record => record[fieldName] === null || record[fieldName] === undefined),
      }));

      return {
        fields,
        recordCount: records.length,
        format: 'json',
      };
    } catch (error) {
      throw new Error(`JSON parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static processXML(content: string): DetectedSchema {
    try {
      const parser = new XMLParser({ ignoreAttributes: false });
      const data = parser.parse(content);

      // Extract records from XML structure
      let records: any[] = [];

      // Find the actual data records by recursively searching the XML structure
      const findRecords = (obj: any): any[] => {
        if (Array.isArray(obj)) {
          return obj.filter(item => typeof item === 'object' && item !== null);
        }
        
        // Skip XML processing instructions
        if (typeof obj === 'object' && obj !== null) {
          for (const key of Object.keys(obj)) {
            if (key.startsWith('?') || key.startsWith('@')) continue; // Skip XML declarations and attributes
            
            const value = obj[key];
            if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
              return value;
            } else if (typeof value === 'object' && value !== null) {
              // Recursively search nested objects
              const nestedRecords = findRecords(value);
              if (nestedRecords.length > 0) {
                return nestedRecords;
              }
            }
          }
        }
        
        return [];
      };

      records = findRecords(data);


      // If no records found in nested structure, try flattening the entire structure
      if (records.length === 0) {
        const flattenRecord = (obj: any): Record<string, any> => {
          const result: Record<string, any> = {};
          for (const [key, value] of Object.entries(obj)) {
            if (key.startsWith('@') || key.startsWith('?')) continue; // Skip XML attributes and declarations
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
              Object.assign(result, flattenRecord(value));
            } else if (!Array.isArray(value)) {
              result[key] = value;
            }
          }
          return result;
        };

        const flattened = flattenRecord(data);
        if (Object.keys(flattened).length > 0) {
          records = [flattened];
        }
      }

      const allFields = new Set<string>();
      records.forEach(record => {
        if (typeof record === 'object' && record !== null) {
          Object.keys(record).forEach(key => {
            if (!key.startsWith('@')) { // Skip XML attributes like @_version
              allFields.add(key);
            }
          });
        }
      });

      const fields = Array.from(allFields).map(fieldName => ({
        name: fieldName,
        type: this.inferType(records.map(record => record?.[fieldName])),
        sample: records.find(record => record?.[fieldName] !== undefined)?.[fieldName],
        nullable: records.some(record => record?.[fieldName] === null || record?.[fieldName] === undefined),
      }));

      return {
        fields,
        recordCount: records.length,
        format: 'xml',
      };
    } catch (error) {
      throw new Error(`XML parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static processExcel(buffer: Buffer): DetectedSchema {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { defval: null });

      if (data.length === 0) {
        throw new Error('Excel sheet is empty');
      }

      const records = data as Record<string, any>[];
      const fields = Object.keys(records[0]).map(fieldName => ({
        name: fieldName,
        type: this.inferType(records.map(row => row[fieldName])),
        sample: records[0][fieldName],
        nullable: records.some(row => row[fieldName] === null || row[fieldName] === undefined),
      }));

      return {
        fields,
        recordCount: records.length,
        format: 'excel',
      };
    } catch (error) {
      throw new Error(`Excel parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static inferType(values: any[]): string {
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    
    if (nonNullValues.length === 0) return 'string';

    const types = nonNullValues.map(value => {
      if (typeof value === 'number') return 'number';
      if (typeof value === 'boolean') return 'boolean';
      if (value instanceof Date) return 'date';
      if (typeof value === 'string') {
        // Check for date patterns
        if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'date';
        // Check for email
        if (/@/.test(value)) return 'email';
        // Check for numbers in strings
        if (/^\d+$/.test(value)) return 'number';
        if (/^\d+\.\d+$/.test(value)) return 'number';
      }
      return 'string';
    });

    // Return the most common type
    const typeCounts = types.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCounts).sort(([,a], [,b]) => b - a)[0][0];
  }
}
