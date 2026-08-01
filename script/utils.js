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
