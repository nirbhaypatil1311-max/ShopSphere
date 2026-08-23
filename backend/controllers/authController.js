const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const createToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    }
  );
};

/*
|--------------------------------------------------------------------------
| Register
|--------------------------------------------------------------------------
*/

const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone = "",
      address = ""
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPhone = String(phone || "").trim();
    const cleanAddress = String(address || "").trim();

    if (cleanName.length < 2) {
      return res.status(400).json({
        message: "Name must contain at least 2 characters"
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address"
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters"
      });
    }

    const [existingUsers] = await db.execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [cleanEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: "An account with this email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await db.execute(
      `
      INSERT INTO users
      (name, email, password, role, phone, address)
      VALUES (?, ?, ?, 'user', ?, ?)
      `,
      [
        cleanName,
        cleanEmail,
        hashedPassword,
        cleanPhone,
        cleanAddress
      ]
    );

    const user = {
      id: result.insertId,
      name: cleanName,
      email: cleanEmail,
      role: "user",
      phone: cleanPhone,
      address: cleanAddress
    };

    const token = createToken(user);

    return res.status(201).json({
      message: "Registration successful",
      user,
      token
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const [users] = await db.execute(
      `
      SELECT
        id,
        name,
        email,
        password,
        role,
        phone,
        address,
        created_at
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
      [cleanEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const databaseUser = users[0];

    const passwordMatches = await bcrypt.compare(
      password,
      databaseUser.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const user = {
      id: databaseUser.id,
      name: databaseUser.name,
      email: databaseUser.email,
      role: databaseUser.role,
      phone: databaseUser.phone || "",
      address: databaseUser.address || "",
      created_at: databaseUser.created_at
    };

    const token = createToken(user);

    return res.status(200).json({
      message: "Login successful",
      user,
      token
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Current User
|--------------------------------------------------------------------------
*/

const getMe = async (req, res, next) => {
  try {
    const [users] = await db.execute(
      `
      SELECT
        id,
        name,
        email,
        role,
        phone,
        address,
        created_at
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.status(200).json(users[0]);
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Update Profile
|--------------------------------------------------------------------------
*/

const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      address
    } = req.body;

    if (
      name === undefined &&
      phone === undefined &&
      address === undefined
    ) {
      return res.status(400).json({
        message: "At least one profile field is required"
      });
    }

    const [existingUsers] = await db.execute(
      `
      SELECT id, name, phone, address
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [req.user.id]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const currentUser = existingUsers[0];

    const updatedName =
      name !== undefined
        ? String(name).trim()
        : currentUser.name;

    const updatedPhone =
      phone !== undefined
        ? String(phone).trim()
        : currentUser.phone || "";

    const updatedAddress =
      address !== undefined
        ? String(address).trim()
        : currentUser.address || "";

    if (updatedName.length < 2) {
      return res.status(400).json({
        message: "Name must contain at least 2 characters"
      });
    }

    await db.execute(
      `
      UPDATE users
      SET
        name = ?,
        phone = ?,
        address = ?
      WHERE id = ?
      `,
      [
        updatedName,
        updatedPhone,
        updatedAddress,
        req.user.id
      ]
    );

    const [users] = await db.execute(
      `
      SELECT
        id,
        name,
        email,
        role,
        phone,
        address,
        created_at
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [req.user.id]
    );

    return res.status(200).json({
      message: "Profile updated successfully",
      user: users[0]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile
};