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
  reminder?: {
    date: Date;
    sent: boolean;
  };
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
