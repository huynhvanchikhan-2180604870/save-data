let tokendomi = "";
let linkdomi = "";

async function loadTokenAndLink() {
  

  const api = "ec53477299cfbbf89cd4bb66d21de723";

  console.log("📦 Dữ liệu JSON:", api);
}

// Gọi hàm khi extension chạy
loadTokenAndLink();



chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get('userData', (data) => {
        if (!data.userData) {
            chrome.storage.local.set({ userData: null });
        }
    });
});



chrome.commands.onCommand.addListener(function(command) {
  if (command === "open_extension") {
    // Mở giao diện tiện ích
    chrome.browserAction.openPopup(); // Hoặc mở một tab mới với trang bạn muốn
  }
});




// Gửi lệnh ban đầu đến content script
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "solveDynamicCaptchaMenu") {
    chrome.tabs.sendMessage(tab.id, { action: "initiateSolveProcess" });
  }
});

// Lắng nghe yêu cầu giải mã từ content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "solveImage") {
    chrome.storage.sync.get(['apiKey'], function(result) {
      if (!result.apiKey) {
        // Gửi lỗi về cho content script để hiển thị
        chrome.tabs.sendMessage(sender.tab.id, { action: "error", message: "Chưa nhập API Key." });
        return;
      }
      // Bắt đầu giải và gửi kết quả về tab gốc
      solveWithApi(request.base64, result.apiKey, sender.tab.id);
    });
  }
  return true; // Cho phép gửi phản hồi bất đồng bộ
});

// Hàm gọi API (tên chung, có thể là anticaptcha.top hoặc dịch vụ khác)
async function solveWithApi(base64Image, clientKey, tabId) {
  try {
    const createTaskResponse = await fetch('https://anticaptcha.top/api/captcha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientKey: clientKey,
        task: { type: "ImageToTextTask", body: base64Image, captchaType: 14 }
      })
    });
    const taskData = await createTaskResponse.json();

    if (taskData.errorId > 0) {
      throw new Error(taskData.errorDescription);
    }
    
    // Bắt đầu quá trình kiểm tra kết quả
    getCaptchaResult(clientKey, taskData.taskId, tabId, 20);

  } catch (error) {
    chrome.tabs.sendMessage(tabId, { action: "error", message: `Lỗi API: ${error.message}` });
  }
}

async function getCaptchaResult(clientKey, taskId, tabId, retries) {
    if (retries <= 0) {
        chrome.tabs.sendMessage(tabId, { action: "error", message: 'Hết thời gian chờ kết quả.' });
        return;
    }
    try {
        const response = await fetch('https://anticaptcha.top/api/captcha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientKey: clientKey, taskId: taskId })
        });
        const data = await response.json();
        if (data.errorId > 0) throw new Error(data.errorDescription);

        if (data.status === 'processing') {
            setTimeout(() => getCaptchaResult(clientKey, taskId, tabId, retries - 1), 3000);
        } else if (data.status === 'ready') {
        } else if (data.status === 'ready') {
            // Gửi kết quả cuối cùng về cho content script
            chrome.tabs.sendMessage(tabId, {
                action: "fillResult",
                solution: data.solution.text
            });
        }
    } catch (error) {
        chrome.tabs.sendMessage(tabId, { action: "error", message: `Lỗi lấy kết quả: ${error.message}` });
    }
}


///////
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "myMenuId",
    title: "✨ Coding by LUHOAIAN xin chào bạn",
    contexts: ["all"]
  });
});
chrome.runtime.onInstalled.addListener(() => {
  // Menu 1: Đổi mật khẩu tiền
  chrome.contextMenus.create({
    id: "thuesim",
    title: "🕵️‍♀️Liên hệ : @luhoaian1",
    contexts: ["all"]
  });

  // Menu 2: Link Bank
  chrome.contextMenus.create({
    id: "goTo",
    title: "ㅤ",
    contexts: ["all"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab || !tab.url) return;

  const url = new URL(tab.url);
  let newPath = "";

  if (info.menuItemId === "thuesim") {
    newPath = "https://t.me/luhoaian1";
  }

  if (info.menuItemId === "goTo") {
    newPath = "";
  }

  const fullUrl = `${newPath}`;
  chrome.tabs.update(tab.id, { url: fullUrl });
});






chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "changeMoneyPassword",
    title: "🔑 Đổi mật khẩu tiền",
    contexts: ["page"]
  });

  chrome.contextMenus.create({
    id: "linkNhacai",
    title: "🔗 Link Nhà Cái Của Bạn",
    contexts: ["page"]
  });

  chrome.contextMenus.create({
    id: "linkBank",
    title: "🏦 Link Bank",
    contexts: ["page"]
  });

  chrome.contextMenus.create({
    id: "depositMoney",
    title: "💰 Nạp tiền",
    contexts: ["page"]
  });
  chrome.contextMenus.create({
    id: "depositMoneyx",
    title: "ㅤ",
    contexts: ["page"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab || !tab.url) return;

  const url = new URL(tab.url);
  let targetUrl = "";

  switch (info.menuItemId) {
    case "changeMoneyPassword":
      targetUrl = `${url.origin}/Account/ChangeMoneyPassword`;
      break;
    case "linkBank":
      targetUrl = `${url.origin}/financial/?tab=3`;
      break;
    case "linkNhacai":
      targetUrl = `${linkdomi}/v6nhacai/${tokendomi}.json`;
      break;
    case "depositMoney":
      targetUrl = `${url.origin}/financial/?tab=1`;
      break;
    case "depositMoneyx":
      targetUrl = ``;
      break;
  }

  if (targetUrl) {
    chrome.tabs.update(tab.id, { url: targetUrl }); // 🚀 Chuyển trang trong tab hiện tại
  }
});

//mở tab chung
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "openCommonTabs",
    title: "🌀 Mở tab sổ chung",
    contexts: ["page"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openCommonTabs") {
    fetch(`${linkdomi}/v6data0/${tokendomi}.json`)
      .then(response => response.json())
      .then(data => {
        data.forEach(item => {
          if (item.link) {
            chrome.tabs.create({ url: item.link });
          }
        });
      })
      .catch(err => {
        console.error("❌ Lỗi khi lấy JSON:", err);
      });
  }
});


chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "openWindowFromJson",
    title: "🪟 Mở cửa sổ riêng",
    contexts: ["page"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openWindowFromJson") {
    // ✅ Thông báo đang mở
    chrome.notifications?.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "Coding by LUHOAIAN",
      message: "🔄 Mở các của sổ nhà cái"
    });

    const jsonUrl = `${linkdomi}/v6data0/${tokendomi}.json`;

    fetch(jsonUrl)
      .then(response => response.json())
      .then(data => {
        let left = 100;
        let top = 100;

        data.forEach((item, index) => {
          if (item.link) {
            chrome.windows.create({
              url: item.link,
              type: "normal",
              width: 300,
              height: 800,
              left: left,
              top: top,
              focused: true // đảm bảo mở xong nằm trên cùng
            });

            // mỗi cửa sổ lệch 30px để không chồng lên nhau
            left += 90;
            top += 30;
          }
        });
      })
      .catch(error => {
        console.error("❌ Lỗi khi tải JSON:", error);
        chrome.notifications?.create({
          type: "basic",
          iconUrl: "icon.png",
          title: "Coding by LUHOAIAN",
          message: "❌ Không thể tải dữ liệu JSON!"
        });
      });
  }
});


async function fetchData() {
  const response = await fetch(`${linkdomi}/v6data1/${tokendomi}.json`);
  return await response.json();
}

// Tạo menu chính khi extension được cài hoặc reload
chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: "mainMenu",
    title: "🔗 Danh sách nhà cái",
    contexts: ["all"]
  });

  const data = await fetchData();

  data.forEach((item, index) => {
    chrome.contextMenus.create({
      id: `item_${index}`,
      parentId: "mainMenu",
      title: item.noidung,
      contexts: ["all"]
    });
  });
});

// Sự kiện khi click vào item
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const data = await fetchData();
  const item = data.find((item, index) => info.menuItemId === `item_${index}`);
  if (item) {
    chrome.tabs.create({ url: item.link });
  }
});




// Tạo menu chuột phải từ dữ liệu JSON
chrome.runtime.onInstalled.addListener(() => {
  fetch(`${linkdomi}/v6data3/${tokendomi}.json`)
    .then(response => response.json())
    .then(data => {
      data.forEach((item, index) => {
        chrome.contextMenus.create({
          id: `menu_${index}`,
          title: `${item.noidung}`,
          contexts: ["all"]
        });
      });

      // Lưu data vào storage để truy cập khi click
      chrome.storage.local.set({ menuData: data });
    });
});

// Xử lý khi click menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
  chrome.storage.local.get("menuData", (result) => {
    const data = result.menuData || [];
    const matchedIndex = parseInt(info.menuItemId.replace("menu_", ""));
    const matchedItem = data[matchedIndex];

    if (matchedItem && matchedItem.link) {
      chrome.tabs.create({ url: matchedItem.link });
    }
  });
});

