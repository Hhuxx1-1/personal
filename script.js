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

    // ── NEW: Carousel logic ────────────────────────────────────────────────
    const carousel = document.getElementById('portfolio-carousel');
    if (!carousel) return; // safety

    const cards = carousel.querySelectorAll('.carousel-card');
    const dotsContainer = document.getElementById('carousel-dots');
    const prevBtn = document.querySelector('.carousel-arrow.prev');
    const nextBtn = document.querySelector('.carousel-arrow.next');
    console.log("Check Button : ",prevBtn,nextBtn);
    // Create dots
    cards.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.classList.add('carousel-dot');
        dot.addEventListener('click', () => {
            cards[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        });
        dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.carousel-dot');

    // Update active dot on scroll
    const updateActiveDot = () => {
        const carouselRect = carousel.getBoundingClientRect();
        let closestIndex = 0;
        let minDistance = Infinity;

        cards.forEach((card, i) => {
            const cardRect = card.getBoundingClientRect();
            const distance = Math.abs(cardRect.left - carouselRect.left);
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = i;
            }
        });

        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === closestIndex);
        });
    };

    carousel.addEventListener('scroll', updateActiveDot);
    window.addEventListener('resize', updateActiveDot);
    updateActiveDot(); // initial

    // Arrow buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            carousel.scrollBy({ left: -carousel.clientWidth * 0.8, behavior: 'smooth' });
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            carousel.scrollBy({ left: carousel.clientWidth * 0.8, behavior: 'smooth' });
        });
    }
});