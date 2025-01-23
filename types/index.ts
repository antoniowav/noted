export interface NoteType {
  _id: string;
  title: string;
  content: string;
  userId: string;
  userEmail: string;
  shared: boolean;
  shareId?: string;
  isPinned: boolean;
  isArchived: boolean;
  tags: string[];
  category?: string;
  reminder?: {
    date: Date;
    sent: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CategoryType {
  _id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
