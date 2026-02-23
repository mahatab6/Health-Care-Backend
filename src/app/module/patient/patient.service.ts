import { IRequestUser } from "../../interface/requestUser.interface";
import { prisma } from "../../lib/prisma";
import {
  IUpdatePatientData,
  IUpdatePatientHealthDataPayload,
  IUpdatePatientMedicalDataPayload,
} from "./patient.interface";
import { convertToDateTime } from "./patient.utils";

const updateProfile = async (
  user: IRequestUser,
  payload: IUpdatePatientData,
) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
    include: {
      PatientHealthData: true,
      MedicalReport: true,
    },
  });

  await prisma.$transaction(async (tx) => {
    if (payload.patientInfo) {
      await tx.patient.update({
        where: {
          id: patientData.id,
        },
        data: {
          ...payload.patientInfo,
        },
      });

      if (payload.patientInfo.name || payload.patientInfo.profilePhoto) {
        const userData = {
          name: payload.patientInfo.name
            ? payload.patientInfo.name
            : patientData.name,
          image: payload.patientInfo.profilePhoto
            ? payload.patientInfo.profilePhoto
            : patientData.profilePhoto,
        };

        await tx.user.update({
          where: {
            email: patientData.email
          },
          data: {
            ...userData,
          },
        });
      }
    }

    if (payload.patientHealthData) {
      const healthDataSaveTO: IUpdatePatientHealthDataPayload = {
        ...payload.patientHealthData,
      };

      if (payload.patientHealthData.dateOfBirth) {
        healthDataSaveTO.dateOfBirth = convertToDateTime(
          typeof healthDataSaveTO.dateOfBirth === "string"
            ? healthDataSaveTO.dateOfBirth
            : undefined,
        ) as Date;
      }

      await tx.patientHealthData.upsert({
        where: {
          patientId: patientData.id,
        },
        update: healthDataSaveTO,
        create: {
          patientId: patientData.id,
          ...healthDataSaveTO,
        },
      });
    }

    if (
      payload.medicalReports &&
      Array.isArray(payload.medicalReports) &&
      payload.medicalReports.length > 0
    ) {
      const reports: IUpdatePatientMedicalDataPayload[] =
       [ ...payload.medicalReports];

      for (const report of reports) {
        if (report.shouldDelete && report.reportId) {
          const deleteReport = await tx.medicalReport.delete({
            where: {
              id: report.reportId,
            },
          });

          // if(deleteReport.reportLink)
        } else if (report.reportName && report.reportLink) {
          await tx.medicalReport.create({
            data: {
              patientId: patientData.id,
              reportLink: report.reportLink,
              reportName: report.reportName,
            },
          });
        }
      }
    }
  });
  const result = await prisma.patient.findUnique({
    where: {
      id: patientData.id,
    },
    include: {
      user: true,
      PatientHealthData: true,
      MedicalReport: true,
    },
  });
  return result;
};

export const PatientService = {
  updateProfile,
};
