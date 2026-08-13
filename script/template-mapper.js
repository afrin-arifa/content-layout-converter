function createImageSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getTemplateContent() {
  const container = document.createElement("div");

  container.innerHTML = editor.innerHTML;

  return container;
}

function parseTemplateContent() {
  const container = getTemplateContent();

  const data = {
    heading: null,
    paragraphs: [],
    lists: [],
    button: null,
  };

  const heading = container.querySelector("h1,h2,h3,h4,h5,h6");

  if (heading) {
    data.heading = {
      tag: heading.tagName.toLowerCase(),

      html: heading.innerHTML.trim(),

      text: cleanText(heading.textContent),
    };
  }

  container.querySelectorAll("p").forEach((p) => {
    const text = cleanText(p.textContent);

    if (!text) {
      return;
    }

    if (text.toLowerCase().startsWith("button:")) {
      const link = p.querySelector("a[href]");

      if (link) {
        data.button = {
          html: cleanInlineHtml(link.innerHTML),

          text: cleanText(link.textContent),

          href: sanitizeHref(link.getAttribute("href")),
        };
      }

      return;
    }

    data.paragraphs.push({
      html: cleanInlineHtml(p.innerHTML),
    });
  });

  container.querySelectorAll("ul,ol").forEach((list) => {
    const items = [];

    list.querySelectorAll(":scope > li").forEach((li) => {
      const html = cleanInlineHtml(li.innerHTML);

      if (html) {
        items.push(html);
      }
    });

    if (items.length) {
      data.lists.push({
        tag: list.tagName.toLowerCase(),

        items,
      });
    }
  });

  return data;
}

function fillTemplateHeading(template, data) {
  if (!data.heading) {
    return;
  }

  const heading = template.querySelector("h1,h2,h3,h4,h5,h6");

  if (!heading) {
    return;
  }

  heading.textContent = data.heading.text;
}

function fillTemplateParagraphs(template, data) {
  const paragraphs = [...template.querySelectorAll("p")];

  data.paragraphs.forEach((item, index) => {
    if (!paragraphs[index]) {
      return;
    }

    paragraphs[index].innerHTML = item.html;
  });
}

function fillTemplateButton(template, data) {
  if (!data.button) {
    return;
  }

  const button = template.querySelector("a.theme-btn");

  if (!button) {
    return;
  }

  button.setAttribute("href", data.button.href);

  button.innerHTML = data.button.html;
}

function fillTemplateImage(template, data) {
  if (!data.heading) {
    return;
  }

  const title = data.heading.text;

  const slug = createImageSlug(title);

  if (!slug) {
    return;
  }

  const img = template.querySelector("img");

  if (img) {
    img.setAttribute("src", `/images/${slug}.webp`);

    img.setAttribute("alt", title);
  }

  const sources = [...template.querySelectorAll("source[srcset]")];

  sources.forEach((source) => {
    const srcset = source.getAttribute("srcset") || "";

    if (srcset.includes("-sm.webp")) {
      source.setAttribute("srcset", `/images/${slug}-sm.webp`);
    }
  });
}

function fillTemplateLists(template, data) {
  const templateLists = [...template.querySelectorAll("ul,ol")];

  data.lists.forEach((listData, index) => {
    const templateList = templateLists[index];

    if (!templateList) {
      return;
    }

    templateList.innerHTML = "";

    listData.items.forEach((item) => {
      const li = document.createElement("li");

      li.innerHTML = item;

      templateList.appendChild(li);
    });
  });
}

function mapContentToTemplate(templateHTML) {
  const template = document.createElement("div");

  template.innerHTML = templateHTML;

  const data = parseTemplateContent();

  fillTemplateHeading(template, data);

  fillTemplateParagraphs(template, data);

  fillTemplateButton(template, data);

  fillTemplateImage(template, data);

  fillTemplateLists(template, data);

  return template.innerHTML.trim();
}

window.mapContentToTemplate = mapContentToTemplate;
