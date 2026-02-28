#!/bin/bash
# Script to view Android app logs for debugging

echo "=== Viewing MainApplication logs ==="
echo "Press Ctrl+C to stop"
echo ""
adb logcat -c
adb logcat | grep -E "MainApplication|Firebase|AndroidRuntime|FATAL|ritma_ed"

