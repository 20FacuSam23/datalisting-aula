import importlib.util
import json
from datetime import datetime, timezone
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

SPEC = importlib.util.spec_from_file_location("instagram_sync", Path(__file__).resolve().parents[1] / "scripts/sync_instagram.py")
SYNC = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(SYNC)


class InstagramSyncTests(unittest.TestCase):
    def test_new_posts_include_late_posts_and_skip_old_unseen_posts(self):
        saved = {"posts": [{"id": "known", "published_at": "2026-11-22T21:00:00+00:00"}]}
        posts = [
            {"id": "late", "published_at": "2026-11-23T02:30:00+00:00"},
            saved["posts"][0],
            {"id": "older", "published_at": "2026-11-21T12:00:00+00:00"},
        ]
        now = datetime(2026, 11, 23, 12, tzinfo=timezone.utc)
        self.assertEqual([p["id"] for p in SYNC.select_posts("new", posts, saved, now)], ["late"])

    def test_failed_read_preserves_feed(self):
        with tempfile.TemporaryDirectory() as directory:
            feed = Path(directory) / "feed.json"
            original = b'{"posts":[{"id":"keep"}]}'
            feed.write_bytes(original)
            with patch.object(SYNC, "download", return_value=b"<html>Log in</html>"):
                with self.assertRaises(ValueError):
                    SYNC.sync("new", feed, Path(directory) / "images")
            self.assertEqual(feed.read_bytes(), original)

    def test_retains_more_than_twenty_four_saved_posts(self):
        with tempfile.TemporaryDirectory() as directory:
            feed = Path(directory) / "feed.json"
            saved = [{"id": "saved" + str(i), "published_at": "2026-11-22T12:00:00+00:00"} for i in range(40)]
            feed.write_text(json.dumps({"posts": saved, "manual_setting": "keep"}))
            with patch.object(SYNC, "download", return_value=b"public"), patch.object(SYNC, "read_public_feed", return_value=[saved[0]]):
                SYNC.sync("new", feed, Path(directory) / "images")
            result = json.loads(feed.read_text())
            self.assertEqual(len(result["posts"]), 40)
            self.assertEqual(result["manual_setting"], "keep")


if __name__ == "__main__":
    unittest.main()
