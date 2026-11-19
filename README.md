# AEROSCOPE 제조기업 외관 품질검사

제조기업에서 부품 사진과 외관 관찰 내용을 기록하고 검토 이력을 관리하도록 만든 산학프로젝트 시제품입니다.

## 실행

Windows에서는 `시작.cmd`를 더블클릭합니다. 설치된 Node.js, Codex 번들 Node.js, Python 중 하나를 사용해 `http://localhost:8765`를 엽니다. 실행 창을 닫으면 서버가 종료됩니다. 포트가 사용 중이면 기존 서버를 종료하거나 `node server.mjs 8877`로 실행합니다.

사이트 주소로 접속하면 별도 설치 없이 사용할 수 있습니다. 카메라 입력은 HTTPS 또는 localhost에서 브라우저 권한 허용 후 사용합니다. 휴대폰은 자체 기기의 브라우저에서 HTTPS 주소를 사용합니다.

`dist/index.html`을 파일 탐색기에서 바로 여는 방식은 지원하지 않습니다. 로컬 서버 또는 정적 웹 호스팅이 필요합니다.

## 공정별 체크리스트

외관 품질검사 화면에서 공정을 선택하면 사진으로 확인할 수 있는 의심 항목과 출처가 표시됩니다. 다이캐스팅 주조와 부품 조립 항목은 KAMP 공개 자료를 참고했습니다. 도금·표면처리 세부 항목과 금속 가공 항목은 AEROSCOPE 시연용 예시입니다. 작업자가 체크한 항목과 회사 검사 기준서 번호는 검사 기록 및 CSV에 함께 남습니다. 최종 판정에는 회사 도면·검사 기준서를 적용합니다.

## Gemini 사진 관찰

- **Windows 로컬 시연:** Node.js 20 이상을 설치하고 `Gemini 시작.cmd`를 엽니다. Google AI Studio에서 발급한 키를 숨김 입력창에 넣고, 열린 localhost에서 사진과 공정을 선택한 뒤 **Gemini로 관찰**을 누릅니다. Mac/Linux에서는 키를 현재 셸의 환경 변수 `GEMINI_API_KEY`로 설정하고 `node server.mjs`로 실행합니다.
- **공개 GitHub Pages에서 사용:** 이 저장소의 Dockerfile을 지원하는 HTTPS 호스팅에 Gemini 서버를 배포합니다. 호스팅 서비스의 비밀 환경 변수로 `GEMINI_API_KEY`와 24자 이상의 무작위 `AEROSCOPE_ACCESS_CODE`를 설정합니다. 포트는 서비스의 `PORT`를 사용하며 기본값은 8765입니다. AEROSCOPE의 **AI 연결 설정 → 공개 페이지에서 Gemini 서버 연결**에 HTTPS 주소와 접속 코드를 입력합니다. GitHub Pages의 공개 주소는 그대로 사용할 수 있고, 접속 코드는 브라우저 메모리에만 유지됩니다.
- 기본 모델은 `gemini-3.5-flash-lite`입니다. Google AI Studio 프로젝트에서 이용 가능한 이미지 입력 모델로 바꾸려면 서버에 `GEMINI_MODEL`을 설정합니다. 공개 저장소, JavaScript, URL 또는 백업에 API 키와 접속 코드를 넣지 마세요.

Gemini 요청 시 선택한 사진과 공정이 Google로 전송됩니다. 공개 가능한 시연 사진이나 외부 전송이 승인된 자료를 사용하세요. Gemini는 의심 소견과 확인 방법을 제안하며, 작업자 판정은 별도 입력으로 유지합니다. 로컬 주소와 공개 주소의 브라우저 기록은 각각 저장됩니다. 기록을 옮기려면 워크스페이스 JSON 백업과 복원을 사용하세요.

## 구현 기능

- 검사 이미지 업로드, 카메라 연결·촬영·종료
- 부품 번호, LOT, 촬영 부위, 검사자와 관찰 내용 기록
- AI 제안과 담당자 최종 검토를 구분해 저장
- 검토 의견 수정 및 이전 검토 이력 보관
- 검사 이력 검색·상태 필터·CSV 내보내기
- 이미지 수집함, 라벨 지정, 합성 시연 자료 구분
- 이미지·라벨·manifest·CSV가 포함된 ZIP 내보내기
- 전체 워크스페이스 JSON 백업, ID 중복을 제외한 기록·이미지 복원
- Teachable Machine 이미지 모델의 HTTPS URL / model.json·weights.bin·metadata.json 연결
- 모델 출력 기준 조절, 미연결 상태의 AI 분석 차단
- 기업별 워크스페이스·스테이션·수집 라벨 설정

## 포함하지 않는 것

실제 제조기업 데이터셋, 기업 데이터로 학습된 모델, 측정된 판독 정확도, 최종 품질 보증은 포함되지 않습니다. 데이터셋과 정답 기준은 공급받는 기업이 수집·검토하고, 학습·검증을 수행하는 전제입니다.

기본 화면의 수집·검사 건수는 0입니다. `합성 샘플로 시연`은 프로그램이 직접 그린 설명용 가공 부품 이미지입니다. `선택한 시나리오 시연`은 정해진 라벨을 표시하는 절차 시연이며 사진을 분석한 결과가 아닙니다. 합성 자료와 시연 결과 표시는 저장·내보내기에도 유지됩니다. 결함 위치 탐지는 제공하지 않습니다.

Teachable Machine 모델은 이미지 전체의 클래스를 분류합니다. 모델을 연결한 경우에도 현장 부품의 미검출·오검출, 새 결함 유형과 촬영 조건을 검증해야 합니다. 모델의 클래스 출력값은 정확도나 합격 보증이 아닙니다.

## 저장 및 공급 범위

현재 프로그램은 단일 브라우저의 IndexedDB에 이미지와 기록을 보관합니다. 기기 간 자동 공유, 사내 계정 인증, 역할별 권한, 중앙 데이터베이스와 서버 백업은 제공하지 않습니다. 같은 URL·같은 브라우저에서는 새로고침 후 보존되며, 다른 URL이나 다른 기기에서는 별도 저장소를 사용합니다. 브라우저 데이터 삭제 시 소실되므로 ZIP/JSON/CSV 백업을 보관하세요.

사진과 검사 기록은 브라우저에 저장합니다. Gemini 관찰을 요청할 때는 선택한 사진이 Gemini 서버를 거쳐 Google로 전송됩니다. 로컬 Teachable Machine 모델 파일은 브라우저 메모리에서 읽고 새로고침 시 다시 연결해야 합니다. 모델 URL을 연결하면 해당 주소에서 모델 파일을 내려받습니다. 추론용 라이브러리는 `dist/vendor/`에 포함되어 있습니다. 글꼴은 Google Fonts를 시도하며 접속 불가 시 시스템 글꼴을 사용합니다.

실제 사내 배포로 확장할 때는 인증, 권한, 중앙 파일 저장소, DB, 기록 보존 정책, 감사 로그와 네트워크 정책을 추가해야 합니다. 본 납품 범위는 기능 시제품과 현장 데이터 수집·AI 모델 연결 준비입니다.

## 참고

- Teachable Machine: https://teachablemachine.withgoogle.com/train
- 공식 이미지 라이브러리: https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image
- KAMP: https://www.kamp-ai.kr/main
- KAMP 주조 품질보증 AI 데이터셋 가이드북: https://www.kamp-ai.kr/mnt/dataset/97567180.pdf#page=17
- KAMP AI스퀘어 조립 공정 검증 사례: https://aisquare.kamp-ai.kr/upload_data/mainImg/abf1b6d9-4fc3-4f4c-a76d-76404a534566.pdf#page=6
- KAMP AI스퀘어 전기아연도금 외관검사 사례: https://aisquare.kamp-ai.kr/upload_data/mainImg/aae031aa-395c-47d1-88f8-2b2b5c176b78.pdf#page=2
- Google Gemini API 키: https://ai.google.dev/gemini-api/docs/api-key
- AI Hub: https://www.aihub.or.kr/

KAMP 공개 자료는 공정별 검사 항목 정리에 참고했습니다. AI Hub는 데이터 조사 경로로 안내합니다. 공개 데이터셋의 이용 조건과 기업 공정에서의 적용 적합성은 별도로 검토해야 합니다.

## 파일 구성

`dist/`에 실제 실행 파일이 있습니다. `server.mjs`와 `시작.cmd`는 로컬 실행 도구입니다. `발표_시연_순서.md`, `기업_인수_체크리스트.md`, `검증_기록.md`는 발표·인계와 검증 범위를 설명합니다.

## 라이브러리

TensorFlow.js 1.3.1 및 Teachable Machine image 0.8.3을 공식 배포본으로 포함했습니다. Apache-2.0 고지와 동반 라이선스는 `dist/vendor/`에 보존되어 있습니다. 이 버전 조합은 Teachable Machine 공식 이미지 라이브러리 예제를 기준으로 선택했습니다.
