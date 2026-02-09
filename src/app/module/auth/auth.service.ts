import { UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";

interface IRegisterPatiend {
  name: string;
  email: string;
  password: string;
}

interface ILogin {
  email: string;
  password: string
}

const registerPatient = async (payload: IRegisterPatiend) => {
  const { name, email, password } = payload;

  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    },
  });

  if(!data.user){
    throw new Error("Faild to register patient")
  }

  return data;
};


const loginPatient = async (payload: ILogin ) => {
  const { email, password } = payload;

  const data = await auth.api.signInEmail({
    body: {
      email,
      password
    }
  })

  if(data.user.status === UserStatus.BLOCKED){
    throw new Error ("User is blocked")
  }

  if(data.user.isDeleted || data.user.status === UserStatus.DELETED){
    throw new Error ("User not found")
  }

  return data
}





export const authServices = {
    registerPatient,
    loginPatient
}
