import status from "http-status";
import { PaymentStatus, Role } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interface/requestUser.interface";
import { prisma } from "../../lib/prisma";

const getDashboardStatsData = async (user: IRequestUser) => {
  let statsData;

  switch (user.role) {
    case Role.SUPER_ADMIN:
      statsData = getSuperAdminStatsData();
      break;
    case Role.ADMIN:
      statsData = getAdminStatsData();
      break;
    case Role.DOCTOR:
      statsData = getDoctorStatsData(user);
      break;
    case Role.PATIENT:
      statsData = getPatientStatsData(user);
      break;
    default:
      throw new AppError(status.BAD_REQUEST, "Invalid user role");
  }
  return statsData;
};

const getSuperAdminStatsData = async () => {

    const appointmentCount = await prisma.appointment.count();
    const doctorCount = await prisma.doctor.count();
    const patientCount = await prisma.patient.count();
    const adminCount =  await prisma.admin.count({
        where: {
            user: {
                role: Role.ADMIN
            }
        }
    });
    const superAdminCount = await prisma.admin.count({
        where:{
            user:{
                role: Role.SUPER_ADMIN
            }
        }
    })
    const totalRevenue = await prisma.payment.aggregate({
        _sum:{
            amount: true
        },
        where: {
            status: PaymentStatus.PAID
        }
    })

    const piChartData = await getPiChartData();
    const barChartData = await getbarChartData();

    return {
        appointmentCount,
        doctorCount,
        patientCount,
        adminCount,
        superAdminCount,
        totalRevenue: totalRevenue._sum.amount || 0,
        piChartData,
        barChartData
    }
};
const getAdminStatsData = async () => {
    const appointmentCount = await prisma.appointment.count();
    const doctorCount = await prisma.doctor.count();
    const patientCount = await prisma.patient.count();
    const adminCount =  await prisma.admin.count({
        where: {
            user: {
                role: Role.ADMIN
            }
        }
    });
    const totalRevenue = await prisma.payment.aggregate({
        _sum:{
            amount: true
        },
        where: {
            status: PaymentStatus.PAID
        }
    })

    const piChartData = await getPiChartData();
    const barChartData = await getbarChartData();

    return {
        appointmentCount,
        doctorCount,
        patientCount,
        adminCount,
        totalRevenue: totalRevenue._sum.amount || 0,
        piChartData,
        barChartData
    }
};
const getDoctorStatsData = async (user: IRequestUser) => {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            email: user.email
        }
    })

    const reviewCount = await prisma.review.count({
        where: {
            doctorId: doctorData.id
        }
    });

    const patientCount = await prisma.appointment.groupBy({
        by: ["patientId"],
        _count:{
            id: true
        },
        where: {
            doctorId: doctorData.id
        }
    })

    const appointmentCount = await prisma.appointment.count({
        where:{
            doctorId: doctorData.id
        }
    })

    const totalRevenue = await prisma.payment.aggregate({
        _sum: {amount: true},
        where: {
            appointment: {
                doctorId: doctorData.id
           },
           status: PaymentStatus.PAID
        },
    })

    const appointmentStatusDistribution  = await prisma.appointment.groupBy({
        by:["status"],
        _count: {
            id: true
        },
        where:{
            id: doctorData.id
        }
    })

    const formattedAppointmentStatusDistribution = appointmentStatusDistribution.map(({_count, status}) => ({
        status,
        count: _count
    }))

    return {
        reviewCount,
        patientCount,
        appointmentCount,
        totalRevenue,
        appointmentStatusDistribution: formattedAppointmentStatusDistribution
    }
};
const getPatientStatsData = async (user: IRequestUser) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where:{
            email: user.email
        }
    })

    const appointmentCount = await prisma.appointment.count({
        where:{
            patientId: patientData.id
        }
    })
    
    const reviewCount = await prisma.review.count({
        where: {
            patientId: patientData.id
        }
    })

    const appointmentStatusDistribution = await prisma.appointment.groupBy({
        by: ["status"],
        where: {
            patientId: patientData.id
        },
        _count:{
            id: true
        }
    })

    const formattedAppointmentStatusDistribution = appointmentStatusDistribution.map(({_count, status}) => ({
        status,
        count: _count.id
    })) 


    return {
        appointmentCount,
        reviewCount,
        appointmentStatusDistribution: formattedAppointmentStatusDistribution
    }
};

const getPiChartData = async () => {
    const appointmentStatusDistribution = await prisma.appointment.groupBy({
        by: ["status"],
        _count:{
            id: true
        }
    })

    const formattedAppointmentStatusDistribution = appointmentStatusDistribution.map(({_count, status}) => ({
        status,
        count: _count.id
    })) 

    return formattedAppointmentStatusDistribution;
};
const getbarChartData = async () => {
     interface AppointmentCountByMonth {
        month: Date;
        count: bigint;
    }
    const appointmentCountByMonth : AppointmentCountByMonth[] = await prisma.$queryRaw`
        SELECT DATE_TRUNC('month', "createdAt") AS month,
        CAST(COUNT(*) AS INTEGER) AS count
        FROM "appointments"
        GROUP BY month
        ORDER BY month ASC;
    `

    return appointmentCountByMonth
}

export const statsService = {
  getDashboardStatsData,
};
