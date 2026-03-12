const STORAGE_KEY = "form_data";
const TARGET_URL = "https://ttdevasthanams.ap.gov.in/";

const fillBtn = document.getElementById("fill-btn");
const formEl = document.querySelector("form");

function fillBookingForm(data) {
  const generalFields = [
    "pilgrimEmail",
    "pilgrimCity",
    "pilgrimState",
    "pilgrimCountry",
    "pilgrimPincode",
  ];
  const pilgrimFields = ["name", "age", "gender", "idType", "idNumber"];
  if (!data) return;

  generalFields.forEach((name) => {
    const el = document.querySelector(`[name="${name}"]`);
    if (el && data.general[name]) {
      el.value = data.general[name];
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });

  const containers = document.querySelectorAll(
    '[class^="pilDetails_mainContainer__"]',
  );

  containers.forEach((container, i) => {
    const pilgrim = data.pilgrims[i];
    if (!pilgrim) return;

    pilgrimFields.forEach((field) => {
      const el = container.querySelector(`[name="${field}"]`);
      if (el && pilgrim[field]) {
        el.value = pilgrim[field];
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  });
}
function fillPopupForm(data) {
  Object.entries(data.general).forEach(([name, value]) => {
    const field = formEl.querySelector(`[name="${name}"]`);
    if (field) field.value = value;
  });

  data.pilgrims.forEach((pilgrim, i) => {
    Object.entries(pilgrim).forEach(([field, value]) => {
      const key = `p${i}-${field}`;
      const el = formEl.querySelector(`[name="${key}"]`);
      if (el) el.value = value;
    });
  });
}

fillBtn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (!tab || !tab.url.startsWith(TARGET_URL)) return;

  const res = await chrome.storage.local.get(STORAGE_KEY);
  const formData = res[STORAGE_KEY];
  if (!formData) return;

  chrome.scripting
    .executeScript({
      target: { tabId: tab.id },
      func: fillBookingForm,
      args: [formData],
    })
    .then(() => {
      alert("filled");
      console.log(formData);
    })
    .catch((err) => {
      alert("error");
      console.error("error filling form", err);
    });
});

formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(formEl);
  const data = { general: {}, pilgrims: [{}, {}] };

  for (const [key, value] of formData.entries()) {
    if (key[0] === "p" && key[2] === "-") {
      const index = parseInt(key[1]);
      const field = key.slice(3);
      data.pilgrims[index][field] = value;
    } else {
      data.general[key] = value;
    }
  }

  chrome.storage.local.set({ [STORAGE_KEY]: data });
});

formEl.addEventListener("reset", (e) => {
  e.preventDefault();
  chrome.storage.local.remove(STORAGE_KEY);
  formEl.reset();
});

chrome.storage.local.get(STORAGE_KEY, (res) => {
  const data = res[STORAGE_KEY];
  if (!data) return;

  if (data.general) {
    fillPopupForm(data);
  } else {
    const legacyData = { general: {}, pilgrims: [{}, {}] };
    Object.entries(data).forEach(([key, value]) => {
      if (key[0] === "p" && key[2] === "-") {
        const index = parseInt(key[1]);
        const field = key.slice(3);
        legacyData.pilgrims[index][field] = value;
      } else {
        legacyData.general[key] = value;
      }
    });
    fillPopupForm(legacyData);
  }
});
