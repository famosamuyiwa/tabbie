import { CategoryIcons, NotificationType, OAuthProvider } from 'enum/common';

export interface ApiResponse<T = any> {
  code: number;
  status: string;
  message: string;
  data: T;
}

export interface ChatMessage {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: Date;
}

export interface OAuthRequest {
  provider: OAuthProvider;
  name: string;
  email: string;
}

export interface OAuthFirstTimeRequest {
  userId: number;
  username: string;
  referralCode: string;
}

export interface Expense {
  description?: string;
  totalAmount: number;
  users: ExpenseUser[];
}

export interface ExpenseUser {
  id: number;
  amountPaid?: number;
  amountOwed: number;
  percentage: number;
}

export interface MarkAsPaid {
  expenseIds: number[];
  splitId: number;
  receipt?: string;
  creatorId: string;
  userId: string;
}

export interface Notification {
  category?: CategoryIcons;
  avatar?: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
}
