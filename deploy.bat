@echo off
chcp 65001 > nul
echo [일본어 입문 마스터] 웹 주소(GitHub Pages) 업데이트 중...
cd /d "C:\Users\Donga\.gemini\antigravity\scratch\jp-study-app"
call npm run build
cd dist
git init
git checkout -B gh-pages
git add -A
git commit -m "Update deployment"
git push -f https://github.com/LEEIN09/jp-study-app.git gh-pages
echo ===================================================
echo   배포 완료! https://leein09.github.io/jp-study-app/
echo ===================================================
pause
