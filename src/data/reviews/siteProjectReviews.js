export const siteProjectReviews = {
  "/": {
    "reviewedOn": "2026-09-14",
    "summary": "검색봇과 사용자 화면의 내용 일치, 화면 로딩 실패 시 복구가 남은 과제입니다.",
    "items": [
      {
        "id": "intro-ssr-contract",
        "priority": "medium",
        "title": "검색봇과 사용자에게 같은 글 보여 주기",
        "observation": "검색봇은 Node SSR로, 사용자는 React 화면으로 같은 글을 읽습니다.",
        "impact": "두 경로의 본문·제목·없는 글의 응답이 서로 달라질 수 있습니다.",
        "proposal": "본문과 검색 메타데이터, 404 응답을 두 경로에서 같게 유지할 필요가 있습니다.",
        "verification": "같은 글과 없는 글을 두 경로로 요청해 내용과 응답 코드를 비교해야 합니다.",
        "references": [
          {
            "label": "Google의 동적 렌더링 가이드",
            "href": "https://developers.google.com/search/docs/crawling-indexing/javascript/dynamic-rendering"
          }
        ]
      },
      {
        "id": "intro-lazy-recovery",
        "priority": "medium",
        "title": "화면 파일을 못 읽었을 때 다시 열기",
        "observation": "화면을 나누어 불러오지만, 파일 로딩 실패를 처리하는 Error Boundary는 없습니다.",
        "impact": "배포 직후 오래된 파일을 요청하거나 연결이 끊기면 화면을 열지 못할 수 있습니다.",
        "proposal": "실패 안내와 재시도를 추가하고, 배포 시 이전 파일의 캐시 처리도 맞출 필요가 있습니다.",
        "verification": "화면 파일 요청을 실패시켜 메뉴와 재시도가 동작하고 작성 중 초안이 유지되는지 확인해야 합니다.",
        "references": [
          {
            "label": "React lazy 오류 처리",
            "href": "https://react.dev/reference/react/lazy"
          }
        ]
      }
    ]
  },
  "/python": {
    "reviewedOn": "2026-09-14",
    "summary": "새 매물에 대한 평가, 학습·예측의 입력 처리, 예측 API의 오류 처리를 보완할 필요가 있습니다.",
    "items": [
      {
        "id": "ml-held-out-evaluation",
        "priority": "high",
        "title": "처음 보는 매물로 월세 오차 평가하기",
        "observation": "전체 데이터로 학습하고, 결과 예시도 학습에 쓴 첫 5행을 사용합니다.",
        "impact": "학습 오차가 작아도 새로운 매물의 월세를 잘 맞춘다고 보기 어렵습니다.",
        "proposal": "중복 매물을 묶어 학습·평가 데이터를 나누고, 단순한 지역별 월세 기준과 비교할 필요가 있습니다.",
        "verification": "학습에 쓰지 않은 매물에서 평균 오차를 엔 단위로 구하고, 지역·가격대별 차이를 확인해야 합니다.",
        "references": [
          {
            "label": "학습 코드",
            "href": "https://github.com/hkpark130/Predict-Home-API/blob/68a20ad93093a374db8efce01ef5d9f4c26606ba/learning_model/neuralnet.py"
          },
          {
            "label": "데이터 분리와 누수 방지",
            "href": "https://scikit-learn.org/stable/common_pitfalls.html#data-leakage"
          },
          {
            "label": "수집 코드",
            "href": "https://github.com/hkpark130/Predict-Home-API/blob/68a20ad93093a374db8efce01ef5d9f4c26606ba/scraping/scraping.py"
          }
        ]
      },
      {
        "id": "ml-preprocessing-contract",
        "priority": "high",
        "title": "학습과 예측의 입력 처리 맞추기",
        "observation": "학습은 데이터에서 열과 통계를 만들지만, 예측은 고정 배열과 별도 설정값을 사용합니다. 정수형 입력 때문에 소수 면적도 잘릴 수 있습니다.",
        "impact": "열 순서나 지역 번호가 달라지면 같은 집을 다른 입력으로 해석해 예측이 틀어질 수 있습니다.",
        "proposal": "입력 열·지역 번호·계산 기준을 모델과 함께 저장하고, 숫자 범위와 소수점을 같은 규칙으로 처리할 필요가 있습니다.",
        "verification": "같은 집의 정보가 학습과 API에서 같은 배열이 되는지 비교하고, 잘못된 지역·숫자를 거절하는지 확인해야 합니다.",
        "references": [
          {
            "label": "추론 코드",
            "href": "https://github.com/hkpark130/Predict-Home-API/blob/68a20ad93093a374db8efce01ef5d9f4c26606ba/data_handler/house_handler.py"
          },
          {
            "label": "전처리의 일관성",
            "href": "https://scikit-learn.org/stable/common_pitfalls.html#inconsistent-preprocessing"
          },
          {
            "label": "Laravel 입력 검증",
            "href": "https://laravel.com/docs/validation"
          }
        ]
      },
      {
        "id": "ml-errors-and-cache",
        "priority": "high",
        "title": "실패한 예측이 정상 결과로 저장되지 않게 하기",
        "observation": "요청마다 모델을 다시 읽고, 오류 문자열도 정상 응답처럼 반환할 수 있습니다. Laravel은 응답을 캐시하며 HTTPS 인증서 확인을 끕니다.",
        "impact": "오류가 월세처럼 반복 표시되거나, 느린 모델 로딩과 외부 요청 때문에 응답이 오래 걸릴 수 있습니다.",
        "proposal": "모델은 시작할 때 읽고, HTTPS 인증서·대기시간·오류 상태를 검사할 필요가 있습니다. 정상 숫자 예측만 모델 버전별로 캐시하도록 보완할 부분입니다.",
        "verification": "모델 오류·잘못된 인증서·응답 지연에서 캐시가 생기지 않고, 다음 정상 요청이 처리되는지 확인해야 합니다.",
        "references": [
          {
            "label": "추론 예외 처리",
            "href": "https://github.com/hkpark130/Predict-Home-API/blob/68a20ad93093a374db8efce01ef5d9f4c26606ba/data_handler/house_handler.py"
          },
          {
            "label": "캐시 저장 미들웨어",
            "href": "https://github.com/hkpark130/Predict-Home-Laravel/blob/f8f4d85aadf536a96dad223965b71ba2113192d6/app/Http/Middleware/HistoryCache.php"
          },
          {
            "label": "Tornado의 비동기 처리",
            "href": "https://www.tornadoweb.org/en/stable/guide/async.html"
          },
          {
            "label": "TensorFlow 이전과 수치 검증",
            "href": "https://www.tensorflow.org/guide/migrate"
          },
          {
            "label": "HTTP 클라이언트 코드",
            "href": "https://github.com/hkpark130/Predict-Home-Laravel/blob/f8f4d85aadf536a96dad223965b71ba2113192d6/app/Http/SimpleHttpClient.php"
          },
          {
            "label": "Guzzle verify와 timeout",
            "href": "https://docs.guzzlephp.org/en/stable/request-options.html#verify"
          },
          {
            "label": "캐시 조회 코드",
            "href": "https://github.com/hkpark130/Predict-Home-Laravel/blob/f8f4d85aadf536a96dad223965b71ba2113192d6/app/Http/Controllers/ServerController.php"
          }
        ]
      }
    ]
  }
};
