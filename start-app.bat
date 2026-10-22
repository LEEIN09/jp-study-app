@echo off
chcp 65001 > nul
title 일본어 초고속 입문 마스터 서버
echo ===================================================
echo   [일본어 초고속 입문 마스터] 앱을 시작합니다...
echo   브라우저가 자동으로 열립니다. (종료하려면 이 창을 닫으세요)
echo ===================================================
cd /d "C:\Users\Donga\.gemini\antigravity\scratch\jp-study-app"
npm run dev -- --open --host
pause
