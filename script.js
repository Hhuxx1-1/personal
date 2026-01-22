document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.snap-container');
    const sections = document.querySelectorAll('.section');
    let current = 0;

    const scrollToSection = (index) => {
        sections[index].scrollIntoView({ behavior: 'smooth' });
    };

    // Wheel debounce
    let timeout;
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            current += e.deltaY > 0 ? 1 : -1;
            current = Math.max(0, Math.min(current, sections.length - 1));
            scrollToSection(current);
        }, 100); // Debounce for no halfway
    }, { passive: false });

    // Arrow keys
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') current = Math.min(current + 1, sections.length - 1);
        else if (e.key === 'ArrowUp') current = Math.max(current - 1, 0);
        scrollToSection(current);
    });
});