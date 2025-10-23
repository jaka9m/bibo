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
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLMDJqLz0EOWZ+hLp-G4vA4Y0zF/C1L/a8kI4tC4e2v9t4s0gN3gD5o5l/W2Bw5p+Q==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    
    <style>
        /* Custom styles to handle specific elements not covered by utility classes */
        /* Scrollbar styles for preview/result boxes */
        .worker-preview::-webkit-scrollbar, .result::-webkit-scrollbar {
            width: 8px;
        }
        .worker-preview::-webkit-scrollbar-thumb, .result::-webkit-scrollbar-thumb {
            background-color: #60a5fa; /* blue-400 */
            border-radius: 4px;
        }
        .worker-preview::-webkit-scrollbar-track, .result::-webkit-scrollbar-track {
            background: #e5e7eb; /* gray-200 */
        }
        .result a {
            color: #166534; /* dark green for links */
            text-decoration: underline;
        }
        .result.error a {
            color: #b91c1c; /* dark red for error links */
        }
        /* Custom file input appearance workaround for cross-browser compatibility */
        .file-input-label {
            transition: background-color 0.3s, transform 0.3s;
        }
        .file-input-label:hover {
            transform: translateY(-1px);
        }
    </style>
</head>
<body class="min-h-screen p-5 bg-gradient-to-br from-indigo-500 to-purple-600">
    <div class="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
        <div class="header bg-gradient-to-r from-gray-800 to-blue-900 text-white p-8 text-center">
            <h1 class="text-3xl font-extrabold mb-2 flex items-center justify-center">
                <i class="fas fa-cloud-upload-alt mr-3"></i> Cloudflare Worker File Uploader
            </h1>
            <p class="opacity-90 text-lg">Deploy script Worker dari file JavaScript atau input manual</p>
        </div>
        
        
        <div class="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="form-section bg-gray-50 p-6 rounded-lg border border-gray-200">
                
                <div class="tab-container mb-6">
                    <div class="flex border-b-2 border-gray-200">
                        <div id="tab-upload" class="tab px-5 py-3 cursor-pointer border-b-2 border-transparent transition duration-300 text-gray-600 hover:text-blue-600 active-tab" onclick="switchTab('upload')">
                            <i class="fas fa-upload mr-2"></i> Upload File
                        </div>
                        <div id="tab-manual" class="tab px-5 py-3 cursor-pointer border-b-2 border-transparent transition duration-300 text-gray-600 hover:text-blue-600" onclick="switchTab('manual')">
                            <i class="fas fa-keyboard mr-2"></i> Manual Input
                        </div>
                    </div>
                </div>

                <div id="upload-tab-content" class="tab-content active-content">
                    <div class="space-y-5">
                        <div class="form-group">
                            <label for="email" class="block mb-2 font-semibold text-gray-700"><i class="fas fa-envelope mr-2"></i> Email Cloudflare:</label>
                            <input type="email" id="email" placeholder="your-email@example.com" class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition duration-150">
                        </div>
                        
                        <div class="form-group">
                            <label for="apiKey" class="block mb-2 font-semibold text-gray-700"><i class="fas fa-key mr-2"></i> Global API Key:</label>
                            <input type="password" id="apiKey" placeholder="Dapatkan dari Cloudflare Dashboard" class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition duration-150">
                        </div>
                        
                        <div class="form-group">
                            <label for="accountId" class="block mb-2 font-semibold text-gray-700"><i class="fas fa-id-badge mr-2"></i> Account ID:</label>
                            <input type="text" id="accountId" placeholder="Account ID Anda" class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition duration-150">
                        </div>
                        
                        <div class="form-group">
                            <label for="workerName" class="block mb-2 font-semibold text-gray-700"><i class="fas fa-file-signature mr-2"></i> Nama Worker:</label>
                            <input type="text" id="workerName" placeholder="nama-worker-anda" class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition duration-150">
                        </div>

                        <div class="form-group">
                            <label class="block mb-2 font-semibold text-gray-700"><i class="fas fa-cogs mr-2"></i> Format Worker:</label>
                            <div class="flex items-center space-x-4">
                                <label class="flex items-center">
                                    <input type="radio" name="workerFormat" value="service-worker" class="form-radio h-4 w-4 text-blue-600" checked>
                                    <span class="ml-2 text-gray-700">Service Worker</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="radio" name="workerFormat" value="es-module" class="form-radio h-4 w-4 text-blue-600">
                                    <span class="ml-2 text-gray-700">ES Module</span>
                                </label>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="fileInput" class="block mb-2 font-semibold text-gray-700"><i class="fas fa-file-code mr-2"></i> Pilih File JavaScript:</label>
                            <div class="file-input-container">
                                <input type="file" id="fileInput" class="file-input hidden" accept=".js,.javascript" onchange="handleFileSelect(this.files)">
                                <label for="fileInput" class="file-input-label inline-block w-full p-3 bg-blue-500 text-white rounded-lg text-center cursor-pointer shadow-md hover:bg-blue-600 transition duration-200 ease-in-out transform hover:scale-[1.01]">
                                    <i class="fas fa-cloud-upload-alt mr-2"></i> Pilih File .js
                                </label>
                            </div>
                            <div class="mt-2 text-sm text-gray-500" id="fileName">Belum ada file dipilih</div>
                            <div class="mt-1 text-sm text-red-600" id="fileSizeWarning"></div>
                        </div>

                        <div class="file-list mt-4" id="fileList">
                            </div>
                    </div>
                </div>

                <div id="manual-tab-content" class="tab-content hidden">
                    <div class="space-y-5">
                        <div class="form-group">
                            <label for="emailManual" class="block mb-2 font-semibold text-gray-700"><i class="fas fa-envelope mr-2"></i> Email Cloudflare:</label>
                            <input type="email" id="emailManual" placeholder="your-email@example.com" class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition duration-150">
                        </div>
                        
                        <div class="form-group">
                            <label for="apiKeyManual" class="block mb-2 font-semibold text-gray-700"><i class="fas fa-key mr-2"></i> Global API Key:</label>
                            <input type="password" id="apiKeyManual" placeholder="Dapatkan dari Cloudflare Dashboard" class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition duration-150">
                        </div>
                        
                        <div class="form-group">
                            <label for="accountIdManual" class="block mb-2 font-semibold text-gray-700"><i class="fas fa-id-badge mr-2"></i> Account ID:</label>
                            <input type="text" id="accountIdManual" placeholder="Account ID Anda" class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition duration-150">
                        </div>
                        
                        <div class="form-group">
                            <label for="workerNameManual" class="block mb-2 font-semibold text-gray-700"><i class="fas fa-file-signature mr-2"></i> Nama Worker:</label>
                            <input type="text" id="workerNameManual" placeholder="nama-worker-anda" class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition duration-150">
                        </div>

                        <div class="form-group">
                            <label class="block mb-2 font-semibold text-gray-700"><i class="fas fa-cogs mr-2"></i> Format Worker:</label>
                            <div class="flex items-center space-x-4">
                                <label class="flex items-center">
                                    <input type="radio" name="workerFormatManual" value="service-worker" class="form-radio h-4 w-4 text-blue-600" checked>
                                    <span class="ml-2 text-gray-700">Service Worker</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="radio" name="workerFormatManual" value="es-module" class="form-radio h-4 w-4 text-blue-600">
                                    <span class="ml-2 text-gray-700">ES Module</span>
                                </label>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="workerScriptManual" class="block mb-2 font-semibold text-gray-700"><i class="fas fa-terminal mr-2"></i> Script Worker:</label>
                            <textarea id="workerScriptManual" rows="15" class="w-full p-3 border-2 border-gray-300 rounded-lg font-mono text-sm focus:border-blue-500 focus:ring-blue-500 transition duration-150">// Cloudflare Worker Script
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
                </div>
                
                <div class="btn-group flex flex-wrap gap-4 mt-8">
                    <button class="flex-1 min-w-[120px] py-3 px-5 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition duration-200 ease-in-out transform hover:-translate-y-0.5" onclick="deployWorker()">
                        <i class="fas fa-rocket mr-2"></i> Deploy Worker
                    </button>
                    <button class="flex-1 min-w-[120px] py-3 px-5 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-200 ease-in-out transform hover:-translate-y-0.5" onclick="listWorkers()">
                        <i class="fas fa-list-alt mr-2"></i> List Workers
                    </button>
                    <button class="flex-1 min-w-[120px] py-3 px-5 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 transition duration-200 ease-in-out transform hover:-translate-y-0.5" onclick="deleteWorker()">
                        <i class="fas fa-trash-alt mr-2"></i> Delete Worker
                    </button>
                    <button class="flex-1 min-w-[120px] py-3 px-5 bg-gray-500 text-white font-bold rounded-lg shadow-md hover:bg-gray-600 transition duration-200 ease-in-out transform hover:-translate-y-0.5" onclick="clearForm()">
                        <i class="fas fa-eraser mr-2"></i> Clear
                    </button>
                </div>
                
                <div id="result" class="result mt-6 p-4 rounded-lg hidden font-mono text-sm max-h-96 overflow-y-auto whitespace-pre-wrap"></div>
            </div>
            
            <div class="preview-section bg-gray-800 p-6 rounded-lg shadow-inner">
                <h3 class="text-xl font-semibold mb-4 text-white"><i class="fas fa-eye mr-2"></i> Preview Script</h3>
                <div class="worker-preview bg-gray-900 text-green-300 p-4 rounded-lg font-mono text-xs h-96 overflow-y-auto">
                    // Pilih file atau ketik script untuk preview
                </div>
                <div class="mt-4 text-xs text-gray-400">
                    <strong class="text-white"><i class="fas fa-info-circle mr-1"></i> Format yang didukung:</strong> File JavaScript (.js) dengan Service Worker syntax
                </div>
            </div>
        </div>
        
        <div class="credits text-center p-5 text-gray-500 text-sm border-t border-gray-200">
            <i class="fas fa-code mr-1"></i> Cloudflare Worker File Uploader • Upload script dari file lokal
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
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLMDJqLz0EOWZ+hLp-G4vA4Y0zF/C1L/a8kI4tC4e2v9t4s0gN3gD5o5l/W2Bw5p+Q==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    
    <style>
        /* Custom styles to handle specific elements not covered by utility classes */
        /* Scrollbar styles for preview/result boxes */
        .worker-preview::-webkit-scrollbar, .result::-webkit-scrollbar {
            width: 8px;
        }
        .worker-preview::-webkit-scrollbar-thumb, .result::-webkit-scrollbar-thumb {
            background-color: #60a5fa; /* blue-400 */
            border-radius: 4px;
        }
        .worker-preview::-webkit-scrollbar-track, .result::-webkit-scrollbar-track {
            background: #e5e7eb; /* gray-200 */
        }
        .result a {
            color: #166534; /* dark green for links */
            text-decoration: underline;
        }
        .result.error a {
            color: #b91c1c; /* dark red for error links */
        }
        /* Custom file input appearance workaround for cross-browser compatibility */
        .file-input-label {
            transition: background-color 0.3s, transform 0.3s;
        }
        .file-input-label:hover {
            transform: translateY(-1px);
        }
    </style>
</head>
<body class="min-h-screen p-5 bg-gradient-to-br from-indigo-500 to-purple-600">
    <div class="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
        <div class="header bg-gradient-to-r from-gray-800 to-blue-900 text-white p-8 text-center">
            <h1 class="text-3xl font-extrabold mb-2 flex items-center justify-center">
                <i class="fas fa-cloud-upload-alt mr-3"></i> Cloudflare Worker File Uploader
            </h1>
            <p class="opacity-90 text-lg">Deploy script Worker dari file JavaScript atau input manual</p>
        </div>
        
        
        <div class="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="form-section bg-gray-50 p-6 rounded-lg border border-gray-200">
                
                <div class="tab-container mb-6">
                    <div class="flex border-b-2 border-gray-200">
                        <div id="tab-upload" class="tab px-5 py-3 cursor-pointer border-b-2 border-transparent transition duration-300 text-gray-600 hover:text-blue-600 active-tab" onclick="switchTab('upload')">
                            <i class="fas fa-upload mr-2"></i> Upload File
                        </div>
                        <div id="tab-manual" class="tab px-5 py-3 cursor-pointer border-b-2 border-transparent transition duration-300 text-gray-600 hover:text-blue-600" onclick="switchTab('manual')">
                            <i class="fas fa-keyboard mr-2"></i> Manual Input
                        </div>
                    </div>
                </div>

                <div id="upload-tab-content" class="tab-content active-content">
                    <div class="space-y-5">
                        <div class="form-group">
                            <label for="email" class="block mb-2 font-semibold text-gray-700"><i class="fas fa-envelope mr-2"></i> Email Cloudflare:</label>
                            <input type="email" id="email" placeholder="your-email@example.com" class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition duration-150">
                        </div>
                        
                        <div class="form-group">
                            <label for="apiKey" class="block mb-2 font-semibold text-gray-700"><i class="fas fa-key mr-2"></i> Global API Key:</label>
                            <input type="password" id="apiKey" placeholder="Dapatkan dari Cloudflare Dashboard" class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition duration-150">
                        </div>
                        
                        <div class="form-group">
                            <label for="accountId" class="block mb-2 font-semibold text-gray-700"><i class="fas fa-id-badge mr-2"></i> Account ID:</label>
                            <input type="text" id="accountId" placeholder="Account ID Anda" class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition duration-150">
                        </div>
                        
                        <div class="form-group">
                            <label for="workerName" class="block mb-2 font-semibold text-gray-700"><i class="fas fa-file-signature mr-2"></i> Nama Worker:</label>
                            <input type="text" id="workerName" placeholder="nama-worker-anda" class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition duration-150">
                        </div>

                        <div class="form-group">
                            <label class="block mb-2 font-semibold text-gray-700"><i class="fas fa-cogs mr-2"></i> Format Worker:</label>
                            <div class="flex items-center space-x-4">
                                <label class="flex items-center">
                                    <input type="radio" name="workerFormat" value="service-worker" class="form-radio h-4 w-4 text-blue-600" checked>
                                    <span class="ml-2 text-gray-700">Service Worker</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="radio" name="workerFormat" value="es-module" class="form-radio h-4 w-4 text-blue-600">
                                    <span class="ml-2 text-gray-700">ES Module</span>
                                </label>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="fileInput" class="block mb-2 font-semibold text-gray-700"><i class="fas fa-file-code mr-2"></i> Pilih File JavaScript:</label>
                            <div class="file-input-container">
                                <input type="file" id="fileInput" class="file-input hidden" accept=".js,.javascript" onchange="handleFileSelect(this.files)">
                                <label for="fileInput" class="file-input-label inline-block w-full p-3 bg-blue-500 text-white rounded-lg text-center cursor-pointer shadow-md hover:bg-blue-600 transition duration-200 ease-in-out transform hover:scale-[1.01]">
                                    <i class="fas fa-cloud-upload-alt mr-2"></i> Pilih File .js
                                </label>
                            </div>
                            <div class="mt-2 text-sm text-gray-500" id="fileName">Belum ada file dipilih</div>
                            <div class="mt-1 text-sm text-red-600" id="fileSizeWarning"></div>
                        </div>

                        <div class="file-list mt-4" id="fileList">
                            </div>
                    </div>
                </div>

                <div id="manual-tab-content" class="tab-content hidden">
                    <div class="space-y-5">
                        <div class="form-group">
                            <label for="emailManual" class="block mb-2 font-semibold text-gray-700"><i class="fas fa-envelope mr-2"></i> Email Cloudflare:</label>
                            <input type="email" id="emailManual" placeholder="your-email@example.com" class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition duration-150">
                        </div>
                        
                        <div class="form-group">
                            <label for="apiKeyManual" class="block mb-2 font-semibold text-gray-700"><i class="fas fa-key mr-2"></i> Global API Key:</label>
                            <input type="password" id="apiKeyManual" placeholder="Dapatkan dari Cloudflare Dashboard" class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition duration-150">
                        </div>
                        
                        <div class="form-group">
                            <label for="accountIdManual" class="block mb-2 font-semibold text-gray-700"><i class="fas fa-id-badge mr-2"></i> Account ID:</label>
                            <input type="text" id="accountIdManual" placeholder="Account ID Anda" class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition duration-150">
                        </div>
                        
                        <div class="form-group">
                            <label for="workerNameManual" class="block mb-2 font-semibold text-gray-700"><i class="fas fa-file-signature mr-2"></i> Nama Worker:</label>
                            <input type="text" id="workerNameManual" placeholder="nama-worker-anda" class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition duration-150">
                        </div>

                        <div class="form-group">
                            <label class="block mb-2 font-semibold text-gray-700"><i class="fas fa-cogs mr-2"></i> Format Worker:</label>
                            <div class="flex items-center space-x-4">
                                <label class="flex items-center">
                                    <input type="radio" name="workerFormatManual" value="service-worker" class="form-radio h-4 w-4 text-blue-600" checked>
                                    <span class="ml-2 text-gray-700">Service Worker</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="radio" name="workerFormatManual" value="es-module" class="form-radio h-4 w-4 text-blue-600">
                                    <span class="ml-2 text-gray-700">ES Module</span>
                                </label>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="workerScriptManual" class="block mb-2 font-semibold text-gray-700"><i class="fas fa-terminal mr-2"></i> Script Worker:</label>
                            <textarea id="workerScriptManual" rows="15" class="w-full p-3 border-2 border-gray-300 rounded-lg font-mono text-sm focus:border-blue-500 focus:ring-blue-500 transition duration-150">// Cloudflare Worker Script
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
                </div>
                
                <div class="btn-group flex flex-wrap gap-4 mt-8">
                    <button class="flex-1 min-w-[120px] py-3 px-5 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition duration-200 ease-in-out transform hover:-translate-y-0.5" onclick="deployWorker()">
                        <i class="fas fa-rocket mr-2"></i> Deploy Worker
                    </button>
                    <button class="flex-1 min-w-[120px] py-3 px-5 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-200 ease-in-out transform hover:-translate-y-0.5" onclick="listWorkers()">
                        <i class="fas fa-list-alt mr-2"></i> List Workers
                    </button>
                    <button class="flex-1 min-w-[120px] py-3 px-5 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 transition duration-200 ease-in-out transform hover:-translate-y-0.5" onclick="deleteWorker()">
                        <i class="fas fa-trash-alt mr-2"></i> Delete Worker
                    </button>
                    <button class="flex-1 min-w-[120px] py-3 px-5 bg-gray-500 text-white font-bold rounded-lg shadow-md hover:bg-gray-600 transition duration-200 ease-in-out transform hover:-translate-y-0.5" onclick="clearForm()">
                        <i class="fas fa-eraser mr-2"></i> Clear
                    </button>
                </div>
                
                <div id="result" class="result mt-6 p-4 rounded-lg hidden font-mono text-sm max-h-96 overflow-y-auto whitespace-pre-wrap"></div>
            </div>
            
            <div class="preview-section bg-gray-800 p-6 rounded-lg shadow-inner">
                <h3 class="text-xl font-semibold mb-4 text-white"><i class="fas fa-eye mr-2"></i> Preview Script</h3>
                <div class="worker-preview bg-gray-900 text-green-300 p-4 rounded-lg font-mono text-xs h-96 overflow-y-auto">
                    // Pilih file atau ketik script untuk preview
                </div>
                <div class="mt-4 text-xs text-gray-400">
                    <strong class="text-white"><i class="fas fa-info-circle mr-1"></i> Format yang didukung:</strong> File JavaScript (.js) dengan Service Worker syntax
                </div>
            </div>
        </div>
        
        <div class="credits text-center p-5 text-gray-500 text-sm border-t border-gray-200">
            <i class="fas fa-code mr-1"></i> Cloudflare Worker File Uploader • Upload script dari file lokal
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
            const fileSizeWarningElement = document.getElementById('fileSizeWarning');
            
            fileNameElement.textContent = file.name;
            
            if (file.size > 1024 * 1024) { // 1MB
                fileSizeWarningElement.textContent = '⚠️ Peringatan: Ukuran file melebihi 1MB. Cloudflare mungkin menolak skrip yang lebih besar dari 1MB.';
            } else {
                fileSizeWarningElement.textContent = '';
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                currentFileContent = e.target.result;
                document.querySelector('.worker-preview').textContent = currentFileContent;
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
                    workerScript: currentFileContent,
                    workerFormat: document.querySelector('input[name="workerFormat"]:checked').value
                };
            } else {
                return {
                    email: document.getElementById('emailManual').value,
                    apiKey: document.getElementById('apiKeyManual').value,
                    accountId: document.getElementById('accountIdManual').value,
                    workerName: document.getElementById('workerNameManual').value,
                    workerScript: document.getElementById('workerScriptManual').value,
                    workerFormat: document.querySelector('input[name="workerFormatManual"]:checked').value
                };
            }
        }

        async function deployWorker() {
            const credentials = getCurrentCredentials();
            const { email, apiKey, accountId, workerName, workerScript, workerFormat } = credentials;

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
                        workerScript: workerScript,
                        workerFormat: workerFormat
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
    const { accountId, workerName, workerScript, workerFormat } = await request.json()
    const email = request.headers.get('X-Auth-Email')
    const apiKey = request.headers.get('X-Auth-Key')

    if (!email || !apiKey || !accountId || !workerName || !workerScript || !workerFormat) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields or headers'
      }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      })
    }

    let response;
    if (workerFormat === 'es-module') {
      const formData = new FormData();
      formData.append('metadata', JSON.stringify({ main_module: 'index.js' }));
      formData.append('index.js', new Blob([workerScript], { type: 'application/javascript+module' }), 'index.js');
      
      response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${workerName}`,
        {
          method: 'PUT',
          headers: {
            'X-Auth-Email': email,
            'X-Auth-Key': apiKey,
          },
          body: formData
        }
      );
    } else { // service-worker
      response = await fetch(
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
      );
    }

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
