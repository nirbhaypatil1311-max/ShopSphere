const db = require("../config/db");


const getCategories =
  async (req, res) => {
    try {
      const [categories] =
        await db.execute(
          `
          SELECT
            id,
            name,
            description,
            created_at
          FROM categories
          ORDER BY name ASC
          `
        );


      res.json({
        categories
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Could not fetch categories"
      });
    }
  };


const createCategory =
  async (req, res) => {
    try {
      const name =
        String(
          req.body.name || ""
        ).trim();


      const description =
        String(
          req.body.description || ""
        ).trim();


      if (!name) {
        return res.status(400).json({
          message:
            "Category name is required"
        });
      }


      const [result] =
        await db.execute(
          `
          INSERT INTO categories
          (name, description)

          VALUES (?, ?)
          `,
          [
            name,
            description
          ]
        );


      res.status(201).json({
        message:
          "Category created successfully",

        categoryId:
          result.insertId
      });
    } catch (error) {
      console.error(error);


      if (
        error.code ===
        "ER_DUP_ENTRY"
      ) {
        return res.status(409).json({
          message:
            "Category already exists"
        });
      }


      res.status(500).json({
        message:
          "Could not create category"
      });
    }
  };


module.exports = {
  getCategories,
  createCategory
};