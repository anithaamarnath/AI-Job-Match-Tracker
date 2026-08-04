import { prisma } from "../config/prisma.js";

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
}

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
};

export const createUser = async (data: CreateUserData) => {
  return prisma.user.create({
    data,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });
};