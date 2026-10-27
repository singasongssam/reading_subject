import fs from 'fs';
import path from 'path';
import n3 from 'n3';

const { Parser } = n3;

const files = [
  { name: '사회과.ttl', path: 'data/ttl/original/사회과.ttl', domain: 'curriculum-social' },
  { name: '과학과.ttl', path: 'data/ttl/original/과학과.ttl', domain: 'curriculum-science' },
  { name: '가네.ttl', path: 'data/ttl/original/가네.ttl', domain: 'gagne' },
  { name: 'readstrategy.ttl', path: 'data/ttl/original/readstrategy.ttl', domain: 'reading-strategy' },
  { name: 'text.ttl', path: 'data/ttl/original/text.ttl', domain: 'text-type' },
];

const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const RDFS_LABEL = 'http://www.w3.org/2000/01/rdf-schema#label';
const RDFS_COMMENT = 'http://www.w3.org/2000/01/rdf-schema#comment';
const OWL_CLASS = 'http://www.w3.org/2002/07/owl#Class';

async function parseTTL(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const parser = new Parser();
  const quads = [];
  const prefixes = {};

  return new Promise((resolve, reject) => {
    parser.parse(content, (error, quad, parsedPrefixes) => {
      if (error) {
        return reject(error);
      }
      if (quad) {
        quads.push(quad);
      } else {
        if (parsedPrefixes) {
          Object.assign(prefixes, parsedPrefixes);
        }
        resolve({ quads, prefixes });
      }
    });
  });
}

async function analyze() {
  const results = [];

  for (const file of files) {
    const { quads, prefixes } = await parseTTL(file.path);
    
    // 클래스 목록 및 인스턴스 분류
    const classes = new Set();
    const instancesByType = {};
    const labelsBySubject = {};
    const commentsBySubject = {};
    const allSubjects = new Set();
    const allObjects = new Set();
    const predicates = new Set();

    quads.forEach((q) => {
      const s = q.subject.value;
      const p = q.predicate.value;
      const o = q.object.value;

      allSubjects.add(s);
      predicates.add(p);
      if (q.object.termType === 'NamedNode') {
        allObjects.add(o);
      }

      if (p === RDF_TYPE) {
        if (o === OWL_CLASS || o === 'http://www.w3.org/2000/01/rdf-schema#Class') {
          classes.add(s);
        } else {
          if (!instancesByType[o]) instancesByType[o] = new Set();
          instancesByType[o].add(s);
        }
      }

      if (p === RDFS_LABEL) {
        labelsBySubject[s] = q.object.value;
      }
      if (p === RDFS_COMMENT) {
        commentsBySubject[s] = q.object.value;
      }
    });

    // 라벨이 없는 주어 찾기 (익명 노드, 온톨로지 헤더 제외)
    const unlabeledNodes = [];
    allSubjects.forEach((s) => {
      if (!labelsBySubject[s] && !s.startsWith('_:') && !s.includes('Ontology') && !s.includes('Curriculum')) {
        unlabeledNodes.push(s);
      }
    });

    // 중복 라벨 검사
    const labelCounts = {};
    Object.entries(labelsBySubject).forEach(([uri, label]) => {
      if (!labelCounts[label]) labelCounts[label] = [];
      labelCounts[label].push(uri);
    });
    const duplicateLabels = Object.entries(labelCounts).filter(([_, uris]) => uris.length > 1);

    // 고아 노드 (트리/관계 구조상 연결되지 않은 노드)
    // 교육과정: Subject -> hasArea -> LearningArea -> hasCoreIdea/hasContentElement
    const nonRootSubjects = Array.from(allSubjects).filter(
      (s) => !allObjects.has(s) && !classes.has(s) && !s.includes('Ontology') && !s.includes('Curriculum')
    );

    results.push({
      fileName: file.name,
      domain: file.domain,
      totalTriples: quads.length,
      prefixes,
      predicates: Array.from(predicates),
      classCount: classes.size,
      classes: Array.from(classes),
      instancesByType: Object.fromEntries(
        Object.entries(instancesByType).map(([k, set]) => [k, Array.from(set)])
      ),
      unlabeledNodes,
      duplicateLabels,
      nonRootSubjects,
    });
  }

  fs.writeFileSync('data/compiled/ttl-analysis-raw.json', JSON.stringify(results, null, 2), 'utf-8');
  console.log('Analysis finished. Saved to data/compiled/ttl-analysis-raw.json');
}

analyze().catch((err) => {
  console.error(err);
  process.exit(1);
});
