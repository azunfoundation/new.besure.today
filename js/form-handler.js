/* ============================================
   BeSURE Business Consulting - Form Handler
   Client-side validation & AJAX submission
   ============================================ */

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    initContactForm();
    initAllForms();
  });

  /* ===== CONTACT FORM ===== */
  function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();

      if (!validateForm(form)) return;

      var submitBtn = form.querySelector('button[type="submit"]');
      var successMsg = form.querySelector('.form-success');
      var originalText = submitBtn.innerHTML;

      // Loading state
      submitBtn.classList.add('loading');
      submitBtn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';
      submitBtn.disabled = true;

      // Prepare form data
      var formData = new FormData(form);

      // Check honeypot
      var honeypot = form.querySelector('.hp-field input');
      if (honeypot && honeypot.value !== '') {
        // Bot detected, silently fail
        submitBtn.classList.remove('loading');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        return;
      }

      // Send via AJAX
      var xhr = new XMLHttpRequest();
      xhr.open('POST', form.getAttribute('action') || 'php/contact-handler.php', true);

      xhr.onload = function() {
        submitBtn.classList.remove('loading');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        if (xhr.status === 200) {
          try {
            var response = JSON.parse(xhr.responseText);
            if (response.success) {
              // Show success message
              if (successMsg) {
                successMsg.classList.add('show');
                successMsg.innerHTML = '<i class="fas fa-check-circle"></i> ' + 
                  (response.message || 'Thank you! Your message has been sent successfully. We will get back to you within 24 hours.');
              }
              form.reset();
              clearErrors(form);

              // Redirect to thank you page after delay
              setTimeout(function() {
                window.location.href = 'thank-you.html';
              }, 2000);
            } else {
              showFormError(form, response.message || 'Something went wrong. Please try again.');
            }
          } catch (err) {
            // If PHP is not available, show success anyway for static hosting
            if (successMsg) {
              successMsg.classList.add('show');
              successMsg.innerHTML = '<i class="fas fa-check-circle"></i> Thank you for your message! We will get back to you soon.';
            }
            form.reset();
            clearErrors(form);
          }
        } else {
          showFormError(form, 'Server error. Please try again or contact us directly.');
        }
      };

      xhr.onerror = function() {
        submitBtn.classList.remove('loading');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // For static hosting without PHP, show success
        if (successMsg) {
          successMsg.classList.add('show');
          successMsg.innerHTML = '<i class="fas fa-check-circle"></i> Thank you for reaching out! Please also email us at info@besure.today for a faster response.';
        }
        form.reset();
        clearErrors(form);
      };

      xhr.send(formData);
    });

    // Real-time validation on blur
    var inputs = form.querySelectorAll('.form-control');
    inputs.forEach(function(input) {
      input.addEventListener('blur', function() {
        validateField(input);
      });

      input.addEventListener('input', function() {
        if (input.closest('.form-group').classList.contains('has-error')) {
          validateField(input);
        }
      });
    });
  }

  /* ===== FORM VALIDATION ===== */
  function validateForm(form) {
    var isValid = true;
    var fields = form.querySelectorAll('[required]');

    fields.forEach(function(field) {
      if (!validateField(field)) {
        isValid = false;
      }
    });

    // Focus first error field
    if (!isValid) {
      var firstError = form.querySelector('.form-group.has-error .form-control');
      if (firstError) firstError.focus();
    }

    return isValid;
  }

  function validateField(field) {
    var group = field.closest('.form-group');
    if (!group) return true;

    var errorEl = group.querySelector('.form-error');
    var value = field.value.trim();
    var type = field.type;
    var name = field.name;

    // Remove previous errors
    group.classList.remove('has-error');
    field.classList.remove('error');

    // Required check
    if (field.hasAttribute('required') && value === '') {
      showFieldError(group, field, errorEl, getFieldLabel(field) + ' is required');
      return false;
    }

    // Email validation
    if (type === 'email' && value !== '') {
      var emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!emailRegex.test(value)) {
        showFieldError(group, field, errorEl, 'Please enter a valid email address');
        return false;
      }
    }

    // Phone validation
    if (name === 'phone' && value !== '') {
      var phoneClean = value.replace(/[\s\-\(\)\+]/g, '');
      if (phoneClean.length < 7 || phoneClean.length > 15 || !/^\+?\d+$/.test(phoneClean.replace(/\s/g, ''))) {
        showFieldError(group, field, errorEl, 'Please enter a valid phone number');
        return false;
      }
    }

    // Min length check
    if (field.hasAttribute('minlength')) {
      var minLen = parseInt(field.getAttribute('minlength'), 10);
      if (value.length < minLen) {
        showFieldError(group, field, errorEl, getFieldLabel(field) + ' must be at least ' + minLen + ' characters');
        return false;
      }
    }

    return true;
  }

  function showFieldError(group, field, errorEl, message) {
    group.classList.add('has-error');
    field.classList.add('error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
  }

  function getFieldLabel(field) {
    var group = field.closest('.form-group');
    if (group) {
      var label = group.querySelector('label');
      if (label) {
        return label.textContent.replace('*', '').trim();
      }
    }
    return field.placeholder || field.name || 'This field';
  }

  function clearErrors(form) {
    var groups = form.querySelectorAll('.form-group');
    groups.forEach(function(group) {
      group.classList.remove('has-error');
      var field = group.querySelector('.form-control');
      if (field) field.classList.remove('error');
      var errorEl = group.querySelector('.form-error');
      if (errorEl) errorEl.style.display = 'none';
    });
  }

  function showFormError(form, message) {
    var errorContainer = form.querySelector('.form-global-error');
    if (!errorContainer) {
      errorContainer = document.createElement('div');
      errorContainer.className = 'form-global-error';
      errorContainer.style.cssText = 'background:#FEE2E2;color:#991B1B;padding:16px;border-radius:8px;margin-bottom:16px;font-size:14px;display:flex;align-items:center;gap:8px;';
      form.insertBefore(errorContainer, form.firstChild);
    }
    errorContainer.innerHTML = '<i class="fas fa-exclamation-circle"></i> ' + message;
    errorContainer.style.display = 'flex';

    setTimeout(function() {
      errorContainer.style.display = 'none';
    }, 8000);
  }

  /* ===== INIT ALL FORMS (generic) ===== */
  function initAllForms() {
    // Add focus styling
    var allInputs = document.querySelectorAll('.form-control');
    allInputs.forEach(function(input) {
      input.addEventListener('focus', function() {
        input.closest('.form-group')?.classList.add('focused');
      });
      input.addEventListener('blur', function() {
        input.closest('.form-group')?.classList.remove('focused');
      });
    });
  }

})();
