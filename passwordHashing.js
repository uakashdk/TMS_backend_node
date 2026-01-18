import bcrypt from "bcrypt";

const plainPassword = "Anshul@1234"; // 👈 change only this

const saltRounds = 10;

async function hashPassword() {
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    console.log("Hashed Password:", hashedPassword);
  } catch (error) {
    console.error("Error hashing password:", error);
  }
}

hashPassword();
