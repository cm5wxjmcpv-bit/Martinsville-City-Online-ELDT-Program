// js/test.js — simple final quiz + logs score to Sheet using form-encoded no-cors

const PROGRESS_API =
  'https://script.google.com/macros/s/AKfycbzT_DwYALs_PRoAQmAdk2z2bKXP9NY3l9_3vYodDODGagEE7l5ISEy9zRmQfGtCLkRrjQ/exec';

const PASSING = 80;
const getStudentId = () => localStorage.getItem('studentId') || '1001';

const QUESTIONS = [
  { q: 'What is the primary purpose of vehicle gauges?', a: ['Decorate the dash','Monitor systems / alert problems','Improve MPG','Help shift timing'], c: 1 },
  { q: 'The tachometer measures:', a: ['Fuel level','Battery voltage','Engine RPM','Brake pressure'], c: 2 },
  { q: 'A pre-trip inspection should be completed:', a: ['Before each trip','Once a month','After a breakdown','Only if new truck'], c: 0 },
  { q: 'Safest backing maneuver:', a: ['Blind-side','Alley dock','Straight-line','U-turn'], c: 2 },
  { q: 'Hazard perception means:', a: ['Speed up','Identify potential hazards early','Ignore small hazards','Watch only the truck ahead'], c: 1 },
  { q: 'Safe following distance at highway speed:', a: ['1 sec','2 sec','4–6 sec','10 sec'], c: 2 },
  { q: 'At night, drivers should:', a: ['Use high beams always','Overdrive headlights','Reduce speed, increase space','Turn off dash lights'], c: 2 },
  { q: 'Communication includes:', a: ['Signals','Brake lights','Hazard lights','All of the above'], c: 3 },
  { q: 'Never stop on railroad tracks.', a: ['True','False'], c: 0 },
  { q: '11-hour rule allows:', a: ['11h off duty','11h driving within 14h','11h total work','11h sleeper only'], c: 1 },
  { q: 'Cargo must be rechecked after:', a: ['3h or 150 miles','Once per day','Only if loose','At scales only'], c: 0 },
  { q: 'DOT medical card is valid up to:', a: ['6 mo','1 yr','2 yrs','5 yrs'], c: 2 },
  { q: 'CDL impairment BAC level is:', a: ['0.02%','0.04%','0.08%','0.10%'], c: 1 },
  { q: 'Coercion laws protect drivers from being forced to violate FMCSA rules.', a: ['True','False'], c: 0 },
  { q: 'Always G.O.A.L. before backing if unsure.', a: ['True','False'], c: 0 },
];

const quiz = document.getElementById('quiz');
const submitBtn = document.getElementById('submitBtn');
const result = document.getElementById('result');

function render(){
  quiz.innerHTML = '';
  QUESTIONS.forEach((item,i) => {
    const block = document.createElement('div');
    block.className = 'p-4 border rounded-lg';
    block.innerHTML = `
      <div class="font-semibold mb-2">${i+1}. ${item.q}</div>
      ${item.a.map((opt,j) => `
        <label class="flex items-center gap-2 mb-1">
          <input type="radio" name="q${i}" value="${j}">
          <span>${opt}</span>
        </label>
      `).join('')}
    `;
    quiz.appendChild(block);
  });
}
render();

async function postTestScore(pct){
  const body = new URLSearchParams({
    studentId: getStudentId(),
    module: 'final_test',
    status: 'Tested',
    score: String(pct)
  });
  await fetch(PROGRESS_API, { method: 'POST', mode: 'no-cors', body });
}

async function submit(e){
  e.preventDefault();
  let correct = 0;
  QUESTIONS.forEach((item,i)=>{
    const sel = (document.querySelector(`input[name="q${i}"]:checked`)||{}).value;
    if (sel != null && Number(sel) === item.c) correct++;
  });
  const pct = Math.round((correct / QUESTIONS.length) * 100);
  const pass = pct >= PASSING;

  result.textContent = `Score: ${pct}% — ${pass ? 'Pass' : 'Try again'}`;

  await postTestScore(pct);
  if (pass) submitBtn.disabled = true;
}
submitBtn.addEventListener('click', submit);
