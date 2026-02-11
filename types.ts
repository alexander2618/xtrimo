
export type TabType = 'basic' | 'bio' | 'research' | 'experiment' | 'target';

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface BioAnalysisResult {
  summary: string;
  thinking: string;
  code: string;
  charts?: string[]; 
}

export interface ResearchStep {
  label: string;
  status: 'pending' | 'loading' | 'completed';
  details?: string;
}

// --- Experiment / PTC Types ---

export type BlockType = 'heading' | 'text' | 'checklist' | 'instruction' | 'warning' | 'note';

export interface ExperimentBlock {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean; 
  params?: Record<string, string>; 
}

export interface Material {
  name: string;
  model?: string;     
  catNum?: string;    
  supplier?: string;
  spec?: string;      
  vendor?: string; // Aligning with hardware vendor
  brand?: string;  // Aligning with consumable brand
  note?: string;
}

// Protocol Schema Alignment
export interface SlotDefinition {
  slot_id: string;
  label: string;
  data_type: 'Number' | 'String' | 'Selection';
  default_value: string;
  required: boolean;
}

export interface ExecutionPhase {
  phase: string;
  instructions: string[];
}

export interface TechnicalParameter {
  key: string;
  value: string;
  unit: string;
}

export interface PTCTemplate {
  id: string;
  title: string;
  description: string;
  tags: string[];
  blocks: ExperimentBlock[];
  equipment?: Material[];
  reagents?: Material[];
  date?: string; 
  
  // New Metadata & Schema fields
  version?: string;
  category?: string;
  slots_definition?: SlotDefinition[];
  resources?: {
    hardware: { name: string; vendor: string }[];
    consumables: { name: string; cat_no: string; brand: string }[];
  };
  experimental_execution?: {
    preparation: string[];
    core_process: ExecutionPhase[];
    technical_parameters: TechnicalParameter[];
    control_safety: string[];
  };
}

export interface ReviewIssue {
  id: string;
  level: 'critical' | 'warning';
  message: string;
  blockId?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  sources?: GroundingSource[];
  bioResult?: BioAnalysisResult;
  isClarification?: boolean;
  retrievalLogic?: string;
  ptcSuggestions?: PTCTemplate[]; 
  reviewIssues?: ReviewIssue[]; 
}

export type KnowledgeMode = 'base' | 'file';

export interface KnowledgeScope {
  mode: KnowledgeMode;
  selectedIds: string[];
}

export interface KnowledgeItem {
  id: string;
  name: string;
  category?: string;
  type?: 'pdf' | 'docx' | 'csv' | 'db' | 'folder';
  date?: string;
  size?: string;
  count?: number; 
}
