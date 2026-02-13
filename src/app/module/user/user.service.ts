import status from "http-status";
import { Role, specialty } from "../../../generated/prisma/client";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ICreateAdminPayload, ICreateDoctorPaylod, ICreateSuperAdminPayload } from "./user.interface";


const createDoctor = async (payload: ICreateDoctorPaylod) => {
  const specialties: specialty[] = [];

  for (const specialtyId of payload.Specialties) {
    const specialty = await prisma.specialty.findUnique({
      where: {
        id: specialtyId,
      },
    });
    if (!specialty) {
      throw new AppError(
        status.NOT_FOUND,
        `Specialty with id ${specialtyId} not found`,
      );
    }
    specialties.push(specialty);
  }

  const userExists = await prisma.user.findUnique({
    where: {
      email: payload.doctor.email,
    },
  });

  if (userExists) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "User with this email already exists",
    );
  }

  const userData = await auth.api.signUpEmail({
    body: {
      name: payload.doctor.name,
      email: payload.doctor.email,
      password: payload.password,
      role: Role.DOCTOR,
      needPasswordChange: true,
    },
  });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const doctorData = await tx.doctor.create({
        data: {
          userId: userData.user.id,
          ...payload.doctor,
        },
      });

      const doctorSpecialtyData = specialties.map((specialty) => {
        return {
          doctorId: doctorData.id,
          specialtyId: specialty.id,
        };
      });

      await tx.doctor_specialties.createMany({
        data: doctorSpecialtyData,
      });

      const doctor = await tx.doctor.findUnique({
        where: {
          id: doctorData.id,
        },
        select: {
          id: true,
          userId: true,
          name: true,
          email: true,
          profilePhoto: true,
          contactNumber: true,
          address: true,
          registrationNumber: true,
          experience: true,
          gender: true,
          appointmentFee: true,
          qualification: true,
          currentWorkingPlace: true,
          designation: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              status: true,
              emailVerified: true,
              image: true,
              isDeleted: true,
              deletedAt: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          Specialties: {
            select: {
              specialty: {
                select: {
                  title: true,
                  id: true,
                },
              },
            },
          },
        },
      });

      return doctor;
    });

    return result;
  } catch (error) {
    console.log("Transaction error:", error);
    await prisma.user.delete({
      where: {
        id: userData.user.id,
      },
    });
    throw error;
  }
};

const createAdmin = async (payload: ICreateAdminPayload) => {
  const userExists = await prisma.user.findUnique({
    where: {
      email: payload.admin.email,
    },
  });

  if (userExists) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "User with this email already exists",
    );
  }

  const userData = await auth.api.signUpEmail({
    body: {
      name: payload.admin.name,
      email: payload.admin.email,
      password: payload.password,
      role: Role.ADMIN,
      needPasswordChange: true,
    },
  });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const adminData = await tx.admin.create({
        data: {
          userId: userData.user.id,
          ...payload.admin,
        },
      });

      const createdAdmin = await tx.admin.findUnique({
        where: {
          id: adminData.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          contactNumber: true,
          address: true,
          gender: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
      return createdAdmin;
    });
    return result;
  } catch (error) {
    console.log("Transaction error:", error);
    await prisma.user.delete({
      where: {
        id: userData.user.id,
      },
    });
    throw new Error("Failed to create admin");
  }
};

const createSuperAdmin = async (payload: ICreateSuperAdminPayload) => {
  const userExists = await prisma.user.findUnique({
    where: {
      email: payload.superAdmin.email,
    },
  });

  if (userExists) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "User with this email already exists",
    );
  }

  const userData = await auth.api.signUpEmail({
    body: {
      name: payload.superAdmin.name,
      email: payload.superAdmin.email,
      password: payload.password,
      role: Role.SUPER_ADMIN,
      needPasswordChange: true,
    },
  });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const superAdminData = await tx.superAdmin.create({
        data: {
          userId: userData.user.id,
          ...payload.superAdmin,
        },
      });

      const createdSuperAdmin = await tx.superAdmin.findUnique({
        where: {
          id: superAdminData.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          contactNumber: true,
          address: true,
          gender: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
      return createdSuperAdmin;
    });
    return result;
  } catch (error) {
    console.log("Transaction error:", error);
    await prisma.user.delete({
      where: {
        id: userData.user.id,
      },
    });
    throw new Error("Failed to create super admin");
  }
};

export const UserService = {
  createDoctor,
  createAdmin,
  createSuperAdmin
};
