<div style="height:10px;"></div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Create OTP verification UI elements
    const phoneFieldGroup = document.querySelector('.elementor-field-group-phone');
    const verifyBtn = document.createElement('button');
    verifyBtn.id = 'verify-phone-btn';
    verifyBtn.type = 'button'; // Prevent accidental form submission
    verifyBtn.className = 'elementor-button';
    verifyBtn.textContent = 'Verify Phone';
    verifyBtn.style.marginTop = '10px';
    
    const otpContainer = document.createElement('div');
    otpContainer.id = 'otp-container';
    otpContainer.style.display = 'none';
    otpContainer.style.marginTop = '10px';
    
    const otpInput = document.createElement('input');
    otpInput.type = 'text';
    otpInput.id = 'otp-input';
    otpInput.placeholder = 'Enter OTP';
    otpInput.className = 'elementor-field elementor-size-sm';
    otpInput.style.marginRight = '5px';
    
    const verifyOtpBtn = document.createElement('button');
    verifyOtpBtn.id = 'verify-otp-btn';
    verifyOtpBtn.type = 'button'; // Prevent form submission
    verifyOtpBtn.className = 'elementor-button';
    verifyOtpBtn.textContent = 'Verify OTP';
    
    const otpMessage = document.createElement('div');
    otpMessage.id = 'otp-message';
    otpMessage.style.marginTop = '5px';
    
    // Assemble UI components
    otpContainer.appendChild(otpInput);
    otpContainer.appendChild(verifyOtpBtn);
    otpContainer.appendChild(otpMessage);
    phoneFieldGroup.appendChild(verifyBtn);
    phoneFieldGroup.appendChild(otpContainer);
    
    // Create hidden field to track verification status
    const verificationField = document.createElement('input');
    verificationField.type = 'hidden';
    verificationField.id = 'phone-verified';
    verificationField.name = 'phone_verified';
    verificationField.value = '0';
    phoneFieldGroup.appendChild(verificationField);
    
    // Find original submit button and its container
    const originalSubmitBtn = document.querySelector('button[type="submit"]');
    const buttonWrapper = originalSubmitBtn.closest('.elementor-field-group');
    
    // Hide original submit button
    originalSubmitBtn.style.display = 'none';
    
    // Create duplicate button
    const duplicateBtn = document.createElement('button');
    duplicateBtn.type = 'button'; // Important: not submit
    duplicateBtn.className = originalSubmitBtn.className;
    duplicateBtn.innerHTML = originalSubmitBtn.innerHTML;
    
    // Insert duplicate button next to original
    buttonWrapper.appendChild(duplicateBtn);
    
    // OTP storage variable
    let generatedOtp = null;
    let userPhone = '';
    let verificationAttempted = false;
    
    // Verify Phone Button Click Handler
    verifyBtn.addEventListener('click', async function() {
        const phoneInput = document.getElementById('form-field-phone');
        userPhone = phoneInput.value;
        
        if (!userPhone) {
            showMessage('Please enter a phone number', 'red');
            return;
        }
        
        // Generate 6-digit OTP
        generatedOtp = Math.floor(100000 + Math.random() * 900000);
        
        try {
            // Show sending state
            const originalText = verifyBtn.textContent;
            verifyBtn.disabled = true;
            verifyBtn.textContent = 'Sending...';
            
            // Send to Make.com webhook
            const response = await fetch('https://hook.us2.make.com/ixegb315amr97y86k8odbrc2pjh64qvf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: userPhone,
                    otp: generatedOtp
                })
            });
            
            if (response.ok) {
                showMessage('OTP sent successfully!', 'green');
                otpContainer.style.display = 'block';
                verifyBtn.textContent = 'Resend OTP';
                verificationAttempted = false; // Reset verification attempt flag
            } else {
                showMessage('Failed to send OTP. Please try again.', 'red');
                verifyBtn.textContent = originalText;
            }
        } catch (error) {
            showMessage('Network error. Please try again.', 'red');
            verifyBtn.textContent = 'Verify Phone';
        } finally {
            verifyBtn.disabled = false;
        }
    });
    
    // Verify OTP Button Click Handler
    verifyOtpBtn.addEventListener('click', function() {
        const enteredOtp = otpInput.value;
        
        if (!enteredOtp) {
            showMessage('Please enter OTP', 'red');
            return;
        }
        
        if (enteredOtp == generatedOtp) {
            showMessage('Phone verified successfully!', 'green');
            verificationField.value = '1';
            verificationAttempted = true;
            
            // Update duplicate button to submit form
            duplicateBtn.textContent = 'Submit Form';
            duplicateBtn.onclick = function() {
                originalSubmitBtn.click();
            };
        } else {
            showMessage('Invalid OTP. Please try again.', 'red');
            verificationAttempted = true;
        }
    });
    
    // Duplicate Button Click Handler
    duplicateBtn.addEventListener('click', function() {
        if (verificationField.value === '1') {
            // If verified, submit the form
            originalSubmitBtn.click();
        } else {
            // Only send OTP if it hasn't been sent yet
            if (!generatedOtp) {
                verifyBtn.click();
            }
            
            // Show appropriate message
            if (verificationAttempted) {
                showMessage('Please enter the correct OTP', 'red');
            } else {
                showMessage('Please verify your phone first', 'blue');
            }
            
            // Ensure OTP container is visible
            otpContainer.style.display = 'block';
            
            // Scroll to verification section
            otpContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
    
    // Prevent form submission via Enter key in OTP field
    otpInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            verifyOtpBtn.click();
        }
    });
    
    // Helper function to show messages
    function showMessage(text, color) {
        otpMessage.textContent = text;
        otpMessage.style.color = color;
        setTimeout(() => otpMessage.textContent = '', 3000);
    }
    
    // Reset verification if phone number changes
    document.getElementById('form-field-phone').addEventListener('input', function() {
        if (this.value !== userPhone) {
            generatedOtp = null;
            verificationAttempted = false;
            otpContainer.style.display = 'none';
            verificationField.value = '0';
            otpInput.value = '';
            verifyBtn.textContent = 'Verify Phone';
            
            // Reset duplicate button behavior
            duplicateBtn.textContent = 'Next';
            duplicateBtn.onclick = null;
        }
    });
});
</script>
