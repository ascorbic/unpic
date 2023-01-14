import { parse } from "./shopify.ts";

const urls = [
  "https://cdn.shopify.com/s/files/1/0561/7470/6753/products/science-beakers-blue-light_small.jpg",
  "https://cdn.shopify.com/s/files/1/0561/7470/6753/products/science-beakers-blue-light_medium.jpg",
  "https://cdn.shopify.com/s/files/1/0561/7470/6753/products/science-beakers-blue-light_large_crop_left.jpg",
  "https://cdn.shopify.com/s/files/1/0561/7470/6753/products/science-beakers-blue-light_large_crop_left.jpg.webp",
  "https://cdn.shopify.com/s/files/1/0561/7470/6753/products/science-beakers-blue-light_x200_crop_left.jpg.webp",
  "https://cdn.shopify.com/s/files/1/0561/7470/6753/products/science-beakers-blue-light_100x_crop_left.jpg.webp",
  "https://cdn.shopify.com/s/files/1/0561/7470/6753/products/science-beakers-blue-light_100x200_crop_left.jpg.webp",
];

urls.forEach((url) => {
  const result = parse(url);
  console.log(url, result);
});
