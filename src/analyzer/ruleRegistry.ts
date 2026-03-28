import type { AnalysisRule } from '../types/rules.js';
import { heavyScriptsRule } from './rules/heavyScripts.js';
import { duplicateLibrariesRule } from './rules/duplicateLibraries.js';
import { renderBlockingRule } from './rules/renderBlocking.js';
import { imageOptimizationRule } from './rules/imageOptimization.js';
import { thirdPartyImpactRule } from './rules/thirdPartyImpact.js';
import { resourceHintsRule } from './rules/resourceHints.js';

export function getDefaultRules(): AnalysisRule[] {
  return [
    heavyScriptsRule,
    duplicateLibrariesRule,
    renderBlockingRule,
    imageOptimizationRule,
    thirdPartyImpactRule,
    resourceHintsRule,
  ];
}
