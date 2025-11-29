/**
 * Plans Feature Types
 *
 * Type definitions for content planning and client review system
 */

export type Platform =
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'linkedin'
  | 'youtube'
  | 'twitter';

export type PostStatus =
  | 'draft'
  | 'in_review'
  | 'approved'
  | 'scheduled'
  | 'published';

export type ReviewStatus =
  | 'not_submitted'
  | 'pending'
  | 'approved'
  | 'changes_requested';

export type PlanStatus =
  | 'draft'
  | 'sent_to_client'
  | 'partially_approved'
  | 'fully_approved';

export interface Media {
  id: string;
  url: string;
  type: 'image' | 'video';
  thumbnail_url?: string;
}

export interface Post {
  id: string;
  platform: Platform;
  account_id: string;
  account_name: string;
  caption: string;
  media: Media[];
  status: PostStatus;
  review_status: ReviewStatus;
  review_comment?: string;
  scheduled_at: Date | null;
  proposed_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Plan {
  id: string;
  title: string;
  description?: string;
  account_ids: string[];
  post_ids: string[];
  share_token: string;
  status: PlanStatus;
  expires_at?: Date | null;
  client_name?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PostReview {
  id: string;
  plan_id: string;
  post_id: string;
  client_status: ReviewStatus;
  client_comment?: string;
  reviewed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// DTOs for API

export interface CreatePlanDTO {
  title: string;
  description?: string;
  post_ids: string[];
  client_name?: string;
  expires_in_days?: number;
}

export interface PlanWithPosts extends Plan {
  posts: Post[];
  reviews: PostReview[];
}

export interface SharedPlanData {
  plan: Omit<Plan, 'account_ids'>;
  posts: (Post & { review?: PostReview })[];
}

export interface UpdateReviewDTO {
  client_status: 'approved' | 'changes_requested';
  client_comment?: string;
}

export interface SchedulePostDTO {
  scheduled_at: Date;
}

// Stats for dashboard
export interface PlanStats {
  total_posts: number;
  approved: number;
  pending: number;
  changes_requested: number;
  platforms: Platform[];
}
