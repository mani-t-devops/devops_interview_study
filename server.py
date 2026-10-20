#!/usr/bin/env python3
"""
Simple local HTTP server for DevOps Interview Study Hub.
Zero dependencies required — uses Python 3 standard library.
"""
import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def run():
    port = PORT
    # Try finding an open port starting from 8080
    for p in range(PORT, PORT + 20):
        try:
            with socketserver.TCPServer(("", p), Handler) as httpd:
                print("=" * 65)
                print("  🚀 2-Week DevOps Interview Study Hub (5+ Years Experience)")
                print("=" * 65)
                print(f"  • Local Server:  http://localhost:{p}")
                print(f"  • Directory:     {DIRECTORY}")
                print("  • Press Ctrl+C to stop the server anytime.")
                print("=" * 65)
                try:
                    webbrowser.open(f"http://localhost:{p}")
                except Exception:
                    pass
                httpd.serve_forever()
                break
        except OSError:
            continue

if __name__ == "__main__":
    try:
        run()
    except KeyboardInterrupt:
        print("\nServer stopped. Happy studying & best of luck with your interviews!")
        sys.exit(0)
