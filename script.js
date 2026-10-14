// ShopEasy A/B Testing System
// Local demonstration using browser storage

function recordVisit(version) {
    const key = `visitors_${version}`;
    const visitors = Number(localStorage.getItem(key) || 0);

    localStorage.setItem(key, visitors + 1);
}

function recordCheckout(version) {
    const key = `completed_${version}`;
    const completed = Number(localStorage.getItem(key) || 0);

    localStorage.setItem(key, completed + 1);
}

// Version A checkout
const formA = document.getElementById("checkoutForm");

if (formA) {
    recordVisit("A");

    formA.addEventListener("submit", function(event) {
        event.preventDefault();

        recordCheckout("A");

        document.getElementById("message").textContent =
            "Demo order submitted successfully!";
    });
}

// Version B checkout
const formB = document.getElementById("checkoutFormB");

if (formB) {
    recordVisit("B");

    formB.addEventListener("submit", function(event) {
        event.preventDefault();

        recordCheckout("B");

        document.getElementById("messageB").textContent =
            "Demo order submitted successfully!";
    });
}