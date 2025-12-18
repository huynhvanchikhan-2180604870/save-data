// background.js - Improved Version
let APIKEY_CAPCHA = "ec53477299cfbbf89cd4bb66d21de723";
let USERNAME_TEAM = "";
let API_BASE = "https://save-data-tau.vercel.app/api/links";
// Load configuration
let config = {};
async function loadConfig() {
  try {
    const response = await fetch(chrome.runtime.getURL("config.json"));
    config = await response.json();
  } catch (error) {
    console.error("Failed to load config:", error);
    // Fallback to default config
    config = {
      timeouts: {
        pageLoad: 80000,
        elementWait: 30000,
        captchaSolve: 30000,
        formSubmit: 10000,
        delayBetweenActions: 1000,
        delayBetweenSteps: 2000,
      },
      retries: {
        maxRetries: 3,
        retryDelay: 1000,
        captchaMaxRetries: 5,
      },
      notifications: {
        showProgress: true,
        showErrors: true,
        showSuccess: false,
        groupNotifications: true,
        notificationTimeout: 3000,
      },
      automation: {
        closeAdsEnabled: true,
        solveCaptchaEnabled: true,
        autoSubmitEnabled: true,
        waitForElements: true,
        maxConcurrentTabs: 10,
      },
    };
  }
}

// Biến để kiểm soát trạng thái automation
let isAutomationRunning = false;
let currentProgress = { current: 0, total: 0, step: "" };
// Track tab ids opened by the automation so we can force-close them on stop
let activeAutomationTabIds = new Set();
// Track current logical step per tab so we can retry/reload to resume
const activeStepByTabId = new Map();

// Lắng nghe các tin nhắn từ popup hoặc content script
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "runSequentialCreateInBackground") {
    runSequentialCreate(message.urls)
      .then(() => {
        sendResponse({
          success: true,
          message: "Hoàn tất tạo tài khoản cho tất cả links.",
        });
      })
      .catch((error) => {
        console.error(
          "Lỗi khi chạy runSequentialCreate trong background:",
          error
        );
        sendResponse({
          success: false,
          message: "Quá trình thực thi bị lỗi.",
          error: error.message,
        });
      });
    return true;
  } else if (message.action === "stopAutomation") {
    isAutomationRunning = false;

    // Run async cleanup and respond when finished. Return true to keep
    // the message channel open so sendResponse can be called after awaits.
    (async () => {
      // Đóng tất cả các tab đang mở bởi extension
      try {
        // Close any tabs we explicitly opened for automation first
        const ids = Array.from(activeAutomationTabIds);
        for (const id of ids) {
          try {
            await chrome.tabs.remove(id);
          } catch (e) {
            // ignore errors per-tab
          }
          activeAutomationTabIds.delete(id);
        }

        // Additionally close any extension tabs that might remain
        const tabs = await chrome.tabs.query({});
        const extensionTabs = tabs.filter(
          (tab) =>
            tab.url &&
            tab.url.includes("chrome-extension://") &&
            tab.id !== sender.tab?.id
        );
        for (const tab of extensionTabs) {
          try {
            await chrome.tabs.remove(tab.id);
          } catch (e) {
            // Ignore errors when closing tabs
          }
        }
      } catch (e) {
        console.error("Lỗi khi đóng tabs:", e);
      }

      showNotification("Thông báo", "Đã dừng tác vụ automation", "info");
      try {
        sendResponse({ success: true });
      } catch (e) {
        // sendResponse may throw if port closed unexpectedly
        console.error("Không thể gửi phản hồi stopAutomation:", e);
      }
    })();
    return true;
  } else if (message.action === "showNotification") {
    showNotification(message.title, message.message, message.type);
    sendResponse({ success: true });
  } else if (message.action === "toast") {
    toast(message.message);
    sendResponse({ success: true });
  } else if (message.action === "solveCaptchaInBackground") {
    solveCaptchaCommon(message.tabId)
      .then(() => sendResponse({ success: true }))
      .catch((error) =>
        sendResponse({ success: false, message: error.message })
      );
    return true;
  } else if (message.action === "loadSiteList") {
    // Fetch and parse site list in background and return results to caller
    (async () => {
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
        const results = (json.data || []).map(({ name, link }) => ({
          name,
          link,
        }));

        sendResponse({
          success: true,
          results: [
            ...results,
            // { name: "RR88", link: "https://rr88seo.rr1083.com/m/register" },
          ],
        });
      } catch (err) {
        console.error("Error loading site list:", err);
        sendResponse({ success: false, message: err.message });
      }
    })();
    return true;
  }
  return false;
});

// Initialize config on startup
loadConfig();

// Hàm gửi progress update đến popup
function sendProgressUpdate(current, total, step) {
  chrome.runtime.sendMessage({
    action: "updateProgress",
    current: current,
    total: total,
    step: step,
  });
}

// Hàm ẩn progress bar
function hideProgressBar() {
  chrome.runtime.sendMessage({
    action: "hideProgress",
  });
}

// Improved delay function with cancellation support
function delay(ms) {
  return new Promise((resolve, reject) => {
    if (!isAutomationRunning) {
      reject(new Error("Automation stopped"));
      return;
    }
    setTimeout(resolve, ms);
  });
}

// Hàm waitForTabComplete với timeout và cancellation
// waitForXpath: chờ đến khi xpath xuất hiện hoặc timeout (nếu được cung cấp).
// Gọi:
//  - waitForXpath(tabId, xpath, callback)  -> đợi vô hạn cho tới khi xuất hiện
//  - waitForXpath(tabId, xpath, timeout, callback) -> đợi tới timeout ms
//  - waitForXpath(tabId, [xpath1, xpath2], timeout, callback) -> đợi tới khi bất kỳ xpath nào xuất hiện
// waitForXpath: chờ đến khi xpath xuất hiện hoặc timeout (mặc định 30s).
// New behavior: accepts an `onFound` callback and an `onNotFound` callback.
// Calling signatures supported (backward-compatible):
//  - waitForXpath(tabId, xpath, onFound)
//  - waitForXpath(tabId, xpath, timeout, onFound)
//  - waitForXpath(tabId, xpath, timeout, onFound, onNotFound)
//  - waitForXpath(tabId, [xpath1, xpath2], timeout, onFound, onNotFound)
async function waitForXpath(
  tabId,
  xpathOrArray,
  timeoutOrCallback,
  actionCallback,
  notFoundCallback
) {
  // Normalize arguments
  let timeout = 30000; // default 30s
  let onFound = null;
  let onNotFound = null;

  if (typeof timeoutOrCallback === "function") {
    onFound = timeoutOrCallback;
  } else if (typeof timeoutOrCallback === "number") {
    timeout = timeoutOrCallback;
    if (typeof actionCallback === "function") onFound = actionCallback;
    if (typeof notFoundCallback === "function") onNotFound = notFoundCallback;
  }

  // If caller provided notFound as fourth argument (old style), handle it
  if (
    !onNotFound &&
    typeof actionCallback === "function" &&
    typeof notFoundCallback === "undefined" &&
    typeof timeoutOrCallback === "function"
  ) {
    // no-op: keep onNotFound null
  }

  // Normalize xpath(s) to an array for unified processing
  const xpaths = Array.isArray(xpathOrArray) ? xpathOrArray : [xpathOrArray];

  const start = Date.now();

  while (isAutomationRunning) {
    // If timeout exceeded, call onNotFound if provided and return false
    if (timeout !== null && Date.now() - start > timeout) {
      const list = xpaths.join(", ");
      if (typeof onNotFound === "function") {
        try {
          await onNotFound();
        } catch (e) {
          // swallow callback errors
        }
      }
      return false;
    }

    try {
      // If only one xpath, keep previous fast path
      if (xpaths.length === 1) {
        const exists = await checkXpathExist(tabId, xpaths[0], 1);
        if (exists) {
          if (typeof onFound === "function") {
            // Preserve backward-compatible callback signature (no args)
            await onFound();
          }
          return true;
        }
      } else {
        // Multiple xpaths: return as soon as any matches and pass the matched xpath to the callback
        for (const xp of xpaths) {
          try {
            const exists = await checkXpathExist(tabId, xp, 1);
            if (exists) {
              if (typeof onFound === "function") {
                // Provide the matched xpath as an argument to the callback
                await onFound(xp);
              }
              // Return the matched xpath for callers that want it
              return xp;
            }
          } catch (err) {
            // If checkXpathExist failed due to automation stopped, bubble up
            if (String(err).includes("Automation stopped")) throw err;
            // otherwise ignore this xpath and continue
          }
        }
      }
    } catch (err) {
      // If checkXpathExist failed due to automation stopped, bubble up
      if (String(err).includes("Automation stopped")) throw err;
      // otherwise continue retrying until timeout
    }

    try {
      await delay(300);
    } catch (err) {
      // If automation was stopped while waiting
      throw new Error("Automation stopped");
    }
  }

  // If automation no longer running
  throw new Error("Automation stopped");
}
// Helper that will attempt waitForXpath and, on failure, reload the tab and retry
async function waitForXpathWithReload(
  tabId,
  xpathOrArray,
  timeout,
  onFound,
  onNotFound,
  maxReloads = 3,
  stepName = null
) {
  if (stepName) activeStepByTabId.set(tabId, stepName);

  for (let attempt = 0; attempt <= maxReloads; attempt++) {
    if (!isAutomationRunning) throw new Error("Automation stopped");

    try {
      const res = await waitForXpath(tabId, xpathOrArray, timeout, onFound);
      if (res) {
        // success: clear step state
        try {
          activeStepByTabId.delete(tabId);
        } catch (e) {}
        return res;
      }
    } catch (err) {
      // bubble automation stop
      if (String(err).includes("Automation stopped")) throw err;
      // otherwise log and treat as not found for retry
      console.error("waitForXpathWithReload inner error:", err);
    }

    // If we reach here, not found this attempt
    if (attempt < maxReloads) {
      toast(`Không thấy element, thực hiện reload (lần ${attempt + 1})`);
      try {
        await chrome.tabs.reload(tabId);
      } catch (e) {
        // If reload fails, try goBack as fallback
        try {
          await chrome.tabs.goBack(tabId);
        } catch (e2) {}
      }

      // wait for page to finish loading before retry
      try {
        await waitForTabComplete(tabId, config.timeouts.pageLoad);
      } catch (e) {
        // ignore and continue retry
      }

      // small delay before next check
      await delay(500);
      continue;
    }

    // exhausted retries
    if (typeof onNotFound === "function") {
      try {
        await onNotFound();
      } catch (e) {
        // swallow
      }
    }
    return false;
  }
}
function waitForTabComplete(tabId, timeout = config.timeouts.pageLoad) {
  return new Promise((resolve, reject) => {
    if (!isAutomationRunning) {
      reject(new Error("Automation stopped"));
      return;
    }

    let finished = false;
    const onUpdated = (id, change) => {
      if (id === tabId && change.status === "complete") {
        finished = true;
        chrome.tabs.onUpdated.removeListener(onUpdated);
        resolve();
      }
    };
    chrome.tabs.onUpdated.addListener(onUpdated);

    // Timeout with cleanup
    setTimeout(() => {
      if (!finished) {
        chrome.tabs.onUpdated.removeListener(onUpdated);
        if (isAutomationRunning) {
          resolve(); // Continue anyway for best-effort
        } else {
          reject(new Error("Automation stopped"));
        }
      }
    }, timeout);
  });
}

// Helper: check whether a tab loaded a real page (not an error/blank page)
async function isTabLoadedSuccessfully(tabId) {
  try {
    const info = await chrome.tabs.get(tabId);
    const tabUrl = info && info.url ? info.url : "";
    const title = info && info.title ? info.title : "";

    const isErrorUrl =
      tabUrl.startsWith("chrome-error://") || tabUrl === "about:blank";
    const urlHasErrToken =
      /ERR_CONNECTION_REFUSED|ERR_NAME_NOT_RESOLVED|ERR_CONNECTION_TIMED_OUT/.test(
        tabUrl
      );
    const titleIndicatesError =
      /This site can't be reached|ERR_CONNECTION_REFUSED|ERR_NAME_NOT_RESOLVED|ERR_CONNECTION_TIMED_OUT/i.test(
        title
      );

    const ok = !(isErrorUrl || urlHasErrToken || titleIndicatesError);
    return { ok, url: tabUrl, title };
  } catch (err) {
    return { ok: false, error: err };
  }
}

// Hàm checkXpathExist với retry logic
// Accept xpathInput as string or array. For array input, return the matched xpath string (truthy) or false.
async function checkXpathExist(
  tabId,
  xpathInput,
  maxRetries = config.retries.maxRetries
) {
  const isArray = Array.isArray(xpathInput);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (!isAutomationRunning) throw new Error("Automation stopped");

      if (isArray) {
        // Evaluate all xpaths in page context and return first match (the xpath string) or null
        const results = await chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: (xpaths) => {
            try {
              for (const xp of xpaths) {
                try {
                  const node = document.evaluate(
                    xp,
                    document,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                  ).singleNodeValue;
                  if (node) return xp;
                } catch (e) {
                  // ignore xpath-specific eval errors and continue
                }
              }
              return null;
            } catch (error) {
              console.error("XPath evaluation error (array):", error);
              return null;
            }
          },
          args: [xpathInput],
        });

        const matched =
          results && results.length > 0 && results[0].result
            ? results[0].result
            : null;

        if (matched || attempt === maxRetries) {
          // return the matched xpath (string) or false
          return matched || false;
        }
      } else {
        // Single xpath — previous behavior: return boolean
        const results = await chrome.scripting.executeScript({
          target: { tabId: tabId },
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
        });

        const exists =
          results && results.length > 0 && results[0].result !== undefined
            ? results[0].result
            : false;

        if (exists || attempt === maxRetries) {
          return exists;
        }
      }

      // Wait before retry
      await delay(config.retries.retryDelay);
    } catch (error) {
      if (attempt === maxRetries) {
        console.error("Error checking XPath after retries:", error);
        return false;
      }
      await delay(config.retries.retryDelay);
    }
  }
  return false;
}

// Hàm waitForElement với dynamic waiting
async function waitForElement(
  tabId,
  xpath,
  timeout = config.timeouts.elementWait
) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (!isAutomationRunning) throw new Error("Automation stopped");

    if (await checkXpathExist(tabId, xpath, 1)) {
      return true;
    }

    // Use requestAnimationFrame for smoother waiting
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }

  return false;
}

// Hàm closeAds với retry và better error handling
async function closeAds(tabId) {
  if (!config.automation.closeAdsEnabled) return;

  try {
    showNotification("Đang đóng quảng cáo...", "info");

    const adSelectors = [
      `//span[@translate="Common_Closed"]`,
      `//button[@translate="Common_Closed"]`,
      `//button[@translate="Announcement_GotIt"]`,
      `//i[@class="fal fa-times"]`,
    ];

    for (const xpath of adSelectors) {
      try {
        await chrome.tabs.sendMessage(tabId, {
          action: "clickXPath",
          xpath: xpath,
        });
        await delay(500);
      } catch (e) {
        // Continue with next selector
      }
    }

    toast("Đã gửi yêu cầu đóng quảng cáo");
    await delay(config.timeouts.delayBetweenActions);
  } catch (e) {
    console.error("Không thể gửi yêu cầu đóng quảng cáo:", e);
    showNotification("Lỗi", "Không thể gửi yêu cầu đóng quảng cáo", "error");
  }
}

// Hàm redirectToRutTienPage
async function redirectToRutTienPage(tabId, tabUrl) {
  try {
    const target = tabUrl
      ? new URL("/Account/ChangeMoneyPassword", tabUrl).href
      : "/Account/ChangeMoneyPassword";
    await chrome.tabs.update(tabId, { url: target });
    toast("Chuyển tới /Account/ChangeMoneyPassword");
  } catch (e) {
    console.error("Không thể chuyển trang tới ChangeMoneyPassword", e);
    showNotification(
      "Lỗi",
      "Không thể chuyển trang tới ChangeMoneyPassword",
      "error"
    );
  }
}

// Hàm redirectToRutTienPage
async function redirectToRutTienPageForR88(tabId, tabUrl) {
  try {
    const target = tabUrl
      ? new URL("/m/securityCenter/addBankCard", tabUrl).href
      : "/m/securityCenter/addBankCard";
    await chrome.tabs.update(tabId, { url: target });
    toast("Chuyển tới securityCenter/addBankCard");
  } catch (e) {
    console.error("Không thể chuyển trang tới ChangeMoneyPassword", e);
    showNotification(
      "Lỗi",
      "Không thể chuyển trang tới ChangeMoneyPassword",
      "error"
    );
  }
}

// Hàm redirectToNapTienPageForR88
async function redirectToNapTienPageForR88(tabId, tabUrl) {
  try {
    const target = tabUrl
      ? new URL("/m/voucherCenter", tabUrl).href
      : "/m/voucherCenter";
    await chrome.tabs.update(tabId, { url: target });
    toast("Chuyển tới voucherCenter");
  } catch (e) {
    console.error("Không thể chuyển trang tới voucherCenter", e);
    showNotification(
      "Lỗi",
      "Không thể chuyển trang tới voucherCenter",
      "error"
    );
  }
}

// Hàm redirectToAddBankPage
async function redirectToAddBankPage(tabId, tabUrl) {
  try {
    const target = tabUrl
      ? new URL("/Financial?type=withdraw", tabUrl).href
      : "/Financial?type=withdraw";
    await chrome.tabs.update(tabId, { url: target });
    toast("Chuyển tới /Financial?type=withdraw");
  } catch (e) {
    console.error("Không thể chuyển trang tới trang thêm ngân hàng", e);
    showNotification(
      "Lỗi",
      "Không thể chuyển trang tới trang thêm ngân hàng",
      "error"
    );
  }
}

// Hàm getDataObject (giữ nguyên)
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

// Hàm applyBulk với retry logic
async function applyBulk(tabId, dataInput) {
  toast("Đang điền thông tin đăng ký");

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

  const arrayDataFill_RR88 = [
    dataGet.accountName,
    dataGet.pass_1,
    dataGet.pass_1,
    dataGet.nameBank,
    dataGet.phone,
    dataGet.email,
  ];

  if (Object.values(dataGet).some((value) => value === "")) {
    showNotification("Lỗi", "Vui lòng nhập dữ liệu để áp dụng!", "error");
    return;
  }

  await delay(config.timeouts.delayBetweenSteps);

  // Send desktop mapping
  await chrome.tabs.sendMessage(tabId, {
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
  await chrome.tabs.sendMessage(tabId, {
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
  await chrome.tabs.sendMessage(tabId, {
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

  toast(`Đã gửi ${arrayDataFill.length} giá trị tới trang web!`);
}

// Hàm applyNhapPassRut với retry
async function applyNhapPassRut(tabId, dataInput) {
  const xpaths = [
    "/html[1]/body[1]/div[1]/ui-view[1]/gupw-app[1]/ui-view[1]/gupw-sample-layout[1]/div[2]/div[1]/ui-view[1]/gupw-member-center-layout[1]/div[1]/div[1]/div[2]/ui-view[1]/gupw-change-money-password[1]/div[1]/div[2]/div[1]/div[1]/section[1]/form[1]/div[1]/div[1]/div[1]/input[1]",
    "/html[1]/body[1]/div[1]/ui-view[1]/gupw-app[1]/ui-view[1]/gupw-sample-layout[1]/div[2]/div[1]/ui-view[1]/gupw-member-center-layout[1]/div[1]/div[1]/div[2]/ui-view[1]/gupw-change-money-password[1]/div[1]/div[2]/div[1]/div[1]/section[1]/form[1]/div[2]/div[1]/div[1]/input[1]",
  ];

  const xpathsMobile = [
    "//input[@formcontrolname='oldPassword']",
    "//input[@formcontrolname='newPassword']",
    "//input[@formcontrolname='confirm']",
  ];

  const dataGet = getDataObject(dataInput);

  if (Object.values(dataGet).some((value) => value === "")) {
    showNotification("Lỗi", "Vui lòng nhập dữ liệu để áp dụng!", "error");
    return;
  }

  const newPassword = dataGet.pass_rut;
  const passwordArray = [dataGet.pass_1, newPassword, newPassword];

  await chrome.tabs.sendMessage(tabId, {
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

  await chrome.tabs.sendMessage(tabId, {
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

  toast(`Đã gửi ${passwordArray.length} giá trị tới trang web!`);
}

// Hàm applyNhapPassRut với retry
async function applyNhapPassRutForR88(tabId, dataInput) {
  const xpaths = [
    "/html[1]/body[1]/div[1]/ui-view[1]/gupw-app[1]/ui-view[1]/gupw-sample-layout[1]/div[2]/div[1]/ui-view[1]/gupw-member-center-layout[1]/div[1]/div[1]/div[2]/ui-view[1]/gupw-change-money-password[1]/div[1]/div[2]/div[1]/div[1]/section[1]/form[1]/div[1]/div[1]/div[1]/input[1]",
    "/html[1]/body[1]/div[1]/ui-view[1]/gupw-app[1]/ui-view[1]/gupw-sample-layout[1]/div[2]/div[1]/ui-view[1]/gupw-member-center-layout[1]/div[1]/div[1]/div[2]/ui-view[1]/gupw-change-money-password[1]/div[1]/div[2]/div[1]/div[1]/section[1]/form[1]/div[2]/div[1]/div[1]/input[1]",
  ];

  const xpathsMobile = [
    "//input[@name='withdraw']",
    "//input[@name='withdrawT']",
  ];

  const dataGet = getDataObject(dataInput);

  if (Object.values(dataGet).some((value) => value === "")) {
    showNotification("Lỗi", "Vui lòng nhập dữ liệu để áp dụng!", "error");
    return;
  }

  const newPassword = dataGet.pass_rut;
  const passwordArray = [newPassword, newPassword];

  await chrome.tabs.sendMessage(tabId, {
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

  await chrome.tabs.sendMessage(tabId, {
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

  toast(`Đã gửi ${passwordArray.length} giá trị tới trang web!`);
}

// Hàm applyThemBank với improved logic
async function applyThemBank(tabId, dataInput) {
  const xpathsMobile = [
    "//input[@formcontrolname='city']",
    "//input[@formcontrolname='account']",
  ];

  const dataGet = getDataObject(dataInput);

  const nameBank = dataGet.bankName;
  const branchBank = dataGet.bankBranch;
  const idAccount = dataGet.idAccount;

  if (Object.values(dataGet).some((value) => value === "")) {
    showNotification("Lỗi", "Vui lòng nhập dữ liệu để áp dụng!", "error");
    return;
  }

  const newArrayPath = [branchBank, idAccount];

  // Click select with retry
  await chrome.tabs.sendMessage(tabId, {
    action: "clickXPath",
    xpath: `//mat-select[@formcontrolname='bankName']`,
  });

  // Wait for filter input to appear
  await delay(500);

  // Click input
  await chrome.tabs.sendMessage(tabId, {
    action: "clickXPath",
    xpath: `//input[@formcontrolname="filter"]`,
  });

  await delay(500);

  // Fill bank name
  await chrome.tabs.sendMessage(tabId, {
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

  // Click option
  await chrome.tabs.sendMessage(tabId, {
    action: "clickXPath",
    xpath: `//span[contains(text(),"${nameBank.trim()}")]`,
  });

  await delay(2000);

  // Fill remaining fields
  await chrome.tabs.sendMessage(tabId, {
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

  toast(`Đã gửi ${newArrayPath.length} giá trị tới trang web!`);
}

// Hàm applyThemBank với improved logic
async function applyThemBankForR88(tabId, dataInput) {
  const xpathsMobile = [
    "//input[@name='customBankBranch']",
    "//input[@name='bankCard']",
  ];

  const dataGet = getDataObject(dataInput);

  const nameBank = dataGet.bankName;
  const branchBank = dataGet.bankBranch;
  const idAccount = dataGet.idAccount;

  if (Object.values(dataGet).some((value) => value === "")) {
    showNotification("Lỗi", "Vui lòng nhập dữ liệu để áp dụng!", "error");
    return;
  }

  const newArrayPath = [branchBank, idAccount];

  // Click select with retry
  await chrome.tabs.sendMessage(tabId, {
    action: "clickXPath",
    xpath: `//div[@placeholder="＊ Chọn ngân hàng của bạn"]`,
  });

  // Wait for filter input to appear
  await delay(500);

  // Click input
  await chrome.tabs.sendMessage(tabId, {
    action: "clickXPath",
    xpath: `//input[@placeholder="Tìm kiếm"]`,
  });

  await delay(500);

  // Fill bank name
  await chrome.tabs.sendMessage(tabId, {
    action: "fillFormAdvanced",
    payload: {
      fields: [
        {
          xpath: `//input[@placeholder="Tìm kiếm"]`,
          value: nameBank.trim(),
        },
      ],
      autoSubmit: false,
      fireEvents: true,
    },
  });

  await delay(1000);

  const xpathClickOption = await waitForXpathWithReload(
    tabId,
    `//div[contains(text(),"${nameBank.trim()}")]`,
    config.timeouts.elementWait,
    async () => {
      // Click option
      await chrome.tabs.sendMessage(tabId, {
        action: "clickXPath",
        xpath: `//div[contains(text(),"${nameBank.trim()}")]`,
      });

      await delay(2000);

      // Fill remaining fields
      await chrome.tabs.sendMessage(tabId, {
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

      toast(`Đã gửi ${newArrayPath.length} giá trị tới trang web!`);
    },
    null,
    2,
    "no_option_found_bank"
  );

  if (!xpathClickOption) {
    return;
  }
}

// Hàm solveCaptchaCommon với improved retry logic
async function solveCaptchaCommon(tabId) {
  if (!config.automation.solveCaptchaEnabled) return;

  try {
    toast(`Bắt đầu giải captcha 1. Vui lòng chờ...`);

    const apikey = APIKEY_CAPCHA || "ec53477299cfbbf89cd4bb66d21de723";
    if (!APIKEY_CAPCHA) {
      showNotification("Lỗi", "Không lấy được API key", "error");
      return;
    }

    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      args: [APIKEY_CAPCHA, config.timeouts.captchaSolve],
      func: async (APIKEY_CAPCHA, timeout) => {
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
                  apikey: APIKEY_CAPCHA,
                  type: 14,
                  img: base64,
                }),
              }
            );
            const result = await response.json();
            if (result.success && result.captcha) {
              return result.captcha;
            } else {
              console.error(
                "Giải mã thất bại:",
                result.message || "Không rõ lỗi"
              );
              return null;
            }
          } catch (err) {
            console.log(err);
            return null;
          }
        };

        const setNativeValue = (el, value) => {
          const valueSetter = Object.getOwnPropertyDescriptor(
            el.__proto__,
            "value"
          ).set;
          valueSetter.call(el, value);
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
        };

        // Wait for captcha input with timeout
        let input = null;
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
          input =
            document.querySelector('input[formcontrolname="checkCode"]') ||
            document.querySelector('input[ng-model="$ctrl.code"]') ||
            document.querySelector('input[name="identifying"]');
          if (input) break;
          await new Promise((r) => setTimeout(r, 100));
        }

        if (!input) {
          console.error("Không tìm thấy input 'checkCode'");
          return;
        }

        // Wait for captcha image
        let img = null;
        const imgStartTime = Date.now();
        while (Date.now() - imgStartTime < timeout) {
          img = document.querySelector('img[src^="data:image"]');
          if (img) break;
          await new Promise((r) => setTimeout(r, 100));
        }

        if (!img) {
          console.error("Không tìm thấy ảnh captcha");
          return;
        }

        const base64 = img.src.split(",")[1];
        const result = await solveCaptcha(base64);
        if (!result) return;

        setNativeValue(input, result);

        input.value = "";
        input.dispatchEvent(new Event("input", { bubbles: true }));
        await new Promise((r) => setTimeout(r, 300));

        input.value = result;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        await new Promise((r) => setTimeout(r, 3000));
      },
    });
  } catch (err) {
    showNotification("Lỗi", `Lỗi giải captcha: ${err.message}`, "error");
    console.error(err);
  }
}

// Hàm solveCaptchaCommon với improved retry logic
async function solveCaptchaForR88(tabId) {
  if (!config.automation.solveCaptchaEnabled) return;

  try {
    toast(`Bắt đầu giải captcha RR. Vui lòng chờ...`);

    const apikey = APIKEY_CAPCHA || "ec53477299cfbbf89cd4bb66d21de723";

    if (!APIKEY_CAPCHA) {
      showNotification("Lỗi", "Không lấy được API key", "error");
      return;
    }

    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      args: [APIKEY_CAPCHA, config.timeouts.captchaSolve],
      func: async (APIKEY_CAPCHA, timeout) => {
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
                  apikey: APIKEY_CAPCHA,
                  type: 14,
                  img: base64,
                }),
              }
            );
            const result = await response.json();
            if (result.success && result.captcha) {
              return result.captcha;
            } else {
              console.error(
                "Giải mã thất bại:",
                result.message || "Không rõ lỗi"
              );
              return null;
            }
          } catch (err) {
            console.log(err);
            return null;
          }
        };

        const setNativeValue = (el, value) => {
          const valueSetter = Object.getOwnPropertyDescriptor(
            el.__proto__,
            "value"
          ).set;
          valueSetter.call(el, value);
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
        };

        // Wait for captcha input with timeout
        let input = null;
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
          input =
            document.querySelector('input[formcontrolname="checkCode"]') ||
            document.querySelector('input[ng-model="$ctrl.code"]') ||
            document.querySelector('input[name="identifying"]');
          if (input) break;
          await new Promise((r) => setTimeout(r, 100));
        }

        if (!input) {
          console.error("Không tìm thấy input 'checkCode'");
          return;
        }

        // Wait for captcha image
        let img = null;
        const imgStartTime = Date.now();
        while (Date.now() - imgStartTime < timeout) {
          img = document.querySelector('img[alt="captcha"][src^="data:image"]');
          if (img) break;
          await new Promise((r) => setTimeout(r, 100));
        }

        if (!img) {
          console.error("Không tìm thấy ảnh captcha");
          return;
        }

        const base64 = img.src.split(",")[1];
        const result = await solveCaptcha(base64);
        if (!result) return;

        setNativeValue(input, result);

        input.value = "";
        input.dispatchEvent(new Event("input", { bubbles: true }));
        await new Promise((r) => setTimeout(r, 300));

        input.value = result;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        await new Promise((r) => setTimeout(r, 3000));
      },
    });
  } catch (err) {
    showNotification("Lỗi", `Lỗi giải captcha: ${err.message}`, "error");
    console.error(err);
  }
}

// Hàm runSequentialCreate - updated to run in parallel batches
async function runSequentialCreate(urls) {
  showNotification(
    "Bắt đầu tự động tạo tài khoản",
    "Đang xử lý các liên kết...",
    "info"
  );

  isAutomationRunning = true;
  currentProgress = { current: 0, total: urls.length, step: "Initializing" };

  // Concurrency configuration (default 3 if not provided)
  const concurrency =
    (config && config.automation && config.automation.maxConcurrentTabs) || 10;

  try {
    // Lấy dữ liệu bulkInputCreateData từ storage
    const savedBulkData = await chrome.storage.local.get([
      "bulkInputCreateData",
    ]);
    const bulkInputData =
      (savedBulkData && savedBulkData.bulkInputCreateData) || "";
    const dataObject = getDataObject(bulkInputData.split("|"));

    if (Object.values(dataObject).some((value) => value === "")) {
      showNotification(
        "Lỗi",
        "Dữ liệu tạo tài khoản không đầy đủ. Vui lòng kiểm tra lại.",
        "error"
      );
      return;
    }

    // Track per-URL results
    const successList = [];
    const failedList = [];
    const failedReasons = {}; // map url -> reason
    const markFailed = (u, reason) => {
      if (!failedReasons[u]) {
        failedList.push(u);
        failedReasons[u] = reason || "Unknown";
      }
    };

    // worker for a single url - extracted from previous sequential logic
    const processOne = async (url, index) => {
      const outcome = { success: false, reason: "" };
      if (!isAutomationRunning) throw new Error("Automation stopped");

      const seqIndex = index; // zero-based
      currentProgress.current = seqIndex + 1;
      currentProgress.step = `Processing ${seqIndex + 1}/${urls.length}`;
      sendProgressUpdate(
        currentProgress.current,
        currentProgress.total,
        currentProgress.step
      );

      toast(`Bắt đầu link thứ ${seqIndex + 1}`);
      await delay(config.timeouts.delayBetweenSteps);

      showNotification(
        "Tiến trình",
        `Đang xử lý ${seqIndex + 1}/${urls.length}: ${url}`,
        "info"
      );

      let newTab, tabId;
      try {
        newTab = await chrome.tabs.create({ url: url, active: false });
        tabId = newTab.id;
        try {
          activeAutomationTabIds.add(tabId);
        } catch (e) {
          // ignore
        }
        await waitForTabComplete(tabId, config.timeouts.pageLoad);

        const loadCheck = await isTabLoadedSuccessfully(tabId);
        if (!loadCheck.ok) {
          const reason = loadCheck.error
            ? loadCheck.error.message
            : loadCheck.title || loadCheck.url || "Unknown";
          showNotification(
            "Lỗi",
            `Không thể tải trang ${url} — bỏ qua link này (${reason})`,
            "error"
          );
          outcome.reason = `Không thể tải trang: ${reason}`;
          markFailed(url, outcome.reason);
          return;
        }
      } catch (tabError) {
        console.error("Không thể tạo hoặc load tab:", tabError);
        showNotification(
          "Lỗi",
          `Không thể mở trang ${url}: ${tabError.message}`,
          "error"
        );
        outcome.reason = `Không thể mở trang: ${tabError.message}`;
        markFailed(url, outcome.reason);
        return;
      }

      let currentTabUrl = url;
      try {
        await closeAds(tabId);
        await delay(config.timeouts.delayBetweenActions);

        const loadCheck = await isTabLoadedSuccessfully(tabId);
        if (!loadCheck.ok) {
          const reason = loadCheck.error
            ? loadCheck.error.message
            : loadCheck.title || loadCheck.url || "Unknown";
          showNotification(
            "Lỗi",
            `Không thể tải trang ${url} — bỏ qua link này (${reason})`,
            "error"
          );
          outcome.reason = `Không thể tải trang (sau closeAds): ${reason}`;
          markFailed(url, outcome.reason);
          return;
        }

        // quick logged-in check
        let isLoggedIn = await checkXpathExist(
          tabId,
          ["//input[@name='username']", "//input[@formcontrolname='account']"],
          5
        );

        if (!isLoggedIn) {
          showNotification(
            "Thông báo",
            "Đã đăng nhập, tiến hành đăng xuất",
            "info"
          );

          const signOutUrl = currentTabUrl
            ? new URL("/Account/Register", currentTabUrl).href
            : "/Account/Register";
          await chrome.tabs.update(tabId, { url: signOutUrl });
          await waitForTabComplete(tabId, config.timeouts.pageLoad / 2);
          await delay(8000);

          const registerUrl = currentTabUrl
            ? new URL("/Account/Register", currentTabUrl).href
            : "/Account/Register";
          await chrome.tabs.update(tabId, { url: registerUrl });
          await waitForTabComplete(tabId, config.timeouts.pageLoad / 2);
          await delay(300);
        }

        const regFound = await waitForXpathWithReload(
          tabId,
          [
            "//input[@formcontrolname='account']",
            "//input[@formcontrolname='password']",
            "//input[@name='username']",
          ],
          config.timeouts.elementWait,
          async () => {
            toast("Đã vào trang đăng ký");
            await applyBulk(tabId, bulkInputData.split("|"));
          },
          async () => {
            const registerUrl = currentTabUrl
              ? new URL("/Account/Register", currentTabUrl).href
              : "/Account/Register";
            await chrome.tabs.update(tabId, { url: registerUrl });
            await waitForTabComplete(tabId, config.timeouts.pageLoad / 2);
            await delay(300);
          },
          2,
          "register_page"
        );
        if (!regFound) {
          const reason = "Không tìm thấy trang đăng ký";
          outcome.reason = reason;
          markFailed(url, reason);
          return;
        }

        await delay(2000);
        if (
          url.includes("rr88seo") ||
          url.includes("xx88com") ||
          url.includes("mm88")
        ) {
          await solveCaptchaForR88(tabId);
        } else {
          await solveCaptchaCommon(tabId);
        }

        // const exists = await checkXpathExist(
        //   tabId,
        //   '//mat-dialog-content[contains(text(), "Http failure response")]',
        //   1
        // );
        // if (exists) {
        //   return;
        // }

        // submit
        let submitSuccess = false;
        for (let k = 0; k < 2; k++) {
          try {
            await chrome.tabs.sendMessage(tabId, { action: "autoClickSubmit" });
            await delay(1000);
            submitSuccess = true;
            break;
          } catch (e) {
            if (k === 1) throw e;
            c;
          }
        }
        if (!submitSuccess) throw new Error("Failed to submit form");

        let checkExistPageAddMoney = false;
        if (
          url.includes("rr88seo") ||
          url.includes("xx88com") ||
          url.includes("mm88")
        ) {
          // checkExistPageAddMoney = await checkXpathExist(
          //   tabId,
          //   "//div[contains(text(),'Nạp Tiền')]",
          //   3
          // );

          await delay(8000);

          toast("Đã vào trang nạp tiền thành công");

          await redirectToRutTienPageForR88(tabId, currentTabUrl);

          await waitForTabComplete(tabId);
          await delay(config.timeouts.delayBetweenSteps);

          //Nhập tài khoản ngân hàng trước
          const withdrawInputFound1 = await waitForXpathWithReload(
            tabId,
            "//input[@name='withdrawT']",
            config.timeouts.elementWait,
            async () => {
              await applyThemBankForR88(tabId, bulkInputData.split("|"));
            },
            null,
            2,
            "r88_withdraw_bank"
          );
          if (!withdrawInputFound1) {
            const reason = "Không thấy input withdrawT (bank) R88";
            outcome.reason = reason;
            markFailed(url, reason);
            return;
          }
          await delay(config.timeouts.delayBetweenSteps);

          const withdrawInputFound2 = await waitForXpathWithReload(
            tabId,
            "//input[@name='withdrawT']",
            config.timeouts.elementWait,
            async () => {
              await applyNhapPassRutForR88(tabId, bulkInputData.split("|"));
            },
            null,
            2,
            "r88_withdraw_pass"
          );
          if (!withdrawInputFound2) {
            const reason = "Không thấy input withdrawT (pass) R88";
            outcome.reason = reason;
            markFailed(url, reason);
            return;
          }
          await delay(config.timeouts.delayBetweenSteps);

          await chrome.tabs.sendMessage(tabId, {
            action: "autoClickSubmitRutTienR88",
          });

          await delay(2500);

          //Chuyển sang trang nạp tiền
          await redirectToNapTienPageForR88(tabId, currentTabUrl);

          await delay(2500);

          //check có quảng cáo không
          let isAds = await checkXpathExist(
            tabId,
            ["//div[@class='ticket-content-wrapper']"],
            5
          );

          if (isAds) {
            await chrome.tabs.sendMessage(tabId, {
              action: "clickXPath",
              xpath: `//div[@class="close-btn"]`,
            });
            toast("Đã đóng quảng cáo");
          }

          await delay(2000);

          let checkOk = await checkXpathExist(
            tabId,
            "//div[contains(text(),'Nạp Tiền')]",
            3
          );

          if (checkOk) {
            toast("Thành công");
            outcome.reason = false;
            outcome.success = true;
            checkExistPageAddMoney = true;
            successList.push(url);
          } else {
            outcome.reason = "Lỗi không vào được trang nạp tiền";
            markFailed(url, outcome.reason);
            return;
          }
        }

        if (!checkExistPageAddMoney) {
          // captcha result handling
          let maxCaptchaRetries = 3;
          let captchaErrorResolved = false;
          for (let retry = 0; retry < maxCaptchaRetries; retry++) {
            const checks = [
              {
                name: "success",
                xpath:
                  "//p[contains(text(), 'chúc mừng bạn đã đăng ký thành công !!')]",
                onMatch: async () => {
                  toast("Đã tạo tài khoản thành công");
                  await redirectToRutTienPage(tabId, currentTabUrl);
                  captchaErrorResolved = true;
                },
              },
              {
                name: "captcha_error",
                xpath:
                  "//mat-dialog-content[contains(text(),'Lỗi mã xác minh hoặc lỗi đầu vào, vui lòng quay lại')]",
                onMatch: async () => {
                  if (retry < maxCaptchaRetries - 1) {
                    showNotification(
                      "Lỗi",
                      "Đã xảy ra lỗi giải captcha, thử lại...",
                      "error"
                    );
                    await solveCaptchaCommon(tabId);
                    await delay(200);
                    await chrome.tabs.sendMessage(tabId, {
                      action: "autoClickSubmit",
                    });
                    await delay(1000);
                  } else {
                    showNotification(
                      "Lỗi",
                      "Không thể giải captcha sau nhiều lần thử.",
                      "error"
                    );
                    captchaErrorResolved = false;
                  }
                },
              },
              {
                name: "http_error",
                xpath:
                  "//mat-dialog-content[contains(text(), 'Http failure response')]",
                onMatch: async () => {
                  showNotification(
                    "Lỗi",
                    "Đã xảy ra lỗi tạo tài khoản, cần kiểm tra lại !",
                    "error"
                  );
                  captchaErrorResolved = false;
                },
              },
            ];

            let matched = false;
            for (const check of checks) {
              const found = await waitForXpathWithReload(
                tabId,
                check.xpath,
                5000,
                null,
                null,
                1,
                `submit_check_${check.name}`
              );
              if (found) {
                try {
                  await check.onMatch();
                } catch (err) {
                  // swallow per-check handler errors and continue
                }
                matched = true;
                break;
              }
            }

            if (matched && captchaErrorResolved) break;
            if (!matched) {
              showNotification(
                "Lỗi",
                `Không xác định được kết quả submit cho ${url}`,
                "error"
              );
              break;
            }
          }

          if (!captchaErrorResolved) {
            outcome.reason =
              "Không thể giải captcha hoặc submit không thành công";
            markFailed(url, outcome.reason);
            return;
          }

          await waitForTabComplete(tabId);
          await delay(config.timeouts.delayBetweenSteps);

          const newPassFound = await waitForXpathWithReload(
            tabId,
            "//input[@formcontrolname='newPassword']",
            config.timeouts.elementWait,
            async () => {
              await applyNhapPassRut(tabId, bulkInputData.split("|"));
            },
            null,
            2,
            "set_new_password"
          );
          if (!newPassFound) {
            const reason = "Không thấy input newPassword";
            outcome.reason = reason;
            markFailed(url, reason);
            return;
          }
          await delay(config.timeouts.delayBetweenSteps);

          for (let k = 0; k < 2; k++) {
            await chrome.tabs.sendMessage(tabId, { action: "autoClickSubmit" });
            await delay(2200);
          }

          await delay(1000);

          await redirectToAddBankPage(tabId, currentTabUrl);
          await waitForTabComplete(tabId);
          await delay(config.timeouts.delayBetweenSteps);

          const cityFound = await waitForXpathWithReload(
            tabId,
            "//input[@formcontrolname='city']",
            config.timeouts.elementWait,
            async () => {
              await applyThemBank(tabId, bulkInputData.split("|"));
            },
            null,
            2,
            "add_bank_city"
          );
          if (!cityFound) {
            const reason = "Không thấy input city để thêm ngân hàng";
            outcome.reason = reason;
            markFailed(url, reason);
            return;
          }
          await delay(config.timeouts.delayBetweenSteps);

          for (let k = 0; k < 2; k++) {
            await chrome.tabs.sendMessage(tabId, { action: "autoClickSubmit" });
            await delay(2500);
          }

          const existsWithdrawPage = await checkXpathExist(
            tabId,
            "//p[contains(text(),'Rút tiền')]"
          );

          if (existsWithdrawPage) {
            toast("Đã thực hiện thêm thông tin ngân hàng thành công");

            // ⏳ Đợi 1 chút cho người dùng thấy thông báo rồi mới chuyển trang
            setTimeout(() => {
              chrome.scripting.executeScript({
                target: { tabId },
                func: () => {
                  window.location.href = "/Financial?tab=1";
                },
              });
            }, 1500); // đợi 1.5 giây
          } else {
            showNotification(
              "Lỗi",
              `Đã xảy ra lỗi thêm thông tin ngân hàng cho ${url}`,
              "error"
            );
            outcome.reason = "Lỗi khi thêm thông tin ngân hàng";
          }

          // If we reached here and haven't set a failure reason, consider it success
          if (!outcome.reason) {
            outcome.success = true;
            successList.push(url);
          } else {
            markFailed(url, outcome.reason);
          }

          toast(`Hoàn tất: ${url}`);
          showNotification(
            "Tiến trình",
            `Đã xử lý được ${seqIndex + 1}/${urls.length}`,
            "info"
          );
        }
      } catch (e) {
        console.error("Error processing", url, e);
        showNotification("Lỗi", `Lỗi khi xử lý ${url}: ${e.message}`, "error");
        outcome.reason = e && e.message ? e.message : String(e);
        markFailed(url, outcome.reason);
      } finally {
        // try close tab to save resources
        //Không tắt các tab để tiếp tục thao tác
        // try {
        //   if (tabId) await chrome.tabs.remove(tabId);
        // } catch (err) {}
        // remove from active set when finished
        try {
          if (tabId) activeAutomationTabIds.delete(tabId);
        } catch (err) {}
      }
    };

    // Process in batches respecting concurrency
    for (let i = 0; i < urls.length; i += concurrency) {
      if (!isAutomationRunning) break;
      const batch = urls.slice(i, i + concurrency);
      // map with index offset
      const promises = batch.map((u, idx) => processOne(u, i + idx));
      await Promise.allSettled(promises);
    }

    showNotification(
      "Hoàn tất",
      `Đã hoàn thành xử lý ${urls.length} liên kết`,
      "success"
    );

    const resultMessage = `Chạy hoàn thành tất cả ${urls.length} liên kết !`;
    // Save summary and structured details so popup can show precise results
    await chrome.storage.local.set({
      sequenceResult: resultMessage,
      sequenceResultDetails: {
        total: urls.length,
        success: successList,
        failed: failedReasons,
      },
    });
    chrome.runtime.sendMessage({
      action: "updateSequenceResult",
      message: resultMessage,
      details: {
        total: urls.length,
        success: successList,
        failed: failedReasons,
      },
    });
  } catch (error) {
    console.error("Lỗi trong runSequentialCreate:", error);
    const errorMessage = `Lỗi khi thực hiện sequence: ${error.message}`;
    showNotification("Lỗi", errorMessage, "error");
    await chrome.storage.local.set({ sequenceResult: errorMessage });
    chrome.runtime.sendMessage({
      action: "updateSequenceResult",
      message: errorMessage,
    });
  } finally {
    isAutomationRunning = false;
    currentProgress = { current: 0, total: 0, step: "" };
  }
}

async function waitForAnyXpath(tabId, xpaths, timeout = 5000) {
  // Use waitForXpathWithReload with zero reloads to leverage unified return values
  const start = Date.now();
  const perXPathTimeout = Math.max(500, Math.floor(timeout / xpaths.length));

  for (const xp of xpaths) {
    if (!isAutomationRunning) throw new Error("Automation stopped");
    const remaining = timeout - (Date.now() - start);
    if (remaining <= 0) break;

    // Wait for this xpath, but don't perform reloads here (maxReloads = 0)
    try {
      const res = await waitForXpathWithReload(
        tabId,
        xp,
        Math.min(perXPathTimeout, remaining),
        null,
        null,
        0,
        null
      );
      if (res) return xp;
    } catch (e) {
      // If automation stopped, rethrow; otherwise continue to next xpath
      if (String(e).includes("Automation stopped")) throw e;
    }
  }

  throw new Error("Không match xpath nào");
}

// Hàm downloadAccount (trong background script)
async function downloadAccountInBackground() {
  const content = await getBulkInputContentFromStorage();
  if (!content)
    return showNotification("Thông báo", "Không có dữ liệu để tải!", "warning");

  const lines = content
    .split(/\|\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  const pretty = lines.join("\n");

  // Lưu vào một key đặc biệt để popup có thể đọc và tải xuống
  await chrome.storage.local.set({ finalAccountsToDownload: pretty });
  showNotification(
    "Thông báo",
    "Dữ liệu đã sẵn sàng để tải. Mở popup để tải xuống!",
    "success"
  );

  // Gửi một tin nhắn đến popup để kích hoạt tải xuống
  chrome.runtime.sendMessage({ action: "triggerDownloadFromPopup" });
}

// Hàm lấy nội dung bulkInput từ storage
async function getBulkInputContentFromStorage() {
  const saved = await chrome.storage.local.get(["bulkInputData"]);
  return (saved && saved.bulkInputData) || "";
}

// Hàm hiển thị thông báo (sử dụng API của Chrome Notification)
function showNotification(title, message, type = "info") {
  // If config or notifications is missing, treat missing flags as enabled.
  if (type === "error" && config?.notifications?.showErrors === false) return;
  if (type === "success" && config?.notifications?.showSuccess === false)
    return;

  chrome.notifications.create({
    type: "basic",
    iconUrl: "images/icon48.png",
    title: title,
    message: message,
    priority: 2,
    requireInteraction: type === "error",
  });
}

// Hàm toast (có thể giống showNotification hoặc nhẹ hơn)
function toast(message) {
  console.log("[Smart Autofill Pro - Background]", message);
  // Send to popup for display
  chrome.runtime.sendMessage({
    action: "showNotification",
    message: message,
    type: "info",
  });
}

// Hàm ẩn progress bar
function hideProgressBar() {
  chrome.runtime.sendMessage({
    action: "hideProgress",
  });
}

//proxy
function parseProxyString(str) {
  const parts = str.split(":");
  if (parts.length === 2) {
    return { ip: parts[0], port: parts[1] };
  } else if (parts.length === 4) {
    return {
      ip: parts[0],
      port: parts[1],
      username: parts[2],
      password: parts[3],
    };
  }
  return null;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "checkProxy") {
    const proxy = parseProxyString(message.proxy);
    if (!proxy) {
      sendResponse({ result: "Proxy không hợp lệ!" });
      return true;
    }
    sendResponse({
      result:
        "Định dạng proxy hợp lệ (chỉ kiểm tra cú pháp, muốn kiểm tra thực tế hãy lưu và thử vào trang kiểm tra IP).",
    });
    return true;
  }

  if (message.action === "setProxy") {
    const proxy = parseProxyString(message.proxy);
    if (!proxy) {
      sendResponse({ result: "Proxy không hợp lệ!" });
      return true;
    }

    let config = {
      mode: "fixed_servers",
      rules: {
        singleProxy: {
          scheme: "http",
          host: proxy.ip,
          port: parseInt(proxy.port),
        },
      },
    };
    if (proxy.username && proxy.password) {
      chrome.storage.local.set({
        proxyAuth: { username: proxy.username, password: proxy.password },
      });
    } else {
      chrome.storage.local.remove("proxyAuth");
    }

    chrome.proxy.settings.set({ value: config, scope: "regular" }, () => {
      sendResponse({
        result:
          "Đã đổi proxy cho Chrome! Bạn hãy truy cập trang kiểm tra IP để xác thực.",
      });
    });
    return true;
  }
});

chrome.webRequest.onAuthRequired.addListener(
  function (details, callback) {
    chrome.storage.local.get("proxyAuth", function (data) {
      if (data.proxyAuth) {
        callback({ authCredentials: data.proxyAuth });
      } else {
        callback();
      }
    });
  },
  { urls: ["<all_urls>"] },
  ["asyncBlocking"]
);

// --- Hàm thông báo đơn giản ---
function showNotification(message, type = "info") {
  const icon = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
  console.log(`${icon} ${message}`);
}

// --- Nhận yêu cầu lấy API key từ content script ---
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.action === "getApiKey") {
    (async () => {
      try {
        const apikey = APIKEY_CAPCHA || "ec53477299cfbbf89cd4bb66d21de723";

        if (!APIKEY_CAPCHA) {
          showNotification("❌ JSON không chứa API key", "error");
          sendResponse({ success: false, error: "Không có apikey trong JSON" });
          return;
        }

        showNotification(`✅ API key tải thành công: ${apiKey}`, "success");
        sendResponse({ success: true, apiKey });
      } catch (err) {
        console.error("❌ Lỗi khi tải DEFAULT_API_KEY:", err);
        sendResponse({
          success: false,
          error: err.message || "Lỗi không xác định",
        });
      }
    })();

    return true; // Giữ sendResponse hoạt động cho async
  }
});
