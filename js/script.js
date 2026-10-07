// Show clean addresses in the address bar: /index.html -> /, /about.html -> /about
if (location.protocol !== "file:" && location.pathname.endsWith(".html")) {
  const cleanPath = location.pathname.replace(/(^|\/)index\.html$/, "$1").replace(/\.html$/, "");
  history.replaceState(null, "", cleanPath + location.search + location.hash);
}

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

// Call request form: submit to Web3Forms in the background so the visitor stays on the page.
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

    button.disabled = true;
    button.textContent = "Sending...";
    status.hidden = true;

    const data = new FormData(form);

    // Combine each group of checked boxes into one readable line for the email
    ["Days available", "Time of day", "Services"].forEach((name) => {
      const values = data.getAll(name);
      data.delete(name);
      data.set(name, values.length ? values.join(", ") : "Not specified");
    });

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.fromEntries(data)),
      });
      const result = await response.json().catch(() => ({}));

      if (response.ok && result.success) {
        form.reset();
        showStatus("success", "Thanks! Your request was sent. We'll give you a call soon.");
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
