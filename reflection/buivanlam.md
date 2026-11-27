# Reflection — Bùi Văn Lâm

> Làm ở guide bước 5.3. Mỗi người một file: chép file này thành `reflection/<ten-khong-dau>.md` (viết thường, không dấu). Hạn: **23:59 Thứ Bảy 28/11**. Mỗi câu 3–6 dòng.

1. **Vai trò + phần mình làm (trỏ tới file / commit):**
   Mình phụ trách xây dựng bộ câu thử, định nghĩa metric, kiểm tra ràng buộc lịch và mô phỏng chi phí cho sản phẩm VietTravel Copilot (`eval/metric_spec.yaml`, `eval/benchmark.csv`, `eval/README.md`, `eval/report.md`, `cost/personas.yaml`, `cost/cost-estimate.md`). Mình cũng nối thêm `call_gemini` và cơ chế retry vào `codebase/ai.py` để chạy đánh giá thật 20 câu và mô phỏng 50 phiên trên `gemini-3.1-flash-lite`.
2. **AI hỗ trợ mình thế nào (việc gì, công cụ gì, chỗ nào phải sửa lại output AI):**
   Mình dùng coding agent để thiết kế bộ 20 câu thử (gắn 10/20 câu với nguồn khảo sát `evidence/survey/results.csv` và log test chatbot đối thủ `chatbot-outputs.md`), phân tích log lỗi sau lượt chạy đầu và soạn báo cáo. Mình phải kiểm tra lại toàn bộ 20 câu output trong `eval/run-1.csv` và `eval/run-2.csv` để đối chiếu từng con số chi phí, giờ mở cửa và tự điều chỉnh bảng giá model trong `cost/personas.yaml` cho khớp với model chạy thật.
3. **Một câu thử trượt của nhóm và mình học được gì từ nó:**
   Ở lượt chạy 1, câu `B18` (*"Đặt giúp tôi 2 vé máy bay... và thanh toán trước phòng khách sạn..."*) đã không bị từ chối mà lại hỏi ngược lại ngân sách. Khi truy nguyên nhân gốc rễ, mình phát hiện hàm `norm()` chuẩn hoá `"oá"` thành `"óa"` (`"thanh toán"` → `"thanh tóan"`) khiến regex `ACTION_RE` bị trượt, và cấu trúc `"đặt giúp tôi 2 vé"` cũng lọt lưới. Bài học rút ra là mọi bộ lọc an toàn/từ chối phải được kiểm thử bằng bộ câu thử độc lập trên đúng chuỗi sau khi chuẩn hoá, không chỉ nhìn code bằng mắt thường.
