export type UserRole = "creator" | "admin";

export interface UserProfile {
  id: string;
  user_id: string;
  role: UserRole;
  full_name: string | null;
  created_at: string;
  updated_at: string;
  email?: string;
}

export type ContentStatus = "pending" | "approved" | "rejected";

export interface ContentPiece {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  video_url: string;
  video_urls: string[];
  status: ContentStatus;
  feedback: string | null;
  client_token: string;
  assigned_to: string | null;
  assigned_by: string | null;
  assigned_at: string | null;
  created_at: string;
  updated_at: string;
  assignee?: { full_name: string | null; user_id: string } | null;
  assignees?: ContentAssignee[];
  creator?: UserProfile | null;
  isCurrentUserAssigned?: boolean;
  isCurrentUserCreator?: boolean;
}

export interface ContentAssignee {
  id: string;
  content_id: string;
  user_id: string;
  has_responded: boolean;
  responded_at: string | null;
  response?: "approved" | "rejected" | null;
  profile?: UserProfile | null;
}

export interface Notification {
  id: string;
  user_id: string;
  content_id: string;
  type: "assigned" | "approved" | "rejected" | "feedback_added";
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface CreateContentPayload {
  title: string;
  description?: string;
  video_url: string;
  video_urls: string[];
  assignee_ids?: string[];
}

export interface UpdateContentPayload {
  title?: string;
  description?: string;
  video_url?: string;
  video_urls?: string[];
}

export interface AdminApprovalPayload {
  status: "approved" | "rejected";
  feedback?: string;
}

export interface ClientUpdatePayload {
  status: "approved" | "rejected";
  feedback?: string;
}

export interface DashboardStats {
  total_content: number;
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  assigned_pending_count: number;
}

export type ViewMode = "grid" | "list";
