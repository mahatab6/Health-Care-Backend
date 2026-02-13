import { prisma } from "../../lib/prisma"


const  getAllAdmin = async () => {
    const result = await prisma.admin.findMany({
        where: {
            isDeleted: false
        }
    })
    return result
}


const getAdminById = async (id:string) => {
    const result = await prisma.admin.findFirst({
        where: {
            id: id,
            isDeleted: false
        }
    })
    return result
}


export const adminService = {
    getAllAdmin,
    getAdminById
}