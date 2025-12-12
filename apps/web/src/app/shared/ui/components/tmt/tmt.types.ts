/**
 * TMT (Thai Medicines Terminology) Types
 */

// TMT Levels
export type TmtLevel =
  | 'VTM'
  | 'GP'
  | 'GPU'
  | 'TP'
  | 'TPU'
  | 'GPP'
  | 'TPP'
  | 'SUBS'
  | 'GP_F'
  | 'GP_X';

// TMT Concept
export interface TmtConcept {
  id: number;
  tmt_id: number;
  concept_code: string;
  level: TmtLevel;
  fsn: string | null;
  preferred_term: string | null;
  strength?: string | null;
  dosage_form?: string | null;
  manufacturer?: string | null;
  pack_size?: string | null;
  unit_of_use?: string | null;
  route_of_administration?: string | null;
  effective_date?: string | null;
  release_date?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// TMT Concept with children (for hierarchy tree)
export interface TmtConceptWithChildren extends TmtConcept {
  children?: TmtConceptWithChildren[];
}

// TMT Hierarchy Response
export interface TmtHierarchy {
  concept: TmtConcept;
  ancestors: TmtConcept[];
  descendants: TmtConceptWithChildren[];
}

// Related Drug in system
export interface RelatedDrug {
  id: number;
  code: string;
  name: string;
  source: 'drug_generics' | 'drugs';
  mapping_field: string;
}

// TMT Statistics
export interface TmtStats {
  total_concepts: number;
  by_level: Record<string, number>;
  mappings: {
    drug_generics: {
      total: number;
      mapped: number;
      coverage: number;
    };
    drugs: {
      total: number;
      mapped: number;
      coverage: number;
    };
  };
}

// Search Options
export interface TmtSearchOptions {
  level?: TmtLevel | TmtLevel[];
  limit?: number;
  includeInactive?: boolean;
}

// Level Configuration (for UI styling)
export interface TmtLevelConfig {
  level: TmtLevel;
  label: string;
  labelTh: string;
  icon: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

// Level configurations
export const TMT_LEVEL_CONFIGS: Record<TmtLevel, TmtLevelConfig> = {
  SUBS: {
    level: 'SUBS',
    label: 'Substance',
    labelTh: 'สารเคมี',
    icon: 'science',
    colorClass: 'text-gray-700',
    bgClass: 'bg-gray-100',
    borderClass: 'border-gray-200',
  },
  VTM: {
    level: 'VTM',
    label: 'Virtual Therapeutic Moiety',
    labelTh: 'สารออกฤทธิ์',
    icon: 'science',
    colorClass: 'text-purple-700',
    bgClass: 'bg-purple-100',
    borderClass: 'border-purple-200',
  },
  GP: {
    level: 'GP',
    label: 'Generic Product',
    labelTh: 'ยาสามัญ',
    icon: 'medication',
    colorClass: 'text-blue-700',
    bgClass: 'bg-blue-100',
    borderClass: 'border-blue-200',
  },
  GPU: {
    level: 'GPU',
    label: 'Generic Product Unit',
    labelTh: 'ยาสามัญ+หน่วย',
    icon: 'inventory_2',
    colorClass: 'text-green-700',
    bgClass: 'bg-green-100',
    borderClass: 'border-green-200',
  },
  TP: {
    level: 'TP',
    label: 'Trade Product',
    labelTh: 'ยาการค้า',
    icon: 'local_pharmacy',
    colorClass: 'text-amber-700',
    bgClass: 'bg-amber-100',
    borderClass: 'border-amber-200',
  },
  TPU: {
    level: 'TPU',
    label: 'Trade Product Unit',
    labelTh: 'ยาการค้า+หน่วย',
    icon: 'package_2',
    colorClass: 'text-red-700',
    bgClass: 'bg-red-100',
    borderClass: 'border-red-200',
  },
  GPP: {
    level: 'GPP',
    label: 'Generic Product Pack',
    labelTh: 'ยาสามัญ+แพ็ค',
    icon: 'inventory',
    colorClass: 'text-teal-700',
    bgClass: 'bg-teal-100',
    borderClass: 'border-teal-200',
  },
  TPP: {
    level: 'TPP',
    label: 'Trade Product Pack',
    labelTh: 'ยาการค้า+แพ็ค',
    icon: 'package',
    colorClass: 'text-orange-700',
    bgClass: 'bg-orange-100',
    borderClass: 'border-orange-200',
  },
  GP_F: {
    level: 'GP_F',
    label: 'Generic Product Form',
    labelTh: 'ยาสามัญ+รูปแบบ',
    icon: 'category',
    colorClass: 'text-indigo-700',
    bgClass: 'bg-indigo-100',
    borderClass: 'border-indigo-200',
  },
  GP_X: {
    level: 'GP_X',
    label: 'Generic Product Extended',
    labelTh: 'ยาสามัญขยาย',
    icon: 'extension',
    colorClass: 'text-pink-700',
    bgClass: 'bg-pink-100',
    borderClass: 'border-pink-200',
  },
};

/**
 * Get level configuration
 */
export function getTmtLevelConfig(level: TmtLevel): TmtLevelConfig {
  return TMT_LEVEL_CONFIGS[level] || TMT_LEVEL_CONFIGS.GPU;
}
