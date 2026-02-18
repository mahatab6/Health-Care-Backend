import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IUpdateDoctorPayload } from "./doctor.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interface/query.interface";
import { doctorFilterableFields, doctorIncludeConfig, doctorSearchableFields } from "./doctor.constant";
import { Doctor, Prisma } from "../../../generated/prisma/client";


const getAllDoctor = async (query: IQueryParams) => {
  // const result = await prisma.doctor.findMany({
  //   include: {
  //     user: true,
  //     Specialties: true,
  //   },
  // });

  // return result;

  
    const queryBuilder = new QueryBuilder<Doctor, Prisma.DoctorInclude, Prisma.DoctorInclude>(
        prisma.doctor,
        query,
        {
            searchableFields: doctorSearchableFields,
            filterableFields: doctorFilterableFields,
        }
    )

    const result = await queryBuilder
        .search()
        .filter()
        .include({
            user: true,
            // Specialties: true,
            Specialties: {
                include:{
                    specialty: true
                }
            },
        })
        .dynamicInclude(doctorIncludeConfig)
        .paginate()
        .sort()
        .fields()
        .execute();

        console.log(result);
    return result;
};

const getDoctorById = async (id: string) => {
  const result = await prisma.doctor.findUnique({
    where: {
      id: id,
      isDeleted: false,
    },
    include: {
      Specialties: {
        select: {
          specialty: true,
        },
      },
    },
  });
  if (!result) {
    throw new AppError(status.NOT_FOUND, "Doctor not found");
  }
  return {
    ...result,
    Specialties: result.Specialties.map((item) => item.specialty),
  };
};

const updateDoctor = async (id: string, payload: IUpdateDoctorPayload) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      id: id,
      isDeleted: false,
    },
  });

  if (!doctor) {
    throw new AppError(status.NOT_FOUND, "Doctor not found");
  }

  const { Specialties, ...doctorData } = payload;

  const updatedDoctor = await prisma.doctor.update({
    where: {
      id: id,
    },
    data: doctorData,
    include: {
      Specialties: {
        include: {
          specialty: true,
        },
      },
    },
  });

  if (Specialties && Specialties.length > 0) {
    await prisma.doctor_specialties.deleteMany({
      where: {
        doctorId: id,
      },
    });

    const doctorSpecialtyData = Specialties.map((specialtyId) => {
      return {
        doctorId: id,
        specialtyId: specialtyId,
      };
    });

    await prisma.doctor_specialties.createMany({
      data: doctorSpecialtyData,
    });

    const result = await prisma.doctor.findUnique({
      where: {
        id: id,
      },
      include: {
        Specialties: {
          select: {
            specialty: true,
          },
        },
      },
    });

    return {
      ...result,
      Specialties: result?.Specialties.map((item) => item.specialty),
    };
  }

  return {
    ...updatedDoctor,
    Specialties: updatedDoctor.Specialties.map((item) => item.specialty),
  };
};

const deleteDoctor = async (id: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: {  id: id, isDeleted: false },
  }); 

  if (!doctor) { 
    throw new AppError(status.NOT_FOUND, "Doctor not found");
  } 

  const result = await prisma.doctor.update({
    where: { id: id },
    data: { 
        isDeleted: true,
        upDatedAt: new Date(),
     }})
    return result;

};

export const doctorService = {
  getAllDoctor,
  getDoctorById,
  updateDoctor,
  deleteDoctor
};
