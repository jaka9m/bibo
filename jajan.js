<script>
const horse = "dHJvamFu"; // "horse"
const flash = "dmxlc3M="; // "flash"
const v3 = "djJyYXk="; // ""
const neko = "Y2xhc2g="; // "neko"
const mlash = "dm1lc3M="; // "mlash"
const babi = "Z3JwYw=="; // "bab"

    // Fungsi SPA Navigasi Client-Side
    const mainContentContainer = document.getElementById('main-content-container');
    const navButtonsContainer = document.getElementById('nav-buttons-container');
    
    async function renderContentFromPath(path, pushState = true) {
        // Tampilkan loading spinner
        $('#cover-spin').show();

        if (pushState) {
            history.pushState(null, '', path);
        }

        try {
            const url = new URL(path, window.location.origin);
            const response = await fetch(url.toString(), {
                headers: {
                    // Tanda ke Worker bahwa ini adalah permintaan SPA (JSON)
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (response.ok) {
                const data = await response.json();

                // Hapus script lama
                const oldScript = document.getElementById('slide-script');
                if (oldScript) oldScript.remove();

                // Suntikkan konten baru dan tombol navigasi
                mainContentContainer.innerHTML = data.content;
                navButtonsContainer.innerHTML = data.navButtons;
                document.title = data.title;

                // Jalankan script yang terkait
                if (data.extraScript) {
                    const newScript = document.createElement('script');
                    newScript.id = 'slide-script';
                    newScript.textContent = data.extraScript;
                    document.body.appendChild(newScript);
                }
            } else {
                console.error('Failed to fetch content for SPA. Status:', response.status);
                // Fallback: full refresh jika gagal (opsional)
                // window.location.href = path;
            }
        } catch (e) {
            console.error('Error during SPA fetch/render:', e);
        } finally {
            // Sembunyikan loading spinner
            $('#cover-spin').hide();
        }
    }

    function navigateTo(path, pushState = true) {
      renderContentFromPath(path, pushState);
    }

    // Tangani tombol back/forward browser
    window.addEventListener('popstate', (event) => {
        // Saat popstate terjadi, render konten untuk path saat ini tanpa pushState
        navigateTo(window.location.pathname + window.location.search, false);
    });

    // --- Helper Copy & Download (Sama seperti sebelumnya) ---
    function copyToClipboard(text, element) {
      navigator.clipboard.writeText(text).then(() => {
          // Salin berhasil
      }).catch(err => {
          console.error('Failed to copy text: ', err);
          const textarea = document.createElement('textarea');
          textarea.value = text;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
      });

      if (element) {
        element.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.5), inset 0 1px 5px rgba(0, 0, 0, 0.6)';
        element.style.transform = 'translateY(1px)';

        setTimeout(() => {
          element.style.boxShadow = '';
          element.style.transform = 'translateY(0)';
        }, 300);
      }
    }

    function downloadConfig() {
        const configData = document.getElementById('result-output').value;
        const format = document.getElementById('format-select').value;

        if (!configData.trim() || configData.startsWith('❌ Gagal:')) {
            console.error('Tidak ada config valid untuk diunduh.');
            return;
        }

        let filename = 'config_converter';
        let mimeType = 'text/plain';

        if (format === '${neko}' || format === '${neko}-provider') {
            filename += '.yaml';
            mimeType = 'text/yaml';
        } else {
            filename += '.txt';
        }

        const blob = new Blob([configData], { type: mimeType });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Inject semua parser dan generator yang terpakai
    const convertLink = function convertLink(linksInput, format) {
    const linkArray = linksInput.split('\\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && (line.startsWith('${flash}://') || line.startsWith('${mlash}://') || line.startsWith('${horse}://') || line.startsWith('ss://')));

    if (linkArray.length === 0) {
        return '❌ Gagal: Tidak ada link ${flash}, ${mlash}, ${horse}, atau sosok yang valid ditemukan.';
    }

    const successfulConversions = [];

    for (const link of linkArray) {
        try {
            let d;
            const decodedLink = tryUrlDecode(link);

            if (decodedLink.startsWith('${flash}://')) d = parse${flash}Uri(decodedLink);
            else if (decodedLink.startsWith('${mlash}://')) d = parse${mlash}Uri(decodedLink);
            else if (decodedLink.startsWith('${horse}://')) d = parse${horse}Uri(decodedLink);
            else if (decodedLink.startsWith('ss://')) d = parsesosokUri(decodedLink);
            else continue;

            successfulConversions.push(mapFields(d));

        } catch (e) {
            console.error(\`Error parsing link: \${link}\`, e);
        }
    }

    if (successfulConversions.length === 0) {
        return '❌ Gagal: Semua link yang dimasukkan tidak valid atau gagal di-parse.';
    }

    if (format === '${neko}') return generate${neko}Metaprxs(successfulConversions);
    if (format === '${neko}-provider') return generate${neko}Providerprxs(successfulConversions);

    return 'Format konversi tidak valid.';
};
    const parse${flash}Uri = function parse${flash}Uri(uri) {
  const u = new URL(uri);
  const network = u.searchParams.get('type') || 'tcp';

  const path = tryUrlDecode(u.searchParams.get('path') || '/');
  const serviceName = tryUrlDecode(u.searchParams.get('serviceName') || '');
  const host = u.searchParams.get('host') || u.searchParams.get('sni') || u.hostname;

  return {
    protocol: '${flash}',
    remark: decodeURIComponent(u.hash.substring(1)) || '${flash}',
    server: u.hostname,
    port: parseInt(u.port, 10),
    password: decodeURIComponent(u.username),
    network: network,
    security: u.searchParams.get('security') || 'none',
    sni: u.searchParams.get('sni') || u.searchParams.get('host') || u.hostname,
    host: host,
    path: path,
    serviceName: serviceName || (network === '${babi}' ? path : ''),
  };
};
    const parse${mlash}Uri = function parse${mlash}Uri(uri){
  const base64Part = uri.substring('${mlash}://'.length).trim();
  const decodedStr = atob(base64Part);
  const decoded = JSON.parse(decodedStr);

  const network = decoded.net || 'tcp';
  const path = decoded.path || '/';

  return {
      protocol: '${mlash}',
      remark: decoded.ps || '${mlash}',
      server: decoded.add,
      port: parseInt(decoded.port, 10),
      password: decoded.id,
      alterId: parseInt(decoded.aid, 10) || 0,
      network: network,
      security: decoded.tls === 'tls' ? 'tls' : 'none',
      sni: decoded.sni || decoded.host || decoded.add,
      host: decoded.host || decoded.sni || decoded.add,
      path: path,
      serviceName: decoded.serviceName || (network === '${babi}' ? path : ''),
  };
};
    const parse${horse}Uri = function parse${horse}Uri(uri) {
  const u = new URL(uri);
  const network = u.searchParams.get('type') || 'tcp';

  const path = tryUrlDecode(u.searchParams.get('path') || '/');
  const serviceName = tryUrlDecode(u.searchParams.get('serviceName') || '');
  const host = u.searchParams.get('host') || u.searchParams.get('sni') || u.hostname;

  return {
    protocol: '${horse}',
    remark: decodeURIComponent(u.hash.substring(1)) || '${horse}',
    server: u.hostname,
    port: parseInt(u.port, 10),
    password: decodeURIComponent(u.username),
    network: network,
    security: u.searchParams.get('security') || 'tls',
    sni: u.searchParams.get('sni') || u.searchParams.get('host') || u.hostname,
    host: host,
    path: path,
    serviceName: serviceName || (network === '${babi}' ? path : ''),
  };
};
    const parsesosokUri = function parsesosokUri(uri) {
  const parts = uri.substring('ss://'.length).split('#');
  const remark = decodeURIComponent(parts[1] || 'sosok');
  const corePart = parts[0];

  const pluginMatch = corePart.match(/@(.+?)\\/\\/?plugin=(.*)/);
  let userServerPort, pluginData = {};
  let pluginExists = false;

  if (pluginMatch) {
      const userInfoBase64 = corePart.substring(0, pluginMatch.index);
      userServerPort = atob(userInfoBase64);

      const pluginRaw = tryUrlDecode(pluginMatch[2]);

      const params = pluginRaw.split(';');
      params.forEach(param => {
          if (param === 'tls') pluginData.security = 'tls';
          else if (param.startsWith('host=')) pluginData.host = param.substring(5);
          else if (param.startsWith('path=')) pluginData.path = param.substring(5);
      });
      pluginData.plugin = '${v3}-plugin';
      pluginExists = true;
  } else {
      userServerPort = atob(corePart);
  }

  const [userInfo, serverPort] = userServerPort.split('@');
  const [method, password] = userInfo.split(':');
  const [server, port] = serverPort.split(':');

  return {
    protocol: 'ss',
    remark: remark,
    server: server,
    port: parseInt(port, 10),
    password: password,
    method: method,
    network: pluginExists ? 'ws' : 'tcp',
    plugin: pluginData.plugin,
    security: pluginData.security || 'none',
    sni: pluginData.host || server,
    host: pluginData.host || server,
    path: pluginData.path || '/',
    serviceName: '',
  };
};
    const generate${neko}Metaprxs = function generate${neko}Metaprxs(fieldsList) {
    let prxConfigs = [];
    let prxNames = []; // Digunakan untuk mengisi grup BEST-PING

    for (const fields of fieldsList) {
        let transportOpts = '';

        if (fields.network === 'ws') {
            transportOpts = \`  ws-opts:\\n    path: \${fields.path}\\n    headers:\\n      Host: \${fields.host}\`;
        } else if (fields.network === '${babi}') {
            transportOpts = \`  ${babi}-opts:\\n    ${babi}-service-name: \${fields.serviceName || ''}\`;
        }

        let prx = '';
        // Ubah format penamaan untuk keamanan dan konsistensi di YAML
        const safeRemark = fields.remark.replace(/[^\\w\\s-]/g, '_').trim();

        if (fields.protocol === '${flash}' || fields.protocol === '${mlash}') {
            prx =
\`- name: \${safeRemark}\\n  server: \${fields.server}\\n  port: \${fields.port}\\n  type: \${fields.protocol}\\n  \${fields.protocol === '${flash}' ? \`uuid: \${fields.uuid}\` : \`uuid: \${fields.uuid}\\\\n  alterId: \${fields.alterId}\`}\\n  cipher: auto\\n  tls: \${fields.security === 'tls'}\\n  udp: true\\n  skip-cert-verify: true\\n  network: \${fields.network}\\n  servername: \${fields.sni}\\n\${transportOpts}\`;
        } else if (fields.protocol === '${horse}') {
            prx =
\`- name: \${safeRemark}\\n  server: \${fields.server}\\n  port: \${fields.port}\\n  type: ${horse}\\n  password: \${fields.password}\\n  network: \${fields.network}\\n  tls: \${fields.security === 'tls'}\\n  skip-cert-verify: true\\n  servername: \${fields.sni}\\n\${transportOpts}\`;
        } else if (fields.protocol === 'ss') {
            prx =
\`- name: \${safeRemark}\\n  server: \${fields.server}\\n  port: \${fields.port}\\n  type: ss\\n  cipher: \${fields.method}\\n  password: \${fields.password}\\n  plugin: \${fields.plugin || '${v3}-plugin'}\\n  plugin-opts:\\n    mode: websocket\\n    host: \${fields.host}\\n    path: \${fields.path}\\n    tls: \${fields.security === 'tls'}\\n    skip-cert-verify: true\\n    servername: \${fields.sni}\`;
        } else {
            prx = \`# Error: Protokol \${fields.protocol} tidak didukung oleh ${neko} Meta.\`;
        }

        prxConfigs.push(prx);
        prxNames.push(\`  - \${safeRemark}\`); // Tambahkan nama prx ke daftar untuk BEST-PING
    }

    const prxListJoined = prxConfigs.join('\\n');
    const prxNamesJoined = prxNames.join('\\n');

    // TEMPLATE ${neko}.js
    const template = \`port: 7890\\nsocks-port: 7891\\nredir-port: 7892\\nmixed-port: 7893\\ntprx-port: 7895\\nipv6: false\\nmode: rule\\nlog-level: silent\\nallow-lan: true\\nexternal-controller: 0.0.0.0:9090\\nsecret: ""\\nbind-address: "*_\\nunified-delay: true\\nprofile:\\n  store-selected: true\\n  store-fake-ip: true\\ndns:\\n  enable: true\\n  ipv6: false\\n  use-host: true\\n  enhanced-mode: fake-ip\\n  listen: 0.0.0.0:7874\\n  prx-server-nameserver:\\n    - 112.215.203.246\\n    - 112.215.203.247\\n    - 112.215.203.248\\n    - 112.215.203.254\\n    - 112.215.198.248\\n    - 112.215.198.254\\n  nameserver:\\n    - 1.1.1.1\\n    - 8.8.8.8\\n    - 1.0.0.1\\n  fallback:\\n    - 9.9.9.9\\n    - 149.112.112.112\\n    - 208.67.222.222\\n  fake-ip-range: 198.18.0.1/16\\n  fake-ip-filter:\\n    - "*.lan"\\n    - "*.localdomain"\\n    - "*.example"\\n    - "*.invalid"\\n    - "*.localhost"\\n    - "*.test"\\n    - "*.local"\\n    - "*.home.arpa"\\n    - time.*.com\\n    - time.*.gov\\n    - time.*.edu.cn\\n    - time.*.apple.com\\n    - time1.*.com\\n    - time2.*.com\\n    - time3.*.com\\n    - time4.*.com\\n    - time5.*.com\\n    - time6.*.com\\n    - time7.*.com\\n    - ntp.*.com\\n    - ntp1.*.com\\n    - ntp2.*.com\\n    - ntp3.*.com\\n    - ntp4.*.com\\n    - ntp5.*.com\\n    - ntp6.*.com\\n    - ntp7.*.com\\n    - "*.time.edu.cn"\\n    - "*.ntp.org.cn"\\n    - +.pool.ntp.org\\n    - time1.cloud.tencent.com\\n    - music.163.com\\n    - "*.music.163.com"\\n    - "*.126.net"\\n    - musicapi.taihe.com\\n    - music.taihe.com\\n    - songsearch.kugou.com\\n    - trackercdn.kugou.com\\n    - "*.kuwo.cn"\\n    - api-jooxtt.sanook.com\\n    - api.joox.com\\n    - joox.com\\n    - y.qq.com\\n    - "*.y.qq.com"\\n    - streamoc.music.tc.qq.com\\n    - mobileoc.music.tc.qq.com\\n    - isure.stream.qqmusic.qq.com\\n    - dl.stream.qqmusic.qq.com\\n    - aqqmusic.tc.qq.com\\n    - amobile.music.tc.qq.com\\n    - "*.xiami.com"\\n    - "*.music.migu.cn"\\n    - music.migu.cn\\n    - "*.msftconnecttest.com"\\n    - "*.msftncsi.com"\\n    - msftconnecttest.com\\n    - msftncsi.com\\n    - localhost.ptlogin2.qq.com\\n    - localhost.sec.qq.com\\n    - +.srv.nintendo.net\\n    - +.stun.playstation.net\\n    - xbox.*.microsoft.com\\n    - xnotify.xboxlive.com\\n    - +.battlenet.com.cn\\n    - +.wotgame.cn\\n    - +.wggames.cn\\n    - +.wowsgame.cn\\n    - +.wargaming.net\\n    - prx.golang.org\\n    - stun.*.*\\n    - stun.*.*.*\\n    - +.stun.*.*\\n    - +.stun.*.*.*\\n    - +.stun.*.*.*.*\\n    - heartbeat.belkin.com\\n    - "*.linksys.com"\\n    - "*.linksyssmartwifi.com"\\n    - "*.router.asus.com"\\n    - mesu.apple.com\\n    - swscan.apple.com\\n    - swquery.apple.com\\n    - swdownload.apple.com\\n    - swcdn.apple.com\\n    - swdist.apple.com\\n    - lens.l.google.com\\n    - stun.l.google.com\\n    - +.nflxvideo.net\\n    - "*.square-enix.com"\\n    - "*.finalfantasyxiv.com"\\n    - "*.ffxiv.com"\\n    - "*.mcdn.bilivideo.cn"\\n    - +.media.dssott.com\\nprxs:\\n\${prxNamesJoined}\\n\\nprx-groups:\\n- name: INTERNET\\n  type: select\\n  disable-udp: false\\n  prxs:\\n    - DIRECT\\n    - REJECT\\n    - BEST-PING\\n  url: http://www.gstatic.com/generate_204\\n  interval: 120\\n\\n- name: BEST-PING\\n  type: url-test\\n  url: http://www.gstatic.com/generate_204\\n  interval: 120\\n  prxs:\\n    - DIRECT\\n    - REJECT\\n\${prxNamesJoined}\\n\\nrule-providers:\\n  rule_hijacking:\\n    type: file\\n    behavior: classical\\n    path: ./rule_provider/rule_hijacking.yaml\\n    url: https://raw.githubusercontent.com/malikshi/open_${neko}/main/rule_provider/rule_hijacking.yaml\\n  rule_privacy:\\n    type: file\\n    behavior: classical\\n    url: https://raw.githubusercontent.com/malikshi/open_${neko}/main/rule_provider/rule_privacy.yaml\\n    path: ./rule_provider/rule_privacy.yaml\\n  rule_basicads:\\n    type: file\\n    behavior: domain\\n    url: https://raw.githubusercontent.com/malikshi/open_${neko}/main/rule_provider/rule_basicads.yaml\\n    path: ./rule_provider/rule_basicads.yaml\\n  rule_personalads:\\n    type: file\\n    behavior: classical\\n    url: https://raw.githubusercontent.com/malikshi/open_${neko}/main/rule_provider/rule_personalads.yaml\\n    path: ./rule_provider/rule_personalads.yaml\\n\\nrules:\\n- IP-CIDR,198.18.0.1/16,REJECT,no-resolve\\n- RULE-SET,rule_personalads,REJECT  # Langsung REJECT untuk memblokir iklan\\n- RULE-SET,rule_basicads,REJECT     # Langsung REJECT untuk memblokir iklan\\n- RULE-SET,rule_hijacking,REJECT    # Langsung REJECT untuk memblokir\\n- RULE-SET,rule_privacy,REJECT      # Langsung REJECT untuk memblokir\\n- MATCH,INTERNET\`;

    return template;
};
    const generate${neko}Providerprxs = function generate${neko}Providerprxs(fieldsList) {
    let prxConfigs = [];

    for (const fields of fieldsList) {
        let transportOpts = '';

        // Indentasi untuk ws-opts/${babi}-opts harus ditambah 2 spasi dari indentasi prx utamanya.
        if (fields.network === 'ws') {
            transportOpts = \`    ws-opts:\\n      path: \${fields.path}\\n      headers:\\n        Host: \${fields.host}\`;
        } else if (fields.network === '${babi}') {
            transportOpts = \`    ${babi}-opts:\\n      ${babi}-service-name: \${fields.serviceName || ''}\`;
        }

        let prx = '';
        // Ubah format penamaan untuk keamanan dan konsistensi di YAML
        const safeRemark = fields.remark.replace(/[^\\w\\s-]/g, '_').trim();

        // Setiap prx dimulai dengan dua spasi
        if (fields.protocol === '${flash}' || fields.protocol === '${mlash}') {
            prx =
\`  - name: \${safeRemark}\\n    server: \${fields.server}\\n    port: \${fields.port}\\n    type: \${fields.protocol}\\n    \${fields.protocol === '${flash}' ? \`uuid: \${fields.uuid}\` : \`uuid: \${fields.uuid}\\\\n    alterId: \${fields.alterId}\`}\\n    cipher: auto\\n    tls: \${fields.security === 'tls'}\\n    udp: true\\n    skip-cert-verify: true\\n    network: \${fields.network}\\n    servername: \${fields.sni}\\n\${transportOpts}\`;
        } else if (fields.protocol === '${horse}') {
            prx =
\`  - name: \${safeRemark}\\n    server: \${fields.server}\\n    port: \${fields.port}\\n    type: ${horse}\\n    password: \${fields.password}\\n    network: \${fields.network}\\n    tls: \${fields.security === 'tls'}\\n    skip-cert-verify: true\\n    servername: \${fields.sni}\\n\${transportOpts}\`;
        } else if (fields.protocol === 'ss') {
            // Indentasi plugin-opts juga harus disesuaikan
            prx =
\`  - name: \${safeRemark}\\n    server: \${fields.server}\\n    port: \${fields.port}\\n    type: ss\\n    cipher: \${fields.method}\\n    password: \${fields.password}\\n    plugin: \${fields.plugin || '${v3}-plugin'}\\n    plugin-opts:\\n      mode: websocket\\n      host: \${fields.host}\\n      path: \${fields.path}\\n      tls: \${fields.security === 'tls'}\\n      skip-cert-verify: true\\n      servername: \${fields.sni}\`;
        } else {
            prx = \`  # Error: Protokol \${fields.protocol} tidak didukung oleh ${neko} Meta.\`;
        }

        prxConfigs.push(prx);
    }

    const prxListJoined = prxConfigs.join('\\n');

    // Prefix 'prxs:' tanpa indentasi
    return \`prxs:\\n\${prxListJoined}\`;
};
    const mapFields = function mapFields(d) {
  const pass = d.password;

  return {
    protocol: d.protocol,
    remark: d.remark,
    server: d.server,
    port: d.port,
    password: pass,
    uuid: d.protocol === '${flash}' || d.protocol === '${mlash}' ? pass : undefined,
    alterId: d.alterId,
    method: d.method,
    network: d.network,
    security: d.security,
    sni: d.sni,
    host: d.host,
    path: d.path,
    plugin: d.plugin,
    serviceName: d.serviceName,
  };
};
    const tryUrlDecode = function tryUrlDecode(s = '') {
  try { return /%[0-9A-Fa-f]{2}/.test(s) ? decodeURIComponent(s) : s; }
  catch { return s; }
};

        document.getElementById('convert-button').addEventListener('click', function() {
            const linkInput = document.getElementById('link-input').value;
            const format = document.getElementById('format-select').value;
            const resultOutput = document.getElementById('result-output');

            if (!linkInput.trim()) {
                console.error('Link tidak boleh kosong.');
                resultOutput.value = '❌ Gagal: Link tidak boleh kosong.';
                return;
            }

            const converted = convertLink(linkInput, format);

            if (converted.startsWith('❌ Gagal:') || converted.startsWith('Error:')) {
                resultOutput.value = converted;
            } else {
                resultOutput.value = converted;
            }
        });


        </script>
