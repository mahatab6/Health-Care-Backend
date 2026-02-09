import app from "./app";
import { envVars } from "./config/env";



const server = () => {
  try {
    app.listen(envVars.PORT, () => {
      console.log(`Server is running on http://localhost:${envVars.PORT}`);
    });
  } catch (error) {
    console.error("server failed to start server", error)
  }
};

server();
