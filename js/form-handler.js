/* ==========================================================================
   BeSURE Business Consulting — Form Handler v2.0
   ========================================================================== */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#contact-form');
  if (!form) return;

  const submitBtn = form.querySelector('.form-submit-btn');
  const successMsg = document.querySelector('.form-success');
  const btnText = submitBtn?.querySelector('.btn-text');
  const btnSpinner = submitBtn?.querySelector('.spinner');

  // Validation rules
  const validators = {
    name: (value) => {
      if (!value.trim()) return 'Please enter your full name';
      if (value.trim().length < 2) return 'Name must be at least 2 characters';
      return '';
    },
    email: (value) => {
      if (!value.trim()) return 'Please enter your email address';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return 'Please enter a valid email address';
      return '';
    },
    phone: (value) => {
      if (value.trim() && !/^[\d\s\+\-\(\)]{7,20}$/.test(value.trim())) {
        return 'Please enter a valid phone number';
      }
      return '';
    },
    subject: (value) => {
      if (!value.trim()) return 'Please enter a subject';
      return '';
    },
    message: (value) => {
      if (!value.trim()) return 'Please enter your message';
      if (value.trim().length < 10) return 'Message must be at least 10 characters';
      return '';
    }
  };

  // Validate a single field
  const validateField = (input) => {
    const name = input.getAttribute('name');
    const validator = validators[name];
    if (!validator) return true;

    const error = validator(input.value);
    const formGroup = input.closest('.form-group');
    const errorEl = formGroup?.querySelector('.form-error');

    if (error) {
      formGroup?.classList.add('has-error');
      if (errorEl) errorEl.textContent = error;
      return false;
    } else {
      formGroup?.classList.remove('has-error');
      if (errorEl) errorEl.textContent = '';
      return true;
    }
  };

  // Real-time validation
  const inputs = form.querySelectorAll('.form-control');
  inputs.forEach(input => {
    // Validate on blur
    input.addEventListener('blur', () => validateField(input));

    // Clear error on input
    input.addEventListener('input', () => {
      const formGroup = input.closest('.form-group');
      if (formGroup?.classList.contains('has-error')) {
        validateField(input);
      }
    });
  });

  // Rate limiting
  let lastSubmitTime = 0;
  const SUBMIT_COOLDOWN = 30000; // 30 seconds

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot check
    const honeypot = form.querySelector('.hp-field input');
    if (honeypot && honeypot.value) return;

    // Rate limiting
    const now = Date.now();
    if (now - lastSubmitTime < SUBMIT_COOLDOWN) {
      const remaining = Math.ceil((SUBMIT_COOLDOWN - (now - lastSubmitTime)) / 1000);
      alert(`Please wait ${remaining} seconds before submitting again.`);
      return;
    }

    // Validate all fields
    let isValid = true;
    inputs.forEach(input => {
      if (!validateField(input)) isValid = false;
    });

    if (!isValid) return;

    // Show loading state
    if (submitBtn) submitBtn.classList.add('loading');
    if (btnText) btnText.textContent = 'Sending...';
    if (btnSpinner) btnSpinner.style.display = 'inline-block';

    try {
      const formData = new FormData(form);

      const response = await fetch('php/contact-handler.php', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        lastSubmitTime = now;
        form.style.display = 'none';
        if (successMsg) {
          successMsg.classList.add('show');
          successMsg.innerHTML = `
            <i class="fa-solid fa-circle-check" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
            <strong>Thank you!</strong><br>
            Your message has been sent successfully. We'll respond within 24 business hours.
          `;
        }
      } else {
        throw new Error(result.message || 'Something went wrong');
      }
    } catch (error) {
      alert(error.message || 'Failed to send message. Please try again or call us directly.');
    } finally {
      if (submitBtn) submitBtn.classList.remove('loading');
      if (btnText) btnText.textContent = 'Send Your Message';
      if (btnSpinner) btnSpinner.style.display = 'none';
    }
  });
});
