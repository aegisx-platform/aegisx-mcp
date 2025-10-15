import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PDFMakeService } from '../../../services/pdfmake.service';

/**
 * PDF Fonts Management Routes
 *
 * Provides endpoints for font management and status checking
 */
export async function pdfFontsRoutes(fastify: FastifyInstance) {
  const pdfMakeService = new PDFMakeService();

  /**
   * Get Available Fonts
   * GET /api/pdf-fonts/available
   */
  fastify.get(
    '/available',
    {
      schema: {
        description: 'Get list of available fonts for PDF generation',
        tags: ['PDF Fonts'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              fonts: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    displayName: { type: 'string' },
                    supportsThaiText: { type: 'boolean' },
                    type: {
                      type: 'string',
                      enum: ['builtin', 'custom', 'thai'],
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Wait for fonts to be initialized
        await pdfMakeService.waitForFonts();

        const availableFonts = pdfMakeService.getAvailableFonts();
        const fontManager = pdfMakeService.getFontManager();

        const fontsInfo = availableFonts.map((fontName) => {
          const isThaiFont =
            fontManager.isFontAvailable(fontName) &&
            ['THSarabun', 'Sarabun', 'Tahoma'].includes(fontName);

          let fontType: 'builtin' | 'custom' | 'thai' = 'builtin';
          if (isThaiFont) {
            fontType = 'thai';
          } else if (!['Helvetica', 'Times', 'Courier'].includes(fontName)) {
            fontType = 'custom';
          }

          return {
            name: fontName,
            displayName: getFontDisplayName(fontName),
            supportsThaiText: isThaiFont || fontName === 'Helvetica', // Helvetica has some Thai support
            type: fontType,
          };
        });

        return reply.send({
          success: true,
          fonts: fontsInfo,
        });
      } catch (error) {
        request.log.error({ error }, 'Failed to get available fonts');

        return reply.code(500).send({
          success: false,
          error: 'Failed to retrieve available fonts',
        });
      }
    },
  );

  /**
   * Get Font Status
   * GET /api/pdf-fonts/status
   */
  fastify.get(
    '/status',
    {
      schema: {
        description: 'Get font system status and diagnostics',
        tags: ['PDF Fonts'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              status: {
                type: 'object',
                properties: {
                  initialized: { type: 'boolean' },
                  configured: { type: 'array', items: { type: 'string' } },
                  loaded: { type: 'array', items: { type: 'string' } },
                  failed: { type: 'array', items: { type: 'string' } },
                  thaiFontsAvailable: { type: 'boolean' },
                  recommendations: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const fontStatus = pdfMakeService.getFontStatus();

        // Generate recommendations based on status
        const recommendations: string[] = [];

        if (!fontStatus.thaiFontsAvailable) {
          recommendations.push(
            'Download Thai fonts (THSarabun or Sarabun) for better Thai text support',
          );
          recommendations.push('Place font files in assets/fonts directory');
        }

        if (fontStatus.failed.length > 0) {
          recommendations.push(
            `Check font file paths for: ${fontStatus.failed.join(', ')}`,
          );
        }

        if (fontStatus.loaded.length === 0) {
          recommendations.push(
            'Using built-in fonts only - consider adding custom fonts for better design flexibility',
          );
        }

        return reply.send({
          success: true,
          status: {
            ...fontStatus,
            recommendations,
          },
        });
      } catch (error) {
        request.log.error({ error }, 'Failed to get font status');

        return reply.code(500).send({
          success: false,
          error: 'Failed to retrieve font status',
        });
      }
    },
  );

  /**
   * Test Font Rendering
   * POST /api/pdf-fonts/test
   */
  fastify.post<{
    Body: {
      fontFamily: string;
      text?: string;
      fontSize?: number;
    };
  }>(
    '/test',
    {
      schema: {
        description: 'Test font rendering with sample text',
        tags: ['PDF Fonts'],
        body: {
          type: 'object',
          properties: {
            fontFamily: { type: 'string' },
            text: { type: 'string' },
            fontSize: { type: 'number', minimum: 6, maximum: 72 },
          },
          required: ['fontFamily'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              testResult: {
                type: 'object',
                properties: {
                  fontFamily: { type: 'string' },
                  fontSize: { type: 'number' },
                  text: { type: 'string' },
                  isAvailable: { type: 'boolean' },
                  supportsThaiText: { type: 'boolean' },
                  previewUrl: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{
        Body: {
          fontFamily: string;
          text?: string;
          fontSize?: number;
        };
      }>,
      reply: FastifyReply,
    ) => {
      try {
        const {
          fontFamily,
          text = 'Sample Text สวัสดี ทดสอบฟอนต์ไทย 123',
          fontSize = 12,
        } = request.body;

        // Wait for fonts to be initialized
        await pdfMakeService.waitForFonts();

        const fontManager = pdfMakeService.getFontManager();
        const isAvailable = fontManager.isFontAvailable(fontFamily);
        const supportsThaiText =
          /[\u0E00-\u0E7F]/.test(text) &&
          (fontFamily === 'THSarabun' ||
            fontFamily === 'Sarabun' ||
            fontFamily === 'Helvetica');

        // Generate a test PDF preview
        const testDocDefinition = {
          content: [
            {
              text: 'Font Test',
              style: 'header',
              alignment: 'center',
              margin: [0, 0, 0, 20],
            },
            {
              text: `Font: ${fontFamily}`,
              fontSize: 10,
              margin: [0, 0, 0, 10],
            },
            {
              text: `Size: ${fontSize}pt`,
              fontSize: 10,
              margin: [0, 0, 0, 20],
            },
            {
              text: text,
              font: fontFamily,
              fontSize: fontSize,
              alignment: 'center',
              margin: [0, 20, 0, 20],
            },
            {
              text: 'English: The quick brown fox jumps over the lazy dog.',
              font: fontFamily,
              fontSize: fontSize - 2,
              margin: [0, 10, 0, 10],
            },
            {
              text: 'ไทย: นกกระสาตัวใหญ่ เปียกปอนเปรอะเปื้อน อยู่ในป่าใป่.',
              font: fontFamily,
              fontSize: fontSize - 2,
              margin: [0, 10, 0, 10],
            },
            {
              text: 'Numbers: 0123456789',
              font: fontFamily,
              fontSize: fontSize - 2,
              margin: [0, 10, 0, 10],
            },
          ],
          styles: {
            header: {
              fontSize: 16,
              bold: true,
              font: fontFamily,
            },
          },
          defaultStyle: {
            font: isAvailable ? fontFamily : 'Helvetica',
          },
        };

        // Generate preview
        const previewResult = await pdfMakeService.generatePreview({
          data: [],
          fields: [],
          title: `Font Test: ${fontFamily}`,
          template: 'minimal',
        });

        const testResult = {
          fontFamily,
          fontSize,
          text,
          isAvailable,
          supportsThaiText,
          previewUrl: previewResult.success ? previewResult.previewUrl : null,
        };

        return reply.send({
          success: true,
          testResult,
        });
      } catch (error) {
        request.log.error({ error }, 'Font test failed');

        return reply.code(500).send({
          success: false,
          error: 'Font test failed',
        });
      }
    },
  );

  /**
   * Get Font Recommendations
   * GET /api/pdf-fonts/recommendations
   */
  fastify.get(
    '/recommendations',
    {
      schema: {
        description: 'Get font recommendations for different use cases',
        tags: ['PDF Fonts'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              recommendations: {
                type: 'object',
                properties: {
                  general: { type: 'array', items: { type: 'string' } },
                  thai: { type: 'array', items: { type: 'string' } },
                  english: { type: 'array', items: { type: 'string' } },
                  monospace: { type: 'array', items: { type: 'string' } },
                },
              },
              guidelines: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const fontManager = pdfMakeService.getFontManager();
        const availableFonts = pdfMakeService.getAvailableFonts();

        const recommendations = {
          general: availableFonts.filter((font) =>
            ['Helvetica', 'THSarabun'].includes(font),
          ),
          thai: availableFonts.filter((font) =>
            ['THSarabun', 'Sarabun'].includes(font),
          ),
          english: availableFonts.filter((font) =>
            ['Helvetica', 'Times'].includes(font),
          ),
          monospace: availableFonts.filter((font) =>
            ['Courier'].includes(font),
          ),
        };

        const guidelines = [
          'Use Thai fonts (THSarabun, Sarabun) for documents containing Thai text',
          'Helvetica is a good fallback font with limited Thai support',
          'Use monospace fonts (Courier) for code or data tables',
          'Consider font file size for web-based PDF generation',
          'Test font rendering with your specific content before production use',
          'Ensure consistent font usage across all document templates',
        ];

        return reply.send({
          success: true,
          recommendations,
          guidelines,
        });
      } catch (error) {
        request.log.error({ error }, 'Failed to get font recommendations');

        return reply.code(500).send({
          success: false,
          error: 'Failed to retrieve font recommendations',
        });
      }
    },
  );
}

// Helper functions
function getFontDisplayName(fontName: string): string {
  const displayNames: Record<string, string> = {
    Helvetica: 'Helvetica (System)',
    Times: 'Times New Roman (System)',
    Courier: 'Courier New (System)',
    THSarabun: 'TH Sarabun New (Thai)',
    Sarabun: 'Sarabun (Thai)',
  };

  return displayNames[fontName] || fontName;
}
