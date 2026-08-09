import { Schema, model, Document } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  code: string;
  createdAt: Date;
}

const otpSchema = new Schema<IOtp>({
  email: { type: String, required: true, lowercase: true, trim: true },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 } // TTL index: automatic expiry after 10 minutes (600s)
});

export const Otp = model<IOtp>('Otp', otpSchema);
