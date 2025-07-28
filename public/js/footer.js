document.addEventListener('DOMContentLoaded', function() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = this.querySelector('.newsletter-btn');
            const input = this.querySelector('.newsletter-input');
            
            // Simular envío
            btn.innerHTML = '<i class="bi bi-check-circle"></i>';
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-success');
            
            setTimeout(() => {
                btn.innerHTML = '<i class="bi bi-send"></i>';
                btn.classList.remove('btn-success');
                btn.classList.add('btn-primary');
                input.value = '';
            }, 2000);
        });
    }
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach(stat => {
                    const finalNumber = parseInt(stat.textContent);
                    animateNumber(stat, 0, finalNumber, 2000);
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    const footerStats = document.querySelector('.footer-stats');
    if (footerStats) {
        observer.observe(footerStats);
    }
    
    function animateNumber(element, start, end, duration) {
        const startTime = performance.now();
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(start + (end - start) * progress);
            element.textContent = current + '+';
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        requestAnimationFrame(update);
    }
});
