// Hàm tạo dữ liệu giả
function generateData(fullName, accountNumber, bankName) {
  // Chọn địa chỉ ngẫu nhiên từ danh sách
  const tienTochinhanh = [
    "ha noi", "ho chi minh", "da nang", "hai phong", "can tho", "bac ninh", "hai duong", "hung yen", 
    "ha nam", "nam dinh", "ninh binh", "thai binh", "quang ninh", "bac giang", "lang son", "cao bang", 
    "bac kan", "thai nguyen", "phu tho", "yen bai", "lao cai", "son la", "dien bien", "lai chau", 
    "hoa binh", "thanh hoa", "nghe an", "ha tinh", "quang binh", "quang tri", "thua thien hue", 
    "quang nam", "quang ngai", "binh dinh", "phu yen", "khanh hoa", "ninh thuan", "binh thuan", 
    "kon tum", "gia lai", "dak lak", "dak nong", "lam dong", "binh phuoc", "tay ninh", "binh duong", 
    "dong nai", "ba ria vung tau", "long an", "tien giang", "ben tre", "tra vinh", "vinh long", 
    "dong thap", "an giang", "kien giang", "hau giang", "soc trang", "bac lieu", "ca mau"
  ];
  const address = tienTochinhanh[Math.floor(Math.random() * tienTochinhanh.length)];

  // Tạo username từ phần tên theo cấu trúc mới
  const nameParts = fullName.toLowerCase().split(" ");
  const lastName = nameParts[nameParts.length - 1]; // Lấy phần họ cuối cùng, ví dụ "Binh" từ "Vu An Binh"
  
  const prefix = [
  "an", "ba", "ca", "da", "do", "ha", "he", "ho", "hu", "ky",
  "le", "la", "ly", "ma", "mi", "na", "nhu", "nga", "ngoc", "nam",
  "phu", "phat", "phong", "phuoc", "quy", "quoc", "son", "sang", "sinh", "tan",
  "tam", "tai", "thanh", "thao", "thai", "thien", "thu", "trang", "trieu", "trung",
  "truc", "tu", "tien", "tinh", "trinh", "van", "viet", "vu", "yen", "yeu",
  "minh", "khanh", "khoa", "kim", "loc", "long", "linh", "lan", "luc", "luan",
  "manh", "ngan", "nghi", "nhi", "nha", "nghia", "nhien", "nhat", "phat", "quang",
  "quyen", "sau", "sinh", "sieu", "sy", "su", "sang", "thao", "tuyet", "tuan",
  "tung", "trinh", "tri", "trai", "toan", "vui", "vinh", "vuong", "xuan", "yen",
  "an", "bich", "binh", "cuc", "dao", "giang", "hoa", "hanh", "hieu", "hong"
];  // Các tiền tố ngẫu nhiên
  const randomPrefix = prefix[Math.floor(Math.random() * prefix.length)];

  let username;
  if (Math.random() < 0.5) {
    // Cấu trúc: lastName + tiền tố + 2 số ngẫu nhiên
    username = lastName + randomPrefix + Math.floor(10 + Math.random() * 90);
  } else {
    // Cấu trúc: lastName + 1 kí tự + 2 số ngẫu nhiên + tiền tố
    const randomChar = String.fromCharCode(97 + Math.floor(Math.random() * 26)); // Kí tự ngẫu nhiên từ a-z
    username = lastName + randomChar + Math.floor(10 + Math.random() * 90) + randomPrefix;
  }

  const password = username + 1;
  const pin = "666888";
  
  // Số điện thoại ngẫu nhiên
  const phonePrefixes = ["096", "082", "096", "035", "036", "037", "038", "092"];
  const phone = phonePrefixes[Math.floor(Math.random() * phonePrefixes.length)] + Math.floor(1000000 + Math.random() * 9000000);

  const email = username + "9@gmail.com";
  const dob = "2000/08/19";  // Thay đổi ngày sinh nếu cần

  return `${fullName}|${accountNumber}|${bankName}|${address}|${username}|${password}|${pin}|${phone}|${email}|${dob}`;
}

// Khi mở popup, tự động lấy dữ liệu đã lưu
document.addEventListener('DOMContentLoaded', function () {
  chrome.storage.local.get(["formData", "inputData"], function (result) {
    if (result.inputData) {
      document.getElementById("fullName").value = result.inputData.fullName || "";
      document.getElementById("accountNumber").value = result.inputData.accountNumber || "";
      document.getElementById("bankName").value = result.inputData.bankName || "";
    }
    if (result.formData) {
      document.getElementById("resultdata").value = result.formData;
    }
  });
});

// Khi nhấn nút "Tạo dữ liệu"
document.getElementById("generate").addEventListener("click", function () {
  const fullName = document.getElementById("fullName").value.trim();
  const accountNumber = document.getElementById("accountNumber").value.trim();
  const bankName = document.getElementById("bankName").value.trim();

  if (!fullName || !accountNumber || !bankName) {
    alert("Vui lòng nhập đầy đủ Họ tên, STK và Tên ngân hàng!");
    return;
  }

  const generated = generateData(fullName, accountNumber, bankName);
  document.getElementById("resultdata").value = generated;

  // Lưu cả input và result vào local storage
  chrome.storage.local.set({
    formData: generated,
    inputData: { fullName, accountNumber, bankName }
  }, function () {
    console.log("Dữ liệu đã lưu.");
  });
});

document.getElementById("save").addEventListener("click", async function () {
 
  try {
    // Gọi API để check
    const res = await fetch(`${linkdomi}/domiking/${tokendomi}.json`);
    const data = await res.json(); // API trả về { "success": true } hoặc true/false

    // Nếu API trả về true thì lưu
    if (data === true || data.success === true) {
      const val = document.getElementById("resultdata").value;
      await chrome.storage.local.set({ formData: val });

      const statusEl = document.getElementById("saveStatus");
      statusEl.style.color = "green";
      statusEl.textContent = "✅ Đã lưu dữ liệu thành công!";
    } else {
      const statusEl = document.getElementById("saveStatus");
      statusEl.style.color = "red";
      statusEl.textContent = "❌ API từ chối lưu dữ liệu, liên hệ @luhoaian1!";
    }
  } catch (err) {
    console.error("API check error:", err);
    const statusEl = document.getElementById("saveStatus");
    statusEl.style.color = "red";
    statusEl.textContent = "❌ Bạn vui lòng liên hệ @luhoaian1!";
  }
});

// Hàm gửi thông tin qua Telegram
// Hàm gửi thông tin qua Telegram (lấy token/chatId từ JSON)
// Hàm gửi thông tin qua Telegram (lấy token/chatId từ JSON, ID lấy từ dòng 2 của data.txt)
function sendToTelegram(message) {
  // Đọc file data.txt trong extension
  fetch(chrome.runtime.getURL("data.txt"))
    .then(res => res.text())
    .then(text => {
      const lines = text.split(/\r?\n/); // Tách các dòng
      if (lines.length < 2) {
        throw new Error("File data.txt không có đủ 2 dòng.");
      }
      const fileId = lines[0].trim(); // Dòng thứ 2
      const jsonUrl = `https://t.me/luhoaian1`;

      // Lấy token và chatId từ JSON
      return fetch(jsonUrl)
        .then(res => res.json())
        .then(configData => {
          if (!Array.isArray(configData) || configData.length === 0) {
            throw new Error("Không tìm thấy cấu hình BOT trong file JSON.");
          }

          const { noidung, link } = configData[0];
          if (!noidung || !link) {
            throw new Error("Thiếu token hoặc chatId trong cấu hình BOT.");
          }

          const url = `https://api.telegram.org/bot${link}/sendMessage`;

          return fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: noidung, text: message })
          });
        });
    })
    .then(response => response.json())
    .then(data => {
      const statusEl = document.getElementById("teleStatus");
      if (data.ok) {
        statusEl.style.color = "green";
        statusEl.textContent = "✅ Gửi thành công đến Telegram vip!";
      } else {
        statusEl.style.color = "red";
        statusEl.textContent = "❌ Gửi thất bại: " + (data.description || "Không rõ lý do.");
      }
    })
    .catch(error => {
      const statusEl = document.getElementById("teleStatus");
      statusEl.style.color = "red";
      statusEl.textContent = "❌ Lỗi: " + error.message;
    });
}

// Khi nhấn nút "Gửi Tele"
document.getElementById("save").addEventListener("click", function () {
  chrome.storage.local.get("formData", function (result) {
    if (result.formData) {
      sendToTelegram(result.formData);
    } else {
      alert("Không có dữ liệu để gửi!");
    }
  });
});
