function renderTable(node) {

    const rows = [...node.querySelectorAll('tr')];

    const lines = [];
    lines.push('<table>');

    if (!rows.length) {
        lines.push('</table>');
        return lines.join('\n');
    }

    lines.push('  <thead>');
    lines.push('    <tr>');

    rows[0].querySelectorAll('th,td').forEach(cell => {

        let cellContent = cell.innerHTML;
        cellContent = cellContent.replace(/<p[^>]*>/gi, '').replace(/<\/p>/gi, '');

        lines.push(`      <th>${cleanText(cellContent)}</th>`);

    });

    lines.push('    </tr>');
    lines.push('  </thead>');

    if (rows.length > 1) {

        lines.push('  <tbody>');

        rows.slice(1).forEach(row => {

            lines.push('    <tr>');

            row.querySelectorAll('th,td').forEach(cell => {

                let cellContent = cell.innerHTML;
                cellContent = cellContent.replace(/<p[^>]*>/gi, '').replace(/<\/p>/gi, '');

                lines.push(`      <td>${cleanText(cellContent)}</td>`);

            });

            lines.push('    </tr>');

        });

        lines.push('  </tbody>');
    }

    lines.push('</table>');

    return lines.join('\n');

}

function renderParagraph(item, indent) {

    const text = item.html.trim();

    if (
        text.toLowerCase().startsWith('button:') ||
        text.toLowerCase() === 'call for details'
    ) {
        const label = text.replace(/^button:\s*/i, '').trim() || 'Book Appointment';

        return [`${indent}<a href="/about-me/contact-us" class="theme-btn mt-4" rel="nofollow">${label}</a>`];
    }

    return [`${indent}<p>${item.html}</p>`];

}

function renderSectionContent(section, indent, options = {}, renderTableFn = renderTable) {

    const lines = [];

    section.content.forEach(item => {

        if (item.type === 'p') {
            lines.push(...renderParagraph(item, indent));
        }

        if (item.type === 'list') {
            const tag = options.listTagOverride || item.tag;

            lines.push(`${indent}<${tag} class="theme-list">`);

            item.items.forEach(li => {
                lines.push(`${indent}  <li>${li}</li>`);
            });

            lines.push(`${indent}</${tag}>`);
        }

        if (item.type === 'table') {
            lines.push(`${indent}<div class="table-responsive">`);
            lines.push(
                renderTableFn(item.node)
                    .split('\n')
                    .map(line => `${indent}  ${line}`)
                    .join('\n')
            );
            lines.push(`${indent}</div>`);
        }

    });

    return lines;

}

function buildSectionTitle(section, indent) {

    return `${indent}<${section.tag} class="theme-heading">${section.title}</${section.tag}>`;

}

function buildNoImage(sections, options = {}) {

    const lines = [];

    sections.forEach((section, index) => {

        const containerTag = 'section';

        lines.push(`<${containerTag} class="padding-top-bottom">`);
        lines.push('  <div class="container">');
        lines.push('    <div class="row">');
        lines.push('      <div class="col-lg-10 mx-auto">');
        lines.push(buildSectionTitle(section, '        '));
        lines.push(...renderSectionContent(section, '        ', options));
        lines.push('      </div>');
        lines.push('    </div>');
        lines.push('  </div>');
        lines.push(`</${containerTag}>`);

    });

    return lines.join('\n\n');

}

function buildImageLayout(sections, imagePosition = 'right') {

    const lines = [];

    sections.forEach((section, index) => {

        const imageName = `section-${index + 1}`;
        const containerTag = 'section';
        const textFirst = imagePosition === 'right';
        const hasButtonParagraph = section.content.some(item => {
            if (item.type !== 'p') {
                return false;
            }

            const text = item.html.trim().toLowerCase();

            return text.startsWith('button:') || text === 'call for details';
        });

        lines.push(`<${containerTag} class="padding-top-bottom">`);
        lines.push('  <div class="container">');
        lines.push('    <div class="row align-items-center">');

        lines.push(
            `      <div class="col-lg-6 mb-5 mb-lg-0${textFirst ? ' order-lg-last' : ''}">`
        );
        lines.push(buildSectionTitle(section, '        '));
        lines.push(...renderSectionContent(section, '        '));

        if (index === 0 && !hasButtonParagraph) {
            lines.push('        <a href="/about-me/contact-us" class="theme-btn mt-5">Book Appointment</a>');
        }

        lines.push('      </div>');
        lines.push('      <div class="col-lg-6">');
        lines.push('        <picture>');
        lines.push(`          <source media="(max-width: 440px)" srcset="/images/${imageName}-sm.webp">`);

        if (index === 0) {
            lines.push(`          <source srcset="/images/${imageName}.webp" type="image/webp">`);
            lines.push(`          <img src="/images/${imageName}.jpg" alt="${section.title}" width="690" height="450" >`);
        } else {
            lines.push(`          <img src="/images/${imageName}.webp" alt="${section.title}" width="690" height="450" loading="lazy">`);
        }

        lines.push('        </picture>');
        lines.push('      </div>');
        lines.push('    </div>');
        lines.push('  </div>');
        lines.push(`</${containerTag}>`);

    });

    return lines.join('\n\n');

}

window.renderTable = renderTable;
window.renderParagraph = renderParagraph;
window.renderSectionContent = renderSectionContent;
window.buildSectionTitle = buildSectionTitle;
window.buildNoImage = buildNoImage;
window.buildImageLayout = buildImageLayout;
