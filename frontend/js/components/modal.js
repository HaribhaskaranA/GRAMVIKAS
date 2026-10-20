/**
 * GRAMVIKAS AI - Reusable Accessible Modal Component.
 */

export function openModal({ title, bodyHtml, confirmText = "Confirm", cancelText = "Cancel", onConfirm = null }) {
  let modalWrapper = document.getElementById("gv-active-modal");
  if (modalWrapper) modalWrapper.remove();

  modalWrapper = document.createElement("div");
  modalWrapper.id = "gv-active-modal";
  modalWrapper.className = "modal fade show";
  modalWrapper.style.display = "block";
  modalWrapper.style.backgroundColor = "rgba(0, 0, 0, 0.55)";
  modalWrapper.setAttribute("tabindex", "-1");
  modalWrapper.setAttribute("role", "dialog");
  modalWrapper.setAttribute("aria-modal", "true");

  modalWrapper.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content card-gv">
        <div class="modal-header border-bottom">
          <h5 class="modal-title fw-bold" style="color: var(--color-primary);">${title}</h5>
          <button type="button" class="btn-close" aria-label="Close" id="modal-btn-close"></button>
        </div>
        <div class="modal-body py-3">
          ${bodyHtml}
        </div>
        <div class="modal-footer border-top">
          <button type="button" class="btn btn-outline-secondary" id="modal-btn-cancel">${cancelText}</button>
          ${onConfirm ? `<button type="button" class="btn btn-gv-primary" id="modal-btn-confirm">${confirmText}</button>` : ""}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modalWrapper);

  const close = () => modalWrapper.remove();
  modalWrapper.querySelector("#modal-btn-close")?.addEventListener("click", close);
  modalWrapper.querySelector("#modal-btn-cancel")?.addEventListener("click", close);
  
  if (onConfirm) {
    modalWrapper.querySelector("#modal-btn-confirm")?.addEventListener("click", async () => {
      const shouldClose = await onConfirm();
      if (shouldClose !== false) close();
    });
  }
}
