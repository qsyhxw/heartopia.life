#!/usr/bin/env python3
"""Send Heartopia event discovery and workflow failure alerts through Gmail SMTP."""

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
REQUIRED_SECRETS = ("GMAIL_USERNAME", "GMAIL_APP_PASSWORD")


def run_url(environment: Mapping[str, str]) -> str:
    repository = environment.get("GITHUB_REPOSITORY", "qsyhxw/heartopia.life")
    run_id = environment.get("GITHUB_RUN_ID", "")
    return f"https://github.com/{repository}/actions/runs/{run_id}" if run_id else ""


def recipient(environment: Mapping[str, str]) -> str:
    return (
        environment.get("EVENT_ALERT_EMAIL", "").strip()
        or environment.get("PATCH_ALERT_EMAIL", "").strip()
    )


def event_line(event: Mapping[str, object]) -> str:
    schedule = str(event.get("dateLabel") or "").strip()
    if not schedule:
        start = str(event.get("startDate") or "").strip()
        end = str(event.get("endDate") or "").strip()
        schedule = " - ".join(value for value in (start, end) if value)
    suffix = f" | {schedule}" if schedule else ""
    return (
        f"- {event.get('name', 'Unnamed event')} "
        f"[{event.get('status', 'unknown')}]{suffix}\n"
        f"  {event.get('siteUrl', 'https://heartopia.life/events/')}"
    )


def source_signal_line(signal: Mapping[str, object]) -> str:
    return (
        f"- {signal.get('title', 'Unnamed signal')} "
        f"[{signal.get('signalType', 'announcement')}]\n"
        f"  {signal.get('url', '')}"
    )


def read_source_signals(environment: Mapping[str, str]) -> list[Mapping[str, object]]:
    report_file = Path(environment.get("EVENT_SOURCE_REPORT", ""))
    if not report_file.is_file():
        return []
    try:
        data = json.loads(report_file.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return []
    return [signal for signal in data.get("newSignals", []) if signal.get("sourceKind") == "official"]


def build_update_email(report: Mapping[str, object], environment: Mapping[str, str]) -> tuple[str, str]:
    new_events = list(report.get("newEvents", []))
    changed_events = list(report.get("changedEvents", []))
    removed_events = list(report.get("removedEvents", []))
    official_signals = read_source_signals(environment)
    subject = f"[Heartopia] {len(new_events)} 个新活动，{len(official_signals)} 个新官方信号"
    body = [
        "Heartopia 每日活动监控发现变化，本站 Events 已完成基础事实更新。",
        f"新官方公告或版本信号：{len(official_signals)}",
        *[source_signal_line(signal) for signal in official_signals],
        "",
        f"新活动：{len(new_events)}",
        *[event_line(event) for event in new_events],
        "",
        f"状态或日期变化：{len(changed_events)}",
        *[event_line(event) for event in changed_events],
        "",
        f"来源列表中移除：{len(removed_events)}",
        *[event_line(event) for event in removed_events],
        "",
        "建议下一步：",
        "1. 在 Google Trends、GSC 和社区搜索活动名及多语言变体。",
        "2. 核实活动任务、奖励、实体、位置与常见问题。",
        "3. 扩写英文主活动页，再按真实搜索需求建立专题页和本地化页面。",
        "",
        "Events 总入口：https://heartopia.life/events/",
        f"Actions 运行：{run_url(environment) or '请前往 GitHub Actions 查看'}",
        "",
        "自动流程仅同步名称、状态、类型和日期等基础事实，不自动复制第三方攻略正文。",
    ]
    return subject, "\n".join(body)


def build_failure_email(environment: Mapping[str, str]) -> tuple[str, str]:
    subject = "[Heartopia] 每日活动监控运行失败"
    body = "\n".join([
        "Heartopia 每日活动监控工作流执行失败。",
        "",
        f"Actions 运行：{run_url(environment) or '请前往 GitHub Actions 查看'}",
        "",
        "请检查活动列表抓取、字段白名单、页面生成、Git 推送或 Gmail 配置。",
    ])
    return subject, body


def build_test_email(environment: Mapping[str, str]) -> tuple[str, str]:
    return (
        "[Heartopia] 活动监控 Gmail 通知测试成功",
        "\n".join([
            "Heartopia 活动监控的 Gmail SMTP 配置成功。",
            "",
            "以后发现新活动、日期或状态变化时会自动发送提醒。",
            f"Actions 运行：{run_url(environment) or '未提供'}",
        ]),
    )


def send_email(subject: str, body: str, environment: Mapping[str, str]) -> bool:
    missing = [name for name in REQUIRED_SECRETS if not environment.get(name, "").strip()]
    to_address = recipient(environment)
    if not to_address:
        missing.append("EVENT_ALERT_EMAIL or PATCH_ALERT_EMAIL")
    if missing:
        print("::warning::Event alert skipped; missing GitHub Secrets: " + ", ".join(missing))
        return False

    username = environment["GMAIL_USERNAME"].strip()
    password = environment["GMAIL_APP_PASSWORD"].replace(" ", "")
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
    print(f"Event alert sent to {to_address}.")
    return True


def main() -> int:
    kind = sys.argv[1] if len(sys.argv) > 1 else "update"
    if kind == "update":
        report_file = Path(
            os.environ.get("EVENT_ALERT_REPORT", ".tmp-sync/event-alert.json")
        )
        report = json.loads(report_file.read_text(encoding="utf-8"))
        subject, body = build_update_email(report, os.environ)
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
