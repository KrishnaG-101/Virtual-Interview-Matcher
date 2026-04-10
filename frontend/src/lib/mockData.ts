import { Candidate, Expert, MatchScore, AuditLogEntry } from "@/types";

export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: "c1",
    name: "Rahul Sharma",
    email: "rahul.sharma@outlook.com",
    domain: "Engineering",
    experience_level: "mid",
    parse_status: "done",
    parsed_skills: ["React", "Node.js", "PostgreSQL", "AWS"],
    experience_years: 4,
    created_at: "2026-04-01T10:00:00Z"
  },
  {
    id: "c2",
    name: "Anjali Gupta",
    email: "anjali.g@gmail.com",
    domain: "Engineering",
    experience_level: "senior",
    parse_status: "done",
    parsed_skills: ["Python", "Kubernetes", "Docker", "Go"],
    experience_years: 8,
    created_at: "2026-04-02T11:30:00Z"
  },
  {
    id: "c3",
    name: "Siddharth Jain",
    email: "sid.jain@corp.in",
    domain: "Finance",
    experience_level: "mid",
    parse_status: "pending",
    parsed_skills: [],
    experience_years: 5,
    created_at: "2026-04-03T09:15:00Z"
  },
  {
    id: "c4",
    name: "Priyanka Verma",
    email: "pverma@law.gov.in",
    domain: "Law",
    experience_level: "senior",
    parse_status: "done",
    parsed_skills: ["Constitutional Law", "Public Policy", "Legal Research"],
    experience_years: 12,
    created_at: "2026-04-04T14:45:00Z"
  },
  {
    id: "c5",
    name: "Vikram Malhotra",
    email: "v.malhotra@mednet.org",
    domain: "Medicine",
    experience_level: "fresher",
    parse_status: "failed",
    parsed_skills: [],
    experience_years: 1,
    created_at: "2026-04-05T08:00:00Z"
  },
  {
    id: "c6",
    name: "Amitabh Bachan",
    email: "amitabh.b@admin.gov",
    domain: "Admin",
    experience_level: "senior",
    parse_status: "done",
    parsed_skills: ["Governance", "Strategic Planning", "Crisis Management"],
    experience_years: 25,
    created_at: "2026-04-06T12:00:00Z"
  },
  {
    id: "c7",
    name: "Sonia Gandhi",
    email: "sonia.g@public.in",
    domain: "Law",
    experience_level: "mid",
    parse_status: "done",
    parsed_skills: ["Corporate Law", "Arbitration"],
    experience_years: 6,
    created_at: "2026-04-07T10:20:00Z"
  },
  {
    id: "c8",
    name: "Virat Kohli",
    email: "virat.k@sports.in",
    domain: "Admin",
    experience_level: "mid",
    parse_status: "done",
    parsed_skills: ["Operations", "Leadership"],
    experience_years: 15,
    created_at: "2026-04-07T16:40:00Z"
  }
];

export const MOCK_EXPERTS: Expert[] = [
  {
    id: "e1",
    name: "Dr. Priya Mehta",
    designation: "Chief Technical Officer",
    domain: "Engineering",
    skills: ["React", "System Design", "Node.js", "Cloud Architecture"],
    experience_years: 15,
    is_active: true
  },
  {
    id: "e2",
    name: "Adv. Rajesh Kumar",
    designation: "Senior Counsel",
    domain: "Law",
    skills: ["Constitutional Law", "Criminal Law", "Public Policy"],
    experience_years: 18,
    is_active: true
  },
  {
    id: "e3",
    name: "Dr. Suresh Raina",
    designation: "Senior Finance Director",
    domain: "Finance",
    skills: ["Audit", "Venture Capital", "Financial Modeling"],
    experience_years: 14,
    is_active: true
  },
  {
    id: "e4",
    name: "Ms. Kiran Mazumdar",
    designation: "Strategic Policy Head",
    domain: "Admin",
    skills: ["Governance", "International Relations", "Public Administration"],
    experience_years: 22,
    is_active: true
  },
  {
    id: "e5",
    name: "Prof. Arvind Subramanian",
    designation: "Lead Researcher",
    domain: "Engineering",
    skills: ["Distributed Systems", "Machine Learning", "Go"],
    experience_years: 12,
    is_active: true
  }
];

export const MOCK_MATCH_RESULTS: Record<string, MatchScore[]> = {
  "c1": [
    {
      id: "m1",
      expert_id: "e1",
      candidate_id: "c1",
      total_score: 0.892,
      score_breakdown: {
        semantic_similarity: 0.94,
        skill_overlap: 0.88,
        experience_delta: 0.85,
        domain_match: 1.0,
        availability_score: 0.45
      },
      rank: 1,
      explanation: "Exceptional alignment in React and Node.js. Domain match is perfect. availability is limited but manageable.",
      status: "suggested",
      override_reason: null,
      assigned_by: null,
      created_at: "2026-04-07T14:00:00Z"
    },
    {
      id: "m2",
      expert_id: "e5",
      candidate_id: "c1",
      total_score: 0.765,
      score_breakdown: {
        semantic_similarity: 0.72,
        skill_overlap: 0.65,
        experience_delta: 0.80,
        domain_match: 1.0,
        availability_score: 0.88
      },
      rank: 2,
      explanation: "Strong domain match. High availability. However, specific skill overlap is lower than rank #1.",
      status: "suggested",
      override_reason: null,
      assigned_by: null,
      created_at: "2026-04-07T14:05:00Z"
    }
  ],
  "c2": [
    {
      id: "m3",
      expert_id: "e5",
      candidate_id: "c2",
      total_score: 0.912,
      score_breakdown: {
        semantic_similarity: 0.95,
        skill_overlap: 0.92,
        experience_delta: 0.88,
        domain_match: 1.0,
        availability_score: 0.85
      },
      rank: 1,
      explanation: "Perfect match for senior profile. Expert has deep knowledge in Kubernetes and Go.",
      status: "suggested",
      override_reason: null,
      assigned_by: null,
      created_at: "2026-04-07T15:00:00Z"
    }
  ]
};

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "l1",
    candidate_name: "Rahul Sharma",
    expert_name: "Dr. Priya Mehta",
    total_score: 0.895,
    status: "approved",
    assigned_by: "admin@hgm07.gov",
    override_reason: null,
    created_at: "2026-04-07T08:30:00Z",
    domain: "Engineering"
  },
  {
    id: "l2",
    candidate_name: "Anjali Gupta",
    expert_name: "Prof. Arvind Subramanian",
    total_score: 0.912,
    status: "approved",
    assigned_by: "admin@hgm07.gov",
    override_reason: null,
    created_at: "2026-04-07T10:15:00Z",
    domain: "Engineering"
  },
  {
    id: "l3",
    candidate_name: "Priyanka Verma",
    expert_name: "Adv. Rajesh Kumar",
    total_score: 0.945,
    status: "approved",
    assigned_by: "admin@hgm07.gov",
    override_reason: null,
    created_at: "2026-04-07T11:45:00Z",
    domain: "Law"
  },
  {
    id: "l4",
    candidate_name: "Vikram Malhotra",
    expert_name: "Ms. Kiran Mazumdar",
    total_score: 0.620,
    status: "overridden",
    assigned_by: "admin@hgm07.gov",
    override_reason: "Urgent evaluation needed for medical profile override to available generalist.",
    created_at: "2026-04-07T14:20:00Z",
    domain: "Medicine"
  }
];
