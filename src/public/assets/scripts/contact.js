document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const content = document.getElementById('content').value;
    const privacy = document.getElementById('privacy').checked;

    if (!privacy) {
        alert('Please accept the terms and conditions');
        return;
    }

    console.log('Form submitted:', {
        name,
        email,
        content
    });

    alert('Thank you for your message! We will get back to you soon.');

    this.reset();
});

window.addEventListener('load', function() {
    const container = document.querySelector('.contact-container');

    container.style.opacity = '0';
    container.style.transform = 'translateY(20px)';

    setTimeout(() => {
        container.style.transition = 'all 0.6s ease';
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
    }, 100);
});

document.getElementById('email').addEventListener('blur', function() {
    const emailValue = this.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailValue && !emailRegex.test(emailValue)) {
        this.style.borderColor = '#ff6b6b';
        alert('Please enter a valid email address');
    } else {
        this.style.borderColor = '';
    }
});

const contentTextarea = document.getElementById('content');
const maxLength = 500;

contentTextarea.addEventListener('input', function() {
    const currentLength = this.value.length;

    if (currentLength > maxLength) {
        this.value = this.value.substring(0, maxLength);
    }
});