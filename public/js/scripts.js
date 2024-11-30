// Get the necessary elements from the DOM
const loginText = document.querySelector(".title-text .login");
const signupText = document.querySelector(".title-text .signup");
const loginForm = document.querySelector("form.login");
const signupForm = document.querySelector("form.signup");
const loginBtn = document.querySelector("label.login");
const signupBtn = document.querySelector("label.signup");
const signupLink = document.querySelector("form.login .signup-link a");

// Event listener to show the signup form
signupBtn.onclick = () => {
    loginForm.style.marginLeft = "-50%";
    signupForm.style.marginLeft = "0%";
    loginText.style.marginLeft = "-50%";
    signupText.style.marginLeft = "0%";
};

// Event listener to show the login form
loginBtn.onclick = () => {
    loginForm.style.marginLeft = "0%";
    signupForm.style.marginLeft = "50%";
    loginText.style.marginLeft = "0%";
    signupText.style.marginLeft = "50%";
};

// Event listener for the signup link in the login form
signupLink.onclick = () => {
    signupBtn.click();
    return false; // Prevent default link behavior
};
