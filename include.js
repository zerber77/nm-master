document.addEventListener('DOMContentLoaded', async () => {
    const includeNodes = document.querySelectorAll('[data-include]');
    await Promise.all(Array.from(includeNodes).map(async node => {
        const url = node.getAttribute('data-include');
        if (!url) return;
        try {
            const res = await fetch(url, { cache: 'no-cache' });
            const html = await res.text();
            node.outerHTML = html;
        } catch (e) {
            // noop
        }
    }));
    window.dispatchEvent(new CustomEvent('header:loaded'));
});


