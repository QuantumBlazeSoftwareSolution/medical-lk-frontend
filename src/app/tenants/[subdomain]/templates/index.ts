import TemplateDefault from './TemplateDefault';
import TemplateProHealth from './TemplateProHealth';
import TemplateGeneX from './TemplateGeneX';

export const WEBSITE_TEMPLATES: Record<string, React.ComponentType<any>> = {
  'default': TemplateDefault,
  'prohealth': TemplateProHealth,
  'genex': TemplateGeneX,
};

export type TemplateId = keyof typeof WEBSITE_TEMPLATES;
