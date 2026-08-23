export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const CATEGORIES = [
  {
    id: 1,
    name: "Electronics",
  },
  {
    id: 2,
    name: "Fashion",
  },
  {
    id: 3,
    name: "Shoes",
  },
  {
    id: 4,
    name: "Accessories",
  },
];

export const PRODUCT_SORT_OPTIONS = [
  {
    value: "",
    label: "Default",
  },
  {
    value: "price_asc",
    label: "Price: Low to High",
  },
  {
    value: "price_desc",
    label: "Price: High to Low",
  },
  {
    value: "newest",
    label: "Newest",
  },
];