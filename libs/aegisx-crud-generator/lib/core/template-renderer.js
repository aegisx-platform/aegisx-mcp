/**
 * Template Renderer
 *
 * Handles template rendering with TemplateManager integration
 * Provides backward compatibility with existing generator code
 */

const fs = require('fs').promises;
const path = require('path');
const Handlebars = require('handlebars');

// Register all required Handlebars helpers
// These must match the helpers in backend-generator.js

function toCamelCase(str) {
  if (!str) return '';
  return str
    .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    .replace(/^([A-Z])/, (_, letter) => letter.toLowerCase());
}

function toKebabCase(str) {
  if (!str) return '';
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();
}

function toPascalCase(str) {
  if (!str) return '';
  return str
    .replace(/(^|_)([a-z])/g, (_, __, letter) => letter.toUpperCase())
    .replace(/_/g, '');
}

// Register or helper that supports multiple arguments
Handlebars.registerHelper('or', function (...args) {
  const options = args[args.length - 1];
  const hasOptionsHash =
    options && typeof options === 'object' && options.hash !== undefined;
  const values = hasOptionsHash ? args.slice(0, -1) : args;
  const result = values.some((v) => Boolean(v));
  if (hasOptionsHash && typeof options.fn === 'function') {
    return result
      ? options.fn(this)
      : options.inverse
        ? options.inverse(this)
        : '';
  }
  return result;
});

Handlebars.registerHelper('toKebabCase', function (str) {
  return toKebabCase(str);
});

Handlebars.registerHelper('toCamelCase', function (str) {
  return toCamelCase(str);
});

Handlebars.registerHelper('toPascalCase', function (str) {
  return toPascalCase(str);
});

Handlebars.registerHelper('uppercase', function (str) {
  if (!str || typeof str !== 'string') return '';
  return str.toUpperCase();
});

Handlebars.registerHelper('eq', function (a, b, options) {
  if (!options || typeof options.fn !== 'function') {
    return a === b;
  }
  return a === b
    ? options.fn(this)
    : options.inverse
      ? options.inverse(this)
      : '';
});

class TemplateRenderer {
  constructor(templateManager) {
    this.templateManager = templateManager;
  }

  /**
   * Render template by name from specific template type
   */
  async render(templateType, templateName, context) {
    // Get template info from manager
    const template = await this.templateManager.getTemplateForGeneration(
      templateType,
      context.templateVersion || null,
    );

    // Build template file path
    const templatePath = path.join(template.path, templateName);

    // Read and compile template
    const templateContent = await fs.readFile(templatePath, 'utf8');
    const compiled = Handlebars.compile(templateContent);

    const result = compiled(context);

    return result;
  }

  /**
   * Render backend template
   */
  async renderBackend(templateName, context) {
    return this.render('backend', templateName, context);
  }

  /**
   * Render frontend template
   */
  async renderFrontend(templateName, context) {
    return this.render('frontend', templateName, context);
  }

  /**
   * Render template from absolute path (for backward compatibility)
   */
  async renderFromPath(templatePath, context) {
    const templateContent = await fs.readFile(templatePath, 'utf8');
    const compiled = Handlebars.compile(templateContent);
    return compiled(context);
  }

  /**
   * Get template path for manual operations
   */
  async getTemplatePath(templateType, templateName, context) {
    const template = await this.templateManager.getTemplateForGeneration(
      templateType,
      context.templateVersion || null,
    );
    return path.join(template.path, templateName);
  }
}

module.exports = TemplateRenderer;
