import { prisma } from "../../lib/prisma"
import { IAdmin } from "./admin.interface"


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


const updateAdmin = async (id:string, payload:IAdmin) => {
    const result = await prisma.admin.update({
        where: {
            id: id
        },
        data: payload
    })
    return result
}

const adminDelete = async (id:string) => {
    const result = await prisma.admin.update({
        where: {
            id: id
        },
        data: {
            isDeleted: true
        }
    })
    return result
}

export const adminService = {
    getAllAdmin,
    getAdminById,
    updateAdmin,
    adminDelete
}