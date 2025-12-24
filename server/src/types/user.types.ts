import type { Document, Types } from "mongoose";

export interface IUser {
  _id: Types.ObjectId;
  id: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  resetPasswordOtp?: string | undefined;
  resetPasswordOtpExpires?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateResetPasswordOtp(): string;
}

export type IUserDocument = IUser & IUserMethods & Document;
