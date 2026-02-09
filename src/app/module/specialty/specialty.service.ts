import { specialty } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createSpecialty = async (payload: specialty): Promise<specialty> => {
    const specialty = await prisma.specialty.create({
        data: payload
    })

    return specialty
}


const getAllSpecialties = async () => {
    const allSpecialties = await prisma.specialty.findMany();
    return allSpecialties;
}

const deleteSpecialties = async (id: string) => {
    const result = await prisma.specialty.delete({
        where : {
            id: id
        }
    })
    return result;
}

const updateSpecialties = async (title:string, id:string) => {
    const result = await prisma.specialty.update({
        where: {
            id:id
        },
        data: {
            title: title
        }
    })
    
    return result
}



export const SpecialtyService = {
    createSpecialty,
    getAllSpecialties,
    deleteSpecialties,
    updateSpecialties
}