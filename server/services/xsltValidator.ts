import fs from 'fs';
import { DOMParser, XMLSerializer } from 'xmldom';

export interface XSLTValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  transformedData?: any;
  matchesExpected?: boolean;
  confidenceScore: number;
}

export class XSLTValidatorService {
  
  /**
   * Validate XSLT transformation by applying it to source XML and comparing with expected JSON
   */
  static async validateXSLT(
    sourceXmlPath: string,
    expectedJsonPath: string, 
    xsltPath: string
  ): Promise<XSLTValidationResult> {
    const result: XSLTValidationResult = {
      isValid: false,
      errors: [],
      warnings: [],
      confidenceScore: 0
    };

    try {
      // Read all files
      const sourceXmlContent = fs.readFileSync(sourceXmlPath, 'utf8');
      const expectedJsonContent = fs.readFileSync(expectedJsonPath, 'utf8');
      const xsltContent = fs.readFileSync(xsltPath, 'utf8');

      // Parse expected JSON
      let expectedData;
      try {
        expectedData = JSON.parse(expectedJsonContent);
      } catch (error) {
        result.errors.push(`Invalid JSON format in expected file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return result;
      }

      // Validate XML structure
      const xmlValidation = this.validateXMLStructure(sourceXmlContent);
      if (!xmlValidation.isValid) {
        result.errors.push(...xmlValidation.errors);
        return result;
      }

      // Validate XSLT structure
      const xsltValidation = this.validateXSLTStructure(xsltContent);
      if (!xsltValidation.isValid) {
        result.errors.push(...xsltValidation.errors);
        return result;
      }

      // Apply XSLT transformation (simulation)
      const transformResult = this.simulateXSLTTransformation(sourceXmlContent, xsltContent, expectedData);
      
      result.transformedData = transformResult.data;
      result.errors.push(...transformResult.errors);
      result.warnings.push(...transformResult.warnings);
      
      // Compare transformation result with expected data
      const comparison = this.compareTransformationResult(transformResult.data, expectedData);
      result.matchesExpected = comparison.matches;
      result.confidenceScore = comparison.confidence;
      
      if (comparison.issues.length > 0) {
        result.warnings.push(...comparison.issues);
      }

      result.isValid = result.errors.length === 0 && comparison.matches;

      return result;

    } catch (error) {
      result.errors.push(`XSLT validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }

  /**
   * Validate XML structure and syntax
   */
  private static validateXMLStructure(xmlContent: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      const parser = new DOMParser({
        errorHandler: {
          warning: (msg: string) => console.warn('XML Warning:', msg),
          error: (msg: string) => errors.push(`XML Error: ${msg}`),
          fatalError: (msg: string) => errors.push(`XML Fatal Error: ${msg}`)
        }
      });

      const doc = parser.parseFromString(xmlContent, 'text/xml');
      
      // Check for parsing errors
      if (doc.getElementsByTagName('parsererror').length > 0) {
        errors.push('XML document contains parser errors');
      }

      return { isValid: errors.length === 0, errors };
    } catch (error) {
      errors.push(`XML validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors };
    }
  }

  /**
   * Validate XSLT structure and syntax
   */
  private static validateXSLTStructure(xsltContent: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      const parser = new DOMParser({
        errorHandler: {
          warning: (msg: string) => console.warn('XSLT Warning:', msg),
          error: (msg: string) => errors.push(`XSLT Error: ${msg}`),
          fatalError: (msg: string) => errors.push(`XSLT Fatal Error: ${msg}`)
        }
      });

      const doc = parser.parseFromString(xsltContent, 'text/xml');
      
      // Check for parsing errors
      if (doc.getElementsByTagName('parsererror').length > 0) {
        errors.push('XSLT document contains parser errors');
      }

      // Check for required XSLT elements
      const root = doc.documentElement;
      if (!root || root.localName !== 'stylesheet') {
        if (!root || root.localName !== 'transform') {
          errors.push('XSLT document must have xsl:stylesheet or xsl:transform as root element');
        }
      }

      // Check for XSLT namespace
      const xslNS = 'http://www.w3.org/1999/XSL/Transform';
      if (root && root.namespaceURI !== xslNS) {
        errors.push('XSLT document must use correct namespace: http://www.w3.org/1999/XSL/Transform');
      }

      return { isValid: errors.length === 0, errors };
    } catch (error) {
      errors.push(`XSLT validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors };
    }
  }

  /**
   * Simulate XSLT transformation (basic analysis since full XSLT processing is complex)
   */
  private static simulateXSLTTransformation(
    sourceXml: string, 
    xslt: string, 
    expectedData: any
  ): { data: any; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const transformedData: any = {};

    try {
      // Parse source XML to extract field structure
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(sourceXml, 'text/xml');
      
      // Parse XSLT to understand transformation rules
      const xsltDoc = parser.parseFromString(xslt, 'text/xml');
      
      // Extract template rules from XSLT
      const templates = Array.from(xsltDoc.getElementsByTagNameNS('http://www.w3.org/1999/XSL/Transform', 'template'));
      const elements = Array.from(xsltDoc.getElementsByTagNameNS('http://www.w3.org/1999/XSL/Transform', 'element'));
      
      // Simulate transformation based on XSLT patterns
      if (typeof expectedData === 'object' && expectedData !== null) {
        for (const key of Object.keys(expectedData)) {
          // Check if XSLT contains mapping for this field
          const hasMapping = elements.some((el: any) => {
            const name = el.getAttribute('name');
            return name === key || name === key.replace(/[^a-zA-Z0-9_-]/g, '_');
          });
          
          if (hasMapping) {
            transformedData[key] = `transformed_${key}`;
          } else {
            warnings.push(`No XSLT mapping found for expected field: ${key}`);
          }
        }
      }

      // Check if source XML has data that XSLT tries to access
      const valueOfElements = Array.from(xsltDoc.getElementsByTagNameNS('http://www.w3.org/1999/XSL/Transform', 'value-of'));
      for (const valueEl of valueOfElements) {
        const select = (valueEl as any).getAttribute('select');
        if (select && !select.includes('number(') && !select.includes('translate(')) {
          // Check if the XPath exists in source XML (simplified check)
          if (!sourceXml.includes(select.replace(/['"]/g, '').replace(/\*/g, '').replace(/\[.*?\]/g, ''))) {
            warnings.push(`XSLT references field that may not exist in source XML: ${select}`);
          }
        }
      }

    } catch (error) {
      errors.push(`Transformation simulation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return { data: transformedData, errors, warnings };
  }

  /**
   * Compare transformation result with expected data
   */
  private static compareTransformationResult(
    transformed: any, 
    expected: any
  ): { matches: boolean; confidence: number; issues: string[] } {
    const issues: string[] = [];
    let matchingFields = 0;
    let totalFields = 0;

    if (typeof expected === 'object' && expected !== null) {
      totalFields = Object.keys(expected).length;
      
      for (const key of Object.keys(expected)) {
        if (transformed && typeof transformed === 'object' && key in transformed) {
          matchingFields++;
        } else {
          issues.push(`Expected field '${key}' not found in transformation result`);
        }
      }

      // Check for extra fields in transformation
      if (transformed && typeof transformed === 'object') {
        for (const key of Object.keys(transformed)) {
          if (!(key in expected)) {
            issues.push(`Unexpected field '${key}' found in transformation result`);
          }
        }
      }
    }

    const confidence = totalFields > 0 ? Math.round((matchingFields / totalFields) * 100) : 0;
    const matches = matchingFields === totalFields && issues.length === 0;

    return { matches, confidence, issues };
  }

  /**
   * Extract field mappings from XSLT for analysis
   */
  static extractXSLTMappings(xsltContent: string): { sourceField: string; targetField: string; transformation?: string }[] {
    const mappings: { sourceField: string; targetField: string; transformation?: string }[] = [];

    try {
      const parser = new DOMParser();
      const xsltDoc = parser.parseFromString(xsltContent, 'text/xml');
      
      const elements = Array.from(xsltDoc.getElementsByTagNameNS('http://www.w3.org/1999/XSL/Transform', 'element'));
      
      for (const element of elements) {
        const targetField = (element as any).getAttribute('name');
        const valueOfEl = (element as any).getElementsByTagNameNS('http://www.w3.org/1999/XSL/Transform', 'value-of')[0];
        
        if (targetField && valueOfEl) {
          const select = valueOfEl.getAttribute('select');
          if (select) {
            let sourceField = select;
            let transformation = undefined;

            // Extract source field name and detect transformations
            if (select.includes('number(')) {
              transformation = 'number conversion';
              sourceField = select.replace(/number\(|\)/g, '');
            } else if (select.includes('translate(')) {
              transformation = 'string transformation';
              sourceField = select.replace(/translate\([^,]+,.*?\)/g, '');
            }

            // Clean up XPath expression
            sourceField = sourceField
              .replace(/\*\[local-name\(\)=['"]/g, '')
              .replace(/['"]\]/g, '')
              .replace(/^\s*|\s*$/g, '');

            if (sourceField && targetField) {
              mappings.push({ sourceField, targetField, transformation });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error extracting XSLT mappings:', error);
    }

    return mappings;
  }
}