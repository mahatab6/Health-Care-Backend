import { Gender, Role, UserStatus } from "../../../generated/prisma/enums";

export interface IAdmin {
    name: string;
    profilePhoto?: string;
    contactNumber?: string;
    address?: string
    gender?: Gender;
}
    

export interface IChangeUserStatusPayload {
    userId : string;
    userStatus : UserStatus;
}

export interface IChangeUserRolePayload {
    userId : string;
    role : Role;
}