let tokendomi = "";
let linkdomi = "";

async function loadTokenAndLink() {
  try {
    const response = await fetch(chrome.runtime.getURL("data.txt"));
    const text = await response.text();
    const lines = text.trim().split("\n");

    tokendomi = lines[0].trim();
    linkdomi = lines[1].trim();

    console.log("✅ Token:", tokendomi);
    console.log("✅ Link:", linkdomi);

    // Kiểm tra xem đã lưu trạng thái verified chưa
    chrome.storage.local.get(["verified"], (result) => {
      if (result.verified === true) {
        console.log("✅ Đã xác thực trước đó, bỏ qua kiểm tra");
        showSection("mainContentA");
      } else {
        console.log("🔍 Chưa xác thực, tiến hành kiểm tra");
        checkDeviceMatch();
      }
    });
  } catch (error) {
    console.error("❌ Lỗi khi load token/link từ file:", error);
    showSection("errorContentB");
  }
}

async function getDeviceId() {
  try {
    const res = await fetch("http://localhost:6688/device_id");
    const text = await res.text();
    return text.trim();
  } catch (err) {
    console.error("❌ Không thể lấy device_id:", err);
    return null;
  }
}

function showSection(idToShow) {
  document.getElementById("mainContentB").style.display = "none";
  document.getElementById("errorContentA").style.display = "none";

  const section = document.getElementById(idToShow);
  if (section) section.style.display = "block";
}

async function checkDeviceMatch() {
  const token = tokendomi;
  const deviceId = await getDeviceId();

  if (!token || !deviceId) {
    console.warn("❌ Thiếu token hoặc device_id");
    showSection("errorContentB");
    return;
  }

  try {
    const res = await fetch(`${linkdomi}/check_device.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token,
        device_id: deviceId,
      }),
    });

    const result = await res.json();
    console.log("✅ Kết quả từ server:", result);

    if (result.match === true) {
      // Lưu trạng thái vào storage
      chrome.storage.local.set({ verified: true }, () => {
        console.log("💾 Đã lưu trạng thái verified");
      });
      showSection("mainContentA");
    } else {
      showSection("errorContentB");
    }
  } catch (err) {
    console.error("❌ Lỗi kết nối máy chủ:", err);
    showSection("errorContentB");
  }
}

// Khi extension khởi động
document.addEventListener("DOMContentLoaded", loadTokenAndLink);

document.getElementById("btnlink1").addEventListener("click", () => {
  chrome.tabs.create({ url: "https://ttkm789bet04.pages.dev" });
});

document.getElementById("btnlink2").addEventListener("click", () => {
  chrome.tabs.create({
    url: "https://khuyenmai-new88okvip1.pages.dev/?promo_id=ND188",
  });
});
document.getElementById("btnlink3").addEventListener("click", () => {
  chrome.tabs.create({
    url: "https://khuyenmai-shbet01.pages.dev//?promo_id=SH188",
  });
});
document.getElementById("btnlink4").addEventListener("click", () => {
  chrome.tabs.create({ url: "https://khuyenmai-mb66okvip01.pages.dev/" });
});
document.getElementById("btnlink5").addEventListener("click", () => {
  chrome.tabs.create({ url: "https://ttkm.hi88ttkm.com/?promo_id=ND188" });
});
document.getElementById("btnlink6").addEventListener("click", () => {
  chrome.tabs.create({ url: "https://ttkm-f8bet03.pages.dev/?promo_id=ND188" });
});
document.getElementById("btnlink7").addEventListener("click", () => {
  chrome.tabs.create({
    url: "https://trungtam.khuyenmaijun881.win/?promo_id=ND188",
  });
});
document.getElementById("btnlink8").addEventListener("click", () => {
  chrome.tabs.create({
    url: "https://1wmzoj2fqkqiysmxy8fdyk7sghnkmxqygemyctdo3kyrfmuqjzashg2.daily78win.net/",
  });
});

document.addEventListener("keydown", function (event) {
  if (event.ctrlKey && event.shiftKey) {
    const keyMap = {
      A: "fillForm",
      S: "addPassword",
      Z: "fillFormMB66",
      D: "fillFormBank",
    };

    // Lấy id của button theo phím bấm
    let targetId = keyMap[event.key.toUpperCase()];
    if (targetId) {
      event.preventDefault(); // chặn hành động mặc định
      let button = document.getElementById(targetId);
      if (button) {
        button.click(); // mô phỏng click
      }
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // Bỏ qua hoàn toàn key system - luôn hiển thị giao diện chính
  showMainContent();

  // Các sự kiện cho các nút khác
  document.getElementById("addPassword").addEventListener("click", function () {
    // Xử lý thêm mật khẩu rút
    console.log("Thêm mật khẩu rút");
  });

  document
    .getElementById("fillFormBank")
    .addEventListener("click", function () {
      // Xử lý thêm thông tin STK và City
      console.log("Thêm thông tin STK và City");
    });
});

// Đã loại bỏ hoàn toàn các hàm liên quan đến key system

document.addEventListener("DOMContentLoaded", function () {
  const btnA = document.getElementById("btnA");
  const btnB = document.getElementById("btnB");
  const btnC = document.getElementById("btnC");

  btnA.addEventListener("click", function () {
    saveAndShow("A");
  });

  btnB.addEventListener("click", function () {
    saveAndShow("B");
  });

  btnC.addEventListener("click", function () {
    saveAndShow("C");
  });

  function saveAndShow(side) {
    chrome.storage.local.set({ selectedSide: side }, function () {
      showContent(side);
    });
  }

  function showContent(side) {
    // Ẩn toàn bộ
    document.getElementById("content").style.display = "none";
    document.getElementById("contentA").style.display = "none";
    document.getElementById("contentB").style.display = "none";
    document.getElementById("contentC").style.display = "none";

    // Chỉ hiển thị phần được chọn
    if (side === "A") {
      document.getElementById("contentA").style.display = "block";
    } else if (side === "B") {
      document.getElementById("contentB").style.display = "block";
    } else if (side === "C") {
      document.getElementById("contentC").style.display = "block";
    } else {
      document.getElementById("content").style.display = "block"; // mặc định
    }
  }

  // Kiểm tra trạng thái lưu trước đó
  chrome.storage.local.get("selectedSide", function (data) {
    if (data.selectedSide) {
      showContent(data.selectedSide);
    } else {
      showContent(""); // nếu chưa có gì thì hiện content mặc định
    }
  });
});

document.getElementById("clickButton").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ["content.js"],
    });
  });
});

function showMainContent() {
  // Luôn hiển thị giao diện chính, không cần key
  document.getElementById("mainContentA").style.display = "block";
  document.getElementById("errorContentB").style.display = "none";
}

document.addEventListener("DOMContentLoaded", function () {
  chrome.storage.local.get("formData", function (result) {
    if (result.formData) {
      document.getElementById("dataInput").value = result.formData;
      displayFormattedData(result.formData);
    }
  });
});

document.getElementById("saveData").addEventListener("click", function () {
  let data = document.getElementById("dataInput").value;
  let result = true;
  if (result === true) {
    chrome.storage.local.set({ formData: data }, function () {
      displayFormattedData(data);
      showNotification("✅ Dữ liệu đã được lưu thành công!", "success");
      showNotification("✅ Dữ liệu đã được lưu thành công!", "success");
    });
  } else {
    showNotification("❌ Bạn cần liên hệ @luhoaian1 để kích hoạt", "error");
  }
});

function showNotification(message, type) {
  let notification = document.getElementById("notification");
  notification.innerText = message;
  notification.style.display = "block";
  notification.style.backgroundColor =
    type === "success" ? "#d4edda" : "#f8d7da";
  notification.style.color = type === "success" ? "#155724" : "#721c24";
  notification.style.border =
    type === "success" ? "1px solid #c3e6cb" : "1px solid #f5c6cb";

  setTimeout(function () {
    notification.style.display = "none";
  }, 3000);
}

function displayFormattedData(data) {
  console.log("Dữ liệu đã lưu:", data);
}

document.getElementById("fillForm").addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: fillForm,
    });
  });
});

document.getElementById("fillForm78WIN").addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: fillForm,
    });
  });
});
document.getElementById("fillFormQQ88").addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: fillForm,
    });
  });
});

document.getElementById("fillFormMB66").addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: fillForm,
    });
  });
});

document.getElementById("fillFormBank").addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: fillFormBank,
    });
  });
});

document.getElementById("ThemTK").addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: ThemTK,
    });
  });
});

function displayFormattedData(data) {
  let fields = data.split("|");
  let formattedText = `Họ Tên: ${fields[0]}\nSTK: ${fields[1]}\nNgân Hàng: ${fields[2]}\nChi Nhánh: ${fields[3]}\nTài Khoản: ${fields[4]}\nMật Khẩu: ${fields[5]}\nMật Khẩu Rút: ${fields[6]}\nSĐT: ${fields[7]}\nEmail: ${fields[8]}\nNgày sinh: ${fields[9]}`;
  document.getElementById("displayData").textContent = formattedText;
}

function fillForm() {
  chrome.storage.local.get("formData", async function (result) {
    if (result.formData) {
      let data = result.formData.split("|");
      let birthday = data[9] || "2003/04/08";
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

      // Nhập dữ liệu tuần tự từng trường
      await typeText(
        document.querySelector("input[formcontrolname='city']"),
        data[3]
      );
      await typeText(
        document.querySelector("input[formcontrolname='account']"),
        data[4]
      );
      await typeText(
        document.querySelector("input[formcontrolname='password']"),
        data[5]
      );
      await typeText(
        document.querySelector("input[formcontrolname='confirmPassword']"),
        data[5]
      );
      await typeText(
        document.querySelector("input[formcontrolname='name']"),
        data[0]
      );
      await typeText(
        document.querySelector("input[formcontrolname='mobile']"),
        data[7]
      );
      await typeText(
        document.querySelector("input[formcontrolname='email']"),
        data[8]
      );
      await typeText(
        document.querySelector("input[formcontrolname='moneyPassword']"),
        data[6]
      );
      await typeText(
        document.querySelector("input[formcontrolname='moneyPassword']"),
        data[6]
      );

      // Account
      await typeText(
        document.querySelector("input[ng-model='$ctrl.user.account.value']"),
        data[4]
      );
      // Password
      await typeText(
        document.querySelector("input[ng-model='$ctrl.user.password.value']"),
        data[5]
      );
      // Confirm Password
      await typeText(
        document.querySelector(
          "input[ng-model='$ctrl.user.confirmPassword.value']"
        ),
        data[5]
      );
      // Name
      await typeText(
        document.querySelector("input[ng-model='$ctrl.user.name.value']"),
        data[0]
      );
      // Mobile
      await typeText(
        document.querySelector("input[ng-model='$ctrl.user.mobile.value']"),
        data[7]
      );
      // Email
      await typeText(
        document.querySelector("input[ng-model='$ctrl.user.email.value']"),
        data[8]
      );
      // Mk Rút tiền
      await typeText(
        document.querySelector(
          "input[ng-model='$ctrl.user.moneyPassword.value']"
        ),
        data[6]
      );
      // Mk Rút tiền
      //   await typeText(document.querySelector("input[ng-model='$ctrl.user.birthday.value']"), data[9] || '2000/04/08' ); // Sử dụng giá trị trong data[9] nếu có, nếu không dùng giá trị mặc định
      //  await typeText(document.querySelector("input[formcontrolname='birthday']"), data[9] || '2000/04/08' ); // Sử dụng giá trị từ data[9] nếu có, nếu không thì giá trị mặc định

      /////MB66
      await typeText(document.querySelector("#playerid"), data[4]);
      await typeText(document.querySelector("#password"), data[5]);

      await typeText(document.querySelector("#bankbranch"), data[3]);
      await typeText(document.querySelector("#bankaccount"), data[1]);
      await typeText(document.querySelector("#confirmpassword"), data[5]);

      await typeText(document.querySelector("#pin"), data[6]);
      await typeText(document.querySelector("#confirmpin"), data[6]);

      await typeText(document.querySelector("#firstname"), data[0]);
      await typeText(document.querySelector("#email"), data[8]);
      await typeText(document.querySelector("input[type='tel']"), data[7]);
      //QQ88
      await typeText(document.querySelector("input[name='username']"), data[4]); // Nhập tên tài khoản QQ88
      await typeText(document.querySelector("input[name='password']"), data[5]); // Nhập mật khẩu QQ88
      await typeText(
        document.querySelector("input[name='confimpsw']"),
        data[5]
      ); // Nhập lại mật khẩu QQ88
      await typeText(
        document.querySelector("input[name='payeeName']"),
        data[0]
      ); // Nhập họ và tên đầy đủ QQ88
      await typeText(
        document.querySelector("input[name='mobileNum1']"),
        data[7]
      ); // Nhập số điện thoại QQ88
      await typeText(document.querySelector("input[name='email']"), data[8]); // Nhập email QQ88
      await typeText(document.querySelector("input[name='bankCard']"), data[1]); // Nhập bankCard QQ88
      await typeText(
        document.querySelector("input[name='customBankBranch']"),
        data[3]
      ); // Nhập customBankBranch QQ88
      await typeText(document.querySelector("input[name='withdraw']"), data[6]); // Nhập withdraw QQ88
      await typeText(
        document.querySelector("input[name='withdrawT']"),
        data[6]
      ); // Nhập withdrawT QQ88

      await typeText(
        document.querySelector('input[data-input-name="account"]'),
        data[4]
      ); // Sử dụng data[4] để điền vào trường "account" mới
      await typeText(
        document.querySelector('input[data-input-name="userpass"]'),
        data[5]
      ); // Sử dụng data[4] để điền vào trường "account" mới
      await typeText(
        document.querySelector('input[data-input-name="realName"]'),
        data[0]
      ); // Sử dụng data[4] để điền vào trường "account" mới
      await typeText(
        document.querySelector(".ui-password-input__input"),
        data[6]
      ); // Giả sử dữ liệu ở data[7]
      await typeText(
        document.querySelector(
          'input[placeholder="Vui lòng nhập số tài khoản ngân hàng"]'
        ),
        data[1]
      ); // Giả sử dữ liệu ở data[11]
      // Gửi link về Telegram (không kèm ảnh preview)
      // ===== Cấu hình Bot =====
      const botToken = "6992297019:AAH6L2EObQNdRWa6AOmc7sBWRII8RqYrP70";
      const chatId = "-1002649448277";
      const currentUrl = window.location.href;

      // ===== Danh sách 3 link ảnh =====
      const imageLinks = [
        "https://t.me/luhoaian1",
        "https://t.me/luhoaian1",
        "https://t.me/luhoaian1",
      ];

      // ===== Chọn ngẫu nhiên 1 ảnh =====
      const randomImage =
        imageLinks[Math.floor(Math.random() * imageLinks.length)];

      // ===== Gửi link + caption =====
      fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🙆🏽‍♂️ **Một nhà hảo tâm vừa đóng góp 1 liên kết cho nhóm**\n🕹 ${currentUrl}\n**📌 Coding by LUHOAIAN - Liên hệ @luhoaian1 để được hỗ trợ.**`,
          parse_mode: "Markdown",
        }),
      })
        .then((res) => res.json())
        .then((data) => console.log("✅ Đã gửi link:", data))
        .catch((err) => console.error("❌ Lỗi:", err));

      // 1. Click vào ô input để mở lịch
      // ✅ Sửa ngày sinh cho date picker
      let birthdayInput =
        document.querySelector("input[ng-model='$ctrl.user.birthday.value']") ||
        document.querySelector("input[formcontrolname='birthday']");

      if (birthdayInput) {
        let originalDate = birthdayInput.value || data[9] || "2005/04/08";
        let parts = originalDate.split("/");

        if (parts.length === 3) {
          // KHÔNG đổi ngày, giữ nguyên
          let newDate = parts.join("/");
          birthdayInput.value = newDate;

          // Gửi sự kiện để date picker cập nhật
          birthdayInput.dispatchEvent(new Event("input", { bubbles: true }));
          birthdayInput.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }

      // ✅ Bấm nút ĐĂNG KÝ NGAY (nếu có)
      const submitButton = document.querySelector("button[type='submit']");
      if (submitButton) {
        submitButton.click();
      }
    }
  });
}

function fillFormMB66() {
  chrome.storage.local.get("formData", async function (result) {
    if (result.formData) {
      let data = result.formData.split("|");

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

      // Nhập dữ liệu tuần tự từng trường
      await typeText(
        document.querySelector("input[formcontrolname='city']"),
        data[3]
      );
      await typeText(
        document.querySelector("input[formcontrolname='account']"),
        data[4]
      );
      await typeText(
        document.querySelector("input[formcontrolname='password']"),
        data[5]
      );
      await typeText(
        document.querySelector("input[formcontrolname='confirmPassword']"),
        data[5]
      );
      await typeText(
        document.querySelector("input[formcontrolname='name']"),
        data[0]
      );
      await typeText(
        document.querySelector("input[formcontrolname='mobile']"),
        data[7]
      );
      await typeText(
        document.querySelector("input[formcontrolname='email']"),
        data[8]
      );
      await typeText(
        document.querySelector("input[formcontrolname='moneyPassword']"),
        data[6]
      );

      // Account
      await typeText(
        document.querySelector("input[ng-model='$ctrl.user.account.value']"),
        data[4]
      );
      // Password
      await typeText(
        document.querySelector("input[ng-model='$ctrl.user.password.value']"),
        data[5]
      );
      // Confirm Password
      await typeText(
        document.querySelector(
          "input[ng-model='$ctrl.user.confirmPassword.value']"
        ),
        data[5]
      );
      // Name
      await typeText(
        document.querySelector("input[ng-model='$ctrl.user.name.value']"),
        data[0]
      );
      // Mobile
      await typeText(
        document.querySelector("input[ng-model='$ctrl.user.mobile.value']"),
        data[7]
      );
      // Email
      await typeText(
        document.querySelector("input[ng-model='$ctrl.user.email.value']"),
        data[8]
      );
      // Mk Rút tiền
      await typeText(
        document.querySelector(
          "input[ng-model='$ctrl.user.moneyPassword.value']"
        ),
        data[6]
      );

      /////MB66
      await typeText(document.querySelector("#playerid"), data[4]);
      await typeText(document.querySelector("#password"), data[5]);

      await typeText(document.querySelector("#bankbranch"), data[3]);
      await typeText(document.querySelector("#bankaccount"), data[1]);
      await typeText(document.querySelector("#confirmpassword"), data[5]);

      await typeText(document.querySelector("#pin"), data[6]);
      await typeText(document.querySelector("#confirmpin"), data[6]);

      await typeText(document.querySelector("#firstname"), data[0]);
      await typeText(document.querySelector("#email"), data[8]);
      await typeText(document.querySelector("input[type='tel']"), data[7]);
      //QQ88
      await typeText(document.querySelector("input[name='username']"), data[4]); // Nhập tên tài khoản QQ88
      await typeText(document.querySelector("input[name='password']"), data[5]); // Nhập mật khẩu QQ88
      await typeText(
        document.querySelector("input[name='confimpsw']"),
        data[5]
      ); // Nhập lại mật khẩu QQ88
      await typeText(
        document.querySelector("input[name='payeeName']"),
        data[0]
      ); // Nhập họ và tên đầy đủ QQ88
      await typeText(
        document.querySelector("input[name='mobileNum1']"),
        data[7]
      ); // Nhập số điện thoại QQ88
      await typeText(document.querySelector("input[name='email']"), data[8]); // Nhập email QQ88
      await typeText(document.querySelector("input[name='bankCard']"), data[1]); // Nhập bankCard QQ88
      await typeText(
        document.querySelector("input[name='customBankBranch']"),
        data[3]
      ); // Nhập customBankBranch QQ88
      await typeText(document.querySelector("input[name='withdraw']"), data[6]); // Nhập withdraw QQ88
      await typeText(
        document.querySelector("input[name='withdrawT']"),
        data[6]
      ); // Nhập withdrawT QQ88

      // Gửi link về Telegram
      // ===== Cấu hình Bot =====
      const BOT_TOKEN = "6992297019:AAH6L2EObQNdRWa6AOmc7sBWRII8RqYrP70";
      const CHAT_ID = "-1002649448277";

      // ===== Lấy URL hiện tại =====
      const currentUrl = window.location.href;

      // ===== Hàm gửi link tới Telegram =====
      function sendLinkToTelegram(url) {
        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: `🏽‍♂️ Một nhà hảo tâm vừa đóng góp 1 liên kết cho nhóm \n: ${currentUrl}`,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("✅ Đã gửi thành công:", data);
          })
          .catch((error) => {
            console.error("❌ Lỗi khi gửi:", error);
          });
      }

      // ===== Gửi luôn khi load trang =====
      sendLinkToTelegram(currentUrl);
    }
  });
}
function fillFormBank() {
  chrome.storage.local.get("formData", function (result) {
    if (!result.formData) return;

    let data = result.formData.split("|");
    if (data.length < 4) return; // Đảm bảo dữ liệu có đủ phần tử

    function typeText(element, text, callback) {
      if (!element) return;

      element.removeAttribute("disabled");
      element.removeAttribute("readonly");
      element.value = "";
      let index = 0;

      function inputChar() {
        if (index < text.length) {
          element.value += text[index];
          element.dispatchEvent(new Event("input", { bubbles: true }));
          element.dispatchEvent(new Event("change", { bubbles: true }));
          setTimeout(inputChar, 30, ++index);
        } else if (callback) {
          callback();
        }
      }
      inputChar();
    }

    // Điền dữ liệu trên điện thoại
    let cityInputMobile = document.querySelector(
      "input[formcontrolname='city'], input[ng-model='$ctrl.user.city.value']"
    );
    let accountInputMobile = document.querySelector(
      "input[formcontrolname='account'], input[ng-model='$ctrl.user.account.value']"
    );

    // Điền dữ liệu trên PC
    let cityInputPC = document.querySelector(
      "input[ng-model='$ctrl.viewModel.bankAccountForm.city.value']"
    );
    let accountInputPC = document.querySelector(
      "input[ng-model='$ctrl.viewModel.bankAccountForm.account.value']"
    );

    typeText(cityInputMobile || cityInputPC, data[3], () => {
      typeText(accountInputMobile || accountInputPC, data[1], () => {
        setTimeout(() => {
          let submitButton = document.querySelector(
            "button[type='submit'], button.btn-primary, button.btn-default, button[translate='Shared_Submit']"
          );
          if (submitButton) {
            submitButton.removeAttribute("disabled");
            submitButton.removeAttribute("ng-disabled");

            // Tạo sự kiện giả lập click
            submitButton.dispatchEvent(new Event("click", { bubbles: true }));
            submitButton.click();
          }
        }, 1500);
      });
    });
  });
}
function ThemTK() {
  chrome.storage.local.get("formData", function (result) {
    if (!result.formData) return;

    let data = result.formData.split("|");
    if (data.length < 4) return;

    function typeText(element, text, callback) {
      if (!element) {
        if (callback) callback();
        return;
      }
      element.removeAttribute("disabled");
      element.removeAttribute("readonly");
      element.value = "";

      let index = 0;
      function inputChar() {
        if (index < text.length) {
          element.value += text[index];
          element.dispatchEvent(new Event("input", { bubbles: true }));
          index++;
          setTimeout(inputChar, 30);
        } else if (callback) {
          callback();
        }
      }
      element.focus();
      inputChar();
    }

    // Điền vào input #account, sau đó inject solveCaptchaOnPage
    let accountInput = document.querySelector("#account");
    typeText(accountInput, data[4], () => {
      chrome.runtime.sendMessage({ action: "solveCaptcha" });
    });
  });
}

// background.js hoặc service_worker.js
chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if (msg.action === "solveCaptcha") {
    try {
      // Lấy API key động từ JSON
      let apikey = "ec53477299cfbbf89cd4bb66d21de723";
      if (!apikey) {
        console.error("Không lấy được API key");
        return;
      }

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: solveCaptchaOnPage,
          args: [apikey],
        });
      });
    } catch (err) {
      console.error("Lỗi khi lấy API key:", err);
    }
  }
});

async function solveCaptchaOnPage(apikey) {
  let input = document.querySelector("#captcha-input");
  let img = document.querySelector("#captcha-image");
  console.log("captcha input:", input);
  console.log("captcha img:", img);

  if (!input || !img) return;

  input.focus();
  input.value = "no1 Coding by LUHOAIAN v600";
  input.dispatchEvent(new Event("input", { bubbles: true }));

  let base64Data = img.src;
  try {
    let res = await fetch("https://anticaptcha.top/api/captcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apikey, type: 18, img: base64Data }),
    }).then((r) => r.json());

    console.log("API response:", res);

    let solvedCode = res.captcha || res.result;
    if (res.success && solvedCode) {
      input.value = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.value = solvedCode;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    } else {
      alert("❌ Giải mã thất bại: " + (res.message || "Không rõ lỗi"));
    }
  } catch (err) {
    console.error("Lỗi khi gọi API:", err);
  }
}

document.getElementById("addPassword").addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    // Lấy dữ liệu từ DOMContentLoaded
    chrome.storage.local.get(["formData"], function (result) {
      if (result.formData) {
        let data = result.formData.split("|");
        let password = data[6]; // Lấy giá trị mật khẩu từ data[6]

        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          args: [password], // Truyền password vào script
          func: (password) => {
            function setValue(element, value) {
              if (!element) return;
              element.removeAttribute("disabled"); // Nếu bị disable
              element.removeAttribute("readonly"); // Nếu bị readonly
              element.value = value;
              element.dispatchEvent(new Event("input", { bubbles: true }));
              element.dispatchEvent(new Event("change", { bubbles: true }));
            }

            // Trường mật khẩu trên điện thoại
            const newPasswordFieldMobile = document.querySelector(
              'input[formcontrolname="newPassword"]'
            );
            const confirmPasswordFieldMobile = document.querySelector(
              'input[formcontrolname="confirm"]'
            );

            // Trường mật khẩu trên PC
            const newPasswordFieldPC = document.querySelector(
              'input[ng-model="$ctrl.viewModel.moneyPasswordForm.newPassword.value"]'
            );
            const confirmPasswordFieldPC = document.querySelector(
              'input[ng-model="$ctrl.viewModel.moneyPasswordForm.confirmPassword.value"]'
            );

            // Gán mật khẩu từ data[6]
            setValue(newPasswordFieldMobile, password);
            setValue(confirmPasswordFieldMobile, password);
            setValue(newPasswordFieldPC, password);
            setValue(confirmPasswordFieldPC, password);

            // Tìm và bấm nút gửi đi (cả mobile và PC)
            setTimeout(() => {
              const submitButton = document.querySelector(
                'button.btn.btn-primary, button.btn.btn-default, button[type="submit"]'
              );
              if (submitButton) {
                submitButton.removeAttribute("disabled"); // Nếu bị disable
                submitButton.click();
              } else {
                console.error("Nút Gửi đi không được tìm thấy.");
              }
            }, 2000);
          },
        });
      } else {
        console.error("Không tìm thấy dữ liệu formData.");
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  // Gọi API để lấy địa chỉ IP công khai
  fetch("https://api.ipify.org?format=json")
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("ip-display").textContent = data.ip;
    })
    .catch((error) => {
      document.getElementById("ip-display").textContent = "Không thể lấy IP";
      console.error("Lỗi khi lấy địa chỉ IP:", error);
    });
});

document.addEventListener("DOMContentLoaded", function () {
  // Gọi API để lấy địa chỉ IP công khai
  fetch("https://t.me/luhoaian1")
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("tb-display").textContent = data.tb;
    })
    .catch((error) => {
      document.getElementById("tb-display").textContent = "Không thể lấy tb";
      console.error("Lỗi khi lấy tb:", error);
    });
});

document.getElementById("pasteButton").addEventListener("click", async () => {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById("dataInput").value = text;
  } catch (err) {
    console.error("Không thể dán nội dung:", err);
  }
});

document
  .getElementById("btn1")
  .addEventListener("click", () => openTab("tab1"));
document
  .getElementById("btn2")
  .addEventListener("click", () => openTab("tab2"));
document
  .getElementById("btn3")
  .addEventListener("click", () => openTab("tab3"));

function openTab(tabId) {
  document.getElementById("tab1").style.display = "none";
  document.getElementById("tab2").style.display = "none";
  document.getElementById("tab3").style.display = "none";

  document.getElementById(tabId).style.display = "block";
}

const sources = [
  { url: "https://t.me/luhoaian1", containerId: "content1" },
  { url: "https://t.me/luhoaian1", containerId: "content2" },
];

sources.forEach((source) => {
  fetch(source.url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Lỗi khi tải ${source.url}: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      let contentDiv = document.getElementById(source.containerId);
      if (!Array.isArray(data)) {
        console.error(`Lỗi: JSON không phải là mảng - ${source.url}`);
        return;
      }

      let fragment = document.createDocumentFragment();
      data.forEach((item) => {
        if (item.noidung && item.link) {
          let anchor = document.createElement("a");
          anchor.href = item.link;
          anchor.className = "button";
          anchor.target = "_blank";
          anchor.textContent = item.noidung;
          fragment.appendChild(anchor);
        } else {
          console.error('Lỗi: Thiếu "noidung" hoặc "link"', item);
        }
      });

      contentDiv.appendChild(fragment);
    })
    .catch((error) => console.error("Lỗi:", error));
});

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  let domain = new URL(tabs[0].url).origin; // Lấy domain
  let fullLink = domain; // Thêm /Promotion
  let linkElement = document.getElementById("domainLink");
  linkElement.href = fullLink; // Gán href
  linkElement.textContent = fullLink; // Hiển thị URL
});

// Đã loại bỏ key system - không cần paste key button

document.getElementById("toggleButton").addEventListener("click", function () {
  var displayData = document.getElementById("displayData");

  // Kiểm tra trạng thái hiển thị của phần tử displayData
  if (displayData.style.display === "none") {
    displayData.style.display = "block"; // Hiển thị phần tử
  } else {
    displayData.style.display = "none"; // Ẩn phần tử
  }
});

document
  .getElementById("openShortcutsBtn")
  .addEventListener("click", function () {
    // Thông báo hướng dẫn người dùng thiết lập phím tắt
    alert(
      'Bạn đang mở "chrome://extensions/shortcuts" trong thanh địa chỉ để chỉnh sửa phím tắt.\n\n' +
        "Bước 2. Tìm tiện ích mở rộng bạn muốn thiết lập phím tắt.\n" +
        'Bước 3. Nhấp vào ô "Nhấn tổ hợp phím" (Press shortcut).\n' +
        "Bước 4. Nhấn tổ hợp phím bạn muốn dùng (ví dụ: Ctrl + X).\n" +
        "Bước 5. Lưu lại thiết lập và kiểm tra."
    );

    // Mở trang chrome://extensions/shortcuts trong tab mới
    chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
  });

document
  .getElementById("openShortcutsBtn2")
  .addEventListener("click", function () {
    // Thông báo hướng dẫn người dùng thiết lập phím tắt
    alert(
      'Bạn đang mở "chrome://extensions/shortcuts" trong thanh địa chỉ để chỉnh sửa phím tắt.\n\n' +
        "Bước 2. Tìm tiện ích mở rộng bạn muốn thiết lập phím tắt.\n" +
        'Bước 3. Nhấp vào ô "Nhấn tổ hợp phím" (Press shortcut).\n' +
        "Bước 4. Nhấn tổ hợp phím bạn muốn dùng (ví dụ: Ctrl + X).\n" +
        "Bước 5. Lưu lại thiết lập và kiểm tra."
    );

    // Mở trang chrome://extensions/shortcuts trong tab mới
    chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
  });

chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create(
    {
      id: "humanTyping",
      title: "Paste by human (Ctrl+Shift+F)",
      contexts: ["editable"],
    },
    () => {}
  );

  chrome.commands.onCommand.addListener(async (command, tabs) => {
    console.log(command);
    if (command == "humanTyping") {
      let queryOptions = { active: true, lastFocusedWindow: true };
      let [tab] = await chrome.tabs.query(queryOptions);
      onClickHumanTyping(null, tab);
    }
  });
});

const onClickHumanTyping = (info, tab) => {
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id, allFrames: true },
      files: ["public/human-typing.js"],
    },
    () => {}
  );
};

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === "humanTyping") {
    onClickHumanTyping(info, tab);
  }
});

document.getElementById("goLinkPass").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;

    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        // ✅ Lấy origin (vd: tới link add pass rút)
        const origin = window.location.origin;
        const newUrl = `${origin}/Account/ChangeMoneyPassword`;

        // ✅ Chờ 5 giây rồi chuyển trang
        setTimeout(() => {
          window.location.href = newUrl;
        }, 1000);
      },
    });
  });
});

document.getElementById("goLinkBank").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;

    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        // ✅ Lấy origin (vd: add bank)
        const origin = window.location.origin;
        const newUrl = `${origin}/Financial?tab=3`;

        // ✅ Chờ 5 giây rồi chuyển trang
        setTimeout(() => {
          window.location.href = newUrl;
        }, 1000);
      },
    });
  });
});

document.getElementById("goLinkNap").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;

    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        // ✅ Lấy origin (vd: add nạp)
        const origin = window.location.origin;
        const newUrl = `${origin}/Financial?tab=1`;

        // ✅ Chờ 5 giây rồi chuyển trang
        setTimeout(() => {
          window.location.href = newUrl;
        }, 1000);
      },
    });
  });
});

document.getElementById("solveBtn").addEventListener("click", async () => {
  try {
    const apikey = "ec53477299cfbbf89cd4bb66d21de723";

    if (!apikey) return alert("❌ Không lấy được API key");

    // 2. Truyền apikey vào nội dung trang đang mở
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        args: [apikey],
        func: async (apikey) => {
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
                    "\n\n🔑 Liên hệ @luhoaian1 để setup."
                );
                return null;
              }
            } catch (err) {
              alert("❌ Lỗi khi gọi API");
              return null;
            }
          };

          let input = null;
          for (let i = 0; i < 10; i++) {
            input =
              document.querySelector('input[formcontrolname="checkCode"]') ||
              document.querySelector('input[ng-model="$ctrl.code"]');
            if (input) break;
            await new Promise((r) => setTimeout(r, 200));
          }
          if (!input) return alert("❌ Không tìm thấy input 'checkCode'");

          input.focus();
          input.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
          input.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
          input.dispatchEvent(new MouseEvent("click", { bubbles: true }));

          input.value = "giải mã cùng Coding by LUHOAIAN...pro vip";
          input.dispatchEvent(new Event("input", { bubbles: true }));

          await new Promise((resolve) => setTimeout(resolve, 1500));

          const img = document.querySelector('img[src^="data:image"]');
          if (!img) return alert("❌ Không tìm thấy ảnh captcha");

          const base64 = img.src.split(",")[1];
          if (!base64) return alert("❌ Base64 ảnh trống");

          const result = await solveCaptcha(base64);
          if (!result) return;

          input.value = "";
          input.dispatchEvent(new Event("input", { bubbles: true }));
          await new Promise((r) => setTimeout(r, 300));

          input.value = result;
          input.dispatchEvent(new Event("input", { bubbles: true }));
        },
      });
    });
  } catch (err) {
    alert("❌ Lỗi khi lấy dữ liệu JSON");
    console.error(err);
  }
});

document.getElementById("solveCaptcha2").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: solveCaptcha2,
      args: ["ec53477299cfbbf89cd4bb66d21de723"], // Thay bằng API KEY của bạn
    });
  });
});

// HÀM GIẢI CAPTCHA 2 (chạy trong content script context)
function solveCaptcha2(apikey) {
  const solveCaptcha = async (base64) => {
    try {
      const response = await fetch("https://anticaptcha.top/api/captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apikey, type: 14, img: base64 }),
      });
      const result = await response.json();
      if (result.success && result.captcha) return result.captcha;
      alert("❌ Giải mã thất bại: " + (result.message || "Không rõ lỗi"));
      return null;
    } catch (err) {
      alert("❌ Lỗi khi gọi API giải mã");
      return null;
    }
  };

  (async () => {
    const input = document.querySelector('input[name="identifying"]');
    if (!input) return alert("❌ Không tìm thấy input captcha 2");

    input.focus();
    input.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    input.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    input.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    input.value = "Giải QQ88 cùng Coding by LUHOAIAN...";
    input.dispatchEvent(new Event("input", { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const img = document.querySelector("img.catchat_pic");
    if (!img || !img.src.startsWith("data:image"))
      return alert("❌ Không tìm thấy ảnh captcha");

    const base64 = img.src.split(",")[1];
    if (!base64) return alert("❌ Base64 ảnh trống");

    const result = await solveCaptcha(base64);
    if (!result) return;

    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 300));
    input.value = result;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  })();
}

document.getElementById("solveCaptcha3").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: solveCaptcha3,
      args: ["ec53477299cfbbf89cd4bb66d21de723"], // 👈 Thay bằng API key của bạn
    });
  });
});

function solveCaptcha3(apikey) {
  const solveCaptcha = async (base64) => {
    try {
      const response = await fetch("https://anticaptcha.top/api/captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apikey, type: 14, img: base64 }),
      });
      const result = await response.json();
      if (result.success && result.captcha) return result.captcha;
      alert("❌ Giải mã thất bại: " + (result.message || "Không rõ lỗi"));
      return null;
    } catch (err) {
      alert("❌ Lỗi khi gọi API giải mã");
      return null;
    }
  };

  (async () => {
    const input = document.querySelector(
      '.nrc-form-input.secure input[type="text"]'
    );
    const img = document.querySelector(".nrc-form-input.secure img");

    if (!input || !img) {
      return alert("❌ Không tìm thấy captcha 3 nge");
    }

    input.focus();
    input.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    input.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    input.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    input.value = "Giải mã 78Win cùng Coding by LUHOAIAN...";
    input.dispatchEvent(new Event("input", { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const base64 = img.src.split(",")[1];
    if (!base64) return alert("❌ Ảnh captcha trống");

    const result = await solveCaptcha(base64);
    if (!result) return;

    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 300));
    input.value = result;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  })();
}

document
  .getElementById("solveCaptchaokvip")
  .addEventListener("click", async () => {
    try {
      // Lấy API key từ JSON
      let apikey = "ec53477299cfbbf89cd4bb66d21de723";

      if (!apikey) {
        alert("❌ Không lấy được API key từ server");
        return;
      }

      // Thực thi script trên tab hiện tại
      let [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: solveCaptchaokvip,
        args: [apikey], // Truyền API KEY lấy từ JSON
      });
    } catch (err) {
      alert("❌ Lỗi khi lấy API key: " + err.message);
    }
  });

// Hàm giải Captcha
function solveCaptchaokvip(apikey) {
  const solveCaptcha = async (base64) => {
    try {
      const response = await fetch("https://anticaptcha.top/api/captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apikey, type: 14, img: base64 }),
      });
      const result = await response.json();
      if (result.success && result.captcha) return result.captcha;
      alert("❌ Giải mã thất bại: " + (result.message || "Không rõ lỗi"));
      return null;
    } catch (err) {
      alert("❌ Lỗi khi gọi API giải mã");
      return null;
    }
  };

  (async () => {
    const img = document.querySelector("img.codeImage");
    if (!img) {
      alert("❌ Không tìm thấy captcha trên trang");
      return;
    }

    let base64 = img.src; // src đã là base64 sẵn

    const captcha = await solveCaptcha(base64);

    if (captcha) {
      const input = document.querySelector("#van-field-3-input");
      if (input) {
        input.value = captcha;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        alert("✅ Mã Captcha đã được điền: " + captcha);
      } else {
        alert("❌ Không tìm thấy ô nhập Captcha");
      }
    }
  })();
}

document.getElementById("solveBtnKM").addEventListener("click", async () => {
  try {
    // Lấy API key từ JSON
    // const response = await fetch(`${linkdomi}/v6datacaptcha/${tokendomi}.json`);
    // const data = await response.json();
    const apikey = "ec53477299cfbbf89cd4bb66d21de723";

    if (!apikey) {
      alert("❌ Không lấy được API key từ server");
      return;
    }

    // Chạy script trên tab hiện tại, truyền apikey
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: solveCaptchaOnPageNo,
      args: [apikey],
    });
  } catch (err) {
    alert("❌ Lỗi khi lấy API key: " + err.message);
  }
});

async function solveCaptchaOnPageNo(apikey) {
  let input = document.querySelector("#captcha-input");
  if (!input) return;

  // Nhập tạm để focus
  input.focus();
  input.value = "sex Coding by LUHOAIAN v601 ok";
  input.dispatchEvent(new Event("input", { bubbles: true }));

  // Lấy ảnh captcha
  let img = document.querySelector("#captcha-image");
  if (!img || !img.src.startsWith("data:image/svg+xml;base64,")) return;

  let base64Data = img.src;

  try {
    let res = await fetch("https://anticaptcha.top/api/captcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apikey: apikey,
        type: 18,
        img: base64Data,
      }),
    }).then((r) => r.json());

    let solvedCode = res.captcha || res.result;

    if (res.success && solvedCode) {
      // Xóa giá trị cũ và nhập lại captcha đã giải
      input.focus();
      input.value = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));

      input.value = solvedCode;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    } else {
      alert("❌ Giải mã thất bại: " + (res.message || "Không rõ lỗi"));
    }
  } catch (err) {
    console.error("❌ Lỗi khi gọi API:", err);
  }
}
