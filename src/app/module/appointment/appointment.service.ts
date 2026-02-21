import { uuidv7 } from "zod";
import { IRequestUser } from "../../interface/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { IBookAppointmentPayload } from "./appointment.interface";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { AppointmentStatus } from "../../../generated/prisma/enums";

const bookAppointment = async (
  user: IRequestUser,
  payload: IBookAppointmentPayload,
) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
      isDeleted: false,
    },
  });

  const scheduleData = await prisma.schedule.findUniqueOrThrow({
    where: {
      id: payload.scheduleId,
    },
  });

  const doctorSchedule = await prisma.doctorSchedules.findUniqueOrThrow({
    where: {
      doctorId_scheduleId: {
        doctorId: doctorData.id,
        scheduleId: scheduleData.id,
      },
    },
  });

  const videoCallingId = String(uuidv7());

  const result = await prisma.$transaction(async (tx) => {
    const appointmentData = await tx.appointment.create({
      data: {
        patientId: patientData.id,
        doctorId: doctorData.id,
        scheduleId: scheduleData.id,
        videoCallingId,
      },
    });

    await tx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorData.id,
          scheduleId: scheduleData.id,
        },
      },
      data: {
        isBooked: true,
      },
    });
    //todo payment integration will be here
    return appointmentData;
  });
  return result;
};

const getMyAppointments = async (user: IRequestUser) => {
  const patientData = await prisma.patient.findUnique({
    where: {
      email: user.email,
    },
  });

  const doctorData = await prisma.doctor.findUnique({
    where: {
      email: user.email,
    },
  });

  let appointments = [];

  if (patientData) {
    appointments = await prisma.appointment.findMany({
      where: {
        patientId: patientData.id,
      },
      include: {
        doctor: true,
        schedule: true,
      },
    });
  } else if (doctorData) {
    appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorData.id,
      },
      include: {
        patient: true,
        schedule: true,
      },
    });
  } else {
    throw new AppError(status.NOT_FOUND, "Not found data");
  }

  return appointments;
};

const changeAppointmentStatus = async (
  appointmentId: string,
  appointMentStatus: AppointmentStatus,
  user: IRequestUser,
) => {
  const appointMentData = await prisma.appointment.findUnique({
    where: {
      id: appointmentId,
    },
  });

  if (
    (appointMentData?.status === "CANCELED" ||
      appointMentData?.status === "COMPLETED") &&
    !["SUPER_ADMIN", "ADMIN"].includes(user.role)
  ) {
    throw new AppError(
      status.NOT_ACCEPTABLE,
      "This appointment can no longer be updated",
    );
  }

  if (user.role === "PATIENT") {
    if (
      appointMentData?.status !== "SCHEDULED" ||
      appointMentStatus !== "COMPLETED"
    ) {
      throw new AppError(
        status.NOT_ACCEPTABLE,
        "Patients can only cancel scheduled appointments",
      );
    }
  } else if (user.role === "DOCTOR") {
    const currentStatus = appointMentData?.status;
    const nextStatus = appointMentStatus;

    const validTransitions: Record<string, string[]> = {
      SCHEDULED: ["INPROGRESS", "CANCELED"],
      INPROGRESS: ["COMPLETED"],
    };

    if (!validTransitions[currentStatus!]?.includes(nextStatus)) {
      throw new AppError(
        status.NOT_ACCEPTABLE,
        "Invalid status transition for Doctor",
      );
    }
  }

  const result = await prisma.appointment.update({
    where: {
      id: appointMentData?.id,
    },
    data: {
      status: appointMentStatus,
    },
  });

  return result;
};

const getMySingleAppointment = async (
  appointmentId: string,
  user: IRequestUser,
) => {
  const patientData = await prisma.patient.findUnique({
    where: {
      email: user.email,
    },
  });

  const doctorData = await prisma.doctor.findUnique({
    where: {
      email: user.email,
    },
  });

  let appointment;

  if (patientData) {
    appointment = await prisma.appointment.findFirst({
      where: {
        patientId: patientData.id,
      },
      include: {
        doctor: true,
        schedule: true,
      },
    });
  } else if (doctorData) {
    appointment = await prisma.appointment.findFirst({
      where: {
        doctorId: doctorData.id,
      },
      include: {
        patient: true,
        schedule: true,
      },
    });
  }

  if (!appointment) {
    throw new AppError(status.NOT_FOUND, "Appointment not found");
  }

  return appointment;
};

const getAllAppointments = async () => {
  const result = await prisma.appointment.findMany({
    include:{
      doctor: true,
      patient: true,
      schedule: true
    }
  })
};


const bookAppointmentWithPayLater = async () => {};
const initiatePayment = async () => {};

export const AppointmentService = {
  bookAppointment,
  getMyAppointments,
  changeAppointmentStatus,
  getMySingleAppointment,
  getAllAppointments,
  bookAppointmentWithPayLater,
  initiatePayment,
};
