function buildInner(sections) {

    return sections.map((section, index) => {

        const imageName = `section-${index + 1}`;
        const imgRight = index % 2 === 0;
        const hasButtonParagraph = section.content.some(item =>
            item.type === 'p' && item.html.trim().toLowerCase().startsWith('button:')
        );
        const lines = [];
        const containerTag = index === 0 ? 'article' : 'section';

        lines.push(`<${containerTag} class="padding-top-bottom">`);
        lines.push('  <div class="container">');
        lines.push('    <div class="row align-items-center">');
        lines.push(
            `      <div class="col-lg-6${imgRight ? '' : ' order-lg-last'} mb-5 mb-lg-0">`
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

        return lines.join('\n');

    }).join('\n\n');

}
