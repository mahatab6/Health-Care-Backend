import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interface/requestUser.interface";
import { prisma } from "../../lib/prisma";
import {
  ICreatePrescriptionPayload,
  IUpdatePrescriptionPayload,
} from "./prescription.interface";
import { Role } from "../../../generated/prisma/enums";
import { generatePrescriptionPDF } from "./prescription.utils";
import {
  deleteFileFromCloudinary,
  uploadFileToCloudinary,
} from "../../../config/cloudinary.config";
import { sendEmail } from "../../utils/email";

const givePrescription = async (
  user: IRequestUser,
  payload: ICreatePrescriptionPayload,
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
    },
    include: {
      patient: true,
      doctor: {
        include: {
          Specialties: true,
        },
      },
      schedule: {
        include: {
          doctorSchedules: true,
        },
      },
    },
  });

  if (appointmentData.doctorId !== doctorData.id) {
    throw new AppError(
      status.BAD_REQUEST,
      "You can only give prescription for your own appointments",
    );
  }

  const isAlreadyPrescribed = await prisma.prescription.findFirst({
    where: {
      appointmentId: payload.appointmentId,
    },
  });

  if (isAlreadyPrescribed) {
    throw new AppError(
      status.BAD_REQUEST,
      "You have already given prescription for this appointment. You can update the prescription instead.",
    );
  }

  const followUpDate = new Date(payload.followUpDate);

  const result = await prisma.$transaction(
    async (tx) => {
      const result = await tx.prescription.create({
        data: {
          ...payload,
          followUpDate,
          doctorId: appointmentData.doctorId,
          patientId: appointmentData.patientId,
        },
      });

      const pdfBuffer = await generatePrescriptionPDF({
        doctorName: doctorData.name,
        doctorEmail: appointmentData.doctor.email,
        patientName: appointmentData.patient.name,
        patientEmail: appointmentData.patient.email,
        followUpDate: followUpDate,
        instructions: payload.instructions,
        prescriptionId: result.id,
        appointmentDate: appointmentData.schedule.startDateTime,
        createdAt: new Date(),
      });

      const fileName = `Prescription-${Date.now}.pdf`;
      const uploadFile = await uploadFileToCloudinary(pdfBuffer, fileName);
      const pdfUrl = uploadFile.secure_url;

      const updatePrescription = await tx.prescription.update({
        where: {
          id: result.id,
        },
        data: {
          pdfUrl,
        },
      });

      try {
        const patient = appointmentData.patient;
        const doctor = appointmentData.doctor;

        await sendEmail({
          to: patient.email,
          subject: `You have received a new prescription from Dr. ${doctor.name}`,
          templateName: "prescription",
          templateData: {
            doctorName: doctor.name,
            patientName: patient.name,
            specialization: doctor.Specialties.map((s: any) => s.title).join(
              ", ",
            ),
            appointmentDate: new Date(
              appointmentData.schedule.startDateTime,
            ).toLocaleString(),
            issuedDate: new Date().toLocaleDateString(),
            prescriptionId: result.id,
            instructions: payload.instructions,
            followUpDate: followUpDate.toLocaleDateString(),
            pdfUrl: pdfUrl,
          },
          attachments: [
            {
              filename: fileName,
              content: pdfBuffer,
              contentType: "application/pdf",
            },
          ],
        });
      } catch (error) {
        console.log(
          "Failed To send email notification for prescription",
          error,
        );
      }

      return updatePrescription;
    },
    {
      maxWait: 15000,
      timeout: 20000,
    },
  );

  return result;
};

const myPrescriptions = async (user: IRequestUser) => {
  const isUserExists = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User Not Found");
  }

  if (isUserExists.role === Role.DOCTOR) {
    const result = await prisma.prescription.findMany({
      where: {
        doctor: {
          email: user.email,
        },
      },
      include: {
        patient: true,
        doctor: true,
        appointment: true,
      },
    });
    return result;
  }

  if (isUserExists.role === Role.PATIENT) {
    const result = await prisma.prescription.findMany({
      where: {
        patient: {
          email: user.email,
        },
      },
      include: {
        patient: true,
        doctor: true,
        appointment: true,
      },
    });
    return result;
  }
};

const getAllPrescriptions = async () => {
  const result = await prisma.prescription.findMany({
    include: {
      patient: true,
      doctor: true,
      appointment: true,
    },
  });
};

const updatePrescription = async (
  user: IRequestUser,
  prescriptionId: string,
  payload: IUpdatePrescriptionPayload,
) => {
  const isUserExists = await prisma.doctor.findUnique({
    where: {
      email: user.email,
    },
  });

  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const prescriptionData = await prisma.prescription.findUniqueOrThrow({
    where: {
      id: prescriptionId,
    },
    include: {
      doctor: true,
      patient: true,
      appointment: {
        include: {
          schedule: true,
        },
      },
    },
  });

  if (!(user.email === prescriptionData.doctor.email)) {
    throw new AppError(status.BAD_REQUEST, "This is not your prescription!");
  }

  const updatedInstructions =
    payload.instructions || prescriptionData.instructions;
  const updatedFollowUpDate = payload.followUpDate
    ? new Date(payload.followUpDate)
    : prescriptionData.followUpDate;

  const pdfBuffer = await generatePrescriptionPDF({
    doctorName: prescriptionData.doctor.name,
    doctorEmail: prescriptionData.doctor.email,
    patientName: prescriptionData.patient.name,
    patientEmail: prescriptionData.patient.email,
    appointmentDate: prescriptionData.appointment.schedule.startDateTime,
    instructions: updatedInstructions,
    followUpDate: updatedFollowUpDate,
    prescriptionId: prescriptionData.id,
    createdAt: prescriptionData.createdAt,
  });

  const fileName = `prescription-updated-${Date.now()}.pdf`;
  const uploadedFile = await uploadFileToCloudinary(pdfBuffer, fileName);
  const newPdfUrl = uploadedFile.secure_url;

  if (prescriptionData.pdfUrl) {
    try {
      await deleteFileFromCloudinary(prescriptionData.pdfUrl);
    } catch (deleteError) {
      console.error("Failed to delete old PDF from Cloudinary:", deleteError);
    }
  }

  const result = await prisma.prescription.update({
    where: {
      id: prescriptionId,
    },
    data: {
      instructions: updatedInstructions,
      followUpDate: updatedFollowUpDate,
      pdfUrl: newPdfUrl,
    },
    include: {
      patient: true,
      doctor: true,
      appointment: {
        include: {
          schedule: true,
        },
      },
    },
  });

  try {
    await sendEmail({
      to: result.patient.email,
      subject: `Your Prescription has been Updated by ${result.doctor.name}`,
      templateName: "prescription",
      templateData: {
        patientName: result.patient.name,
        doctorName: result.doctor.name,
        specialization: "Healthcare Provider",
        prescriptionId: result.id,
        appointmentDate: new Date(
          result.appointment.schedule.startDateTime,
        ).toLocaleString(),
        issuedDate: new Date(result.createdAt).toLocaleDateString(),
        followUpDate: new Date(result.followUpDate).toLocaleDateString(),
        instructions: result.instructions,
        pdfUrl: newPdfUrl,
      },
      attachments: [
        {
          filename: `Prescription-${result.id}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });
  } catch (emailError) {
    // Log email error but don't fail the prescription update
    console.error("Failed to send updated prescription email:", emailError);
  }

  return result;
};

const deletePrescription = async (
  user: IRequestUser,
  prescriptionId: string,
) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      email: user?.email,
    },
  });

  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const prescriptionData = await prisma.prescription.findUniqueOrThrow({
    where: {
      id: prescriptionId,
    },
    include: {
      doctor: true,
    },
  });

  if (!(user?.email === prescriptionData.doctor.email)) {
    throw new AppError(status.BAD_REQUEST, "This is not your prescription!");
  }

  if (prescriptionData.pdfUrl) {
    try {
      await deleteFileFromCloudinary(prescriptionData.pdfUrl);
    } catch (deleteError) {
      console.error("Failed to delete PDF from Cloudinary:", deleteError);
    }
  }

  await prisma.prescription.delete({
    where: {
      id: prescriptionId,
    },
  });
};

export const PrescriptionService = {
  givePrescription,
  myPrescriptions,
  getAllPrescriptions,
  updatePrescription,
  deletePrescription,
};
