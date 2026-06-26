import Template001 from './Template001';
import Template002 from './Template002';
import Template003 from './Template003';

export const WEBSITE_TEMPLATES: Record<string, React.ComponentType<any>> = {
  'template-001': Template001,
  'template-002': Template002,
  'template-003': Template003,
  // Backward compatibility mappings
  'default': Template001,
  'prohealth': Template002,
  'genex': Template003,
};

export type TemplateId = keyof typeof WEBSITE_TEMPLATES;
