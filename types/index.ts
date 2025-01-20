export interface NoteType {
  _id: string;
  title: string;
  content: string;
  userId: string;
  shared: boolean;
  shareId?: string;
  tags: string[];
  category?: string;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
