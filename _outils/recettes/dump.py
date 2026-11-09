#!/usr/bin/env python3
"""Extrait les recettes telles que la page les charge (base + recettes-plus.js + corrections).
Usage : lancer un serveur sur le dossier du site (python3 -m http.server 8098) puis python3 dump.py sortie.json"""
import json, sys
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    pg.goto("http://localhost:8098/menus/recettes.html"); pg.wait_for_timeout(1500)
    json.dump(pg.evaluate("()=>({R,I})"), open(sys.argv[1], "w"), ensure_ascii=False)
