import * as mongoose from 'mongoose';
import { UserSchema } from './user.schema';
import { SplitSchema } from './split.schema';

export const ExpenseSchema = new mongoose.Schema({
  amount: {
    type: String,
  },
  description: {
    type: String,
  },
  user: UserSchema,
  split: SplitSchema,

  lastLogin: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
