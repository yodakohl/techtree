# Tech Tree

MVP for a visualization of all human technology. 95% of the work was done by codex. Data provided by codex/gemini. The data is stored locally in `tech-tree.json` and loaded on startup. The client UI uses Vis.js to draw the tree and allows adding or editing entries.

## Prerequisites

- [Node.js](https://nodejs.org/) 14 or newer

## Installation

1. Clone this repository and change into its directory.
2. Install dependencies (there are none, but this sets up `package-lock.json`):
   ```bash
   npm install
   ```

## Running the server

Start the server using npm:

```bash
npm start
```

This runs `server.js` and listens on port `3000` by default. You can set the `PORT` environment variable to use a different port:

```bash
PORT=8080 npm start
```

Once running, open `http://localhost:3000` in your browser to view and modify the tech tree.

### Data persistence

When first launched, the server populates `tech-tree.json` with the contents of `tech-data.js`. Subsequent changes to the tech tree are saved back into `tech-tree.json`. Removing this file will reset the data to the initial values.

## Development

Edit `app.js`, `style.css`, and `index.html` to adjust the interface. The server itself is implemented in `server.js`. Restart the server after making changes to server-side code.

