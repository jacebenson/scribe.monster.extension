let tabSection = ({title, id, active, form, history})=>{
  console.log({function:'tabSection', title, id, active, form, history})
  let returnHtml = ``;
  returnHtml +=`
    <div
      class="tab-pane ${active ? 'active' : ''}"
      id="${id}"
      role="tabpanel"
      aria-labelledby="${id}-tab"
    >
      <p class="text-center">${title}</p>
  `;
  if(form){
    returnHtml += form
  }
  if(history){
    returnHtml += history
  }
  returnHtml += `</div>`
  return returnHtml;
}
export default tabSection;