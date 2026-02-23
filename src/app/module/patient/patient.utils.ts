import { isValid, parse } from "date-fns";


export const convertToDateTime = (dataString: string | undefined) => {
    if(!dataString) {
        return undefined
    }

    const data = parse(dataString, "yyyy-mm-dd", new Date());

    if(!isValid(data)){
        return undefined
    }

    return data
}