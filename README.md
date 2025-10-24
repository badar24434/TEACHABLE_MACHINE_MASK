# TEACHABLE_MACHINE_MASK 🧠🚀

## Description

A browser-based face mask detection demo that runs entirely client-side. The app loads a Teachable Machine image model (remote by default, or local `my_model`) and uses TensorFlow.js to classify webcam frames in real time. It provides immediate visual feedback: a "GOOD JOB" animation when a mask is detected and a warning with a thumbnail when no mask is detected.

> Note: This repository includes a sample Teachable Machine model under `my_model/` (labels: Rock, Paper, Scissors) — replace it with a mask detection model if desired.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Folder Structure](#folder-structure)
- [Model / Data Information](#model--data-information)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements / Credits](#acknowledgements--credits)
- [Contact](#contact)

## Features

- Real-time face mask detection from the webcam (runs in-browser).
- Positive feedback animation when a mask is detected ("GOOD JOB!").
- Warning banner + thumbnail display when no mask is detected.
- Privacy-first: no images are uploaded by default — inference happens locally.
- Webpack-based development server and production build pipeline.

## Tech Stack

- JavaScript (ES6)
- HTML5, CSS3
- TensorFlow.js (via CDN)
- Teachable Machine Image library (via CDN)
- Webpack, webpack-dev-server
- html-webpack-plugin, copy-webpack-plugin

## Installation

Prerequisites: Node.js (LTS) and npm installed.

1. Clone the repository

```bash
git clone https://github.com/badar24434/TEACHABLE_MACHINE_MASK.git
cd TEACHABLE_MACHINE_MASK
```

2. Install dependencies

```powershell
npm install
```

3. Start the dev server (opens browser)

```powershell
npm start
```

4. Build for production

```powershell
npm run build
# Serve the `dist/` folder using any static server
```

Notes:

- `npm start` runs `webpack serve --open --config webpack.config.dev.js`.
- `npm run build` runs the production Webpack configuration and copies static assets (including `my_model`) to `dist/`.

## Usage

1. Open the app (dev server via `npm start` or open `dist/index.html` after build).
2. Click the **Enable Webcam** button and grant camera permission.
3. Position your face in front of the camera.
4. The UI updates with the current status, probabilities for each class, and either a success animation or a warning thumbnail.

Important code locations:

- Main application logic: `js/app.js` — responsible for model loading, webcam setup, prediction loop, and UI updates.
- Default model URL in `js/app.js` (remote example):

```js
const URL = 'https://teachablemachine.withgoogle.com/models/ITkJZxu0G/';
const modelURL = URL + 'model.json';
const metadataURL = URL + 'metadata.json';
```

To use the included local model (`my_model`) instead of the remote URL:

1. Update `js/app.js` to point to the local files:

```js
const modelURL = './my_model/model.json';
const metadataURL = './my_model/metadata.json';
```

2. The production build already copies `my_model` into `dist/` using `CopyPlugin`.

Thresholds and tuning:

- The app uses a decision threshold of `0.7` for classifying `mask` vs `no mask`, and a `HIGH_CONFIDENCE_THRESHOLD` of `0.95` for high-confidence tracking. Adjust these in `js/app.js` to suit your model's calibration.

## Folder Structure

```
.
├─ 404.html
├─ index.html
├─ hello.html
├─ LICENSE.txt
├─ package.json
├─ site.webmanifest
├─ webpack.common.js
├─ webpack.config.dev.js
├─ webpack.config.prod.js
├─ css/
│  ├─ style.css
│  └─ rps-game.css
├─ img/
├─ js/
│  ├─ app.js            # Main app (model loading, webcam, inference)
│  └─ vendor/
└─ my_model/
   ├─ model.json        # (Optional) local Teachable Machine model
   └─ metadata.json     # Model metadata and labels
```

Key files:

- `index.html` — main UI and loads `js/app.js` and the CDN scripts for TensorFlow.js and Teachable Machine.
- `js/app.js` — app logic: model load, webcam setup, prediction loop, UI updates, animations.
- `webpack.config.prod.js` — production build configuration; copies static assets and `my_model` to `dist/`.

## Model / Data Information

- This project is designed to load a Teachable Machine image model (exported model.json + metadata.json).
- Included sample model metadata: `my_model/metadata.json` indicates a model with labels `Rock`, `Paper`, `Scissors` (imageSize 224). This is an example model — it is not a mask model.
- To create a mask detection model: train using Teachable Machine (image project), export the model, then replace the `my_model` files or use the Teachable Machine model URL.
- Privacy: By default the app processes frames locally in the browser and does not transmit images. If you integrate server-side uploads, update docs and obtain consent.

## API Endpoints

This repository is a front-end-only application and does not include server API endpoints by default.

Placeholder (if you add a backend):

```
POST /api/events
Request: { timestamp, label, probability, imageBase64? }
Response: { success: true }
```

## Contributing

Contributions are welcome! Suggested workflow:

1. Fork the repository.
2. Create a branch: `git checkout -b feat/your-feature`.
3. Make changes and add tests if applicable.
4. Commit and push: `git push origin feat/your-feature`.
5. Open a Pull Request describing your changes and how to test them.

Please include in PRs:
- Short description of the change.
- How to run/test locally.
- Any privacy/security impacts (especially if capturing or storing images).

Small improvements you could add:
- Switch the default to the local `my_model` (if you want an offline demo).
- Add a CONTRIBUTING.md and issue/pr templates.
- Provide a small test harness or E2E test to validate webcam flow (if adding CI).

## License

This project includes `LICENSE.txt` with the MIT License. See `LICENSE.txt` for the full text.

## Acknowledgements / Credits

- Teachable Machine by Google — https://teachablemachine.withgoogle.com/
- TensorFlow.js — https://www.tensorflow.org/js
- HTML5 Boilerplate
- Webpack and the plugin authors (html-webpack-plugin, copy-webpack-plugin)

## Contact

- Repository: [https://github.com/badar24434/TEACHABLE_MACHINE_MASK](https://github.com/badar24434/TEACHABLE_MACHINE_MASK)
- Author: **Muhamad Badar Miqdad bin Md Nasir**
- Email: **badarmiqdad45@gmail.com**
- Website / Social: [LinkedIn]([https://www.linkedin.com/in/badar-miqdad](https://www.linkedin.com/in/muhamad-badar-miqdad-bin-md-nasir-9404282b8/)) | [GitHub](https://github.com/badar24434)


---

