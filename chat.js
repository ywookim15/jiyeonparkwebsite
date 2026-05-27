/**
 * chat.js — AI Course Assistant Widget
 * Powered by Google Gemini API
 * Requires config.js (GEMINI_API_KEY) and marked.js to be loaded first.
 */
(function () {
  'use strict';

  /* ── Constants ───────────────────────────────────────────── */
  var ADMIN_PASSWORD = 'BUSped2025';
  var PDFJS_CDN      = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  var LS_KEY         = 'chat_syllabi';   // JSON array of {id, courseName, text}
  var LS_LEGACY      = 'chat_syllabus';  // old single-text key — migrated on load

  /* ── Widget HTML ─────────────────────────────────────────── */
  var widgetHTML = `
<button id="chat-fab" aria-label="Open course assistant chat">
  <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
</button>

<div id="chat-panel" role="dialog" aria-label="Course assistant">
  <div class="chat-header">
    <div class="chat-header-icon">
      <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10
        10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="white"/></svg>
    </div>
    <div class="chat-header-text">
      <div class="chat-header-title">Course Assistant</div>
      <div class="chat-header-sub">Dr. Park's Special Education Courses</div>
    </div>
    <div class="chat-header-actions">
      <button class="chat-header-btn" id="chat-expand-btn" title="Expand" aria-label="Expand chat">
        <svg class="icon-expand" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 3 21 3 21 9"/>
          <polyline points="9 21 3 21 3 15"/>
          <line x1="21" y1="3" x2="14" y2="10"/>
          <line x1="3" y1="21" x2="10" y2="14"/>
        </svg>
        <svg class="icon-compress" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
             style="display:none">
          <polyline points="4 14 10 14 10 20"/>
          <polyline points="20 10 14 10 14 4"/>
          <line x1="10" y1="14" x2="3" y2="21"/>
          <line x1="21" y1="3" x2="14" y2="10"/>
        </svg>
      </button>
      <button class="chat-header-btn" id="chat-settings-btn" title="Syllabus settings" aria-label="Admin settings">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06
            a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09
            A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83
            l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09
            A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83
            l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09
            a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83
            l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09
            a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>
      <button class="chat-header-btn" id="chat-close-btn" title="Close" aria-label="Close chat">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
             stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  </div>

  <div class="chat-messages" id="chat-messages">
    <div class="chat-welcome">
      <strong>Welcome!</strong> I'm your AI assistant for Dr. Park's courses.
      Ask me anything about course material, special education concepts, or
      assignments listed in the syllabus.
    </div>
  </div>

  <div id="chat-course-row" style="display:none">
    <select id="chat-course-select">
      <option value="">Select your course…</option>
    </select>
  </div>

  <div class="chat-input-row">
    <input type="text" id="chat-input" placeholder="Ask a course question…" autocomplete="off" />
    <button id="chat-send-btn" aria-label="Send message">
      <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"
           stroke-linecap="round" stroke-linejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"/>
        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
      </svg>
    </button>
  </div>
</div>

<div id="chat-backdrop"></div>

<div id="chat-admin-overlay">
  <div class="admin-box" id="chat-admin-box">
    <h3>Syllabus Settings</h3>

    <!-- ── Password view ── -->
    <div id="admin-password-view">
      <p class="admin-intro">Enter the admin password to manage course syllabi.</p>
      <div class="admin-field">
        <label for="admin-pw-input">Password</label>
        <input type="password" id="admin-pw-input" placeholder="Enter password" />
      </div>
      <div class="admin-actions">
        <button class="admin-btn primary" id="admin-pw-submit">Unlock</button>
        <button class="admin-btn secondary" id="admin-pw-cancel">Cancel</button>
      </div>
      <div class="admin-msg" id="admin-pw-msg"></div>
    </div>

    <!-- ── Syllabi management view ── -->
    <div id="admin-syllabus-view" style="display:none">

      <!-- List sub-view -->
      <div id="admin-list-view">
        <p class="admin-intro">Saved syllabi are injected into every AI request as context.</p>
        <div id="admin-syllabi-list"></div>
        <div class="admin-actions" style="margin-top:14px">
          <button class="admin-btn primary" id="admin-add-btn">+ Add New Syllabus</button>
          <button class="admin-btn secondary" id="admin-list-close">Close</button>
        </div>
        <div class="admin-msg" id="admin-list-msg"></div>
      </div>

      <!-- Edit / Add sub-view -->
      <div id="admin-edit-view" style="display:none">
        <div class="admin-edit-header">
          <button class="admin-back-btn" id="admin-edit-cancel">← Back</button>
          <span id="admin-edit-title">New Syllabus</span>
        </div>
        <div class="admin-field">
          <label for="admin-course-name">Course Name <span style="color:#c0392b">*</span></label>
          <input type="text" id="admin-course-name"
            placeholder="e.g. SED 270: Assistive Technology" />
        </div>
        <div class="admin-field">
          <label for="admin-syllabus-input">Syllabus Text</label>
          <div class="admin-pdf-row">
            <button class="admin-btn admin-btn-pdf" id="admin-pdf-btn" type="button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Upload PDF
            </button>
            <span id="admin-pdf-status"></span>
          </div>
          <input type="file" id="admin-pdf-input" accept=".pdf" style="display:none" />
          <textarea id="admin-syllabus-input"
            placeholder="Paste your full syllabus here, or upload a PDF above.
This text is sent with every AI request as context."></textarea>
        </div>
        <div class="admin-actions">
          <button class="admin-btn primary" id="admin-save-btn">Save Syllabus</button>
          <button class="admin-btn secondary" id="admin-save-cancel">Cancel</button>
        </div>
        <div class="admin-msg" id="admin-edit-msg"></div>
      </div>

    </div><!-- /admin-syllabus-view -->
  </div><!-- /admin-box -->
</div><!-- /admin-overlay -->
`;

  /* ── Inject ──────────────────────────────────────────────── */
  var container = document.createElement('div');
  container.id = 'chat-widget';
  container.innerHTML = widgetHTML;
  document.body.appendChild(container);

  /* ── Element references ──────────────────────────────────── */
  var fab          = document.getElementById('chat-fab');
  var panel        = document.getElementById('chat-panel');
  var messages     = document.getElementById('chat-messages');
  var input        = document.getElementById('chat-input');
  var sendBtn      = document.getElementById('chat-send-btn');
  var expandBtn    = document.getElementById('chat-expand-btn');
  var settingsBtn  = document.getElementById('chat-settings-btn');
  var closeBtn     = document.getElementById('chat-close-btn');
  var backdrop     = document.getElementById('chat-backdrop');
  var courseRow    = document.getElementById('chat-course-row');
  var courseSelect = document.getElementById('chat-course-select');
  // Admin overlay
  var overlay      = document.getElementById('chat-admin-overlay');
  var pwView       = document.getElementById('admin-password-view');
  var pwInput      = document.getElementById('admin-pw-input');
  var pwSubmit     = document.getElementById('admin-pw-submit');
  var pwCancel     = document.getElementById('admin-pw-cancel');
  var pwMsg        = document.getElementById('admin-pw-msg');
  var sylView      = document.getElementById('admin-syllabus-view');
  var listView     = document.getElementById('admin-list-view');
  var syllabiList  = document.getElementById('admin-syllabi-list');
  var addBtn       = document.getElementById('admin-add-btn');
  var listClose    = document.getElementById('admin-list-close');
  var listMsg      = document.getElementById('admin-list-msg');
  var editView     = document.getElementById('admin-edit-view');
  var editCancelBtn= document.getElementById('admin-edit-cancel');
  var editTitle    = document.getElementById('admin-edit-title');
  var courseNameIn = document.getElementById('admin-course-name');
  var sylInput     = document.getElementById('admin-syllabus-input');
  var saveBtn      = document.getElementById('admin-save-btn');
  var saveCancelBtn= document.getElementById('admin-save-cancel');
  var editMsg      = document.getElementById('admin-edit-msg');
  var pdfBtn       = document.getElementById('admin-pdf-btn');
  var pdfInput     = document.getElementById('admin-pdf-input');
  var pdfStatus    = document.getElementById('admin-pdf-status');

  /* ── State ───────────────────────────────────────────────── */
  var isOpen           = false;
  var isExpanded       = false;
  var convHistory      = [];       // [{role, parts}] Gemini conversation
  var activeSyllabusId = null;     // student-selected course
  var editingId        = null;     // null = new, string = editing existing

  /* ── localStorage helpers ────────────────────────────────── */
  function loadSyllabi() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
    catch (e) { return []; }
  }
  function saveSyllabiArr(arr) {
    localStorage.setItem(LS_KEY, JSON.stringify(arr));
  }
  function genId() {
    return 'syl_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  }
  // Migrate old single-key data to new array format
  function migrateLegacy() {
    var legacy = localStorage.getItem(LS_LEGACY);
    if (!legacy) return;
    var existing = loadSyllabi();
    if (existing.length === 0 && legacy.trim()) {
      saveSyllabiArr([{ id: genId(), courseName: 'My Course', text: legacy.trim() }]);
    }
    localStorage.removeItem(LS_LEGACY);
  }

  /* ── XSS-safe helper for innerHTML ──────────────────────── */
  function escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ── Panel open / close ──────────────────────────────────── */
  function openPanel() {
    isOpen = true;
    panel.classList.add('open');
    fab.classList.add('open');
    fab.setAttribute('aria-label', 'Close course assistant chat');
    setTimeout(function () { input.focus(); }, 280);
  }
  function closePanel() {
    if (isExpanded) collapsePanel();
    isOpen = false;
    panel.classList.remove('open');
    fab.classList.remove('open');
    fab.setAttribute('aria-label', 'Open course assistant chat');
  }
  fab.addEventListener('click', function () {
    if (isOpen) closePanel(); else openPanel();
  });
  closeBtn.addEventListener('click', closePanel);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (isExpanded) { collapsePanel(); return; }
      if (isOpen) closePanel();
    }
  });

  /* ── Expand / collapse (fullscreen mode) ─────────────────── */
  function expandPanel() {
    isExpanded = true;
    panel.classList.add('expanded');
    backdrop.classList.add('open');
    expandBtn.setAttribute('aria-label', 'Exit fullscreen');
    expandBtn.querySelector('.icon-expand').style.display = 'none';
    expandBtn.querySelector('.icon-compress').style.display = '';
  }
  function collapsePanel() {
    isExpanded = false;
    panel.classList.remove('expanded');
    backdrop.classList.remove('open');
    expandBtn.setAttribute('aria-label', 'Expand chat');
    expandBtn.querySelector('.icon-expand').style.display = '';
    expandBtn.querySelector('.icon-compress').style.display = 'none';
  }
  expandBtn.addEventListener('click', function () {
    if (!isOpen) return;
    if (isExpanded) collapsePanel(); else expandPanel();
  });
  backdrop.addEventListener('click', function () {
    if (isExpanded) collapsePanel();
  });

  /* ── Course dropdown ─────────────────────────────────────── */
  function updateCourseDropdown() {
    var arr = loadSyllabi();
    if (arr.length < 2) {
      courseRow.style.display = 'none';
      activeSyllabusId = arr.length === 1 ? arr[0].id : null;
      courseSelect.value = '';
    } else {
      courseRow.style.display = '';
      var prevVal = courseSelect.value;
      courseSelect.innerHTML = '<option value="">Select your course…</option>' +
        arr.map(function (s) {
          return '<option value="' + escHtml(s.id) + '">' + escHtml(s.courseName) + '</option>';
        }).join('');
      // Restore previous selection if still valid
      if (arr.find(function (s) { return s.id === prevVal; })) {
        courseSelect.value = prevVal;
        activeSyllabusId = prevVal;
      } else {
        activeSyllabusId = null;
      }
    }
  }
  courseSelect.addEventListener('change', function () {
    activeSyllabusId = courseSelect.value || null;
  });

  /* ── Append message bubble ───────────────────────────────── */
  function appendMessage(role, text) {
    var wrapper = document.createElement('div');
    wrapper.className = 'chat-message ' + role;
    var bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    if (role === 'assistant' && typeof marked !== 'undefined') {
      bubble.innerHTML = marked.parse(text);
    } else {
      bubble.textContent = text;
    }
    wrapper.appendChild(bubble);
    messages.appendChild(wrapper);
    messages.scrollTop = messages.scrollHeight;
    return wrapper;
  }

  /* ── Typing indicator ────────────────────────────────────── */
  function showTyping() {
    var row = document.createElement('div');
    row.className = 'chat-message assistant';
    row.id = 'chat-typing-row';
    row.innerHTML = '<div class="chat-typing">' +
      '<span class="typing-dot"></span>' +
      '<span class="typing-dot"></span>' +
      '<span class="typing-dot"></span></div>';
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
  }
  function hideTyping() {
    var row = document.getElementById('chat-typing-row');
    if (row) row.remove();
  }

  /* ── System prompt ───────────────────────────────────────── */
  function buildSystemPrompt() {
    var arr = loadSyllabi();
    var base = 'You are a helpful course assistant for Dr. Jiyeon Park\'s special education courses ' +
      'at Binghamton University. You help students with questions about course material, special ' +
      'education concepts, assistive technology, mathematics learning disabilities, virtual ' +
      'manipulatives, and AI in special education. Be warm, academic, and concise. Only answer ' +
      'questions relevant to the course content or related educational topics. If asked something ' +
      'unrelated (e.g., writing code, general trivia), politely redirect the student to course topics.' +
      '\n\nFormat your responses using markdown when helpful: use **bold** for key terms and important ' +
      'points, *italics* for titles or emphasis, bullet points or numbered lists for steps or multiple ' +
      'items, tables when comparing information or presenting structured data, and headers (##) only ' +
      'for longer multi-section responses. Keep responses concise and well-structured.';

    // Determine which syllabus to include
    var syllabusText = '';
    if (arr.length === 1) {
      syllabusText = arr[0].text;
    } else if (arr.length > 1 && activeSyllabusId) {
      var found = arr.find(function (s) { return s.id === activeSyllabusId; });
      if (found) syllabusText = found.text;
    }

    if (syllabusText.trim()) {
      base += '\n\n--- COURSE SYLLABUS ---\n' + syllabusText.trim() +
        '\n--- END SYLLABUS ---\n' +
        '\nUse the syllabus above to answer specific questions about assignments, ' +
        'schedules, and course requirements.';
    }
    return base;
  }

  /* ── Send message to Gemini ──────────────────────────────── */
  async function sendMessage() {
    var text = input.value.trim();
    if (!text) return;

    // Prompt course selection if multiple syllabi and none chosen
    var arr = loadSyllabi();
    if (arr.length >= 2 && !activeSyllabusId) {
      appendMessage('assistant',
        'Please select your course from the dropdown above so I can give you the most relevant answers.');
      return;
    }

    var apiKey = (typeof CONFIG !== 'undefined' && CONFIG.GEMINI_API_KEY !== 'your-key-here')
      ? CONFIG.GEMINI_API_KEY : null;

    input.value = '';
    input.disabled = true;
    sendBtn.disabled = true;

    appendMessage('user', text);
    convHistory.push({ role: 'user', parts: [{ text: text }] });
    showTyping();

    if (!apiKey) {
      hideTyping();
      appendMessage('assistant',
        'The Gemini API key is not configured yet. Please add your key to config.js.');
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
      return;
    }

    var modelId = (typeof CONFIG !== 'undefined' && CONFIG.GEMINI_MODEL)
      ? CONFIG.GEMINI_MODEL : 'gemini-2.5-flash-lite';

    var endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/' +
      modelId + ':generateContent?key=' + apiKey;

    try {
      var resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: buildSystemPrompt() }] },
          contents: convHistory.slice()
        })
      });

      if (!resp.ok) {
        var errData = await resp.json().catch(function () { return {}; });
        throw new Error((errData.error && errData.error.message) || ('HTTP ' + resp.status));
      }

      var data = await resp.json();
      var replyText = data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts[0] &&
        data.candidates[0].content.parts[0].text;

      hideTyping();
      if (replyText) {
        convHistory.push({ role: 'model', parts: [{ text: replyText }] });
        appendMessage('assistant', replyText);
      } else {
        appendMessage('assistant', 'Sorry, I received an empty response. Please try again.');
      }
    } catch (err) {
      hideTyping();
      appendMessage('assistant', 'Error: ' + err.message + '. Please check your API key in config.js.');
    }

    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  /* ── Admin modal ─────────────────────────────────────────── */
  function openAdmin() {
    pwView.style.display   = '';
    sylView.style.display  = 'none';
    pwInput.value          = '';
    pwMsg.className        = 'admin-msg';
    pwMsg.textContent      = '';
    overlay.classList.add('open');
    setTimeout(function () { pwInput.focus(); }, 240);
  }
  function closeAdmin() {
    overlay.classList.remove('open');
  }

  settingsBtn.addEventListener('click', openAdmin);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeAdmin();
  });
  pwCancel.addEventListener('click', closeAdmin);

  pwSubmit.addEventListener('click', function () {
    if (pwInput.value === ADMIN_PASSWORD) {
      pwView.style.display  = 'none';
      sylView.style.display = '';
      showListView();
    } else {
      pwMsg.className   = 'admin-msg error';
      pwMsg.textContent = 'Incorrect password.';
      pwInput.value     = '';
      pwInput.focus();
    }
  });
  pwInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') pwSubmit.click();
  });

  /* ── Syllabi list view ───────────────────────────────────── */
  function showListView() {
    editView.style.display = 'none';
    listView.style.display = '';
    listMsg.className      = 'admin-msg';
    listMsg.textContent    = '';
    renderSyllabiList();
  }

  function renderSyllabiList() {
    var arr = loadSyllabi();
    if (arr.length === 0) {
      syllabiList.innerHTML =
        '<p class="admin-empty">No syllabi saved yet. Click “Add New Syllabus” to get started.</p>';
    } else {
      syllabiList.innerHTML = arr.map(function (s) {
        return '<div class="admin-syl-row" data-id="' + escHtml(s.id) + '">' +
          '<span class="admin-syl-name">' + escHtml(s.courseName) + '</span>' +
          '<div class="admin-syl-actions">' +
          '<button class="admin-syl-btn admin-syl-edit" data-id="' + escHtml(s.id) + '">Edit</button>' +
          '<button class="admin-syl-btn admin-syl-delete" data-id="' + escHtml(s.id) + '">Delete</button>' +
          '</div></div>';
      }).join('');
      syllabiList.querySelectorAll('.admin-syl-edit').forEach(function (btn) {
        btn.addEventListener('click', function () { openEditForm(btn.getAttribute('data-id')); });
      });
      syllabiList.querySelectorAll('.admin-syl-delete').forEach(function (btn) {
        btn.addEventListener('click', function () { deleteSyllabus(btn.getAttribute('data-id')); });
      });
    }
  }

  addBtn.addEventListener('click', function () { openEditForm(null); });
  listClose.addEventListener('click', closeAdmin);

  /* ── Edit / Add form ─────────────────────────────────────── */
  function openEditForm(id) {
    editingId = id;
    if (id) {
      var s = loadSyllabi().find(function (x) { return x.id === id; });
      if (!s) return;
      courseNameIn.value    = s.courseName;
      sylInput.value        = s.text;
      editTitle.textContent = 'Edit Syllabus';
    } else {
      courseNameIn.value    = '';
      sylInput.value        = '';
      editTitle.textContent = 'New Syllabus';
    }
    pdfStatus.textContent  = '';
    pdfStatus.className    = '';
    editMsg.className      = 'admin-msg';
    editMsg.textContent    = '';
    listView.style.display = 'none';
    editView.style.display = '';
    courseNameIn.focus();
  }

  editCancelBtn.addEventListener('click', showListView);
  saveCancelBtn.addEventListener('click', showListView);

  saveBtn.addEventListener('click', function () {
    var name = courseNameIn.value.trim();
    var text = sylInput.value.trim();
    if (!name) {
      editMsg.className   = 'admin-msg error';
      editMsg.textContent = 'Course name is required.';
      courseNameIn.focus();
      return;
    }
    var arr = loadSyllabi();
    if (editingId) {
      arr = arr.map(function (s) {
        return s.id === editingId ? { id: s.id, courseName: name, text: text } : s;
      });
    } else {
      arr.push({ id: genId(), courseName: name, text: text });
    }
    saveSyllabiArr(arr);
    updateCourseDropdown();

    editMsg.className   = 'admin-msg success';
    editMsg.textContent = 'Saved!';
    setTimeout(function () {
      editMsg.className   = 'admin-msg';
      editMsg.textContent = '';
      showListView();
    }, 900);
  });

  /* ── Delete syllabus ─────────────────────────────────────── */
  function deleteSyllabus(id) {
    var arr = loadSyllabi();
    var s = arr.find(function (x) { return x.id === id; });
    if (!s) return;
    if (!confirm('Delete "' + s.courseName + '"? This cannot be undone.')) return;
    arr = arr.filter(function (x) { return x.id !== id; });
    saveSyllabiArr(arr);
    if (activeSyllabusId === id) activeSyllabusId = null;
    updateCourseDropdown();
    renderSyllabiList();
    listMsg.className   = 'admin-msg success';
    listMsg.textContent = '“' + s.courseName + '” deleted.';
    setTimeout(function () {
      listMsg.className   = 'admin-msg';
      listMsg.textContent = '';
    }, 2500);
  }

  /* ── PDF upload ──────────────────────────────────────────── */
  function loadPdfJs(callback) {
    if (window.pdfjsLib) { callback(null); return; }
    var script = document.createElement('script');
    script.src = PDFJS_CDN;
    script.onload = function () {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      callback(null);
    };
    script.onerror = function () { callback(new Error('Failed to load PDF.js from CDN.')); };
    document.head.appendChild(script);
  }

  async function extractPdfText(file) {
    var arrayBuffer = await file.arrayBuffer();
    var pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    var pages = [];
    for (var i = 1; i <= pdf.numPages; i++) {
      var page    = await pdf.getPage(i);
      var content = await page.getTextContent();
      pages.push(content.items.map(function (item) { return item.str; }).join(' '));
    }
    return pages.join('\n\n');
  }

  pdfBtn.addEventListener('click', function () { pdfInput.click(); });

  pdfInput.addEventListener('change', function () {
    var file = pdfInput.files && pdfInput.files[0];
    if (!file) return;
    pdfInput.value = '';
    pdfStatus.textContent = 'Extracting text from PDF…';
    pdfStatus.className   = 'admin-pdf-status-loading';
    pdfBtn.disabled       = true;

    loadPdfJs(function (loadErr) {
      if (loadErr) {
        pdfStatus.textContent = 'Error: ' + loadErr.message;
        pdfStatus.className   = 'admin-pdf-status-error';
        pdfBtn.disabled       = false;
        return;
      }
      extractPdfText(file).then(function (text) {
        sylInput.value        = text;
        pdfStatus.textContent = '✓ Text extracted — review and click Save Syllabus.';
        pdfStatus.className   = 'admin-pdf-status-ok';
        pdfBtn.disabled       = false;
      }).catch(function (err) {
        pdfStatus.textContent = 'Parse error: ' + (err.message || 'Could not read PDF.');
        pdfStatus.className   = 'admin-pdf-status-error';
        pdfBtn.disabled       = false;
      });
    });
  });

  /* ── Boot ────────────────────────────────────────────────── */
  migrateLegacy();
  updateCourseDropdown();

})();
