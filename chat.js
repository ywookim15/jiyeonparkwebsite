/**
 * chat.js — AI Course Assistant Widget
 * Powered by Google Gemini API
 * Requires config.js to be loaded first (provides CONFIG.GEMINI_API_KEY)
 */
(function () {
  'use strict';

  /* ── Admin password ──────────────────────────────────────── */
  var ADMIN_PASSWORD = 'BUSped2025';

  /* ── Inject HTML ─────────────────────────────────────────── */
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
      <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="white"/></svg>
    </div>
    <div class="chat-header-text">
      <div class="chat-header-title">Course Assistant</div>
      <div class="chat-header-sub">Dr. Park's Special Education Courses</div>
    </div>
    <div class="chat-header-actions">
      <button class="chat-header-btn" id="chat-settings-btn" title="Syllabus settings" aria-label="Admin settings">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
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

<div id="chat-admin-overlay">
  <div class="admin-box" id="chat-admin-box">
    <h3 id="admin-title">Syllabus Settings</h3>
    <p id="admin-desc">Enter the admin password to edit the course syllabus context.</p>
    <div id="admin-password-view">
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
    <div id="admin-syllabus-view" style="display:none">
      <div class="admin-field">
        <label for="admin-syllabus-input">Course Syllabus Text</label>
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
          placeholder="Paste your full syllabus here, or upload a PDF above. This text is sent with every AI request as context."></textarea>
      </div>
      <div class="admin-actions">
        <button class="admin-btn primary" id="admin-save-btn">Save Syllabus</button>
        <button class="admin-btn secondary" id="admin-syllabus-cancel">Close</button>
      </div>
      <div class="admin-msg" id="admin-syllabus-msg"></div>
    </div>
  </div>
</div>
`;

  /* Inject into body */
  var container = document.createElement('div');
  container.id = 'chat-widget';
  container.innerHTML = widgetHTML;
  document.body.appendChild(container);

  /* ── Element references ──────────────────────────────────── */
  var fab        = document.getElementById('chat-fab');
  var panel      = document.getElementById('chat-panel');
  var messages   = document.getElementById('chat-messages');
  var input      = document.getElementById('chat-input');
  var sendBtn    = document.getElementById('chat-send-btn');
  var settingsBtn= document.getElementById('chat-settings-btn');
  var closeBtn   = document.getElementById('chat-close-btn');
  var overlay    = document.getElementById('chat-admin-overlay');
  var pwView     = document.getElementById('admin-password-view');
  var pwInput    = document.getElementById('admin-pw-input');
  var pwSubmit   = document.getElementById('admin-pw-submit');
  var pwCancel   = document.getElementById('admin-pw-cancel');
  var pwMsg      = document.getElementById('admin-pw-msg');
  var sylView    = document.getElementById('admin-syllabus-view');
  var sylInput   = document.getElementById('admin-syllabus-input');
  var saveBtn    = document.getElementById('admin-save-btn');
  var sylCancel  = document.getElementById('admin-syllabus-cancel');
  var sylMsg     = document.getElementById('admin-syllabus-msg');
  var pdfBtn     = document.getElementById('admin-pdf-btn');
  var pdfInput   = document.getElementById('admin-pdf-input');
  var pdfStatus  = document.getElementById('admin-pdf-status');

  /* ── State ───────────────────────────────────────────────── */
  var isOpen = false;
  var history = []; // [{role, parts}] for Gemini

  /* ── Panel open/close ────────────────────────────────────── */
  function openPanel() {
    isOpen = true;
    panel.classList.add('open');
    fab.classList.add('open');
    fab.setAttribute('aria-label', 'Close course assistant chat');
    setTimeout(function () { input.focus(); }, 280);
  }
  function closePanel() {
    isOpen = false;
    panel.classList.remove('open');
    fab.classList.remove('open');
    fab.setAttribute('aria-label', 'Open course assistant chat');
  }
  fab.addEventListener('click', function () {
    if (isOpen) closePanel(); else openPanel();
  });
  closeBtn.addEventListener('click', closePanel);

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) closePanel();
  });

  /* ── Append a message bubble ─────────────────────────────── */
  function appendMessage(role, text) {
    var wrapper = document.createElement('div');
    wrapper.className = 'chat-message ' + role;
    var bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.textContent = text;
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
    row.innerHTML = '<div class="chat-typing"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>';
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
  }
  function hideTyping() {
    var row = document.getElementById('chat-typing-row');
    if (row) row.remove();
  }

  /* ── Build system prompt ─────────────────────────────────── */
  function buildSystemPrompt() {
    var syllabus = localStorage.getItem('chat_syllabus') || '';
    var base = 'You are a helpful course assistant for Dr. Jiyeon Park\'s special education courses at Binghamton University. ' +
      'You help students with questions about course material, special education concepts, assistive technology, ' +
      'mathematics learning disabilities, virtual manipulatives, and AI in special education. ' +
      'Be warm, academic, and concise. Only answer questions relevant to the course content or related educational topics. ' +
      'If asked something unrelated (e.g., writing code, general trivia), politely redirect the student to course topics.';
    if (syllabus.trim()) {
      base += '\n\n--- COURSE SYLLABUS ---\n' + syllabus.trim() + '\n--- END SYLLABUS ---\n' +
        '\nUse the syllabus above to answer specific questions about assignments, schedules, and course requirements.';
    }
    return base;
  }

  /* ── Send message to Gemini ──────────────────────────────── */
  async function sendMessage() {
    var text = input.value.trim();
    if (!text) return;

    // Check API key
    var apiKey = (typeof CONFIG !== 'undefined' && CONFIG.GEMINI_API_KEY !== 'your-key-here')
      ? CONFIG.GEMINI_API_KEY
      : null;

    input.value = '';
    input.disabled = true;
    sendBtn.disabled = true;

    appendMessage('user', text);
    history.push({ role: 'user', parts: [{ text: text }] });

    showTyping();

    if (!apiKey) {
      hideTyping();
      appendMessage('assistant',
        'The Gemini API key is not configured yet. Please add your key to config.js to enable this feature.');
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
      return;
    }

    var modelId = (typeof CONFIG !== 'undefined' && CONFIG.GEMINI_MODEL)
      ? CONFIG.GEMINI_MODEL
      : 'gemini-2.5-flash-lite';

    var endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/' +
      modelId + ':generateContent?key=' + apiKey;

    var body = {
      system_instruction: { parts: [{ text: buildSystemPrompt() }] },
      contents: history.slice() // send full conversation
    };

    try {
      var resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!resp.ok) {
        var errData = await resp.json().catch(function () { return {}; });
        var errMsg = (errData.error && errData.error.message) || ('HTTP ' + resp.status);
        throw new Error(errMsg);
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
        history.push({ role: 'model', parts: [{ text: replyText }] });
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

  /* ── Admin / Syllabus modal ──────────────────────────────── */
  function openAdmin() {
    pwView.style.display = '';
    sylView.style.display = 'none';
    pwInput.value = '';
    pwMsg.className = 'admin-msg';
    pwMsg.textContent = '';
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
  sylCancel.addEventListener('click', closeAdmin);

  pwSubmit.addEventListener('click', function () {
    if (pwInput.value === ADMIN_PASSWORD) {
      pwView.style.display = 'none';
      sylView.style.display = '';
      var saved = localStorage.getItem('chat_syllabus') || '';
      sylInput.value = saved;
      sylMsg.className = 'admin-msg';
      sylMsg.textContent = '';
    } else {
      pwMsg.className = 'admin-msg error';
      pwMsg.textContent = 'Incorrect password.';
      pwInput.value = '';
      pwInput.focus();
    }
  });

  pwInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') pwSubmit.click();
  });

  saveBtn.addEventListener('click', function () {
    var text = sylInput.value.trim();
    localStorage.setItem('chat_syllabus', text);
    sylMsg.className = 'admin-msg success';
    sylMsg.textContent = text ? 'Syllabus saved! It will be included in all future AI requests.' : 'Syllabus cleared.';
    setTimeout(function () {
      sylMsg.className = 'admin-msg';
      sylMsg.textContent = '';
    }, 3000);
  });

  /* ── PDF upload ──────────────────────────────────────────── */
  var PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';

  function loadPdfJs(callback) {
    if (window.pdfjsLib) { callback(null); return; }
    var script = document.createElement('script');
    script.src = PDFJS_CDN;
    script.onload = function () {
      // Point the worker to the same CDN version
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
      var page = await pdf.getPage(i);
      var content = await page.getTextContent();
      var pageText = content.items.map(function (item) { return item.str; }).join(' ');
      pages.push(pageText);
    }
    return pages.join('\n\n');
  }

  pdfBtn.addEventListener('click', function () { pdfInput.click(); });

  pdfInput.addEventListener('change', function () {
    var file = pdfInput.files && pdfInput.files[0];
    if (!file) return;
    // Reset so the same file can be re-selected if needed
    pdfInput.value = '';

    pdfStatus.textContent = 'Extracting text from PDF…';
    pdfStatus.className = 'admin-pdf-status-loading';
    pdfBtn.disabled = true;

    loadPdfJs(function (loadErr) {
      if (loadErr) {
        pdfStatus.textContent = 'Error: ' + loadErr.message;
        pdfStatus.className = 'admin-pdf-status-error';
        pdfBtn.disabled = false;
        return;
      }

      extractPdfText(file).then(function (text) {
        sylInput.value = text;
        pdfStatus.textContent = '✓ Text extracted — review and click Save Syllabus.';
        pdfStatus.className = 'admin-pdf-status-ok';
        pdfBtn.disabled = false;
      }).catch(function (err) {
        pdfStatus.textContent = 'Parse error: ' + (err.message || 'Could not read PDF.');
        pdfStatus.className = 'admin-pdf-status-error';
        pdfBtn.disabled = false;
      });
    });
  });

})();
