import { parseUrl, transformUrl } from "unpic";
import { computed, signal } from "@preact/signals";
import "./style.css";

const inputUrl = signal(
  "https://cdn.shopify.com/static/sample-images/bath_grande_crop_center.jpeg",
);

const width = signal(800);
const height = signal(600);

const url = computed(() => {
  return transformUrl({
    url: inputUrl.value,
    width: width.value,
    height: height.value,
  });
});

const parsedUrl = computed(() => JSON.stringify(parseUrl(url.value), null, 2));

export default function App() {
  return (
    <div>
      <h1>Hello, World!</h1>
      <div>
        <input
          type="text"
          value={inputUrl}
          onInput={(e) => inputUrl.value = e.target.value}
        />
        <label>
          Width:{" "}
          <input
            type="number"
            value={width}
            onInput={(e) => width.value = e.target.value}
          />
        </label>
        <label>
          Height:{" "}
          <input
            type="number"
            value={height}
            onInput={(e) => height.value = e.target.value}
          />
        </label>
      </div>
      {url.value ? <img src={url} /> : <p>Invalid URL</p>}
      <p>
        <pre>{parsedUrl}</pre>
      </p>
    </div>
  );
}
