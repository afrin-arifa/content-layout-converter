function buildOl(sections) {

    const lines = [];

    sections.forEach(section => {

        section.content.forEach(item => {

            if (item.type !== 'list') {
                return;
            }

            lines.push('<ol class="theme-list">');

            item.items.forEach(li => {
                lines.push(`  <li>${li}</li>`);
            });

            lines.push('</ol>');

        });

    });

    return lines.join('\n\n');

}
