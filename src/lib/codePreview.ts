import { CodeLanguage } from "../components/coder/CodeEmbedBlock";

export function buildPreviewDoc(code: string, lang: CodeLanguage): string {
  if (lang === "HTML") {
    const trimmed = code.trim().toLowerCase();

    if (trimmed.startsWith("<!doctype") || trimmed.startsWith("<html")) {
      return code;
    }

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  body {
    margin: 0;
    background: #000;
    color: #fff;
    font-family: -apple-system, sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
</style>
</head>
<body>
${code}
</body>
</html>`;
  }

  const cleaned = code
    .replace(/^import.*$/gm, "")
    .replace(/export\s+default\s+/g, "window.__QUIX_COMP__ = ");

  const presets = lang === "TSX" ? "typescript,react" : "react";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<style>
  body {
    margin: 0;
    background: #000;
    color: #fff;
    font-family: -apple-system, sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
</style>
</head>
<body>
<div id="root"></div>
<script type="text/babel" data-presets="${presets}">
${cleaned}
</script>
<script type="text/babel" data-presets="${presets}">
(function () {
  var Comp = window.__QUIX_COMP__;
  if (Comp) {
    ReactDOM.createRoot(document.getElementById("root")).render(
      React.createElement(Comp)
    );
  }
})();
</script>
</body>
</html>`;
}
