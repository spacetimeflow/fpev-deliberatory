/**
 * Shared types for the state layer (P1).
 * Files are the database (P1/A3): these types are the derived view,
 * never the source of truth.
 */

export interface HandoffMeta {
  stage?: string;
  artifact?: string;
  project?: string;
  phase?: string;
  status?: string;
  "created-at"?: string;
  authors?: string | string[];
  reads?: string[];
  siblings?: string[];
  [key: string]: unknown;
}

export interface ParsedHandoff {
  path: string;
  name: string;
  meta: HandoffMeta;
  body: string;
  /** Parse error, if any (A7: reported, never silent). */
  error?: string;
  hadFrontmatter: boolean;
  // Derived (frontmatter first, name fallback; ambiguous → warning)
  stageNum?: number;
  stageName?: string;
  artifactKind?: string;
  phaseId?: string;
  isRevision: boolean;
  revisionNum?: number;
  revisionOf?: string;
  authors: string[];
}

export interface GapEntry {
  id: string;
  title: string;
  status: string;
  path: string;
}

export interface ArtifactEntry {
  id: string;
  path: string;
  name: string;
  stageNum?: number;
  stageName?: string;
  phaseId?: string;
  status?: string;
  authors: string[];
  isRevision: boolean;
  error?: string;
}

export interface ProjectState {
  root: string;
  handoffDir: string;
  handoffs: ParsedHandoff[];
  artifacts: ArtifactEntry[];
  gaps: GapEntry[];
  currentStage: string;
  currentStageNum?: number;
  currentPhase: string;
  parseErrors: string[];
  warnings: string[];
  /** True when the newest handoff is a human-feedback-replies — hop 1 landed, hop 2 pending. */
  awaitingHarness: boolean;
}
