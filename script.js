/**
 * Praesenza - Mobile Menu Handler
 * Gestisce il menu hamburger su dispositivi mobile
 */

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle menu on hamburger click
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', menuToggle.classList.contains('active'));
        });
    }

    // Close menu when a nav link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.navbar')) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Scroll Reveal Animation using Intersection Observer
    const scrollRevealElements = document.querySelectorAll('.scroll-reveal');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    scrollRevealElements.forEach(element => {
        observer.observe(element);
    });

    // Service detail modals
    const modalTriggers = document.querySelectorAll('[data-modal]');
    let lastFocusedElement = null;

    function openModal(modal) {
        lastFocusedElement = document.activeElement;
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) closeBtn.focus();
    }

    function closeModal(modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        if (lastFocusedElement) lastFocusedElement.focus();
    }

    modalTriggers.forEach(trigger => {
        const modal = document.getElementById(trigger.dataset.modal);
        if (!modal) return;

        trigger.addEventListener('click', () => openModal(modal));
        trigger.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal(modal);
            }
        });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        const closeBtn = overlay.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => closeModal(overlay));
        }
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) closeModal(overlay);
        });
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) closeModal(activeModal);
        }
    });

    // Handle form submission (sends via Web3Forms — no backend needed)
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const formNote = contactForm.querySelector('[data-default-note]');
        const defaultNoteText = formNote ? formNote.textContent : '';
        const defaultBtnText = submitBtn ? submitBtn.textContent : '';
        const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s-]+$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        function showNote(text, state) {
            if (!formNote) return;
            formNote.textContent = text;
            formNote.classList.remove('form-note--success', 'form-note--error');
            if (state) formNote.classList.add('form-note--' + state);
        }

        function resetNote() {
            showNote(defaultNoteText, null);
        }

        // Live validation on the name field as the user types
        const nomeField = document.getElementById('nome');
        const nomeError = document.getElementById('nome-error');

        function validateNomeLive() {
            const val = nomeField.value.trim();
            if (val !== '' && !nameRegex.test(val)) {
                nomeField.classList.add('input-error');
                if (nomeError) nomeError.textContent = 'Solo lettere, spazi e trattini (-).';
                return false;
            }
            nomeField.classList.remove('input-error');
            if (nomeError) nomeError.textContent = '';
            return true;
        }

        if (nomeField) {
            nomeField.addEventListener('input', validateNomeLive);
        }

        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const emailField = document.getElementById('email');
            const messaggioField = document.getElementById('messaggio');
            const nome = nomeField.value.trim();
            const email = emailField.value.trim();
            const messaggio = messaggioField.value.trim();

            if (nome === '' || email === '' || messaggio === '') {
                showNote('Per favore, compila tutti i campi.', 'error');
                return;
            }

            if (!validateNomeLive()) {
                showNote('Il nome può contenere solo lettere, spazi e trattini (-).', 'error');
                nomeField.focus();
                return;
            }

            if (!emailRegex.test(email)) {
                showNote('Per favore, inserisci un indirizzo email valido.', 'error');
                emailField.focus();
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Invio in corso...';
            }
            showNote('Invio in corso...', null);

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: new FormData(contactForm)
                });
                const result = await response.json();

                if (response.status === 200 && result.success) {
                    contactForm.reset();
                    showNote('Grazie! Abbiamo ricevuto la tua richiesta. Ti contatteremo entro 24 ore.', 'success');
                    setTimeout(resetNote, 6000);
                } else {
                    throw new Error(result.message || 'Invio non riuscito');
                }
            } catch (error) {
                showNote('Si è verificato un problema nell\'invio. Riprova oppure scrivici a praesenza@gmail.com.', 'error');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = defaultBtnText;
                }
            }
        });
    }
});
