function buildUl(sections) {

    const lines = [];
    const items = [];
    const descriptions = [];

    sections.forEach(section => {

        section.content.forEach(item => {

            if (item.type === 'list') {
                item.items.forEach(li => {
                    items.push(li);
                });
            }

            if (item.type === 'p') {
                descriptions.push(item.html);
            }

        });

    });

    if (!items.length) {
        return '';
    }

    lines.push('<ul class="theme-list">');

    items.forEach((li, index) => {
        const description = descriptions[index];

        if (description) {
            lines.push(`  <li><b>${li}</b> ${description}</li>`);
            return;
        }

        lines.push(`  <li>${li}</li>`);
    });

    lines.push('</ul>');

    return lines.join('\n');

}
