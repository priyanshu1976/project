import { Client, Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();


const url = process.env.DATABASE_URL;
console.log("database url" , url)

if (!url) {
  throw new Error("DATABASE_URL is not defined. Check your .env file.");
}

const pgclient = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000,  // Wait 5s before timing out
});

async function connectDB() {
  try {
    await pgclient.connect();
    console.log("✅ Database connected successfully!");
  } catch (error: any) {
    console.error("❌ Error in database connection:", error);
  }
}

export default connectDB;
export {pgclient}
