import { transformUrl } from "../mod.ts";

const url =
	"https://cdn.shopify.com/static/sample-images/bath_grande_crop_center.jpeg";

console.log(transformUrl({
	url,
	width: 800,
	height: 600,
}));
