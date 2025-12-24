import type { IUserDocument } from "../types/user.types.js";
import ApiError from "./apiError.js";

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const validateAndClearOTP = async (
  user: IUserDocument
): Promise<void> => {
  if (
    !user.resetPasswordOtp ||
    !user.resetPasswordOtpExpires ||
    user.resetPasswordOtpExpires.getTime() < Date.now()
  ) {
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    await user.save();
    throw new ApiError(400, "OTP has expired");
  }
};
