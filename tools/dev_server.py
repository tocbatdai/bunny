"""Local dev server for Bé Vẽ Vui.

Serves the project folder and, for tools/build.html only, accepts
`PUT /__write/<path>` so the browser can save generated assets.
Writes are limited to assets/pages, assets/thumbs and assets/icons.

Usage:  python tools/dev_server.py [port]      (default port 5173)
"""
import http.server
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WRITABLE = [ROOT / "assets" / "pages", ROOT / "assets" / "thumbs", ROOT / "assets" / "icons"]


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript",
        ".webmanifest": "application/manifest+json",
        ".webp": "image/webp",
        ".bin": "application/octet-stream",
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        # Always fetch fresh files while developing.
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_PUT(self):
        if self.client_address[0] not in ("127.0.0.1", "::1"):
            self.send_error(403, "writes only from this computer")
            return
        if not self.path.startswith("/__write/"):
            self.send_error(404)
            return
        target = (ROOT / self.path[len("/__write/"):].split("?")[0]).resolve()
        if not any(target.parent == d.resolve() for d in WRITABLE):
            self.send_error(403, "path not writable")
            return
        length = int(self.headers.get("Content-Length", 0))
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(self.rfile.read(length))
        self.send_response(204)
        self.end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5173
    # Pass "lan" as 2nd argument to open it from a phone/tablet on the same Wi-Fi.
    host = "0.0.0.0" if len(sys.argv) > 2 and sys.argv[2] == "lan" else "127.0.0.1"
    os.chdir(ROOT)
    print(f"Serving {ROOT} on http://{'<IP máy tính>' if host == '0.0.0.0' else 'localhost'}:{port}")
    http.server.ThreadingHTTPServer((host, port), Handler).serve_forever()
