/**
 * Chanakya AI Knowledge Assistant - Embeddable Web Widget SDK
 * Usage:
 * <script src="http://localhost:3000/embed/chanakya.js" data-api-url="http://localhost:3000" data-theme="blue"></script>
 */
(function() {
  if (window.__chanakya_loaded) return;
  window.__chanakya_loaded = true;

  const currentScript = document.currentScript || (function() {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  const apiUrl = (currentScript && currentScript.getAttribute('data-api-url')) || 'http://localhost:3000';
  const themeColor = (currentScript && currentScript.getAttribute('data-theme')) || '#2563eb';
  let conversationId = null;
  let isOpen = false;

  // Create Styles
  const style = document.createElement('style');
  style.textContent = `
    #chanakya-launcher-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      display: flex;
      align-items: center;
      gap: 10px;
      background: linear-gradient(135deg, ${themeColor}, #4f46e5);
      color: #ffffff;
      padding: 12px 18px;
      border-radius: 9999px;
      box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4);
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      font-weight: 600;
      border: none;
      outline: none;
      transition: all 0.25s ease;
    }
    #chanakya-launcher-btn:hover {
      transform: translateY(-2px) scale(1.03);
      box-shadow: 0 15px 30px -5px rgba(37, 99, 235, 0.5);
    }
    #chanakya-launcher-btn:active {
      transform: scale(0.98);
    }
    #chanakya-modal {
      position: fixed;
      bottom: 84px;
      right: 24px;
      z-index: 999998;
      width: 400px;
      max-width: calc(100vw - 32px);
      height: 580px;
      max-height: calc(100vh - 120px);
      background: #ffffff;
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(226, 232, 240, 0.8);
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      animation: chanakyaSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes chanakyaSlideUp {
      from { opacity: 0; transform: translateY(16px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .chanakya-header {
      background: linear-gradient(135deg, ${themeColor}, #4338ca);
      padding: 16px 20px;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .chanakya-body {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #f8fafc;
      font-size: 13px;
    }
    .chanakya-msg {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 16px;
      line-height: 1.5;
      word-break: break-word;
    }
    .chanakya-msg-user {
      align-self: flex-end;
      background: ${themeColor};
      color: #ffffff;
      border-bottom-right-radius: 4px;
    }
    .chanakya-msg-assistant {
      align-self: flex-start;
      background: #ffffff;
      color: #1e293b;
      border: 1px solid #e2e8f0;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .chanakya-footer {
      padding: 12px;
      border-top: 1px solid #e2e8f0;
      background: #ffffff;
      display: flex;
      gap: 8px;
    }
    .chanakya-input {
      flex: 1;
      padding: 10px 14px;
      border-radius: 12px;
      border: 1px solid #cbd5e1;
      font-size: 13px;
      outline: none;
    }
    .chanakya-input:focus {
      border-color: ${themeColor};
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
    }
    .chanakya-send-btn {
      background: ${themeColor};
      color: white;
      border: none;
      border-radius: 12px;
      padding: 0 16px;
      font-weight: 600;
      cursor: pointer;
    }
    .chanakya-send-btn:hover {
      opacity: 0.9;
    }
  `;
  document.head.appendChild(style);

  // Create Launcher Button
  const launcher = document.createElement('button');
  launcher.id = 'chanakya-launcher-btn';
  launcher.innerHTML = `
    <img src="${apiUrl}/assets/avatars/avatar-happy.svg" alt="Chanakya Logo" style="width:22px; height:22px; object-fit:contain;" />
    <span>Ask Chanakya</span>
  `;
  document.body.appendChild(launcher);

  // Create Modal
  const modal = document.createElement('div');
  modal.id = 'chanakya-modal';
  modal.innerHTML = `
    <div class="chanakya-header">
      <div style="display:flex; align-items:center; gap:10px;">
        <div style="font-weight:700; font-size:15px;">Chanakya AI</div>
        <span style="font-size:10px; background:rgba(255,255,255,0.2); padding:2px 6px; border-radius:6px;">Knowledge Assistant</span>
      </div>
      <button id="chanakya-close-btn" style="background:none; border:none; color:white; font-size:18px; cursor:pointer;">&times;</button>
    </div>
    <div class="chanakya-body" id="chanakya-chat-feed">
      <div class="chanakya-msg chanakya-msg-assistant">
        Hello! I'm <strong>Chanakya</strong>, your AI Knowledge Assistant. How can I assist you with project documentation or questions today?
      </div>
    </div>
    <form class="chanakya-footer" id="chanakya-chat-form">
      <input type="text" class="chanakya-input" id="chanakya-chat-input" placeholder="Type your question..." autocomplete="off" />
      <button type="submit" class="chanakya-send-btn">Send</button>
    </form>
  `;
  document.body.appendChild(modal);

  // Event Listeners
  launcher.addEventListener('click', () => {
    isOpen = !isOpen;
    modal.style.display = isOpen ? 'flex' : 'none';
    if (isOpen) {
      document.getElementById('chanakya-chat-input').focus();
    }
  });

  document.getElementById('chanakya-close-btn').addEventListener('click', () => {
    isOpen = false;
    modal.style.display = 'none';
  });

  const chatForm = document.getElementById('chanakya-chat-form');
  const chatInput = document.getElementById('chanakya-chat-input');
  const chatFeed = document.getElementById('chanakya-chat-feed');

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = chatInput.value.trim();
    if (!query) return;

    // Append user message
    const userDiv = document.createElement('div');
    userDiv.className = 'chanakya-msg chanakya-msg-user';
    userDiv.textContent = query;
    chatFeed.appendChild(userDiv);
    chatInput.value = '';
    chatFeed.scrollTop = chatFeed.scrollHeight;

    // Typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chanakya-msg chanakya-msg-assistant';
    typingDiv.innerHTML = '<span style="color:#64748b;">Thinking...</span>';
    chatFeed.appendChild(typingDiv);
    chatFeed.scrollTop = chatFeed.scrollHeight;

    try {
      const res = await fetch(`${apiUrl}/api/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, conversationId })
      });
      const data = await res.json();
      if (data.conversationId) conversationId = data.conversationId;
      typingDiv.innerHTML = data.answer || 'Thank you for your inquiry.';
    } catch (err) {
      typingDiv.innerHTML = '<span style="color:#e11d48;">Could not reach knowledge service. Please try again.</span>';
    }
    chatFeed.scrollTop = chatFeed.scrollHeight;
  });
})();
