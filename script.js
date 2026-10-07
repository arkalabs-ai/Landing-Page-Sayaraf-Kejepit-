(function () {
  const content = window.productContent;
  const byId = (id) => document.getElementById(id);
  const dialog = byId("order-dialog");
  const testimonialDialog = byId("testimonial-dialog");

  document.querySelectorAll("[data-content]").forEach((el) => {
    const key = el.dataset.content;
    if (content[key]) el.textContent = content[key];
  });

  document.querySelectorAll("[data-content-list]").forEach((list) => {
    list.innerHTML = (content[list.dataset.contentList] || []).map((item) => `<li>${item}</li>`).join("");
  });

  const legalityList = document.querySelector("[data-legality-list]");
  legalityList.innerHTML = content.legality.map(([label, value]) => `<div><strong>${label}</strong><span>${value}</span></div>`).join("");

  byId("benefit-list").innerHTML = content.benefits
    .map(([index, title, description]) => `<article class="benefit-item"><span class="benefit-index">${index}</span><div><h3>${title}</h3><p>${description}</p></div></article>`)
    .join("");

  const packageList = byId("package-list");
  packageList.innerHTML = content.packages
    .map((item) => `<article class="package${item.featured ? " featured" : ""}" data-package="${item.id}"><span class="package-tag">${item.label}</span><h3>${item.note}</h3><div class="package-price">${item.price}</div><p class="package-note">Wajib COD · bayar saat pesanan tiba</p><button class="package-select" type="button">Pilih Paket Sekarang</button></article>`)
    .join("");

  document.querySelectorAll("[data-package-select]").forEach((select) => {
    content.packages.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = `${item.id === "single" ? "1 botol" : item.id === "double" ? "2 botol" : "3 botol"} — ${item.price}`;
      select.appendChild(option);
    });
  });

  const testimonialList = byId("testimonial-list");
  document.querySelector("[data-testimonial-total]").textContent = String(content.testimonials.length).padStart(2, "0");
  testimonialList.innerHTML = content.testimonials
    .map((image, index) => `<button class="testimonial-card" type="button" data-testimonial-image="${image}" aria-label="${index < 3 ? "Perbesar foto asli produk" : "Perbesar testimoni"} ${index + 1}"><span class="media-source-tag">${index < 3 ? "Foto asli produk" : "Testimoni"}</span><img src="${image}" alt="${index < 3 ? "Dokumentasi asli kemasan produk" : "Testimoni produk"} ${index + 1}" loading="lazy" /></button>`)
    .join("");

  testimonialList.addEventListener("click", (event) => {
    const card = event.target.closest("[data-testimonial-image]");
    if (!card) return;
    const image = testimonialDialog.querySelector("img");
    image.src = card.dataset.testimonialImage;
    image.alt = card.querySelector("img").alt;
    testimonialDialog.showModal();
  });

  testimonialDialog.querySelector(".testimonial-dialog-close").addEventListener("click", () => testimonialDialog.close());
  testimonialDialog.addEventListener("click", (event) => {
    if (event.target === testimonialDialog) testimonialDialog.close();
  });

  function updateTestimonialCounter() {
    const cards = [...testimonialList.children];
    const current = cards.reduce((closest, card, index) => {
      const distance = Math.abs(card.offsetLeft - testimonialList.scrollLeft);
      return distance < closest.distance ? { index, distance } : closest;
    }, { index: 0, distance: Infinity });
    document.querySelector("[data-testimonial-current]").textContent = String(current.index + 1).padStart(2, "0");
  }

  function moveTestimonials(direction) {
    const card = testimonialList.querySelector(".testimonial-card");
    if (!card) return;
    const step = card.offsetWidth + 16;
    const maxScroll = testimonialList.scrollWidth - testimonialList.clientWidth;
    const nextScroll = testimonialList.scrollLeft + direction * step;
    testimonialList.scrollTo({
      left: direction > 0 && nextScroll > maxScroll - 4 ? 0 : direction < 0 && nextScroll < 4 ? maxScroll : nextScroll,
      behavior: "smooth"
    });
  }

  document.querySelector("[data-testimonial-prev]").addEventListener("click", () => moveTestimonials(-1));
  document.querySelector("[data-testimonial-next]").addEventListener("click", () => moveTestimonials(1));
  testimonialList.addEventListener("scroll", updateTestimonialCounter, { passive: true });

  function openOrderDialog(packageId = "") {
    const select = dialog.querySelector("[name='package']");
    if (packageId) select.value = packageId;
    resetPreparedMessage(dialog.querySelector(".order-form"));
    dialog.showModal();
    dialog.querySelector("[name='name']").focus();
  }

  document.querySelectorAll("[data-order-trigger]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openOrderDialog();
    });
  });

  packageList.addEventListener("click", (event) => {
    const button = event.target.closest(".package-select");
    if (!button) return;
    const id = button.closest(".package").dataset.package;
    document.querySelectorAll(".package").forEach((card) => {
      card.setAttribute("aria-selected", card.dataset.package === id ? "true" : "false");
    });
    openOrderDialog(id);
  });

  dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  function getOrder(formElement) {
    const form = new FormData(formElement);
    const chosen = content.packages.find((item) => item.id === form.get("package"));
    return { form, chosen };
  }

  function createMessage(form, chosen) {
    const name = String(form.get("name") || "").trim();
    const phone = normalizePhone(form.get("phone"));
    const address = String(form.get("address") || "").trim();
    return `Halo Admin Herbavita Nusantara, saya ${name || "ingin bertanya"}. Saya tertarik memesan ${chosen ? `${chosen.id === "single" ? "1 botol" : chosen.id === "double" ? "2 botol" : "3 botol"} (${chosen.price})` : content.name} dengan sistem COD.${phone ? ` Nomor saya ${phone}.` : ""}${address ? ` Alamat pengiriman: ${address}.` : ""} Harga paket belum termasuk ongkir. Mohon konfirmasi layanan COD, ongkir, dan total pembayaran sebelum pengiriman.`;
  }

  function normalizePhone(value) {
    const input = String(value || "").trim();
    if (!/^[+\d()\s-]+$/.test(input)) return "";
    let phone = input.replace(/[()\s-]/g, "");
    if (phone.startsWith("+62")) phone = phone.slice(1);
    else if (phone.startsWith("08")) phone = "62" + phone.slice(1);
    if (!/^628[1-9]\d{7,10}$/.test(phone)) return "";
    if (/^(\d)\1{6,}$/.test(phone.slice(4))) return "";
    return phone;
  }

  function validateOrder(form, chosen) {
    return {
      name: String(form.get("name") || "").trim().length < 2 ? "Isi nama lengkap penerima." : "",
      phone: !normalizePhone(form.get("phone")) ? "Gunakan nomor Indonesia, misalnya 08…, 628…, atau +628…." : "",
      address: String(form.get("address") || "").trim().length < 10 ? "Isi alamat lengkap, termasuk kelurahan, kecamatan, dan kota." : "",
      package: !chosen ? "Pilih salah satu paket." : ""
    };
  }

  function createWhatsAppUrl(message) {
    return `https://wa.me/${content.orderWhatsapp}?text=${encodeURIComponent(message)}`;
  }

  function resetPreparedMessage(formElement) {
    formElement.querySelector(".form-status").textContent = "";
    const fallback = formElement.querySelector("[data-whatsapp-order-link]");
    fallback.hidden = true;
    fallback.removeAttribute("href");
  }

  function openWhatsApp(formElement, message, isOrder) {
    const status = formElement.querySelector(".form-status");
    if (!content.orderWhatsapp) {
      status.textContent = "Nomor admin belum tersedia. Silakan coba kembali nanti.";
      return;
    }
    const url = createWhatsAppUrl(message);
    const fallback = formElement.querySelector("[data-whatsapp-order-link]");
    fallback.href = url;
    fallback.textContent = isOrder ? "Buka WhatsApp untuk pesanan ini ↗" : "Buka WhatsApp untuk pertanyaan ini ↗";
    fallback.hidden = false;
    status.textContent = "Lanjutkan dengan mengirim pesan di WhatsApp. Jika WhatsApp tidak terbuka, gunakan tautan di bawah.";
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (_) {
      status.textContent = "WhatsApp belum terbuka. Gunakan tautan di bawah untuk melanjutkan.";
    }
  }

  function submitOrder(formElement) {
    const { form, chosen } = getOrder(formElement);
    const errors = validateOrder(form, chosen);
    const fallback = formElement.querySelector("[data-whatsapp-order-link]");
    fallback.hidden = true;
    fallback.removeAttribute("href");
    formElement.querySelectorAll("[data-error-for]").forEach((el) => {
      const field = formElement.querySelector(`[name='${el.dataset.errorFor}']`);
      el.textContent = errors[el.dataset.errorFor];
      field.setAttribute("aria-invalid", errors[el.dataset.errorFor] ? "true" : "false");
    });
    const firstError = Object.keys(errors).find((key) => errors[key]);
    if (firstError) {
      formElement.querySelector(".form-status").textContent = "Periksa kembali data yang bertanda merah.";
      formElement.querySelector(`[name='${firstError}']`).focus();
      return;
    }
    openWhatsApp(formElement, createMessage(form, chosen), true);
  }

  function setupOrderForm(formElement) {
    const whatsappButton = formElement.querySelector("[data-whatsapp-admin]");
    const whatsappNote = formElement.querySelector("[data-whatsapp-note]");
    formElement.querySelector("[type='submit']").disabled = !content.orderWhatsapp;
    formElement.querySelectorAll("[data-error-for]").forEach((el) => {
      const field = formElement.querySelector(`[name='${el.dataset.errorFor}']`);
      el.id = `${field.id}-error`;
      field.setAttribute("aria-describedby", el.id);
    });

    if (whatsappButton) {
      whatsappButton.disabled = !content.orderWhatsapp;
      whatsappNote.textContent = content.orderWhatsapp ? "Belum siap memilih? Tanya admin tanpa mengisi formulir." : "Nomor WhatsApp admin sedang disiapkan.";
      whatsappButton.addEventListener("click", () => {
        const message = `Halo Admin Herbavita Nusantara, saya ingin bertanya tentang ${content.name}, pilihan paket, dan layanan COD.`;
        openWhatsApp(formElement, message, false);
      });
    }

    formElement.addEventListener("submit", (event) => {
      event.preventDefault();
      submitOrder(formElement);
    });
    formElement.addEventListener("input", (event) => {
      const field = event.target;
      const error = formElement.querySelector(`[data-error-for='${field.name}']`);
      if (error) {
        error.textContent = "";
        field.removeAttribute("aria-invalid");
      }
      resetPreparedMessage(formElement);
    });
  }

  document.querySelectorAll(".order-form").forEach(setupOrderForm);
})();
