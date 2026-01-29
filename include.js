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
    
    // Явно вызываем initAuthMenu после загрузки header
    try {
        const { initAuthMenu } = await import('/scripts/initAuthMenu.js');
        initAuthMenu();
    } catch (e) {
        // Если модуль еще не загружен, он вызовется по событию header:loaded
        console.warn('initAuthMenu module not ready yet:', e);
    }
});


