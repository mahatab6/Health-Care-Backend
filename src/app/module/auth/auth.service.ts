import status from "http-status";
import { UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";
import { jewUtils } from "../../utils/jwt";
import { envVars } from "../../../config/env";
import { JwtPayload } from "jsonwebtoken";

interface IRegisterPatiend {
  name: string;
  email: string;
  password: string;
}

interface ILogin {
  email: string;
  password: string;
}

const registerPatient = async (payload: IRegisterPatiend) => {
  const { name, email, password } = payload;

  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    },
  });

  if (!data.user) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Faild to register patient",
    );
  }

  try {
    const patiend = await prisma.$transaction(async (tx) => {
      const patientTx = await tx.patient.create({
        data: {
          userId: data.user.id,
          name: payload.name,
          email: payload.email,
        },
      });

      return patientTx;
    });

    const accessToken = tokenUtils.getAccessToken({
      userId: data.user.id,
      email: data.user.email,
      name: data.user.name,
      role: data.user.role,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified,
    });

    const refreshToken = tokenUtils.getRefreshToken({
      userId: data.user.id,
      email: data.user.email,
      name: data.user.name,
      role: data.user.role,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified,
    });

    return {
      ...data,
      accessToken,
      token: data.token,
      refreshToken,
      patiend,
    };
  } catch (error) {
    console.log("Transaction error", error);
    await prisma.user.delete({
      where: {
        id: data.user.id,
      },
    });
    throw error;
  }
};

const loginPatient = async (payload: ILogin) => {
  const { email, password } = payload;

  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });

  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError(status.FORBIDDEN, "User is blocked");
  }

  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    email: data.user.email,
    name: data.user.name,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    email: data.user.email,
    name: data.user.name,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  return {
    ...data,
    accessToken,
    refreshToken,
  };
};

const getNewAccessToken = async (
  refreshToken: string,
  sessionToken: string,
) => {
  const isSessionTokenExists = await prisma.session.findUnique({
    where: {
      token: sessionToken,
    },
    include: {
      user: true,
    },
  });

  if (!isSessionTokenExists) {
    throw new AppError(status.NOT_FOUND, "Session not found");
  }

  const verifyRefreshToken = jewUtils.verifyToken(
    refreshToken,
    envVars.REFRESH_SECRET,
  );

  if (!verifyRefreshToken.success && verifyRefreshToken.error) {
    throw new AppError(status.UNAUTHORIZED, "Invalid refresh token");
  }

  const data = verifyRefreshToken.data as JwtPayload;



  const newAccessToken = tokenUtils.getAccessToken({
    userId: data.userId,
    email: data.email,
    name: data.name,
    role: data.role,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified,
  });

  const newRefreshToken = tokenUtils.getRefreshToken({
    userId: data.userId,
    email: data.email,
    name: data.name,
    role: data.role,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified,
  });

  const { token } = await prisma.session.update({
    where: {
      token: sessionToken,
    },
    data: {
      token: sessionToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1000),
      updatedAt: new Date(),
    },
  });

  return {
        accessToken : newAccessToken,
        refreshToken : newRefreshToken,
        sessionToken : token,
    }
};

export const authServices = {
  registerPatient,
  loginPatient,
  getNewAccessToken
};
