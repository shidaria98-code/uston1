#!/usr/bin/env bash
set -euo pipefail
mkdir -p work-verification
adb install android/app/build/outputs/apk/debug/app-debug.apk
adb shell settings put global airplane_mode_on 1
adb shell svc wifi disable
adb shell svc data disable
adb shell am start -W -n ru.uston.portal/.MainActivity
sleep 8
adb shell pidof ru.uston.portal
node scripts/android-webview-test.cjs
adb shell uiautomator dump /sdcard/uston.xml
adb pull /sdcard/uston.xml work-verification/launch.xml
adb exec-out screencap -p > work-verification/offline-launch.png
adb logcat -d > work-verification/logcat.txt
python3 - <<'CHECK'
from pathlib import Path
text=Path('work-verification/launch.xml').read_text()
assert 'ru.uston.portal' in text
logs=Path('work-verification/logcat.txt').read_text(errors='replace')
assert 'FATAL EXCEPTION' not in logs
print('PASS: APK installed and rendered portal with wifi/mobile data disabled')
CHECK
