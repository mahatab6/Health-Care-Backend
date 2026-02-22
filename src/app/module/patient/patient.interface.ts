import { BloodGroup, Gender } from "../../../generated/prisma/enums";

export interface IUpdatePatientInfoPayload {
  name?: string;
  profilePhoto?: string;
  contactNumber?: string;
  address?: string;
}

export interface IUpdatePatientHealthDataPayload {
  gender?: Gender;
  dateOfBirth?: Date;
  bloodGroup?: BloodGroup;
  hasAllergies?: Boolean;
  hasDiabetes?: Boolean;
  height?: String;
  weight?: String;
  smokingStatus?: Boolean;
  dietaryPreferences?: String;
  pregnancyStatus?: Boolean;
  mentalHealthHistory?: String;
  immunizationStatus?: String;
  hasPastSurgeries?: Boolean;
  recentAnxiety?: Boolean;
  recentDepression?: Boolean;
  maritalStatus?: String;
}

export interface IUpdatePatientMedicalDataPayload {
  reportName?: string;
  reportLink?: string;
  shouldDelete?: boolean;
  reportId?: string;
}
