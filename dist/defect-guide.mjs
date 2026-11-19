export const processes = {
  machining: {
    label: '금속 가공',
    source: 'AEROSCOPE 시연용 항목',
    defects: [
      ['긁힘', '가공면에 주변 가공 결과 다른 선형 자국이 보이는지 확인합니다.'],
      ['찍힘', '표면이나 모서리의 국소 눌림을 확인합니다.'],
      ['버 의심', '홀과 절단면 가장자리에 돌출이 보이는지 확인합니다.'],
    ],
  },
  casting: {
    label: '다이캐스팅 주조',
    source: 'KAMP 주조 품질보증 AI 데이터셋 · 가이드북 17쪽',
    url: 'https://www.kamp-ai.kr/mnt/dataset/97567180.pdf#page=17',
    defects: [
      ['미성형', '형상이 채워지지 않은 부위가 있는지 확인합니다.'],
      ['표면 기공 의심', '표면에서 확인 가능한 작은 구멍이나 함몰을 확인합니다.'],
      ['찍힘', '충격에 의해 눌린 것으로 보이는 자국을 확인합니다.'],
      ['오염', '이물이나 오염으로 보이는 표면 상태를 확인합니다.'],
    ],
  },
  assembly: {
    label: '부품 조립',
    source: 'KAMP AI스퀘어 조립 공정 실증 결과서 · 6쪽',
    url: 'https://aisquare.kamp-ai.kr/upload_data/mainImg/abf1b6d9-4fc3-4f4c-a76d-76404a534566.pdf#page=6',
    defects: [
      ['부품 누락 의심', '정상 조립 사진 또는 조립도와 비교해 장착 위치를 확인합니다.'],
      ['조립 상태 이상 의심', '끼움 상태와 위치를 조립도에 대조합니다.'],
      ['부품 손상 의심', '노출된 부품의 변형이나 손상을 확인합니다.'],
    ],
  },
  coating: {
    label: '도금·표면처리',
    source: 'KAMP AI스퀘어 전기아연도금 외관검사 사례 · 2쪽',
    url: 'https://aisquare.kamp-ai.kr/upload_data/mainImg/aae031aa-395c-47d1-88f8-2b2b5c176b78.pdf#page=2',
    note: '공개 사례의 적용 분야를 참고했습니다. 아래 세부 항목은 AEROSCOPE 시연용 예시입니다.',
    defects: [
      ['얼룩 의심', '국소 자국이 조명의 반사인지 다른 각도에서 확인합니다.'],
      ['색상 불균일 의심', '동일한 조명에서 정상 기준 사진과 비교합니다.'],
      ['표면 들뜸 의심', '표면이 들뜨거나 벗겨져 보이는 부위를 다시 촬영합니다.'],
    ],
  },
};

export function processGuide(id) {
  return Object.hasOwn(processes, id) ? processes[id] : null;
}
