function disablePromptField(){
    var prompt = document.getElementById('scribeMonsterInstruction');
    prompt.setAttribute('disabled','true');
}
function enablePromptField(){
    var prompt = document.getElementById('scribeMonsterInstruction');
    prompt.removeAttribute('disabled');
}