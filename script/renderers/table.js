function buildTableMode(sections) {

    const lines = [];

    sections.forEach(section => {

        section.content.forEach(item => {

            if (item.type !== 'table') {
                return;
            }

            lines.push('<div class="table-responsive">');
            lines.push(
                renderTable(item.node)
                    .split('\n')
                    .map(line => `  ${line}`)
                    .join('\n')
            );
            lines.push('</div>');

        });

    });

    return lines.join('\n\n');

}
