/**
 * Canonical Mock Dataset for AI Initiative Value Intelligence Platform
 * Single source of truth defined in MOCK_DATA_GUIDE.md
 */

import { InitiativeModel, INITIAL_CANONICAL_INITIATIVES } from "./initiativeStore";

export type { InitiativeModel as InitiativeMock } from "./initiativeStore";

export interface OrganizationMock {
  id: string;
  name: string;
  legalEntity: string;
  industry: string;
  annualAiBudget: string;
  region: string;
}

export interface PersonaMock {
  id: string;
  name: string;
  role: string;
  email: string;
  department: string;
  initials: string;
}

export interface AiRecommendationMock {
  id: string;
  title: string;
  description: string;
  impact: string;
  confidence: number;
  citation: string;
  isPrimary?: boolean;
}

export interface AuditEventMock {
  id: string;
  title: string;
  timestamp: string;
  user: string;
  userInitials: string;
  type: "approval" | "cost" | "ai" | "milestone";
}

export interface MilestoneMock {
  id: string;
  title: string;
  dueDate: string;
  owner: string;
  status: "Upcoming" | "In Review" | "Due Today";
}

export const MOCK_ORGANIZATIONS: OrganizationMock[] = [
  {
    id: "org_acme_corp",
    name: "Acme Enterprise Solutions",
    legalEntity: "Acme Corp Inc.",
    industry: "Financial Services & Fintech",
    annualAiBudget: "$5,000,000",
    region: "US-East (Virginia)",
  },
  {
    id: "org_globex_tech",
    name: "Globex Global Technologies",
    legalEntity: "Globex Holdings Ltd.",
    industry: "Cloud Infrastructure & SaaS",
    annualAiBudget: "$8,500,000",
    region: "US-West (Oregon)",
  },
  {
    id: "org_soylent_corp",
    name: "Soylent Health & Life Sciences",
    legalEntity: "Soylent Pharma AG",
    industry: "Healthcare & Life Sciences",
    annualAiBudget: "$3,200,000",
    region: "EU-Central (Frankfurt)",
  },
];

export const MOCK_PERSONAS: PersonaMock[] = [
  {
    id: "usr_cfo",
    name: "Sarah Jenkins",
    role: "Chief Financial Officer (CFO)",
    email: "sarah.jenkins@acme.com",
    department: "Executive / Finance",
    initials: "SJ",
  },
  {
    id: "usr_vp_eng",
    name: "Alex Rivera",
    role: "VP of Software Engineering",
    email: "alex.rivera@acme.com",
    department: "Engineering",
    initials: "AR",
  },
  {
    id: "usr_cto",
    name: "Marcus Vance",
    role: "Chief Technology Officer (CTO)",
    email: "marcus.vance@acme.com",
    department: "Technology",
    initials: "MV",
  },
  {
    id: "usr_pm",
    name: "David Miller",
    role: "Principal Product Manager",
    email: "david.miller@acme.com",
    department: "Operations",
    initials: "DM",
  },
  {
    id: "usr_ai_engine",
    name: "Value Intel AI Engine",
    role: "Decision Intelligence Agent",
    email: "ai-engine@system.internal",
    department: "AI Value Studio",
    initials: "VI",
  },
];

export const MOCK_INITIATIVES: InitiativeModel[] = INITIAL_CANONICAL_INITIATIVES;

export const MOCK_AI_RECOMMENDATIONS: AiRecommendationMock[] = [
  {
    id: "rec_gpu_opt",
    title: "Consolidate GPU Inference Clusters",
    description: "Migrating off-peak LLM workloads to serverless Dataproc batch sessions will reduce compute costs by $140,000 annually without degrading SLA.",
    impact: "+$140k/yr savings",
    confidence: 94,
    citation: "AI Baseline Projections v2.4",
    isPrimary: true,
  },
  {
    id: "rec_base_recal",
    title: "Recalibrate Target Baseline for Support Bot",
    description: "Ticket resolution velocity exceeded initial 30% baseline target by +12%. Update metrics target to 42% for accurate value tracking.",
    impact: "+12% baseline uplift",
    confidence: 88,
    citation: "Customer Care Performance Audit",
    isPrimary: false,
  },
];

export const MOCK_AUDIT_EVENTS: AuditEventMock[] = [
  {
    id: "act_1",
    title: "Baseline Financial Milestone approved for Customer Support Automation",
    timestamp: "25m ago",
    user: "Sarah Jenkins (CFO)",
    userInitials: "SJ",
    type: "approval",
  },
  {
    id: "act_2",
    title: "AI Value Studio generated GPU cost optimization scenario (-$140k/yr)",
    timestamp: "2h ago",
    user: "Value Intel AI Engine",
    userInitials: "VI",
    type: "ai",
  },
  {
    id: "act_3",
    title: "New cost line item added: NVIDIA A100 Tensor Cloud Compute Cluster",
    timestamp: "5h ago",
    user: "Alex Rivera (VP Eng)",
    userInitials: "AR",
    type: "cost",
  },
  {
    id: "act_4",
    title: "Initiative status transitioned to ACTIVE for AI Code Assistant Pilot",
    timestamp: "1d ago",
    user: "David Miller (PM)",
    userInitials: "DM",
    type: "milestone",
  },
];

export const MOCK_MILESTONES: MilestoneMock[] = [
  {
    id: "ms_1",
    title: "Q3 Post-Deployment ROI Evaluation Gate",
    dueDate: "Aug 15, 2026",
    owner: "Finance Committee",
    status: "Upcoming",
  },
  {
    id: "ms_2",
    title: "GPU Cloud Infrastructure Annual Contract Renewal",
    dueDate: "Sep 01, 2026",
    owner: "IT Operations",
    status: "In Review",
  },
  {
    id: "ms_3",
    title: "Baseline Metric Sign-off: Document Processing AI",
    dueDate: "Today",
    owner: "Executive Sponsor",
    status: "Due Today",
  },
];
