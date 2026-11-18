#!/usr/bin/env python3
"""browser-sweep.py — close every leaked headless Chromium test instance.

Each verification script in this project launches a headless Chromium with a
scratch profile and a CDP debugging port. When a script crashes before its
cleanup runs, the browser survives — and every lab page runs an infinite
animation loop, so a leaked browser burns a full CPU core forever. Snap's
AppArmor denies signals from outside the snap, so `pkill` cannot reach them;
the one door that stays open is each instance's own DevTools endpoint
(Browser.close over CDP).

Usage:  python3 tools/browser-sweep.py
"""
import glob, json, os, re, subprocess, sys, time, urllib.request, websocket

def listening_ports():
    ports = set()
    try:
        out = subprocess.check_output(['ss', '-tlnp'], stderr=subprocess.DEVNULL).decode()
        for m in re.finditer(r'127\.0\.0\.1:(\d+).*chrome', out):
            ports.add(int(m.group(1)))
    except Exception:
        pass
    # DevToolsActivePort files: the port Chromium actually bound, even when the
    # requested one collided and DevTools fell back or stayed closed
    for f in glob.glob('/tmp/*/DevToolsActivePort') + glob.glob('/home/*/chrometest-profile/DevToolsActivePort'):
        try:
            with open(f) as fh:
                port = int(fh.read().split('\n')[0].strip())
            ports.add(port)
        except Exception:
            pass
    return sorted(ports)

def main():
    ports = listening_ports()
    closed = unreachable = 0
    for port in ports:
        try:
            ver = json.load(urllib.request.urlopen('http://127.0.0.1:%d/json/version' % port, timeout=2))
            w = websocket.create_connection(ver['webSocketDebuggerUrl'], timeout=5)
            w.send(json.dumps({'id': 1, 'method': 'Browser.close'}))
            try:
                w.recv()
            except Exception:
                pass
            closed += 1
        except Exception:
            unreachable += 1
    print('CDP endpoints found: %d, closed: %d, refused: %d' % (len(ports), closed, unreachable))
    # scratch profiles accumulate cached GPU shader disks; sweep them too
    removed = 0
    for d in glob.glob('/tmp/chromeprof-*') + glob.glob('/tmp/chromefresh-*') + glob.glob('/tmp/chrometest-*'):
        time.sleep(0.2)
        try:
            subprocess.check_call(['rm', '-rf', d], stderr=subprocess.DEVNULL)
            removed += 1
        except Exception:
            pass
    print('scratch profiles removed: %d' % removed)
    return 0

if __name__ == '__main__':
    sys.exit(main())
