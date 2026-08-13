function cleanText(text) {
  return String(text || "")
    .replace(/\u00a0/g, " ")
    .replace(/\u200b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeHref(href) {
  if (!href) {
    return "";
  }

  const value = String(href).trim();

  if (!value) {
    return "";
  }

  if (
    /^javascript:/i.test(value) ||
    /^vbscript:/i.test(value) ||
    /^data:/i.test(value)
  ) {
    return "";
  }

  return value;
}

function cleanInlineHtml(html) {
  const temp = document.createElement("div");

  temp.innerHTML = String(html || "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<\/p>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\u200b/g, "")
    .trim();

  temp.querySelectorAll("a").forEach((anchor) => {
    anchor.querySelectorAll("b, strong").forEach((bold) => {
      bold.replaceWith(...bold.childNodes);
    });
  });

  temp.querySelectorAll("b, strong, i, em").forEach((el) => {
    if (!el.textContent.trim()) {
      el.remove();
    }
  });

  return temp.innerHTML.trim();
}
