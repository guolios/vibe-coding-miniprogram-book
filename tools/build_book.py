#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_book.py — 从 docs/ 下的章节文件合并生成整本 Markdown

docs/ 是唯一事实源。本脚本负责把 13 个章节文件拼成一本可整篇阅读
（或整本喂给 AI）的 Markdown，并在拼接时完成两件事：

  1. 标题降级：除首章外，章节标题整体降一级，使全书只有一个 H1（书名）
  2. 链接改写：把跨章的「文件相对链接」改写成「文档内锚点」

用法：python3 tools/build_book.py
"""
import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(ROOT, "docs")
# 产出两份：仓库根目录的「全书.md」+ 工作区的整本交付文件
OUTS = [
    os.path.join(ROOT, "全书.md"),
    os.path.join(ROOT, "..", "Vibe Coding 微信小程序全流程指南.md"),
]

# (id, 文件名, 完整标题, 侧边栏短标题) — 与 build_data.py 保持一致
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

NAV_RE = re.compile(r"^\*\*(?:上一章|下一章)\*\*")


def slugify(text):
    """按 GitHub 的锚点规则生成 slug（保留 CJK，去标点，空格转连字符）"""
    s = text.strip().lower()
    s = re.sub(r"[^\w\s\u4e00-\u9fff-]", "", s)
    return re.sub(r"\s+", "-", s)


def first_h1(lines):
    """取第一个 H1 标题文本（用于生成跨章锚点）"""
    for line in lines:
        m = re.match(r"^#\s+(.*)$", line)
        if m:
            return m.group(1).strip()
    return ""


def strip_nav(text):
    """去掉章末的上下章导航段"""
    lines = text.rstrip().split("\n")
    while lines and not lines[-1].strip():
        lines.pop()
    if lines and NAV_RE.match(lines[-1]):
        lines.pop()
    while lines and not lines[-1].strip():
        lines.pop()
    return "\n".join(lines) + "\n"


def demote(text):
    """标题整体降一级，代码块内的 # 不动"""
    out = []
    in_fence = False
    for line in text.split("\n"):
        if line.lstrip().startswith("```"):
            in_fence = not in_fence
            out.append(line)
            continue
        if not in_fence and re.match(r"^#{1,5}\s", line):
            out.append("#" + line)
        else:
            out.append(line)
    return "\n".join(out)


def main():
    # 先建立 文件名 → 锚点 的映射
    anchors = {}
    raws = {}
    for _cid, fname, _title, _short in CHAPTERS:
        path = os.path.join(DOCS, fname)
        if not os.path.exists(path):
            sys.exit("缺少章节文件：%s" % path)
        with io.open(path, "r", encoding="utf-8") as f:
            text = f.read()
        raws[fname] = text
        anchors[fname] = slugify(first_h1(text.split("\n")))

    parts = []
    for idx, (_cid, fname, _title, _short) in enumerate(CHAPTERS):
        text = raws[fname]
        text = strip_nav(text)
        if idx > 0:
            text = demote(text)

        # 跨章相对链接 → 文档内锚点
        def repl(m):
            label, target = m.group(1), m.group(2)
            if target in anchors:
                return "[%s](#%s)" % (label, anchors[target])
            return m.group(0)

        text = re.sub(r"\[([^\]]+)\]\(([^)]+\.md)\)", repl, text)
        parts.append(text.rstrip())

    book = "\n\n---\n\n".join(parts) + "\n"

    for out in OUTS:
        out_path = os.path.normpath(out)
        with io.open(out_path, "w", encoding="utf-8") as f:
            f.write(book)

    words = len(re.sub(r"\s+", " ", book))
    print("已生成 %d 份整本文件，合并 %d 节，约 %d 字" % (len(OUTS), len(parts), words))


if __name__ == "__main__":
    main()
