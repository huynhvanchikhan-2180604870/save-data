let APIKEY_CAPCHA = "ec53477299cfbbf89cd4bb66d21de723";
let USERNAME_TEAM = "";
let API_BASE = "https://save-data-tau.vercel.app/api/links";

async function loadTokenAndLink() {
  try {
    // Đọc file active.txt
    const response = await fetch(chrome.runtime.getURL("active.txt"));
    const text = await response.text();
    USERNAME_TEAM = text.trim();

    alert(
      `Cảm ơn đã sử dụng bản mod của tớ!\nLiên hệ tele @nextgenhvck để được hỗ trợ.\n\n🧑‍💻 USER: ${USERNAME_TEAM}`
    );
    alert("☕ Hỗ trợ tớ ly cà phê: VPBank 0922059852");

    console.log("✅ USERNAME_TEAM:", USERNAME_TEAM);
  } catch (err) {
    console.error("❌ Không đọc được active.txt:", err);
    alert("Không thể đọc file active.txt. Kiểm tra lại đường dẫn.");
  }
}

// Khi extension khởi động
document.addEventListener("DOMContentLoaded", () => {
  loadTokenAndLink();
});
// Improved popup.js with progress tracking and better UX

// Đồng bộ select ngân hàng với input bank_name
document.addEventListener("DOMContentLoaded", () => {
  const bankInput = document.getElementById("bank_name");
  const bankSelect = document.getElementById("bank_name_select");
  if (bankInput && bankSelect) {
    bankSelect.addEventListener("change", () => {
      if (bankSelect.value) bankInput.value = bankSelect.value;
    });
  }
});

// Two bank lists: standard (existing) and R88
const BANK_LIST_STANDARD = [
  "ABBANK",
  "ACB BANK",
  "AGRIBANK",
  "ANZ BANK",
  "BAC A BANK",
  "BAO VIET BANK",
  "BIDV BANK",
  "CAKE",
  "CB BANK",
  "CIMB BANK",
  "CITI",
  "CO OPBANK",
  "DBS",
  "EXIMBANK",
  "GP BANK",
  "HD BANK",
  "HNB",
  "HONGLEONG BANK",
  "HSBC",
  "IBK",
  "IVB",
  "KBANK",
  "KIENLONGBANK",
  "KOOKMI",
  "LIENVIET BANK",
  "LIOBANK",
  "MAFC",
  "MBBANK",
  "MBV",
  "MSB BANK",
  "NAMA BANK",
  "NCB",
  "NHB",
  "OCB BANK",
  "PUBLICBANK",
  "PGBANK",
  "PVCOMBANK",
  "SACOMBANK",
  "SAIGONBANK",
  "SCB",
  "SCBVL",
  "SEABANK",
  "SHB BANK",
  "SHINHAN BANK VN",
  "TECHCOMBANK",
  "TIMO BANK",
  "TPBANK",
  "UBANK",
  "UOB",
  "VIETCOMBANK",
  "Vietcombank Neo Limited (VCBNeo)",
  "VDB",
  "VIB BANK",
  "VIET CAPITAL BANK (BVBANK)",
  "VIETA BANK",
  "VIETBANK",
  "VIETINBANK",
  "VIETNAM BANK FOR SOCIAL POLICIES",
  "VIKKI BANK",
  "VIKKI BY HDBANK",
  "VPBANK",
  "VRB(VIET NGA)",
  "WOORI BANK",
];

const BANK_LIST_R88 = [
  "VIETIN BANK",
  "MB BANK",
  "VIETCOM BANK",
  "SACOM BANK",
  "AGRIBANK",
  "Vikki Digital Bank",
  "AB BANK",
  "ACB BANK",
  "ALL BANK SUPPORT",
  "ANZ BANK",
  "BAC A BANK",
  "BAOVIET BANK",
  "BIDV BANK",
  "BVBANK",
  "CAKE",
  "CB BANK",
  "CIMB",
  "Co-opBank",
  "DBS",
  "EXIMBANK",
  "FIRST BANK",
  "GPBANK",
  "HD BANK",
  "HSBC",
  "IBK HCM",
  "INDOVINA BANK",
  "KASIKORNBANK",
  "KB KOOKMIN BANK",
  "KIENLONG BANK",
  "LIO BANK",
  "LP BANK",
  "MBV BANK",
  "MSB",
  "NAM A BANK",
  "NCB BANK",
  "NONGHYUP BANK",
  "OCB BANK",
  "PG BANK",
  "PVCOM BANK",
  "SAIGON BANK",
  "SCB BANK",
  "SEA BANK",
  "SHB BANK",
  "SHINHAN BANK",
  "Standard Chartered",
  "TECHCOM BANK",
  "TIMO BY BAN VIET BANK",
  "TPBANK",
  "UBANK",
  "UOB (United Overseas Bank)",
  "VIB BANK",
  "VIET A BANK",
  "VIET BANK",
  "VPBANK",
  "VR BANK",
  "WOORI BANK",
];

// Populate bank select based on selected mode
async function populateBankSelect(mode) {
  const select = document.getElementById("bank_name_select");
  if (!select) return;
  // clear existing (except first option)
  select.innerHTML = "";
  const emptyOpt = document.createElement("option");
  emptyOpt.value = "";
  emptyOpt.textContent = "-- Chọn ngân hàng --";
  select.appendChild(emptyOpt);

  const list = mode === "r88" ? BANK_LIST_R88 : BANK_LIST_STANDARD;
  list.forEach((b) => {
    const opt = document.createElement("option");
    opt.value = b;
    opt.textContent = b;
    select.appendChild(opt);
  });
}

// Persist and load bank list mode
document.addEventListener("DOMContentLoaded", async () => {
  const modeSelect = document.getElementById("bank_list_mode");
  if (!modeSelect) return;
  // load saved mode
  try {
    const saved = await chrome.storage.local.get(["bankListMode"]);
    const mode = (saved && saved.bankListMode) || "standard";
    modeSelect.value = mode;
    await populateBankSelect(mode);
  } catch (e) {
    await populateBankSelect("standard");
  }

  modeSelect.addEventListener("change", async () => {
    const m = modeSelect.value || "standard";
    await populateBankSelect(m);
    try {
      await chrome.storage.local.set({ bankListMode: m });
      showNotification("Đã chuyển danh sách ngân hàng.", "success");
    } catch (e) {}
  });
});

// Hàm sinh tên chi nhánh ngân hàng ngẫu nhiên
function randomBankBranch() {
  const cities = [
    "An Giang",
    "Ba Ria - Vung Tau",
    "Bac Lieu",
    "Bac Giang",
    "Bac Kan",
    "Bac Ninh",
    "Ben Tre",
    "Binh Duong",
    "Binh Dinh",
    "Binh Phuoc",
    "Binh Thuan",
    "Ca Mau",
    "Can Tho",
    "Cao Bang",
    "Da Nang",
    "Dak Lak",
    "Dak Nong",
    "Dien Bien",
    "Dong Nai",
    "Dong Thap",
    "Gia Lai",
    "Ha Giang",
    "Ha Nam",
    "Ha Noi",
    "Ha Tinh",
    "Hai Duong",
    "Hai Phong",
    "Hau Giang",
    "Hoa Binh",
    "Hung Yen",
    "Khanh Hoa",
    "Kien Giang",
    "Kon Tum",
    "Lai Chau",
    "Lam Dong",
    "Lang Son",
    "Lao Cai",
    "Long An",
    "Nam Dinh",
    "Nghe An",
    "Ninh Binh",
    "Ninh Thuan",
    "Phu Tho",
    "Phu Yen",
    "Quang Binh",
    "Quang Nam",
    "Quang Ngai",
    "Quang Ninh",
    "Quang Tri",
    "Soc Trang",
    "Son La",
    "Tay Ninh",
    "Thai Binh",
    "Thai Nguyen",
    "Thanh Hoa",
    "Thua Thien Hue",
    "Tien Giang",
    "TP HCM",
    "Tra Vinh",
    "Tuyen Quang",
    "Vinh Long",
    "Vinh Phuc",
    "Yen Bai",
  ];

  const branchTypes = [""];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const type = branchTypes[Math.floor(Math.random() * branchTypes.length)];
  return `${type} ${city}`;
}
// Xử lý tải file txt khi nhấn nút downloadBulkBtn
document.addEventListener("DOMContentLoaded", () => {
  const downloadBtn = document.getElementById("downloadBulkBtn");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      downloadAccount();
    });
  }
});

// Hàm downloadAccount gốc, chỉnh sửa để nếu không có dữ liệu popup thì thử lấy từ background
function downloadAccount() {
  const bi = document.getElementById("bulkInput");
  let content = bi ? bi.value.trim() : "";

  if (!content) {
    // Nếu bulkInput trống, thử tải từ dữ liệu background đã chuẩn bị
    downloadAccountFromBackgroundData();
    return;
  }

  // Nếu bulkInput có nội dung, tiến hành tải xuống nội dung đó
  const lines = content
    .split(/\|\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  const pretty = lines.join("\n");
  const blob = new Blob([pretty], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "accounts.txt";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// Sau khi hoàn tất công việc, lưu vào localStorage
function saveBulkInputToLocal() {
  const bi = document.getElementById("bulkInput");
  if (bi) {
    localStorage.setItem("bulkInputData", bi.value);
  }
}

// Gọi hàm này sau khi submit form hoặc nhập data thành công
function handleAfterWorkDone() {
  saveBulkInputToLocal();
}

// Gắn vào các nút submitForm và applyBulk
document.addEventListener("DOMContentLoaded", () => {
  const submitBtn = document.getElementById("submitForm");
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      setTimeout(handleAfterWorkDone, 1000); // delay để đảm bảo dữ liệu đã cập nhật
    });
  }
  const applyBulkBtn = document.getElementById("applyBulk");
  if (applyBulkBtn) {
    applyBulkBtn.addEventListener("click", () => {
      setTimeout(handleAfterWorkDone, 1000);
    });
  }
});

// Xử lý nút submit form: tự động click nút submit trên trang
// Debug banner to confirm script runs (safe, non-intrusive)
document.addEventListener("DOMContentLoaded", () => {
  try {
    const existing = document.getElementById("debug-banner");
    if (!existing) {
      const banner = document.createElement("div");
      banner.id = "debug-banner";
      banner.textContent = "nextgen - @nextgen";
      banner.style.cssText =
        "position:fixed;bottom:6px;right:6px;background:#e6ffed;color:#064;z-index:9999;padding:4px 8px;border-radius:6px;font-size:12px";
      document.body.appendChild(banner);
    }
  } catch (e) {
    // ignore
  }
});

// Improved notification system with grouping
let notificationQueue = [];
let currentNotification = null;
let notificationTimeout = null;

function showNotification(message, type = "info", duration = 3000) {
  // Add to queue
  notificationQueue.push({ message, type, duration });

  // Process queue if not currently showing
  if (!currentNotification) {
    processNotificationQueue();
  }
}

function processNotificationQueue() {
  if (notificationQueue.length === 0) {
    currentNotification = null;
    return;
  }

  const notification = notificationQueue.shift();
  currentNotification = notification;

  // Remove existing notifications
  const existing = document.querySelectorAll(".notification");
  existing.forEach((n) => n.remove());

  const notificationEl = document.createElement("div");
  notificationEl.className = `notification ${notification.type}`;
  notificationEl.textContent = notification.message;

  document.body.appendChild(notificationEl);

  // Auto-remove after duration
  notificationTimeout = setTimeout(() => {
    if (notificationEl.parentNode) {
      notificationEl.parentNode.removeChild(notificationEl);
    }
    currentNotification = null;
    processNotificationQueue();
  }, notification.duration);
}

// Progress tracking functions
function showProgress(current, total, step = "") {
  const container = document.getElementById("progress-container");
  const fill = document.getElementById("progress-fill");
  const text = document.getElementById("progress-text");
  const stepEl = document.getElementById("progress-step");

  if (container && fill && text && stepEl) {
    container.style.display = "block";
    const percentage = total > 0 ? (current / total) * 100 : 0;
    fill.style.width = `${percentage}%`;
    text.textContent = `${current}/${total}`;
    stepEl.textContent = step || "Processing...";
  }
}

function hideProgress() {
  const container = document.getElementById("progress-container");
  if (container) {
    container.style.display = "none";
  }
}

function updateProgress(current, total, step) {
  showProgress(current, total, step);
}

// Improved submit form handler with better UX
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("submitForm");
  const btn_link_nap = document.getElementById("link_nap");
  const btn_link_rut = document.getElementById("link_rut");

  if (btn) {
    btn.addEventListener("click", async () => {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id) {
        showNotification("Không tìm thấy tab hiện tại!", "error");
        return;
      }

      // Show loading state
      btn.disabled = true;
      btn.textContent = "Đang xử lý...";

      try {
        chrome.tabs.sendMessage(tab.id, { action: "autoClickSubmit" });
        showNotification("Đã gửi yêu cầu submit form!", "success");

        // After 2s, navigate the tab to /Deposit using chrome.tabs.update
        setTimeout(() => {
          try {
            const target = tab.url
              ? new URL("/Deposit", tab.url).href
              : `${tab?.windowId || ""}/Deposit`;
            // update specific tab
            try {
              chrome.tabs.update(tab.id, { url: target });
            } catch (e) {
              // fallback: update active tab
              try {
                chrome.tabs.update({ url: target });
              } catch (ee) {}
            }
          } catch (e) {
            // fallback simple update to pathname
            try {
              chrome.tabs.update(tab.id, { url: "/Deposit" });
            } catch (ee) {}
          }
        }, 2000);
      } catch (error) {
        showNotification("Lỗi khi gửi yêu cầu submit!", "error");
      } finally {
        // Reset button state
        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = "✅️ Thực hiện submit form";
        }, 3000);
      }
    });
  }

  // Navigate to Deposit when link_nap is clicked
  if (btn_link_nap) {
    btn_link_nap.addEventListener("click", async () => {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id) {
        showNotification("Không tìm thấy tab hiện tại!", "error");
        return;
      }

      btn_link_nap.disabled = true;
      btn_link_nap.textContent = "Đang chuyển...";

      try {
        // After navigation, wait shortly then read stored create-data and send password to page
        setTimeout(async () => {
          try {
            const saved = await chrome.storage.local.get([
              "bulkInputCreateData",
            ]);
            const txt = (saved && saved.bulkInputCreateData) || "";
            const parts = txt
              .split("|")
              .map((s) => s.trim())
              .filter(Boolean);
            // password is usually at index 5 (0-based) in created data; fallback to a heuristic
            let pwd = parts[5] || parts[6] || "";
            if (!pwd) {
              // try to find a token that looks like a password (letters+digits, length>=6)
              const cand = parts.find(
                (p) =>
                  /^[A-Za-z0-9]{6,}$/.test(p) &&
                  /[A-Za-z]/.test(p) &&
                  /\d/.test(p)
              );
              pwd = cand || "";
            }
            if (!pwd) {
              showNotification(
                "Không tìm thấy mật khẩu trong dữ liệu đã lưu.",
                "error"
              );
              return;
            }
            const passXpath =
              "/html[1]/body[1]/div[1]/ui-view[1]/gupw-app[1]/ui-view[1]/gupw-sample-layout[1]/div[2]/div[1]/ui-view[1]/gupw-member-center-layout[1]/div[1]/div[1]/div[2]/ui-view[1]/gupw-change-money-password[1]/div[1]/div[2]/div[1]/div[1]/section[1]/form[1]/div[1]/div[1]/div[1]/input[1]";
            const passConfirmXpath =
              "/html[1]/body[1]/div[1]/ui-view[1]/gupw-app[1]/ui-view[1]/gupw-sample-layout[1]/div[2]/div[1]/ui-view[1]/gupw-member-center-layout[1]/div[1]/div[1]/div[2]/ui-view[1]/gupw-change-money-password[1]/div[1]/div[2]/div[1]/div[1]/section[1]/form[1]/div[2]/div[1]/div[1]/input[1]";

            // send fill request to content script on the active tab
            chrome.tabs.sendMessage(tab.id, {
              action: "fillFormAdvanced",
              payload: {
                fields: [
                  { xpath: passXpath, value: pwd },
                  { xpath: passConfirmXpath, value: pwd },
                ],
                autoSubmit: true,
                fireEvents: true,
              },
            });
            showNotification("Đã gửi mật khẩu rút tới trang.", "success");
          } catch (err) {
            console.error(err);
            showNotification("Lỗi khi gửi mật khẩu rút.", "error");
          }
        }, 1500);
        const target = tab.url
          ? new URL("/Financial?tab=1", tab.url).href
          : "/deposit";
        await chrome.tabs.update(tab.id, { url: target });
        showNotification("Chuyển tới /Financial?tab=1", "success");
      } catch (e) {
        console.error(e);
        showNotification(
          "Không thể chuyển trang tới /Financial?tab=1",
          "error"
        );
      } finally {
        setTimeout(() => {
          btn_link_nap.disabled = false;
          btn_link_nap.textContent = "Link Nạp";
        }, 3000);
      }
    });
  }

  // Navigate to ChangeMoneyPassword when link_rut is clicked
  if (btn_link_rut) {
    btn_link_rut.addEventListener("click", redirectToRutTienPage);
  }

  // Handle close ads button in popup: send a message to content script to click the ad-close XPath
  const closeAdsBtn = document.getElementById("close_ads");
  closeAdsBtn.addEventListener("click", closeAds);

  // Stop Automation button (sends message to background to stop and closes extension tabs)
  const stopAutomationBtn = document.getElementById("stopAutomation");
  if (stopAutomationBtn) {
    stopAutomationBtn.addEventListener("click", async () => {
      stopAutomationBtn.disabled = true;
      stopAutomationBtn.textContent = "Đang dừng...";
      try {
        const response = await chrome.runtime.sendMessage({
          action: "stopAutomation",
        });
        if (response && response.success) {
          showNotification("Đã gửi yêu cầu dừng automation", "success");
          // hide progress UI
          hideProgress();
          // Re-enable Auto Action button if present
          const runBtn = document.querySelector(".site-list + div button");
          if (runBtn) {
            runBtn.disabled = false;
            runBtn.textContent = "Bắt đầu";
          }
        } else {
          // showNotification("Không thể dừng automation: phản hồi lỗi", "error");
        }
      } catch (err) {
        console.error("Lỗi khi gửi yêu cầu dừng automation:", err);
        showNotification("Lỗi khi gửi yêu cầu dừng automation", "error");
      } finally {
        stopAutomationBtn.disabled = false;
        stopAutomationBtn.textContent = "⏹️ Dừng Automation";
      }
    });
  }
});

// Hàm closeAds (trong popup) - chỉ gửi yêu cầu cho content script
async function closeAds() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    showNotification("Không tìm thấy tab hiện tại!", "error");
    return;
  }
  try {
    // Gửi yêu cầu đóng quảng cáo đến content script
    await chrome.tabs.sendMessage(tab.id, {
      action: "clickXPath",
      xpath: `//span[@translate="Common_Closed"]`,
    });
    await chrome.tabs.sendMessage(tab.id, {
      action: "clickXPath",
      xpath: `//button[@translate="Common_Closed"]`,
    });
    await chrome.tabs.sendMessage(tab.id, {
      action: "clickXPath",
      xpath: `//button[@translate="Announcement_GotIt"]`,
    });
    await chrome.tabs.sendMessage(tab.id, {
      action: "clickXPath",
      xpath: `//i[@class="fal fa-times"]`,
    });
    showNotification("Đã gửi yêu cầu đóng quảng cáo", "success");
    // delay này không cần thiết trong popup vì không chặn luồng chính
    // await delay(5000); // <-- Xóa hoặc chuyển cái này nếu không thực sự cần delay popup
  } catch (e) {
    console.error("Không thể gửi yêu cầu đóng quảng cáo:", e);
    showNotification("Không thể gửi yêu cầu đóng quảng cáo", "error");
  }
}

/// Random chuỗi ký tự, số, email, ngày sinh
function randomName() {
  const firstNames = [
    // nam
    "nam",
    "huy",
    "minh",
    "tung",
    "duy",
    "tuan",
    "khang",
    "phong",
    "khoa",
    "hieu",
    "long",
    "quang",
    "trung",
    "duc",
    "toan",
    "son",
    "hoang",
    "bao",
    "thanh",
    "phuc",
    "hai",
    "tai",
    "loc",
    "khanh",
    "anh",
    "vu",
    "hau",
    "lam",
    "nhan",
    "phat",
    "hung",
    "kien",
    "tue",
    "viet",
    "thinh",
    "giang",
    "thang",
    "tri",
    "thien",
    "nghia",
    "tan",
    "dat",
    "tam",
    "luu",
    "cuong",
    "tu",
    "phuoc",
    "dung",
    "binh",
    "namanh",

    // nu
    "hoa",
    "linh",
    "trang",
    "lan",
    "thao",
    "hanh",
    "phuong",
    "vy",
    "mai",
    "ngoc",
    "my",
    "nhi",
    "yen",
    "chi",
    "ha",
    "giang",
    "quynh",
    "tram",
    "diem",
    "tam",
    "anhthu",
    "thanh",
    "tuyet",
    "huong",
    "nga",
    "loan",
    "tien",
    "duyen",
    "ngan",
    "kim",
    "nhu",
    "ly",
    "an",
    "thuy",
    "tuyen",
    "thuy",
    "lien",
    "phucanh",
    "khanhlinh",
    "hoai",

    // trung tinh / unisex / hien dai
    "alex",
    "sam",
    "taylor",
    "sky",
    "rio",
    "leo",
    "jay",
    "ken",
    "tom",
    "jin",
    "bin",
    "ben",
    "max",
    "nick",
    "kai",
    "andy",
    "chris",
    "robin",
    "danny",
    "lee",

    // ho hoac danh xung ghep nickname
    "dom",
    "king",
    "boss",
    "pro",
    "bet",
    "vip",
    "queen",
    "prince",
    "master",
    "lord",
    "shadow",
    "dark",
    "light",
    "fire",
    "ice",
    "storm",
    "ace",
    "nova",
    "star",
    "hero",
    "devil",
    "angel",
    "zoro",
    "luffy",
    "nami",
    "ace",
    "sabo",
    "dragon",
    "naruto",
    "sasuke",

    // ten doc la
    "zen",
    "neo",
    "fox",
    "wolf",
    "moon",
    "mars",
    "venus",
    "nova",
    "zero",
    "echo",
    "rex",
    "lux",
    "neko",
    "panda",
    "rin",
    "yuki",
    "mina",
    "sora",
    "kuro",
    "ryu",
  ];

  const lastNames = [
    "Nguyen",
    "Tran",
    "Le",
    "Pham",
    "Hoang",
    "Phan",
    "Vu",
    "Vo",
    "Dang",
    "Bui",
    "Do",
    "Ho",
    "Ngo",
    "Duong",
    "Ly",
    "hoa",
    "linh",
    "trang",
    "lan",
    "thao",
    "hanh",
    "phuong",
    "vy",
    "mai",
    "ngoc",
    "my",
    "nhi",
    "yen",
    "chi",
    "ha",
    "giang",
    "quynh",
    "tram",
    "diem",
    "tam",
    "anhthu",
    "thanh",
    "tuyet",
    "huong",
    "nga",
    "loan",
    "tien",
    "duyen",
    "ngan",
    "kim",
    "nhu",
    "ly",
    "an",
    "thuy",
    "tuyen",
    "thuy",
    "lien",
    "phucanh",
    "khanhlinh",
    "hoai",

    // trung tinh / unisex / hien dai
    "alex",
    "sam",
    "taylor",
    "sky",
    "rio",
    "leo",
    "jay",
    "ken",
    "tom",
    "jin",
    "bin",
    "ben",
    "max",
    "nick",
    "kai",
    "andy",
    "chris",
    "robin",
    "danny",
    "lee",
  ];
  const nicknames = [
    "pro",
    "vip",
    "dev",
    "cute",
    "hero",
    "admin",
    "boss",
    "no1",
    "master",
    "legend",
    "dragon",
    "fox",
    "wolf",
    "lion",
    "tiger",
    "hoa",
    "linh",
    "trang",
    "lan",
    "thao",
    "hanh",
    "phuong",
    "vy",
    "mai",
    "ngoc",
    "my",
    "nhi",
    "yen",
    "chi",
    "ha",
    "giang",
    "quynh",
    "tram",
    "diem",
    "tam",
    "anhthu",
    "thanh",
    "tuyet",
    "huong",
    "nga",
    "loan",
    "tien",
    "duyen",
    "ngan",
    "kim",
    "nhu",
    "ly",
    "an",
    "thuy",
    "tuyen",
    "thuy",
    "lien",
    "phucanh",
    "khanhlinh",
    "hoai",
  ];

  const getRand = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const randNum = (max = 10000) => Math.floor(Math.random() * max);

  const style = Math.floor(Math.random() * 6); // 6 kiểu random

  switch (style) {
    case 0:
      // Họ + tên
      return `${getRand(lastNames)} ${getRand(firstNames)}`;
    case 1:
      // nickname + số
      return `${getRand(nicknames)}${randNum()}`;
    case 2:
      // tên thường + số
      return `${getRand(firstNames).toLowerCase()}${randNum()}`;
    case 3:
      // Họ + tên + số
      return `${getRand(lastNames)}${getRand(firstNames)}${randNum(999)}`;
    case 4:
      // Nickname + tên
      return `${getRand(nicknames)}${getRand(firstNames).toLowerCase()}`;
    case 5:
      // Tên viết tắt (VD: Nguyen Van A -> NVA)
      const ln = getRand(lastNames);
      const fn = getRand(firstNames);
      return `${ln[0]}${fn[0]}${randNum(999)}`.toUpperCase();
    default:
      return `${getRand(firstNames)}${randNum()}`;
  }
}

// Validate account name: starts with a letter, only letters/digits, length >= 6
function isValidAccountName(name) {
  return /^[A-Za-z][A-Za-z0-9]{5,}$/.test(String(name || ""));
}

// Sinh tên tài khoản hợp lệ theo yêu cầu:
// - Bắt đầu bằng chữ cái
// - Chỉ chứa chữ cái và số (không có ký tự đặc biệt)
// - Ít nhất 6 ký tự
function randomAccountName() {
  // Danh sách họ
  const lastNames = [
    // 🔹 Họ Việt phổ biến
    "nguyen",
    "tran",
    "le",
    "pham",
    "hoang",
    "huynh",
    "phan",
    "vu",
    "vo",
    "dang",
    "bui",
    "do",
    "truong",
    "ngo",
    "duong",
    "dinh",
    "cao",
    "ly",
    "ha",
    "trinh",
    "mai",
    "luu",
    "doan",
    "tien",
    "tang",
    "vuong",
    "ho",
    "ta",
    "ngan",
    "dao",
    "phung",
    "chau",
    "giang",
    "la",
    "dong",
    "nghiem",
    "quan",
    "tong",
    "han",
    "lam",
    "mac",
    "luong",
    "nghi",
    "to",
    "ton",
    "trieu",
    "tao",
    "van",
    "bach",
    "tan",
    "tong",
    "son",
    "phan",
    "an",
    "long",
    "vuong",
    "cao",
    "thai",
    "vong",
    "kieu",
    "leu",
    "nghiem",
    "ngoc",
    "hiep",
    "tan",
    "vuong",
    "kien",
    "ngoan",
    "vu",
    "chau",
    "trieu",
    "luong",
    "hoang",
    "trinh",
    "nguyen",
    "tran",
    "pham",
    "le",
    "truong",
    "do",
    "huynh",
    "bui",
    "ngo",
    "vo",
    "vu",
    "dinh",
    "cao",
    "duong",
    "phan",
    "doan",

    // 🔹 Họ ít phổ biến / cổ
    "tiet",
    "dang",
    "trinh",
    "trieu",
    "mac",
    "dong",
    "vo",
    "bach",
    "ta",
    "giang",
    "vuong",
    "phung",
    "vu",
    "huynh",
    "vong",
    "tan",
    "tang",
    "thieu",
    "tieu",
    "ngoan",
    "ngan",
    "khuat",
    "trac",
    "ly",
    "tong",
    "ton",
    "han",
    "dao",
    "la",
    "luu",
    "dai",
    "ngoc",
    "nghi",
    "luong",
    "phu",
    "hau",
    "doan",
    "phat",
    "kieu",
    "thach",
    "thieu",
    "van",
    "du",
    "nhan",
    "ngan",
    "trung",
    "quan",
    "truong",
    "tuan",
    "tan",
    "ha",
    "vuong",
    "thuy",
    "vu",
    "pham",
    "dao",
    "bui",
    "trinh",
    "nguyen",
    "tran",

    // 🔹 Họ lai / sáng tạo / nickname phong cách
    "dom",
    "king",
    "pro",
    "vip",
    "bet",
    "boss",
    "rich",
    "win",
    "fast",
    "sky",
    "dark",
    "light",
    "fire",
    "storm",
    "ice",
    "lion",
    "wolf",
    "fox",
    "hawk",
    "moon",
    "sun",
    "star",
    "hero",
    "joker",
    "ghost",
    "zoro",
    "ace",
    "dragon",
    "ninja",
    "devil",
    "angel",
    "god",
    "lord",
    "beast",
    "master",
    "queen",
    "war",
    "hunter",
    "killer",
    "shadow",
    "nova",
    "storm",
    "flare",
    "blade",
    "flash",
    "rocket",
    "zero",
    "delta",
    "omega",
    "alpha",
    "cyber",
    "tech",
    "core",
    "max",
    "neo",
    "matrix",
    "prime",
    "fox",
    "storm",
    "rain",
    "wave",
    "galaxy",
    "zen",
    "glory",
    "spark",
    "lux",
    "flare",
    "bolt",
    "nova",
    "crash",
    "astro",
    "skull",
    "bone",
    "black",
    "white",
    "red",
    "blue",
    "iron",
    "stone",
    "steel",

    // 🔹 Một số họ hoặc tên quốc tế dùng tạo nick game
    "smith",
    "johnson",
    "brown",
    "miller",
    "jones",
    "davis",
    "garcia",
    "rodriguez",
    "wilson",
    "martin",
    "thomas",
    "anderson",
    "taylor",
    "jackson",
    "moore",
    "white",
    "lee",
    "walker",
    "hall",
    "allen",
    "young",
    "king",
    "wright",
    "scott",
    "green",
    "adams",
    "baker",
    "nelson",
    "carter",
    "mitchell",
  ];

  // Danh sách tên
  const firstNames = [
    "anh",
    "binh",
    "tuan",
    "long",
    "minh",
    "nam",
    "son",
    "hieu",
    "khoa",
    "kiet",
    "phuc",
    "tien",
    "quang",
    "manh",
    "huy",
    "duy",
    "khanh",
    "lam",
    "dat",
    "toan",
    "phong",
    "cuong",
    "trung",
    "vuong",
    "bao",
    "thanh",
    "trieu",
    "loc",
    "phat",
    "dung",
    "linh",
    "hoa",
    "ngoc",
    "trang",
    "thao",
    "yen",
    "my",
    "chi",
    "tam",
    "giang",
    "nga",
    "loan",
    "thuy",
    "thu",
    "hanh",
    "phuong",
    "huong",
    "mai",
    "dao",
    "lan",
  ];

  // Prefixes siêu đầy đủ — 300+ phong cách Việt, Tây, Game, Hài
  const prefixes = [
    // 🔹 Phổ biến / Việt hóa
    "vip",
    "pro",
    "dz",
    "hot",
    "hotboy",
    "hotgirl",
    "gaidep",
    "depzai",
    "anhhung",
    "soai",
    "trum",
    "idol",
    "fan",
    "boss",
    "meo",
    "cho",
    "heo",
    "ga",
    "vit",
    "chim",
    "tho",
    "nai",
    "trau",
    "bo",
    "cute",
    "kute",
    "tyty",
    "conan",
    "nobita",
    "doremon",
    "xuka",
    "chaien",
    "sieuboy",
    "siegirl",
    "ban",
    "anh",
    "chi",
    "em",
    "co",
    "chu",
    "ong",
    "ba",
    "cu",
    "be",
    "na",
    "nu",
    "ha",
    "ka",
    "mi",
    "su",
    "po",
    "zin",
    "zinzin",
    "miu",
    "ti",
    "kem",
    "tinh",
    "ngao",
    "de",
    "keo",

    // 🔹 Game / Anime / Trend
    "luffy",
    "zoro",
    "ace",
    "sanji",
    "nami",
    "robin",
    "naruto",
    "sasuke",
    "itachi",
    "madara",
    "goku",
    "vegeta",
    "trunks",
    "gohan",
    "pikachu",
    "ash",
    "raiden",
    "viper",
    "cyber",
    "zero",
    "nova",
    "zen",
    "rider",
    "flash",
    "thunder",
    "storm",
    "ice",
    "fire",
    "dark",
    "light",
    "shadow",
    "ghost",
    "demon",
    "angel",
    "hunter",
    "ninja",
    "samurai",
    "master",
    "lord",
    "king",
    "queen",
    "warrior",
    "soldier",
    "assassin",
    "hero",
    "villain",
    "wizard",
    "witch",
    "dragon",
    "phoenix",

    // 🔹 Vui nhộn / Hài hước
    "khoailang",
    "cuongbida",
    "anhthodethuong",
    "meodep",
    "buonngu",
    "anchoi",
    "soctai",
    "gaumeo",
    "bongbong",
    "cauvong",
    "xoan",
    "mup",
    "bubu",
    "kaka",
    "haha",
    "hehe",
    "mem",
    "bong",
    "ngo",
    "ngu",
    "ngau",
    "vohinh",
    "votinh",
    "cuongphong",
    "sieuquay",
    "bede",
    "xinhgai",
    "traiyeu",
    "banhbeo",
    "hoahong",
    "hoamai",
    "bongdem",
    "anhtrang",
    "mattrang",
    "mattri",
    "cavang",
    "songxanh",
    "bienca",
    "rungvang",
    "nongdan",
    "dochoi",
    "congchua",
    "hoangtu",
    "typhu",
    "cuopbien",
    "gialang",
    "langtu",
    "phuthuy",
    "hiepsi",
    "dauden",

    // 🔹 Quốc tế / hiện đại
    "sky",
    "moon",
    "sun",
    "star",
    "nova",
    "neo",
    "max",
    "storm",
    "bolt",
    "fox",
    "wolf",
    "lion",
    "hawk",
    "tiger",
    "bear",
    "snake",
    "dragon",
    "phoenix",
    "eagle",
    "falcon",
    "viper",
    "panther",
    "raven",
    "crow",
    "shark",
    "fish",
    "panda",
    "cat",
    "dog",
    "monkey",
    "ox",
    "horse",
    "pig",
    "sheep",
    "rat",
    "bee",
    "ant",
    "bat",
    "spider",
    "dino",

    // 🔹 Game nick-style
    "no1",
    "vippro",
    "vipboy",
    "vkgirl",
    "badboy",
    "goodgirl",
    "noob",
    "proboy",
    "top1",
    "godlike",
    "legend",
    "immortal",
    "heroic",
    "ruler",
    "nextgen",
    "leader",
    "chief",
    "captain",
    "commander",
    "champion",
    "destroyer",
    "killer",
    "sniper",
    "headshot",
    "gunner",
    "boom",
    "tank",
    "wizard",
    "mage",
    "healer",
    "rogue",
    "archer",
    "sorcerer",
    "giant",
    "bossman",
    "joker",
    "reaper",
    "darklord",
    "vampire",
    "zombie",

    // 🔹 Cảm xúc / cá tính
    "buon",
    "vui",
    "ngoan",
    "deu",
    "phieu",
    "tho",
    "romantic",
    "badboy",
    "goodboy",
    "chan",
    "lon",
    "nhoc",
    "lonxon",
    "la",
    "lang",
    "ngau",
    "doncoi",
    "damme",
    "cuongnhiet",
    "docthan",
    "yeudoi",
    "yeuem",
    "yeuanh",
    "yeudon",
    "phongtran",
    "phieuluu",
    "dichthuc",
    "cuocdoi",
    "vonga",
    "mongmo",

    // 🔹 Thêm prefix sáng tạo
    "dom",
    "bet",
    "sms",
    "vipbet",
    "nextgen",
    "kingdom",
    "godbet",
    "nextgen",
    "nextgen",
    "kingbet",
    "smsbet",
    "otpvip",
    "sv5",
    "svip",
    "tele",
    "tiktok",
    "youtube",
    "insta",
    "meta",
    "live",
    "game",
    "play",
    "auto",
    "fast",
    "speed",
    "quick",
    "smart",
    "safe",
    "proxy",
    "betpro",
    "coin",
    "crypto",
    "money",
    "cash",
    "rich",
    "don",
    "tron",
    "jack",
    "win",
    "luck",
    "lucky",
    "fortune",
    "prize",
    "bonus",
    "gift",
    "free",
    "spin",
    "roll",
    "betking",
    "xbet",

    // 🔹 Tên người / cá nhân hóa
    "mr",
    "mrs",
    "ms",
    "dr",
    "sir",
    "lady",
    "prince",
    "princess",
    "agent",
    "spy",
    "team",
    "group",
    "crew",
    "gang",
    "clan",
    "fam",
    "house",
    "zone",
    "nation",
    "empire",
    "vn",
    "viet",
    "asia",
    "indo",
    "thai",
    "korea",
    "japan",
    "china",
    "usa",
    "uk",

    // 🔹 Trend và hiện đại
    "dev",
    "ai",
    "tech",
    "coder",
    "hacker",
    "data",
    "server",
    "admin",
    "bot",
    "auto",
    "xpro",
    "xvip",
    "xhero",
    "xking",
    "xman",
    "xqueen",
    "xgirl",
    "xgod",
    "xmaster",
    "xdz",
    "super",
    "ultra",
    "mega",
    "hyper",
    "turbo",
    "maxx",
    "prime",
    "infinity",
    "extreme",
    "limitless",
  ];

  // Chọn kiểu: 70% ghép tên, 30% dùng prefix
  let base;
  if (Math.random() < 0.7) {
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    base = Math.random() < 0.5 ? last + first : first + last;
  } else {
    base = prefixes[Math.floor(Math.random() * prefixes.length)];
  }

  // Thêm số (2–4 chữ số)
  const num =
    Math.random() < 0.7
      ? Math.floor(80 + Math.random() * 25).toString() // 85–109
      : Math.floor(10 + Math.random() * 90).toString(); // 10–99

  let username = base + num;

  // Giới hạn max 12 ký tự
  if (username.length > 12) {
    username = username.substring(0, 12);
  }

  // Đảm bảo min 6 ký tự
  if (username.length < 6) {
    username += Math.floor(Math.random() * 90 + 10).toString();
  }

  return username;
}

// Demo
console.log(randomAccountName());
console.log(randomAccountName());
console.log(randomAccountName());

function randomPassword() {
  // Generate password with letters + digits only (no special chars)
  // Ensure at least one letter and one digit, length between 6 and 12
  const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  const all = letters + digits;
  const len = 6 + Math.floor(Math.random() * 7); // 6..12

  // Ensure at least one letter and one digit
  let pw = "";
  pw += letters[Math.floor(Math.random() * letters.length)];
  pw += digits[Math.floor(Math.random() * digits.length)];
  for (let i = 2; i < len; i++) {
    pw += all[Math.floor(Math.random() * all.length)];
  }
  // Shuffle to avoid predictable letter+digit at start
  pw = pw
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
  return pw;
}
function randomPhone() {
  // Đầu số phổ biến VN
  const prefixes = ["09", "03", "07", "08", "05"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  let num = "";
  for (let i = 0; i < 8; i++) num += Math.floor(Math.random() * 10);
  return prefix + num;
}
function randomEmail(name) {
  const domains = [
    "gmail.com",
    // "yahoo.com",
    // "outlook.com",
    // "icloud.com",
  ];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return (
    (name || randomName()).replace(/\s+/g, "").toLowerCase() +
    Math.floor(Math.random() * 1000) +
    "@" +
    domain
  );
}
function randomDate() {
  const y = 1995 + Math.floor(Math.random() * 8);
  const m = (1 + Math.floor(Math.random() * 12)).toString().padStart(2, "0");
  const d = (1 + Math.floor(Math.random() * 28)).toString().padStart(2, "0");
  // Định dạng ngẫu nhiên: yyyy/mm/dd hoặc dd/mm/yyyy hoặc yyyy-mm-dd
  const style = Math.random();
  if (style < 0.33) return `${y}/${m}/${d}`;
  if (style < 0.66) return `${y}/${m}/${d}`;
  return `${y}/${m}/${d}`;
}

function generate19Digits() {
  let digits = "";
  for (let i = 0; i < 19; i++) {
    // Ký tự đầu tiên không để số 0 (tránh bị mất số 0 khi xử lý)
    if (i === 0) {
      digits += Math.floor(Math.random() * 9) + 1;
    } else {
      digits += Math.floor(Math.random() * 10);
    }
  }
  return digits;
}

// Xử lý nút tạo dữ liệu
document.addEventListener("DOMContentLoaded", () => {
  // Xử lý tạo dữ liệu random
  const btn = document.getElementById("applyBulk_create");
  if (btn) {
    btn.addEventListener("click", () => {
      const nameBank =
        document.getElementById("user_name_bank_account").value.trim() ||
        randomName().toUpperCase();
      const idAccount =
        document.getElementById("id_account").value.trim() ||
        generate19Digits();
      const bankName =
        document.getElementById("bank_name").value.trim() || "MB";
      const tkName = randomName();
      const accountName = randomAccountName();
      const pass = randomPassword();
      const phone = randomPhone();
      const email = randomEmail(tkName);
      const date = randomDate();
      const bankBranch = randomBankBranch();
      // Đúng thứ tự:
      // HỌ và tên | stk |tên bank | chi nhánh | username | pass 1 | pass rút  | sđt | gmail | năm sinh
      const data = [
        nameBank, //Họ và tên
        idAccount, //Số tài khoản
        bankName, // Tên bank
        bankBranch, //Chi nhánh
        accountName, //username
        "A" + accountName, //pass 1
        "666888", // pass rút
        phone, //sđt
        email, //gmail
        date, //năm sinh
      ].join("|");
      document.getElementById("bulkInput_create_data").value = data;
      document.getElementById("bulkInput").value = data; // mirror to main textarea
    });
  }

  // Xử lý lưu dữ liệu vào localStorage
  const saveBtn = document.getElementById("save_value");

  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      try {
        // Gọi API check

        const data = true;
        if (data === true || data.success === true) {
          const val = document.getElementById("bulkInput_create_data").value;
          const userName = document
            .getElementById("user_name_bank_account")
            .value.trim();
          const idAccount = document.getElementById("id_account").value.trim();
          const bankName = document.getElementById("bank_name").value.trim();
          await chrome.storage.local.set({
            bulkInputCreateData: val,
            user_name_bank_account: userName,
            id_account: idAccount,
            bank_name: bankName,
          });

          chrome.storage.local.get(
            [
              "bulkInputCreateData",
              "user_name_bank_account",
              "id_account",
              "bank_name",
            ],
            (result) => {
              console.log("✅ Lưu thành công:", result);
            }
          );

          // Mirror dữ liệu vừa tạo sang bulkInput chính
          const mainBulk = document.getElementById("bulkInput");
          if (mainBulk) mainBulk.value = val;

          try {
            const res = await fetch(
              `https://save-data-tau.vercel.app/api/save/${USERNAME_TEAM}`,
              {
                method: "POST",
                mode: "cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data: val }),
              }
            );

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const result = await res.json();
            showNotification(
              "Đã lưu dữ liệu và gửi về server thành công!",
              "success"
            );
          } catch (error) {
            showNotification(
              "Từ chối lưu dữ liệu , vui lòng liên hệ @nextgen",
              "error"
            );
          }
        } else {
          showNotification(
            "Từ chối lưu dữ liệu , vui lòng liên hệ @nextgen",
            "error"
          );
        }
      } catch (err) {
        console.error("API check error:", err);
        showNotification("Có lỗi khi gọi API!", "error");
      }
    });
  }

  // Khi mở lại extension, tự động load dữ liệu random nếu có
  chrome.storage.local
    .get([
      "bulkInputCreateData",
      "user_name_bank_account",
      "id_account",
      "bank_name",
      "bankListMode",
    ])
    .then(async (saved) => {
      if (saved && saved.bulkInputCreateData) {
        document.getElementById("bulkInput_create_data").value =
          saved.bulkInputCreateData;
        const mainBulk = document.getElementById("bulkInput");
        if (mainBulk) mainBulk.value = saved.bulkInputCreateData;
      }
      if (saved && typeof saved.user_name_bank_account !== "undefined") {
        document.getElementById("user_name_bank_account").value =
          saved.user_name_bank_account || "";
      }
      if (saved && typeof saved.id_account !== "undefined") {
        document.getElementById("id_account").value = saved.id_account || "";
      }
      if (saved && typeof saved.bank_name !== "undefined") {
        document.getElementById("bank_name").value = saved.bank_name || "";
      }
      if (saved && typeof saved.bankListMode !== "undefined") {
        const mode = saved.bankListMode || "standard";
        const modeSelect = document.getElementById("bank_list_mode");
        if (modeSelect) modeSelect.value = mode;
        // repopulate select with that mode
        await populateBankSelect(mode);
      }
    });
});
let state = { domain: "", fields: [], fireEvents: true, autoSubmit: false };
let $fields, tpl;

document.addEventListener("DOMContentLoaded", init);

async function init() {
  $fields = document.getElementById("fields");
  tpl = document.getElementById("field-template");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  state.domain = getDomain(tab?.url || "");
  document.getElementById("domain").textContent = state.domain || "unknown";

  // Lấy data từ localStorage (chrome.storage.local) cho bulkInput
  const saved = await chrome.storage.local.get(["bulkInputData"]);
  if (saved && saved.bulkInputData) {
    document.getElementById("bulkInput").value = saved.bulkInputData;
  }

  // Load kết quả sequence từ localStorage
  const sequenceSaved = await chrome.storage.local.get(["sequenceResult"]);
  if (sequenceSaved && sequenceSaved.sequenceResult) {
    document.getElementById("result_sequence").textContent =
      sequenceSaved.sequenceResult;
  }

  await loadConfig();

  // Buttons
  const applyBulkBtn = document.getElementById("applyBulk");
  if (applyBulkBtn) applyBulkBtn.addEventListener("click", applyBulk);

  const inputPassRutBtn = document.getElementById("input_pass_rut");
  const inputLoginBtn = document.getElementById("input_login");

  const addBankAccount = document.getElementById("add_bank_account");
  if (addBankAccount) addBankAccount.addEventListener("click", applyThemBank);

  if (inputPassRutBtn)
    inputPassRutBtn.addEventListener("click", applyNhapPassRut);
  if (inputLoginBtn) inputLoginBtn.addEventListener("click", applyNhapDangNhap);

  // Dán clipboard vào textarea khi bấm nút Dán
  const pasteBtn = document.getElementById("pasteData");
  if (pasteBtn)
    pasteBtn.addEventListener("click", async () => {
      try {
        const text = await navigator.clipboard.readText();
        const input = document.getElementById("bulkInput");
        input.value = text;
        showNotification("Đã dán dữ liệu từ clipboard!", "success");
      } catch (e) {
        console.error(e);
        showNotification("Không thể đọc clipboard!", "error");
      }
    });

  // Lưu dữ liệu vào localStorage khi bấm nút
  const saveBtn = document.getElementById("saveData");

  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      try {
        // Gọi API check

        const data = true;
        // Nếu API trả về true thì lưu
        if (data === true || data.success === true) {
          const bi = document.getElementById("bulkInput");
          const val = bi ? bi.value : "";
          await chrome.storage.local.set({ bulkInputCreateData: val });
          showNotification("Đã lưu dữ liệu thành công rồi!", "success");
        } else {
          showNotification(
            "API từ chối lưu dữ liệu , liên hệ tele @nextgen !",
            "error"
          );
        }
      } catch (err) {
        console.error("API check error:", err);
        showNotification("Có lỗi khi gọi API!", "error");
      }
    });
  }

  const clearBtn = document.getElementById("clearValues");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      state.fields.forEach((f) => (f.value = ""));
    });
  }

  // Load external site list into the select box
  try {
    await loadSiteList();
  } catch (e) {
    // errors handled inside loadSiteList
  }
}

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

// CHỈNH SỬA LẠI HÀM loadSiteList ĐỂ GỌI HÀM runSequentialCreate MỚI
async function loadSiteList() {
  const container = document.querySelector(".list_website");
  if (!container) return;

  // Load saved selections
  const saved = await chrome.storage.local.get(["selectedSites"]);
  const savedSelections = saved.selectedSites || [];

  try {
    const res = await fetch(
      `${API_BASE}/${encodeURIComponent(USERNAME_TEAM)}`,
      {
        method: "GET",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status} - ${text}`);
    }
    const json = await res.json();
    const results = (json.data || []).map(({ name, link }) => ({ name, link }));

    if (results.length === 0) {
      document.getElementById("output").innerText =
        "Vui lòng liên hệ @nextgen để báo lỗi.";
    }

    // Build modern selector UI: search, select-all, card grid
    container.innerHTML = "";

    const controls = document.createElement("div");
    controls.className = "site-controls";

    const search = document.createElement("input");
    search.type = "search";
    search.placeholder = "Tìm website...";
    search.className = "site-search";
    controls.appendChild(search);

    const selectAllWrap = document.createElement("label");
    selectAllWrap.className = "select-all-wrap";
    const selectAll = document.createElement("input");
    selectAll.type = "checkbox";
    selectAll.className = "select-all";
    selectAll.checked = results.every((r) => savedSelections.includes(r.link));
    selectAllWrap.appendChild(selectAll);
    const selectAllText = document.createElement("span");
    selectAllText.textContent = "Chọn tất cả";
    selectAllWrap.appendChild(selectAllText);
    controls.appendChild(selectAllWrap);

    container.appendChild(controls);

    const grid = document.createElement("div");
    grid.className = "site-grid";

    // Thêm vào sau khi tạo grid
    grid.style.display = "flex";
    grid.style.flexWrap = "wrap";
    grid.style.gap = "1px";

    const style = document.createElement("style");
    style.textContent = `
  .site-card {
    display: inline-flex;
    align-items: center;
    margin: 1px 2px;
    cursor: pointer;
    font-size: 14px;
    white-space: nowrap;
    line-height: 1; /* giảm chiều cao dòng */
  }

  .site-card input[type="checkbox"] {
    margin: 0;         /* bỏ margin mặc định */
    padding: 0;        /* bỏ padding mặc định */
    width: 14px;       /* tùy chỉnh kích thước nhỏ hơn */
    height: 14px;
    transform: translateY(1px); /* kéo checkbox xuống sát chữ hơn */
  }
`;
    document.head.appendChild(style);

    results.forEach((s, idx) => {
      const id = `site_chk_${idx}`;
      const card = document.createElement("label");
      card.className = "site-card";
      card.style.display = "flex";
      card.style.flexDirection = "row";
      card.style.height = "fit-content";
      card.title = s.link;

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.name = "site";
      cb.value = s.link;
      cb.id = id;
      if (savedSelections.includes(s.link)) {
        cb.checked = true;
        card.classList.add("selected");
      }

      const flexBox = document.createElement("div");
      flexBox.style.display = "flex";
      flexBox.style.flexDirection = "column";
      flexBox.style.marginLeft = "8px";

      const nameEl = document.createElement("div");
      nameEl.className = "site-name";
      nameEl.textContent = s.name;

      const domainEl = document.createElement("div");
      domainEl.className = "site-domain";
      try {
        domainEl.textContent = new URL(s.noidung).hostname;
      } catch (e) {
        domainEl.textContent = s.noidung;
      }

      card.appendChild(cb);
      flexBox.appendChild(domainEl);
      flexBox.appendChild(nameEl);
      card.appendChild(flexBox);
      grid.appendChild(card);

      // toggle selected class when checkbox changes
      cb.addEventListener("change", async () => {
        card.classList.toggle("selected", cb.checked);
        const selected = Array.from(
          grid.querySelectorAll('input[name="site"]:checked')
        ).map((c) => c.value);
        await chrome.storage.local.set({ selectedSites: selected });
        // update selectAll
        selectAll.checked = results.length === selected.length;
      });
    });

    container.appendChild(grid);

    // Select all behavior
    selectAll.addEventListener("change", async () => {
      grid.querySelectorAll('input[name="site"]').forEach((cb) => {
        cb.checked = selectAll.checked;
        cb.dispatchEvent(new Event("change"));
      });
    });

    // Simple search/filter
    let searchTimeout = null;
    search.addEventListener("input", () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const q = search.value.trim().toLowerCase();
        grid.querySelectorAll(".site-card").forEach((card) => {
          const name = card
            .querySelector(".site-name")
            .textContent.toLowerCase();
          const d = card
            .querySelector(".site-domain")
            .textContent.toLowerCase();
          const match = !q || name.includes(q) || d.includes(q);
          card.style.display = match ? "flex" : "none";
        });
      }, 150);
    });

    // Tạo container chứa các nút/label
    const actions = document.createElement("div");
    actions.className = "site-actions";
    actions.style.marginTop = "8px";
    actions.style.display = "flex";
    actions.style.justifyContent = "center";
    actions.style.flexWrap = "wrap"; // xuống hàng nếu dài quá
    actions.style.gap = "4px"; // khoảng cách nhỏ giữa các phần tử
    actions.style.alignItems = "center";

    // Nút bắt đầu
    const runBtn = document.createElement("button");
    runBtn.type = "button";
    runBtn.className = "primary";
    runBtn.textContent = "Bắt đầu kiếm tiền cùng nextgen";
    runBtn.style.fontSize = "14px"; // chữ nhỏ gọn
    runBtn.style.padding = "4px 8px"; // nút gọn lại
    runBtn.addEventListener("click", async () => {
      const vals = Array.from(
        grid.querySelectorAll('input[name="site"]:checked')
      ).map((c) => c.value);
      if (vals.length === 0)
        return showNotification("Chưa chọn website nào", "error");
      await runSequentialCreate(vals);
    });

    actions.appendChild(runBtn);
    container.appendChild(actions);
  } catch (err) {
    document.getElementById("output").innerText = "Lỗi: " + err.message;
    showNotification("Lỗi khi tải danh sách website: " + err.message, "error");
  }
}

function checkXPathExists(xpath) {
  const result = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  );
  return result.singleNodeValue !== null;
}

// HÀM CHÍNH CẦN CHẠY NGẦM - ĐƯỢC CHUYỂN QUA BACKGROUND SCRIPT
// popup.js sẽ chỉ gửi yêu cầu để background script thực hiện
async function runSequentialCreate(urls) {
  if (urls.length === 0) {
    showNotification("Chưa chọn website nào để chạy tự động!", "error");
    return;
  }

  // Reset kết quả sequence
  const resultSpan = document.getElementById("result_sequence");
  if (resultSpan) {
    resultSpan.textContent = "...";
  }
  // Xóa khỏi localStorage
  await chrome.storage.local.remove(["sequenceResult"]);

  // Show initial progress
  showProgress(0, urls.length, "Starting automation...");

  showNotification("Bắt đầu Automation", "success");
  const runBtn = document.querySelector(".site-list + div button"); // Lấy lại nút "Auto Action"
  if (runBtn) {
    runBtn.disabled = true;
    runBtn.textContent = "Đang chạy...";
  }

  try {
    const response = await chrome.runtime.sendMessage({
      action: "runSequentialCreateInBackground",
      urls: urls,
    });
    // Xử lý phản hồi từ background script
    if (response.success) {
      showNotification(response.message, "success");
      hideProgress();
    } else {
      showNotification(response.message, "error");
      hideProgress();
      console.error("Lỗi từ background script:", response.error);
    }
  } catch (error) {
    console.error("Lỗi khi gửi yêu cầu đến background:", error);
    // showNotification(
    //   "Lỗi khi bắt đầu tác vụ tự động: " + error.message,
    //   "error"
    // );
    hideProgress();
  } finally {
    if (runBtn) {
      runBtn.disabled = false;
      runBtn.textContent = "Auto Action";
    }
  }
}

function checkXpathExist(xpathInput) {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0) {
        resolve(false);
        return;
      }

      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: (xpath) => {
            try {
              const node = document.evaluate(
                xpath,
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
              ).singleNodeValue;
              return !!node;
            } catch (error) {
              console.error("XPath evaluation error:", error);
              return false;
            }
          },
          args: [xpathInput],
        },
        (results) => {
          // Kiểm tra lỗi Chrome runtime
          if (chrome.runtime.lastError) {
            console.error("Chrome runtime error:", chrome.runtime.lastError);
            resolve(false);
            return;
          }

          // Kiểm tra kết quả đúng cách
          if (
            results &&
            results.length > 0 &&
            results[0].result !== undefined
          ) {
            resolve(results[0].result); // ← Đây là điểm quan trọng
          } else {
            resolve(false);
          }
        }
      );
    });
  });
}

// Hàm redirectToRutTienPage (trong popup)
async function redirectToRutTienPage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    showNotification("Không tìm thấy tab hiện tại!", "error");
    return;
  }
  try {
    const target = tab.url
      ? new URL("/Account/ChangeMoneyPassword", tab.url).href
      : "/Account/ChangeMoneyPassword";
    await chrome.tabs.update(tab.id, { url: target });
    showNotification("Chuyển tới /Account/ChangeMoneyPassword", "success");
  } catch (e) {
    console.error(e);
    showNotification("Không thể chuyển trang tới ChangeMoneyPassword", "error");
  }
}

// Hàm redirectToAddBankPage (trong popup)
async function redirectToAddBankPage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    showNotification("Không tìm thấy tab hiện tại!", "error");
    return;
  }
  try {
    const target = tab.url
      ? new URL("/Financial?type=withdraw", tab.url).href
      : "/Financial?type=withdraw";
    await chrome.tabs.update(tab.id, { url: target });
    showNotification("Chuyển tới /Financial?type=withdraw", "success");
  } catch (e) {
    console.error(e);
    showNotification(
      "Không thể chuyển trang tới trang thêm ngân hàng",
      "error"
    );
  }
}

function typeText(element, text) {
  return new Promise((resolve) => {
    if (!element) {
      resolve();
      return;
    }
    element.value = "";
    let index = 0;

    function inputChar() {
      if (index < text.length) {
        element.value += text[index];
        element.dispatchEvent(new Event("input", { bubbles: true }));
        index++;
        setTimeout(inputChar, 30);
      } else {
        resolve(); // Hoàn thành nhập trường này, tiếp tục trường tiếp theo
      }
    }

    inputChar();
  });
}

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function waitForTabComplete(tabId, timeout = 15000) {
  return new Promise((resolve, reject) => {
    let finished = false;
    const onUpdated = (id, change) => {
      if (id === tabId && change.status === "complete") {
        finished = true;
        chrome.tabs.onUpdated.removeListener(onUpdated);
        resolve();
      }
    };
    chrome.tabs.onUpdated.addListener(onUpdated);
    // timeout
    setTimeout(() => {
      if (!finished) {
        chrome.tabs.onUpdated.removeListener(onUpdated);
        // resolve anyway to attempt best-effort
        resolve();
      }
    }, timeout);
  });
}

async function sendBulkToTab(tabId) {
  // replicate applyBulk's parts extraction and xpaths mapping
  const bi = document.getElementById("bulkInput");
  const raw = bi ? bi.value : "";
  const parts = raw
    .split("|")
    .slice(4)
    .map((s) => (s || "").trim());
  // minimal guard
  if (!parts || parts.length === 0 || parts[0] === "") {
    throw new Error("No bulk data to send");
  }

  const xpaths = [
    "/html[1]/body[1]/div[1]/div[1]/div[1]/gupw-register[1]/div[1]/div[1]/gupw-register-form[1]/div[1]/form[1]/fieldset[1]/div[1]/div[1]/input[1]",
    "/html[1]/body[1]/div[1]/div[1]/div[1]/gupw-register[1]/div[1]/div[1]/gupw-register-form[1]/div[1]/form[1]/fieldset[1]/div[2]/div[1]/div[2]/input[1]",
    "/html[1]/body[1]/div[1]/div[1]/div[1]/gupw-register[1]/div[1]/div[1]/gupw-register-form[1]/div[1]/form[1]/fieldset[1]/div[3]/div[1]/div[2]/input[1]",
    "/html[1]/body[1]/div[1]/div[1]/div[1]/gupw-register[1]/div[1]/div[1]/gupw-register-form[1]/div[1]/form[1]/fieldset[1]/div[4]/div[1]/input[1]",
    "/html[1]/body[1]/div[1]/div[1]/div[1]/gupw-register[1]/div[1]/div[1]/gupw-register-form[1]/div[1]/form[1]/fieldset[1]/div[5]/div[1]/input[1]",
    "/html[1]/body[1]/div[1]/div[1]/div[1]/gupw-register[1]/div[1]/div[1]/gupw-register-form[1]/div[1]/form[1]/fieldset[1]/div[6]/div[1]/input[1]",
  ];
  const xpathsMobile = [
    "/html[1]/body[1]/app-root[1]/app-register[1]/div[1]/form[1]/fieldset[1]/div[1]/section[1]/input[1]",
    // "/html[1]/body[1]/app-root[1]/app-switch[1]/div[1]/section[2]/div[1]/app-register[1]/form[1]/fieldset[1]/div[1]/input[1]",
    "/html[1]/body[1]/app-root[1]/app-switch[1]/div[1]/section[2]/div[1]/app-register[1]/form[1]/fieldset[1]/div[2]/div[1]/input[1]",
    "/html[1]/body[1]/app-root[1]/app-switch[1]/div[1]/section[2]/div[1]/app-register[1]/form[1]/fieldset[1]/div[3]/div[1]/input[1]",
    "/html[1]/body[1]/app-root[1]/app-switch[1]/div[1]/section[2]/div[1]/app-register[1]/form[1]/fieldset[2]/div[1]/input[1]",
    "/html[1]/body[1]/app-root[1]/app-switch[1]/div[1]/section[2]/div[1]/app-register[1]/form[1]/fieldset[2]/div[2]/div[1]/input[1]",
    "/html[1]/body[1]/app-root[1]/app-switch[1]/div[1]/section[2]/div[1]/app-register[1]/form[1]/fieldset[2]/div[3]/input[1]",
  ];

  // send desktop mapping
  await chrome.tabs.sendMessage(tabId, {
    action: "fillFormAdvanced",
    payload: {
      fields: xpaths.map((xpath, i) => ({ xpath, value: parts[i] || "" })),
      autoSubmit: false,
      fireEvents: true,
    },
  });

  // send mobile mapping
  await chrome.tabs.sendMessage(tabId, {
    action: "fillFormAdvanced",
    payload: {
      fields: xpathsMobile.map((xpath, i) => ({
        xpath,
        value: parts[i] || "",
      })),
      autoSubmit: false,
      fireEvents: true,
    },
  });
}

async function loadConfig() {
  const all = await chrome.storage.local.get(["smartAutofillPro"]);
  const store = all.smartAutofillPro || {};
  const cfg = store[state.domain] || {
    fields: [],
    fireEvents: true,
    autoSubmit: false,
  };
  state.fields = Array.isArray(cfg.fields) ? cfg.fields : [];
  state.fireEvents = cfg.fireEvents !== false;
  state.autoSubmit = !!cfg.autoSubmit;
  // Chỉ set lại textarea nếu có dữ liệu bulk
  if (cfg.bulk && cfg.bulk.trim() !== "") {
    document.getElementById("bulkInput").value = cfg.bulk;
  }
}

async function solveCaptchaCommon() {
  try {
    showNotification(`Bắt đầu giải captcha`, "success");

    // 2. Truyền apikey vào nội dung trang đang mở
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        args: [APIKEY_CAPCHA],
        func: async (APIKEY_CAPCHA) => {
          const solveCaptcha = async (base64) => {
            try {
              const response = await fetch(
                "https://anticaptcha.top/api/captcha",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    apikey: apikey,
                    type: 14,
                    img: base64,
                  }),
                }
              );
              const result = await response.json();
              if (result.success && result.captcha) {
                return result.captcha;
              } else {
                alert(
                  "❌ Giải mã thất bại: " +
                    (result.message || "Không rõ lỗi") +
                    "\n\n🔑 Liên hệ @nextgen để setup."
                );
                return null;
              }
            } catch (err) {
              console.log(err);
              return null;
            }
          };

          let input = null;
          for (let i = 0; i < 10; i++) {
            input =
              document.querySelector('input[formcontrolname="checkCode"]') ||
              document.querySelector('input[ng-model="$ctrl.code"]') ||
              document.querySelector('//input[@name="identifying"]');

            if (input) break;
            await new Promise((r) => setTimeout(r, 300));
          }
          if (!input) return alert("❌ Không tìm thấy input 'checkCode'");

          // set value chuẩn
          const setNativeValue = (el, value) => {
            const valueSetter = Object.getOwnPropertyDescriptor(
              el.__proto__,
              "value"
            ).set;
            valueSetter.call(el, value);
            el.dispatchEvent(new Event("input", { bubbles: true }));
            el.dispatchEvent(new Event("change", { bubbles: true }));
          };

          // chờ captcha image
          let img = null;
          for (let i = 0; i < 10; i++) {
            img = document.querySelector('img[src^="data:image"]');
            if (img) break;
            await new Promise((r) => setTimeout(r, 300));
          }
          if (!img) return alert("❌ Không tìm thấy ảnh captcha");

          const base64 = img.src.split(",")[1];
          const result = await solveCaptcha(base64);
          if (!result) return;

          setNativeValue(input, result);

          input.value = "";
          input.dispatchEvent(new Event("input", { bubbles: true }));
          await new Promise((r) => setTimeout(r, 300));

          input.value = result;
          input.dispatchEvent(new Event("input", { bubbles: true }));
          await deplay(3000);
        },
      });
    });
  } catch (err) {
    alert("❌ Lỗi khi lấy dữ liệu JSON" + err);
    showNotification(`Lỗi giải captcha` + err);
    console.error(err);
  }
}

// Thay đổi event listener cho nút "solveCaptcha" để gửi message tới background
document.getElementById("solveCaptcha").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    showNotification("Không tìm thấy tab hiện tại!", "error");
    return;
  }
  showNotification("Đang gửi yêu cầu giải captcha...", "info");
  try {
    const response = await chrome.runtime.sendMessage({
      action: "solveCaptchaInBackground",
      tabId: tab.id,
    });
    if (response?.success) {
      // showNotification(
      //   "Đã gửi yêu cầu giải captcha đến background.",
      //   "success"
      // );
    } else {
      showNotification(
        "Lỗi khi yêu cầu giải captcha: " + (response.message || "Không rõ lỗi"),
        "error"
      );
    }
  } catch (error) {
    console.error("Lỗi khi gửi yêu cầu giải captcha đến background:", error);
    showNotification("Lỗi hệ thống khi gửi yêu cầu giải captcha.", "error");
  }
});

async function saveConfigByName() {
  syncFromUI();
  const name = document.getElementById("configNameInput").value.trim();
  if (!name) {
    showNotification("Vui lòng nhập tên cấu hình!", "error");
    return;
  }
  const all = await chrome.storage.local.get(["smartAutofillProNamed"]);
  const store = all.smartAutofillProNamed || {};
  store[name] = {
    fields: state.fields,
    fireEvents: state.fireEvents,
    autoSubmit: state.autoSubmit,
    bulk: document.getElementById("bulkInput").value,
  };
  await chrome.storage.local.set({ smartAutofillProNamed: store });
  showNotification("Đã lưu cấu hình với tên: " + name, "success");
}

async function loadConfigByName() {
  const select = document.getElementById("namedConfigsList");
  const name = select.value;
  if (!name) {
    showNotification("Chưa chọn cấu hình nào!", "error");
    return;
  }
  const all = await chrome.storage.local.get(["smartAutofillProNamed"]);
  const store = all.smartAutofillProNamed || {};
  const cfg = store[name];
  if (!cfg) {
    showNotification("Không tìm thấy cấu hình này!", "error");
    return;
  }
  state.fields = Array.isArray(cfg.fields) ? cfg.fields : [];
  state.fireEvents = cfg.fireEvents !== false;
  state.autoSubmit = !!cfg.autoSubmit;
  document.getElementById("bulkInput").value = cfg.bulk || "";
  showNotification("Đã áp dụng cấu hình: " + name, "success");
}

async function deleteConfigByName() {
  const select = document.getElementById("namedConfigsList");
  const name = select.value;
  if (!name) {
    showNotification("Chưa chọn cấu hình nào!", "error");
    return;
  }
  const all = await chrome.storage.local.get(["smartAutofillProNamed"]);
  const store = all.smartAutofillProNamed || {};
  if (store[name]) {
    delete store[name];
    await chrome.storage.local.set({ smartAutofillProNamed: store });
    showNotification("Đã xóa cấu hình: " + name, "success");
  }
}

async function saveConfig() {
  syncFromUI();
  const all = await chrome.storage.local.get(["smartAutofillPro"]);
  const store = all.smartAutofillPro || {};
  store[state.domain] = {
    fields: state.fields,
    fireEvents: state.fireEvents,
    autoSubmit: state.autoSubmit,
    bulk: document.getElementById("bulkInput").value,
  };
  await chrome.storage.local.set({ smartAutofillPro: store });
  showNotification("Đã lưu cấu hình cho " + state.domain, "success");
}

async function deleteConfig() {
  const all = await chrome.storage.local.get(["smartAutofillPro"]);
  const store = all.smartAutofillPro || {};
  delete store[state.domain];
  await chrome.storage.local.set({ smartAutofillPro: store });
  showNotification("Đã xóa cấu hình domain này.", "success");
}

function exportConfig() {
  syncFromUI();
  const cfg = {
    domain: state.domain,
    fields: state.fields,
    fireEvents: state.fireEvents,
    autoSubmit: state.autoSubmit,
    bulk: document.getElementById("bulkInput").value,
  };
  const blob = new Blob([JSON.stringify(cfg, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${state.domain || "config"}_autofill.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importConfig(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (ev) => {
    try {
      const cfg = JSON.parse(ev.target.result);
      state.fields = cfg.fields || [];
      state.fireEvents = cfg.fireEvents !== false;
      state.autoSubmit = !!cfg.autoSubmit;
      document.getElementById("bulkInput").value = cfg.bulk || "";
      await saveConfig();
      showNotification(
        "Đã import config & lưu cho domain hiện tại.",
        "success"
      );
    } catch {
      showNotification("File JSON không hợp lệ.", "error");
    }
  };
  reader.readAsText(file);
}

function showNotification(message, type = "info", fromBackground = false) {
  // Nếu thông báo không phải từ background và extension đang hoạt động (có chrome.runtime.id)
  // thì gửi tin nhắn này lên background để background hiển thị thông báo hệ thống
  if (!fromBackground && chrome.runtime?.id) {
    chrome.runtime.sendMessage({
      action: "showNotification",
      title: "Smart Autofill Pro",
      message: message,
      type: type,
    });
  }

  // Logic hiển thị thông báo trực tiếp trên popup
  const existing = document.querySelectorAll(".notification");
  existing.forEach((n) => n.remove());

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Notification sẽ hiển thị liên tục cho đến khi có message mới thay thế
}

function toast(s, fromBackground = false) {
  console.log("[Smart Autofill Pro - Popup]", s);
  showNotification(s, "info", fromBackground);
}

// Lắng nghe các tin nhắn từ background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "showNotification") {
    // Hiển thị thông báo nhận được từ background trên popup
    showNotification(message.message, message.type, true); // true = từ background
    sendResponse({ success: true });
  } else if (message.action === "triggerDownloadFromPopup") {
    // Kích hoạt tải xuống dữ liệu đã được background chuẩn bị
    downloadAccountFromBackgroundData();
    sendResponse({ success: true });
  } else if (message.action === "updateSequenceResult") {
    // Cập nhật kết quả sequence
    const resultSpan = document.getElementById("result_sequence");
    if (resultSpan) {
      resultSpan.textContent = message.message;
    }
    sendResponse({ success: true });
  } else if (message.action === "updateProgress") {
    // Cập nhật progress từ background
    updateProgress(message.current, message.total, message.step);
    sendResponse({ success: true });
  } else if (message.action === "hideProgress") {
    // Ẩn progress bar
    hideProgress();
    sendResponse({ success: true });
  }
  // Các loại tin nhắn khác từ background có thể được thêm vào đây
});

// Hàm mới để tải dữ liệu đã được chuẩn bị bởi background script
async function downloadAccountFromBackgroundData() {
  const saved = await chrome.storage.local.get(["finalAccountsToDownload"]);
  const content = (saved && saved.finalAccountsToDownload) || "";
  if (!content) {
    showNotification("Không có dữ liệu để tải từ background!", "error");
    return;
  }

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "accounts.txt";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    chrome.storage.local.remove("finalAccountsToDownload"); // Xóa dữ liệu sau khi tải
  }, 100);
  showNotification("Đã tải dữ liệu thành công từ background!", "success");
}

function swap(a, i, j) {
  const t = a[i];
  a[i] = a[j];
  a[j] = t;
}

function syncFromUI() {
  // values already bound in listeners; nothing else to do
}

function getDataObject(dataInput) {
  return {
    nameBank: dataInput[0].trim(),
    idAccount: dataInput[1].trim(),
    bankName: dataInput[2].trim(),
    bankBranch: dataInput[3].trim(),
    accountName: dataInput[4].trim(),
    pass_1: dataInput[5].trim(),
    pass_rut: dataInput[6].trim(),
    phone: dataInput[7].trim(),
    email: dataInput[8].trim(),
    date: dataInput[9].trim(),
  };
}

// --- Custom applyBulk: điền data vào đúng xpath user chỉ định ---
async function applyBulk(tabId, dataInput) {
  showNotification("Đang điền thông tin đăng ký", "success");
  const xpaths = [
    "/html[1]/body[1]/div[1]/div[1]/div[1]/gupw-register[1]/div[1]/div[1]/gupw-register-form[1]/div[1]/form[1]/fieldset[1]/div[1]/div[1]/input[1]",
    "/html[1]/body[1]/div[1]/div[1]/div[1]/gupw-register[1]/div[1]/div[1]/gupw-register-form[1]/div[1]/form[1]/fieldset[1]/div[2]/div[1]/div[2]/input[1]",
    "/html[1]/body[1]/div[1]/div[1]/div[1]/gupw-register[1]/div[1]/div[1]/gupw-register-form[1]/div[1]/form[1]/fieldset[1]/div[3]/div[1]/div[2]/input[1]",
    "/html[1]/body[1]/div[1]/div[1]/div[1]/gupw-register[1]/div[1]/div[1]/gupw-register-form[1]/div[1]/form[1]/fieldset[1]/div[4]/div[1]/input[1]",
    "/html[1]/body[1]/div[1]/div[1]/div[1]/gupw-register[1]/div[1]/div[1]/gupw-register-form[1]/div[1]/form[1]/fieldset[1]/div[5]/div[1]/input[1]",
    "/html[1]/body[1]/div[1]/div[1]/div[1]/gupw-register[1]/div[1]/div[1]/gupw-register-form[1]/div[1]/form[1]/fieldset[1]/div[6]/div[1]/input[1]",
  ];

  const xpathsMobile = [
    "//input[@formcontrolname='account']",
    "//input[@formcontrolname='password']",
    "//input[@formcontrolname='confirmPassword']",
    "//input[@formcontrolname='moneyPassword']",
    "//input[@formcontrolname='name']",
    "//input[@formcontrolname='mobile']",
    "//input[@formcontrolname='birthday']",
    "//input[@formcontrolname='email']",
  ];

  const xpathsMobile_RR88 = [
    "//input[@name='username']",
    "//input[@name='password']",
    "//input[@name='confimpsw']",
    "//input[@name='payeeName']",
    "//input[@name='mobileNum1']",
    "//input[@name='email']",
  ];

  const dataGet = getDataObject(dataInput);

  const arrayDataFill = [
    dataGet.accountName,
    dataGet.pass_1,
    dataGet.pass_1,
    dataGet.pass_rut,
    dataGet.nameBank,
    dataGet.phone,
    dataGet.date,
    dataGet.email,
  ];

  if (Object.values(dataGet).some((value) => value === "")) {
    showNotification("Vui lòng nhập dữ liệu để áp dụng!", "error");
    return;
  }

  await delay(2000); // Thêm delay trong popup trước khi gửi tin nhắn

  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab?.id) {
      showNotification("Không tìm thấy tab hiện tại!", "error");
      return;
    }
    chrome.tabs.sendMessage(tab.id, {
      action: "fillFormAdvanced",
      payload: {
        fields: xpaths.map((xpath, i) => ({
          xpath,
          value: arrayDataFill[i] || "",
        })),
        autoSubmit: false,
        fireEvents: true,
      },
    });

    // Send mobile mapping
    chrome.tabs.sendMessage(tabId, {
      action: "fillFormAdvanced",
      payload: {
        fields: xpathsMobile.map((xpath, i) => ({
          xpath,
          value: arrayDataFill[i] || "",
        })),
        autoSubmit: false,
        fireEvents: true,
      },
    });

    // Send mobile mapping for R88 Page
    chrome.tabs.sendMessage(tabId, {
      action: "fillFormAdvanced",
      payload: {
        fields: xpathsMobile_RR88.map((xpath, i) => ({
          xpath,
          value: arrayDataFill_RR88[i] || "",
        })),
        autoSubmit: false,
        fireEvents: true,
      },
    });

    showNotification(
      `Đã gửi ${arrayDataFill.length} giá trị tới trang web!`,
      "success"
    );
  });
}

// --- Custom applyBulk: điền data vào đúng xpath user chỉ định ---
function applyNhapPassRut() {
  const xpaths = [
    "/html[1]/body[1]/div[1]/ui-view[1]/gupw-app[1]/ui-view[1]/gupw-sample-layout[1]/div[2]/div[1]/ui-view[1]/gupw-member-center-layout[1]/div[1]/div[1]/div[2]/ui-view[1]/gupw-change-money-password[1]/div[1]/div[2]/div[1]/div[1]/section[1]/form[1]/div[1]/div[1]/div[1]/input[1]",
    "/html[1]/body[1]/div[1]/ui-view[1]/gupw-app[1]/ui-view[1]/gupw-sample-layout[1]/div[2]/div[1]/ui-view[1]/gupw-member-center-layout[1]/div[1]/div[1]/div[2]/ui-view[1]/gupw-change-money-password[1]/div[1]/div[2]/div[1]/div[1]/section[1]/form[1]/div[2]/div[1]/div[1]/input[1]",
  ];

  const xpathsMobile = [
    "//input[@formcontrolname='oldPassword']",
    "//input[@formcontrolname='newPassword']",
    "//input[@formcontrolname='confirm']",
  ];

  const bulkInputVal = document.getElementById("bulkInput").value;
  const dataGet = getDataObject(bulkInputVal.split("|"));

  if (Object.values(dataGet).some((value) => value === "")) {
    showNotification("Vui lòng nhập dữ liệu để áp dụng!", "error");
    return;
  }

  const newPassword = dataGet.pass_rut;
  const passwordArray = [dataGet.pass_1, newPassword, newPassword];

  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab?.id) {
      showNotification("Không tìm thấy tab hiện tại!", "error");
      return;
    }
    chrome.tabs.sendMessage(tab.id, {
      action: "fillFormAdvanced",
      payload: {
        fields: xpaths.map((xpath, i) => ({
          xpath,
          value: passwordArray[i] || "",
        })),
        autoSubmit: false,
        fireEvents: true,
      },
    });

    chrome.tabs.sendMessage(tab.id, {
      action: "fillFormAdvanced",
      payload: {
        fields: xpathsMobile.map((xpath, i) => ({
          xpath,
          value: passwordArray[i] || "",
        })),
        autoSubmit: false,
        fireEvents: true,
      },
    });

    showNotification(
      `Đã gửi ${passwordArray.length} giá trị tới trang web!`,
      "success"
    );
  });
}

// --- Function: Nhập Tài khoản & Mật khẩu vào form đăng nhập ---
function applyNhapDangNhap() {
  const xpathsDesktop = [
    "//input[@formcontrolname='account']",
    "//input[@formcontrolname='password']",
  ];

  const xpathsMobile = [
    "//input[@formcontrolname='account']",
    "//input[@formcontrolname='password']",
  ];

  const bulkInputVal = document.getElementById("bulkInput").value;
  const dataGet = getDataObject(bulkInputVal.split("|"));

  if (!dataGet.accountName || !dataGet.pass_1) {
    showNotification("⚠️ Thiếu tài khoản hoặc mật khẩu!", "error");
    return;
  }

  const loginData = [dataGet.accountName, dataGet.pass_1];

  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab?.id) {
      showNotification("❌ Không tìm thấy tab hiện tại!", "error");
      return;
    }

    // Gửi dữ liệu cho phiên bản Desktop
    chrome.tabs.sendMessage(tab.id, {
      action: "fillFormAdvanced",
      payload: {
        fields: xpathsDesktop.map((xpath, i) => ({
          xpath,
          value: loginData[i] || "",
        })),
        autoSubmit: false,
        fireEvents: true,
      },
    });

    // Gửi dữ liệu cho phiên bản Mobile
    chrome.tabs.sendMessage(tab.id, {
      action: "fillFormAdvanced",
      payload: {
        fields: xpathsMobile.map((xpath, i) => ({
          xpath,
          value: loginData[i] || "",
        })),
        autoSubmit: false,
        fireEvents: true,
      },
    });

    showNotification("✅ Đã nhập Tài khoản và Mật khẩu!", "success");
  });
}

// applyThemBank (trong popup)
function applyThemBank() {
  const xpathsMobile = [
    "//input[@formcontrolname='city']",
    "//input[@formcontrolname='account']",
  ];

  const bulkInputVal = document.getElementById("bulkInput").value;
  const dataGet = getDataObject(bulkInputVal.split("|"));

  const nameBank = dataGet.bankName;
  const branchBank = dataGet.bankBranch;
  const idAccount = dataGet.idAccount;

  if (Object.values(dataGet).some((value) => value === "")) {
    showNotification("Vui lòng nhập dữ liệu để áp dụng!", "error");
    return;
  }

  const newArrayPath = [branchBank, idAccount];

  chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
    if (!tab?.id) {
      showNotification("Không tìm thấy tab hiện tại!", "error");
      return;
    }
    //Đầu tiên là nhấp vào select
    await chrome.tabs.sendMessage(tab.id, {
      action: "clickXPath",
      xpath: `//mat-select[@formcontrolname='bankName']`,
    });

    //Nhấp vào input
    await chrome.tabs.sendMessage(tab.id, {
      action: "clickXPath",
      xpath: `//input[@formcontrolname="filter"]`,
    });

    await delay(500);

    // Điền tên ngân hàng vào ô filter
    await chrome.tabs.sendMessage(tab.id, {
      action: "fillFormAdvanced",
      payload: {
        fields: [
          {
            xpath: "//input[@formcontrolname='filter']",
            value: nameBank.trim(),
          },
        ],
        autoSubmit: false,
        fireEvents: true,
      },
    });

    await delay(1000);

    // Click vào option có text chứa nameBank
    await chrome.tabs.sendMessage(tab.id, {
      action: "clickXPath",
      xpath: `//span[contains(text(),"${nameBank.trim()}")]`,
    });

    await delay(2000);
    await chrome.tabs.sendMessage(tab.id, {
      action: "fillFormAdvanced",
      payload: {
        fields: xpathsMobile.map((xpath, i) => ({
          xpath,
          value: newArrayPath[i] || "",
        })),
        autoSubmit: false,
        fireEvents: true,
      },
    });

    showNotification(
      `Đã gửi ${newArrayPath.length} giá trị tới trang web!`,
      "success"
    );
  });
}

async function scanPage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  showNotification("Đang quét trang...", "info");
  try {
    await chrome.tabs.sendMessage(tab.id, { action: "scanPage" });
  } catch (e) {
    showNotification(
      "Không thể kết nối content script!\nHãy đảm bảo đã mở trang web hợp lệ.",
      "error"
    );
  }
}

async function highlight(xp) {
  if (!xp?.trim()) return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  try {
    await chrome.tabs.sendMessage(tab.id, {
      action: "highlightXPath",
      xpath: xp,
    });
  } catch (e) {
    showNotification(
      "Không thể kết nối content script!\nHãy đảm bảo đã mở trang web hợp lệ.",
      "error"
    );
  }
}

// Tab switching with persistence
const TAB_STORAGE_KEY = "popupActiveTab";
function setActiveTab(tabName) {
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) =>
      b.classList.toggle("active", b.getAttribute("data-tab") === tabName)
    );
  document.querySelectorAll(".tab-content").forEach((tab) => {
    if (tab.classList.contains(tabName)) {
      tab.classList.add("active");
      tab.style.display = "";
    } else {
      tab.classList.remove("active");
      tab.style.display = "none";
    }
  });
}

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    const tabName = this.getAttribute("data-tab");
    setActiveTab(tabName);
    try {
      localStorage.setItem(TAB_STORAGE_KEY, tabName);
    } catch (e) {}
  });
});

// Restore previously active tab (if any)
try {
  const saved = localStorage.getItem(TAB_STORAGE_KEY);
  if (saved) setActiveTab(saved);
  else {
    // ensure at least one tab is shown (fallback to first)
    const first = document.querySelector(".tab-btn[data-tab]");
    if (first) setActiveTab(first.getAttribute("data-tab"));
  }
} catch (e) {}

// Light/Dark mode toggle (guarded)
const modeBtn = document.getElementById("toggleModeBtn");
function setMode(light) {
  document.body.classList.toggle("light", light);
  if (modeBtn) modeBtn.textContent = light ? "☀️" : "🌙";
}
// Lưu trạng thái vào localStorage (only if control exists)
if (modeBtn) {
  modeBtn.addEventListener("click", function () {
    const isLight = !document.body.classList.contains("light");
    setMode(isLight);
    try {
      localStorage.setItem("popupMode", isLight ? "light" : "dark");
    } catch (e) {}
  });
}
// Khởi động: lấy trạng thái từ localStorage
(function () {
  try {
    const saved = localStorage.getItem("popupMode");
    setMode(saved === "light");
  } catch (e) {
    // ignore
  }
})();

//xóa lịch sử & cookies 7 ngày gần nhất
document.getElementById("clear").addEventListener("click", () => {
  // Tính thời gian 7 ngày trước (milliseconds)
  const sevenDaysAgo = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;

  chrome.browsingData.remove(
    {
      since: sevenDaysAgo,
    },
    {
      history: true,
      cookies: true,
    },
    () => {
      document.getElementById("status").textContent =
        "✅ Đã xóa lịch sử & cookies 7 ngày gần nhất!";
    }
  );
});

// chuyển đến tắt pass
document.getElementById("toggle").addEventListener("click", () => {
  chrome.tabs.create({ url: "chrome://password-manager/settings" });
});

//đóng tất cả tab trống
document.getElementById("closeTabs").addEventListener("click", () => {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (
        tab.url === "chrome://newtab/" ||
        tab.url === "chrome://new-tab-page/"
      ) {
        chrome.tabs.remove(tab.id);
      }
    });
    document.getElementById("status").textContent =
      "✅ Đã đóng tất cả tab trống!";
  });
});

//proxy
function renderProxyList() {
  chrome.storage.local.get(["proxyList", "currentProxy"], function (data) {
    const listDiv = document.getElementById("proxyList");
    listDiv.innerHTML = "";
    const proxyList = data.proxyList || [];
    const currentProxy = data.currentProxy || "";
    proxyList.forEach((proxy, idx) => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "proxy-item";
      const textSpan = document.createElement("span");
      textSpan.className = "proxy-text";
      textSpan.textContent = proxy;
      itemDiv.appendChild(textSpan);

      // Nút dùng proxy này
      const setBtn = document.createElement("button");
      setBtn.className = "set-btn";
      setBtn.textContent = "Dùng";
      setBtn.onclick = function () {
        chrome.runtime.sendMessage(
          { action: "setProxy", proxy: proxy },
          function (response) {
            document.getElementById("status").textContent = response.result;
            chrome.storage.local.set({ currentProxy: proxy }, renderProxyList); // Lưu proxy đang dùng
          }
        );
      };
      itemDiv.appendChild(setBtn);

      // Hiển thị trạng thái "Đang dùng"
      if (proxy === currentProxy) {
        const currentSpan = document.createElement("span");
        currentSpan.textContent = " (Đang dùng!)";
        currentSpan.style.color = "green";
        itemDiv.appendChild(currentSpan);
        setBtn.disabled = true; // Không cho bấm khi đang dùng
      }

      // Nút xóa
      const delBtn = document.createElement("button");
      delBtn.className = "delete-btn";
      delBtn.textContent = "Xóa";
      delBtn.onclick = function () {
        chrome.storage.local.get(
          ["proxyList", "currentProxy"],
          function (data) {
            const list = data.proxyList || [];
            const newList = list.filter((_, i) => i !== idx);
            // Nếu đang xóa proxy đang dùng thì xóa luôn currentProxy
            let updateObj = { proxyList: newList };
            if (proxy === data.currentProxy) {
              updateObj.currentProxy = "";
            }
            chrome.storage.local.set(updateObj, renderProxyList);
          }
        );
      };
      itemDiv.appendChild(delBtn);

      listDiv.appendChild(itemDiv);
    });
  });
}

// Khi popup mở lên, render danh sách proxy đã lưu
document.addEventListener("DOMContentLoaded", renderProxyList);

document.getElementById("checkBtn").onclick = function () {
  const proxyStr = document.getElementById("proxyInput").value.trim();
  document.getElementById("status").textContent = "Đang kiểm tra proxy...";
  chrome.runtime.sendMessage(
    { action: "checkProxy", proxy: proxyStr },
    function (response) {
      document.getElementById("status").textContent = response.result;
    }
  );
};

document.getElementById("saveBtn").onclick = function () {
  const proxyStr = document.getElementById("proxyInput").value.trim();
  if (!proxyStr) return;
  chrome.storage.local.get("proxyList", function (data) {
    const proxyList = data.proxyList || [];
    if (!proxyList.includes(proxyStr)) {
      proxyList.push(proxyStr);
      chrome.storage.local.set(
        { proxyList: proxyList, currentProxy: proxyStr },
        renderProxyList
      );
    } else {
      chrome.storage.local.set({ currentProxy: proxyStr }, renderProxyList);
    }
    chrome.runtime.sendMessage(
      { action: "setProxy", proxy: proxyStr },
      function (response) {
        document.getElementById("status").textContent = response.result;
      }
    );
  });
};

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function getBaseUrl(fullUrl) {
  try {
    const url = new URL(fullUrl);
    return `${url.protocol}//${url.host}`;
  } catch {
    return "";
  }
}

async function openNextTab(path) {
  const currentTab = await getCurrentTab();
  const baseUrl = getBaseUrl(currentTab.url);
  const newUrl = `${baseUrl}${path}`;

  // Mở tab mới ngay sau tab hiện tại
  chrome.tabs.create({
    url: newUrl,
    index: currentTab.index + 1,
    active: true,
  });
}
async function openNextTabToSite(path) {
  const currentTab = await getCurrentTab();
  const newUrl = `${path}`;

  // Mở tab mới ngay sau tab hiện tại
  chrome.tabs.create({
    url: newUrl,
    index: currentTab.index + 1,
    active: true,
  });
}

// Chuyển hướng tab hiện tại đến link mới
async function openInCurrentTab(path) {
  const currentTab = await getCurrentTab();
  const baseUrl = getBaseUrl(currentTab.url);
  const newUrl = `${baseUrl}${path}`;

  // Cập nhật tab hiện tại
  chrome.tabs.update(currentTab.id, { url: newUrl });
}

//ốc sên r88
document
  .getElementById("btnOCSEN")
  .addEventListener("click", () =>
    openNextTab("/Account/LoginToSupplier?supplierType=104&gId=3780&cId=21")
  );
//siêu tốc r88
document
  .getElementById("btnSIEUTOC")
  .addEventListener("click", () =>
    openNextTab("/Account/LoginToSupplier?supplierType=104&gId=3786&cId=21")
  );
//tp vàng 3
document
  .getElementById("btnTPV3")
  .addEventListener("click", () =>
    openNextTab("/Account/LoginToSupplier?supplierType=110&gId=7469&cId=20")
  );
//Long Thần(Jili)
document
  .getElementById("btnDAPDA")
  .addEventListener("click", () =>
    openNextTab("/Account/LoginToSupplier?supplierType=101&gId=3271&cId=1")
  );
//Tài Xiu(R88)
document
  .getElementById("btnTXR88")
  .addEventListener("click", () =>
    openNextTab("/Account/LoginToSupplier?supplierType=104&gId=3794&cId=2")
  );
//Xổ Số(VR)
document
  .getElementById("btnXSVR")
  .addEventListener("click", () =>
    openNextTab("/Account/LoginToSupplier?SupplierType=VR")
  );
//TT Cắt
document
  .getElementById("btnTTCAT")
  .addEventListener("click", () =>
    openNextTab("/Account/LoginToSupplier?supplierType=97&gId=2905&cId=2")
  );
//TT Bắn
document
  .getElementById("btnTTBAT")
  .addEventListener("click", () =>
    openNextTab("/Account/LoginToSupplier?supplierType=97&gId=1522&cId=2")
  );
//Khủng long JL
document
  .getElementById("btnKLJL")
  .addEventListener("click", () =>
    openNextTab("/Account/LoginToSupplier?supplierType=101&gId=5212&cId=1")
  );
//DG sảnh
document
  .getElementById("btnDG")
  .addEventListener("click", () =>
    openNextTab("/Account/LoginToSupplier?SupplierType=DG")
  );
//Sexy sảnh
document
  .getElementById("btnSEXY")
  .addEventListener("click", () =>
    openNextTab("/Account/LoginToSupplier?supplierType=SE&gId=4020")
  );
//FC ngộ không sảnh
document
  .getElementById("btnNGOKHONG")
  .addEventListener("click", () =>
    openNextTab("/Account/LoginToSupplier?supplierType=102&gId=3416&cId=2")
  );
//TP tây du
document
  .getElementById("btnTAYDU")
  .addEventListener("click", () =>
    openNextTab("/Account/LoginToSupplier?supplierType=97&gId=4874&cId=21")
  );
//PP Cuộn
document
  .getElementById("btnCUONTIEN")
  .addEventListener("click", () =>
    openNextTab("/Account/LoginToSupplier?supplierType=15&gId=2439&cId=1")
  );
//PP GW78W
document
  .getElementById("btnGW78W")
  .addEventListener("click", () => openInCurrentTab("/gamelobby/lottery"));
//PP JUN1R88
document
  .getElementById("btnJUN1R88")
  .addEventListener("click", () => openInCurrentTab("/gamelobby/chess"));
//PP Cuộn
document
  .getElementById("btnCUONTIEN")
  .addEventListener("click", () =>
    openNextTab("/Account/LoginToSupplier?supplierType=15&gId=2439&cId=1")
  );

//Phần KM
document
  .getElementById("btnKMHi88")
  .addEventListener("click", () =>
    openNextTabToSite("https://tangqua88.com/?promo_id=ND188")
  );
document
  .getElementById("btnKMNew88")
  .addEventListener("click", () =>
    openNextTabToSite("https://khuyenmai-new88okvip1.pages.dev/?promo_id=ND188")
  );
document
  .getElementById("btnKMF8bet")
  .addEventListener("click", () =>
    openNextTabToSite("https://ttkm-f8bet01.pages.dev/?promo_id=ND188")
  );
document
  .getElementById("btnKMMB66")
  .addEventListener("click", () =>
    openNextTabToSite("https://ttkm-mb66okvip02.pages.dev")
  );
document
  .getElementById("btnKM789bet")
  .addEventListener("click", () =>
    openNextTabToSite("https://ttkm789bet04.pages.dev")
  );
document
  .getElementById("btnKMShbet")
  .addEventListener("click", () =>
    openNextTabToSite("https://khuyenmai-shbet01.pages.dev//?promo_id=SH188")
  );
document
  .getElementById("btnKMJun88")
  .addEventListener("click", () =>
    openNextTabToSite("https://trungtam.khuyenmaijun881.win/?promo_id=ND188")
  );
document
  .getElementById("btnKM78Win")
  .addEventListener("click", () =>
    openNextTabToSite(
      "https://1wmzoj2fqkqiysmxy8fdyk7sghnkmxqygemyctdo3kyrfmuqjzashg2.daily78win.net/"
    )
  );
document
  .getElementById("btnKMQQ88")
  .addEventListener("click", () =>
    openNextTabToSite("https://khuyenmai-qq88.pages.dev/?promo_id=TN188")
  );
document
  .getElementById("btnKMRR88")
  .addEventListener("click", () => openNextTabToSite("https://rr88ttkm.com/"));
document
  .getElementById("btnKMGK88")
  .addEventListener("click", () =>
    openNextTabToSite("https://khuyenmai-gk88.pages.dev/")
  );

//Phần khác - lịch su cược
document
  .getElementById("btnLSCUOC")
  .addEventListener("click", () => openInCurrentTab("/BetRecord"));
//lịch su giao dich
document
  .getElementById("btnLSGD")
  .addEventListener("click", () => openInCurrentTab("/Transaction"));
//Hộp thu
document
  .getElementById("btnHOMTHU")
  .addEventListener("click", () => openInCurrentTab("/SiteMail"));
//TT haofn trả
document
  .getElementById("btnHOANTRA")
  .addEventListener("click", () => openInCurrentTab("/Discount"));
//lịch su nap
document
  .getElementById("btnNAPTIEN")
  .addEventListener("click", () => openInCurrentTab("/Financial?type=deposit"));
//lịch su rut
document
  .getElementById("btnRUTTIEN")
  .addEventListener("click", () => openInCurrentTab("/Financial?tab=2"));

// Phần đăng nhập nhanh
// ==========================================
// Hàm tạm dừng (delay)
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function setBusy(isBusy) {
  const quick = document.getElementById("quickLogin");
  if (!quick) return;
  quick.disabled = isBusy;
  quick.textContent = isBusy ? "⏳ Đang xử lý..." : "⚡ Đăng nhập nhanh";
}

// ==========================================
// Helper: chờ đến khi selector xuất hiện hoặc timeout
async function waitForSelectorInPage(tabId, selectors, timeout = 4000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const found = await chrome.scripting.executeScript({
      target: { tabId },
      func: (sels) => {
        for (const s of sels) {
          const el = document.querySelector(s);
          if (el) return s;
        }
        return null;
      },
      args: [selectors],
    });
    if (found && found.length && found[0].result) return found[0].result;
    await sleep(200);
  }
  return null;
}

// ==========================================
// 🧩 Nút "Giải mã captcha" → chạm/tap để hiện captcha, click vào ô và gõ "12345" như người thật
document.getElementById("solveCaptcha")?.addEventListener("click", async () => {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab || !tab.id) return;

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        // Hàm mô phỏng touch + mouse click tại tọa độ giữa element
        function simulateTap(el) {
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;

          // Touch events (mobile-like)
          try {
            const touchObj = new Touch({
              identifier: Date.now(),
              target: el,
              clientX: cx,
              clientY: cy,
              radiusX: 2,
              radiusY: 2,
              rotationAngle: 0,
              force: 0.5,
            });
            const touchStart = new TouchEvent("touchstart", {
              bubbles: true,
              cancelable: true,
              touches: [touchObj],
              targetTouches: [touchObj],
              changedTouches: [touchObj],
            });
            const touchEnd = new TouchEvent("touchend", {
              bubbles: true,
              cancelable: true,
              touches: [],
              targetTouches: [],
              changedTouches: [touchObj],
            });
            el.dispatchEvent(touchStart);
            el.dispatchEvent(touchEnd);
          } catch (e) {
            // Touch constructor may not be available in all contexts -> ignore
          }

          // Mouse click as fallback
          const options = {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: cx,
            clientY: cy,
          };
          el.dispatchEvent(new MouseEvent("mousedown", options));
          el.dispatchEvent(new MouseEvent("mouseup", options));
          el.dispatchEvent(new MouseEvent("click", options));
        }

        // Tập hợp các selector có thể là vùng kích hoạt captcha
        const possibleSelectors = [
          'input[formcontrolname="checkCode"]',
          'input[placeholder*="MÃ XÁC MINH"]',
          'input[placeholder*="Mã xác minh"]',
          ".captcha-wrapper",
          ".box-captcha",
          ".thumb-captcha",
          ".refresh-captcha",
          ".captcha-refresh",
          "img.image-captcha",
          'img[alt*="captcha"]',
        ];

        // Tìm element ưu tiên: wrapper hoặc input
        let el = null;
        for (const s of possibleSelectors) {
          el = document.querySelector(s);
          if (el) break;
        }

        // Nếu tìm thấy wrapper/refresh/icon thì tap vào nó
        if (el) {
          simulateTap(el);
          // nếu el là input thì focus để hiển thị caret
          if (el.tagName && el.tagName.toLowerCase() === "input") {
            el.focus();
            el.dispatchEvent(new Event("focus", { bubbles: true }));
          }
          console.log("Đã simulate tap vào element để hiện captcha:", el);
        } else {
          console.log(
            "Không tìm thấy element kích hoạt captcha (tìm theo danh sách selector)."
          );
        }
      },
    });

    // Sau khi tap, chờ ảnh captcha xuất hiện (nhiều trang có img.image-captcha hoặc img[alt*=captcha])
    const foundSelector = await waitForSelectorInPage(
      tab.id,
      ["img.image-captcha", 'img[alt*="captcha"]', ".thumb-captcha img"],
      4000
    );

    // Nếu ảnh xuất hiện, chờ thêm tí để render xong
    if (foundSelector) {
      await sleep(300 + randBetween(50, 250));
    } else {
      // Nếu không thấy ảnh, vẫn tiếp tục: chờ 300ms để đảm bảo input được focus
      await sleep(300);
    }

    // Bây giờ thực hiện click thật vào ô input và gõ từng ký tự
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        // Tìm input theo nhiều selector
        const inputSelectors = [
          'input[formcontrolname="checkCode"]',
          'input[placeholder*="MÃ XÁC MINH"]',
          'input[placeholder*="Mã xác minh"]',
          'input[type="text"].ng-pristine',
        ];
        let input = null;
        for (const s of inputSelectors) {
          input = document.querySelector(s);
          if (input) break;
        }
        if (!input) {
          console.log("Không tìm thấy ô input để gõ captcha.");
          return;
        }

        // Click thật vào giữa input
        const rect = input.getBoundingClientRect();
        const clickEvent = new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + rect.height / 2,
        });
        input.dispatchEvent(clickEvent);
        input.focus();

        // Gõ từng ký tự như người thật với delay ngẫu nhiên nhỏ
        const text = "12345";
        input.value = ""; // xóa trước
        for (const ch of text) {
          const keydown = new KeyboardEvent("keydown", {
            key: ch,
            bubbles: true,
            cancelable: true,
          });
          const keypress = new KeyboardEvent("keypress", {
            key: ch,
            bubbles: true,
            cancelable: true,
          });
          input.dispatchEvent(keydown);
          input.value += ch;
          // InputEvent để frameworks bắt đúng
          const inputEvent = new InputEvent("input", {
            data: ch,
            bubbles: true,
            cancelable: true,
          });
          input.dispatchEvent(inputEvent);
          input.dispatchEvent(keypress);
          input.dispatchEvent(
            new KeyboardEvent("keyup", { key: ch, bubbles: true })
          );
          // delay giống người gõ
          await sleep(100 + Math.floor(Math.random() * 120));
        }
        input.dispatchEvent(new Event("change", { bubbles: true }));
        console.log('Đã gõ "12345" vào ô captcha');
      },
    });
  } catch (err) {
    console.error("Lỗi khi thực hiện show+type captcha:", err);
  }
});

// ==========================================
// ⚡ Nút "Đăng nhập nhanh" → chạy tuần tự 3 bước (sử dụng solveCaptcha)
document.getElementById("quickLogin")?.addEventListener("click", async () => {
  setBusy(true);
  try {
    const btnLogin = document.getElementById("input_login");
    const btnCaptcha = document.getElementById("solveCaptcha");
    const btnSubmit = document.getElementById("submitForm");

    if (!btnLogin || !btnCaptcha || !btnSubmit) {
      alert("Không tìm thấy một trong các nút. Kiểm tra lại id của các nút.");
      return;
    }

    // 1️⃣ Nhập login
    btnLogin.click();
    await sleep(1500);

    // 2️⃣ Giải captcha (chạm để hiện -> gõ)
    btnCaptcha.click();
    // chờ đủ thời gian để captcha hiển thị và gõ xong
    await sleep(2600);

    // 3️⃣ Submit form
    btnSubmit.click();

    await sleep(800);
    console.log("✅ Đăng nhập nhanh: đã click tuần tự 3 bước.");
  } catch (err) {
    console.error("❌ Lỗi khi thực hiện Đăng nhập nhanh:", err);
    alert("Lỗi: " + err.message);
  } finally {
    setBusy(false);
  }
});
