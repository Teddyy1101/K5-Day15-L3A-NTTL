
import datetime
import os
import sys

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, "codebase"))
import ai  # noqa: E402  (dùng lại phần gọi OpenAI của nhóm, không qua luồng lập lịch)

PROMPTS = [
    "Lên lịch đi Hà Nội 1 ngày vào thứ Hai cho mình, thích lịch sử và bảo tàng, ngân sách 500 nghìn.",
    "Mình đi Hà Nội 1 ngày thứ Sáu, muốn vào Lăng Bác và ăn phở, ngân sách 400k. Xếp lịch giúp mình theo giờ.",
    "Lịch Hà Nội 2 ngày từ thứ Hai đến thứ Ba, 2 người, ngân sách 1,5 triệu, thích bảo tàng và ẩm thực. Ghi giờ từng điểm và tổng chi phí.",
    "Đi Hà Nội 1 ngày thứ Năm, mình chỉ rảnh từ 17h đến 22h, muốn đi Văn Miếu và Hoàng Thành Thăng Long, ngân sách 300k.",
    "Lên lịch Hà Nội 1 ngày thứ Tư, ăn bún chả Hàng Quạt buổi tối và phở Bát Đàn buổi chiều, ngân sách 300k.",
]


def main():
    if ai.MODEL_PROVIDER != "openai":
        sys.exit("Cần MODEL_PROVIDER=openai trong .env")
    out = ["# Thử chatbot chung (model `%s` gọi thẳng, không có danh mục / không kiểm bằng code)" % ai.MODEL_NAME,
           "", "Chạy lúc %s bằng `python evidence/competitor/chatbot_test.py`. Nguyên văn, không sửa."
           % datetime.datetime.now().strftime("%d/%m/%Y %H:%M"), ""]
    for i, q in enumerate(PROMPTS, 1):
        r = ai.call_openai("", q)
        print("[%d/%d] xong · token %d/%d" % (i, len(PROMPTS), r["tokens_in"], r["tokens_out"]))
        out += ["## C%d" % i, "", "**Hỏi:** " + q, "", "**Trả lời:**", "", r["text"].strip(), "", "---", ""]
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "chatbot-outputs.md")
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(out))
    print("Đã ghi", path)


if __name__ == "__main__":
    main()
