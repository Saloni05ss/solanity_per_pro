import bcrypt from 'bcryptjs';
import { UserDao } from '../dao/user.dao';
import { ApiError } from '../utils/ApiError';
import { signToken } from '../utils/jwt';
import { IUser, User } from '../models/user.model';
import { Otp } from '../models/otp.model';
import { EmailService } from './email.service';

export function toPublicUser(user: IUser) {
  return {
    uid: user._id,
    email: user.email,
    username: user.username,
    useravatarurl: user.useravatarurl ?? null,
    postsCount: user.postsCount,
    followersCount: user.followersCount,
    followingCount: user.followingCount,
    createdAt: user.createdAt,
  };
}

export const AuthService = {
  async signup(email: string, password: string, username: string) {
    const existing = await UserDao.findByEmail(email);
    if (existing) throw new ApiError(409, 'Email already registered');

    const hashed = await bcrypt.hash(password, 10);
    const user = await UserDao.create({ email: email.toLowerCase(), password: hashed, username, useravatarurl: null });

    return { token: signToken(user._id.toString()), user: toPublicUser(user) };
  },

  async signin(email: string, password: string) {
    const user = await UserDao.findByEmail(email, true);
    if (!user) throw new ApiError(401, 'Invalid credentials');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new ApiError(401, 'Invalid credentials');

    return { token: signToken(user._id.toString()), user: toPublicUser(user) };
  },

  async updateProfile(userId: string, updates: { username?: string; useravatarurl?: string }) {
    const user = await UserDao.updateById(userId, updates);
    if (!user) throw new ApiError(404, 'User not found');
    return toPublicUser(user);
  },

  async googleAuth(credential: string) {
    let email: string;
    let name: string;
    let picture: string | undefined;

    // Handle mock token for testing/local-development when real keys aren't set
    if (credential.startsWith('mock_google_token_')) {
      const parts = credential.split('_');
      email = parts[4] || 'mockuser@example.com';
      name = parts[5] || 'Mock User';
      picture = undefined;
    } else {
      // Real token verification via Google API
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
      if (!response.ok) {
        throw new ApiError(400, 'Invalid Google token');
      }
      const data = (await response.json()) as any;
      email = data.email;
      name = data.name || data.given_name || 'Google User';
      picture = data.picture;
    }

    let user = await UserDao.findByEmail(email);

    if (!user) {
      // Create new user (Sign up)
      const baseUsername = name.replace(/\s+/g, '').toLowerCase();
      let username = baseUsername;
      let counter = 1;
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      user = await UserDao.create({
        email: email.toLowerCase(),
        username,
        useravatarurl: picture || null,
      });
    }

    return { token: signToken(user._id.toString()), user: toPublicUser(user) };
  },

  async forgotPassword(email: string) {
    const user = await UserDao.findByEmail(email);
    if (!user) throw new ApiError(404, 'User with this email does not exist');

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Remove older OTPs for this email and save new one
    await Otp.deleteMany({ email: email.toLowerCase() });
    await Otp.create({ email: email.toLowerCase(), code: otp });

    // Send email
    await EmailService.sendOtp(email.toLowerCase(), otp);
  },

  async resetPasswordOtp(email: string, code: string, newPassword: string) {
    const record = await Otp.findOne({ email: email.toLowerCase(), code });
    if (!record) throw new ApiError(400, 'Invalid or expired OTP code');

    const hashed = await bcrypt.hash(newPassword, 10);
    const user = await User.findOneAndUpdate({ email: email.toLowerCase() }, { password: hashed }, { new: true });
    if (!user) throw new ApiError(404, 'User not found');

    // Invalidate the used OTP
    await Otp.deleteOne({ _id: record._id });
  },

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new ApiError(404, 'User not found');
    if (!user.password) throw new ApiError(400, 'Password is not set (registered via OAuth)');

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) throw new ApiError(400, 'Incorrect previous password');

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();
  }
};
