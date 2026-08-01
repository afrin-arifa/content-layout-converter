function parseSections(container) {

    const sections = [];

    let current = null;
    let allPreviousContent = new Set();
    let seenHeadings = new Set();

    const nodes = container.querySelectorAll(
        'h1,h2,h3,h4,h5,h6,p,ul,ol,table'
    );

    nodes.forEach(node => {

        const tag = node.tagName.toLowerCase();

        if (/^h[1-6]$/.test(tag)) {

            if (current) {
                sections.push(current);
            }

            const headingTitle = cleanText(node.textContent);
            current = {
                tag,
                title: headingTitle,
                content: [],
                isDuplicate: seenHeadings.has(headingTitle)
            };
            seenHeadings.add(headingTitle);

            return;

        }

        if (!current) {

            current = {
                tag: 'h2',
                title: 'Introduction',
                content: []
            };

        }

        if (tag === 'p') {

            let html = node.innerHTML;
            html = html.replace(/<br\s*\/?>/gi, ' ');
            html = html.replace(/<p[^>]*>/gi, '').replace(/<\/p>/gi, '');

            const cleanedHtml = cleanText(html);

            if (cleanedHtml && !allPreviousContent.has(cleanText(node.textContent))) {

                current.content.push({
                    type: 'p',
                    html: cleanedHtml
                });
                allPreviousContent.add(cleanText(node.textContent));

            }

        }

        if (tag === 'ul' || tag === 'ol') {

            const items = [];

            node.querySelectorAll('li').forEach(li => {

                let item = li.innerHTML;
                item = item.replace(/<img[^>]*>/gi, '');
                item = item.replace(/<p[^>]*>/gi, '').replace(/<\/p>/gi, '');
                item = cleanText(item);

                const textOnly = cleanText(li.textContent);

                if (textOnly && !allPreviousContent.has(textOnly)) {
                    items.push(item);
                    allPreviousContent.add(textOnly);
                }

            });

            if (items.length) {

                current.content.push({
                    type: 'list',
                    tag,
                    items
                });

            }

        }

        if (tag === 'table') {

            node.querySelectorAll('td, th').forEach(cell => {
                const cellText = cleanText(cell.textContent);
                if (cellText) {
                    allPreviousContent.add(cellText);
                }
            });

            node.querySelectorAll('h3, h4, h5, h6').forEach(heading => {
                const headingText = cleanText(heading.textContent);
                if (headingText) {
                    seenHeadings.add(headingText);
                }
            });

            current.content.push({
                type: 'table',
                node: node.cloneNode(true)
            });

        }

    });

    if (current) {
        sections.push(current);
    }

    const uniqueSections = sections.filter(section => {
        return !section.isDuplicate && section.content.length > 0;
    });

    return uniqueSections;

}
