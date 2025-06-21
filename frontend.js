 

 let targetUrl = "";
        function openModal(url) {
            targetUrl = url;
            document.getElementById("confirmModal").style.display = "flex";
            document.body.classList.add("modal-open");
            document.getElementById("agreeCheck").checked = false;
        }

        function closeModal() {
            document.getElementById("confirmModal").style.display = "none";
            document.body.classList.remove("modal-open");
        }

        function proceedToQuiz() {
            const checkbox = document.getElementById("agreeCheck");
            if (!checkbox.checked) {
                alert("Please agree to the instructions before proceeding.");
                return;
            }
            window.location.href = targetUrl;
        }

        //logout

        document.querySelector('.nav-links a[href="signup.html"]').addEventListener('click', function(event) {
            event.preventDefault();
            if (confirm("Are you sure you want to logout?")) {
                window.location.href = "signup.html"; // Redirect to the logout page
            }
        });
