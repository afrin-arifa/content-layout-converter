        let currentMode = 'inner';

        const editor = document.getElementById('editor');
        const output = document.getElementById('output');

        const btnInner = document.getElementById('btnInner');
        const btnBlog = document.getElementById('btnBlog');
        const btnFaq = document.getElementById('btnFaq');

        const generateBtn = document.getElementById('generateBtn');
        const copyBtn = document.getElementById('copyBtn');
        const clearBtn = document.getElementById('clearBtn');

        const statusMsg = document.getElementById('statusMsg');

        function showStatus(msg) {

            statusMsg.textContent = msg;

            clearTimeout(showStatus.timer);

            showStatus.timer = setTimeout(() => {
                statusMsg.textContent = '';
            }, 2000);

        }

        function setMode(mode) {

            currentMode = mode;

            btnInner.classList.toggle('active', mode === 'inner');
            btnBlog.classList.toggle('active', mode === 'blog');
            btnFaq.classList.toggle('active', mode === 'faq');

            document.getElementById('modeBadge').textContent =
                mode === 'inner'
                    ? 'Bootstrap layout'
                    : mode === 'blog'
                        ? 'Semantic blog'
                        : 'FAQ accordion';

        }

        btnInner.onclick = () => setMode('inner');
        btnBlog.onclick = () => setMode('blog');
        btnFaq.onclick = () => setMode('faq');

        function cleanText(str = '') {

            return str
                .replace(/&nbsp;/gi, ' ')
                .replace(/\u00a0/g, ' ')
                .replace(/\u200b/g, '')
                .replace(/\s{2,}/g, ' ')
                .trim();

        }

        function sanitizeHref(href = '') {

            href = href.trim();

            if (
                href.startsWith('http://') ||
                href.startsWith('https://') ||
                href.startsWith('/') ||
                href.startsWith('#') ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:')
            ) {
                return href;
            }

            return '#';

        }

        editor.addEventListener('paste', e => {

            e.preventDefault();

            let html =
                e.clipboardData.getData('text/html') ||
                e.clipboardData.getData('text/plain');

            html = html
                .replace(/&nbsp;/gi, ' ')
                .replace(/\u00a0/g, ' ')
                .replace(/\u200b/g, '');

            const temp = document.createElement('div');

            temp.innerHTML = html;

            temp.querySelectorAll('script,style,meta,link').forEach(el => {
                el.remove();
            });

            temp.querySelectorAll('*').forEach(el => {

                [...el.attributes].forEach(attr => {

                    if (attr.name === 'href') {
                        el.setAttribute('href', sanitizeHref(attr.value));
                    } else {
                        el.removeAttribute(attr.name);
                    }

                });

            });

            temp.querySelectorAll('span,font').forEach(el => {
                el.replaceWith(...el.childNodes);
            });

            document.execCommand('insertHTML', false, temp.innerHTML);

        });

        function parseSections(container) {

            const sections = [];

            let current = null;
            let lastListItems = [];

            const nodes = container.querySelectorAll(
                'h1,h2,h3,h4,h5,h6,p,ul,ol,table'
            );

            nodes.forEach(node => {

                const tag = node.tagName.toLowerCase();

                if (/^h[1-6]$/.test(tag)) {

                    if (current) {
                        sections.push(current);
                    }

                    current = {
                        tag,
                        title: cleanText(node.textContent),
                        content: []
                    };

                    lastListItems = [];

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

                    const html = cleanText(node.innerHTML);

                    // Skip if this paragraph matches any of the last list items (duplicate)
                    if (html && !lastListItems.includes(html)) {

                        current.content.push({
                            type: 'p',
                            html
                        });

                    }

                }

                if (tag === 'ul' || tag === 'ol') {

                    const items = [];

                    node.querySelectorAll('li').forEach(li => {

                        let item = li.innerHTML;
                        // Remove <p> tags but keep the text content
                        item = item.replace(/<p[^>]*>/gi, '').replace(/<\/p>/gi, '');
                        item = cleanText(item);

                        if (item) {
                            items.push(item);
                        }

                    });

                    if (items.length) {

                        current.content.push({
                            type: 'list',
                            tag,
                            items
                        });

                        lastListItems = items;

                    }

                }

                if (tag === 'table') {

                    current.content.push({
                        type: 'table',
                        node: node.cloneNode(true)
                    });

                }

            });

            if (current) {
                sections.push(current);
            }

            return sections;

        }

        function renderTable(node) {

            const rows = [...node.querySelectorAll('tr')];

            const lines = [];

            lines.push('<table>');

            rows.forEach((row, index) => {

                lines.push('  <tr>');

                row.querySelectorAll('th,td').forEach(cell => {

                    const tag = index === 0 ? 'th' : 'td';

                    lines.push(
                        `    <${tag}>${cleanText(cell.innerHTML)}</${tag}>`
                    );

                });

                lines.push('  </tr>');

            });

            lines.push('</table>');

            return lines.join('\n');

        }

        function buildBlog(sections) {

            const lines = [];

            lines.push('<div class="padding-top-bottom-blog">');
            lines.push('  <div class="container">');
            lines.push('    <div class="row justify-content-center">');
            lines.push('      <div class="col-lg-8 col-md-10 mb-5 mb-lg-0">');

            sections.forEach((section, index) => {

                if (index === 0) {
                    lines.push('        <article>');
                } else {
                    lines.push('        <section>');
                }

                lines.push(
                    `          <${section.tag} class="theme-heading">${section.title}</${section.tag}>`
                );

                section.content.forEach(item => {

                    if (item.type === 'p') {
                        lines.push(`          <p>${item.html}</p>`);
                    }

                    if (item.type === 'list') {

                        lines.push(`          <${item.tag} class="theme-list">`);

                        item.items.forEach(li => {
                            lines.push(`            <li>${li}</li>`);
                        });

                        lines.push(`          </${item.tag}>`);

                    }

                    if (item.type === 'table') {

                        lines.push(
                            '          <div class="table-responsive mt-4">'
                        );

                        lines.push(
                            renderTable(item.node)
                                .split('\n')
                                .map(line => '            ' + line)
                                .join('\n')
                        );

                        lines.push('          </div>');

                    }

                });

                // Add featured image
                lines.push('          <picture class="d-block mb-5">');

                if (index === 0) {
                    lines.push(
                        `            <source media="(max-width: 440px)" srcset="/images/blog-main-sm.webp" type="image/webp" />`
                    );
                    lines.push(
                        `            <source srcset="/images/blog-main.webp" type="image/webp" />`
                    );
                    lines.push(
                        `            <img src="/images/blog-main.jpg" alt="${section.title}" width="950" height="400" />`
                    );
                } else {
                    lines.push(
                        `            <source media="(max-width: 440px)" srcset="/images/blog-section-${index}-sm.webp" />`
                    );
                    lines.push(
                        `            <img src="/images/blog-section-${index}.webp" alt="${section.title}" width="950" height="400" loading="lazy" />`
                    );
                }

                lines.push('          </picture>');

                if (index === 0) {
                    lines.push('        </article>');
                } else {
                    lines.push('        </section>');
                }

            });

            lines.push('      </div>');
            lines.push('    </div>');
            lines.push('  </div>');
            lines.push('</div>');

            return lines.join('\n');

        }

        function buildInner(sections) {

            return sections.map((section, index) => {

                const imageName = `section-${index + 1}`;

                const imgRight = index % 2 === 0;

                const lines = [];

                const containerTag = index === 0 ? 'article' : 'section';

                lines.push(`<${containerTag} class="padding-top-bottom">`);
                lines.push('  <div class="container">');
                lines.push('    <div class="row align-items-center">');

                lines.push(
                    `      <div class="col-lg-6${imgRight ? '' : ' order-lg-last'} mb-5 mb-lg-0">`
                );

                lines.push(
                    `        <${section.tag} class="theme-heading">${section.title}</${section.tag}>`
                );

                section.content.forEach(item => {

                    if (item.type === 'p') {
                        lines.push(`        <p>${item.html}</p>`);
                    }

                    if (item.type === 'list') {

                        lines.push(`        <${item.tag} class="theme-list">`);

                        item.items.forEach(li => {
                            lines.push(`          <li>${li}</li>`);
                        });

                        lines.push(`        </${item.tag}>`);

                    }

                    if (item.type === 'table') {

                        lines.push(
                            renderTable(item.node)
                                .split('\n')
                                .map(line => '        ' + line)
                                .join('\n')
                        );

                    }

                });

                if (index === 0) {

                    lines.push(
                        '        <a href="/about-me/contact-us" class="theme-btn mt-5">Book Appointment</a>'
                    );

                }

                lines.push('      </div>');

                lines.push('      <div class="col-lg-6">');
                lines.push('        <picture>');
                lines.push(
                    `          <source media="(max-width: 440px)" srcset="/images/${imageName}-sm.webp">`
                );

                if (index === 0) {
                    lines.push(
                        `          <source srcset="/images/${imageName}.webp" type="image/webp">`
                    );
                    lines.push(
                        `          <img src="/images/${imageName}.jpg" alt="${section.title}" width="690" height="450" >`
                    );
                } else {
                    lines.push(
                        `          <img src="/images/${imageName}.webp" alt="${section.title}" width="690" height="450" loading="lazy">`
                    );
                }

                lines.push('        </picture>');
                lines.push('      </div>');

                lines.push('    </div>');
                lines.push('  </div>');
                lines.push(`</${containerTag}>`);

                return lines.join('\n');

            }).join('\n\n');

        }

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
                            return `<p>${item.html}</p>`;
                        }

                        if (item.type === 'list') {

                            return `
<${item.tag}>
${item.items.map(li => `  <li>${li}</li>`).join('\n')}
</${item.tag}>`;

                        }

                        if (item.type === 'table') {
                            return renderTable(item.node);
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
                lines.push(`      <p>${introParagraph}</p>`);
            }
            lines.push('    </div>');

            lines.push('    <div class="accordion">');

            faqItems.forEach((faq, index) => {

                lines.push('      <div class="faq-box">');

                lines.push(
                    `        <h3 class="faq-title${index === 0 ? ' open' : ''}">${faq.question}</h3>`
                );

                lines.push(
                    `        <div class="faq-body${index === 0 ? ' active' : ''}">`
                );

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

            return lines.join('\n');

        }

        function generate() {

            const container = document.createElement('div');

            container.innerHTML = editor.innerHTML;

            const sections = parseSections(container);

            if (!sections.length) {

                output.textContent = '<!-- no content found -->';

                showStatus('Nothing found');

                return;

            }

            const html =
                currentMode === 'inner'
                    ? buildInner(sections)
                    : currentMode === 'blog'
                        ? buildBlog(sections)
                        : buildFAQ(sections);

            output.textContent = html;

            showStatus('Generated ✓');

        }

        async function copyHTML() {

            const text = output.textContent;

            if (!text) {
                showStatus('Nothing to copy');
                return;
            }

            try {

                await navigator.clipboard.writeText(text);

            } catch {

                const textarea = document.createElement('textarea');

                textarea.value = text;

                document.body.appendChild(textarea);

                textarea.select();

                document.execCommand('copy');

                textarea.remove();

            }

            showStatus('Copied ✓');

        }

        function clearAll() {

            editor.innerHTML = '';
            output.textContent = '';

            editor.focus();

            showStatus('Cleared');

        }

        generateBtn.onclick = generate;
        copyBtn.onclick = copyHTML;
        clearBtn.onclick = clearAll;

        document.addEventListener('keydown', e => {

            const mod = e.ctrlKey || e.metaKey;

            if (mod && e.key === 'Enter') {
                e.preventDefault();
                generate();
            }

            if (mod && e.shiftKey && e.key.toLowerCase() === 'c') {
                e.preventDefault();
                copyHTML();
            }

        });