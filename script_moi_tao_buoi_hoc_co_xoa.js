<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hệ thống điểm danh lớp</title>
    <style>
        /* Cấu hình chung của trang */
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f0f4f7;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            color: #333;
        }

        /* Khung chứa chính */
        .board-container {
            background-color: #fff;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 400px;
            text-align: center;
        }

        h1 {
            margin-bottom: 20px;
            color: #2c3e50;
        }

        /* Bảng chứa danh sách */
        .student-list {
            list-style: none;
            padding: 0;
            text-align: left;
            margin-bottom: 25px;
        }

        .student-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 15px;
            border-bottom: 1px solid #eee;
            transition: all 0.2s;
            cursor: pointer;
            border-radius: 8px;
        }

        .student-item:hover {
            background-color: #f8f9fa;
        }

        /* Logo dấu chấm đẹp mắt */
        .dot-label {
            font-size: 20px;
            color: #3498db;
            font-weight: bold;
            width: 20px;
            text-align: center;
            transition: all 0.2s;
        }

        /* Màu sắc khi vào trạng thái điểm danh */
        .student-item.attended .dot-label {
            color: #27ae60;
            transform: scale(1.5); /* To ra chút khi bấm */
        }
        .student-item.present .dot-label {
            color: #ff9f43; /* Màu cam cho hiện diện */
            transform: scale(1.5);
        }

        /* Tên học sinh */
        .student-name {
            flex-grow: 1;
            text-align: left;
            margin-right: 10px;
            font-size: 18px;
            font-weight: 500;
        }

        /* Các nút chức năng bên dưới */
        .controls {
            display: flex;
            gap: 10px;
            justify-content: center;
        }

        button {
            border: none;
            padding: 10px 20px;
            border-radius: 20px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s;
            font-size: 14px;
        }

        button:active {
            transform: scale(0.95);
        }

        .btn-cap { background-color: #e0e0e0; color: #333; }
        .btn-all-p { background-color: #2c3e50; color: #fff; }

        /* Hiệu ứng bay lên cho dấu chấm */
        @keyframes popUp {
            0% { transform: scale(0); opacity: 0; }
            100% { transform: scale(1.2); opacity: 1; }
        }
        .animate-dot {
            animation: popUp 0.3s ease-out;
        }

    </style>
</head>
<body>

    <div class="board-container">
        <h1>Điểm danh Lớp A</h1>

        <!-- Danh sách học sinh -->
        <ul class="student-list">
            <!-- Bạn có thể copy-paste hàng dưới đây để thêm nhiều người -->
            <li class="student-item" data-status="absent">
                <span class="dot-label">.</span>
                <span class="student-name">Hà Nguyễn</span>
            </li>
            <li class="student-item" data-status="absent">
                <span class="dot-label">.</span>
                <span class="student-name">Lê Văn Minh</span>
            </li>
            <li class="student-item" data-status="absent">
                <span class="dot-label">.</span>
                <span class="student-name">Trần Thị Bảo</span>
            </li>
            <li class="student-item" data-status="absent">
                <span class="dot-label">.</span>
                <span class="student-name">Phạm Thế Chiến</span>
            </li>
        </ul>

        <!-- Các nút điều khiển -->
        <div class="controls">
            <button class="btn-cap" onclick="resetAll()">Rút lại</button>
            <button class="btn-all-p" onclick="markAllPresent()">Tất cả đến</button>
        </div>
    </div>

    <script>
        // Link đến font chữ Chướng ngại vật (nếu bạn muốn đẹp hơn, hoặc bỏ comment dòng dưới)
        // let font = document.fonts.add("ChuongNGaiVat", "url('ChaoHaiIcon-webfont.woff')");

        // Hàm kiểm tra xem dấu chấm có nằm trong phần tử không
        function isDotClicked(el) {
            if (el.classList.contains('dot-label')) return true;
            // Kiểm tra xem trang có phải trên Mobile (Xổ tay) không, nếu là mouse click thì coi như click vào chấm
            // ifdef cho webkit là để hỗ trợ chuyển tiếp từ Xổ tay (tap) sang chuột
            if ("ontouchstart" in window) return true;
            return el.classList.contains('dot-label');
        }

        function markDot(el) {
            console.log(el + " clicked");
            
            // Nếu đang trạng thái "Đến lớp" (Connected)
            if (el.classList.contains('present')) {
                // Chuyển về "Vắng mặt" / Ban đầu
                el.classList.replace('present', 'attended');
            } else {
                // Chuyển thành "Đến lớp" / Điểm danh
                el.classList.add('present');
                el.classList.remove('attended');
                
                // Thêm hiệu ứng bay lên cho dài hơn
                el.classList.remove('animate-dot'); // Bỏ animation cũ
                void el.offsetWidth; // Trigger reflow (phép màu CSS)
                el.classList.add('animate-dot');   // Thêm animation mới
            }

            // Nếu bạn muốn lưu dữ liệu vào trình duyệt thì uncomment đoạn dưới:
            // localStorage.setItem('className', el);
        }

        // Đồng bộ sự kiện click
        const elements = document.querySelectorAll(".student-item");
        elements.forEach(function (el) {
            el.addEventListener("click", function () {
                // Tìm thẻ span chứa dấu chấm bên trong
                const dot = el.querySelector(".dot-label");
                
                if (isDotClicked(dot) || isDotClicked(el.querySelector(".student-name"))) {
                    markDot(dot);
                }
            });
        });

        // Hàm Rút lại tất cả
        function resetAll() {
            const items = document.querySelectorAll('.student-item');
            items.forEach(item => {
                const dot = item.querySelector('.dot-label');
                dot.classList.remove('present');
                dot.classList.add('animate-dot');
                void dot.offsetWidth;
                dot.classList.remove('animate-dot');
            });
        }

        // Hàm Đánh dấu tất cả là "Đến"
        function markAllPresent() {
            const items = document.querySelectorAll('.student-item');
            items.forEach(item => {
                const dot = item.querySelector('.dot-label');
                if(dot.classList.contains('present')) {
                    dot.classList.remove('present');
                } else {
                    dot.classList.add('present');
                }
            });
            
            //
