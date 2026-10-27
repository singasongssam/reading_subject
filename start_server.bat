@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo ========================================================
echo [교과 연계 독서전략 수업설계 시스템] 로컬 서버 구동기
echo ========================================================
echo.
echo 잠시 후 개발 서버가 시작됩니다...
echo 브라우저에서 http://localhost:3000 으로 접속하실 수 있습니다.
echo.
"C:\Program Files\nodejs\npm.cmd" run dev
pause
