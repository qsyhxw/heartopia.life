import importlib.util
import unittest
from pathlib import Path


SCRIPT = Path(__file__).parents[1] / "scripts" / "send_event_alert.py"
SPEC = importlib.util.spec_from_file_location("send_event_alert", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader
SPEC.loader.exec_module(MODULE)


class EventAlertTests(unittest.TestCase):
    def test_update_email_contains_site_url_without_source_url(self):
        report = {
            "newEvents": [{
                "name": "New Season",
                "status": "upcoming",
                "dateLabel": "Aug 1 - Aug 20",
                "siteUrl": "https://heartopia.life/events/new-season/",
            }],
            "changedEvents": [],
            "removedEvents": [],
        }
        subject, body = MODULE.build_update_email(report, {})
        self.assertIn("发现 1 个新活动", subject)
        self.assertIn("https://heartopia.life/events/new-season/", body)
        self.assertNotIn("heartodex.com", body)

    def test_missing_secrets_skip_without_failure(self):
        self.assertFalse(MODULE.send_email("subject", "body", {}))


if __name__ == "__main__":
    unittest.main()
