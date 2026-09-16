function buildBlog(sections) {
  const lines = [];

  lines.push('<div class="padding-top-bottom-blog">');
  lines.push('  <div class="container">');
  lines.push('    <div class="row justify-content-center">');
  lines.push('      <div class="col-lg-8 col-md-10 mb-5 mb-lg-0">');

  sections.forEach((section, index) => {
    if (index === 0) {
      lines.push("        <article>");
    } else {
      lines.push("        <section>");
    }

    lines.push(
      `          <${section.tag} class="theme-heading">${section.title}</${section.tag}>`,
    );

    section.content.forEach((item) => {
      if (item.type === "p") {
        lines.push(...renderParagraph(item, "          "));
      }

      if (item.type === "list") {
        lines.push(`          <${item.tag} class="theme-list">`);

        item.items.forEach((li) => {
          lines.push(`            <li>${li}</li>`);
        });

        lines.push(`          </${item.tag}>`);
      }

      if (item.type === "table") {
        lines.push('          <div class="table-responsive mt-4">');

        lines.push(
          renderTable(item.node)
            .split("\n")
            .map((line) => "            " + line)
            .join("\n"),
        );

        lines.push("          </div>");
      }
    });

    const imageName = createImageSlug(section.title);

    lines.push('          <picture class="d-block mb-5">');

    if (index === 0) {
      lines.push(
        `            <source media="(max-width: 440px)" srcset="/images/${imageName}-sm.webp" type="image/webp" />`,
      );

      lines.push(
        `            <source srcset="/images/${imageName}.webp" type="image/webp" />`,
      );

      lines.push(
        `            <img src="/images/${imageName}.jpg" alt="${section.title}" width="950" height="400" />`,
      );
    } else {
      lines.push(
        `            <source media="(max-width: 440px)" srcset="/images/${imageName}-sm.webp" />`,
      );

      lines.push(
        `            <img src="/images/${imageName}.webp" alt="${section.title}" width="950" height="400" loading="lazy" />`,
      );
    }

    lines.push("          </picture>");

    if (index === 0) {
      lines.push("        </article>");
    } else {
      lines.push("        </section>");
    }
  });

  lines.push("      </div>");
  lines.push("    </div>");
  lines.push("  </div>");
  lines.push("</div>");

  return lines.join("\n");
}
