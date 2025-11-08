// js/test.js — simple final quiz, posts score to Sheet

const PROGRESS_API = 'https://script.google.com/macros/s/AKfycbznz6jjcSFq5RxRwLFVj5xn0ZU_VZEJLxyHJWzWU-vxOcjnryiRUBC7nvnFCcnL23K1Rg/exec';

const QUESTIONS = [
  { q: 'What does ELDT stand for?', a: ['Entry-Level Driver Training','Engine Load and Drive Test','Emergency Load Driver Training','Entry License Driving Test'], correct: 0 },
  { q: 'Who is responsible for pre-trip inspection?', a: ['The instructor','The dispatcher','The driver','The mechanic'], correct: 2 },
  { q: 'Which brake test checks air loss while holding the pedal?', a: ['Applied leakage test','Static leakage test','Governor cut-in test','Low air warning test'], correct: 0 },
  { q: 'Tires must be free of cuts and have proper inflation.', a: ['True','False'], correct: 0 },
  { q: 'Reflective triangles are part of required emergency equipment.', a: ['True','False'], correct: 0 },
];

const PASSING = 80;

function getStudentId(){ return localStorage.getItem('studentId') || 'Unknown'; }

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
      ${item.a.map((opt,j)=>`
        <label class="flex items-center gap-2 mb-1">
          <input type="radio" name="q${i}" value="${j}">
          <span>${opt}</span>
        </label>
      `).join('')}
    `;
    quiz.appendChild(block);
  });
}

async function submit(e){
  e.preventDefault();
  let correct = 0;
  QUESTIONS.forEach((item,i)=>{
    const sel = (document.querySelector(\`input[name="q\${i}"]:checked\`)||{}).value;
    if (sel != null && Number(sel) === item.correct) correct++;
  });
  const pct = Math.round((correct / QUESTIONS.length) * 100);
  const pass = pct >= PASSING;

  result.textContent = \`Score: \${pct}% — \${pass ? 'Pass' : 'Try again'}\`;

  try{
    await fetch(PROGRESS_API, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({
        studentId: getStudentId(),
        module: 'final_test',
        status: 'Tested',
        score: pct
      })
    });
  }catch(e){ console.error('Sheet sync failed:', e); }

  if (pass) submitBtn.disabled = true;
}

render();
submitBtn.addEventListener('click', submit);
