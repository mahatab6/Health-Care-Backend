import { prisma } from "../../lib/prisma"


const  getAllAdmin = async () => {
    const result = await prisma.admin.findMany({
        where: {
            isDeleted: false
        }
    })
    return result
}


export const adminService = {
    getAllAdmin
}