import { h } from "preact";
import { parseUrl, transformUrl } from "../../mod";
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

const parsedUrl = computed(() =>
  JSON.stringify(parseUrl(inputUrl.value), null, 2)
);

const code = computed(() =>
  /* javascript */ `const url = transformUrl({
  url: ${JSON.stringify(url.value)},
  width: ${width},
  height: ${height},
});`
);

const examples = [
  [
    "Shopify",
    "https://cdn.shopify.com/static/sample-images/bath_grande_crop_center.jpeg",
  ],
  [
    "Contentful",
    "http://images.ctfassets.net/yadj1kx9rmg0/wtrHxeu3zEoEce2MokCSi/cf6f68efdcf625fdc060607df0f3baef/quwowooybuqbl6ntboz3.jpg?fm=jpg",
  ],
  [
    "Imgix (Unsplash)",
    "https://images.unsplash.com/photo-1674255909399-9bcb2cab6489?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=996&q=80",
  ],
  [
    "WordPress",
    "https://cultivatedemo.files.wordpress.com/2022/06/marisa-morton-c9xtptclntg-unsplash-1.jpg",
  ],
];

export default function App() {
  return (
    <div>
      <h1>Unpic playground</h1>
      <p class="instructions">
        Enter an image URL below, or choose from one of the examples
      </p>
      <div class="tools">
        <div class="url">
          <label for="url">
            Source URL
          </label>
          <input
            id="url"
            type="text"
            value={inputUrl}
            onInput={(e) => inputUrl.value = e.target.value}
          />
        </div>
        <div class="example">
          <label for="example">
            Load example
          </label>
          <select
            onChange={(e) => inputUrl.value = e.target.value}
            id="example"
          >
            {examples.map(([name, url]) => <option value={url}>{name}</option>)}
          </select>
        </div>
        <div>
          <label for="width">
            Width
          </label>
          <input
            type="text"
            inputMode="numeric"
            id="width"
            value={width}
            onInput={(e) => width.value = e.target.value}
          />
        </div>
        <div>
          <label for="height">
            Height
          </label>
          <input
            type="text"
            inputMode="numeric"
            id="height"
            value={height}
            onInput={(e) => height.value = e.target.value}
          />
        </div>

        <details>
          <summary>Show details</summary>
          <div>
            <div class="code">
              <div>Result</div>
              <pre>{parsedUrl}</pre>
            </div>
            <div class="code">
              <div>Code</div>

              <pre>{code}</pre>
            </div>
          </div>
        </details>
      </div>

      <div class="imagePanel">
        {url.value ? <img src={url} /> : <p>Invalid URL</p>}
      </div>
    </div>
  );
}
