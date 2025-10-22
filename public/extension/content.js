// content.js — scan, highlight, fill

let highlightBox;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || !msg.action) return;

  if (msg.action === "scanPage") {
    const fields = scanAll();
    chrome.runtime.sendMessage({ action: "scanResult", fields });
    sendResponse?.({ ok: true });
    return true;
  }

  if (msg.action === "highlightXPath") {
    highlightXPath(msg.xpath);
    sendResponse?.({ ok: true });
    return true;
  }

  if (msg.action === "fillFormAdvanced") {
    const {
      fields = [],
      autoSubmit = false,
      fireEvents = true,
    } = msg.payload || {};
    const results = fillByFields(fields, { fireEvents, autoSubmit });
    sendResponse?.({ ok: true, results });
    return true;
  }

  if (msg.action === "autoClickSubmit") {
    try {
      // Primary: find button[type="submit"] via XPath
      const xpath = `//button[@type="submit" or @class="submit-btn"]`;
      let el = null;
      try {
        el = document.evaluate(
          xpath,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue;
      } catch (e) {
        el = null;
      }

      // Fallbacks: input[type=submit] or querySelector for button[type=submit]
      if (!el) el = document.querySelector('input[type="submit"]');
      if (!el) el = document.querySelector('button[type="submit"]');

      if (!el) {
        sendResponse?.({ ok: false, error: "submit_not_found" });
        return true;
      }

      // Single click attempt only — avoid firing duplicate click events.
      let clicked = false;
      try {
        el.click();
        clicked = true;
      } catch (e) {
        clicked = false;
      }

      // If native click didn't run (threw), try a synthetic MouseEvent once.
      if (!clicked) {
        try {
          const ev = new MouseEvent("click", {
            view: window,
            bubbles: true,
            cancelable: true,
          });
          el.dispatchEvent(ev);
          clicked = true;
        } catch (e) {
          clicked = false;
        }
      }

      // Final fallback: focus + form submit if element is inside a form
      if (!clicked) {
        try {
          el.focus && el.focus();
          const f = el.form || (el.closest && el.closest("form"));
          if (f) f.submit();
        } catch (ee) {}
      }

      sendResponse?.({ ok: true, clicked: true });

      // navigation is handled from the popup (background) using chrome.tabs.update
    } catch (e) {
      sendResponse?.({ ok: false, error: e && e.message });
    }
    return true;
  }

  if (msg.action === "autoClickSubmitRutTienR88") {
    try {
      // Primary: find button[type="submit"] via XPath
      const xpath = `//span[@class="am-button btn-success"]`;
      let el = null;
      try {
        el = document.evaluate(
          xpath,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue;
      } catch (e) {
        el = null;
      }

      // Fallbacks: input[type=submit] or querySelector for button[type=submit]
      if (!el) el = document.querySelector('input[type="submit"]');
      if (!el) el = document.querySelector('button[type="submit"]');

      if (!el) {
        sendResponse?.({ ok: false, error: "submit_not_found" });
        return true;
      }

      // Single click attempt only — avoid firing duplicate click events.
      let clicked = false;
      try {
        el.click();
        clicked = true;
      } catch (e) {
        clicked = false;
      }

      // If native click didn't run (threw), try a synthetic MouseEvent once.
      if (!clicked) {
        try {
          const ev = new MouseEvent("click", {
            view: window,
            bubbles: true,
            cancelable: true,
          });
          el.dispatchEvent(ev);
          clicked = true;
        } catch (e) {
          clicked = false;
        }
      }

      // Final fallback: focus + form submit if element is inside a form
      if (!clicked) {
        try {
          el.focus && el.focus();
          const f = el.form || (el.closest && el.closest("form"));
          if (f) f.submit();
        } catch (ee) {}
      }

      sendResponse?.({ ok: true, clicked: true });

      // navigation is handled from the popup (background) using chrome.tabs.update
    } catch (e) {
      sendResponse?.({ ok: false, error: e && e.message });
    }
    return true;
  }

  if (msg.action === "clickXPath") {
    const xp = msg.xpath;
    try {
      const el = nodeByXPath(xp);
      if (!el) {
        sendResponse?.({ ok: false, error: "not_found" });
        return true;
      }
      // Single click attempt: native click first, synthetic only if native throws.
      let clicked = false;
      try {
        el.click();
        clicked = true;
      } catch (e) {
        clicked = false;
      }
      if (!clicked) {
        try {
          el.dispatchEvent(
            new MouseEvent("click", { bubbles: true, cancelable: true })
          );
          clicked = true;
        } catch (e) {}
      }
      sendResponse?.({ ok: true, clicked: !!clicked });
    } catch (e) {
      sendResponse?.({ ok: false, error: e && e.message });
    }
    return true;
  }
});

// ========= SCAN =========
function scanAll() {
  const selector =
    'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])';
  const els = Array.from(document.querySelectorAll(selector));
  return els.map((el) => {
    return {
      tag: el.tagName.toLowerCase(),
      type: (el.getAttribute("type") || "").toLowerCase(),
      id: el.id || "",
      name: el.name || "",
      placeholder: el.placeholder || "",
      label: guessLabel(el),
      xpath: buildXPath(el),
    };
  });
}

function guessLabel(el) {
  // thử lấy label for= hoặc placeholder/name/id
  try {
    if (el.id) {
      const lb = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (lb) return lb.textContent.trim();
    }
  } catch {}
  return (
    el.placeholder || el.name || el.id || el.type || el.tagName.toLowerCase()
  );
}

// ========= XPATH helpers =========
function buildXPath(el) {
  if (!el) return "";
  // Ưu tiên id
  if (el.id) return `//*[@id="${escapeQuotes(el.id)}"]`;

  // Hoặc name nếu duy nhất
  const name = el.getAttribute("name");
  if (name) {
    const same = document.querySelectorAll(`[name="${CSS.escape(name)}"]`);
    if (same.length === 1) return `//*[@name="${escapeQuotes(name)}"]`;
  }

  // Fallback: index path
  const parts = [];
  for (; el && el.nodeType === 1; el = el.parentNode) {
    let ix = 1;
    let sib = el.previousSibling;
    while (sib) {
      if (sib.nodeType === 1 && sib.nodeName === el.nodeName) ix++;
      sib = sib.previousSibling;
    }
    parts.unshift(el.nodeName.toLowerCase() + "[" + ix + "]");
    if (el.nodeName.toLowerCase() === "html") break;
  }
  return "/" + parts.join("/");
}
function escapeQuotes(s) {
  return String(s).replace(/"/g, '\\"');
}

function nodeByXPath(xpath) {
  try {
    return (
      document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue || null
    );
  } catch {
    return null;
  }
}

// ========= HIGHLIGHT =========
function highlightXPath(xpath) {
  const el = nodeByXPath(xpath);
  removeHighlight();

  if (!el) {
    alert("Không tìm thấy phần tử với XPath này.");
    return;
  }
  const rect = el.getBoundingClientRect();

  highlightBox = document.createElement("div");
  Object.assign(highlightBox.style, {
    position: "absolute",
    outline: "2px solid #ef4444",
    borderRadius: "6px",
    top: `${rect.top + window.scrollY - 4}px`,
    left: `${rect.left + window.scrollX - 4}px`,
    width: `${rect.width + 8}px`,
    height: `${rect.height + 8}px`,
    background: "rgba(239,68,68,0.08)",
    zIndex: 999999,
  });

  const tag = document.createElement("div");
  tag.textContent = "XPath target";
  Object.assign(tag.style, {
    position: "absolute",
    top: "-22px",
    left: "0",
    background: "#ef4444",
    color: "#fff",
    fontSize: "12px",
    padding: "2px 6px",
    borderRadius: "4px",
  });
  highlightBox.appendChild(tag);

  document.body.appendChild(highlightBox);
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(removeHighlight, 2000);
}

function removeHighlight() {
  if (highlightBox && highlightBox.parentNode) {
    highlightBox.parentNode.removeChild(highlightBox);
  }
  highlightBox = null;
}

// ========= FILL =========
function setValue(el, val, fireEvents) {
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  const type = (el.getAttribute("type") || "").toLowerCase();

  if (tag === "input" || tag === "textarea") {
    if (type === "checkbox") {
      el.checked = !!val && /^(true|1|on|yes)$/i.test(String(val));
    } else if (type === "radio") {
      if (el.name) {
        document
          .querySelectorAll(
            `input[type="radio"][name="${CSS.escape(el.name)}"]`
          )
          .forEach((r) => (r.checked = String(r.value) === String(val)));
      } else {
        el.checked = true;
      }
    } else {
      el.value = val;
    }
  } else if (tag === "select") {
    let hit = false;
    for (const o of el.options) {
      if (String(o.value) === String(val) || o.text.trim() === String(val)) {
        o.selected = true;
        hit = true;
        break;
      }
    }
    if (!hit) el.value = val;
  } else {
    el.textContent = val;
  }

  if (fireEvents) {
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }
  return true;
}

function fillByFields(fields, { fireEvents = true, autoSubmit = false }) {
  const results = [];
  let formToSubmit = null;

  for (const f of fields) {
    const el = nodeByXPath(f.xpath);
    if (!el) {
      results.push({ ok: false, reason: "not-found", field: f });
      continue;
    }
    const ok = setValue(el, f.value ?? "", fireEvents);
    if (ok && !formToSubmit) formToSubmit = el.closest("form");
    results.push({ ok, field: f });
  }

  if (autoSubmit && formToSubmit) {
    try {
      formToSubmit.requestSubmit
        ? formToSubmit.requestSubmit()
        : formToSubmit.submit();
    } catch {}
  }
  return results;
}

// ========= NAV / AUTOMATION HELPERS =========
// Attach handlers to page links/buttons for quick navigation ("Nạp", "Rút")
//

// On ChangeMoneyPassword page: when user clicks the 'Nhập pass rút' control,
// read stored bulkInputCreateData, parse password fields and fill the two inputs,
// then click submit.
function setupAutoFillWithdraw() {
  const triggerText = "nhập pass rút"; // Vietnamese label to look for
  function attachToTrigger(el) {
    if (!el || !el.innerText) return;
    if (el.innerText.trim().toLowerCase().includes(triggerText)) {
      el.addEventListener("click", async (e) => {
        // retrieve stored create data
        chrome.storage.local.get(["bulkInputCreateData"], (res) => {
          const data = (res && res.bulkInputCreateData) || "";
          if (!data) return;
          const parts = data.split("|").map((s) => s.trim());
          // assume password fields are at index 5 and 6 (0-based) per generator
          const pass = parts[5] || parts[6] || "";
          const passXpath =
            "/html[1]/body[1]/div[1]/ui-view[1]/gupw-app[1]/ui-view[1]/gupw-sample-layout[1]/div[2]/div[1]/ui-view[1]/gupw-member-center-layout[1]/div[1]/div[1]/div[2]/ui-view[1]/gupw-change-money-password[1]/div[1]/div[2]/div[1]/div[1]/section[1]/form[1]/div[1]/div[1]/div[1]/input[1]";
          const passConfirmXpath =
            "/html[1]/body[1]/div[1]/ui-view[1]/gupw-app[1]/ui-view[1]/gupw-sample-layout[1]/div[2]/div[1]/ui-view[1]/gupw-member-center-layout[1]/div[1]/div[1]/div[2]/ui-view[1]/gupw-change-money-password[1]/div[1]/div[2]/div[1]/div[1]/section[1]/form[1]/div[2]/div[1]/div[1]/input[1]";

          const el1 = nodeByXPath(passXpath);
          const el2 = nodeByXPath(passConfirmXpath);
          if (el1) setValue(el1, pass, true);
          if (el2) setValue(el2, pass, true);

          // click submit
          try {
            const btn = document.evaluate(
              "//button[@type='submit']",
              document,
              null,
              XPathResult.FIRST_ORDERED_NODE_TYPE,
              null
            ).singleNodeValue;
            if (btn) {
              // Single click attempt only
              let clicked = false;
              try {
                btn.click();
                clicked = true;
              } catch (e) {
                clicked = false;
              }
              if (!clicked) {
                try {
                  btn.dispatchEvent(
                    new MouseEvent("click", { bubbles: true, cancelable: true })
                  );
                  clicked = true;
                } catch (e) {}
              }
            }
          } catch (e) {}
        });
      });
    }
  }

  // Attach to existing triggers
  Array.from(document.querySelectorAll("button,a,div[role=button]")).forEach(
    attachToTrigger
  );
  // Observe additions
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const n of Array.from(m.addedNodes || [])) {
        if (n.nodeType !== 1) continue;
        if (
          n.matches &&
          (n.matches("button") ||
            n.matches("a") ||
            n.matches("div[role=button]"))
        )
          attachToTrigger(n);
        Array.from(
          (n.querySelectorAll &&
            n.querySelectorAll("button,a,div[role=button]")) ||
            []
        ).forEach(attachToTrigger);
      }
    }
  });
  try {
    mo.observe(document.body, { childList: true, subtree: true });
  } catch (e) {}
}




// content.js
// Updated complete content script. Main change: prefer the `captcha` field from API response
// (and related common names) so we fill the captcha input with the correct value instead of `message`.
//
// Other small fixes:
// - Use err.message instead of err.captcha in error messages
// - Cleaned button text assignment to avoid duplicating the solved value
// - parseApiResponse now prefers json.captcha, json.code, json.value, then falls back to other fields.
//
// Requirements:
// - background/service worker must handle message { action: 'fetchImageAsBase64', url } and return { ok, base64, mime }.
// - manifest must include proper host_permissions and this file as a content_script.

const DEFAULT_API_KEY = 'acd89898bf01aea4603fd79f6ac8263b';
const API_URL = 'https://anticaptcha.top/api/captcha';

if (!window.__captchaQuickButtonInjected) {
  window.__captchaQuickButtonInjected = true;

  (function () {
    // --- Helpers for base64/blob/text conversions ---
    function b64ToUint8Array(b64) {
      const binary = atob(b64);
      const len = binary.length;
      const arr = new Uint8Array(len);
      for (let i = 0; i < len; i++) arr[i] = binary.charCodeAt(i);
      return arr;
    }

    function base64ToBlob(b64, mime) {
      const u8 = b64ToUint8Array(b64);
      return new Blob([u8], { type: mime || 'application/octet-stream' });
    }

    function textToBlob(text, mime = 'text/plain;charset=utf-8') {
      return new Blob([text], { type: mime });
    }

    // parse data URI -> { mime, isBase64, data } or null
    function extractDataUri(dataUri) {
      const m = dataUri.match(/^data:([^;]+)(;charset=[^;]+)?(;base64)?,(.*)$/s);
      if (!m) return null;
      const mime = m[1] || '';
      const isBase64 = !!m[3];
      const data = m[4] || '';
      return { mime, isBase64, data };
    }

    // Ask background service worker to fetch remote image and convert to base64 + mime
    function fetchImageBase64ByBackground(url) {
      return new Promise((resolve, reject) => {
        try {
          chrome.runtime.sendMessage({ action: 'fetchImageAsBase64', url }, (resp) => {
            if (!resp) return reject(new Error('No response from background'));
            if (!resp.ok) return reject(new Error(resp.error || 'Fetch failed'));
            resolve(resp); // { ok:true, base64, mime }
          });
        } catch (e) {
          reject(e);
        }
      });
    }

    // Load an Object URL (or any same-origin or blob/object URL) into an Image and render to canvas,
    // returning PNG base64 (without data: prefix).
    function imageSrcToPngBase64FromObjectUrl(url, width, height) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const w = width || img.naturalWidth || img.width || 200;
            const h = height || img.naturalHeight || img.height || 80;
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            // white background helps for transparent SVGs
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, w, h);
            const dataUrl = canvas.toDataURL('image/png');
            const comma = dataUrl.indexOf(',');
            const b64 = comma === -1 ? '' : dataUrl.slice(comma + 1);
            resolve(b64);
          } catch (e) {
            reject(e);
          }
        };
        img.onerror = (e) => reject(new Error('Image load error: ' + e));
        img.src = url;
        // fallback if already complete
        if (img.complete) {
          setTimeout(() => {
            try {
              const w = width || img.naturalWidth || img.width || 200;
              const h = height || img.naturalHeight || img.height || 80;
              const canvas = document.createElement('canvas');
              canvas.width = w;
              canvas.height = h;
              const ctx = canvas.getContext('2d');
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, w, h);
              ctx.drawImage(img, 0, 0, w, h);
              const dataUrl = canvas.toDataURL('image/png');
              const comma = dataUrl.indexOf(',');
              const b64 = comma === -1 ? '' : dataUrl.slice(comma + 1);
              resolve(b64);
            } catch (err) {
              reject(err);
            }
          }, 50);
        }
      });
    }

    // Get API key stored or fallback to default
    function getApiKeyFromStorage() {
      return new Promise((resolve) => {
        try {
          if (chrome?.storage?.sync) {
            chrome.storage.sync.get(['anticaptcha_apikey'], (data) => {
              resolve(data?.anticaptcha_apikey || DEFAULT_API_KEY);
            });
          } else {
            resolve(localStorage.getItem('anticaptcha_apikey') || DEFAULT_API_KEY);
          }
        } catch (e) {
          resolve(DEFAULT_API_KEY);
        }
      });
    }

    // Try to parse many possible shapes of API response to extract solved text
    // PRIORITY: json.captcha -> json.code -> json.value -> json.text/json.result/... -> fallback short string
    function parseApiResponse(json) {
      if (!json) return '';
      // common names first
      const firstCandidates = [
        json?.captcha,
        json?.code,
        json?.value,
        json?.result,
        json?.text,
        json?.solution,
        json?.answer,
        json?.message // keep message as very low priority
      ];
      for (const c of firstCandidates) {
        if (typeof c === 'string' && c.trim()) return c.trim();
      }
      // nested fields
      const nested = [
        json?.data?.captcha,
        json?.data?.code,
        json?.data?.text,
        json?.data?.solution,
        json?.result?.text
      ];
      for (const c of nested) {
        if (typeof c === 'string' && c.trim()) return c.trim();
      }
      // fallback: top-level short string values
      for (const k of Object.keys(json)) {
        const v = json[k];
        if (typeof v === 'string' && v.trim() && v.length < 20) return v.trim();
      }
      // if json itself is string
      if (typeof json === 'string' && json.trim()) return json.trim();
      return '';
    }

    // Prepare PNG base64 (without prefix) from an <img> element.
    async function preparePngBase64FromImgEl(imgEl) {
      if (!imgEl) throw new Error('Ảnh không tồn tại');
      const src = imgEl.src || imgEl.getAttribute('src') || '';
      if (!src) throw new Error('Ảnh không có src');

      // data URI
      if (src.startsWith('data:')) {
        const parsed = extractDataUri(src);
        if (!parsed) throw new Error('Không parse được data URI');
        const mime = parsed.mime || '';
        const rawData = parsed.data || '';
        console.log('[captcha-solver] data URI mime=', mime, ' base64 len=', rawData.length);

        if (mime === 'image/svg+xml' || mime === 'image/svg') {
          // decode base64 to SVG text and render via blob URL
          try {
            const svgText = parsed.isBase64 ? atob(rawData) : decodeURIComponent(rawData);
            console.log('[captcha-solver] SVG text sample:', svgText.slice(0, 300));
            const blob = textToBlob(svgText, 'image/svg+xml;charset=utf-8');
            const url = URL.createObjectURL(blob);
            try {
              const pngB64 = await imageSrcToPngBase64FromObjectUrl(url);
              console.log('[captcha-solver] converted PNG base64 len from SVG:', pngB64.length);
              return pngB64;
            } finally {
              URL.revokeObjectURL(url);
            }
          } catch (e) {
            throw new Error('Không decode SVG data URI: ' + (e && e.message ? e.message : String(e)));
          }
        } else {
          // raster data URI
          const blob = base64ToBlob(rawData, mime || 'image/png');
          const url = URL.createObjectURL(blob);
          try {
            const pngB64 = await imageSrcToPngBase64FromObjectUrl(url);
            console.log('[captcha-solver] converted PNG base64 len from raster dataURI:', pngB64.length);
            return pngB64;
          } finally {
            URL.revokeObjectURL(url);
          }
        }
      }

      // remote URL -> background fetch
      const resp = await fetchImageBase64ByBackground(src);
      const mime = resp.mime || '';
      const remoteB64 = resp.base64 || '';
      console.log('[captcha-solver] background fetched mime=', mime, ' base64 len=', remoteB64.length);
      if (!remoteB64) throw new Error('Background fetch trả về base64 rỗng');

      if (mime === 'image/svg+xml' || mime === 'image/svg') {
        try {
          const svgText = atob(remoteB64);
          console.log('[captcha-solver] remote SVG text sample:', svgText.slice(0, 300));
          const blob = textToBlob(svgText, 'image/svg+xml;charset=utf-8');
          const url = URL.createObjectURL(blob);
          try {
            const pngB64 = await imageSrcToPngBase64FromObjectUrl(url);
            console.log('[captcha-solver] converted PNG base64 len from remote SVG:', pngB64.length);
            return pngB64;
          } finally {
            URL.revokeObjectURL(url);
          }
        } catch (e) {
          throw new Error('Không decode remote SVG: ' + (e && e.message ? e.message : String(e)));
        }
      } else {
        const blob = base64ToBlob(remoteB64, mime || 'image/png');
        const url = URL.createObjectURL(blob);
        try {
          const pngB64 = await imageSrcToPngBase64FromObjectUrl(url);
          console.log('[captcha-solver] converted PNG base64 len from remote raster:', pngB64.length);
          return pngB64;
        } finally {
          URL.revokeObjectURL(url);
        }
      }
    }

    // Robust fill for input (handles React/Vue, shadow roots, iframes same-origin).
    async function fillCaptchaInputRobust(value) {
      try {
        // 1) Attempt to find input in main document
        let input = document.querySelector('#captcha-input');

        // 2) If not found, search near wrapper
        if (!input) {
          console.warn('[captcha-solver] #captcha-input not found in document. Searching nearby wrapper...');
          const wrapper = document.querySelector('.input-form-captcha-wrapper');
          if (wrapper) {
            input = wrapper.querySelector('input[type="text"], input');
            if (input) console.log('[captcha-solver] Found input near wrapper:', input);
          }
        }

        // 3) If still not found, search same-origin iframes for #captcha-input
        if (!input) {
          const iframes = Array.from(document.querySelectorAll('iframe'));
          for (const f of iframes) {
            try {
              const doc = f.contentDocument || f.contentWindow?.document;
              if (!doc) continue;
              const cand = doc.querySelector('#captcha-input');
              if (cand) {
                input = cand;
                console.log('[captcha-solver] Found #captcha-input inside same-origin iframe');
                break;
              }
              // also search common inputs
              const near = doc.querySelector('.input-form-captcha-wrapper input, input#captcha-input, input[type="text"]');
              if (near) {
                input = near;
                console.log('[captcha-solver] Found input inside same-origin iframe (near wrapper).');
                break;
              }
            } catch (e) {
              // cross-origin iframe -> ignore
            }
          }
        }

        // 4) If still not found, search shadow roots (lightly) from known wrapper/component roots
        if (!input) {
          const elements = Array.from(document.querySelectorAll('*'));
          for (const el of elements) {
            if (el.shadowRoot) {
              try {
                const cand = el.shadowRoot.querySelector('#captcha-input') || el.shadowRoot.querySelector('input');
                if (cand) {
                  input = cand;
                  console.log('[captcha-solver] Found input inside shadowRoot of', el);
                  break;
                }
              } catch (e) {
                // ignore
              }
            }
          }
        }

        if (!input) {
          console.error('[captcha-solver] Cannot find #captcha-input on page (document/iframe/shadow).');
          return { ok: false, err: 'NO_INPUT' };
        }

        // Temporarily enable if disabled/readOnly
        const prevDisabled = input.disabled;
        const prevReadOnly = input.readOnly;
        if (input.disabled) input.disabled = false;
        if (input.readOnly) input.readOnly = false;

        // Use native setter to ensure React listens
        const setNativeValue = (el, val) => {
          try {
            const proto = Object.getPrototypeOf(el);
            const desc = Object.getOwnPropertyDescriptor(proto, 'value') ||
                         Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
            if (desc && desc.set) {
              desc.set.call(el, val);
            } else {
              el.value = val;
            }
          } catch (e) {
            el.value = val;
          }
        };

        setNativeValue(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        try {
          input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true, data: value, inputType: 'insertFromPaste' }));
        } catch (e) {
          // ignore if not supported
        }

        // React internal tracker trick (older versions)
        try {
          const tracker = input._valueTracker;
          if (tracker && typeof tracker.setValue === 'function') tracker.setValue(value);
        } catch (e) { /* ignore */ }

        // If the value still doesn't match (framework overriding), simulate typing
        if (String(input.value) !== String(value)) {
          setNativeValue(input, '');
          input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
          for (let i = 0; i < value.length; i++) {
            const ch = value[i];
            setNativeValue(input, input.value + ch);
            try {
              input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true, data: ch, inputType: 'insertText' }));
            } catch (e) {
              input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
            }
            // small delay (fast)
            await new Promise(r => setTimeout(r, 20));
          }
          input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        }

        try {
          input.focus();
          const len = String(input.value).length;
          input.setSelectionRange(len, len);
        } catch (e) {
          // ignore
        }

        // restore attributes
        if (prevDisabled) input.disabled = prevDisabled;
        if (prevReadOnly) input.readOnly = prevReadOnly;

        console.log('[captcha-solver] Filled input:', input, 'value now=', input.value);
        return { ok: true, value: input.value };
      } catch (err) {
        console.error('[captcha-solver] fillCaptchaInputRobust error:', err);
        return { ok: false, err: err && err.message ? err.message : String(err) };
      }
    }

    // Inject script into page to set value using page's native prototype (for React reliability)
    function injectSetValueInPage(selector, value) {
      try {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        // escape backticks and backslashes
        const escaped = String(value).replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
        script.textContent = `
          (function(){
            try {
              const el = document.querySelector(${JSON.stringify(selector)});
              if(!el) { console.warn('[captcha-solver][injected] No element for selector', ${JSON.stringify(selector)}); return; }
              const desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
              if(desc && desc.set) {
                desc.set.call(el, \`${escaped}\`);
              } else {
                el.value = \`${escaped}\`;
              }
              el.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
              el.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
              try { el.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true, data: \`${escaped}\`, inputType: 'insertFromPaste' })); } catch(e){}
              console.log('[captcha-solver][injected] set value via page context for selector', ${JSON.stringify(selector)});
            } catch(e) { console.error('[captcha-solver][injected] error', e); }
          })();
        `;
        document.documentElement.appendChild(script);
        setTimeout(() => script.remove(), 60);
        return true;
      } catch (e) {
        console.error('[captcha-solver] injectSetValueInPage error:', e);
        return false;
      }
    }

    // copy to clipboard (fallback)
    async function copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) {
        try {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.left = '-9999px';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          return true;
        } catch (err) {
          return false;
        }
      }
    }

    // Create quick button and attach handler
    function createButton() {
      const wrapper = document.querySelector('.input-form-captcha-wrapper') || document.querySelector('.box-captcha') || document.body;
      if (!wrapper) return;
      if (wrapper.querySelector('.captcha-solver-quick-btn')) return; // avoid duplicates

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'captcha-solver-quick-btn';
      btn.textContent = 'Giải ngay';
      btn.title = 'Giải CAPTCHA bằng API';
      btn.style.cssText = 'margin-left:8px;padding:6px 8px;background:#ff6f00;color:#fff;border:0;border-radius:4px;cursor:pointer;font-size:13px;';

      const thumb = wrapper.querySelector('.thumb-captcha') || wrapper.querySelector('#captcha-image') || null;
      if (thumb && thumb.parentElement) thumb.parentElement.insertBefore(btn, thumb.nextSibling);
      else wrapper.appendChild(btn);

      btn.addEventListener('click', async () => {
        btn.disabled = true;
        const prevText = btn.textContent;
        try {
          btn.textContent = 'Đang...';
          const imgEl = document.querySelector('#captcha-image');
          if (!imgEl) throw new Error('Không tìm thấy #captcha-image trên trang');
          const inputEl = document.querySelector('#captcha-input'); // just to check presence
          if (!inputEl) console.warn('[captcha-solver] Warning: #captcha-input not found in main document (may be in iframe/shadow).');

          btn.textContent = 'Chuẩn bị ảnh...';
          const pngBase64 = await preparePngBase64FromImgEl(imgEl);
          if (!pngBase64) throw new Error('Không chuyển được ảnh sang PNG base64');

          console.log('[captcha-solver] PNG base64 length=', pngBase64.length, 'sample=', pngBase64.slice(0, 50));
          btn.textContent = 'Gọi API...';

          const apikey = await getApiKeyFromStorage();
          const payload = { apikey, type: 14, img: pngBase64 };

          // call api
          let res, raw;
          try {
            res = await fetch(API_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            raw = await res.text().catch(() => '');
          } catch (e) {
            throw new Error('Không gửi được API: ' + (e && e.message ? e.message : String(e)));
          }

          let json;
          try { json = JSON.parse(raw); } catch (e) { json = raw; }
          console.log('[captcha-solver] API HTTP status=', res?.status, ' raw=', raw, ' parsed=', json);

          if (!res.ok) {
            throw new Error('API lỗi HTTP ' + res.status + ' ' + raw);
          }

          const solved = parseApiResponse(json);
          if (!solved) {
            console.warn('[captcha-solver] API trả nhưng không tìm thấy kết quả trong JSON:', json);
            btn.textContent = 'Không đọc được';
            btn.title = 'API trả nhưng không có kết quả. Xem console.';
            return;
          }

          // 1) Try content-script fill
          btn.textContent = 'Điền...';
          const fillResult = await fillCaptchaInputRobust(solved);
          if (fillResult.ok) {
            console.log('[captcha-solver] fillCaptchaInputRobust OK', fillResult.value);
            btn.textContent = 'Xong';
            btn.title = 'Xong: ' + fillResult.value;
            return;
          }

          // 2) Try injecting native setter into page context (more reliable for React)
          const injected = injectSetValueInPage('#captcha-input', solved);
          if (injected) {
            await new Promise(r => setTimeout(r, 120));
            const pageInput = document.querySelector('#captcha-input');
            if (pageInput && String(pageInput.value) === String(solved)) {
              console.log('[captcha-solver] injected setter succeeded, value now=', pageInput.value);
              btn.textContent = 'Xong';
              btn.title = 'Xong: ' + pageInput.value;
              return;
            }
            const wrapperEl = document.querySelector('.input-form-captcha-wrapper');
            if (wrapperEl) {
              const injected2 = injectSetValueInPage('.input-form-captcha-wrapper input#captcha-input, .input-form-captcha-wrapper input', solved);
              if (injected2) await new Promise(r=>setTimeout(r,120));
              const maybe = wrapperEl.querySelector('input#captcha-input, input');
              if (maybe && String(maybe.value) === String(solved)) {
                console.log('[captcha-solver] injected setter succeeded for wrapper input', maybe);
                btn.textContent = 'Xong';
                btn.title = 'Xong: ' + maybe.value;
                return;
              }
            }
          }

          // 3) As fallback: set directly and copy to clipboard to help manual paste
          try {
            const directInput = document.querySelector('#captcha-input') || (document.querySelector('.input-form-captcha-wrapper') && document.querySelector('.input-form-captcha-wrapper input'));
            if (directInput) {
              try { directInput.focus(); } catch(e){}
              try { directInput.value = solved; } catch(e){}
              directInput.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
              directInput.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
            }
          } catch (e) { /* ignore */ }

          await copyToClipboard(solved);
          btn.textContent = 'Đã giải (sao chép)';
          btn.title = 'Mã đã sao chép: dán vào ô captcha nếu không tự điền';
          console.log('[captcha-solver] Solved (copied):', solved);

        } catch (err) {
          console.error('[captcha-solver] Lỗi:', err);
          btn.textContent = 'Lỗi';
          btn.title = String(err && err.message ? err.message : err);
        } finally {
          setTimeout(() => {
            btn.disabled = false;
            try { btn.textContent = prevText; } catch (e) {}
          }, 1400);
        }
      });
    }

    // mount button and observe DOM for dynamic changes
    createButton();
    const root = document.body;
    if (root) {
      const obs = new MutationObserver(() => createButton());
      obs.observe(root, { childList: true, subtree: true });
    }

    // Expose helper in window for debugging in console (optional)
    window.__captchaSolverHelpers = {
      preparePngBase64FromImgEl,
      fillCaptchaInputRobust,
      parseApiResponse
    };
  })();
}



// Phần nh tk KM
(function () {
  console.log('[bulk-filler] start');

  const css = `
  /* 🎨 Wrapper bố cục nút và input */
  .bulk-fill-wrapper {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    position: relative;
  }

  /* 🌟 Nút nhập */
  .bulk-fill-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 12px;
    height: 34px;
    font-size: 13px;
    font-weight: 600;
    border-radius: 8px;
    border: none;
    background: linear-gradient(135deg, #ff6f00, #ff6f00);
    color: white;
    cursor: pointer;
    transition: all 0.25s ease;
    box-shadow: 0 2px 5px rgba(59, 130, 246, 0.3);
  }

  /* 💡 Hiệu ứng hover */
  .bulk-fill-btn:hover {
    background: linear-gradient(135deg, #ff6f00, #ff6f00);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
  }

  /* ✨ Khi nhấn */
  .bulk-fill-btn:active {
    transform: translateY(1px);
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
  }

  /* 🔹 Phiên bản nhỏ */
  .bulk-fill-btn.small {
    padding: 0 8px;
    font-size: 12px;
    height: 28px;
    border-radius: 6px;
  }

  /* 🌈 Animation nhẹ khi xuất hiện */
  .bulk-fill-btn {
    animation: fadeInScale 0.25s ease;
  }

  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  `;

  // Inject CSS
 

  function injectCSS() {
    if (document.head.querySelector('#bulk-fill-styles')) return;
    const style = document.createElement('style');
    style.id = 'bulk-fill-styles';
    style.textContent = css;
    document.head.appendChild(style);
    console.log('[bulk-filler] CSS injected');
  }

  // --- storage read ---
  function getBulk() {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['bulkInputCreateData'], (res) => {
          resolve(res && res.bulkInputCreateData ? res.bulkInputCreateData : null);
        });
      } else {
        resolve(window.localStorage.getItem('bulkInputCreateData'));
      }
    });
  }

  // --- selectors ---
  function findAccountInputs() {
    const byPlaceholder = Array.from(document.querySelectorAll('input[placeholder="Nhập tên tài khoản"]'));
    const byExactPlaceholderTrim = Array.from(document.querySelectorAll('input')).filter(i => (i.getAttribute('placeholder')||'').trim() === 'Nhập tên tài khoản');
    const byId = Array.from(document.querySelectorAll('#account'));
    const byClass = Array.from(document.querySelectorAll('input.background-input-select.notranslate'));
    const combined = Array.from(new Set([...byPlaceholder, ...byExactPlaceholderTrim, ...byId, ...byClass]));
    return combined;
  }

  // --- insert button ---
  function createButton(accountValue) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'bulk-fill-btn';
    btn.textContent = 'Nhập';
    btn.addEventListener('click', (e) => {
      const input = btn.__targetInput;
      if (!input) return;
      input.focus();
      input.value = accountValue;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('[bulk-filler] filled', accountValue, '->', input);
    });
    return btn;
  }

  function insertButtonNextToInput(input, accountValue) {
    if (!input || input.dataset.bulkBtn) return;
    // Try to wrap input and button into a wrapper for neat layout
    try {
      const wrapper = document.createElement('span');
      wrapper.className = 'bulk-fill-wrapper';
      // preserve inline display context by copying display of input's parent if possible
      wrapper.style.display = 'inline-flex';
      // replace input with wrapper, then append input and button
      const parent = input.parentElement;
      if (parent) {
        parent.replaceChild(wrapper, input);
        wrapper.appendChild(input);
        const btn = createButton(accountValue);
        // attach reference to input for click handler
        btn.__targetInput = input;

        // adjust button height to match input if input has offsetHeight
        const h = input.offsetHeight;
        if (h && h > 0) {
          
          // if too small, apply small class
          if (h < 32) btn.classList.add('small');
        }

        wrapper.appendChild(btn);
        input.dataset.bulkBtn = '1';
        console.log('[bulk-filler] wrapped input and inserted button', input);
        return;
      }
    } catch (err) {
      console.warn('[bulk-filler] wrapper insert failed, fallback to afterend:', err);
    }

    // Fallback: insert button after input
    try {
      const btn = createButton(accountValue);
      btn.__targetInput = input;
      // set height to match if available
      const h2 = input.offsetHeight;
      if (h2 && h2 > 0) {
        
        if (h2 < 32) btn.classList.add('small');
      } else {
        // default small
        btn.classList.add('small');
      }
      input.insertAdjacentElement('afterend', btn);
      input.dataset.bulkBtn = '1';
      console.log('[bulk-filler] inserted button after input', input);
    } catch (err) {
      console.error('[bulk-filler] cannot insert button for input', input, err);
    }
  }

  // --- main flow ---
  async function init() {
    injectCSS();

    const raw = await getBulk();
    console.log('[bulk-filler] raw bulk:', raw);
    if (!raw) {
      console.warn('[bulk-filler] bulkInputCreateData not found');
      return;
    }
    const parts = String(raw).split('|').map(s => s.trim());
    console.log('[bulk-filler] parts:', parts);
    const accountValue = parts[4] || '';
    if (!accountValue) {
      console.warn('[bulk-filler] no account value at index 4');
      return;
    }

    function tryInsertNow() {
      const inputs = findAccountInputs();
      console.log('[bulk-filler] found inputs:', inputs.length);
      if (inputs.length === 0) return false;
      inputs.forEach(i => insertButtonNextToInput(i, accountValue));
      return true;
    }

    if (!tryInsertNow()) {
      // observe dynamic DOM
      const obs = new MutationObserver((mutations, observer) => {
        if (tryInsertNow()) {
          observer.disconnect();
          console.log('[bulk-filler] inserted and observer disconnected');
        }
      });
      obs.observe(document.documentElement || document.body, { childList: true, subtree: true });
      setTimeout(() => {
        try { obs.disconnect(); console.log('[bulk-filler] observer timed out'); } catch {}
      }, 30000);
    }
  }

  // start
  init();
})();






///Bong bóng 
(function () {
  const bubble = document.createElement('div');
  bubble.className = 'ext-bubble';
  bubble.innerHTML = `
    <div class="ext-bubble-main">☰</div>
    <div class="ext-bubble-menu"></div>
  `;
  document.body.appendChild(bubble);

  // 🎨 CSS an toàn & hiển thị dạng lưới 4 cột
  const style = document.createElement('style');
  style.textContent = `
    .ext-bubble {
      position: fixed !important;
      bottom: 333px !important;
      right: 40px !important;
      z-index: 2147483647 !important;
      font-family: Arial, sans-serif !important;
    }

    .ext-bubble-main {
      width: 60px !important;
      height: 60px !important;
      background: linear-gradient(135deg, #007bff, #00c6ff) !important;
      color: #fff !important;
      border-radius: 50% !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      font-size: 28px !important;
      cursor: pointer !important;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3) !important;
      transition: transform 0.2s ease !important;
    }

    .ext-bubble-main:hover { transform: scale(1.1) !important; }

    .ext-bubble-menu {
      position: absolute !important;
      bottom: 75px !important;
      right: 0 !important;
      display: none !important;
      flex-direction: column !important;
      align-items: flex-end !important;
      background: white !important;
      border-radius: 12px !important;
      padding: 12px !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25) !important;
      animation: ext-fade-in 0.25s ease !important;
      min-width: 240px !important;
      max-width: 360px !important;
    }

    .ext-bubble.show .ext-bubble-menu { display: flex !important; }

    @keyframes ext-fade-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .group-box h4 {
      font-size: 15px !important;
      margin-bottom: 8px !important;
      color: #007bff !important;
      text-align: center !important;
    }

    .group-box {
      display: grid !important;
      grid-template-columns: repeat(4, 1fr) !important;
      gap: 6px !important;
      justify-items: center !important;
    }

    .group-box button {
      background: #007bff !important;
      color: #fff !important;
      border: none !important;
      border-radius: 6px !important;
      padding: 6px 8px !important;
      cursor: pointer !important;
      font-size: 13px !important;
      transition: background 0.2s !important;
      width: 100% !important;
    }

    .group-box button:hover { background: #0056b3 !important; }
  `;
  document.head.appendChild(style);

  // 🧩 Các nhóm HTML
  const htmlGroups = [
    ` <center>Domibet - Trung Tâm Tài Khoản </center>
      <div class="group-box">
        <button data-action="naptien">Nạp Tiền</button>
        <button data-action="ruttien">Rút Tiền</button>
        <button data-action="khuyenmai">Khuyến Mại</button>
        <button data-action="domino">Domino</button>

        <button data-action="hopthu">Hộp Thư</button>
        <button data-action="lichsucuoc">LS Cược</button>
        <button data-action="lichsugiaodich">LS Giao Dịch</button>
        <button data-action="hoantra">Hoàn Trả</button>
      </div>
    `,
    `<center>Phần Xin Khuyến Mại</center>
      <div class="group-box">
        <button data-action="ctkmhi88">KM HI88</button>
        <button data-action="ctkmnew88">KM New88</button>
        <button data-action="ctkmf8bet">KM F8bet</button>
        <button data-action="ctkmmb66">KM MB66</button>

        <button data-action="ctkm789bet">KM 789Bet</button>
        <button data-action="ctkmshbet">KM Shbet</button>
        <button data-action="ctkmjun88">KM Jun88</button>
        <button data-action="ctkm78win">KM 78Win</button>
		
        <button data-action="ctkmqq88">KM QQ88</button>
        <button data-action="ctkmrr88">KM RR88</button>
        <button data-action="ctkmgk88">KM GK88</button>
      </div>
    `,
    `<center>Game Chéo Cược</center>
      <div class="group-box">
        <button data-action="txr88">TX(R88)</button>
        <button data-action="dgcasino">DG Casino</button>
        <button data-action="aesexy">AE Sexy</button>
        <button data-action="#">...</button>
      </div>
    <center>Game Chạy Cược</center>
      <div class="group-box">
        <button data-action="cuonpp">Cuộn(PP)</button>
        <button data-action="tpv3">TPV3(YRG)</button>
        <button data-action="longthanjili">Long Thần(Jili)</button>
        <button data-action="taydu">Tây Du(TP)</button>
        <button data-action="ngokhong">Ngộ Không(FC)</button>
        <button data-action="ttcat">TT Cắt</button>
        <button data-action="ttban">TT Bắn</button>
        <button data-action="khunglong">Jili Khủng Long</button>
		
     </div>
	 <center>Game Cân Cược</center>
	<div class="group-box">
        <button data-action="xsvr">XS(VR)</button>
        <button data-action="senr88">Sên(R88)</button>
        <button data-action="sieutocr88">Siêu Tốc(R88)</button>
        <button data-action="jun1r88">Jun1(R88)</button>
        <button data-action="gw78w">GW78W</button>
      </div>
    `
  ];

  let currentGroup = 0;
  const menu = bubble.querySelector('.ext-bubble-menu');
  const main = bubble.querySelector('.ext-bubble-main');

  function renderMenu(index) {
    menu.innerHTML = htmlGroups[index];
    attachButtonEvents(menu);
  }

  // 🧭 Xử lý click từng nút
  function attachButtonEvents(container) {
    const buttons = container.querySelectorAll('button');
    const base = window.location.origin;
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        switch (action) {
		  case 'naptien': window.location.href = `${base}/Financial?type=deposit`; break;
	      case 'ruttien': window.location.href = `${base}/Financial?tab=2`; break;
		  case 'khuyenmai': window.location.href = `${base}/Promotion`; break;
          case 'domino': alert('Sản phẩm của Domino , tham gia nhóm @casino8386'); break;
		  
		  case 'hopthu': window.location.href = `${base}/SiteMail`; break;
		  case 'lichsucuoc': window.location.href = `${base}/BetRecord`; break;
		  case 'lichsugiaodich': window.location.href = `${base}/Transaction`; break;
		  case 'hoantra': window.location.href = `${base}/Discount`; break;
		  
		  
		  
		  
		  
		  case 'ctkmhi88': window.open(`https://tangqua88.com/?promo_id=ND188`, '_blank'); break;
		  case 'ctkmnew88': window.open(`https://tangqua88.com/?promo_id=ND188`, '_blank'); break;
		  case 'ctkmf8bet': window.open(`https://ttkm-f8bet01.pages.dev/?promo_id=ND188`, '_blank'); break;
		  case 'ctkmmb66': window.open(`https://ttkm-mb66okvip02.pages.dev`, '_blank'); break;
		  case 'ctkm789bet': window.open(`https://ttkm789bet04.pages.dev`, '_blank'); break;
		  case 'ctkmshbet': window.open(`https://khuyenmai-shbet01.pages.dev//?promo_id=SH188`, '_blank'); break;
		  case 'ctkmjun88': window.open(`https://trungtam.khuyenmaijun881.win/?promo_id=ND188`, '_blank'); break;
		  case 'ctkm78win': window.open(`https://1wmzoj2fqkqiysmxy8fdyk7sghnkmxqygemyctdo3kyrfmuqjzashg2.daily78win.net`, '_blank'); break;
		  case 'ctkmqq88': window.open(`https://khuyenmai-qq88.pages.dev/?promo_id=TN188`, '_blank'); break;
		  case 'ctkmrr88': window.open(`https://rr88ttkm.com`, '_blank'); break;
		  case 'ctkmgk88': window.open(`https://khuyenmai-gk88.pages.dev`, '_blank'); break;
		  
		  case 'txr88': window.open(`${base}/Account/LoginToSupplier?supplierType=104&gId=3794&cId=2`, '_blank'); break;
          case 'dgcasino': window.open(`${base}/Account/LoginToSupplier?SupplierType=DG`, '_blank'); break;
          case 'aesexy': window.open(`${base}/Account/LoginToSupplier?supplierType=SE&gId=4020`, '_blank'); break;

          case 'cuonpp': window.open(`${base}/Account/LoginToSupplier?supplierType=15&gId=2439&cId=1`, '_blank'); break;
          case 'tpv3': window.open(`${base}/Account/LoginToSupplier?supplierType=110&gId=7469&cId=20`, '_blank'); break;
          case 'longthanjili': window.open(`${base}/Account/LoginToSupplier?supplierType=101&gId=3271&cId=1`, '_blank'); break;
          case 'taydu': window.open(`${base}/Account/LoginToSupplier?supplierType=97&gId=4874&cId=21`, '_blank'); break;
          case 'ngokhong': window.open(`${base}/Account/LoginToSupplier?supplierType=102&gId=3416&cId=2`, '_blank'); break;
          case 'ttcat': window.open(`${base}/Account/LoginToSupplier?supplierType=97&gId=2905&cId=2`, '_blank'); break;
          case 'ttban': window.open(`${base}/Account/LoginToSupplier?supplierType=97&gId=1522&cId=2`, '_blank'); break;
          case 'khunglong': window.open(`${base}/Account/LoginToSupplier?supplierType=101&gId=5212&cId=1`, '_blank'); break;

          case 'xsvr': window.open(`${base}/Account/LoginToSupplier?SupplierType=VR`, '_blank'); break;
          case 'senr88': window.open(`${base}/Account/LoginToSupplier?supplierType=104&gId=3780&cId=21`, '_blank'); break;
          case 'sieutocr88': window.open(`${base}/Account/LoginToSupplier?supplierType=104&gId=3786&cId=21`, '_blank'); break;
          case 'jun1r88': window.open(`${base}/gamelobby/chess`, '_blank'); break;
          case 'gw78w': window.open(`${base}/gamelobby/lottery`, '_blank'); break;

		  
          default: console.log('Không có hành động cho:', action);
        }
      });
    });
  }

  // 🖱️ Toggle menu
  main.addEventListener('click', () => {
    if (bubble.classList.contains('show')) {
      bubble.classList.remove('show');
      currentGroup = (currentGroup + 1) % htmlGroups.length;
      renderMenu(currentGroup);
    } else {
      renderMenu(currentGroup);
      bubble.classList.add('show');
    }
  });
})();
