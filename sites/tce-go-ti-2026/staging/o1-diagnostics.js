import { IndexedDbStore } from './core/src/storage.js';
import { MasteryStore } from './core/src/mastery.js';

const output = document.querySelector('#output');
document.querySelector('#run').addEventListener('click', async () => {
  try {
    const store = new IndexedDbStore({ name: 'studyos-o1-diagnostics', version: 1 });
    const mastery = new MasteryStore(store);
    const before = await mastery.get('database.sql');
    await mastery.put({ canonicalConceptId: 'database.sql', masteryEstimate: .73, confidence: .8, source: 'o1-browser-diagnostic', assessedAt: new Date().toISOString(), questionCount: 3, firstTryCorrect: 2, firstTryWrong: 1, reviewStatus: 'needs-review' });
    const after = await mastery.get('database.sql');
    output.textContent = JSON.stringify({ passed: after?.masteryEstimate === .73 && after?.canonicalConceptId === 'database.sql', persistedBeforeRun: Boolean(before), after }, null, 2);
  } catch (error) {
    output.textContent = JSON.stringify({ passed: false, error: String(error) }, null, 2);
  }
});
