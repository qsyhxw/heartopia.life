#!/usr/bin/env python3
"""Send one plain-text Gmail notification from a GitHub Actions step (SOP 05 §2.9.1, v3.27).

  python scripts/notify_email.py --subject "[site] ..." [--body "..."] [--body-file FILE] [--diff PATHS...]

Secrets (same Gmail account for every site): GMAIL_USERNAME, GMAIL_APP_PASSWORD and the recipient in
ALERT_EMAIL (falls back to PATCH_ALERT_EMAIL or EVENT_ALERT_EMAIL). Missing secrets print a warning and
exit 0, so notification trouble never fails the job that already did its work.
--diff appends `git diff --stat HEAD~1 -- PATHS` (use after the automation's own commit).
"""
import argparse
import os
import smtplib
import ssl
import subprocess
from email.message import EmailMessage


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--subject', required=True)
    ap.add_argument('--body', default='')
    ap.add_argument('--body-file')
    ap.add_argument('--diff', nargs='*')
    a = ap.parse_args()
    body = a.body
    if a.body_file and os.path.exists(a.body_file):
        body += '\n' + open(a.body_file, encoding='utf8').read()
    if a.diff is not None:
        stat = subprocess.run(['git', 'diff', '--stat', 'HEAD~1', '--', *a.diff], capture_output=True, text=True).stdout
        body += '\n\n改动文件：\n' + (stat.strip() or '（无）')
    run = os.environ.get('GITHUB_RUN_ID')
    if run:
        body += f"\n\n运行记录：{os.environ.get('GITHUB_SERVER_URL', 'https://github.com')}/{os.environ.get('GITHUB_REPOSITORY', '')}/actions/runs/{run}"
    body += '\n\n此邮件由 GitHub Actions 自动发送。\n'
    user = os.environ.get('GMAIL_USERNAME', '').strip()
    password = os.environ.get('GMAIL_APP_PASSWORD', '').replace(' ', '')
    to = next((os.environ.get(k, '').strip() for k in ('ALERT_EMAIL', 'PATCH_ALERT_EMAIL', 'EVENT_ALERT_EMAIL') if os.environ.get(k, '').strip()), '')
    if not (user and password and to):
        print('::warning::Gmail secrets missing (GMAIL_USERNAME / GMAIL_APP_PASSWORD / ALERT_EMAIL); no email sent')
        print(f'--- would send: {a.subject}\n{body}')
        return 0
    msg = EmailMessage()
    msg['Subject'], msg['From'], msg['To'] = a.subject, user, to
    msg.set_content(body)
    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=ssl.create_default_context(), timeout=30) as smtp:
            smtp.login(user, password)
            smtp.send_message(msg)
    except Exception as e:  # never fail the job because of the notification
        print(f'::warning::email not sent: {e}')
        return 0
    print(f'Email sent to {to}: {a.subject}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
