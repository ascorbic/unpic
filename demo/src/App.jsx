import { h } from "preact";
import { parseUrl, transformUrl } from "../../mod.ts";
import { computed, signal } from "@preact/signals";
import "./style.css";
import examples from "./examples.json";

const inputUrl = signal(examples.shopify[1]);
const cdn = signal("");
const width = signal(800);
const height = signal(600);

const url = computed(() => {
  try {
    return transformUrl({
      url: inputUrl.value,
      width: Number(width.value),
      height: Number(height.value),
      provider: cdn.value || undefined,
    });
  } catch (e) {
    console.error(e);
    return null;
  }
});

const parsedUrl = computed(() => {
  try {
    return JSON.stringify(parseUrl(inputUrl.value), null, 2);
  } catch (e) {
    return "Invalid URL";
  }
});

const code = computed(() =>
  /* javascript */ `const url = transformUrl({
  url: ${JSON.stringify(inputUrl.value)},
  width: ${width},
  height: ${height}
});`
);

export default function App() {
  return (
    <div>
      <h1>🖼 Unpic</h1>
      <p class="instructions">
        Enter an image URL below, or choose from one of the examples
      </p>
      <div class="tools">
        <div class="example">
          <label for="example">
            Load example
          </label>
          <select
            onChange={(e) => {
              inputUrl.value = e.target.value;
            }}
            id="example"
          >
            {Object.values(examples).map(([name, url]) => (
              <option value={url}>{name}</option>
            ))}
          </select>
        </div>
        <div class="cdn">
          <label for="cdn">
            Force CDN
          </label>
          <select
            onChange={(e) => cdn.value = e.target.value}
            id="cdn"
          >
            <option value="">Auto</option>
            {Object.entries(examples).map(([cdnKey, [name]]) => (
              <option value={cdnKey}>{name}</option>
            ))}
          </select>
        </div>
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
        <div class="result">
          <label>
            Result
          </label>
          <input readonly value={url} />
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
        {url.value
          ? <img src={url} width={width} height={height} />
          : <p>Invalid URL</p>}
      </div>
    </div>
  );
}
