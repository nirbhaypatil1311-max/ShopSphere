const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(email || "").trim()
  );
};

const isPositiveInteger = (value) => {
  return (
    Number.isInteger(Number(value)) &&
    Number(value) > 0
  );
};

const isNonNegativeInteger = (value) => {
  return (
    Number.isInteger(Number(value)) &&
    Number(value) >= 0
  );
};

const isNonNegativeNumber = (value) => {
  return (
    Number.isFinite(Number(value)) &&
    Number(value) >= 0
  );
};

module.exports = {
  isValidEmail,
  isPositiveInteger,
  isNonNegativeInteger,
  isNonNegativeNumber
};