const bcrypt = require("bcryptjs");
const db = require("../config/db");

const createAdmin = async () => {
  try {
    const name = "ShopSphere Admin";
    const email = "admin@shopsphere.com";
    const password = "Admin@12345";

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    const [existing] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      await db.execute(
        `
        UPDATE users
        SET role = 'admin',
            password = ?
        WHERE email = ?
        `,
        [hashedPassword, email]
      );

      console.log("Admin user updated.");
    } else {
      await db.execute(
        `
        INSERT INTO users
        (name, email, password, role)
        VALUES (?, ?, ?, 'admin')
        `,
        [name, email, hashedPassword]
      );

      console.log("Admin user created.");
    }

    console.log("Email:", email);
    console.log("Password:", password);

    process.exit(0);
  } catch (error) {
    console.error(
      "Admin creation failed:",
      error.message
    );

    process.exit(1);
  }
};

createAdmin();