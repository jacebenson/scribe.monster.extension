let tabButton = ({title, id, active})=>{
    return `
    <li class="nav-item" role="presentation">
        <button
          class="nav-link ${active ? 'active' : ''}"
          id="${id}-tab"
          data-bs-toggle="tab"
          data-bs-target="#${id}"
          type="button"
          role="tab"
          aria-controls="${id}"
          aria-selected="false"
        >
          ${title}
        </button>
      </li>
    `
}
export default tabButton;