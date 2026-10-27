import type { GenreId, TextTypeSelection } from '@/lib/domain/types';
import textTypesData from '../../../data/compiled/text-types.json';

/**
 * 5대 장르 프리셋 → text.ttl 4개 분류 차원(자료/조직과 탐색/체재/유형) 매핑.
 * 장르명은 학교 현장 용어이며, 실제 분류 근거는 모두 text.ttl 속성 라벨이다.
 */
export interface GenrePreset {
  id: GenreId;
  label: string;
  shortLabel: string;
  description: string;
  textType: TextTypeSelection;
}

export const GENRES: GenrePreset[] = [
  {
    id: 'argument',
    label: '논증문',
    shortLabel: '논증',
    description: '주장과 근거로 구성된 글 (사설·칼럼형)',
    textType: { sourceMaterial: '단일 텍스트', structureNavigation: '정적', format: '연속적', contentType: '논증' },
  },
  {
    id: 'exposition',
    label: '설명문',
    shortLabel: '설명',
    description: '개념과 요소 간 관계를 풀어 쓴 글',
    textType: { sourceMaterial: '단일 텍스트', structureNavigation: '정적', format: '연속적', contentType: '설명' },
  },
  {
    id: 'infographic',
    label: '통계·인포그래픽 복합문',
    shortLabel: '인포그래픽',
    description: '본문과 표·도식이 결합된 혼합 텍스트',
    textType: { sourceMaterial: '단일 텍스트', structureNavigation: '정적', format: '혼합적', contentType: '설명' },
  },
  {
    id: 'report',
    label: '보고서',
    shortLabel: '보고서',
    description: '조사 과정과 결과를 시간 순서로 정리한 글',
    textType: { sourceMaterial: '단일 텍스트', structureNavigation: '정적', format: '혼합적', contentType: '서사' },
  },
  {
    id: 'debate',
    label: '찬반 토론문',
    shortLabel: '찬반',
    description: '서로 다른 입장의 두 글을 나란히 읽는 다중 텍스트',
    textType: { sourceMaterial: '다중 텍스트', structureNavigation: '정적', format: '연속적', contentType: '논증' },
  },
];

export function getGenre(id: GenreId): GenrePreset {
  return GENRES.find((g) => g.id === id) ?? GENRES[1];
}

interface TextCategory {
  id: string;
  label: string;
  attributes: Array<{ id: string; label: string; description?: string }>;
}

const categories = textTypesData as TextCategory[];

/** text.ttl 속성 라벨 → 설명 조회 */
export function describeTextAttribute(label: string): string {
  for (const c of categories) {
    const a = c.attributes.find((x) => x.label === label);
    if (a) return a.description ?? '';
  }
  return '';
}

/** 장르 프리셋의 text.ttl 차원별 근거 목록 */
export function textTypeEvidence(t: TextTypeSelection): Array<{ dimension: string; value: string; description: string }> {
  const pairs: Array<[string, string]> = [
    ['SourceMaterial', t.sourceMaterial],
    ['StructureAndNavigation', t.structureNavigation],
    ['Format', t.format],
    ['ContentType', t.contentType],
  ];
  return pairs.map(([catId, value]) => {
    const cat = categories.find((c) => c.id === catId);
    return { dimension: cat?.label ?? catId, value, description: describeTextAttribute(value) };
  });
}
