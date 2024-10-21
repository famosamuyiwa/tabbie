import { OAuthProvider } from 'enum/common';

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
  token: string;
  provider: OAuthProvider;
}

export interface Expense {
  description?: string;
  totalAmount: string;
  users: ExpenseUser[];
}

export interface ExpenseUser {
  id: number;
  amountPaid?: string;
  amountOwed: string;
  percentage: number;
}
