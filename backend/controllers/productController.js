const db = require("../config/db");

// ============================================================
// GET ALL PRODUCTS
// GET /api/products
// ============================================================
const getProducts = async (req, res, next) => {
  try {
    const {
      search = "",
      category = "",
      minPrice,
      maxPrice,
      sort = "newest",
      page = 1,
      limit = 100
    } = req.query;

    // --------------------------------------------------------
    // Pagination
    // --------------------------------------------------------
    const currentPage = Math.max(
      parseInt(page, 10) || 1,
      1
    );

    // Maximum 100 products per request
    const perPage = Math.min(
      Math.max(
        parseInt(limit, 10) || 100,
        1
      ),
      100
    );

    const offset = (currentPage - 1) * perPage;

    // --------------------------------------------------------
    // Filters
    // --------------------------------------------------------
    const conditions = [];
    const values = [];

    // Search
    if (String(search).trim()) {
      conditions.push(`
        (
          p.name LIKE ?
          OR p.description LIKE ?
        )
      `);

      const searchValue =
        `%${String(search).trim()}%`;

      values.push(
        searchValue,
        searchValue
      );
    }

    // Category
    if (String(category).trim()) {
      const categoryValue =
        String(category).trim();

      if (/^\d+$/.test(categoryValue)) {
        conditions.push(
          "p.category_id = ?"
        );

        values.push(
          Number(categoryValue)
        );
      } else {
        conditions.push(
          "LOWER(c.name) = LOWER(?)"
        );

        values.push(categoryValue);
      }
    }

    // Minimum price
    if (
      minPrice !== undefined &&
      String(minPrice).trim() !== ""
    ) {
      const min = Number(minPrice);

      if (
        !Number.isFinite(min) ||
        min < 0
      ) {
        return res.status(400).json({
          message: "Invalid minimum price"
        });
      }

      conditions.push(
        "p.price >= ?"
      );

      values.push(min);
    }

    // Maximum price
    if (
      maxPrice !== undefined &&
      String(maxPrice).trim() !== ""
    ) {
      const max = Number(maxPrice);

      if (
        !Number.isFinite(max) ||
        max < 0
      ) {
        return res.status(400).json({
          message: "Invalid maximum price"
        });
      }

      conditions.push(
        "p.price <= ?"
      );

      values.push(max);
    }

    // --------------------------------------------------------
    // WHERE
    // --------------------------------------------------------
    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    // --------------------------------------------------------
    // Sorting
    // --------------------------------------------------------
    const sortMap = {
      price_asc: "p.price ASC",
      price_desc: "p.price DESC",
      name_asc: "p.name ASC",
      name_desc: "p.name DESC",
      oldest: "p.created_at ASC",
      newest: "p.created_at DESC"
    };

    const orderBy =
      sortMap[sort] ||
      sortMap.newest;

    // --------------------------------------------------------
    // Count products
    // --------------------------------------------------------
    const [countRows] =
      await db.execute(
        `
        SELECT COUNT(*) AS total

        FROM products p

        LEFT JOIN categories c
          ON p.category_id = c.id

        ${whereClause}
        `,
        values
      );

    const totalProducts =
      Number(countRows[0]?.total || 0);

    const totalPages =
      totalProducts === 0
        ? 0
        : Math.ceil(
            totalProducts / perPage
          );

    // --------------------------------------------------------
    // Get products
    // --------------------------------------------------------
    const [products] =
      await db.execute(
        `
        SELECT
          p.id,
          p.name,
          p.description,
          p.price,
          p.image,
          p.stock,
          p.category_id,
          c.name AS category,
          p.created_at,
          p.updated_at

        FROM products p

        LEFT JOIN categories c
          ON p.category_id = c.id

        ${whereClause}

        ORDER BY ${orderBy}

        LIMIT ${perPage}
        OFFSET ${offset}
        `,
        values
      );

    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------
    return res.status(200).json({
      products,

      pagination: {
        currentPage,
        totalPages,
        totalProducts,
        limit: perPage,

        hasNextPage:
          currentPage < totalPages,

        hasPreviousPage:
          currentPage > 1
      }
    });
  } catch (error) {
    console.error(
      "GET PRODUCTS ERROR:",
      error
    );

    next(error);
  }
};


// ============================================================
// GET SINGLE PRODUCT
// GET /api/products/:id
// ============================================================
const getProductById = async (
  req,
  res,
  next
) => {
  try {
    const id =
      Number(req.params.id);

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        message: "Invalid product ID"
      });
    }

    const [products] =
      await db.execute(
        `
        SELECT
          p.id,
          p.name,
          p.description,
          p.price,
          p.image,
          p.stock,
          p.category_id,
          c.name AS category,
          p.created_at,
          p.updated_at

        FROM products p

        LEFT JOIN categories c
          ON p.category_id = c.id

        WHERE p.id = ?

        LIMIT 1
        `,
        [id]
      );

    if (products.length === 0) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    return res.status(200).json({
      product: products[0]
    });
  } catch (error) {
    console.error(
      "GET PRODUCT ERROR:",
      error
    );

    next(error);
  }
};


// ============================================================
// CREATE PRODUCT
// POST /api/products
// ADMIN ONLY
// ============================================================
const createProduct = async (
  req,
  res,
  next
) => {
  try {
    const {
      name,
      description = "",
      price,
      image = "",
      stock = 0,
      category_id,
      category
    } = req.body || {};

    // Product name
    if (
      !name ||
      !String(name).trim()
    ) {
      return res.status(400).json({
        message:
          "Product name is required"
      });
    }

    // Price
    const productPrice =
      Number(price);

    if (
      price === undefined ||
      !Number.isFinite(productPrice) ||
      productPrice < 0
    ) {
      return res.status(400).json({
        message:
          "Valid product price is required"
      });
    }

    // Stock
    const productStock =
      Number(stock);

    if (
      !Number.isInteger(productStock) ||
      productStock < 0
    ) {
      return res.status(400).json({
        message:
          "Stock must be a non-negative integer"
      });
    }

    // --------------------------------------------------------
    // Category
    // --------------------------------------------------------
    let categoryId = null;

    if (
      category_id !== undefined &&
      category_id !== null &&
      category_id !== ""
    ) {
      categoryId =
        Number(category_id);

      if (
        !Number.isInteger(categoryId) ||
        categoryId <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid category ID"
        });
      }
    } else if (
      category &&
      String(category).trim()
    ) {
      const [categories] =
        await db.execute(
          `
          SELECT id
          FROM categories
          WHERE LOWER(name) = LOWER(?)
          LIMIT 1
          `,
          [
            String(category).trim()
          ]
        );

      if (categories.length === 0) {
        return res.status(400).json({
          message:
            "Category not found"
        });
      }

      categoryId =
        categories[0].id;
    }

    // Verify category
    if (categoryId !== null) {
      const [categories] =
        await db.execute(
          `
          SELECT id
          FROM categories
          WHERE id = ?
          LIMIT 1
          `,
          [categoryId]
        );

      if (categories.length === 0) {
        return res.status(400).json({
          message:
            "Category not found"
        });
      }
    }

    // --------------------------------------------------------
    // Insert
    // --------------------------------------------------------
    const [result] =
      await db.execute(
        `
        INSERT INTO products
        (
          name,
          description,
          price,
          image,
          stock,
          category_id
        )

        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          String(name).trim(),
          description,
          productPrice,
          image,
          productStock,
          categoryId
        ]
      );

    // Get created product
    const [products] =
      await db.execute(
        `
        SELECT
          p.id,
          p.name,
          p.description,
          p.price,
          p.image,
          p.stock,
          p.category_id,
          c.name AS category,
          p.created_at,
          p.updated_at

        FROM products p

        LEFT JOIN categories c
          ON p.category_id = c.id

        WHERE p.id = ?

        LIMIT 1
        `,
        [result.insertId]
      );

    return res.status(201).json({
      message:
        "Product created successfully",

      product: products[0]
    });
  } catch (error) {
    console.error(
      "CREATE PRODUCT ERROR:",
      error
    );

    next(error);
  }
};


// ============================================================
// UPDATE PRODUCT
// PUT /api/products/:id
// ADMIN ONLY
// ============================================================
const updateProduct = async (
  req,
  res,
  next
) => {
  try {
    const productId =
      Number(req.params.id);

    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      return res.status(400).json({
        message:
          "Invalid product ID"
      });
    }

    // Get existing product
    const [existingProducts] =
      await db.execute(
        `
        SELECT *
        FROM products
        WHERE id = ?
        LIMIT 1
        `,
        [productId]
      );

    if (existingProducts.length === 0) {
      return res.status(404).json({
        message:
          "Product not found"
      });
    }

    const existingProduct =
      existingProducts[0];

    const {
      name,
      description,
      price,
      image,
      stock,
      category_id,
      category
    } = req.body || {};

    // --------------------------------------------------------
    // Values
    // --------------------------------------------------------
    const updatedName =
      name !== undefined
        ? String(name).trim()
        : existingProduct.name;

    const updatedDescription =
      description !== undefined
        ? description
        : existingProduct.description;

    const updatedPrice =
      price !== undefined
        ? Number(price)
        : Number(existingProduct.price);

    const updatedImage =
      image !== undefined
        ? image
        : existingProduct.image;

    const updatedStock =
      stock !== undefined
        ? Number(stock)
        : Number(existingProduct.stock);

    let updatedCategoryId =
      existingProduct.category_id;

    // --------------------------------------------------------
    // Category ID
    // --------------------------------------------------------
    if (
      category_id !== undefined &&
      category_id !== null &&
      category_id !== ""
    ) {
      updatedCategoryId =
        Number(category_id);

      if (
        !Number.isInteger(
          updatedCategoryId
        ) ||
        updatedCategoryId <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid category ID"
        });
      }
    }

    // Category name
    if (
      category !== undefined &&
      String(category).trim()
    ) {
      const [categories] =
        await db.execute(
          `
          SELECT id
          FROM categories
          WHERE LOWER(name) = LOWER(?)
          LIMIT 1
          `,
          [
            String(category).trim()
          ]
        );

      if (categories.length === 0) {
        return res.status(400).json({
          message:
            "Category not found"
        });
      }

      updatedCategoryId =
        categories[0].id;
    }

    // --------------------------------------------------------
    // Validation
    // --------------------------------------------------------
    if (!updatedName) {
      return res.status(400).json({
        message:
          "Product name is required"
      });
    }

    if (
      !Number.isFinite(updatedPrice) ||
      updatedPrice < 0
    ) {
      return res.status(400).json({
        message:
          "Invalid product price"
      });
    }

    if (
      !Number.isInteger(updatedStock) ||
      updatedStock < 0
    ) {
      return res.status(400).json({
        message:
          "Stock must be a non-negative integer"
      });
    }

    // Verify category
    if (updatedCategoryId !== null) {
      const [categories] =
        await db.execute(
          `
          SELECT id
          FROM categories
          WHERE id = ?
          LIMIT 1
          `,
          [updatedCategoryId]
        );

      if (categories.length === 0) {
        return res.status(400).json({
          message:
            "Category not found"
        });
      }
    }

    // --------------------------------------------------------
    // Update
    // --------------------------------------------------------
    await db.execute(
      `
      UPDATE products

      SET
        name = ?,
        description = ?,
        price = ?,
        image = ?,
        stock = ?,
        category_id = ?

      WHERE id = ?
      `,
      [
        updatedName,
        updatedDescription,
        updatedPrice,
        updatedImage,
        updatedStock,
        updatedCategoryId,
        productId
      ]
    );

    // Get updated product
    const [products] =
      await db.execute(
        `
        SELECT
          p.id,
          p.name,
          p.description,
          p.price,
          p.image,
          p.stock,
          p.category_id,
          c.name AS category,
          p.created_at,
          p.updated_at

        FROM products p

        LEFT JOIN categories c
          ON p.category_id = c.id

        WHERE p.id = ?

        LIMIT 1
        `,
        [productId]
      );

    return res.status(200).json({
      message:
        "Product updated successfully",

      product: products[0]
    });
  } catch (error) {
    console.error(
      "UPDATE PRODUCT ERROR:",
      error
    );

    next(error);
  }
};


// ============================================================
// DELETE PRODUCT
// DELETE /api/products/:id
// ADMIN ONLY
// ============================================================
const deleteProduct = async (
  req,
  res,
  next
) => {
  try {
    const productId =
      Number(req.params.id);

    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      return res.status(400).json({
        message:
          "Invalid product ID"
      });
    }

    const [products] =
      await db.execute(
        `
        SELECT id
        FROM products
        WHERE id = ?
        LIMIT 1
        `,
        [productId]
      );

    if (products.length === 0) {
      return res.status(404).json({
        message:
          "Product not found"
      });
    }

    await db.execute(
      `
      DELETE FROM products
      WHERE id = ?
      `,
      [productId]
    );

    return res.status(200).json({
      message:
        "Product deleted successfully"
    });
  } catch (error) {
    console.error(
      "DELETE PRODUCT ERROR:",
      error
    );

    if (
      error.code ===
      "ER_ROW_IS_REFERENCED_2"
    ) {
      return res.status(400).json({
        message:
          "This product cannot be deleted because it is already used in an order. Set stock to 0 instead."
      });
    }

    next(error);
  }
};


// ============================================================
// EXPORTS
// ============================================================
module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};