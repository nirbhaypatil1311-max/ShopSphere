const db = require("../config/db");

// ==========================================
// CREATE CONTACT MESSAGE
// POST /api/contact
// PUBLIC
// ==========================================
const createContact = async (req, res, next) => {
  try {
    const {
      name,
      email,
      subject,
      message
    } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !message?.trim()
    ) {
      return res.status(400).json({
        message:
          "Name, email and message are required"
      });
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        message:
          "Invalid email address"
      });
    }

    await db.execute(
      `
      INSERT INTO contacts
      (
        name,
        email,
        subject,
        message,
        status
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        name.trim(),
        email.trim().toLowerCase(),
        subject?.trim() || null,
        message.trim(),
        "new"
      ]
    );

    res.status(201).json({
      message:
        "Your message has been submitted successfully"
    });

  } catch (error) {
    console.error(
      "CREATE CONTACT ERROR:",
      error
    );

    next(error);
  }
};


// ==========================================
// GET CONTACT MESSAGES
// GET /api/contact
// ADMIN ONLY
// ==========================================
const getContacts = async (req, res, next) => {
  try {
    const [contacts] = await db.execute(
      `
      SELECT
        id,
        name,
        email,
        subject,
        message,
        status,
        created_at
      FROM contacts
      ORDER BY created_at DESC
      `
    );

    res.json({
      contacts
    });

  } catch (error) {
    console.error(
      "GET CONTACTS ERROR:",
      error
    );

    next(error);
  }
};


// ==========================================
// UPDATE CONTACT STATUS
// PUT /api/contact/:id
// ADMIN ONLY
// ==========================================
const updateContactStatus = async (
  req,
  res,
  next
) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        message:
          "Invalid contact ID"
      });
    }

    const allowedStatuses = [
      "new",
      "read",
      "resolved"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Invalid contact status"
      });
    }

    const [result] = await db.execute(
      `
      UPDATE contacts
      SET status = ?
      WHERE id = ?
      `,
      [
        status,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message:
          "Contact message not found"
      });
    }

    res.json({
      message:
        "Contact status updated"
    });

  } catch (error) {
    console.error(
      "UPDATE CONTACT STATUS ERROR:",
      error
    );

    next(error);
  }
};


module.exports = {
  createContact,
  getContacts,
  updateContactStatus
};