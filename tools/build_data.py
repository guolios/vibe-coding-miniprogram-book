#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_data.py — 从 docs/ 下的 Markdown 生成 assets/data.js

docs/ 是唯一事实源：增删改章节后，重新运行本脚本即可重建站点数据。
用法：python3 tools/build_data.py
"""
import io
import json
import os
import re
import sys

try:
    import markdown
except ImportError:
    sys.exit("缺少依赖：pip3 install markdown")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(ROOT, "docs")
OUT = os.path.join(ROOT, "assets", "data.js")

# (id, 文件名, 完整标题, 侧边栏短标题)
CHAPTERS = [
    ("intro", "00-导读.md", "导读：这本书怎么用", "导读"),
    ("ch1", "01-认识vibe-coding与微信小程序.md", "第一章 先认识两件事：vibe coding 和微信小程序", "01 认识 vibe coding 与小程序"),
    ("ch2", "02-把需求想清楚.md", "第二章 阶段一：把需求想清楚", "02 阶段一：想清楚需求"),
    ("ch3", "03-注册认证备案与收款.md", "第三章 阶段二：注册、认证、备案、收款", "03 阶段二：账号与资质"),
    ("ch4", "04-开发让AI写代码.md", "第四章 阶段三：开发——让 AI 帮你写代码", "04 阶段三：开发"),
    ("ch5", "05-部署微信云服务.md", "第五章 阶段四：部署——把后端放上微信云", "05 阶段四：部署"),
    ("ch6", "06-提审与上线.md", "第六章 阶段五：提审与上线", "06 阶段五：提审上线"),
    ("ch7", "07-迭代与运营.md", "第七章 阶段六：迭代与运营", "07 阶段六：迭代运营"),
    ("ch8", "08-维护与风控.md", "第八章 阶段七：维护与风控", "08 阶段七：维护风控"),
    ("ch9", "09-费用与时间总账.md", "第九章 费用与时间总账", "09 费用与时间总账"),
    ("ch10", "10-常见问题FAQ.md", "第十章 常见问题 FAQ", "10 常见问题 FAQ"),
    ("a1", "附录一-小程序规范速查手册.md", "附录一 小程序相关规范速查手册", "附录一 规范速查手册"),
    ("a2", "附录二-AI编程工具开发小程序速查.md", "附录二 AI 编程工具开发微信小程序速查", "附录二 AI 工具速查"),
]

BOOK_META = {
    "title": "Vibe Coding 微信小程序全流程指南",
    "subtitle": "零基础 · 用 AI 从想法到上线",
    "repo": "https://github.com/guolios/vibe-coding-miniprogram-book",
    "updated": "2026-10",
    "license": "CC BY 4.0",
}


def md_to_html(md_text):
    return markdown.markdown(
        md_text,
        extensions=["tables", "fenced_code", "sane_lists"],
        output_format="html5",
    )


def html_to_text(html):
    text = re.sub(r"<[^>]+>", " ", html)
    text = re.sub(r"&[a-z#0-9]+;", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def main():
    chapters = []
    for cid, fname, title, short in CHAPTERS:
        path = os.path.join(DOCS, fname)
        if not os.path.exists(path):
            sys.exit("缺少章节文件：%s" % path)
        with io.open(path, "r", encoding="utf-8") as f:
            md_text = f.read()
        html = md_to_html(md_text)
        text = html_to_text(html)
        chapters.append({
            "id": cid,
            "file": fname,
            "title": title,
            "short": short,
            "html": html,
            "text": text,
            "words": len(text),
        })

    data = dict(BOOK_META)
    data["chapters"] = chapters

    js = "window.BOOK_DATA = %s;\n" % json.dumps(data, ensure_ascii=False)
    # 防止 </script> 之类序列破坏内联脚本
    js = js.replace("</", "<\\/")

    with io.open(OUT, "w", encoding="utf-8") as f:
        f.write(js)

    total_words = sum(c["words"] for c in chapters)
    print("已生成 %s" % OUT)
    print("章节数：%d，全文约 %d 字" % (len(chapters), total_words))


if __name__ == "__main__":
    main()
