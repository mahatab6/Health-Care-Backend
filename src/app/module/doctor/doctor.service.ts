import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma"

const getAllDoctor = async () => {
    const result = await prisma.doctor.findMany({
        include: {
            user: true,
            Specialties: true
        }
    });

    return result
}


const getDoctorById = async (id: string) => {
    const result = await prisma.doctor.findUnique({
        where: {
            id: id,
            isDeleted: false
        },
        include: {
            Specialties: {
                select: {
                    specialty: true
                }
            }
        }
    })
    if(!result){
        throw new AppError(status.NOT_FOUND,"Doctor not found")
    }
    return {
        ...result,
        Specialties: result.Specialties.map(item => item.specialty)
    };
}



export const doctorService = {
    getAllDoctor,
    getDoctorById
}