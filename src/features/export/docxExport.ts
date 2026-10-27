import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
} from 'docx';
import { SavedLessonPlan, SavedMaterial } from '@/lib/data/ontologyStore';
import { formatPhaseBanner } from '@/lib/time/distribute';

export async function exportLessonPlanToDocx(
  plan: SavedLessonPlan,
  material?: SavedMaterial,
  extraMeta?: { areaLabel?: string; teacherName?: string; visualTitle?: string; visualPrompts?: [string, string] }
): Promise<Blob> {
  const phaseBanner = formatPhaseBanner(plan.events);

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: `【 교수·학습 과정안 】 ${plan.title}`,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 260 },
          }),

          // 교육청 표준 공문서 메타 표
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell('교과', 15),
                  createDataCell(plan.subjectName, 35),
                  createHeaderCell('내용 영역 / 주제', 15),
                  createDataCell(extraMeta?.areaLabel || plan.topic, 35),
                ],
              }),
              new TableRow({
                children: [
                  createHeaderCell('대상 / 차시 시간', 15),
                  createDataCell(`중학교 ${plan.grade}학년 (${plan.totalMinutes}분)`, 35),
                  createHeaderCell('지도교사', 15),
                  createDataCell(extraMeta?.teacherName || plan.ownerName || '지도교사', 35),
                ],
              }),
              new TableRow({
                children: [
                  createHeaderCell('핵심 아이디어', 15),
                  createDataCell(plan.unitOverview, 85, 3),
                ],
              }),
              new TableRow({
                children: [
                  createHeaderCell('적용 독서전략', 15),
                  createDataCell(plan.selectedStrategies.map((s) => s.name).join(', ') || '독서전략', 85, 3),
                ],
              }),
              new TableRow({
                children: [
                  createHeaderCell('학습 목표', 15),
                  createDataCell(plan.learningObjective, 85, 3),
                ],
              }),
            ],
          }),

          new Paragraph({ text: '', spacing: { before: 180 } }),

          ...(extraMeta?.visualTitle
            ? [
                new Paragraph({
                  text: '1. 본시 수업 활용 핵심 시각 모델 및 탐구 발문',
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 180, after: 100 },
                }),
                new Paragraph({
                  children: [new TextRun({ text: `• 1:1 매칭 시각 구조도: ${extraMeta.visualTitle}`, bold: true, size: 22 })],
                  spacing: { after: 80 },
                }),
                ...(extraMeta.visualPrompts ?? []).map(
                  (q, i) =>
                    new Paragraph({
                      children: [new TextRun({ text: `  [핵심 탐구 발문 ${i + 1}] ${q}`, size: 21 })],
                      spacing: { after: 60 },
                    })
                ),
              ]
            : []),

          // 가네 9사태 교수·학습 과정 매트릭스 표
          new Paragraph({
            text: '2. 가네(Gagné) 9사태 교수·학습 과정 매트릭스 표',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 80 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `⏱ ${phaseBanner}`, bold: true, size: 22 })],
            spacing: { after: 120 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                tableHeader: true,
                children: [
                  createHeaderCell('단계', 9),
                  createHeaderCell('수업사태', 14),
                  createHeaderCell('시간(분)', 10),
                  createHeaderCell('교수 전략', 17),
                  createHeaderCell('교수·학습 활동 내용(교사/학생)', 34),
                  createHeaderCell('자료 및 유의점', 16),
                ],
              }),
              ...plan.events.map(
                (ev) =>
                  new TableRow({
                    children: [
                      createDataCell(ev.phase, 9, 1, AlignmentType.CENTER),
                      createDataCell(`${ev.seq}. ${ev.label}`, 14, 1, AlignmentType.LEFT),
                      createDataCell(`${ev.minutes}분`, 10, 1, AlignmentType.CENTER),
                      createDataCell(ev.assessment || ev.purpose, 17, 1, AlignmentType.LEFT),
                      createDataCell(
                        `[교사]\n${ev.teacherActivity}\n\n[학생]\n${ev.studentActivity}`,
                        34,
                        1,
                        AlignmentType.LEFT
                      ),
                      createDataCell(ev.materialAndNotice || '-', 16, 1, AlignmentType.LEFT),
                    ],
                  })
              ),
            ],
          }),

          new Paragraph({ text: '', spacing: { before: 200 } }),

          // 3수준 평가 루브릭
          new Paragraph({
            text: '3. 3수준 성취 평가 기준 (루브릭)',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [createHeaderCell('수준', 20), createHeaderCell('평가 기준', 80)],
              }),
              new TableRow({
                children: [
                  createDataCell('상 (Excellent)', 20, 1, AlignmentType.CENTER),
                  createDataCell(plan.evaluationPlan.criteriaHigh, 80),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('중 (Good)', 20, 1, AlignmentType.CENTER),
                  createDataCell(plan.evaluationPlan.criteriaMid, 80),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('하 (Needs Work)', 20, 1, AlignmentType.CENTER),
                  createDataCell(plan.evaluationPlan.criteriaLow, 80),
                ],
              }),
            ],
          }),

          // 읽기자료 본문 포함
          ...(material
            ? [
                new Paragraph({
                  text: `4. 수업 활용 읽기자료: ${material.title}`,
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 300, after: 120 },
                }),
                ...material.body.map(
                  (para) =>
                    new Paragraph({
                      children: [new TextRun({ text: `  ${para}`, size: 22 })],
                      spacing: { after: 120 },
                    })
                ),
                new Paragraph({
                  text: '[필수 어휘 사전]',
                  heading: HeadingLevel.HEADING_3,
                  spacing: { before: 160, after: 80 },
                }),
                ...material.glossary.map(
                  (g) =>
                    new Paragraph({
                      children: [
                        new TextRun({ text: `• ${g.term}: `, bold: true, size: 20 }),
                        new TextRun({ text: g.meaning, size: 20 }),
                      ],
                      spacing: { after: 50 },
                    })
                ),
              ]
            : []),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

export function triggerDocxDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function createHeaderCell(text: string, widthPercent: number): TableCell {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: { fill: 'EEF2FF' },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text, bold: true, size: 20 })],
      }),
    ],
  });
}

function createDataCell(
  text: string,
  widthPercent: number,
  columnSpan = 1,
  align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT
): TableCell {
  const lines = text.split('\n');
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    columnSpan,
    children: lines.map(
      (line) =>
        new Paragraph({
          alignment: align,
          spacing: { after: 40 },
          children: [new TextRun({ text: line, size: 20 })],
        })
    ),
  });
}
