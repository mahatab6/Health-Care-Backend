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
            id: id
        }
    })
    return result;
}



export const doctorService = {
    getAllDoctor,
    getDoctorById
}