import mongoose from "mongoose";
import dotenv from "dotenv";
import { error } from "node:console";

dotenv.config();

export async function connectDB(uri?: string) {
  const envUri = process.env.MONGO_URI;
  const dbUser = process.env.DB_USER || "djackfaith05_db_user";
  const dbPass = process.env.DB_PASS;

  if (!dbUser || !dbPass) {
    console.log("error loading envs");
  }

  const encodedUser = encodeURIComponent(dbUser);
  const encodedPass = dbPass ? encodeURIComponent(dbPass) : null;

  const mongoUri =
    uri ||
    envUri ||
    `mongodb+srv://${encodedUser}:${encodedPass}@cluster0.ko9wk8w.mongodb.net/faitherpa?retryWrites=true&w=majority`;
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
