# SamaThinking

When Sam Altman is thinking, the world pauses.
In the ChatGPT web interface, that usually looks like a dull “Thinking” label above the answer.
**SamaThinking** fixes this injustice: instead of boring text, you get a looping 400px-wide video of Sam Altman in deep thought.

Because when AGI is on the horizon, you deserve more than just words.

![Samathinking in action](img/screenshot.png)

## How It Works

* Targets the ChatGPT web UI containers:
  `.flex.w-full.items-start.justify-between.text-start.flex-col`
* If the container has a `.loading-shimmer` element (the “Thinking” indicator), it injects a looping, muted, autoplaying video (`img/video.mp4`, width: 400px) right below the first button in the container.
* Once `.loading-shimmer` disappears, the video is removed.
* Works in real time using `MutationObserver` — supports dynamic updates without page reload.


## Project Structure

```
samathinking/
├─ manifest.json
├─ content.js
└─ img/
   └─ video.mp4  ← Sam Altman thinking
```


## Installation (Developer Mode)

1. Clone this repository or download the ZIP.
2. Open `chrome://extensions/`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the `samathinking/` folder.
5. Open ChatGPT in your browser and watch “Thinking” turn into a cinematic moment.


## Customization

Inside `content.js`:

* **Video width**: change `v.style.width = "400px";`
* **Container selector**: update `CONTAINER_SELECTOR`
* **Video file path**: change `chrome.runtime.getURL("img/video.mp4")`
* **Insertion point**: tweak `ensureHolder()`
* **Replace the video entirely**: swap `img/video.mp4` for any clip you like — your favorite meme, a movie scene, or even your own face contemplating the universe.


## Requirements

* Chrome 115+ or any Chromium-based browser supporting Manifest V3.
* Local file `img/video.mp4` (Sam Altman footage recommended).


## Development Notes

* Logic lives entirely in `content.js`.
* Real-time DOM monitoring via `MutationObserver`.
* No external dependencies. No network calls.


## Privacy & Security

* The video is loaded locally from the extension package.
* No data collection. No tracking. No analytics.


## Known Limitations

* Strictly tied to the current DOM structure and class names of the ChatGPT web UI.
  If OpenAI changes the markup, selectors may need updating.
* Autoplay works reliably only with `muted` + `playsinline` (already implemented).


## License

MIT (or replace with your own).


## Acknowledgements

* Video source: [@minchoi on X](https://x.com/minchoi/)
* The OpenAI team for inspiring both the subject and the idea.
* Friends for feedback and encouragement.
* My beloved wife for her endless support. ❤️
* Follow my Telegram channel: [Чисто гипотетически](https://t.me/chistogipoteticheski)


### If you enjoy SamaThinking

Give it a ⭐ on GitHub, share it with your friends, and let the world know that when Sam thinks, we all get to watch.
