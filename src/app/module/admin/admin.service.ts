import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interface/requestUser.interface";
import { prisma } from "../../lib/prisma";
import {
  IAdmin,
  IChangeUserRolePayload,
  IChangeUserStatusPayload,
} from "./admin.interface";
import { Role, UserStatus } from "../../../generated/prisma/enums";

const getAllAdmin = async () => {
  const result = await prisma.admin.findMany({
    where: {
      isDeleted: false,
    },
  });
  return result;
};

const getAdminById = async (id: string) => {
  const result = await prisma.admin.findFirst({
    where: {
      id: id,
      isDeleted: false,
    },
  });
  return result;
};

const updateAdmin = async (id: string, payload: IAdmin) => {
  const result = await prisma.admin.update({
    where: {
      id: id,
    },
    data: payload,
  });
  return result;
};

const adminDelete = async (id: string) => {
  const result = await prisma.admin.update({
    where: {
      id: id,
    },
    data: {
      isDeleted: true,
    },
  });
  return result;
};

const changeUserStatus = async (
  user: IRequestUser,
  payload: IChangeUserStatusPayload,
) => {
  const isAdminExists = await prisma.admin.findUniqueOrThrow({
    where: {
      email: user.email,
    },
    include: {
      user: true,
    },
  });

  const { userId, userStatus } = payload;

  const userToChangeStatus = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  const selfChange = isAdminExists.id === userToChangeStatus.id;

  if (selfChange) {
    throw new AppError(status.BAD_REQUEST, "You cannot change your own status");
  }

  if (
    isAdminExists.user.role === Role.ADMIN &&
    userToChangeStatus.role === Role.SUPER_ADMIN
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "You cannot change the status of another admin. Only super admin can change the status of another admin",
    );
  }

  if (userStatus === UserStatus.DELETED) {
    throw new AppError(
      status.BAD_REQUEST,
      "You cannot set user status to deleted. To delete a user, you have to use role specific delete api. For example, to delete an doctor user, you have to use delete doctor api which will set the user status to deleted and also set isDeleted to true and also delete the user session and account",
    );
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status: userStatus,
    },
  });

  return updatedUser;
};

const changeUserRole = async (
  user: IRequestUser,
  payload: IChangeUserRolePayload,
) => {
  const isSuperAdminExists = await prisma.admin.findUniqueOrThrow({
    where: {
      email: user.email,
      user: {
        role: Role.SUPER_ADMIN,
      },
    },
    include: {
      user: true,
    },
  });

  const { userId, role } = payload;

  const userToChangeRole = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  const selfRoleChange = isSuperAdminExists.userId === userId;

  if (selfRoleChange) {
    throw new AppError(status.BAD_REQUEST, "You cannot change your own role");
  }

  if (
    userToChangeRole.role === Role.DOCTOR ||
    userToChangeRole.role === Role.PATIENT
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "You cannot change the role of doctor or patient user. If you want to change the role of doctor or patient user, you have to delete the user and recreate with new role",
    );
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      role,
    },
  });

  return updatedUser;
};

export const adminService = {
  getAllAdmin,
  getAdminById,
  updateAdmin,
  adminDelete,
  changeUserStatus,
  changeUserRole,
};
