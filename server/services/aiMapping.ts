import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";
import { DetectedSchema } from "./fileProcessor.js"; // keep .js if this is compiled ESM

// ✅ Lazy OpenAI client initialization to avoid startup errors
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.');
    }
    openai = new OpenAI({ 
      apiKey,
      timeout: 120000, // 120 seconds timeout
      maxRetries: 2, // Retry up to 2 times on failure
    });
  }
  return openai;
}

export interface FieldMappingSuggestion {
  sourceField: string;
  targetField: string | null;
  confidence: number;
  mappingType: "auto" | "suggested" | "manual" | "unmapped";
  transformation?: {
    typeConversion?: string;
    formatChange?: string;
    defaultValue?: any;
    customLogic?: string;
  };
  reasoning?: string;
}

export interface MappingAnalysis {
  mappings: FieldMappingSuggestion[];
  overallConfidence: number;
  autoMatches: number;
  suggestedMatches: number;
  manualReviewNeeded: number;
}

export class AIMappingService {
  static async generateFieldMappings(
    sourceSchema: DetectedSchema,
    targetSchema: DetectedSchema
  ): Promise<MappingAnalysis> {
    console.log('[AI MAPPING] Starting field mapping generation...');
    console.log(`[AI MAPPING] Source fields: ${sourceSchema.fields.length}, Target fields: ${targetSchema.fields.length}`);
    
    try {
      const prompt = this.buildMappingPrompt(sourceSchema, targetSchema);

      console.log('[AI MAPPING] Sending request to OpenAI GPT-4...');
      const startTime = Date.now();
      
      const response = await getOpenAIClient().chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert data integration specialist. Analyze the source and target schemas and provide intelligent field mapping suggestions. Consider field names, data types, common naming patterns, and semantic similarity. 

            Respond with JSON in this exact format:
            {
              "mappings": [
                {
                  "sourceField": "field_name",
                  "targetField": "mapped_field_name_or_null",
                  "confidence": 85,
                  "mappingType": "auto|suggested|unmapped",
                  "transformation": {
                    "typeConversion": "string_to_integer",
                    "formatChange": "description_if_needed"
                  },
                  "reasoning": "brief_explanation"
                }
              ],
              "analysis": {
                "overallConfidence": 78,
                "notes": "overall_analysis_notes"
              }
            }

            Confidence scoring:
            - 90-100: Perfect semantic and type match (auto)
            - 75-89: Good semantic match, minor differences (suggested)
            - 50-74: Possible match, needs review (suggested)
            - Below 50: No clear match (unmapped)
            `
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      });
      
      const elapsed = Date.now() - startTime;
      console.log(`[AI MAPPING] Received response from OpenAI in ${elapsed}ms`);

      // Clean up response content and extract JSON  
      let content = response.choices[0].message.content || '{}';
      
      // Remove markdown code fencing
      content = content.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '');
      content = content.replace(/```\s*/g, '');
      
      // Remove control characters that can break JSON parsing
      content = content.replace(/[\x00-\x1F\x7F]/g, '');
      
      // Remove JSON comments (/* ... */ and // ...)
      content = content.replace(/\/\*[\s\S]*?\*\//g, '');
      content = content.replace(/\/\/.*$/gm, '');
      
      // Try to extract JSON from the response (handle cases where AI adds descriptive text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        content = jsonMatch[0];
      }
      
      // Try to parse JSON with enhanced error handling
      let result;
      try {
        result = JSON.parse(content);
      } catch (parseError) {
        console.error('Failed to parse AI response JSON:', parseError instanceof Error ? parseError.message : 'Unknown error');
        console.error('Content that failed to parse:', content);
        
        // Try to fix common JSON issues and retry
        try {
          // Fix unescaped quotes and trailing commas
          let fixedContent = content
            .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
            .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
            .replace(/:\s*([^",{\[\]}\s][^",{\[\]}\s]*?)([,}\]])/g, ': "$1"$2'); // Quote unquoted values
            
          result = JSON.parse(fixedContent);
        } catch (secondParseError) {
          // If all else fails, return a basic structure based on source schema
          console.error('Second JSON parse attempt failed, falling back to basic mapping');
          result = {
            mappings: sourceSchema.fields.map(field => ({
              sourceField: field.name,
              targetField: null,
              confidence: 10,
              mappingType: "unmapped",
              reasoning: "AI parsing failed, manual review required"
            })),
            analysis: {
              overallConfidence: 10,
              notes: "AI response parsing failed, please review mappings manually"
            }
          };
        }
      }
      
      console.log('[AI MAPPING] Successfully processed mapping result');
      return this.processMappingResult(result);

    } catch (error) {
      console.error('[AI MAPPING] Error during field mapping generation:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('timed out')) {
          throw new Error('AI mapping request timed out. The schemas might be too large or OpenAI API is experiencing delays. Please try again.');
        }
        if (error.message.includes('API key')) {
          throw new Error('OpenAI API key is not configured or invalid. Please contact support.');
        }
        if (error.message.includes('rate limit')) {
          throw new Error('OpenAI rate limit exceeded. Please try again in a few moments.');
        }
        throw new Error(`AI mapping failed: ${error.message}`);
      }
      
      throw new Error(`AI mapping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static buildMappingPrompt(sourceSchema: DetectedSchema, targetSchema: DetectedSchema): string {
    return `Analyze these schemas for field mapping:

SOURCE SCHEMA (${sourceSchema.format}):
${sourceSchema.fields.map(f => `- ${f.name}: ${f.type}${f.sample ? ` (sample: ${JSON.stringify(f.sample)})` : ''}`).join('\n')}

TARGET SCHEMA (${targetSchema.format}):
${targetSchema.fields.map(f => `- ${f.name}: ${f.type}${f.sample ? ` (sample: ${JSON.stringify(f.sample)})` : ''}`).join('\n')}

Please map each source field to the most appropriate target field. Consider:
1. Exact name matches (highest confidence)
2. Semantic similarity (e.g., "first_name" to "firstName")
3. Type compatibility and required conversions
4. Common business field patterns
5. Fields that have no reasonable match should be marked as unmapped

For each mapping, provide transformation details if type conversion or format changes are needed.`;
  }

  private static processMappingResult(result: any): MappingAnalysis {
    const mappings: FieldMappingSuggestion[] = result.mappings.map((mapping: any) => ({
      sourceField: mapping.sourceField,
      targetField: mapping.targetField,
      confidence: Math.min(100, Math.max(0, mapping.confidence || 0)),
      mappingType: this.determineMappingType(mapping.confidence, mapping.targetField),
      transformation: mapping.transformation,
      reasoning: mapping.reasoning,
    }));

    const autoMatches = mappings.filter(m => m.mappingType === "auto").length;
    const suggestedMatches = mappings.filter(m => m.mappingType === "suggested").length;
    const manualReviewNeeded = mappings.filter(m => m.mappingType === "unmapped").length;

    const overallConfidence = mappings.length > 0 
      ? Math.round(mappings.reduce((sum, m) => sum + m.confidence, 0) / mappings.length)
      : 0;

    return {
      mappings,
      overallConfidence,
      autoMatches,
      suggestedMatches,
      manualReviewNeeded,
    };
  }

  private static determineMappingType(confidence: number, targetField: string | null): "auto" | "suggested" | "unmapped" {
    if (!targetField) return "unmapped";
    if (confidence >= 90) return "auto";
    if (confidence >= 50) return "suggested";
    return "unmapped";
  }

  static async generateTransformationCode(mappings: FieldMappingSuggestion[]): Promise<{
    pythonCode: string;
    apiSpec: any;
    testCases: any[];
  }> {
    try {
      const prompt = `Generate transformation code based on these field mappings:

${mappings.map(m => `${m.sourceField} -> ${m.targetField} (${m.mappingType}, confidence: ${m.confidence}%)${m.transformation ? ` [Transform: ${JSON.stringify(m.transformation)}]` : ''}`).join('\n')}

Please provide:
1. Python transformation function
2. OpenAPI specification for the integration
3. Test cases for validation

Respond with JSON in this format:
{
  "pythonCode": "complete_python_transformation_function",
  "apiSpec": "openapi_3_0_specification_object",
  "testCases": "array_of_test_cases_with_input_output"
}`;

      console.log('[AI CODE GEN] Sending request to OpenAI...');
      const response = await getOpenAIClient().chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert software engineer specializing in data transformation and API design. Generate production-ready code with proper error handling, type validation, and comprehensive test coverage."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      console.log('[AI CODE GEN] Received response from OpenAI');

      // Clean up response content and extract JSON
      let content = response.choices[0].message.content || '{}';
      console.log('[AI CODE GEN] Raw response content:', content.substring(0, 500) + (content.length > 500 ? '...' : ''));
      
      // Remove markdown code fencing
      content = content.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '');
      content = content.replace(/```\s*/g, '');
      
      // Remove control characters that can break JSON parsing
      content = content.replace(/[\x00-\x1F\x7F]/g, '');
      
      // Try to extract JSON from the response (handle cases where AI adds descriptive text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        content = jsonMatch[0];
      }
      
      console.log('[AI CODE GEN] Cleaned content for parsing:', content.substring(0, 300) + (content.length > 300 ? '...' : ''));
      
      // Try to parse JSON with fallback error handling
      let result;
      try {
        result = JSON.parse(content);
      } catch (parseError) {
        // If JSON parsing fails, try to fix common issues and retry
        try {
          // Attempt to fix unescaped quotes within string values
          const fixedContent = content.replace(/("(?:[^"\\]|\\.)*")\s*:\s*"([^"]*(?:\\.[^"]*)*)"/g, (match, key, value) => {
            // Escape unescaped quotes within the value
            const escapedValue = value.replace(/(?<!\\)"/g, '\\"');
            return `${key}: "${escapedValue}"`;
          });
          result = JSON.parse(fixedContent);
        } catch (secondParseError) {
          // If all else fails, return a default structure
          console.error('[AI CODE GEN] Failed to parse AI response JSON - First error:', parseError instanceof Error ? parseError.message : 'Unknown error');
          console.error('[AI CODE GEN] Failed to parse AI response JSON - Second error:', secondParseError instanceof Error ? secondParseError.message : 'Unknown error');
          console.error('[AI CODE GEN] Problematic content:', content);
          
          result = {
            pythonCode: "# Code generation failed - invalid JSON response",
            apiSpec: {},
            testCases: []
          };
        }
      }
      
      return {
        pythonCode: result.pythonCode || "# Generated transformation code would appear here",
        apiSpec: result.apiSpec || {},
        testCases: result.testCases || [],
      };

    } catch (error) {
      throw new Error(`Code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
