import { Gender } from "../../../generated/prisma/enums";

export interface IAdmin {
    name: string;
    profilePhoto?: string;
    contactNumber?: string;
    address?: string
    gender?: Gender;
}
    