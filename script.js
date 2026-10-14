// ==================================================
// ShopEasy Customer Experience - A/B Testing System
// ==================================================

// Read saved data safely
function getCount(key) {
    return Number(localStorage.getItem(key) || 0);
}

// Save data
function saveCount(key, value) {
    localStorage.setItem(key, String(value));
}

// Record a page visit
function recordVisit(version) {
    const key = `visitors_${version}`;
    saveCount(key, getCount(key) + 1);
}

// Record a completed demo checkout
function recordCheckout(version) {
    const key = `completed_${version}`;
    saveCount(key, getCount(key) + 1);
}

// Calculate completion rate
function calculateRate(visitors, completed) {
    if (visitors === 0) {
        return "0.0%";
    }

    return ((completed / visitors) * 100).toFixed(1) + "%";
}

// ==================================================
// VERSION A - Original Checkout
// ==================================================

const formA = document.getElementById("checkoutForm");

if (formA) {
    recordVisit("A");

    formA.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!formA.checkValidity()) {
            formA.reportValidity();
            return;
        }

        recordCheckout("A");

        const message = document.getElementById("message");

        if (message) {
            message.textContent =
                "Demo order submitted successfully!";
            message.style.color = "green";
        }

        formA.querySelector('button[type="submit"]').disabled = true;

        updateDashboard();
    });
}

// ==================================================
// VERSION B - Improved Checkout
// ==================================================

const formB = document.getElementById("checkoutFormB");

if (formB) {
    recordVisit("B");

    formB.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!formB.checkValidity()) {
            formB.reportValidity();
            return;
        }

        recordCheckout("B");

        const message = document.getElementById("messageB");

        if (message) {
            message.textContent =
                "Demo order submitted successfully!";
            message.style.color = "green";
        }

        formB.querySelector('button[type="submit"]').disabled = true;

        updateDashboard();
    });
}

// ==================================================
// UPDATE A/B TESTING DASHBOARD
// ==================================================

function updateDashboard() {
    const visitorsA = getCount("visitors_A");
    const completedA = getCount("completed_A");

    const visitorsB = getCount("visitors_B");
    const completedB = getCount("completed_B");

    const elements = {
        visitorsA: document.getElementById("visitorsA"),
        completedA: document.getElementById("completedA"),
        rateA: document.getElementById("rateA"),

        visitorsB: document.getElementById("visitorsB"),
        completedB: document.getElementById("completedB"),
        rateB: document.getElementById("rateB")
    };

    if (elements.visitorsA) {
        elements.visitorsA.textContent = visitorsA;
        elements.completedA.textContent = completedA;
        elements.rateA.textContent =
            calculateRate(visitorsA, completedA);

        elements.visitorsB.textContent = visitorsB;
        elements.completedB.textContent = completedB;
        elements.rateB.textContent =
            calculateRate(visitorsB, completedB);
    }
}

// Update dashboard when its page opens
if (document.getElementById("visitorsA")) {
    updateDashboard();
}

// Refresh dashboard when another page updates localStorage
window.addEventListener("storage", function (event) {
    if (
        event.key === "visitors_A" ||
        event.key === "completed_A" ||
        event.key === "visitors_B" ||
        event.key === "completed_B"
    ) {
        updateDashboard();
    }
});
