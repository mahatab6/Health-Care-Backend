
import { Gender } from "../../../generated/prisma/enums";

export interface ICreateDoctorPaylod {
  password: string;
  doctor: {
    name: string;
    email: string;
    profilePhoto?: string;
    contactNumber?: string;
    address?: string;
    registrationNumber: string;
    experience: number;
    gender: Gender;
    appointmentFee: number;
    qualification: string;
    currentWorkingPlace: string;
    designation: string;
  };
  Specialties: string[]
}


export interface ICreateAdminPayload {
  password: string;
  admin: {
    name: string;
    email: string;
    profilePhoto?: string;
    contactNumber: string;
    address: string; 
    gender: Gender;
  }
}


export interface ICreateSuperAdminPayload {
  password: string;
  superAdmin: {
    name: string;
    email: string;
    profilePhoto?: string;
    contactNumber: string;
    address: string;
    gender: Gender;
  }
}