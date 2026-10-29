# GitHub 커밋 및 배포 전 점검

1. 본 ZIP의 reading_subject-main 내부 파일만 GitHub Desktop이 Clone한 reading_subject 폴더로 복사하세요. `.git`, `node_modules`, `dist`, `.env` 는 복사하지 마세요.
2. GitHub 저장소 Settings → Secrets and variables → Actions → New repository secret에서 이름 `VITE_FIREBASE_API_KEY`로 현재 Firebase 웹 API 키를 저장하세요. 실제 값은 문서나 커밋에 올리지 마세요.
3. GitHub Desktop Changes 목록에서 기존 `firebaseConfig_Key.txt`가 남으면 탐색기에서 삭제하세요.
4. `npm ci`, `npm run build` 성공 후 Commit/Push 하세요. GitHub Actions에 배포 성공 여부와 Firebase 연결을 확인하세요.
5. 주의: 과거 커밋에 이미 공개된 키 값은 새 커밋에서 없어지지 않습니다. 키 사용 제한과 Firebase Security Rules를 확인하고 필요하면 키를 교체하세요.
6. Firebase 웹 API 키가 번들에 포함되는 것은 Firebase 설계상 일반적이므로, GitHub Secrets는 소스 코드 직접 노출 방지용이며 브라우저에서 키 값을 완전히 비밀로 만들지는 않습니다.
