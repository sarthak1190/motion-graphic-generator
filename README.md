# Motion Infographic Reel Generator

A reusable content-to-motion engine that turns raw educational content into premium animated developer infographic clips.

The only input you maintain is content: Markdown, plain text notes, tutorials, interview prep, architecture explanations, or copied article text. The engine analyzes the content, plans scenes, renders animated 9:16 HTML clips, captures frames with Puppeteer, and exports MP4/GIF files with FFmpeg.

## What It Generates

- 5-8 animated MP4 clips
- 5-8 animated GIFs
- `combined_reel.mp4`
- 9:16 vertical format
- 1080x1920 default resolution
- Instagram and LinkedIn compatible assets

Generated files are written to `output/<content-file-name>/`.

## Installation

Requirements:

- Node.js 20+
- FFmpeg installed and available as `ffmpeg`
- Chromium is downloaded by Puppeteer during `npm install`

```bash
npm install
```

If your machine already has Chrome/Chromium and you want to skip the Puppeteer browser download, set `PUPPETEER_SKIP_DOWNLOAD=true` and configure Puppeteer in your environment.

## Commands

Render every file in `content/`:

```bash
npm run render
npm run render:all
```

Render one file:

```bash
npm run render:single ./content/day-01.md
```

Export only GIFs or only MP4s:

```bash
npm run export:gifs ./content/day-01.md
npm run export:mp4 ./content/day-01.md
```

Analyze content without rendering:

```bash
npm run analyze ./content/day-01.md
```

Generate animated HTML previews without MP4/GIF export:

```bash
npm run preview ./content/day-01.md
```

Generate debug PNG screenshots before video/GIF rendering:

```bash
npm run debug:day11
npm run debug ./content/day-11.md
```

Debug screenshots are written to:

```bash
output/debug/scene_01.png
output/debug/scene_02.png
```

## Content Format

Use normal educational content. Manual scene JSON is not required.

Supported inputs include:

- LinkedIn articles
- Instagram carousel copy
- Markdown documents
- Plain text notes
- Technical tutorials
- Architecture explanations
- Interview questions
- Blog articles

Markdown headings help the analyzer, but they are optional. The analyzer detects titles, subtitles, definitions, key takeaways, code blocks, comparisons, architecture flows, best practices, mistakes, interview questions, and examples.

## Adding New Days

Add a new file to `content/`:

```bash
content/day-25.md
```

Then run:

```bash
npm run render:single ./content/day-25.md
```

If your npm version does not forward script arguments without a separator, use the portable form:

```bash
npm run render:single -- ./content/day-25.md
```

Day numbers are detected dynamically from the content or filename. No code changes are needed.

## How Rendering Works

1. `src/utils/contentLoader.js` reads content files.
2. `src/utils/markdownParser.js` extracts paragraphs, headings, lists, code blocks, output blocks, and tables.
3. `src/utils/contentAnalyzer.js` extracts semantic content.
4. `src/utils/scenePlanner.js` creates 5-8 prioritized scenes with explicit visible content.
5. `src/utils/sceneValidator.js` rejects empty or oversized scenes before export.
6. `src/templates/reelTemplate.js` renders animated HTML.
7. `src/renderer/frameRenderer.js` waits for fonts, mount delay, and visible content before capturing frames.
8. `src/renderer/videoExporter.js` converts frames to MP4 and GIF with FFmpeg.
9. `src/renderer/renderPipeline.js` writes clip files and the combined reel.

## GIF Generation

GIF export uses FFmpeg palette generation for better gradients and cleaner text:

- frame sequence from Puppeteer
- palette generation
- palette-based GIF encoding

GIF width defaults to 1080 in `config/default.json`.

## MP4 Generation

MP4 export uses H.264:

- 30 FPS default
- CRF 18
- `yuv420p` pixel format
- fast-start metadata for social platforms

## Theme Customization

Edit `config/default.json`:

```json
{
  "theme": {
    "background": "#0B1F4D",
    "primary": "#F89820",
    "secondary": "#5382A1"
  }
}
```

The default visual system uses a premium developer aesthetic: deep blue background, orange primary accents, blue secondary accents, white glass cards, soft shadows, rounded corners, modern spacing, and readable typography.

## Validation

Every scene is validated before export. The renderer checks:

- title exists
- body content has at least one visible element
- no empty cards or list items
- estimated content height fits the 1080x1920 safe area
- canvas is configured as 1080x1920

Validation results are written to `validation.json` next to each output.

## Animation Customization

Animation timing and keyframes live in:

- `src/animations/animationPresets.js`
- `src/templates/reelTemplate.js`

Every scene includes motion: card reveals, slide-ins, animated progress indicators, typing code, glowing lines, flow connectors, and sequential checklist reveals.

## Branding Customization

Edit `config/default.json`:

```json
{
  "brand": {
    "handle": "@java_learning_hub_",
    "challengeBadge": "Developer Learning Sprint",
    "footerPrefix": "Follow for more"
  }
}
```

The renderer automatically displays:

- day number when detected
- challenge badge
- topic name
- brand footer
- dynamic ending CTA

## Production Notes

1080x1920 rendering is the default safe layout for mobile readability. For faster previews, temporarily lower `canvas.fps` in `config/default.json`, then restore it before final exports.

No project code needs to change when switching topics. Put new content in `content/`, run the render command, and the analyzer/planner will adapt.
