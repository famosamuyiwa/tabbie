import { Document } from 'mongoose';

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

export interface User extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
  confirm_password: string;
  splits: [];
  expenses: [];
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SignupResponse {
  user: User;
  token: string;
}

// export interface User extends Document {
//   _id: string;
//   firstname: string;
//   lastname: string;
//   email: string;
//   password: string;
// }
