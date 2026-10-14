// ============================================
// ShopEasy A/B Testing System
// ============================================

// Increase a counter stored in localStorage.
function increaseCount(key) {
    const current = Number(localStorage.getItem(key) || 0);

    localStorage.setItem(key, current + 1);
}

// Record one visit per browser tab session.
function recordVisit(version) {
    const visitKey = `visitors_${version}`;
    const sessionKey = `visit_recorded_${version}`;

    if (sessionStorage.getItem(sessionKey) !== "yes") {
        increaseCount(visitKey);

        sessionStorage.setItem(sessionKey, "yes");
    }
}

// Record a checkout only once per tab session.
function recordCheckout(version, messageId, buttonId) {
    const completedKey = `completed_${version}`;
    const sessionKey = `checkout_completed_${version}`;

    const message = document.getElementById(messageId);
    const button = document.getElementById(buttonId);

    if (sessionStorage.getItem(sessionKey) === "yes") {
        message.textContent =
            "Checkout has already been submitted in this session.";

        if (button) {
            button.disabled = true;
        }

        return;
    }

    increaseCount(completedKey);

    sessionStorage.setItem(sessionKey, "yes");

    message.textContent =
        "Demo order submitted successfully!";

    if (button) {
        button.disabled = true;
    }
}

// ============================================
// VERSION A: Original Checkout
// ============================================

const formA = document.getElementById("checkoutForm");

if (formA) {
    recordVisit("A");

    formA.addEventListener("submit", function (event) {
        event.preventDefault();

        recordCheckout(
            "A",
            "message",
            null
        );
    });
}

// ============================================
// VERSION B: Improved Checkout
// ============================================

const formB = document.getElementById("checkoutFormB");

if (formB) {
    recordVisit("B");

    formB.addEventListener("submit", function (event) {
        event.preventDefault();

        recordCheckout(
            "B",
            "messageB",
            "placeOrderB"
        );
    });
}
