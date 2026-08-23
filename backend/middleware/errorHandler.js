const errorHandler = (err, req, res, next) => {
  console.error("Server Error:", err);

  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      message: "A record with this information already exists"
    });
  }

  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(400).json({
      message: "Referenced record does not exist"
    });
  }

  return res.status(500).json({
    message: "Internal server error"
  });
};

module.exports = errorHandler;