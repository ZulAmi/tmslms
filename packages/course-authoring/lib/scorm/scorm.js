'use strict';
/**
 * Full SCORM Service Implementation
 * Complete SCORM 1.2 and 2004 package validation and processing
 */
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.SimpleScormService =
  exports.createFullScormService =
  exports.FullScormService =
    void 0;
const jszip_1 = __importDefault(require('jszip'));
const xml2js_1 = require('xml2js');
const xmldom_1 = require('@xmldom/xmldom');
class FullScormService {
  /**
   * Package SCORM content with full validation and processing
   */
  async package(zipBytes, opts) {
    const version = opts?.version ?? '2004';
    try {
      // Extract and validate the package
      const content = await this.extractContent(zipBytes);
      const validation = await this.validate(content.manifest);
      if (!validation.valid) {
        throw new Error(
          `SCORM package validation failed: ${validation.errors.join(', ')}`
        );
      }
      // Extract metadata
      const metadata = await this.extractMetadata(content.manifest);
      // Validate sequencing for SCORM 2004
      let sequencingValidation;
      if (version === '2004') {
        sequencingValidation = await this.validateSequencing(content.manifest);
        if (!sequencingValidation.valid) {
          console.warn(
            'Sequencing validation warnings:',
            sequencingValidation.warnings
          );
        }
      }
      // Calculate total size
      const totalSize = content.resources.reduce((total, resource) => {
        return (
          total +
          resource.files.reduce((resourceTotal, file) => {
            return resourceTotal + file.content.length;
          }, 0)
        );
      }, 0);
      // Generate package metadata
      const packageMeta = {
        id: crypto.randomUUID(),
        courseId: crypto.randomUUID(),
        version,
        imsmanifestXml: content.manifest,
        sizeBytes: totalSize,
        createdAt: new Date(),
      };
      return packageMeta;
    } catch (error) {
      throw new Error(
        `Failed to package SCORM content: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  /**
   * Comprehensive SCORM manifest validation using XML parsing
   */
  async validate(manifestXml) {
    const errors = [];
    try {
      // Parse XML
      const doc = new xmldom_1.DOMParser().parseFromString(
        manifestXml,
        'text/xml'
      );
      // Check for XML parsing errors
      const parserErrors = doc.getElementsByTagName('parsererror');
      if (parserErrors.length > 0) {
        errors.push('XML parsing error: Invalid XML format');
        return { valid: false, errors };
      }
      // Check for manifest root element
      const manifestNode = doc.documentElement;
      if (!manifestNode || manifestNode.tagName !== 'manifest') {
        errors.push('Missing required manifest root element');
        return { valid: false, errors };
      }
      // Validate required manifest attributes
      if (!manifestNode.getAttribute('identifier')) {
        errors.push('Missing required manifest attribute: identifier');
      }
      if (!manifestNode.getAttribute('version')) {
        errors.push('Missing required manifest attribute: version');
      }
      // Validate organizations
      const organizationsNodes =
        manifestNode.getElementsByTagName('organizations');
      if (organizationsNodes.length === 0) {
        errors.push('Missing required organizations element');
      } else {
        const organizationsNode = organizationsNodes[0];
        const defaultOrgId = organizationsNode.getAttribute('default');
        if (!defaultOrgId) {
          errors.push('Missing required organizations attribute: default');
        } else {
          // Check if default organization exists
          const organizationNodes =
            organizationsNode.getElementsByTagName('organization');
          let defaultOrgFound = false;
          for (let i = 0; i < organizationNodes.length; i++) {
            if (
              organizationNodes[i].getAttribute('identifier') === defaultOrgId
            ) {
              defaultOrgFound = true;
              break;
            }
          }
          if (!defaultOrgFound) {
            errors.push(`Default organization '${defaultOrgId}' not found`);
          }
        }
      }
      // Validate resources
      const resourcesNodes = manifestNode.getElementsByTagName('resources');
      if (resourcesNodes.length === 0) {
        errors.push('Missing required resources element');
      } else {
        const resourceNodes =
          resourcesNodes[0].getElementsByTagName('resource');
        for (let i = 0; i < resourceNodes.length; i++) {
          const resourceNode = resourceNodes[i];
          const identifier = resourceNode.getAttribute('identifier');
          const type = resourceNode.getAttribute('type');
          if (!identifier) {
            errors.push(
              `Missing required resource attribute: identifier for resource ${i}`
            );
          }
          if (!type) {
            errors.push(
              `Missing required resource attribute: type for resource ${identifier || i}`
            );
          }
          // For SCO resources in SCORM 1.2, href is required
          if (type === 'webcontent' && !resourceNode.getAttribute('href')) {
            errors.push(
              `Missing required resource attribute: href for webcontent resource ${identifier}`
            );
          }
        }
      }
      // Validate item references
      const itemNodes = doc.getElementsByTagName('item');
      const resourceIdentifiers = new Set();
      // Collect all resource identifiers
      const resourceNodes = doc.getElementsByTagName('resource');
      for (let i = 0; i < resourceNodes.length; i++) {
        const id = resourceNodes[i].getAttribute('identifier');
        if (id) resourceIdentifiers.add(id);
      }
      // Check item references
      for (let i = 0; i < itemNodes.length; i++) {
        const identifierref = itemNodes[i].getAttribute('identifierref');
        if (identifierref && !resourceIdentifiers.has(identifierref)) {
          errors.push(
            `Item references non-existent resource: ${identifierref}`
          );
        }
      }
      return { valid: errors.length === 0, errors };
    } catch (error) {
      errors.push(
        `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return { valid: false, errors };
    }
  }
  /**
   * Extract full SCORM content from package
   */
  async extractContent(zipBytes) {
    try {
      const zip = await jszip_1.default.loadAsync(zipBytes);
      // Extract manifest
      const manifestFile = zip.file('imsmanifest.xml');
      if (!manifestFile) {
        throw new Error('imsmanifest.xml not found in package');
      }
      const manifest = await manifestFile.async('string');
      // Parse manifest to extract content structure
      const parsedManifest = await (0, xml2js_1.parseStringPromise)(manifest);
      const manifestData = parsedManifest.manifest;
      // Extract organizations
      const organizations = await this.extractOrganizations(manifestData);
      // Extract resources
      const resources = await this.extractResources(manifestData, zip);
      // Extract metadata
      const metadata = await this.extractMetadata(manifest);
      return {
        manifest,
        organizations,
        resources,
        metadata,
      };
    } catch (error) {
      throw new Error(
        `Failed to extract SCORM content: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  /**
   * Validate SCORM 2004 sequencing and navigation
   */
  async validateSequencing(manifestXml) {
    const errors = [];
    const warnings = [];
    try {
      const doc = new xmldom_1.DOMParser().parseFromString(
        manifestXml,
        'text/xml'
      );
      // Check for sequencing elements
      const sequencingNodes = doc.getElementsByTagName('sequencing');
      if (sequencingNodes.length > 0) {
        for (let i = 0; i < sequencingNodes.length; i++) {
          const sequencingNode = sequencingNodes[i];
          // Validate control mode
          const controlModeNodes =
            sequencingNode.getElementsByTagName('controlMode');
          for (let j = 0; j < controlModeNodes.length; j++) {
            const controlMode = controlModeNodes[j];
            const choice = controlMode.getAttribute('choice') === 'true';
            const flow = controlMode.getAttribute('flow') === 'true';
            if (choice && !flow) {
              warnings.push(
                'Choice enabled without flow may lead to navigation issues'
              );
            }
          }
          // Validate sequencing rules
          const ruleNodes =
            sequencingNode.getElementsByTagName('sequencingRule');
          for (let j = 0; j < ruleNodes.length; j++) {
            const rule = ruleNodes[j];
            const action = rule.getAttribute('action');
            if (!action) {
              errors.push('Sequencing rule missing required action attribute');
            }
            const conditionNodes = rule.getElementsByTagName('ruleCondition');
            if (conditionNodes.length === 0) {
              warnings.push(
                'Sequencing rule has no conditions - may not behave as expected'
              );
            }
          }
          // Validate limit conditions
          const limitConditionNodes =
            sequencingNode.getElementsByTagName('limitConditions');
          for (let j = 0; j < limitConditionNodes.length; j++) {
            const limitCondition = limitConditionNodes[j];
            const attemptLimit = limitCondition.getAttribute('attemptLimit');
            if (attemptLimit && parseInt(attemptLimit) <= 0) {
              errors.push('Attempt limit must be greater than 0');
            }
          }
        }
      }
      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      errors.push(
        `Sequencing validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return { valid: false, errors, warnings };
    }
  }
  /**
   * Extract comprehensive metadata from manifest
   */
  async extractMetadata(manifestXml) {
    try {
      const parsedManifest = await (0, xml2js_1.parseStringPromise)(
        manifestXml
      );
      const manifestData = parsedManifest.manifest;
      const metadata = {};
      // Extract metadata from lom (Learning Object Metadata)
      if (
        manifestData.metadata &&
        manifestData.metadata[0] &&
        manifestData.metadata[0].lom
      ) {
        const lom = manifestData.metadata[0].lom[0];
        // General metadata
        if (lom.general) {
          metadata.general = {
            identifier: lom.general[0].identifier?.[0].entry?.[0],
            title: lom.general[0].title?.[0].string?.[0]._,
            language: lom.general[0].language?.[0],
            description: lom.general[0].description?.[0].string?.[0]._,
            keyword: lom.general[0].keyword?.map((k) => k.string[0]._),
            coverage: lom.general[0].coverage?.[0].string?.[0]._,
            aggregationLevel: parseInt(
              lom.general[0].aggregationLevel?.[0].value?.[0]
            ),
          };
        }
        // Lifecycle metadata
        if (lom.lifeCycle) {
          metadata.lifecycle = {
            version: lom.lifeCycle[0].version?.[0].string?.[0]._,
            status: lom.lifeCycle[0].status?.[0].value?.[0],
            contribute: lom.lifeCycle[0].contribute?.map((c) => ({
              role: c.role[0].value[0],
              entity: c.entity?.map((e) => e),
              date: c.date?.[0].dateTime?.[0],
            })),
          };
        }
        // Technical metadata
        if (lom.technical) {
          metadata.technical = {
            format: lom.technical[0].format?.map((f) => f),
            size: parseInt(lom.technical[0].size?.[0]),
            location: lom.technical[0].location?.[0],
            duration: lom.technical[0].duration?.[0].duration?.[0],
          };
        }
        // Educational metadata
        if (lom.educational) {
          metadata.educational = {
            interactivityType:
              lom.educational[0].interactivityType?.[0].value?.[0],
            learningResourceType: lom.educational[0].learningResourceType?.map(
              (l) => l.value[0]
            ),
            interactivityLevel: parseInt(
              lom.educational[0].interactivityLevel?.[0].value?.[0]
            ),
            difficulty: parseInt(lom.educational[0].difficulty?.[0].value?.[0]),
            typicalLearningTime:
              lom.educational[0].typicalLearningTime?.[0].duration?.[0],
            language: lom.educational[0].language?.map((l) => l),
          };
        }
      }
      return metadata;
    } catch (error) {
      console.warn('Failed to extract metadata:', error);
      return {};
    }
  }
  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================
  async extractOrganizations(manifestData) {
    const organizations = [];
    if (
      manifestData.organizations &&
      manifestData.organizations[0].organization
    ) {
      for (const org of manifestData.organizations[0].organization) {
        const organization = {
          identifier: org.$.identifier,
          title: org.title ? org.title[0] : org.$.identifier,
          items: await this.extractItems(org.item || []),
        };
        organizations.push(organization);
      }
    }
    return organizations;
  }
  async extractItems(itemData) {
    const items = [];
    for (const itemDef of itemData) {
      const item = {
        identifier: itemDef.$.identifier,
        title: itemDef.title ? itemDef.title[0] : itemDef.$.identifier,
        identifierref: itemDef.$.identifierref,
        children: itemDef.item ? await this.extractItems(itemDef.item) : [],
        prerequisites: itemDef.$.prerequisites,
        maxtimeallowed: itemDef.$.maxtimeallowed,
        timelimitaction: itemDef.$.timelimitaction,
        datafromlms: itemDef.$.datafromlms,
        masteryscore: itemDef.$.masteryscore
          ? parseFloat(itemDef.$.masteryscore)
          : undefined,
      };
      items.push(item);
    }
    return items;
  }
  async extractResources(manifestData, zip) {
    const resources = [];
    if (manifestData.resources && manifestData.resources[0].resource) {
      for (const res of manifestData.resources[0].resource) {
        const files = [];
        // Extract files for this resource
        if (res.file) {
          for (const fileDef of res.file) {
            const href = fileDef.$.href;
            const zipFile = zip.file(href);
            if (zipFile) {
              const content = await zipFile.async('nodebuffer');
              const extension = href.substring(href.lastIndexOf('.'));
              const mimeType =
                FullScormService.MIME_TYPE_MAP[extension] ||
                'application/octet-stream';
              files.push({
                href,
                content,
                mimeType,
              });
            }
          }
        }
        const resource = {
          identifier: res.$.identifier,
          type: res.$.type,
          href: res.$.href,
          files,
          dependencies: res.dependency
            ? res.dependency.map((dep) => dep.$.identifierref)
            : [],
        };
        resources.push(resource);
      }
    }
    return resources;
  }
  getMimeType(filename) {
    const extension = filename.substring(filename.lastIndexOf('.'));
    return (
      FullScormService.MIME_TYPE_MAP[extension] || 'application/octet-stream'
    );
  }
}
exports.FullScormService = FullScormService;
exports.SimpleScormService = FullScormService;
FullScormService.MIME_TYPE_MAP = {
  '.html': 'text/html',
  '.htm': 'text/html',
  '.xml': 'application/xml',
  '.xsd': 'application/xml',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.swf': 'application/x-shockwave-flash',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
};
// Factory function for easy service creation
function createFullScormService() {
  return new FullScormService();
}
exports.createFullScormService = createFullScormService;
