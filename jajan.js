// Cloudflare Worker File Uploader - Fixed Syntax
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Email, X-Auth-Key'
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Homepage dengan file upload
  if (path === '/' && request.method === 'GET') {
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Cloudflare Worker File Uploader</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .header p {
            opacity: 0.9;
            font-size: 1.1em;
        }
        .content {
            padding: 30px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
        }
        @media (max-width: 768px) {
            .content {
                grid-template-columns: 1fr;
            }
        }
        .form-section, .preview-section {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 10px;
            border: 1px solid #e9ecef;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #2c3e50;
        }
        input, textarea, select {
            width: 100%;
            padding: 12px;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        input:focus, textarea:focus, select:focus {
            outline: none;
            border-color: #3498db;
        }
        textarea {
            height: 300px;
            font-family: 'Courier New', monospace;
            resize: vertical;
        }
        .file-input-container {
            position: relative;
            overflow: hidden;
            display: inline-block;
            width: 100%;
        }
        .file-input {
            position: absolute;
            left: -9999px;
        }
        .file-input-label {
            display: block;
            padding: 12px;
            background: #3498db;
            color: white;
            border-radius: 8px;
            text-align: center;
            cursor: pointer;
            transition: background 0.3s;
        }
        .file-input-label:hover {
            background: #2980b9;
        }
        .file-name {
            margin-top: 8px;
            font-size: 14px;
            color: #666;
        }
        .btn-group {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 20px;
        }
        button {
            padding: 12px 25px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            flex: 1;
            min-width: 120px;
        }
        .btn-primary {
            background: #3498db;
            color: white;
        }
        .btn-primary:hover {
            background: #2980b9;
            transform: translateY(-2px);
        }
        .btn-success {
            background: #27ae60;
            color: white;
        }
        .btn-success:hover {
            background: #219a52;
            transform: translateY(-2px);
        }
        .btn-danger {
            background: #e74c3c;
            color: white;
        }
        .btn-danger:hover {
            background: #c0392b;
            transform: translateY(-2px);
        }
        .btn-secondary {
            background: #95a5a6;
            color: white;
        }
        .btn-secondary:hover {
            background: #7f8c8d;
            transform: translateY(-2px);
        }
        .result {
            margin-top: 20px;
            padding: 15px;
            border-radius: 8px;
            display: none;
            white-space: pre-wrap;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            max-height: 400px;
            overflow-y: auto;
        }
        .success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            display: block;
        }
        .error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            display: block;
        }
        .worker-preview {
            background: #2c3e50;
            color: #ecf0f1;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            height: 400px;
            overflow-y: auto;
            white-space: pre-wrap;
        }
        .file-list {
            margin-top: 15px;
        }
        .file-item {
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            margin-bottom: 10px;
            cursor: pointer;
            transition: background 0.3s;
        }
        .file-item:hover {
            background: #e9ecef;
        }
        .file-item.active {
            background: #3498db;
            color: white;
        }
        .credits {
            text-align: center;
            padding: 20px;
            color: #7f8c8d;
            font-size: 0.9em;
            border-top: 1px solid #e9ecef;
        }
        .tab-container {
            margin-bottom: 20px;
        }
        .tabs {
            display: flex;
            border-bottom: 2px solid #e9ecef;
        }
        .tab {
            padding: 10px 20px;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            margin-bottom: -2px;
        }
        .tab.active {
            border-bottom: 2px solid #3498db;
            color: #3498db;
            font-weight: 600;
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📁 Cloudflare Worker File Uploader</h1>
            <p>Upload script Worker dari file JavaScript</p>
        </div>
        
        <div class="content">
            <div class="form-section">
                <div class="tab-container">
                    <div class="tabs">
                        <div class="tab active" onclick="switchTab('upload')">📤 Upload File</div>
                        <div class="tab" onclick="switchTab('manual')">✏️ Manual Input</div>
                    </div>
                </div>

                <!-- Upload File Tab -->
                <div id="upload-tab" class="tab-content active">
                    <div class="form-group">
                        <label>📧 Email Cloudflare:</label>
                        <input type="email" id="email" placeholder="your-email@example.com">
                    </div>
                    
                    <div class="form-group">
                        <label>🔑 Global API Key:</label>
                        <input type="password" id="apiKey" placeholder="Dapatkan dari Cloudflare Dashboard">
                    </div>
                    
                    <div class="form-group">
                        <label>🆔 Account ID:</label>
                        <input type="text" id="accountId" placeholder="Account ID Anda">
                    </div>
                    
                    <div class="form-group">
                        <label>📝 Nama Worker:</label>
                        <input type="text" id="workerName" placeholder="nama-worker-anda">
                    </div>

                    <div class="form-group">
                        <label>📁 Pilih File JavaScript:</label>
                        <div class="file-input-container">
                            <input type="file" id="fileInput" class="file-input" accept=".js,.javascript" onchange="handleFileSelect(this.files)">
                            <label for="fileInput" class="file-input-label">
                                📤 Pilih File .js
                            </label>
                        </div>
                        <div class="file-name" id="fileName">Belum ada file dipilih</div>
                    </div>

                    <div class="file-list" id="fileList">
                        <!-- File list akan diisi oleh JavaScript -->
                    </div>
                </div>

                <!-- Manual Input Tab -->
                <div id="manual-tab" class="tab-content">
                    <div class="form-group">
                        <label>📧 Email Cloudflare:</label>
                        <input type="email" id="emailManual" placeholder="your-email@example.com">
                    </div>
                    
                    <div class="form-group">
                        <label>🔑 Global API Key:</label>
                        <input type="password" id="apiKeyManual" placeholder="Dapatkan dari Cloudflare Dashboard">
                    </div>
                    
                    <div class="form-group">
                        <label>🆔 Account ID:</label>
                        <input type="text" id="accountIdManual" placeholder="Account ID Anda">
                    </div>
                    
                    <div class="form-group">
                        <label>📝 Nama Worker:</label>
                        <input type="text" id="workerNameManual" placeholder="nama-worker-anda">
                    </div>

                    <div class="form-group">
                        <label>📄 Script Worker:</label>
                        <textarea id="workerScriptManual">// Cloudflare Worker Script
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  return new Response('Hello World from Worker!', {
    headers: { 
      'content-type': 'text/plain',
      'x-worker': 'cloudflare'
    }
  })
}</textarea>
                    </div>
                </div>
                
                <div class="btn-group">
                    <button class="btn-success" onclick="deployWorker()">
                        🚀 Deploy Worker
                    </button>
                    <button class="btn-primary" onclick="listWorkers()">
                        📋 List Workers
                    </button>
                    <button class="btn-danger" onclick="deleteWorker()">
                        🗑️ Delete Worker
                    </button>
                    <button class="btn-secondary" onclick="clearForm()">
                        🧹 Clear
                    </button>
                </div>
                
                <div id="result"></div>
            </div>
            
            <div class="preview-section">
                <h3>👀 Preview Script</h3>
                <div class="worker-preview" id="workerPreview">// Pilih file atau ketik script untuk preview</div>
                <div style="margin-top: 15px; font-size: 12px; color: #666;">
                    <strong>Format yang didukung:</strong> File JavaScript (.js) dengan Service Worker syntax
                </div>
            </div>
        </div>
        
        <div class="credits">
            Cloudflare Worker File Uploader • Upload script dari file lokal
        </div>
    </div>

    <script>
        let currentFileContent = '';
        let currentTab = 'upload';

        function switchTab(tabName) {
            currentTab = tabName;
            
            // Update tabs
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            const tabIndex = tabName === 'upload' ? 0 : 1;
            document.querySelectorAll('.tab')[tabIndex].classList.add('active');
            document.getElementById(tabName + '-tab').classList.add('active');
        }

        function handleFileSelect(files) {
            if (files.length === 0) return;
            
            const file = files[0];
            const fileNameElement = document.getElementById('fileName');
            fileNameElement.textContent = file.name;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                currentFileContent = e.target.result;
                document.getElementById('workerPreview').textContent = currentFileContent;
                showResult('✅ File berhasil dibaca: ' + file.name + ' (' + file.size + ' bytes)', true);
            };
            
            reader.onerror = function() {
                showResult('❌ Gagal membaca file', false);
            };
            
            reader.readAsText(file);
        }

        // Load sample files (simulasi)
        function loadSampleFiles() {
            const sampleFiles = [
                {
                    name: 'basic-worker.js',
                    content: "// Basic Worker Example\\naddEventListener('fetch', event => {\\n  event.respondWith(handleRequest(event.request))\\n})\\n\\nasync function handleRequest(request) {\\n  return new Response('Hello World!', {\\n    headers: { 'content-type': 'text/plain' }\\n  })\\n}"
                },
                {
                    name: 'api-worker.js',
                    content: "// API Worker Example\\naddEventListener('fetch', event => {\\n  event.respondWith(handleRequest(event.request))\\n})\\n\\nasync function handleRequest(request) {\\n  const url = new URL(request.url)\\n  \\n  if (url.pathname === '/api/hello') {\\n    return new Response(JSON.stringify({\\n      message: 'Hello from API!',\\n      timestamp: new Date().toISOString()\\n    }), {\\n      headers: {\\n        'content-type': 'application/json',\\n        'access-control-allow-origin': '*'\\n      }\\n    })\\n  }\\n  \\n  return new Response('API Worker Ready')\\n}"
                },
                {
                    name: 'html-worker.js',
                    content: "// HTML Worker Example\\naddEventListener('fetch', event => {\\n  event.respondWith(handleRequest(event.request))\\n})\\n\\nasync function handleRequest(request) {\\n  const html = '<!DOCTYPE html>\\\\n<html>\\\\n<head>\\\\n    <title>My Worker</title>\\\\n    <style>\\\\n        body { font-family: Arial, sans-serif; padding: 20px; }\\\\n        .container { max-width: 800px; margin: 0 auto; }\\\\n    </style>\\\\n</head>\\\\n<body>\\\\n    <div class=\\\"container\\\">\\\\n        <h1>Hello from Cloudflare Worker!</h1>\\\\n        <p>Generated at: ' + new Date().toISOString() + '</p>\\\\n    </div>\\\\n</body>\\\\n</html>'\\n\\n  return new Response(html, {\\n    headers: { 'content-type': 'text/html' }\\n  })\\n}"
                }
            ];

            const fileList = document.getElementById('fileList');
            fileList.innerHTML = '<h4>Contoh File:</h4>';
            
            sampleFiles.forEach((file) => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.innerHTML = '<strong>' + file.name + '</strong><div style=\"font-size: 11px; color: #666; margin-top: 5px;\">' + file.content.length + ' characters</div>';
                
                fileItem.onclick = function() {
                    currentFileContent = file.content;
                    document.getElementById('workerPreview').textContent = file.content;
                    document.getElementById('fileName').textContent = file.name;
                    document.getElementById('workerName').value = file.name.replace('.js', '');
                    showResult('✅ Loaded: ' + file.name, true);
                    
                    // Remove active class from all items
                    document.querySelectorAll('.file-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    // Add active class to clicked item
                    fileItem.classList.add('active');
                };
                
                fileList.appendChild(fileItem);
            });
        }

        function getCurrentCredentials() {
            if (currentTab === 'upload') {
                return {
                    email: document.getElementById('email').value,
                    apiKey: document.getElementById('apiKey').value,
                    accountId: document.getElementById('accountId').value,
                    workerName: document.getElementById('workerName').value,
                    workerScript: currentFileContent
                };
            } else {
                return {
                    email: document.getElementById('emailManual').value,
                    apiKey: document.getElementById('apiKeyManual').value,
                    accountId: document.getElementById('accountIdManual').value,
                    workerName: document.getElementById('workerNameManual').value,
                    workerScript: document.getElementById('workerScriptManual').value
                };
            }
        }

        async function deployWorker() {
            const credentials = getCurrentCredentials();
            const { email, apiKey, accountId, workerName, workerScript } = credentials;

            if (!email || !apiKey || !accountId || !workerName || !workerScript) {
                showResult('❌ Semua field harus diisi!', false);
                return;
            }

            if (workerScript.trim().length === 0) {
                showResult('❌ Script Worker tidak boleh kosong!', false);
                return;
            }

            showResult('🔄 Deploying worker...', true);

            try {
                const response = await fetch('/deploy', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Auth-Email': email,
                        'X-Auth-Key': apiKey
                    },
                    body: JSON.stringify({
                        accountId: accountId,
                        workerName: workerName,
                        workerScript: workerScript
                    })
                });

                const result = await response.json();
                showResult(JSON.stringify(result, null, 2), response.ok);
                
                if (response.ok && result.workerUrl) {
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML += '\\\\n\\\\n🔗 <a href=\"' + result.workerUrl + '\" target=\"_blank\" style=\"color: #155724;\">Test Worker: ' + result.workerUrl + '</a>';
                }
            } catch (error) {
                showResult('❌ Error: ' + error.message, false);
            }
        }

        async function listWorkers() {
            const credentials = getCurrentCredentials();
            const { email, apiKey, accountId } = credentials;

            if (!email || !apiKey || !accountId) {
                showResult('❌ Email, API Key, dan Account ID harus diisi!', false);
                return;
            }

            showResult('🔄 Loading workers list...', true);

            try {
                const response = await fetch('/workers?accountId=' + encodeURIComponent(accountId), {
                    headers: {
                        'X-Auth-Email': email,
                        'X-Auth-Key': apiKey
                    }
                });

                const result = await response.json();
                showResult(JSON.stringify(result, null, 2), response.ok);
            } catch (error) {
                showResult('❌ Error: ' + error.message, false);
            }
        }

        async function deleteWorker() {
            const credentials = getCurrentCredentials();
            const { email, apiKey, accountId, workerName } = credentials;

            if (!email || !apiKey || !accountId || !workerName) {
                showResult('❌ Semua field harus diisi!', false);
                return;
            }

            if (!confirm('Yakin ingin menghapus worker ' + workerName + '?')) {
                return;
            }

            showResult('🔄 Deleting worker...', true);

            try {
                const response = await fetch('/delete/' + encodeURIComponent(workerName) + '?accountId=' + encodeURIComponent(accountId), {
                    method: 'DELETE',
                    headers: {
                        'X-Auth-Email': email,
                        'X-Auth-Key': apiKey
                    }
                });

                const result = await response.json();
                showResult(JSON.stringify(result, null, 2), response.ok);
            } catch (error) {
                showResult('❌ Error: ' + error.message, false);
            }
        }

        function clearForm() {
            if (currentTab === 'upload') {
                document.getElementById('email').value = '';
                document.getElementById('apiKey').value = '';
                document.getElementById('accountId').value = '';
                document.getElementById('workerName').value = '';
                document.getElementById('fileInput').value = '';
                document.getElementById('fileName').textContent = 'Belum ada file dipilih';
                currentFileContent = '';
            } else {
                document.getElementById('emailManual').value = '';
                document.getElementById('apiKeyManual').value = '';
                document.getElementById('accountIdManual').value = '';
                document.getElementById('workerNameManual').value = '';
                document.getElementById('workerScriptManual').value = '';
            }
            document.getElementById('workerPreview').textContent = '// Pilih file atau ketik script untuk preview';
            showResult('Form berhasil dibersihkan', true);
        }

        function showResult(message, isSuccess) {
            const resultDiv = document.getElementById('result');
            resultDiv.className = 'result ' + (isSuccess ? 'success' : 'error');
            resultDiv.innerHTML = message;
            resultDiv.scrollIntoView({ behavior: 'smooth' });
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            loadSampleFiles();
            document.getElementById('workerScriptManual').addEventListener('input', function() {
                document.getElementById('workerPreview').textContent = this.value;
            });
        });
    </script>
</body>
</html>`

    return new Response(htmlContent, {
      headers: { 
        'content-type': 'text/html',
        ...corsHeaders
      }
    })
  }

  // API Routes untuk deploy worker
  if (path === '/deploy' && request.method === 'POST') {
    return handleDeploy(request)
  }

  if (path === '/workers' && request.method === 'GET') {
    return handleListWorkers(request)
  }

  if (path.startsWith('/delete/') && request.method === 'DELETE') {
    return handleDeleteWorker(request)
  }

  return new Response('Cloudflare Worker File Uploader API', {
    headers: { 'content-type': 'text/plain', ...corsHeaders }
  })
}

async function handleDeploy(request) {
  try {
    const { accountId, workerName, workerScript } = await request.json()
    const email = request.headers.get('X-Auth-Email')
    const apiKey = request.headers.get('X-Auth-Key')

    if (!email || !apiKey || !accountId || !workerName || !workerScript) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields or headers'
      }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      })
    }

    // Upload ke Cloudflare API
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${workerName}`,
      {
        method: 'PUT',
        headers: {
          'X-Auth-Email': email,
          'X-Auth-Key': apiKey,
          'Content-Type': 'application/javascript',
        },
        body: workerScript
      }
    )

    const result = await response.json()

    return new Response(JSON.stringify({
      success: response.ok,
      status: response.status,
      workerUrl: response.ok ? `https://${workerName}.workers.dev` : null,
      response: result
    }), {
      status: response.ok ? 200 : 400,
      headers: { 'content-type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
}

async function handleListWorkers(request) {
  try {
    const url = new URL(request.url)
    const accountId = url.searchParams.get('accountId')
    const email = request.headers.get('X-Auth-Email')
    const apiKey = request.headers.get('X-Auth-Key')

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts`,
      {
        headers: {
          'X-Auth-Email': email,
          'X-Auth-Key': apiKey
        }
      }
    )

    const result = await response.json()

    return new Response(JSON.stringify(result, null, 2), {
      headers: { 'content-type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
}

async function handleDeleteWorker(request) {
  try {
    const workerName = request.url.split('/delete/')[1].split('?')[0]
    const url = new URL(request.url)
    const accountId = url.searchParams.get('accountId')
    const email = request.headers.get('X-Auth-Email')
    const apiKey = request.headers.get('X-Auth-Key')

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${workerName}`,
      {
        method: 'DELETE',
        headers: {
          'X-Auth-Email': email,
          'X-Auth-Key': apiKey
        }
      }
    )

    const result = await response.json()

    return new Response(JSON.stringify(result, null, 2), {
      headers: { 'content-type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
}
