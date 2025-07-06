import mongoose from "mongoose";
export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `Connected to MongoDB! Database name: "${mongoose.connection.name}"`
    );
  } catch (err) {
    console.error("Error connecting to mongo", err);
  }
}