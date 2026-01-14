import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function connectDB(uri?: string) {
  const envUri = process.env.MONGO_URI || "";

  if (!envUri) {
    console.log("error loading envs");
  }

  const mongoUri = uri || envUri;
  try {
    await mongoose.connect(mongoUri);
    // eslint-disable-next-line no-console
    console.log("MongoDB connected");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("MongoDB connection error", err);
    throw err;
  }
}

// export default mongoose;
