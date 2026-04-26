import { envVars } from "../../../config/env";

export class EmbeddingService{
    private apikey: string;
    private apiUrl: string = "https://openrouter.ai/api/v1"
    private embeddingModel : string;

    constructor(){
        this.apikey = envVars.OPENROUTER_API_KEY || "";
        this.embeddingModel = envVars.OPENROUTER_EMBEDDING_MODEL || "nvidia/llama-nemotron-embed-vl-1b-v2:free";

        if(!this.apikey){
            throw new Error ("OPENROUTER_API_KEY is not set in .env")
        }
    }
}