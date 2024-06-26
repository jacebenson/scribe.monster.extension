import './style.css'
import './bootstrap/css/bootstrap.min.css'
import './bootstrap/js/bootstrap.bundle.min.js'
import tabButton from './src/component/tabButton.js'
import tabSection from './src/component/tabSection.js'
import generateForm from './src/component/generateForm.js'
import history from './src/component/history.js'
import stew from './src/askStew.js'
import summary from './src/summary.js'
import docs from './src/docs.js'
import settings from './src/settings.js'

let saveValueToTempPromptObject = ({ id, value }) => {
  chrome.storage.local.get([id], (data) => {
    let tempPromptObject = data;
    tempPromptObject[id] = value;
    chrome.storage.local.set({ tempPromptObject }, () => {
      console.log('tempPromptObject updated');
    });
  });
};

chrome.storage.local.get(['activeTab', 'tempPromptObj'], (data) => {
  // identify if this is a unpacked extension or a packed extension
  let activeTab = data.activeTab || 'settings-tab';
  let tempPromptObj = data.tempPromptObj || {};
  document.querySelector('#app').innerHTML = `
<div class="container mt-3" style="min-width: 450px">
  <h2 class="text-center">Scribe Monster</h2>
  <ul class="nav nav-tabs" id="myTab" role="tablist">
    ${tabButton({ title: `AMA`, id: 'home', active: (activeTab === 'home-tab') ? true : false, })}
    ${tabButton({ title: 'Summary', id: 'summary', active: (activeTab === 'summary-tab') ? true : false, })}
    ${tabButton({ title: 'Docs', id: 'docs', active: (activeTab === 'docs-tab') ? true : false, })}
    ${tabButton({ title: 'Settings', id: 'settings', active: (activeTab === 'settings-tab') ? true : false, })}
  </ul>
  <div class="tab-content">
    ${tabSection({
    title: 'Ask me anything',
    id: 'home',
    active: (activeTab === 'home-tab') ? true : false,
    history: history.generateHistoryTable({ id: 'scribeMonsterAma', column: 'Q+A' }),
    form: generateForm({
      form: {
        fields: [
          { id: 'ask-prompt', type: 'textarea', placeholder: 'Who founded ServiceNow?\nWhat is the hex value for Seahawk blue?', value: tempPromptObj?.ama || ''},
          { label: 'Modifier', id: 'ask-level', type: 'select', placeholder: 'level', options: [{label: 'No modifier', value: 'ask'}, {label: 'Simple Terms', value: 'ask-simple-terms'}, {label: 'Pirate', value: 'ask-pirate'}, {label: 'Step by step', value: 'ask-step-by-step'}] },
          { label: 'Ask Stew', id: 'button-ask-stew', type: 'button' }
        ]
      },
    })
  })}
  ${tabSection({
    title: 'Let me summarize the current page',
    id: 'summary',
    active: (activeTab === 'summary-tab') ? true : false,
    history: history.generateHistoryTable({ id: 'scribeMonsterSummary', column: 'Summaries' }),
    form: generateForm({
      form: {
        fields: [
          { label: "How much?", id: 'summarize-level', type: 'select', placeholder: 'level', options: [{ value: '1', label: 'CliffsNotes' }, { value: '2', label: 'Highlights' }, { value: '3', label: 'Deep Dive' }] },
          { id: 'summarize-prompt', type: 'textarea', placeholder: 'text to summarize',  value: tempPromptObj?.summarize || '' },
          { label: 'Summarize', id: 'button-summarize', type: 'button' }
          /**
           * 1. CliffsNotes: A quick overview of the main points
           * 2. Highlights: A more detailed overview of the key elements
           * 3. Deep Dive: An in-depth analysis of all aspects of the subject.
           */
        ]
      },
    })
  })}
  ${tabSection({
    title: 'Docs',
    id: 'docs',
    active: (activeTab === 'docs-tab') ? true : false,
    history: history.generateHistoryTable({ id: 'scribeMonsterDocs', column: 'Docs' }),
    form: generateForm({
      form: {
        fields: [
          { label: "Options", id: 'docs-type', type: 'select', placeholder: 'level', options: [
            { value: 'process-maker', label: 'Process Maker' }, 
            { value: 'product-requirements', label: 'Product Requirements' }, 
            { value: 'diagram', label: 'Diagrams' }
          ] },
          { id: 'docs-prompt', type: 'textarea', placeholder: '...',  value: tempPromptObj?.docs || '' },
          { label: 'Generate', id: 'button-docs', type: 'button' }
        ]
      },
    })
  })}
    ${tabSection({// Settings
    title: 'Settings',
    id: 'settings',
    active: (activeTab === 'settings-tab') ? true : false,
    //history: `hi`,
    form: generateForm({
      form: {
        fields: [
          { id: 'user', type: 'input', placeholder: 'user', label: 'Email' },
          { id: 'key', type: 'password', placeholder: 'key', label: 'API Key' },
          { id: 'domain', type: 'input', placeholder: 'domain', label: 'Domain', defaultValue: 'https://scribe.monster' },
          { id: 'showButton', type: 'select', label: 'Show Button on ServiceNow', defaultValue: 'Yes', options: [{value: 'Yes', label: 'Yes'},{value: 'No', label: 'No'},]},
          { label: 'Validate', id: 'button-validate', type: 'button' },
          { label: 'Pop out', id: 'button-popout', type: 'button' },
          { type: 'html', html: `<!--footer with links to privacy, website, etc.-->
            <footer class="footer mt-auto py-3">
              <div class="container">
                <span class="text-muted">Scribe Monster is a project by <a href="https://linkedin.com/in/jacebenson">Jace Benson</a><br/>
                <a href="https://scribe.monster/privacy">Privacy Policy</a> | <a href="https://scribe.monster">Scribe Monster</a></span> | <a href="https://scribe.monster/resources">Resources</a><br/>
                <!--Feedback mailto link and resources link-->
                <span class="text-muted">Love it, hate it, feedback? <a href="mailto:jace@benson.run?subject=Scribe Monster Feedback">Email Me</a></span>
                </div>
            </footer>`}
        ]
      }

    })
  })}
  </div>
</div>
`

  // Add link event listeners
  document.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault()
      const href = e.target.getAttribute('href')
      // open new tab
      chrome.tabs.create({ url: href })
    })
  })

  // Add Button event listeners
  document.querySelector('#button-ask-stew').addEventListener('click', stew.ask)
  document.querySelector('#button-summarize').addEventListener('click', summary.summarize)
  document.querySelector('#button-docs').addEventListener('click', docs.generate)
  document.querySelector('#button-validate').addEventListener('click', settings.validate)
  document.querySelector('#button-popout').addEventListener('click', settings.popout)

  // Add field event listeners
  document.querySelector('#domain').addEventListener('change', settings.setDomain)
  document.querySelector('#showButton').addEventListener('change', settings.setShowButton)
  document.querySelector('#ask-prompt').addEventListener('keyup', (e) => {
    tempPromptObj.ama = e.target.value;
    chrome.storage.local.set({ tempPromptObj }, (data) => {
      console.log('tempPromptObj set to', tempPromptObj, data);
    }
    );
  })
  document.querySelector('#summarize-prompt').addEventListener('keyup', (e) => {
    tempPromptObj.summarize = e.target.value;
    chrome.storage.local.set({ tempPromptObj }, (data) => {
      console.log('tempPromptObj set to', tempPromptObj, data);
    }
    );
  })
  document.querySelector('#docs-prompt').addEventListener('keyup', (e) => {
    if(e.target.value == '') delete tempPromptObj.docs
    tempPromptObj.docs = e.target.value;
    chrome.storage.local.set({ tempPromptObj }, (data) => {
      console.log('tempPromptObj set to', tempPromptObj, data);
    }
    );
  })

  // when tab is clicked, change the active tab

  document.querySelectorAll('.nav-link').forEach((el) => {
    el.addEventListener('click', (e) => {
      chrome.storage.local.set({ activeTab: e.target.id }, (data) => {
        //console.log('active tab set to', e.target.id, data);
      });
    });
  });




  // load up questions
  history.setHistoryData({ storageName: 'scribeMonsterAma' });
  history.setHistoryData({ storageName: 'scribeMonsterSummary' });
  history.setHistoryData({ storageName: 'scribeMonsterDocs' });
  
  // load settings
  settings.setFieldsFromStorage();
});