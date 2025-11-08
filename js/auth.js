function login(){
  const id = document.getElementById('studentId')?.value.trim();
  // password input kept for UI compatibility, not enforced
  if(!id){
    const err = document.getElementById('error');
    if(err){ err.classList.remove('hidden'); err.textContent = 'Please enter your name or ID.'; }
    return;
  }
  localStorage.setItem('mfd_student_name', id);
  location.href = 'dashboard.html';
}