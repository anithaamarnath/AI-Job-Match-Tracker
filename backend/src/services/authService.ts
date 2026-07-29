import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import {
  createUser,
  findUserByEmail,
} from "../repositories/userRepository.js";

import type { RegisterInput } from "../validators/authValidator.js";
import { AppError } from "../utils/AppError.js";

const SALT_ROUNDS = 12;

const createAccessToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    { userId },
    secret,
    { expiresIn: "1d" }
  );
};

export const registerUser = async (data: RegisterInput) => {
  const existingUser = await findUserByEmail(data.email);

  if (existingUser) {
    throw new AppError(
      "An account with this email already exists",
      409
    );
  }

  const passwordHash = await bcrypt.hash(
    data.password,
    SALT_ROUNDS
  );

  const user = await createUser({
    name: data.name,
    email: data.email,
    passwordHash,
  });

  const token = createAccessToken(user.id);

  return {
    user,
    token,
  };
};