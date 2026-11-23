import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

PUBLISHER = Path(__file__).resolve().parents[1] / "scripts/publish_instagram.sh"


class PublisherTests(unittest.TestCase):
    def test_retries_rejected_push_without_losing_concurrent_data(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            origin, seed, worker, writer = [root / x for x in ["origin.git", "seed", "worker", "writer"]]
            def git(*args, cwd=None):
                return subprocess.run(["git", *args], cwd=cwd, text=True, check=True, capture_output=True)
            git("init", "--bare", str(origin))
            git("clone", str(origin), str(seed))
            for key, value in [("user.name", "Test"), ("user.email", "test@example.invalid")]:
                git("config", key, value, cwd=seed)
            (seed / "scripts").mkdir()
            shutil.copyfile(PUBLISHER, seed / "scripts/publish_instagram.sh")
            (seed / "scripts/sync_instagram.py").write_text(
                "from pathlib import Path\nimport json\np=Path('a-remarla/data/instagram.json')\n"
                "d=json.loads(p.read_text())\n"
                "if 'new' not in d['posts']: d['posts'].append('new')\n"
                "p.write_text(json.dumps(d))\n")
            (seed / "a-remarla/data").mkdir(parents=True)
            (seed / "a-remarla/data/instagram.json").write_text('{"posts":["base"]}')
            (seed / "assets/a-remarla-instagram").mkdir(parents=True)
            (seed / "assets/a-remarla-instagram/.gitkeep").touch()
            git("add", ".", cwd=seed)
            git("commit", "-m", "Initial fixture", cwd=seed)
            git("branch", "-M", "main", cwd=seed)
            git("push", "origin", "main", cwd=seed)
            git("symbolic-ref", "HEAD", "refs/heads/main", cwd=origin)
            git("clone", str(origin), str(worker))
            git("clone", str(origin), str(writer))
            for key, value in [("user.name", "Concurrent test"), ("user.email", "test@example.invalid")]:
                git("config", key, value, cwd=writer)
            # Change the remote after the worker prepared its first push.
            racing = root / "race.py"
            racing.write_text(
                "import os,json,subprocess\nfrom pathlib import Path\n"
                f"flag=Path({str(root / 'raced')!r})\n"
                "if not flag.exists():\n"
                " flag.touch()\n"
                f" p=Path({str(writer / 'a-remarla/data/instagram.json')!r})\n"
                " d=json.loads(p.read_text());d['posts'].append('concurrent');p.write_text(json.dumps(d))\n"
                " env={k:v for k,v in os.environ.items() if not k.startswith('GIT_')}\n"
                f" for args in [['add','.'],['commit','-m','Concurrent data'],['push','origin','main']]: subprocess.run(['git',*args],cwd={str(writer)!r},env=env,check=True,capture_output=True)\n")
            hook = worker / ".git/hooks/pre-push"
            hook.write_text('#!/bin/sh\npython3 "' + str(racing) + '"\n')
            hook.chmod(0o755)
            env = dict(os.environ, GITHUB_ACTIONS="true", GITHUB_WORKSPACE=str(worker))
            result = subprocess.run(["bash", "scripts/publish_instagram.sh", "new"], cwd=worker, env=env, text=True, capture_output=True)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertIn("se repetirá la importación", result.stderr)
            remote = json.loads(git("show", "main:a-remarla/data/instagram.json", cwd=origin).stdout)
            self.assertEqual(remote["posts"], ["base", "concurrent", "new"])


if __name__ == "__main__":
    unittest.main()
