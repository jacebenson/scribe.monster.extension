let generateForm = ({ form }) => {
  let returnHtml = form.fields.map((field) => {
    let fieldHtml = [`<div class="form-group row m-1">`];
    if (field.label && field.type === 'textarea') {
      fieldHtml.push(`
        <label for="${field.id}" class="col-4 col-form-label">${field.label}</label>
        <div class="col-8">
          <textarea 
            class="form-control" 
            id="${field.id}" 
            rows="3"
            placeholder="${field.placeholder}"
          ></textarea>
        </div>`);
    }
    if (!field.label && field.type === 'textarea') {
      fieldHtml.push(`
      <div class="col-12">
      <textarea 
        class="form-control" 
        id="${field.id}" 
        rows="3"
        placeholder="${field.placeholder}"
        ></textarea>
        </div>`);
    }
    if (field.label && field.type === 'select') {
      fieldHtml.push(`
        <label for="${field.id}" class="col-4 col-form-label">${field.label}</label>
        <div class="col-8">
          <select id="${field.id}" class="form-select">
            ${field.options.map((option) => {
            if(option.value === field.defaultValue) {
              return `<option value="${option.value}" selected="true">${option.label}</option>`
            } else { 
              return `<option value="${option.value}">${option.label}</option>`}
      })}
          </select>
        </div>`);
    }
    if (field.label && field.type === 'input') {
      let html = `
        <label for="${field.id}" class="col-4 col-form-label">${field.label}</label>
        <div class="col-8">
          <input
            type="${field.inputType}"
            class="form-control"
            id="${field.id}"
            placeholder="${field.placeholder}"
      `
      if (field.defaultValue) html += `value="${field.defaultValue}"`
      html += `/>`
      html += `</div>`;
      fieldHtml.push(html);
    }
    if (field.label && field.type === 'password') {
      fieldHtml.push(`
        <label for="${field.id}" class="col-4 col-form-label">${field.label}</label>
        <div class="col-8">
          <input
            type="password"
            class="form-control"
            id="${field.id}"
            placeholder="${field.placeholder}"
          />
        </div>`);
    }

    if (field.label && field.type === 'boolean') {
      fieldHtml.push(`
        <label for="${field.id}" class="col-4 col-form-label">${field.label}</label>
        <div class="col-8">
          <div class="custom-controls-stacked">
            <div class="custom-control custom-checkbox">
              <input name="checkbox" id="${field.id}" type="checkbox" class="custom-control-input" value="yes" checked="${()=>{if (field.defaultValue) return "checked"}}"> 
              <label for="${field.id}" class="custom-control-label">Show on ServiceNow</label>
            </div>
          </div>
        </div>
        `);
    }
    if (field.label && field.type === 'button') {
      fieldHtml.push(`
        <div class="col-12">
          <button
            type="button"
            class="btn btn-primary btn-block"
            id="${field.id}"
          >
            ${field.label}
          </button>
        </div>`);
    }
    fieldHtml.push(`</div>`);
    return fieldHtml.join(' ');
  })
  return `
    <form>
      ${returnHtml.join(' ')}
    </form>
    `
}
export default generateForm;