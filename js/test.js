// js/test.js — City of Martinsville ELDT Final Quiz
// Uses your existing Google Apps Script endpoint for cross-device logging.

const PROGRESS_API =
  'https://script.google.com/macros/s/AKfycbznz6jjcSFq5RxRwLFVj5xn0ZU_VZEJLxyHJWzWU-vxOcjnryiRUBC7nvnFCcnL23K1Rg/exec';

const PASSING = 80;
function getStudentId(){ return localStorage.getItem('studentId') || 'Unknown'; }

// ---------- Question bank (built from your quiz doc) ----------
const Q = [
  // Section 1 – Basic Vehicle Knowledge
  {q:'What is the primary purpose of vehicle gauges?', a:['To decorate the dashboard','To monitor vehicle systems and alert the driver to problems','To improve fuel mileage','To help with shifting timing'], c:1},
  {q:'The tachometer measures:', a:['Fuel level','Battery voltage','Engine RPM','Brake pressure'], c:2},
  {q:'Warning lights on the dashboard should be ignored until the next scheduled service.', a:['True','False'], c:1},

  // Section 2 – Vehicle Inspections & Malfunctions
  {q:'When should a pre-trip inspection be completed?', a:['Only if the vehicle is new','Before each trip','Once a month','Only after a breakdown'], c:1},
  {q:'FMCSA requires cargo and securement devices to be inspected within the first ______ miles of a trip.', a:['25','50','100','300'], c:1},
  {q:'A driver must complete a post-trip inspection report at the end of each workday.', a:['True','False'], c:0},

  // Section 3 – Basic Driving Control
  {q:'What is the best way to hold the steering wheel?', a:['One hand only','Palm of hand on top','Firm grip with both hands','Loose grip'], c:2},
  {q:'When starting from a parked position, what should a driver do first?', a:['Release brakes immediately','Check mirrors and blind spots','Rev engine high','Turn on hazard lights'], c:1},

  // Section 4 – Shifting & Backing
  {q:'Double clutching is:', a:['Used in automatic transmissions','Used in manual transmissions','Illegal','Only used in reverse'], c:1},
  {q:'The safest backing maneuver is:', a:['Blind-side backing','Alley docking','Straight-line backing','U-turn backing'], c:2},
  {q:'Always G.O.A.L. (Get Out And Look) before backing if unsure.', a:['True','False'], c:0},

  // Section 5 – Hazard Awareness & Defensive Driving
  {q:'Hazard perception means:', a:['Driving faster than traffic','Identifying potential hazards early','Ignoring small hazards','Watching only the truck ahead'], c:1},
  {q:'Most crashes are caused by failure to see hazards in time.', a:['True','False'], c:0},

  // Section 6 – Space, Speed & Night Driving
  {q:'Safe following distance at highway speed is:', a:['1 second','2 seconds','4–6 seconds','10 seconds'], c:2},
  {q:'At night, a driver should:', a:['Use high beams always','Overdrive headlights','Reduce speed, increase space','Turn off dash lights'], c:2},

  // Section 7 – Communication, Distractions & Conditions
  {q:'Communication includes:', a:['Turn signals','Brake lights','Hazard lights','All of the above'], c:3},
  {q:'Eating while driving is a distraction.', a:['True','False'], c:0},
  {q:'Best speed on icy roads is:', a:['Speed limit','Just under limit','Slower than normal','Same as traffic'], c:2},

  // Section 8 – Railroad Crossings & Emergencies
  {q:'At railroad crossings, drivers should:', a:['Speed up','Shift over tracks','Look, listen, and slow','Pass vehicles'], c:2},
  {q:'Never stop on railroad tracks.', a:['True','False'], c:0},

  // Section 9 – Hours of Service (HOS)
  {q:'The 11-hour rule allows:', a:['11 hours off duty','11 hours driving in a 14-hour period','11 hours total work','11 hours sleeper only'], c:1},
  {q:'30-minute break rule begins after:', a:['4 hours','8 hours','10 hours','Midnight'], c:1},
  {q:'Short-haul drivers are always exempt from HOS.', a:['True','False'], c:1},

  // Section 10 – Cargo & Trip Planning
  {q:'Cargo must be rechecked after:', a:['3 hours or 150 miles','Once per day','Only if loose','Only at scale'], c:0},
  {q:'Tie-downs require ______ WLL of cargo weight.', a:['10%','25%','50%','75%'], c:2},
  {q:'Document listing cargo:', a:['Repair order','Bill of lading','Route plan','Fuel receipt'], c:1},
  {q:'Trip planning:', a:['Saves fuel','Avoids low bridges','Improves time','All of the above'], c:3},
  {q:'Hazmat loads must include emergency contact info.', a:['True','False'], c:0},

  // Section 11 – Safety & Environmental Rules
  {q:'Fuel spills:', a:['Don’t matter','Must be reported & cleaned','Are shipper’s job','Evaporate'], c:1},
  {q:'ERG stands for:', a:['Route guide','Emergency Response Guidebook','Engine Repair Guide','Equipment Resource Guide'], c:1},

  // Section 12 – Driver Fitness & Alcohol/Drugs
  {q:'DOT medical card valid for:', a:['6 months','1 year','2 years','5 years'], c:2},
  {q:'CDL impairment at BAC:', a:['0.02%','0.04%','0.08%','0.10%'], c:1},
  {q:'CDL holders automatically consent to drug/alcohol testing.', a:['True','False'], c:0},

  // Section 13 – Roadside & Whistleblower
  {q:'During roadside inspection, a driver must:', a:['Be silent','Be hostile','Cooperate professionally','Leave immediately'], c:2},
  {q:'Coercion laws protect drivers from:', a:['Losing vacation time','Being forced to violate FMCSA rules','Getting long routes','Paperwork'], c:1},
];

// ---------- Render quiz ----------
const quiz = document.getElementById('quiz');
const submitBtn = document.getElementById('submitBtn');
const result = document.getElementById('result');

function render(){
  quiz.innerHTML = '';
  Q.forEach((item,i) => {
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

// ---------- Grade + log to Google Sheet ----------
async function submit(e){
  e.preventDefault();
  let correct = 0;
  Q.forEach((item,i) => {
    const sel = (document.querySelector(`input[name="q${i}"]:checked`) || {}).value;
    if (sel != null && Number(sel) === item.c) correct++;
  });
  const pct = Math.round((correct / Q.length) * 100);
  const pass = pct >= PASSING;

  result.textContent = `Score: ${pct}% — ${pass ? 'Pass' : 'Try again'}`;

  // Log to your Sheet
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

submitBtn.addEventListener('click', submit);
