function buildFAQ(sections) {

    const heading = sections[0]?.title || 'Frequently Asked Questions';

    const introParagraph =
        sections[0]?.content
            ?.find(item => item.type === 'p')
            ?.html || '';

    const faqItems = [];

    sections.slice(1).forEach(section => {

        const answer = section.content
            .map(item => {

                if (item.type === 'p') {
                    return renderParagraph(item, '').join('\n');
                }

                if (item.type === 'list') {

                    return `
<${item.tag}>
${item.items.map(li => `  <li>${li}</li>`).join('\n')}
</${item.tag}>`;

                }

                if (item.type === 'table') {
                    return '<div class="table-responsive">\n' + renderTable(item.node) + '\n</div>';
                }

                return '';

            })
            .join('\n');

        faqItems.push({
            question: section.title,
            answer
        });

    });

    const lines = [];

    lines.push('<section class="padding-top-bottom">');
    lines.push('  <div class="container">');
    lines.push('    <div class="col-lg-11 text-center mx-auto mb-5">');
    lines.push(`      <h2 class="theme-heading">${heading}</h2>`);
    if (introParagraph) {
        lines.push(...renderParagraph({ html: introParagraph }, '      '));
    }
    lines.push('    </div>');
    lines.push('    <div class="accordion">');

    faqItems.forEach((faq, index) => {

        lines.push('      <div class="faq-box">');
        lines.push(`        <h3 class="faq-title${index === 0 ? ' open' : ''}">${faq.question}</h3>`);
        lines.push(`        <div class="faq-body${index === 0 ? ' active' : ''}">`);
        lines.push(
            faq.answer
                .split('\n')
                .map(line => `          ${line}`)
                .join('\n')
        );
        lines.push('        </div>');
        lines.push('      </div>');

    });

    lines.push('    </div>');
    lines.push('  </div>');
    lines.push('</section>');
    lines.push('##related-widget##');

    return lines.join('\n');

}
