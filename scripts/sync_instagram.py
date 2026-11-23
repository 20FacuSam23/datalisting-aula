#!/usr/bin/env python3
"""Read A Remarla's public Instagram pages and publish a same-origin JSON feed.

No login, cookies, third-party proxy or access token is used. Fail closed if
Instagram stops returning public metadata; the last successful feed is retained.
"""

import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import re
import sys
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

ACCOUNT = "kayak_parana_club"
ORIGIN = "https://www.instagram.com"
PROFILE = f"{ORIGIN}/{ACCOUNT}/"
PUBLIC_FEED = PROFILE + "embed/"
ROOT = Path(__file__).resolve().parents[1]
FEED = ROOT / "a-remarla/data/instagram.json"
IMAGES = ROOT / "assets/a-remarla-instagram"
LOCAL_TZ = ZoneInfo("America/Argentina/Cordoba")


def download(url, *, image=False):
    parsed = urlparse(url)
    host = parsed.hostname or ""
    permitted = (host.endswith(".cdninstagram.com") or host.endswith(".fbcdn.net")) if image else host == "www.instagram.com"
    if parsed.scheme != "https" or not permitted:
        raise ValueError("Origen de Instagram no permitido")
    request = Request(url, headers={"User-Agent": "ARemarlaWebsiteSync/1.0", "Accept-Language": "es-AR,es;q=0.9,en;q=0.8"})
    with urlopen(request, timeout=25) as response:
        final_host = urlparse(response.url).hostname or ""
        if image:
            if not (final_host.endswith(".cdninstagram.com") or final_host.endswith(".fbcdn.net")):
                raise ValueError("La imagen redirigió fuera de Instagram")
        elif final_host != "www.instagram.com" or "/accounts/" in urlparse(response.url).path:
            raise ValueError("Instagram requiere iniciar sesión")
        body = response.read(10 * 1024 * 1024 + 1)
        if len(body) > 10 * 1024 * 1024:
            raise ValueError("Respuesta de Instagram demasiado grande")
        return body


def read_public_feed(source):
    """Decode the JSON data in Instagram's public profile embed, never run JS."""
    found = {}

    def walk(value, depth=0):
        if depth > 80:
            return
        if isinstance(value, dict):
            code = value.get("shortcode")
            owner = value.get("owner") or {}
            timestamp = value.get("taken_at_timestamp")
            if (isinstance(code, str) and re.fullmatch(r"[A-Za-z0-9_-]{5,30}", code)
                    and owner.get("username") == ACCOUNT and not owner.get("is_private")
                    and not owner.get("is_unpublished") and isinstance(timestamp, (int, float))):
                edges = (value.get("edge_media_to_caption") or {}).get("edges", [])
                caption = "\n".join(e.get("node", {}).get("text", "") for e in edges).strip()
                image = value.get("display_url")
                if caption and isinstance(image, str) and image:
                    route = "reel" if value.get("is_video") else "p"
                    found[code] = {
                        "id": code, "source_url": f"{PROFILE}{route}/{code}/", "account": ACCOUNT,
                        "kind": "reel" if value.get("is_video") else "post", "caption": caption,
                        "published_at": datetime.fromtimestamp(timestamp, timezone.utc).isoformat(),
                        "_image_url": image,
                    }
            for child in value.values():
                walk(child, depth + 1)
        elif isinstance(value, list):
            for child in value:
                walk(child, depth + 1)
        elif isinstance(value, str) and value[:1] in ("{", "["):
            try:
                walk(json.loads(value), depth + 1)
            except ValueError:
                pass

    decoder = json.JSONDecoder()
    for match in re.finditer(r"\.handle\(\s*(?=\{)", source):
        try:
            data, _ = decoder.raw_decode(source, match.end())
            walk(data)
        except ValueError:
            continue
    return sorted(found.values(), key=lambda p: p["published_at"], reverse=True)


def atomic_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(path)


def sync(mode):
    existing = json.loads(FEED.read_text()) if FEED.exists() else {"posts": []}
    posts = read_public_feed(download(PUBLIC_FEED).decode("utf-8"))
    if not posts:
        raise ValueError("Instagram no entregó ninguna publicación pública verificable")
    now = datetime.now(timezone.utc)
    if mode == "previous":
        if len(posts) < 2:
            raise ValueError("No se encontró la publicación anterior")
        selected = posts[1:2]
    elif mode == "latest":
        selected = posts[:1]
    else:
        selected = [p for p in posts if datetime.fromisoformat(p["published_at"]).astimezone(LOCAL_TZ).date() == now.astimezone(LOCAL_TZ).date()]
    imported = []
    for post in selected:
        body = download(post.pop("_image_url"), image=True)
        if body.startswith(b"\xff\xd8\xff"):
            extension = ".jpg"
        elif body.startswith(b"\x89PNG\r\n\x1a\n"):
            extension = ".png"
        elif body.startswith(b"RIFF") and body[8:12] == b"WEBP":
            extension = ".webp"
        else:
            raise ValueError("La descarga no es una imagen válida")
        IMAGES.mkdir(parents=True, exist_ok=True)
        image_path = IMAGES / (post["id"] + extension)
        temporary = image_path.with_suffix(extension + ".tmp")
        temporary.write_bytes(body)
        temporary.replace(image_path)
        post["image"] = "../assets/a-remarla-instagram/" + image_path.name
        post["imported_at"] = now.isoformat()
        imported.append(post)
    # Merge by immutable shortcode; keep all existing cards on read failures.
    merged = {p["id"]: p for p in existing.get("posts", [])}
    for post in imported:
        previous = merged.get(post["id"])
        if previous:
            post["imported_at"] = previous.get("imported_at", post["imported_at"])
        merged[post["id"]] = post
    result = {
        "account": ACCOUNT, "checked_at": now.isoformat(), "mode": mode, "source": PUBLIC_FEED,
        "posts": sorted(merged.values(), key=lambda p: p["published_at"], reverse=True)[:24],
    }
    atomic_json(FEED, result)
    print(json.dumps({"mode": mode, "read_public_posts": len(posts), "imported": [p["id"] for p in imported], "total": len(result["posts"])}))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mode", choices=["today", "latest", "previous"], default="today")
    args = parser.parse_args()
    try:
        sync(args.mode)
    except Exception as error:
        print(f"No se actualizó el carrusel; se conserva la última lectura: {type(error).__name__}: {error}", file=sys.stderr)
        sys.exit(1)
