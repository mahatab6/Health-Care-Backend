import { Prisma } from "../../../generated/prisma/client"

export const doctorScheduleSearchableFields = [
    'id',
    'doctorId',
    'scheduleId',
]

export const doctorScheduleFilterableFields = [
    'id',
    'doctorId',
    'scheduleId',
    'createdAt',
    'updatedAt',
    'isBooked',
    'schedule.startDateTime',
    'schedule.endDateTime',
]

export const doctorScheduleIncludeConfig : Partial<Record<keyof Prisma.DoctorSchedulesInclude, Prisma.DoctorSchedulesInclude[keyof Prisma.DoctorSchedulesInclude]>> ={
    doctor: {
        select: {
            name: true
        }
    },
    schedule: true

}