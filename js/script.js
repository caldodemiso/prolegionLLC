// Mobile menu toggle
const navToggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("site-nav");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  nav.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    })
  );
}

// Footer year
document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// Call request form: submit via FormSubmit's AJAX endpoint so the visitor stays on the page.
// Without JavaScript the form still posts normally to the URL in its action attribute.
document.querySelectorAll(".call-form").forEach((form) => {
  const status = form.querySelector(".form-status");
  const button = form.querySelector('button[type="submit"]');
  const buttonText = button.textContent;

  const showStatus = (type, message) => {
    status.className = `form-status ${type}`;
    status.textContent = message;
    status.hidden = false;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    // FormSubmit rejects pages opened straight from disk (file://), so say so instead of failing quietly
    if (location.protocol === "file:") {
      showStatus(
        "error",
        "This form only works when the site is opened through a web server (e.g. python3 -m http.server), not as a file."
      );
      return;
    }

    button.disabled = true;
    button.textContent = "Sending...";
    status.hidden = true;

    const endpoint = form.action.replace("formsubmit.co/", "formsubmit.co/ajax/");
    const data = new FormData(form);

    // Combine each group of checked boxes into one readable line for the email
    ["Days available", "Time of day", "Services"].forEach((name) => {
      const values = data.getAll(name);
      data.delete(name);
      data.set(name, values.length ? values.join(", ") : "Not specified");
    });

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.fromEntries(data)),
      });
      const result = await response.json().catch(() => ({}));

      if (response.ok && String(result.success) === "true") {
        form.reset();
        showStatus("success", "Thanks! Your request was sent. We'll give you a call soon.");
      } else if (/activat/i.test(result.message || "")) {
        // Only happens before the business email has clicked FormSubmit's one-time "Activate Form" link
        showStatus(
          "error",
          "This form isn't activated yet. Check the business inbox (and spam) for FormSubmit's \"Activate Form\" email, click it, then submit again."
        );
      } else {
        throw new Error(result.message || "Request failed");
      }
    } catch (error) {
      showStatus(
        "error",
        "Sorry, something went wrong sending your request. Please try again, or call or text us at (850) 768-7449."
      );
      console.error(error);
    } finally {
      button.disabled = false;
      button.textContent = buttonText;
    }
  });
});
