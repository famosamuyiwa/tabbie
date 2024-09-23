import { Document } from 'mongoose';

export interface ChatMessage {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: Date;
}

export interface User extends Document {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}
