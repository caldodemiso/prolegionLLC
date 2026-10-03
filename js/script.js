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

  // Checkbox groups marked data-require-one need at least one box checked
  const requiredGroups = [...form.querySelectorAll("[data-require-one]")];

  const checkGroups = () =>
    requiredGroups.forEach((group) => {
      const boxes = [...group.querySelectorAll('input[type="checkbox"]')];
      const legend = group.querySelector("legend").firstChild.textContent.trim();
      boxes[0].setCustomValidity(
        boxes.some((box) => box.checked) ? "" : `Please choose at least one option for "${legend}".`
      );
    });

  form.addEventListener("change", checkGroups);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    checkGroups();
    if (!form.reportValidity()) return;

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
        headers: { Accept: "application/json" },
        body: data,
      });
      const result = await response.json().catch(() => ({}));

      if (response.ok && String(result.success) === "true") {
        form.reset();
        showStatus("success", "Thanks! Your request was sent. We'll give you a call during the times you picked.");
      } else {
        throw new Error(result.message || "Request failed");
      }
    } catch (error) {
      showStatus(
        "error",
        "Sorry, something went wrong sending your request. Please try again or give us a call."
      );
      console.error(error);
    } finally {
      button.disabled = false;
      button.textContent = buttonText;
    }
  });
});
