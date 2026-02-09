import app from "./app";



const server = () => {
  try {
    app.listen(5000, () => {
      console.log(`Server is running on http://localhost:5000`);
    });
  } catch (error) {
    console.error("server failed to start server", error)
  }
};

server();
