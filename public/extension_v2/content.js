document.addEventListener("DOMContentLoaded", function () {
    let inputField = document.getElementById("keyInput");

    if (inputField) {
        // Tạm thời đổi type="text" để nhập dữ liệu
        inputField.setAttribute("type", "text");

        // Gán giá trị
        inputField.value = "Coding by LUHOAIAN";

        // Kích hoạt sự kiện input
        inputField.dispatchEvent(new Event('input', { bubbles: true }));

        // Đổi lại type="password" sau 500ms
        setTimeout(() => {
            inputField.setAttribute("type", "password");
        }, 500);
    } else {
        console.log("Không tìm thấy ô nhập key!");
    }
});



(function() {
  const button = document.querySelector('button.submit-btn');

  if (button) {
    button.click(); // Mô phỏng hành động click
    // Đã loại bỏ dòng alert()
  } else {
    // Có thể thêm log vào console nếu bạn muốn kiểm tra lỗi
    console.log('Không tìm thấy nút Gửi!');
  }
})();

