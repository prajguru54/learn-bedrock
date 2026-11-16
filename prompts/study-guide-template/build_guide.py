#!/usr/bin/env python3
"""Assemble study-guide fragments into one standalone HTML file and validate it.

Usage:
  python3 build_guide.py --parts /tmp/aip-d2 --out docs/aip-c01-domain2-study-guide.html

The parts directory must contain:
  00-head.html   copy of shell-head.html with every {{PLACEHOLDER}} filled in
  zz-foot.html   copy of shell-foot.html with {{STORAGE_PREFIX}} filled in
  order.txt      fragment file names, one per line, in reading order
"""
import argparse, re, subprocess, sys, tempfile, shutil
from collections import Counter
from html.parser import HTMLParser

VOID = {"meta", "link", "br", "hr", "img", "input", "rect", "path"}
WRAP_TOP = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1">\n</head>\n<body>\n')
WRAP_BOTTOM = ('\n<script type="module">\n'
               'import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.esm.min.mjs";\n'
               'const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;\n'
               'mermaid.initialize({ startOnLoad: true, theme: dark ? "dark" : "default", securityLevel: "loose" });\n'
               '</script>\n</body>\n</html>\n')


class Checker(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack, self.errors, self.ids, self.hrefs = [], [], [], []

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if "id" in d:
            self.ids.append(d["id"])
        if tag == "a" and d.get("href", "").startswith("#"):
            self.hrefs.append(d["href"][1:])
        if tag not in VOID:
            self.stack.append((tag, self.getpos()))

    def handle_startendtag(self, tag, attrs):
        pass

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if self.stack and self.stack[-1][0] == tag:
            self.stack.pop()
        else:
            self.errors.append((tag, self.getpos()))


def validate(html):
    ok = True
    c = Checker()
    c.feed(html)
    print("bytes:", len(html.encode()))
    print("tag errors:", c.errors[:5], "| unclosed:", c.stack[:5])
    ok &= not c.errors and not c.stack
    dups = [k for k, v in Counter(c.ids).items() if v > 1]
    print("duplicate ids:", dups)
    ok &= not dups
    idset = set(c.ids)
    broken = sorted({h for h in c.hrefs if h not in idset})
    print("broken anchors:", broken)
    ok &= not broken
    left = sorted(set(re.findall(r"\{\{[A-Z0-9_]+\}\}", html)))
    print("unfilled placeholders:", left)
    ok &= not left
    print("em dashes:", html.count("—"), "| /tmp refs:", html.count("/tmp"))
    ok &= html.count("/tmp") == 0
    blocks = re.findall(r'<pre class="mermaid">(.*?)</pre>', html, re.S)
    flagged = 0
    for b in blocks:
        for lab in re.findall(r'\[([^\]"]*)\]', b):
            if re.search(r"[()/:,]", lab):
                flagged += 1
                print("  unquoted mermaid label:", lab)
    print("mermaid blocks:", len(blocks), "| flagged:", flagged)
    ok &= flagged == 0
    scripts = re.findall(r"<script>(.*?)</script>", html, re.S)
    if scripts and shutil.which("node"):
        with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False) as f:
            f.write(scripts[-1])
        r = subprocess.run(["node", "--check", f.name], capture_output=True, text=True)
        print("toc script syntax:", "ok" if r.returncode == 0 else r.stderr.strip())
        ok &= r.returncode == 0
    return ok


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--parts", required=True)
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    read = lambda n: open(f"{a.parts}/{n}", encoding="utf-8").read()
    names = [l.strip() for l in read("order.txt").splitlines() if l.strip() and not l.startswith("#")]
    body = read("00-head.html") + "".join(read(n) for n in names) + read("zz-foot.html")
    html = WRAP_TOP + body + WRAP_BOTTOM
    ok = validate(html)
    open(a.out, "w", encoding="utf-8").write(html)
    print("wrote", a.out)
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
