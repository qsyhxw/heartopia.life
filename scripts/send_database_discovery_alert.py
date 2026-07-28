#!/usr/bin/env python3
"""Send private database discovery and workflow failure alerts through Gmail SMTP."""

from __future__ import annotations

import json
import os
import smtplib
import ssl
import sys
from email.message import EmailMessage
from pathlib import Path
from typing import Mapping


SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 465


def run_url(environment: Mapping[str, str]) -> str:
    repository = environment.get("GITHUB_REPOSITORY", "qsyhxw/heartopia.life")
    run_id = environment.get("GITHUB_RUN_ID", "")
    return f"https://github.com/{repository}/actions/runs/{run_id}" if run_id else ""


def recipient(environment: Mapping[str, str]) -> str:
    return (
        environment.get("DATABASE_ALERT_EMAIL", "").strip()
        or environment.get("EVENT_ALERT_EMAIL", "").strip()
        or environment.get("PATCH_ALERT_EMAIL", "").strip()
    )


def names(entries: list[Mapping[str, object]], limit: int = 12) -> str:
    values = [str(entry.get("name") or entry.get("after") or entry.get("slug")) for entry in entries]
    shown = ", ".join(values[:limit])
    return shown + (f" and {len(values) - limit} more" if len(values) > limit else "")


def build_update_email(report: Mapping[str, object], environment: Mapping[str, str]) -> tuple[str, str]:
    changes = list(report.get("changes", []))
    warnings = list(report.get("warnings", []))
    subject = f"[Heartopia] 数据库发现 {report.get('changeCount', 0)} 项变化"
    body = [
        "Heartopia 每日数据库轻量监控发现列表级变化。",
        "本次没有自动复制正文、更新详情字段或下载图片。",
        "",
    ]
    for change in changes:
        body.append(
            f"{change.get('label')}: {change.get('previousCount')} -> {change.get('currentCount')}"
        )
        if change.get("added"):
            body.append(f"  新增：{names(list(change['added']))}")
        if change.get("removed"):
            body.append(f"  移除：{names(list(change['removed']))}")
        if change.get("renamed"):
            body.append(f"  改名：{names(list(change['renamed']))}")
        if change.get("pendingLocal"):
            body.append(f"  本站待核实：{names(list(change['pendingLocal']))}")
        body.append("")
    if warnings:
        body.extend(["监控警告：", *[
            f"- {warning.get('label')}: {warning.get('message')}" for warning in warnings
        ], ""])
    body.extend([
        "建议下一步：",
        "1. 优先核实新增实体是否来自当前游戏版本或限时活动。",
        "2. 只同步名称、数字、日期、地点、天气、等级、价格等事实字段。",
        "3. 新图片通过格式、尺寸和重复哈希检查后再加入本站。",
        "",
        f"Actions 运行：{run_url(environment) or '请前往 GitHub Actions 查看'}",
        "",
        "监控快照保存在私有 Actions Artifact，不发布到网站目录。",
    ])
    return subject, "\n".join(body)


def build_failure_email(environment: Mapping[str, str]) -> tuple[str, str]:
    return (
        "[Heartopia] 每日数据库监控运行失败",
        "\n".join([
            "Heartopia 每日数据库轻量监控执行失败。",
            "",
            f"Actions 运行：{run_url(environment) or '请前往 GitHub Actions 查看'}",
            "",
            "请检查远程列表结构、网络、Artifact 基线或 Gmail 配置。",
            "失败不会修改网站页面或公开数据。",
        ]),
    )


def build_test_email(environment: Mapping[str, str]) -> tuple[str, str]:
    return (
        "[Heartopia] 数据库监控 Gmail 测试成功",
        "\n".join([
            "每日数据库轻量监控的 Gmail 配置可用。",
            "",
            "以后检测到新增、删除、改名或解析警告时会发送提醒。",
            f"Actions 运行：{run_url(environment) or '未提供'}",
        ]),
    )


def send_email(subject: str, body: str, environment: Mapping[str, str]) -> bool:
    username = environment.get("GMAIL_USERNAME", "").strip()
    password = environment.get("GMAIL_APP_PASSWORD", "").replace(" ", "")
    to_address = recipient(environment)
    missing = []
    if not username:
        missing.append("GMAIL_USERNAME")
    if not password:
        missing.append("GMAIL_APP_PASSWORD")
    if not to_address:
        missing.append("DATABASE_ALERT_EMAIL or EVENT_ALERT_EMAIL")
    if missing:
        print("::warning::Database alert skipped; missing GitHub Secrets: " + ", ".join(missing))
        return False

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = username
    message["To"] = to_address
    message.set_content(body)
    with smtplib.SMTP_SSL(
        SMTP_HOST, SMTP_PORT, context=ssl.create_default_context(), timeout=30
    ) as smtp:
        smtp.login(username, password)
        smtp.send_message(message)
    print(f"Database discovery alert sent to {to_address}.")
    return True


def main() -> int:
    kind = sys.argv[1] if len(sys.argv) > 1 else "update"
    if kind == "update":
        report_file = Path(os.environ["DATABASE_DISCOVERY_REPORT"])
        subject, body = build_update_email(
            json.loads(report_file.read_text(encoding="utf-8")), os.environ
        )
    elif kind == "failure":
        subject, body = build_failure_email(os.environ)
    elif kind == "test":
        subject, body = build_test_email(os.environ)
    else:
        print(f"Unknown alert type: {kind}", file=sys.stderr)
        return 2
    send_email(subject, body, os.environ)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
