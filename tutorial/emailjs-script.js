// Enhanced EmailJS Initialization and Form Handling
document.addEventListener('DOMContentLoaded', function() {
  // Replace with your actual EmailJS User ID
  (function() {
    emailjs.init("USER_ID_HERE"); // You'll need to replace this with your actual EmailJS User ID
  })();

  // Newsletter Subscription Handler with Name
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      const nameInput = this.querySelector('input[name="name"]');
      const emailInput = this.querySelector('input[name="email"]');
      
      const name = nameInput.value;
      const email = emailInput.value;

      // Send subscription email
      emailjs.send("YOUR_SERVICE_ID", "YOUR_SUBSCRIPTION_TEMPLATE_ID", {
        name: name,
        email: email
      }).then(
        function(response) {
          alert(`Thank you, ${name}! You have successfully subscribed to our newsletter.`);
          nameInput.value = ''; // Clear name input
          emailInput.value = ''; // Clear email input
        },
        function(error) {
          console.error('Newsletter subscription failed:', error);
          alert('Subscription failed. Please try again.');
        }
      );
    });
  }

  // Contact Form Submission Handler
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      const nameInput = this.querySelector('input[type="text"]');
      const emailInput = this.querySelector('input[type="email"]');
      const phoneInput = this.querySelector('input[type="tel"]');
      const serviceSelect = this.querySelector('select');
      const messageInput = this.querySelector('textarea');

      emailjs.send("YOUR_SERVICE_ID", "YOUR_CONTACT_TEMPLATE_ID", {
        name: nameInput.value,
        email: emailInput.value,
        phone: phoneInput.value,
        service: serviceSelect.value,
        message: messageInput.value
      }).then(
        function(response) {
          alert('Thank you! We will get back to you soon.');
          // Reset form
          nameInput.value = '';
          emailInput.value = '';
          phoneInput.value = '';
          serviceSelect.selectedIndex = 0;
          messageInput.value = '';
        },
        function(error) {
          console.error('Contact form submission failed:', error);
          alert('Submission failed. Please try again.');
        }
      );
    });
  }
});
