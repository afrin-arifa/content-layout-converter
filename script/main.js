let currentMode = "inner";

const editor = document.getElementById("editor");
const output = document.getElementById("output");

const btnInner = document.getElementById("btnInner");
const btnBlog = document.getElementById("btnBlog");
const btnFaq = document.getElementById("btnFaq");
const btnUl = document.getElementById("btnUl");
const btnOl = document.getElementById("btnOl");
const btnTable = document.getElementById("btnTable");
const btnImageLeft = document.getElementById("btnImageLeft");
const btnImageRight = document.getElementById("btnImageRight");
const btnNoImage = document.getElementById("btnNoImage");

const btnDomTemplate = document.getElementById("btnDomTemplate");
const domTemplatePanel = document.getElementById("domTemplatePanel");
const domTemplate = document.getElementById("domTemplate");

const modeButtons = {
  inner: btnInner,
  blog: btnBlog,
  faq: btnFaq,
  ul: btnUl,
  ol: btnOl,
  table: btnTable,
  "image-left": btnImageLeft,
  "image-right": btnImageRight,
  "no-image": btnNoImage,
  "dom-template": btnDomTemplate,
};

const modeLabels = {
  inner: "Bootstrap layout",
  blog: "Semantic blog",
  faq: "FAQ accordion",
  ul: "Unordered list",
  ol: "Ordered list",
  table: "Semantic table",
  "image-left": "Image left",
  "image-right": "Image right",
  "no-image": "No image",
  "dom-template": "DOM Template",
};

const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");

const statusMsg = document.getElementById("statusMsg");
const modeBadge = document.getElementById("modeBadge");

function showStatus(msg) {
  statusMsg.textContent = msg;

  clearTimeout(showStatus.timer);

  showStatus.timer = setTimeout(() => {
    statusMsg.textContent = "";
  }, 2000);
}

function setMode(mode) {
  currentMode = mode;

  Object.entries(modeButtons).forEach(([name, button]) => {
    if (!button) {
      return;
    }

    button.classList.toggle("active", name === mode);
  });

  modeBadge.textContent = modeLabels[mode] || "Content layout";

  if (domTemplatePanel) {
    domTemplatePanel.hidden = mode !== "dom-template";
  }
}

btnInner.onclick = () => setMode("inner");

btnBlog.onclick = () => setMode("blog");

btnFaq.onclick = () => setMode("faq");

btnUl.onclick = () => setMode("ul");

btnOl.onclick = () => setMode("ol");

btnTable.onclick = () => setMode("table");

btnImageLeft.onclick = () => setMode("image-left");

btnImageRight.onclick = () => setMode("image-right");

btnNoImage.onclick = () => setMode("no-image");

btnDomTemplate.onclick = () => setMode("dom-template");

setMode(currentMode);

editor.addEventListener("paste", (e) => {
  e.preventDefault();

  let html =
    e.clipboardData.getData("text/html") ||
    e.clipboardData.getData("text/plain");

  html = html
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\u200b/g, "");

  const temp = document.createElement("div");

  temp.innerHTML = html;

  temp
    .querySelectorAll("script,style,meta,link,iframe,object,embed")
    .forEach((el) => {
      el.remove();
    });

  temp.querySelectorAll("span,font").forEach((el) => {
    const style = (el.getAttribute("style") || "").toLowerCase();

    const isBold = /font-weight\s*:\s*(bold|[6-9]00)/i.test(style);

    const isItalic = /font-style\s*:\s*italic/i.test(style);

    if (isBold) {
      const bold = document.createElement("b");

      bold.innerHTML = el.innerHTML;

      el.replaceWith(bold);

      return;
    }

    if (isItalic) {
      const italic = document.createElement("i");

      italic.innerHTML = el.innerHTML;

      el.replaceWith(italic);

      return;
    }

    el.replaceWith(...el.childNodes);
  });

  temp.querySelectorAll("strong").forEach((el) => {
    const bold = document.createElement("b");

    bold.innerHTML = el.innerHTML;

    el.replaceWith(bold);
  });

  temp.querySelectorAll("em").forEach((el) => {
    const italic = document.createElement("i");

    italic.innerHTML = el.innerHTML;

    el.replaceWith(italic);
  });

  temp.querySelectorAll("*").forEach((el) => {
    [...el.attributes].forEach((attr) => {
      if (attr.name === "href") {
        el.setAttribute("href", sanitizeHref(attr.value));
      } else {
        el.removeAttribute(attr.name);
      }
    });
  });

  document.execCommand("insertHTML", false, temp.innerHTML);
});

function generate() {
  if (currentMode === "dom-template") {
    const templateHTML = domTemplate.value.trim();

    if (!templateHTML) {
      output.textContent = "<!-- HTML template is empty -->";

      showStatus("Template is empty");

      return;
    }

    if (typeof mapContentToTemplate !== "function") {
      output.textContent = "<!-- template-mapper.js not loaded -->";

      showStatus("Template mapper missing");

      return;
    }

    try {
      const html = mapContentToTemplate(templateHTML);

      output.textContent = html;

      showStatus("Generated ✓");
    } catch (error) {
      console.error(error);

      output.textContent = "<!-- template generation failed -->";

      showStatus("Generation failed");
    }

    return;
  }

  const container = document.createElement("div");

  container.innerHTML = editor.innerHTML;

  let sections = parseSections(container);

  if (!sections.length && container.textContent.trim()) {
    const lines = (editor.innerText || editor.textContent || "")
      .split(/\n+/)
      .map((line) => cleanText(line))
      .filter(Boolean);

    if (lines.length) {
      container.innerHTML = lines.map((line) => `<p>${line}</p>`).join("");

      sections = parseSections(container);
    }
  }

  if (!sections.length) {
    output.textContent = "<!-- no content found -->";

    showStatus("Nothing found");

    return;
  }

  const renderers = {
    inner: buildInner,

    blog: buildBlog,

    faq: buildFAQ,

    ul: buildUl,

    ol: buildOl,

    table: buildTableMode,

    "image-left": buildImageLeft,

    "image-right": buildImageRight,

    "no-image": buildNoImageMode,
  };

  const render = renderers[currentMode] || buildNoImageMode;

  const html = render(sections);

  output.textContent = html;

  showStatus("Generated ✓");
}

async function copyHTML() {
  const text = output.textContent;

  if (!text) {
    showStatus("Nothing to copy");

    return;
  }

  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement("textarea");

    textarea.value = text;

    document.body.appendChild(textarea);

    textarea.select();

    document.execCommand("copy");

    textarea.remove();
  }

  showStatus("Copied ✓");
}

function clearAll() {
  editor.innerHTML = "";

  if (domTemplate) {
    domTemplate.value = "";
  }

  output.textContent = "";

  editor.focus();

  showStatus("Cleared");
}

generateBtn.onclick = generate;

copyBtn.onclick = copyHTML;

clearBtn.onclick = clearAll;

document.addEventListener("keydown", (e) => {
  const mod = e.ctrlKey || e.metaKey;

  if (mod && e.key === "Enter") {
    e.preventDefault();

    generate();
  }

  if (mod && e.shiftKey && e.key.toLowerCase() === "c") {
    e.preventDefault();

    copyHTML();
  }
});
