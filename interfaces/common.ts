export interface ChatMessage {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: Date;
}
