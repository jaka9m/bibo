// Untuk kemudahan Anda, berikut adalah daftar lengkap variabel lingkungan yang perlu Anda atur di dasbor Cloudflare Worker Anda:

// ROOT_DOMAIN
// SERVICE_NAME
// API_KEY
// API_EMAIL
// ACCOUNT_ID
// ZONE_ID
// OWNER_PASSWORD
// CLOUDFLARE_API_TOKEN

import { connect } from "cloudflare:sockets";

const proxyListURL = 'https://raw.githubusercontent.com/jaka2m/botak/refs/heads/main/cek/proxyList.txt';
const namaWeb = 'GEO PROJECT'
const telegrambot = 'https://t.me/VLTRSSbot'
const channelku = 'https://t.me/testikuy_mang'
const telegramku = 'https://geoproject.biz.id/circle-flags/telegram.png'
const whatsappku = 'https://geoproject.biz.id/circle-flags/whatsapp.png'
const ope = 'https://geoproject.biz.id/circle-flags/options.png'

// Variables
const wildcards = [];

// CloudflareApi Class
class CloudflareApi {
  constructor(env) {
    this.env = env;
    this.bearer = `Bearer ${this.env.API_KEY}`;
    
    this.headers = {
      Authorization: this.bearer,
      "X-Auth-Email": this.env.API_EMAIL,
      "X-Auth-Key": this.env.API_KEY,
      "Content-Type": "application/json",
    };
  }

  async getDomainList() {
    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${this.env.ACCOUNT_ID}/workers/domains`;
      const res = await fetch(url, {
        headers: this.headers,
      });

      if (res.status == 200) {
        const respJson = await res.json();
        return respJson.result.filter((data) => data.service == this.env.SERVICE_NAME);
      }
      return [];
    } catch (e) {
      console.error('Error getting domain list:', e);
      return [];
    }
  }

  async registerDomain(domain) {
    try {
      domain = domain.toLowerCase();
      const suffix = `.${this.env.SERVICE_NAME}.${this.env.ROOT_DOMAIN}`;
      let fullDomain = domain;

      // If the user-provided domain doesn't already end with the suffix, append it.
      if (!domain.endsWith(suffix)) {
        fullDomain = domain + suffix;
      }

      const registeredDomains = await this.getDomainList();

      if (registeredDomains.some(d => d.hostname === fullDomain)) {
        return 409; // Conflict
      }

      const url = `https://api.cloudflare.com/client/v4/accounts/${this.env.ACCOUNT_ID}/workers/domains`;
      const res = await fetch(url, {
        method: "PUT",
        body: JSON.stringify({
          environment: "production",
          hostname: fullDomain,
          service: this.env.SERVICE_NAME,
          zone_id: this.env.ZONE_ID,
        }),
        headers: this.headers,
      });

      return res.status;
    } catch (e) {
      console.error('Error registering domain:', e);
      return 500;
    }
  }

  async deleteDomain(domainId) {
    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${this.env.ACCOUNT_ID}/workers/domains/${domainId}`;
      const res = await fetch(url, {
        method: "DELETE",
        headers: this.headers,
      });
      return res.status;
    } catch (e) {
      console.error('Error deleting domain:', e);
      return 500;
    }
  }
}

// Global Variables
let cachedProxyList = [];
let pathinfo = "/Free-VPN-CF-Geo-Project/";

// Constants
const SIDEBAR_COMPONENT = `
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <style>
        .sidebar {
            font-family: 'Poppins', sans-serif;
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
            background: transparent;
            box-shadow: none;
            border-right: none;
        }

        .sidebar-open {
            transform: translateX(0);
        }

        .sidebar-closed {
            transform: translateX(-100%);
        }

        .menu-item {
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
            border-radius: 12px;
            margin-bottom: 6px;
            background: transparent;
        }

        .menu-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            transition: left 0.6s;
        }

        .menu-item:hover::before {
            left: 100%;
        }

        .menu-item:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateX(6px);
        }

        .menu-icon {
            transition: all 0.3s ease;
        }

        .menu-item:hover .menu-icon {
            transform: scale(1.1);
        }

        .overlay {
            transition: opacity 0.3s ease;
        }

        .logo-text {
            background: linear-gradient(90deg, #60a5fa, #3b82f6, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            background-size: 200% auto;
            animation: shimmer 3s infinite linear;
        }

        @keyframes shimmer {
            0% {
                background-position: 0% center;
            }
            50% {
                background-position: 100% center;
            }
            100% {
                background-position: 0% center;
            }
        }

        .active-indicator {
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 3px;
            height: 0;
            background: linear-gradient(to bottom, #60a5fa, #3b82f6);
            border-radius: 0 4px 4px 0;
            transition: height 0.4s ease;
        }

        .menu-item:hover .active-indicator {
            height: 60%;
        }

        .menu-item.active .active-indicator {
            height: 60%;
        }

        .menu-item.active {
            background: rgba(255, 255, 255, 0.15);
        }

        .profile-image {
            filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
            transition: all 0.3s ease;
        }

        .profile-image:hover {
            transform: scale(1.05);
            filter: drop-shadow(0 6px 8px rgba(0, 0, 0, 0.4));
        }

        .menu-badge {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: linear-gradient(90deg, #ef4444, #dc2626);
            color: white;
            font-size: 0.6rem;
            padding: 1px 6px;
            border-radius: 8px;
        }

        .floating-button {
            box-shadow: 0 6px 15px rgba(37, 99, 235, 0.4);
            transition: all 0.3s ease;
        }

        .floating-button:hover {
            box-shadow: 0 10px 20px rgba(37, 99, 235, 0.6);
            transform: translateY(-2px);
        }

        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            position: absolute;
            bottom: 0;
            right: 0;
            border: 2px solid transparent;
        }
    </style>
    <div x-data="{ sidebarOpen: false, activeMenu: 'create', showSearch: ['/web', '/'].includes(window.location.pathname) }" @keydown.escape.window="sidebarOpen = false" class="relative">
        <script>
            function toggleDarkMode() {
                if (document.documentElement.classList.contains('dark')) {
                    document.documentElement.classList.remove('dark');
                    localStorage.setItem('theme', 'light');
                } else {
                    document.documentElement.classList.add('dark');
                    localStorage.setItem('theme', 'dark');
                }
            }
        </script>
        <button
            @click="sidebarOpen = true"
            class="floating-button fixed top-6 left-6 z-50 p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white focus:outline-none"
        >
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>

        <div
            x-show="sidebarOpen"
            @click="sidebarOpen = false"
            class="overlay fixed inset-0 bg-black bg-opacity-40 z-40 backdrop-blur-sm"
            x-transition:enter="transition ease-out duration-300"
            x-transition:enter-start="opacity-0"
            x-transition:enter-end="opacity-100"
            x-transition:leave="transition ease-in duration-200"
            x-transition:leave-start="opacity-100"
            x-transition:leave-end="opacity-0"
        ></div>

        <div
            :class="{'sidebar-open': sidebarOpen, 'sidebar-closed': !sidebarOpen}"
            class="sidebar fixed top-0 left-0 h-full w-72 p-5 z-50 transform -translate-x-full"
            x-transition:enter="transition ease-out duration-300"
            x-transition:enter-start="transform -translate-x-full"
            x-transition:enter-end="transform translate-x-0"
            x-transition:leave="transition ease-in duration-200"
            x-transition:leave-start="transform translate-x-0"
            x-transition:leave-end="transform -translate-x-full"
        >
            <div class="flex justify-between items-center mb-8 pt-2">
                <div class="flex items-center">
                    <div class="relative mr-3">
                        <img
                            src="https://geoproject.biz.id/circle-flags/bote.png"
                            alt="Profile"
                            class="profile-image w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                        >
                        <div class="status-dot bg-green-500"></div>
                    </div>
                    <div>
                        <h2 class="text-xl font-bold logo-text">VPN Manager</h2>
                        <p class="text-xs text-white opacity-80 mt-1">Secure Connection</p>
                    </div>
                </div>
                <button
                    @click="sidebarOpen = false"
                    class="p-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 bg-opacity-70 hover:bg-opacity-100 transition-all duration-200 focus:outline-none hover:rotate-90 border border-white border-opacity-30"
                >
                    <svg class="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <nav class="space-y-1">
                <div x-show="showSearch" class="search-quantum flex flex-col items-center mb-4">
                    <div class="flex w-full items-center gap-2.5">
                        <input
                            type="text"
                            id="search-bar"
                            placeholder="Search..."
                            class="flex-1 h-10 pl-3 border-2 border-white border-opacity-30 rounded-lg bg-transparent text-white font-medium outline-none transition-all duration-300 focus:border-blue-400 focus:placeholder-white focus:placeholder-opacity-70 placeholder-white placeholder-opacity-50"
                        >
                        <button id="search-button" class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-full p-2 transition-colors duration-200 shadow-lg z-50">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-5 w-5 text-white">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                        </button>
                    </div>
                </div>
                <a
                    href="/web"
                    class="menu-item flex items-center py-3 px-3 relative"
                    :class="{'active': activeMenu === 'create'}"
                    @click="activeMenu = 'create'"
                >
                    <div class="active-indicator"></div>
                    <div class="w-9 h-9 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mr-3 shadow-md">
                        <svg class="h-5 w-5 menu-icon text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                    </div>
                    <div class="flex-1">
                        <div class="font-medium text-sm text-white">Create VPN</div>
                        <div class="text-xs text-white opacity-80 mt-0.5">Create a new VPN connection</div>
                    </div>
                    <span class="menu-badge">New</span>
                </a>

                <a
                    href="/vpn"
                    class="menu-item flex items-center py-3 px-3 relative"
                    :class="{'active': activeMenu === 'converter'}"
                    @click="activeMenu = 'converter'"
                >
                    <div class="active-indicator"></div>
                    <div class="w-9 h-9 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mr-3 shadow-md">
                        <svg class="h-5 w-5 menu-icon text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                        </svg>
                    </div>
                    <div class="flex-1">
                        <div class="font-medium text-sm text-white">Subscription</div>
                        <div class="text-xs text-white opacity-80 mt-0.5">Configuration Conversion</div>
                    </div>
                </a>

                <a
                    href="/kuota"
                    class="menu-item flex items-center py-3 px-3 relative"
                    :class="{'active': activeMenu === 'quota'}"
                    @click="activeMenu = 'quota'"
                >
                    <div class="active-indicator"></div>
                    <div class="w-9 h-9 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center mr-3 shadow-md">
                        <svg class="h-5 w-5 menu-icon text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                    <div class="flex-1">
                        <div class="font-medium text-sm text-white">Check Quota</div>
                        <div class="text-xs text-white opacity-80 mt-0.5">Monitor data usage simcard XL</div>
                    </div>
                </a>

                <a
                    href="/checker"
                    class="menu-item flex items-center py-3 px-3 relative"
                    :class="{'active': activeMenu === 'checker'}"
                    @click="activeMenu = 'checker'"
                >
                    <div class="active-indicator"></div>
                    <div class="w-9 h-9 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-3 shadow-md">
                        <svg class="h-5 w-5 menu-icon text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                    </div>
                    <div class="flex-1">
                        <div class="font-medium text-sm text-white">IP checker</div>
                        <div class="text-xs text-white opacity-80 mt-0.5">IP address information</div>
                    </div>
                </a>
            </nav>
            
            <a
    href="/stats"
    class="menu-item flex items-center py-3 px-3 relative"
    :class="{'active': activeMenu === 'traffic'}"
    @click="activeMenu = 'traffic'"
>
    <div class="active-indicator"></div>
    <div class="w-9 h-9 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-3 shadow-md">
        <svg class="h-5 w-5 menu-icon text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    </div>
    <div class="flex-1">
        <div class="font-medium text-sm text-white">Usage Report</div>
        <div class="text-xs text-white opacity-80 mt-0.5">Monitor last 24 hours usage report</div>
    </div>
</a>

            <div class="absolute bottom-5 left-5 right-5">
                <div class="border-t border-white border-opacity-30 pt-3">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <div class="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
                                <span class="text-white text-sm font-semibold">G</span>
                            </div>
                            <div class="ml-2">
                                <div class="font-medium text-sm text-white">GEO PROJECT</div>
                                <div class="text-xs text-white opacity-80">Premium Member</div>
                            </div>
                        </div>
                        <button onclick="toggleDarkMode()"
        class="fixed bottom-4 right-4 bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 rounded-full border-2 border-gray-900 p-2 transition-colors duration-200 shadow-lg z-50"
        title="Toggle Dark Mode">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;

const WS_READY_STATE_OPEN = 1;
const WS_READY_STATE_CLOSING = 2;

async function getProxyList(forceReload = false) {
  if (!cachedProxyList.length || forceReload) {
    if (!proxyListURL) {
      throw new Error("No Proxy List URL Provided!");
    }

    const proxyBank = await fetch(proxyListURL);
    if (proxyBank.status === 200) {
      const proxyString = ((await proxyBank.text()) || "").split("\n").filter(Boolean);
      cachedProxyList = proxyString
        .map((entry) => {
          const [proxyIP, proxyPort, country, org] = entry.split(",");
          return {
            proxyIP: proxyIP || "Unknown",
            proxyPort: proxyPort || "Unknown",
            country: country.toUpperCase() || "Unknown",
            org: org || "Unknown Org",
          };
        })
        .filter(Boolean);
    }
  }

  return cachedProxyList;
}

async function reverseProxy(request, target) {
  const targetUrl = new URL(request.url);
  targetUrl.hostname = target;

  const modifiedRequest = new Request(targetUrl, request);
  modifiedRequest.headers.set("X-Forwarded-Host", request.headers.get("Host"));

  const response = await fetch(modifiedRequest);
  const newResponse = new Response(response.body, response);
  newResponse.headers.set("X-Proxied-By", "Cloudflare Worker");

  return newResponse;
}

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);

      // API for wildcard management
      if (url.pathname.startsWith('/api/v1/domains')) {
        const cfApi = new CloudflareApi(env);

        if (request.method === 'GET') {
          const domains = await cfApi.getDomainList();
          return new Response(JSON.stringify(domains), {
            headers: { 'Content-Type': 'application/json' },
          });
        }

        if (request.method === 'POST') {
          try {
            const { domain } = await request.json();
            if (!domain) {
              return new Response('Domain is required', { status: 400 });
            }
            const status = await cfApi.registerDomain(domain);
            return new Response(null, { status });
          } catch (e) {
            return new Response('Invalid JSON', { status: 400 });
          }
        }

        if (request.method === 'DELETE') {
          try {
            const { id, password } = await request.json();
            if (!id) {
              return new Response('Domain ID is required', { status: 400 });
            }
            if (password !== env.OWNER_PASSWORD) {
                return new Response('Invalid password', { status: 401 });
            }
            const status = await cfApi.deleteDomain(id);
            return new Response(null, { status });
          } catch (e) {
            return new Response('Invalid JSON', { status: 400 });
          }
        }

        return new Response('Method Not Allowed', { status: 405 });
      }

      const myurl = "geovpn.vercel.app";
      const upgradeHeader = request.headers.get("Upgrade");
      const CHECK_API_BASE = `https://${myurl}`;
      const CHECK_API = `${CHECK_API_BASE}/check?ip=`;
      
      // Handle IP check
      if (url.pathname === "/geo-ip") {
        const ip = url.searchParams.get("ip");

        if (!ip) {
          return new Response("IP parameter is required", { status: 400 });
        }

        // Call external API using CHECK_API
        const apiResponse = await fetch(`${CHECK_API}${ip}`);
        if (!apiResponse.ok) {
          return new Response("Failed to fetch IP information", { status: apiResponse.status });
        }

        const data = await apiResponse.json();
        return new Response(JSON.stringify(data), {
          headers: { "Content-Type": "application/json" },
        });
      }      

     const proxyState = new Map();

async function updateProxies() {
  const proxies = await getProxyList(env);
  console.log("Proxy list updated (getProxyList called).");
}

ctx.waitUntil(
  (async function periodicUpdate() {
    await updateProxies();
  })()
);

if (upgradeHeader === "websocket") {
  const allMatch = url.pathname.match(/^\/Free-VPN-CF-Geo-Project\/ALL(\d*)$/);

  if (allMatch) {
    const indexStr = allMatch[1]; 
    const index = indexStr ? parseInt(indexStr) - 1 : Math.floor(Math.random() * 10000);

    console.log(`ALL Proxy Request. Index Requested: ${indexStr ? index + 1 : 'Random'}`);

    const allProxies = await getProxyList(env);

    if (allProxies.length === 0) {
      return new Response(`No proxies available globally.`, { status: 404 });
    }

    const selectedProxy = allProxies[index % allProxies.length];

    if (!selectedProxy) {
      return new Response(`Proxy with index ${index + 1} not found in global list. Max available: ${allProxies.length}`, { status: 404 });
    }

    const proxyIP = `${selectedProxy.proxyIP}:${selectedProxy.proxyPort}`;
    console.log(`Selected ALL Proxy: ${proxyIP}`);
    return await websockerHandler(request, proxyIP);
  }

  const countryMatch = url.pathname.match(/^\/Free-VPN-CF-Geo-Project\/([A-Z]{2})(\d*)$/);
  if (countryMatch) {
    const baseCountryCode = countryMatch[1];
    const indexStr = countryMatch[2];
    const index = indexStr ? parseInt(indexStr) - 1 : 0;

    console.log(`Base Country Code Request: ${baseCountryCode}, Index Requested: ${index + 1}`);

    const allProxies = await getProxyList(env);
    const filteredProxiesForCountry = allProxies.filter((proxy) => proxy.country === baseCountryCode);

    if (filteredProxiesForCountry.length === 0) {
      return new Response(`No proxies available for country: ${baseCountryCode}`, { status: 404 });
    }

    const selectedProxy = filteredProxiesForCountry[index % filteredProxiesForCountry.length];

    if (!selectedProxy) {
      return new Response(`Proxy with index ${index + 1} not found for country: ${baseCountryCode}. Max available: ${filteredProxiesForCountry.length}`, { status: 404 });
    }

    const proxyIP = `${selectedProxy.proxyIP}:${selectedProxy.proxyPort}`;
    console.log(`Selected Proxy: ${proxyIP} for ${baseCountryCode}${indexStr}`);
    return await websockerHandler(request, proxyIP);
  }

  // Handle direct IP:PORT proxy requests
  const ipPortMatch = url.pathname.match(/^\/Free-VPN-CF-Geo-Project\/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})[=:-](\d+)$/);
  if (ipPortMatch) {
    const proxyIP = `${ipPortMatch[1]}:${ipPortMatch[2]}`;
    console.log(`Direct Proxy IP: ${proxyIP}`);
    return await websockerHandler(request, proxyIP);
  }
}

      const geovpn = url.hostname;
      const type = url.searchParams.get('type') || 'mix';
      const tls = url.searchParams.get('tls') !== 'false';
      const wildcard = url.searchParams.get('wildcard') === 'true';
      const bugs = url.searchParams.get('bug') || geovpn;
      const geo81 = wildcard ? `${bugs}.${geovpn}` : geovpn;
      const country = url.searchParams.get('country');
      const limit = parseInt(url.searchParams.get('limit'), 10); // Ambil nilai limit
      let configs;

      switch (url.pathname) {
        case '/vpn/clash':
          configs = await generateClashSub(type, bugs, geo81, tls, country, limit);
          break;
        case '/vpn/surfboard':
          configs = await generateSurfboardSub(type, bugs, geo81, tls, country, limit);
          break;
        case '/vpn/singbox':
          configs = await generateSingboxSub(type, bugs, geo81, tls, country, limit);
          break;
        case '/vpn/husi':
          configs = await generateHusiSub(type, bugs, geo81, tls, country, limit);
          break;
        case '/vpn/nekobox':
          configs = await generateNekoboxSub(type, bugs, geo81, tls, country, limit);
          break;
        case '/vpn/v2rayng':
          configs = await generateV2rayngSub(type, bugs, geo81, tls, country, limit);
          break;
        case '/vpn/v2ray':
          configs = await generateV2raySub(type, bugs, geo81, tls, country, limit);
          break;
        case "/web":
          return await handleWebRequest(request, env);
          break;
        case "/":
          return await handleWebRequest(request, env);
          break;
        case "/vpn":
          return new Response(await handleSubRequest(url.hostname), { headers: { 'Content-Type': 'text/html' } });

          break;
case "/checker":
  return new Response(await mamangenerateHTML(), {
    headers: { "Content-Type": "text/html" },
  });
  break;
case "/checker/check":
  const paramss = url.searchParams;
  return await handleCheck(paramss);
  break;
case "/kuota":
    return new Response(await handleKuotaRequest(), {
        headers: { "Content-Type": "text/html" },
    });
    break;
case "/stats":
    return await handleStatsRequest(env);
}

return new Response(configs);
} catch (err) {
  return new Response(`An error occurred: ${err.toString()}`, {
    status: 500,
  });
}
},
};

async function handleCheck(paramss) {
  const ipPort = paramss.get("ip");

  if (!ipPort) {
    return new Response("Parameter 'ip' diperlukan dalam format ip:port", {
      status: 400,
    });
  }

  const [ip, port] = ipPort.split(":");
  if (!ip || !port) {
    return new Response("Format IP:PORT tidak valid", { status: 400 });
  }

  const apiUrl = `https://geovpn.vercel.app/check?ip=${ip}:${port}`;

  try {
    const apiResponse = await fetch(apiUrl);
    
    const result = await apiResponse.json();

    const responseData = {
      proxy: result.proxy || "Unknown",
      ip: result.ip || "Unknown",
      port: Number.isNaN(parseInt(port, 10)) ? "Unknown" : parseInt(port, 10),
      delay: result.delay || "Unknown",
      countryCode: result.countryCode || "Unknown",
      country: result.country || "Unknown",
      flag: result.flag || "🏳️",
      city: result.city || "Unknown",
      timezone: result.timezone || "Unknown",
      latitude: result.latitude ?? null,
      longitude: result.longitude ?? null,
      asn: result.asn ?? null,
      colo: result.colo || "Unknown",
      isp: result.isp || "Unknown",
      region: result.region || "Unknown",
      regionName: result.regionName || "Unknown",
      org: result.org || "Unknown",
      clientTcpRtt: result.clientTcpRtt ?? null,
      httpProtocol: result.httpProtocol || "Unknown",
      tlsCipher: result.tlsCipher || "Unknown",
      continent: result.continent || "Unknown",
      tlsVersion: result.tlsVersion || "Unknown",
      postalCode: result.postalCode || "Unknown",
      regionCode: result.regionCode || "Unknown",
      asOrganization: result.asOrganization || "Unknown",
      status: result.status === "ACTIVE" ? "✅ Aktif" : "😭",
    };

    return new Response(JSON.stringify(responseData, null, 2), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorData = {
      proxy: "Unknown",
      ip: ip || "Unknown",
      status: "DEAD",
      delay: "0 ms",
      countryCode: "Unknown",
      country: "Unknown 🏳️",
      flag: "🏳️",
      city: "Unknown",
      timezone: "Unknown",
      latitude: "Unknown",
      longitude: "Unknown",
      asn: 0,
      colo: "Unknown",
      isp: "Unknown",
      region: "Unknown",
      regionName: "Unknown",
      org: "Unknown",
      clientTcpRtt: 0,
      httpProtocol: "Unknown",
      tlsCipher: "Unknown",
      continent: "Unknown",
      tlsVersion: "Unknown",
      postalCode: "Unknown",
      regionCode: "Unknown",
      asOrganization: "Unknown",
      message: `${ip}:${port} - ❌ DEAD`,
    };

    return new Response(JSON.stringify(errorData, null, 2), {
      headers: { "Content-Type": "application/json" },
    });
  }
}

function mamangenerateHTML() {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Proxy Checker</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Rajdhani:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #00ff88;
      --secondary: #00ffff;
      --accent: #ff00ff;
      --dark: #080c14;
      --darker: #040608;
      --light: #e0ffff;
      --card-bg: rgba(8, 12, 20, 0.95);
      --glow: 0 0 20px rgba(0, 255, 136, 0.3);
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Space Grotesk', sans-serif;
    }

    body {
      background: #000;
      color: var(--light);
      min-height: 100vh;
      overflow-x: hidden;
      position: relative;
    }

    /* Matrix Background */
    #matrix {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      opacity: 0.7;
    }

    /* Header */
    header {
      background: linear-gradient(90deg, rgba(8, 12, 20, 0.9), rgba(0, 255, 136, 0.1), rgba(8, 12, 20, 0.9));
      padding: 15px 0;
      text-align: center;
      position: relative;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
      border-bottom: 1px solid rgba(0, 255, 136, 0.3);
    }

    h1 {
      font-family: 'Rajdhani', sans-serif;
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: 700;
      background: linear-gradient(45deg, var(--primary), var(--secondary), var(--accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 30px rgba(0, 255, 136, 0.5);
      position: relative;
      animation: titlePulse 3s ease-in-out infinite;
    }

    @keyframes titlePulse {
      0%, 100% { transform: scale(1); filter: brightness(1); }
      50% { transform: scale(1.02); filter: brightness(1.2); }
    }

    /* Main Container */
    .container {
      width: 90%;
      max-width: 800px;
      margin: 100px auto 80px;
      background: var(--card-bg);
      padding: 25px;
      border-radius: 15px;
      box-shadow: var(--glow), 0 5px 25px rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(0, 255, 136, 0.2);
      position: relative;
      z-index: 1;
    }

    /* Input Section */
    .input-container {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    .input-container input {
      flex: 1;
      padding: 12px 15px;
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(0, 255, 136, 0.3);
      border-radius: 8px;
      color: var(--light);
      font-size: 16px;
      transition: all 0.3s ease;
    }

    .input-container input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
    }

    .input-container input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    /* Buttons */
    button {
      padding: 12px 25px;
      background: linear-gradient(45deg, var(--primary), var(--secondary));
      color: var(--dark);
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    }

    button:hover:enabled {
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(0, 255, 136, 0.4);
    }

    button:disabled {
      background: #555;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    /* Loading Animation */
    #loading {
      display: none;
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      margin: 20px 0;
      background: linear-gradient(90deg, red, orange, yellow, green, blue, purple);
      background-size: 200%;
      color: transparent;
      -webkit-background-clip: text;
      animation: moveColors 5s linear infinite;
    }

    @keyframes moveColors {
      0% { background-position: 200%; }
      100% { background-position: -200%; }
    }

    /* Results Table */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 25px 0;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    th, td {
      padding: 14px 15px;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    th {
      background: rgba(0, 255, 136, 0.1);
      font-weight: 600;
      color: var(--primary);
    }

    tr:nth-child(even) {
      background: rgba(255, 255, 255, 0.03);
    }

    tr:hover {
      background: rgba(0, 255, 136, 0.05);
    }

    /* Map */
    #map {
      height: 350px;
      width: 100%;
      margin-top: 25px;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    }

    /* Sidebar Navigation */
    .navbar {
      position: fixed;
      top: 50%;
      left: -80px;
      transform: translateY(-50%);
      width: 80px;
      background: rgba(8, 12, 20, 0.9);
      padding: 15px 0;
      transition: left 0.3s ease-in-out;
      z-index: 1000;
      border-radius: 0 10px 10px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(0, 255, 136, 0.2);
    }

    .navbar.show {
      left: 0;
    }

    .navbar a {
      display: block;
      color: white;
      text-decoration: none;
      transition: all 0.3s ease;
      padding: 8px;
      border-radius: 5px;
    }

    .navbar a:hover {
      background: rgba(0, 255, 136, 0.2);
      transform: scale(1.1);
    }

    .navbar a img {
      width: 35px;
      height: 35px;
      filter: brightness(0.9);
      transition: all 0.3s ease;
    }

    .navbar a:hover img {
      filter: brightness(1.2);
    }

    /* Toggle Button */
    .toggle-btn {
      position: absolute;
      top: 50%;
      right: -30px;
      transform: translateY(-50%);
      background: rgba(8, 12, 20, 0.9);
      border: 1px solid rgba(0, 255, 136, 0.2);
      border-left: none;
      cursor: pointer;
      z-index: 1001;
      padding: 10px 5px;
      border-radius: 0 10px 10px 0;
      transition: right 0.3s ease-in-out;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    }

    .toggle-btn img {
      width: 20px;
      height: 20px;
      transition: transform 0.3s ease;
    }

    .navbar.show .toggle-btn {
      right: -30px;
    }

    .navbar.show .toggle-btn img {
      transform: rotate(180deg);
    }

    /* Footer */
    footer {
      background: linear-gradient(90deg, rgba(8, 12, 20, 0.9), rgba(0, 255, 136, 0.1), rgba(8, 12, 20, 0.9));
      padding: 15px 0;
      text-align: center;
      position: relative;
      box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.5);
      border-top: 1px solid rgba(0, 255, 136, 0.3);
    }

    h2 {
      font-family: 'Rajdhani', sans-serif;
      font-size: clamp(1rem, 3vw, 1.5rem);
      font-weight: 500;
      color: var(--light);
      opacity: 0.8;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .container {
        width: 95%;
        margin: 90px auto 70px;
        padding: 20px;
      }
      
      .input-container {
        flex-direction: column;
      }
      
      table {
        font-size: 14px;
      }
      
      th, td {
        padding: 10px 12px;
      }
      
      #map {
        height: 300px;
      }
    }

    @media (max-width: 480px) {
      .container {
        padding: 15px;
      }
      
      table {
        font-size: 12px;
      }
      
      th, td {
        padding: 8px 10px;
      }
      
      #map {
        height: 250px;
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>Proxy Checker</h1>
  </header>

  <!-- Matrix Background -->
  <canvas id="matrix"></canvas>

  <!-- Sidebar Navigation -->
  <div class="navbar" id="navbar">
    <div class="toggle-btn" id="menu-btn" onclick="toggleNavbar()">
      <img src="https://geoproject.biz.id/social/buka.png" alt="Toggle Menu">
    </div>
    <div class="navbar-content">
      <a href="https://wa.me/6282339191527" target="_blank" rel="noopener noreferrer" title="WhatsApp">
        <img src="https://geoproject.biz.id/social/mobile.png" alt="WhatsApp">
      </a>
      <a href="/vpn" target="_self" rel="noopener noreferrer" title="VPN">
        <img src="https://geoproject.biz.id/social/linksub.png" alt="VPN">
      </a>
      <a href="/checker" target="_self" rel="noopener noreferrer" title="Checker">
        <img src="https://geoproject.biz.id/social/vpn.png" alt="Checker">
      </a>
      <a href="https://t.me/sampiiiiu" target="_blank" rel="noopener noreferrer" title="Telegram">
        <img src="https://geoproject.biz.id/social/tele.png" alt="Telegram">
      </a>
      <a href="https://t.me/VLTRSSbot" target="_blank" rel="noopener noreferrer" title="Bot">
        <img src="https://geoproject.biz.id/social/bot.png" alt="Bot">
      </a>
      <a href="/" target="_self" rel="noopener noreferrer" title="Home">
        <img src="https://geoproject.biz.id/social/home.png" alt="Home">
      </a>
    </div>
  </div>

  <!-- Main Content -->
  <div class="container">
    <div class="input-container">
      <input type="text" id="ipInput" placeholder="Input IP:Port (192.168.1.1:443)">
      <button onclick="checkProxy()">Check</button>
    </div>

    <p id="loading">Loading...</p>

    <table id="resultTable">
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Proxy</td><td>-</td></tr>
        <tr><td>ISP</td><td>-</td></tr>
        <tr><td>IP</td><td>-</td></tr>
        <tr><td>Port</td><td>-</td></tr>
        <tr><td>ASN</td><td>-</td></tr>
        <tr><td>Country</td><td>-</td></tr>
        <tr><td>City</td><td>-</td></tr>
        <tr><td>Flag</td><td>-</td></tr>
        <tr><td>Timezone</td><td>-</td></tr>
        <tr><td>Latitude</td><td>-</td></tr>
        <tr><td>Longitude</td><td>-</td></tr>
        <tr><td>Delay</td><td style="color: cyan; font-weight: bold;">-</td></tr>
        <tr><td>Status</td><td style="font-weight: bold;">-</td></tr>
      </tbody>
    </table>

    <div id="map"></div>
  </div>

  <footer>
    <h2>&copy; 2025 Proxy Checker. All rights reserved.</h2>
  </footer>
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
<script>
    function toggleNavbar() {
        const navbar = document.getElementById("navbar");
        const menuBtn = document.getElementById("menu-btn").querySelector('img');

        if (navbar.classList.contains("show")) {
            navbar.classList.remove("show");
            menuBtn.src = "https://geoproject.biz.id/social/buka.png";
        } else {
            navbar.classList.add("show");
            menuBtn.src = "https://geoproject.biz.id/social/tutup.png";
        }
    }
</script>
<div class="navbar" id="navbar">
    <div class="toggle-btn" id="menu-btn" onclick="toggleNavbar()">
        <img src="https://geoproject.biz.id/social/buka.png" alt="Toggle Menu">
    </div>
    <div class="navbarconten text-center">
        <span>
            <a href="https://wa.me/6282339191527" target="_blank" rel="noopener noreferrer">
                <img src="https://geoproject.biz.id/social/mobile.png" alt="menu" width="40" class="mt-1">
            </a>
        </span>
        <span>
            <a href="/vpn" target="_self" rel="noopener noreferrer">
                <img src="https://geoproject.biz.id/social/linksub.png" alt="menu" width="40" class="mt-1">
            </a>
        </span>
        <!-- <span>-->
        <span>
            <a href="/checker" target="_self" rel="noopener noreferrer">
                <img src="https://geoproject.biz.id/social/vpn.png" alt="menu" width="40" class="mt-1">
            </a>
        </span> 
        <span>
            <a href="https://t.me/sampiiiiu" target="_blank" rel="noopener noreferrer">
                <img src="https://geoproject.biz.id/social/tele.png" alt="menu" width="40" class="mt-1">
            </a>
        </span>
        <span>
            <a href="https://t.me/VLTRSSbot" target="_blank" rel="noopener noreferrer">
                <img src="https://geoproject.biz.id/social/bot.png" alt="menu" width="40" class="mt-1">
            </a>
        </span>
        <span>
            <a href="/" target="_self" rel="noopener noreferrer">
                <img src="https://geoproject.biz.id/social/home.png" alt="menu" width="40" class="mt-1">
            </a>
        </span>
    </div>
</div>

<script>
    // Efek Matrix di background
    const canvas = document.getElementById("matrix");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const letters = "GEO@PROJECT";
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    function drawMatrix() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0f0";
      ctx.font = fontSize + "px monospace";

      for (let i = 0; i < drops.length; i++) {
        const text = letters.charAt(Math.floor(Math.random() * letters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }
    setInterval(drawMatrix, 35);
  </script>

<script>
    let map;

    window.onload = function () {
        loadStoredData();
        initializeMap();
    };

    function loadStoredData() {
        const storedData = localStorage.getItem("proxyData");
        if (storedData) {
            updateTable(JSON.parse(storedData));
        }
    }

    function initializeMap() {
        const storedMap = localStorage.getItem("mapData");

        if (storedMap) {
            const mapData = JSON.parse(storedMap);
            initMap(mapData.latitude, mapData.longitude, mapData.zoom);
            loadStoredMarker();
        } else {
            initMap(-6.200000, 106.816666, 5);
        }
    }

    function loadStoredMarker() {
        const storedMarker = localStorage.getItem("markerData");
        if (storedMarker) {
            const markerData = JSON.parse(storedMarker);
            addMarkerToMap(markerData.latitude, markerData.longitude, markerData.data);
        }
    }

    async function checkProxy() {
        const ipPort = document.getElementById("ipInput").value.trim();

        if (!ipPort) {
            Swal.fire({
                icon: 'warning',
                title: 'Peringatan!',
                text: 'Masukkan IP:Port terlebih dahulu!',
                confirmButtonText: 'OK',
                background: '#000',
                color: '#00FF00',
                iconColor: '#00FF00',
                confirmButtonColor: '#4CAF50'
            });
            return;
        }

        document.getElementById("loading").style.display = "block";

        try {
            const response = await fetch("/checker/check?ip=" + encodeURIComponent(ipPort));
            const data = await response.json();

            localStorage.setItem("proxyData", JSON.stringify(data));
            updateTable(data);
            if (data.latitude && data.longitude) updateMap(data.latitude, data.longitude, data);
        } catch (error) {
            console.error("Error fetching proxy data:", error);
        } finally {
            document.getElementById("loading").style.display = "none";
        }
    }

    function updateTable(data) {
        const tbody = document.getElementById("resultTable").querySelector("tbody");

        tbody.querySelectorAll("tr").forEach(function (row) {
            const key = row.querySelector("td").textContent.toLowerCase();
            row.querySelectorAll("td")[1].textContent = data[key] || "-";
        });
    }

    function initMap(lat, lon, zoom) {
    map = L.map('map').setView([lat, lon], zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">Geo Project</a> IP CF Checker'
    }).addTo(map);
}

function updateMap(lat, lon, data) {
    if (!map) {
        initMap(lat, lon, 7);
    } else {
        map.setView([lat, lon], 7);
        
        // Hapus semua marker sebelum menambahkan yang baru
        map.eachLayer(function (layer) {
            if (layer instanceof L.Marker) map.removeLayer(layer);
        });
    }

    addMarkerToMap(lat, lon, data);
    saveMapData(lat, lon, 7, data.proxy, data.isp, data.asn);
}

function saveMapData(lat, lon, zoom, proxy = null, isp = null, asn = null) {
    localStorage.setItem("mapData", JSON.stringify({ 
        latitude: lat, 
        longitude: lon, 
        zoom: zoom 
    }));

    const markerData = { latitude: lat, longitude: lon };
    if (proxy || isp || asn) {
        markerData.data = { proxy, isp, asn };
    }

    localStorage.setItem("markerData", JSON.stringify(markerData));
}

function addMarkerToMap(lat, lon, data) {
    var icon1 = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/252/252025.png',
        iconSize: [35, 35],
        iconAnchor: [15, 35],
        popupAnchor: [0, -30]
    });

    var icon2 = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/252/252031.png',
        iconSize: [35, 35],
        iconAnchor: [20, 40],
        popupAnchor: [0, -35]
    });

    var marker = L.marker([lat, lon], { icon: icon1 }).addTo(map)
        .bindPopup("<b>📍 Lokasi</b><br>" +
            "<b>Proxy:</b> " + (data.proxy || '-') + "<br>" +
            "<b>ISP:</b> " + (data.isp || '-') + "<br>" +
            "<b>ASN:</b> " + (data.asn || '-') + "<br>" +
            "<b>Latitude:</b> " + lat + "<br>" +
            "<b>Longitude:</b> " + lon)
        .openPopup();

    let isIcon1 = true;
    let intervalId = setInterval(() => {
        if (!map.hasLayer(marker)) {
            clearInterval(intervalId);
            return;
        }
        marker.setIcon(isIcon1 ? icon2 : icon1);
        isIcon1 = !isIcon1;
    }, 500);
}

</script>
</body>
</html>


`;
}

async function handleStatsRequest(env) {
  const CLOUDFLARE_API_TOKEN = env.CLOUDFLARE_API_TOKEN;
  const ZONE_ID = env.ZONE_ID;

  if (!CLOUDFLARE_API_TOKEN || !ZONE_ID) {
    return new Response("CLOUDFLARE_API_TOKEN and ZONE_ID environment variables must be set.", { status: 500, headers: { "Content-Type": "text/html" } });
  }

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  try {
    const response = await fetch("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: `query {
          viewer {
            zones(filter: { zoneTag: "${ZONE_ID}" }) {
              httpRequests1hGroups(
                limit: 24,
                orderBy: [datetime_DESC],
                filter: { datetime_geq: "${twentyFourHoursAgo}" }
              ) {
                sum {
                  bytes
                  requests
                }
                dimensions {
                  datetime
                }
              }
            }
          }
        }`
      })
    });

    const result = await response.json();
    if (!result.data || !result.data.viewer || !result.data.viewer.zones.length || !result.data.viewer.zones[0].httpRequests1hGroups) {
      throw new Error("Gagal mengambil data pemakaian atau data tidak tersedia.");
    }

    const hourlyData = result.data.viewer.zones[0].httpRequests1hGroups;

    let cardsHtml = '';
    if (hourlyData.length === 0) {
        cardsHtml = '<p class="text-center text-gray-400">Tidak ada data penggunaan untuk 24 jam terakhir.</p>';
    } else {
        hourlyData.forEach((hour) => {
            const timestamp = new Date(hour.dimensions.datetime);
            const formattedTime = timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            const totalData = (hour.sum.bytes / (1024 ** 3)).toFixed(3); // GB
            const totalRequests = hour.sum.requests.toLocaleString('id-ID');
            cardsHtml += `
                <div class="stats-card">
                    <div class="date">${formattedTime}</div>
                    <div class="data-item">
                        <span class="label">Total Data:</span>
                        <span class="value">${totalData} GB</span>
                    </div>
                    <div class="data-item">
                        <span class="label">Total Requests:</span>
                        <span class="value">${totalRequests}</span>
                    </div>
                </div>
            `;
        });
    }


    const html = `
   <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Laporan Penggunaan</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Rajdhani:wght@400;600&display=swap" rel="stylesheet">
        <style>
            :root {
                --bg-color: #0d1117;
                --card-bg: rgba(22, 27, 34, 0.8);
                --border-color: rgba(0, 255, 255, 0.2);
                --glow-color: rgba(0, 255, 255, 0.5);
                --text-color: #c9d1d9;
                --header-color: #00ffff;
                --date-color: #f0a500;
            }
            body {
                background-color: var(--bg-color);
                color: var(--text-color);
                font-family: 'Rajdhani', sans-serif;
                margin: 0;
                padding: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background-image: radial-gradient(circle at top left, rgba(0, 255, 255, 0.1) 0%, transparent 30%),
                                  radial-gradient(circle at bottom right, rgba(0, 128, 255, 0.1) 0%, transparent 30%);
            }
            .container {
                width: 100%;
                max-width: 600px;
                background-color: var(--card-bg);
                border: 1px solid var(--border-color);
                border-radius: 15px;
                padding: 25px;
                box-shadow: 0 0 25px rgba(0,0,0,0.5), 0 0 15px var(--glow-color) inset;
                backdrop-filter: blur(10px);
            }
            h1 {
                font-family: 'Orbitron', sans-serif;
                color: var(--header-color);
                text-align: center;
                font-size: 2em;
                margin-bottom: 25px;
                text-shadow: 0 0 5px var(--glow-color), 0 0 10px var(--glow-color);
                letter-spacing: 2px;
            }
            .cards-container {
                display: grid;
                gap: 15px;
            }
            .report-card {
                background-color: rgba(0,0,0,0.3);
                border-left: 5px solid var(--header-color);
                border-radius: 8px;
                padding: 15px 20px;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            .report-card:hover {
                transform: translateY(-5px) scale(1.02);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
            }
            .date {
                font-size: 1.4em;
                font-weight: 700;
                color: var(--date-color);
                margin-bottom: 10px;
            }
            .data-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 5px 0;
                font-size: 1.1em;
            }
            .label {
                color: #8b949e;
            }
            .value {
                font-weight: 600;
                color: var(--text-color);
            }
             footer {
                text-align: center;
                margin-top: 25px;
                font-size: 0.9em;
                color: #8b949e;
            }
            footer a {
                color: var(--header-color);
                text-decoration: none;
            }
            @media (max-width: 600px) {
                body { padding: 10px; }
                .container { padding: 15px; }
                h1 { font-size: 1.5em; }
            }
        </style>
    </head>
    <body>
    ${SIDEBAR_COMPONENT}
        <div class="container">
            <h1>Laporan Penggunaan</h1>
            <div class="cards-container">
                ${cardsHtml}
            </div>
            <footer>
                Powered by <a href="https://t.me/sampiiiiu" target="_blank">GEO PROJECT</a>
            </footer>
        </div>
    </body>
    </html>
    `;

    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  } catch (error) {
    const errorHtml = `
        <!DOCTYPE html>
        <html lang="id"><head><title>Error</title></head>
        <body><h1>Gagal mengambil laporan</h1><p>${error.message}</p></body></html>
    `;
    return new Response(errorHtml, { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
}

async function handleKuotaRequest() {
    return `
        <!DOCTYPE html>
<html lang="id" class="dark">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Cek Kuota XL/AXIS - Sidompul</title>

    <link rel="icon" href="https://raw.githubusercontent.com/jaka9m/vless/refs/heads/main/sidompul.jpg" type="image/jpeg">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js"></script>

    <style>
        :root {
            --primary: #3b82f6;
            --primary-dark: #1d4ed8;
            --secondary: #8b5cf6;
            --accent: #06b6d4;
            --dark-bg: #0f172a;
            --card-bg: #1e293b;
            --text-light: #f1f5f9;
            --text-gray: #94a3b8;
            --success: #10b981;
            --error: #ef4444;
            --warning: #f59e0b;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: linear-gradient(135deg, var(--dark-bg) 0%, #1e293b 100%);
            color: var(--text-light);
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            min-height: 100vh;
            position: relative;
            overflow-x: hidden;
        }

        body::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(6, 182, 212, 0.05) 0%, transparent 50%);
            z-index: -1;
        }

        .main-container {
            max-width: 500px;
            width: 100%;
            margin: 2rem auto;
            padding: 0 1rem;
        }

        .header-card {
            background: linear-gradient(135deg, var(--card-bg) 0%, rgba(30, 41, 59, 0.9) 100%);
            border-radius: 1.5rem;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            box-shadow: 
                0 10px 25px rgba(0, 0, 0, 0.3),
                0 5px 10px rgba(0, 0, 0, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.1);
            position: relative;
            overflow: hidden;
        }

        .header-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--primary), var(--secondary));
        }

        .logo-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .logo {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid var(--primary);
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
        }

        .title {
            font-size: 1.75rem;
            font-weight: 700;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-align: center;
        }

        .info-box {
            background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%);
            border-radius: 1rem;
            padding: 1.25rem;
            margin-bottom: 1.5rem;
            border: 1px solid rgba(59, 130, 246, 0.2);
            box-shadow: 
                0 5px 15px rgba(0, 0, 0, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
        }

        .info-box i {
            color: var(--accent);
            margin-right: 0.5rem;
        }

        .form-container {
            background: linear-gradient(135deg, var(--card-bg) 0%, rgba(30, 41, 59, 0.9) 100%);
            border-radius: 1.5rem;
            padding: 2rem;
            box-shadow: 
                0 10px 25px rgba(0, 0, 0, 0.3),
                0 5px 10px rgba(0, 0, 0, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.1);
            margin-bottom: 1.5rem;
        }

        .input-field {
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 0.75rem;
            padding: 1rem 1.25rem;
            color: var(--text-light);
            font-size: 1rem;
            transition: all 0.3s ease;
            width: 100%;
        }

        .input-field:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
            background: rgba(15, 23, 42, 0.9);
        }

        .input-field::placeholder {
            color: var(--text-gray);
        }

        .btn-primary {
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            border: none;
            border-radius: 0.75rem;
            padding: 1rem 1.5rem;
            color: white;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            width: 100%;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);
        }

        .btn-primary:active {
            transform: translateY(0);
        }

        .result-container {
            margin-top: 1.5rem;
        }

        .result-success {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            color: var(--success);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        .result-error {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            color: var(--error);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        footer {
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding: 1.5rem;
            margin-top: auto;
            width: 100%;
        }

        .footer-content {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            font-size: 0.9rem;
            color: var(--text-gray);
        }

        .footer-link {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--primary);
            text-decoration: none;
            transition: color 0.3s ease;
        }

        .footer-link:hover {
            color: var(--secondary);
        }

        /* Loading spinner */
        #cover-spin {
            position: fixed;
            width: 100%;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            background-color: rgba(15, 23, 42, 0.8);
            z-index: 9999;
            display: none;
            backdrop-filter: blur(5px);
        }

        .loader {
            border: 5px solid rgba(59, 130, 246, 0.3);
            border-top: 5px solid var(--primary);
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            position: absolute;
            top: 50%;
            left: 50%;
            margin-left: -25px;
            margin-top: -25px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* Notification */
        #custom-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 350px;
        }

        .notification {
            background: var(--card-bg);
            border-radius: 0.75rem;
            padding: 1rem 1.5rem;
            margin-bottom: 0.5rem;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            border-left: 4px solid var(--primary);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        }

        .notification.show {
            transform: translateX(0);
        }

        .notification i {
            font-size: 1.25rem;
        }

        .notification.success {
            border-left-color: var(--success);
        }

        .notification.error {
            border-left-color: var(--error);
        }

        .notification.warning {
            border-left-color: var(--warning);
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
            .main-container {
                padding: 0 0.75rem;
                margin: 1rem auto;
            }

            .header-card, .form-container {
                padding: 1.25rem;
                border-radius: 1rem;
            }

            .title {
                font-size: 1.5rem;
            }

            .logo {
                width: 50px;
                height: 50px;
            }

            .footer-content {
                flex-direction: column;
                gap: 0.5rem;
            }
        }

        /* Animation for form elements */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .form-container > * {
            animation: fadeIn 0.5s ease forwards;
        }

        .form-container > *:nth-child(1) { animation-delay: 0.1s; }
        .form-container > *:nth-child(2) { animation-delay: 0.2s; }
    </style>
</head>
<body class="min-h-screen flex flex-col">
    ${SIDEBAR_COMPONENT}
    
    <div id="cover-spin">
        <div class="loader"></div>
    </div>
    
    <div id="custom-notification"></div>
    
    <div class="main-container">
        <div class="header-card">
            <div class="logo-container">
                <img src="https://raw.githubusercontent.com/jaka9m/vless/refs/heads/main/sidompul.jpg" alt="Logo Sidompul" class="logo">
                <h1 class="title">Sidompul Cek Kuota XL/AXIS</h1>
            </div>
        </div>
        
        <div class="info-box">
            <i class="fa fa-info-circle"></i> 
            Gunakan layanan ini secara bijak dan hindari spam. Pastikan nomor yang dimasukkan adalah nomor XL/AXIS aktif.
        </div>
        
        <div class="form-container">
            <form id="formnya">
                <div class="mb-6">
                    <label for="msisdn" class="block font-medium mb-3 text-gray-300 text-base">
                        <i class="fa fa-mobile-alt mr-2"></i>Nomor HP XL/AXIS
                    </label>
                    <input type="number" class="input-field" id="msisdn" placeholder="Contoh: 08123456789 atau 628123456789" maxlength="16" required>
                </div>
                
                <button type="button" id="submitCekKuota" class="btn-primary">
                    <i class="fa fa-search"></i>
                    <span>Cek Kuota Sekarang</span>
                </button>
            </form>

            <div id="hasilnya" class="result-container"></div>
        </div>
    </div>

    <footer>
        <div class="footer-content">
            <span>Sumbawa Support</span>
            <a href="https://t.me/sampiiiiu" target="_blank" class="footer-link">
                <i class="fab fa-telegram"></i>
                <span>GEO PROJECT</span>
            </a>
        </div>
    </footer>

    <script>
        
        function cekKuota() {
            const msisdn = document.getElementById('msisdn').value;
            if (!msisdn) {
                console.error('Nomor tidak boleh kosong.');
                return;
            }
            
            $('#cover-spin').show();
            $.ajax({
                type: 'GET',
                url: 'https://apigw.kmsp-store.com/sidompul/v4/cek_kuota?msisdn=' + msisdn + '&isJSON=true',
                dataType: 'JSON',
                contentType: 'application/x-www-form-urlencoded',
                beforeSend: function (req) {
                    req.setRequestHeader('Authorization', 'Basic c2lkb21wdWxhcGk6YXBpZ3drbXNw');
                    req.setRequestHeader('X-API-Key', '60ef29aa-a648-4668-90ae-20951ef90c55');
                    req.setRequestHeader('X-App-Version', '4.0.0');
                },
                success: function (res) {
                    $('#cover-spin').hide();
                    $('#hasilnya').html('');
                    if (res.status) {
                        $('#hasilnya').html('<div class="result-success p-4 rounded-lg mt-4 text-center font-semibold">' + res.data.hasil + '</div>');
                    } else {
                        console.error('Gagal Cek Kuota: ' + res.message);
                        $('#hasilnya').html('<div class="result-error p-4 rounded-lg mt-4 text-center font-semibold">' + res.data.keteranganError + '</div>');
                    }
                },
                error: function () {
                    $('#cover-spin').hide();
                    console.error('Terjadi kesalahan koneksi.');
                    $('#hasilnya').html(\`<div class="result-error p-4 rounded-lg mt-4 text-center font-semibold">Terjadi kesalahan koneksi atau server tidak merespons.</div>\`);
                }
            });
        }
        
        // Pemasangan event listener setelah konten dimuat
        $(document).ready(function() {
            $('#submitCekKuota').off('click').on('click', cekKuota); 
            $('#msisdn').off('keypress').on('keypress', function (e) {
                if (e.which === 13) cekKuota();
            });
        });
        
      </script>
</body>
</html>
    `;
}

// Helper function: Group proxies by country
function groupBy(array, key) {
  return array.reduce((result, currentValue) => {
    (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
    return result;
  }, {});
}

async function handleSubRequest(hostnem) {
  const html = ` 
<html>
      <head>
      <meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Geo-VPN | VPN Tunnel | CloudFlare</title>

<link rel="icon" href="https://geoproject.biz.id/circle-flags/bote.png">

<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flag-icon-css/css/flag-icon.min.css">
<link rel="stylesheet" href="https://site-assets.fontawesome.com/releases/v6.7.1/css/all.css">

<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="https://cdn.tailwindcss.com"></script>
    <script>
        // On page load or when changing themes, best to add inline in head to avoid FOUC
        if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark')
        }
    </script>
      
    <style>
    :root {
        --color-primary: #00d4ff; /* Biru neon */
        --color-secondary: #00bfff; /* Biru lebih terang */
        --color-background: #020d1a; /* Latar belakang lebih gelap */
        --color-card: rgba(0, 212, 255, 0.1); /* Kartu dengan sedikit transparansi */
        --color-text: #e0f4f4; /* Tetap dengan teks cerah */
        --transition: all 0.3s ease;
    }

    .dark body {
        background: var(--color-background);
    }

    .dark .card {
        background: var(--color-card);
        border-color: var(--color-primary);
    }
    
    .dark .form-control {
        background: rgba(0, 212, 255, 0.05);
        border-color: rgba(0, 212, 255, 0.3);
        color: var(--color-text);
    }

    .dark .title {
        color: var(--color-primary);
    }

    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        outline: none;
    }

    body {
        display: flex;
        background: url('https://raw.githubusercontent.com/bitzblack/ip/refs/heads/main/shubham-dhage-5LQ_h5cXB6U-unsplash.jpg') no-repeat center center fixed;
        background-size: cover;
        justify-content: center;
        align-items: flex-start; /* Align items to the top */
        color: var(--color-text);
        min-height: 100vh;
        font-family: 'Arial', sans-serif;
        overflow-y: auto; /* Memungkinkan scrolling */
    }

    .container {
        width: 100%;
        max-width: 500px;
        padding: 2rem;
        max-height: 90vh; /* Batasi tinggi agar tidak melebihi viewport */
        overflow-y: auto; /* Membolehkan scroll jika konten lebih tinggi */
    }

    .card {
        background: var(--color-card);
        border-radius: 16px;
        padding: 2rem;
        box-shadow: 0 10px 30px rgba(0, 212, 255, 0.1); /* Biru neon */
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 212, 255, 0.2); /* Biru neon */
        transition: var(--transition);
    }

    .card:hover {
        box-shadow: 0 20px 60px rgba(0, 212, 255, 0.3); /* Glow lebih kuat */
    }

    .title {
        text-align: center;
        color: var(--color-primary); /* Biru neon */
        margin-bottom: 1.5rem;
        font-size: 2rem;
        font-weight: 700;
        animation: titleFadeIn 1s ease-out;
    }

    @keyframes titleFadeIn {
        0% { opacity: 0; transform: translateY(-20px); }
        100% { opacity: 1; transform: translateY(0); }
    }

    .form-group {
        margin-bottom: 1rem;
    }

    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        color: var(--color-text);
        font-weight: 500;
    }

    .form-control {
        width: 100%;
        padding: 0.75rem 1rem;
        background: rgba(0, 212, 255, 0.05); /* Biru neon */
        border: 2px solid rgba(0, 212, 255, 0.3); /* Biru neon */
        border-radius: 8px;
        color: var(--color-text);
        transition: var(--transition);
    }

    .form-control:focus {
        border-color: var(--color-secondary); /* Biru lebih terang */
        box-shadow: 0 0 8px 3px rgba(0, 255, 255, 0.7); /* Biru neon */
    }

    .btn {
        width: 100%;
        padding: 0.75rem;
        background: var(--color-primary); /* Biru neon */
        color: var(--color-background);
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: var(--transition);
        position: relative;
        overflow: hidden;
    }

    .btn::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 300%;
        height: 300%;
        background: rgba(0, 255, 255, 0.3);
        transition: all 0.4s ease;
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0);
    }

    .btn:hover::after {
        transform: translate(-50%, -50%) scale(1);
    }

    .btn:hover {
        background: var(--color-secondary); /* Biru lebih terang */
        box-shadow: 0 0 20px 10px rgba(0, 255, 255, 0.3); /* Glow saat hover */
    }

    .result {
        margin-top: 1rem;
        padding: 1rem;
        background: rgba(0, 212, 255, 0.1); /* Biru neon */
        border-radius: 8px;
        word-break: break-all;
        opacity: 0;
        animation: fadeIn 1s ease-out forwards;
    }

    @keyframes fadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
    }

    .loading {
        display: none;
        text-align: center;
        color: var(--color-primary); /* Biru neon */
        margin-top: 1rem;
    }

    .copy-btns {
        display: flex;
        justify-content: space-between;
        margin-top: 0.5rem;
    }

    .copy-btn {
        background: rgba(0, 212, 255, 0.2); /* Biru neon */
        color: var(--color-primary); /* Biru neon */
        padding: 0.5rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: var(--transition);
        position: relative;
        overflow: hidden;
    }

    .copy-btn::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 300%;
        height: 300%;
        background: rgba(0, 255, 255, 0.3);
        transition: all 0.4s ease;
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0);
    }

    .copy-btn:hover::after {
        transform: translate(-50%, -50%) scale(1);
    }

    .copy-btn:hover {
        background: rgba(0, 212, 255, 0.3); /* Biru neon */
        box-shadow: 0 0 15px 8px rgba(0, 255, 255, 0.3); /* Glow saat hover */
    }

    #error-message {
        color: #ff4444;
        text-align: center;
        margin-top: 1rem;
    }
    
    
</style>
</head>
<body>
${SIDEBAR_COMPONENT}
    <div class="container">
        <div class="card">
            <h1 class="title">Sub Link </h1>
            <div class="flex justify-center mb-4">
            </div>
            <form id="subLinkForm">
                <div class="form-group">
                    <label for="app">Aplikasi</label>
                    <select id="app" class="form-control" required>
                        <option value="v2ray">V2RAY</option>
                        <option value="v2rayng">V2RAYNG</option>
                        <option value="clash">CLASH</option>
                        <option value="nekobox">NEKOBOX</option>
                        <option value="singbox">SINGBOX</option>
                        <option value="surfboard">SURFBOARD</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="bug">Bug</label>
                    <input type="text" id="bug" class="form-control" placeholder="Contoh: quiz.int.vidio.com" required>
                </div>

                <div class="form-group">
                    <label for="configType">Tipe Config</label>
                    <select id="configType" class="form-control" required>
                        <option value="vless">VLESS</option>
                        <option value="trojan">TROJAN</option>
                        <option value="shadowsocks">SHADOWSOCKS</option>
                        <option value="mix">ALL CONFIG</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="tls">TLS</label>
                    <select id="tls" class="form-control">
                        <option value="true">TRUE</option>
                        <option value="false">FALSE</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="wildcard">Wildcard</label>
                    <select id="wildcard" class="form-control">
                        <option value="true">TRUE</option>
                        <option value="false">FALSE</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="country">Negara</label>
                    <select id="country" class="form-control">
                        <option value="all">ALL COUNTRY</option>
                        <option value="random">RANDOM</option>
                        <option value="af">AFGHANISTAN</option>
                        <option value="al">ALBANIA</option>
                        <option value="dz">ALJERIA</option>
                        <option value="ad">ANDORRA</option>
                        <option value="ao">ANGOLA</option>
                        <option value="ag">ANTIGUA DAN BARBUDA</option>
                        <option value="ar">ARGENTINA</option>
                        <option value="am">ARMENIA</option>
                        <option value="au">AUSTRALIA</option>
                        <option value="at">AUSTRIA</option>
                        <option value="az">AZERBAIJAN</option>
                        <option value="bs">BAHAMAS</option>
                        <option value="bh">BAHRAIN</option>
                        <option value="bd">BANGLADESH</option>
                        <option value="bb">BARBADOS</option>
                        <option value="by">BELARUS</option>
                        <option value="be">BELGIUM</option>
                        <option value="bz">BELIZE</option>
                        <option value="bj">BENIN</option>
                        <option value="bt">BHUTAN</option>
                        <option value="bo">BOLIVIA</option>
                        <option value="ba">BOSNIA DAN HERZEGOVINA</option>
                        <option value="bw">BOTSWANA</option>
                        <option value="br">BRAZIL</option>
                        <option value="bn">BRUNEI</option>
                        <option value="bg">BULGARIA</option>
                        <option value="bf">BURKINA FASO</option>
                        <option value="bi">BURUNDI</option>
                        <option value="cv">CAP VERDE</option>
                        <option value="kh">KAMBODJA</option>
                        <option value="cm">KAMERUN</option>
                        <option value="ca">KANADA</option>
                        <option value="cf">REPUBLIK AFRIKA TENGAH</option>
                        <option value="td">TADJIKISTAN</option>
                        <option value="cl">CHILE</option>
                        <option value="cn">CINA</option>
                        <option value="co">KOLOMBIA</option>
                        <option value="km">KOMOR</option>
                        <option value="cg">KONGO</option>
                        <option value="cd">KONGO (REPUBLIK DEMOKRATIS)</option>
                        <option value="cr">KOSTA RIKA</option>
                        <option value="hr">KROASIA</option>
                        <option value="cu">CUBA</option>
                        <option value="cy">SIPRUS</option>
                        <option value="cz">CZECHIA</option>
                        <option value="dk">DENMARK</option>
                        <option value="dj">DJIBOUTI</option>
                        <option value="dm">DOMINIKA</option>
                        <option value="do">REPUBLIK DOMINIKA</option>
                        <option value="ec">EKUADOR</option>
                        <option value="eg">MESIR</option>
                        <option value="sv">EL SALVADOR</option>
                        <option value="gn">GUINEA</option>
                        <option value="gq">GUINEA KULTURAL</option>
                        <option value="gw">GUINEA-BISSAU</option>
                        <option value="gy">GUYANA</option>
                        <option value="ht">HAITI</option>
                        <option value="hn">HONDURAS</option>
                        <option value="hu">HUNGARIA</option>
                        <option value="is">ISLANDIA</option>
                        <option value="in">INDIA</option>
                        <option value="id">INDONESIA</option>
                        <option value="ir">IRAN</option>
                        <option value="iq">IRAK</option>
                        <option value="ie">IRLANDIA</option>
                        <option value="il">ISRAEL</option>
                        <option value="it">ITALIA</option>
                        <option value="jm">JAMAIKA</option>
                        <option value="jp">JEPANG</option>
                        <option value="jo">YORDANIA</option>
                        <option value="kz">KAZAKHSTAN</option>
                        <option value="ke">KENYA</option>
                        <option value="ki">KIRIBATI</option>
                        <option value="kp">KOREA UTARA</option>
                        <option value="kr">KOREA SELATAN</option>
                        <option value="kw">KUWAIT</option>
                        <option value="kg">KYRGYZSTAN</option>
                        <option value="la">LAOS</option>
                        <option value="lv">LATVIA</option>
                        <option value="lb">LEBANON</option>
                        <option value="ls">LESOTHO</option>
                        <option value="lr">LIBERIA</option>
                        <option value="ly">LIBIYA</option>
                        <option value="li">LIECHTENSTEIN</option>
                        <option value="lt">LITUANIA</option>
                        <option value="lu">LUKSEMBURG</option>
                        <option value="mk">MAKEDONIA</option>
                        <option value="mg">MADAGASKAR</option>
                        <option value="mw">MALAWI</option>
                        <option value="my">MALAYSIA</option>
                        <option value="mv">MALDIVES</option>
                        <option value="ml">MALI</option>
                        <option value="mt">MALTA</option>
                        <option value="mh">MARSHAL ISLANDS</option>
                        <option value="mr">MAURITANIA</option>
                        <option value="mu">MAURITIUS</option>
                        <option value="mx">MEKSIKO</option>
                        <option value="fm">MICRONESIA</option>
                        <option value="md">MOLDOVA</option>
                        <option value="mc">MONACO</option>
                        <option value="mn">MONGOLIA</option>
                        <option value="me">MONTENEGRO</option>
                        <option value="ma">MAROKO</option>
                        <option value="mz">MOZAMBIQUE</option>
                        <option value="mm">MYANMAR</option>
                        <option value="na">NAMIBIA</option>
                        <option value="np">NEPAL</option>
                        <option value="nl">BELANDA</option>
                        <option value="nz">SELANDIA BARU</option>
                        <option value="ni">NICARAGUA</option>
                        <option value="ne">NIGER</option>
                        <option value="ng">NIGERIA</option>
                        <option value="no">NORWEGIA</option>
                        <option value="om">OMAN</option>
                        <option value="pk">PAKISTAN</option>
                        <option value="pw">PALAU</option>
                        <option value="pa">PANAMA</option>
                        <option value="pg">PAPUA NGUNI</option>
                        <option value="py">PARAGUAY</option>
                        <option value="pe">PERU</option>
                        <option value="ph">FILIPINA</option>
                        <option value="pl">POLAND</option>
                        <option value="pt">PORTUGAL</option>
                        <option value="qa">QATAR</option>
                        <option value="ro">ROMANIA</option>
                        <option value="ru">RUSIA</option>
                        <option value="rw">RWANDA</option>
                        <option value="kn">SAINT KITTS DAN NEVIS</option>
                        <option value="lc">SAINT LUCIA</option>
                        <option value="vc">SAINT VINCENT DAN GRENADINES</option>
                        <option value="ws">SAMOA</option>
                        <option value="sm">SAN MARINO</option>
                        <option value="st">SAO TOME DAN PRINCIPE</option>
                        <option value="sa">ARAB SAUDI</option>
                        <option value="sn">SENEGAL</option>
                        <option value="rs">SERBIA</option>
                        <option value="sc">SEYCHELLES</option>
                        <option value="sl">SIERRA LEONE</option>
                        <option value="sg">SINGAPURA</option>
                        <option value="sk">SLOVAKIA</option>
                        <option value="si">SLOVENIA</option>
                        <option value="so">SOMALIA</option>
                        <option value="za">AFRIKA SELATAN</option>
                        <option value="es">SPANYOL</option>
                        <option value="lk">SRI LANKA</option>
                        <option value="sd">SUDAN</option>
                        <option value="sr">SURINAME</option>
                        <option value="se">SWEDIA</option>
                        <option value="ch">SWISS</option>
                        <option value="sy">SYRIA</option>
                        <option value="tw">TAIWAN</option>
                        <option value="tj">TAJIKISTAN</option>
                        <option value="tz">TANZANIA</option>
                        <option value="th">THAILAND</option>
                        <option value="tg">TOGO</option>
                        <option value="tk">TOKELAU</option>
                        <option value="to">TONGA</option>
                        <option value="tt">TRINIDAD DAN TOBAGO</option>
                        <option value="tn">TUNISIA</option>
                        <option value="tr">TURKI</option>
                        <option value="tm">TURKMENISTAN</option>
                        <option value="tc">TURKS DAN CAICOS ISLANDS</option>
                        <option value="tv">TUVALU</option>
                        <option value="ug">UGANDA</option>
                        <option value="ua">UKRAINA</option>
                        <option value="ae">UNITED ARAB EMIRATES</option>
                        <option value="gb">INGGRIS</option>
                        <option value="us">AMERIKA SERIKAT</option>
                        <option value="uy">URUGUAY</option>
                        <option value="uz">UZBEKISTAN</option>
                        <option value="vu">VANUATU</option>
                        <option value="va">VATICAN</option>
                        <option value="ve">VENEZUELA</option>
                        <option value="vn">VIETNAM</option>
                        <option value="ye">YAMAN</option>
                        <option value="zm">ZAMBIA</option>
                        <option value="zw">ZIMBABWE</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="limit">Jumlah Config</label>
                    <input type="number" id="limit" class="form-control" min="1" max="100" placeholder="Maks 100" required>
                </div>

                <button type="submit" class="btn">Generate Sub Link</button>
            </form>

            <div id="loading" class="loading">Generating Link...</div>
            <div id="error-message"></div>

            <div id="result" class="result" style="display: none;">
                <p id="generated-link"></p>
                <div class="copy-btns">
                    <button id="copyLink" class="copy-btn">Copy Link</button>
                    <button id="openLink" class="copy-btn">Buka Link</button>
                </div>
            </div>
        </div>
    </div>
    <script>
        // Performance optimization: Use event delegation and minimize DOM queries
        document.addEventListener('DOMContentLoaded', () => {
            const form = document.getElementById('subLinkForm');
            const loadingEl = document.getElementById('loading');
            const resultEl = document.getElementById('result');
            const generatedLinkEl = document.getElementById('generated-link');
            const copyLinkBtn = document.getElementById('copyLink');
            const openLinkBtn = document.getElementById('openLink');
            const errorMessageEl = document.getElementById('error-message');
            const appSelect = document.getElementById('app');
            const configTypeSelect = document.getElementById('configType');

            // Cached selectors to minimize DOM lookups
            const elements = {
                app: document.getElementById('app'),
                bug: document.getElementById('bug'),
                configType: document.getElementById('configType'),
                tls: document.getElementById('tls'),
                wildcard: document.getElementById('wildcard'),
                country: document.getElementById('country'),
                limit: document.getElementById('limit')
            };

            // App and config type interaction
            appSelect.addEventListener('change', () => {
                const selectedApp = appSelect.value;
                const shadowsocksOption = configTypeSelect.querySelector('option[value="shadowsocks"]');

                if (selectedApp === 'surfboard') {
                    configTypeSelect.value = 'trojan';
                    configTypeSelect.querySelector('option[value="trojan"]').selected = true;
                    shadowsocksOption.disabled = true;
                } else {
                    shadowsocksOption.disabled = false;
                }
            });

            // Form submission handler
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                // Reset previous states
                loadingEl.style.display = 'block';
                resultEl.style.display = 'none';
                errorMessageEl.textContent = '';

                try {
                    // Validate inputs
                    const requiredFields = ['bug', 'limit'];
                    for (let field of requiredFields) {
                        if (!elements[field].value.trim()) {
                            throw new Error(\`Harap isi \${field === 'bug' ? 'Bug' : 'Jumlah Config'}\`);
                        }
                    }

                    // Construct query parameters
                    const params = new URLSearchParams({
                        type: elements.configType.value,
                        bug: elements.bug.value.trim(),
                        tls: elements.tls.value,
                        wildcard: elements.wildcard.value,
                        limit: elements.limit.value,
                        ...(elements.country.value !== 'all' && { country: elements.country.value })
                    });

                    // Generate full link (replace with your actual domain)
                    const generatedLink = \`/vpn/\${elements.app.value}?\${params.toString()}\`;

                    // Simulate loading (remove in production)
                    await new Promise(resolve => setTimeout(resolve, 500));

                    // Update UI
                    loadingEl.style.display = 'none';
                    resultEl.style.display = 'block';
                    generatedLinkEl.textContent = \`https://\${window.location.hostname}\${generatedLink}\`;

                    // Copy link functionality
                    copyLinkBtn.onclick = async () => {
                        try {
                            await navigator.clipboard.writeText(\`https://\${window.location.hostname}\${generatedLink}\`);
                            alert('Link berhasil disalin!');
                        } catch {
                            alert('Gagal menyalin link.');
                        }
                    };

                    // Open link functionality
                    openLinkBtn.onclick = () => {
                        window.open(generatedLink, '_blank');
                    };

                } catch (error) {
                    // Error handling
                    loadingEl.style.display = 'none';
                    errorMessageEl.textContent = error.message;
                    console.error(error);
                }
            });
        });
    </script>
</body>
</html>
 `
return html
}

async function handleWebRequest(request, env) {
    const cfApi = new CloudflareApi(env);
    const dynamicDomains = await cfApi.getDomainList();
    const suffixToRemove = `.${env.SERVICE_NAME}.${env.ROOT_DOMAIN}`;
    // Pastikan untuk menangani domain yang mungkin tidak memiliki akhiran yang diharapkan
    const dynamicWildcards = dynamicDomains.map(d => 
        d.hostname.endsWith(suffixToRemove) 
            ? d.hostname.slice(0, -suffixToRemove.length) 
            : d.hostname
    );
    
    // Gabungkan wildcard statis dan dinamis, lalu hapus duplikat
    const allWildcards = [...new Set([...wildcards, ...dynamicWildcards])];

    const fetchConfigs = async () => {
      try {
        const rawProxyList = await getProxyList(); // Use cached list
        let pathCounters = {};

        const configs = rawProxyList.map((config) => {
            const countryCode = config.country;
            if (!pathCounters[countryCode]) {
                pathCounters[countryCode] = 1;
            }
            const path = `/${countryCode}${pathCounters[countryCode]}`;
            pathCounters[countryCode]++;

            return {
                ip: config.proxyIP,
                port: config.proxyPort,
                countryCode: countryCode,
                isp: config.org,
                path: path
            };
        });

        return configs;
      } catch (error) {
        console.error('Error fetching configurations:', error);
        return [];
      }
    };

function buildCountryFlag() {
  const flagList = cachedProxyList.map((proxy) => proxy.country);
  const uniqueFlags = new Set(flagList);

  let flagElement = "";
  for (const flag of uniqueFlags) {
    if (flag && flag !== "Unknown") {
      try {
        flagElement += `<a href="/web?page=${page}&search=${flag}" class="py-0.5">
      <span class="flag-circle flag-icon flag-icon-${flag.toLowerCase()}" 
      style="display: inline-block; width: 30px; height: 30px; margin: 1px; border: 1px solid #008080; border-radius: 30%;">
</span>
</a>`;
      } catch (err) {
        console.error(`Error generating flag for country: ${flag}`, err);
      }
    }
  }

  return flagElement;
}

    const getFlagEmoji = (countryCode) => {
      if (!countryCode) return '🏳️';
      return countryCode
        .toUpperCase()
        .split('')
        .map((char) => String.fromCodePoint(0x1f1e6 - 65 + char.charCodeAt(0)))
        .join('');
    };

    const url = new URL(request.url);
    const hostName = url.hostname;
    const page = parseInt(url.searchParams.get('page')) || 1;
    const searchQuery = url.searchParams.get('search') || '';
    const selectedWildcard = url.searchParams.get('wildcard') || '';
    const selectedConfigType = url.searchParams.get('configType') || 'tls'; // Ambil nilai 'configType' atau gunakan default 'tls'
    const configsPerPage = 10;

    const configs = await fetchConfigs();
    const totalConfigs = configs.length;

    let filteredConfigs = configs;
    if (searchQuery.includes(':')) {
        // Search by IP:PORT format
        filteredConfigs = configs.filter((config) => 
            `${config.ip}:${config.port}`.includes(searchQuery)
        );
    } else if (searchQuery.length === 2) {
        // Search by country code (if it's two characters)
        filteredConfigs = configs.filter((config) =>
            config.countryCode.toLowerCase().includes(searchQuery.toLowerCase())
        );
    } else if (searchQuery.length > 2) {
        // Search by IP, ISP, or country code
        filteredConfigs = configs.filter((config) =>
            config.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (`${config.ip}:${config.port}`).includes(searchQuery.toLowerCase()) ||
            config.isp.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
     
    const totalFilteredConfigs = filteredConfigs.length;
    const totalPages = Math.ceil(totalFilteredConfigs / configsPerPage);
    const startIndex = (page - 1) * configsPerPage;
    const endIndex = Math.min(startIndex + configsPerPage, totalFilteredConfigs);
    const visibleConfigs = filteredConfigs.slice(startIndex, endIndex);

    const configType = url.searchParams.get('configType') || 'tls';

    let cardsHTML = '';

    visibleConfigs.forEach((config, index) => {
        const rowNumber = startIndex + index + 1;
        const uuid = generateUUIDv4();
        const wildcard = selectedWildcard || hostName;
        const modifiedHostName = selectedWildcard ? `${selectedWildcard}.${hostName}` : hostName;
        const url = new URL(request.url);
        const BASE_URL = `https://${url.hostname}`;
        const CHECK_API = `${BASE_URL}/geo-ip?ip=`;
        const ipPort = `${config.ip}:${config.port}`;
        const path2 = encodeURIComponent(`/${config.ip}=${config.port}`);
        const subP = `/Free-VPN-CF-Geo-Project`;

        // Define config links
        const vlessTLSSimple = `vless://${uuid}@${wildcard}:443?encryption=none&security=tls&sni=${modifiedHostName}&fp=randomized&type=ws&host=${modifiedHostName}&path=${encodeURIComponent(subP + config.path.toUpperCase())}#(${config.countryCode})%20${config.isp.replace(/\s/g, '%20')}${getFlagEmoji(config.countryCode)}`;
        const vlessTLSRibet = `vless://${uuid}@${wildcard}:443?encryption=none&security=tls&sni=${modifiedHostName}&fp=randomized&type=ws&host=${modifiedHostName}&path=${subP}${path2}#(${config.countryCode})%20${config.isp.replace(/\s/g, '%20')}${getFlagEmoji(config.countryCode)}`;
        const trojanTLSSimple = `trojan://${uuid}@${wildcard}:443?encryption=none&security=tls&sni=${modifiedHostName}&fp=randomized&type=ws&host=${modifiedHostName}&path=${encodeURIComponent(subP + config.path.toUpperCase())}#(${config.countryCode})%20${config.isp.replace(/\s/g,'%20')}${getFlagEmoji(config.countryCode)}`;
        const trojanTLSRibet = `trojan://${uuid}@${wildcard}:443?encryption=none&security=tls&sni=${modifiedHostName}&fp=randomized&type=ws&host=${modifiedHostName}&path=${subP}${path2}#(${config.countryCode})%20${config.isp.replace(/\s/g,'%20')}${getFlagEmoji(config.countryCode)}`;
        const ssTLSSimple = `ss://${btoa(`none:${uuid}`)}%3D@${wildcard}:443?encryption=none&type=ws&host=${modifiedHostName}&path=${encodeURIComponent(subP + config.path.toUpperCase())}&security=tls&sni=${modifiedHostName}#(${config.countryCode})%20${config.isp.replace(/\s/g,'%20')}${getFlagEmoji(config.countryCode)}`;
        const ssTLSRibet = `ss://${btoa(`none:${uuid}`)}%3D@${wildcard}:443?encryption=none&type=ws&host=${modifiedHostName}&path=${subP}${path2}&security=tls&sni=${modifiedHostName}#(${config.countryCode})%20${config.isp.replace(/\s/g,'%20')}${getFlagEmoji(config.countryCode)}`;
        
        const vlessNTLSSimple = `vless://${uuid}@${wildcard}:80?path=${encodeURIComponent(subP + config.path.toUpperCase())}&security=none&encryption=none&host=${modifiedHostName}&fp=randomized&type=ws&sni=${modifiedHostName}#(${config.countryCode})%20${config.isp.replace(/\s/g,'%20')}${getFlagEmoji(config.countryCode)}`;
        const vlessNTLSRibet = `vless://${uuid}@${wildcard}:80?path=${subP}${path2}&security=none&encryption=none&host=${modifiedHostName}&fp=randomized&type=ws&sni=${modifiedHostName}#(${config.countryCode})%20${config.isp.replace(/\s/g,'%20')}${getFlagEmoji(config.countryCode)}`;
        const trojanNTLSSimple = `trojan://${uuid}@${wildcard}:80?path=${encodeURIComponent(subP + config.path.toUpperCase())}&security=none&encryption=none&host=${modifiedHostName}&fp=randomized&type=ws&sni=${modifiedHostName}#(${config.countryCode})%20${config.isp.replace(/\s/g,'%20')}${getFlagEmoji(config.countryCode)}`;
        const trojanNTLSRibet = `trojan://${uuid}@${wildcard}:80?path=${subP}${path2}&security=none&encryption=none&host=${modifiedHostName}&fp=randomized&type=ws&sni=${modifiedHostName}#(${config.countryCode})%20${config.isp.replace(/\s/g,'%20')}${getFlagEmoji(config.countryCode)}`;
        const ssNTLSSimple = `ss://${btoa(`none:${uuid}`)}%3D@${wildcard}:80?encryption=none&type=ws&host=${modifiedHostName}&path=${encodeURIComponent(subP + config.path.toUpperCase())}&security=none&sni=${modifiedHostName}#(${config.countryCode})%20${config.isp.replace(/\s/g,'%20')}${getFlagEmoji(config.countryCode)}`;
        const ssNTLSRibet = `ss://${btoa(`none:${uuid}`)}%3D@${wildcard}:80?encryption=none&type=ws&host=${modifiedHostName}&path=${subP}${path2}&security=none&sni=${modifiedHostName}#(${config.countryCode})%20${config.isp.replace(/\s/g,'%20')}${getFlagEmoji(config.countryCode)}`;

        let vlessSimple, vlessRibet, trojanSimple, trojanRibet, ssSimple, ssRibet;
        if (configType === 'tls') {
            vlessSimple = vlessTLSSimple;
            vlessRibet = vlessTLSRibet;
            trojanSimple = trojanTLSSimple;
            trojanRibet = trojanTLSRibet;
            ssSimple = ssTLSSimple;
            ssRibet = ssTLSRibet;
        } else {
            vlessSimple = vlessNTLSSimple;
            vlessRibet = vlessNTLSRibet;
            trojanSimple = trojanNTLSSimple;
            trojanRibet = trojanNTLSRibet;
            ssSimple = ssNTLSSimple;
            ssRibet = ssNTLSRibet;
        }

        const cardBackgrounds = [
     'https://www.transparenttextures.com/patterns/carbon-fibre.png'
];
        const backgroundUrl = cardBackgrounds[index % cardBackgrounds.length];

        cardsHTML += `
<div class="card slide-up proxy-card lozad scale-95 bg-blue-300/30 dark:bg-slate-800 transition-all duration-300 rounded-lg p-6 flex flex-col shadow-lg border border-white/20 hover:scale-105 backdrop-blur-md" 
     data-ip-port="${ipPort}" 
     style="background-image: url('${backgroundUrl}');">
    
    <!-- Header Section -->
    <div class="flex justify-between items-center">
        <div class="status-container">
            <div class="proxy-status">
                <div class="loading-container">
                    <div class="spinner"></div>
                    <span>Checking status...</span>
                </div>
            </div>
            <div class="delay-badge"></div>
        </div>
        <div class="rounded-full overflow-hidden border-4 border-white dark:border-slate-800">
            <img width="40" 
                 src="https://hatscripts.github.io/circle-flags/flags/${config.countryCode.toLowerCase()}.svg" 
                 alt="${config.countryCode} flag" />
        </div>
    </div>

    <!-- Info Section -->
    <div class="rounded-lg py-4 px-4 bg-blue-200/20 dark:bg-slate-700/50 flex-grow mt-4">
        <h5 class="font-bold text-lg text-black mb-2 overflow-x-scroll scrollbar-hide text-nowrap">
    ${config.isp}
</h5>
        <div class="flex justify-between items-center">
            <span class="text-sm font-medium text-slate-900 dark:text-white bg-white/50 dark:bg-slate-600/50 px-3 py-1.5 rounded-lg border border-slate-300/50 dark:border-slate-600/50">
                ${config.ip}:${config.port}
            </span>
            <span class="text-sm font-bold text-black bg-yellow-400 dark:bg-yellow-500 dark:text-black px-3 py-1.5 rounded-lg shadow-sm">
                ${config.countryCode}
            </span>
        </div>
    </div>

    <!-- Protocol Buttons -->
    <div class="grid grid-cols-2 gap-2 mt-4 text-sm">
        <button class="bg-gradient-to-r from-yellow-400 to-yellow-600 dark:from-blue-500 dark:to-blue-700 rounded-md p-1.5 w-full text-black dark:text-white font-semibold transition-colors duration-200 text-xs"
                onclick='showOptions("VLess", "${vlessRibet.replace(/"/g, '&quot;')}", "${vlessSimple.replace(/"/g, '&quot;')}", ${JSON.stringify(config).replace(/'/g, "&#39;")})'>
            VLESS
        </button>
        <button class="bg-gradient-to-r from-yellow-400 to-yellow-600 dark:from-blue-500 dark:to-blue-700 rounded-md p-1.5 w-full text-black dark:text-white font-semibold transition-colors duration-200 text-xs"
                onclick='showOptions("Trojan", "${trojanRibet.replace(/"/g, '&quot;')}", "${trojanSimple.replace(/"/g, '&quot;')}", ${JSON.stringify(config).replace(/'/g, "&#39;")})'>
            TROJAN
        </button>
    </div>

    <!-- Additional Protocol Button -->
    <div class="button-row mt-2">
        <button class="bg-gradient-to-r from-yellow-400 to-yellow-600 dark:from-blue-500 dark:to-blue-700 rounded-md p-1.5 w-full text-black dark:text-white font-semibold transition-colors duration-200 text-xs"
                onclick='showOptions("SS", "${ssRibet.replace(/"/g, '&quot;')}", "${ssSimple.replace(/"/g, '&quot;')}", ${JSON.stringify(config).replace(/'/g, "&#39;")})'>
            SHADOWSOCKS
        </button>
    </div>
</div>
`;

    });

    const showOptionsScript = `
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">
    <script>
        function showOptions(type, ribet, simple, config) {
            Swal.fire({
                width: '270px',
                html: \`
                    <div class="px-1 py-1 text-center">
                    <span class="flag-circle flag-icon flag-icon-\${config.countryCode.toLowerCase()}" 
                    style="width: 60px; height: 60px; border-radius: 50%; display: inline-block;">
                    </span>
                    </div>
                    <div class="mt-3">
                    <div class="h-px bg-[#4682b4] shadow-sm"></div>
                    <div class="text-xs">IP : \${config.ip}</div>
                    <div class="text-xs">ISP : \${config.isp}</div>
                    <div class="text-xs">Country : \${config.countryCode}</div>
                    <div class="h-px bg-[#4682b4] shadow-sm"></div>
                    <div class="mt-3">
                    <button class="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-opacity-80 py-2 px-3 text-xs rounded-md text-white font-semibold shadow-md" onclick="copy('\${simple}')">COPY PATH COUNTRY</button>
                    <div class="mt-3">
                    <button class="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-opacity-80 py-2 px-3 text-xs rounded-md text-white font-semibold shadow-md" onclick="copy('\${ribet}')">COPY PATH IP PORT</button>
                    <div class="mt-3">
                        <button class="bg-gradient-to-r from-red-500 to-red-700 bg-opacity-80 py-2 px-3 text-xs rounded-md text-white font-semibold shadow-md" onclick="Swal.close()">Close</button>
                    </div>
                \`,
                showCloseButton: false,
                showConfirmButton: false,
                background: 'rgba(6, 18, 67, 0.70)',
                color: 'white',
                customClass: {
                    popup: 'rounded-popup',
                    closeButton: 'close-btn'
                },
                position: 'center', 
                showClass: {
                    popup: 'animate__animated animate__fadeInLeft' 
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutRight' 
                },
                didOpen: () => {
                    const popup = document.querySelector('.swal2-popup');
                    popup.style.animationDuration = '0.3s'; 
                },
                didClose: () => {
                    const popup = document.querySelector('.swal2-popup');
                    popup.style.animationDuration = '0.3s'; 
                }
            });
        }
    <\/script>
    `;

    const paginationButtons = [];
    const pageRange = 2;

    for (let i = Math.max(1, page - pageRange); i <= Math.min(totalPages, page + pageRange); i++) {
      paginationButtons.push(
        `<a href="?page=${i}&wildcard=${encodeURIComponent(selectedWildcard)}&configType=${encodeURIComponent(selectedConfigType)}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}" class="pagination-number ${i === page ? 'active' : ''}">${i}</a>`
      );
    }

    const prevPage = page > 1
      ? `<a href="?page=${page - 1}&wildcard=${encodeURIComponent(selectedWildcard)}&configType=${encodeURIComponent(selectedConfigType)}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}" class="pagination-arrow">◁</a>`
      : '';

    const nextPage = page < totalPages
      ? `<a href="?page=${page + 1}&wildcard=${encodeURIComponent(selectedWildcard)}&configType=${encodeURIComponent(selectedConfigType)}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}" class="pagination-arrow">▷</a>`
      : '';

  return new Response(`

<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Geo-VPN | VPN Tunnel | CloudFlare</title>

<link rel="icon" href="https://geoproject.biz.id/circle-flags/bote.png">

<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flag-icon-css/css/flag-icon.min.css">
<link rel="stylesheet" href="https://site-assets.fontawesome.com/releases/v6.7.1/css/all.css">

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="https://cdn.tailwindcss.com"></script>
        <script>
            tailwind.config = {
                darkMode: 'selector',
                theme: {
                    extend: {
                        fontFamily: {
                            sans: ['Rajdhani', 'sans-serif'],
                            display: ['Orbitron', 'sans-serif'],
                        },
                        colors: {
                            'cyber-bg': '#0a0a0a',
                            'cyber-primary': '#00f2ff',
                            'cyber-secondary': '#ff00ff',
                            'cyber-accent': '#ff0066',
                        },
                        animation: {
                            'pulse-glow': 'pulseGlow 2s ease-in-out infinite alternate',
                            'scanline': 'scanline 2s linear infinite',
                        }
                    },
                },
            };
        </script>

        <script>
            // On page load or when changing themes, best to add inline in head to avoid FOUC
            if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark')
            }
        </script>
        
        <style>
:root {
    --primary: #22c55e;
    --secondary: #10b981;
    --neon-magenta: #ff00ff;
    --dark-bg: #030617;
    --light: #e0f2fe;
    --gray-light: #94a3b8;
    --glass: rgba(25, 30, 45, 0.7);
    --glass-border: rgba(34, 197, 94, 0.3);
    --neon-cyan: #00ff00;
    --light-bg: #f0f4f8;
    --dark-text: #1e293b;
    --container-light-bg: rgba(255, 255, 255, 0.9);
    --glass-border-light: rgba(0, 0, 0, 0.1);
    --glass-border-dark: rgba(255, 255, 255, 0.1);
    --primary-color: #4a90e2;
    --secondary-color: #7b68ee;
    --card-bg-light: rgba(255, 255, 255, 0.95);
    --card-bg-dark: rgba(0, 0, 0, 0.5);
    --footer-bg-light: rgba(240, 244, 248, 0.9);
    --footer-bg-dark: rgba(0, 0, 0, 0.8);
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
}

body {
    background-color: var(--light-bg);
    color: var(--dark-text);
    min-height: 100vh;
    line-height: 1.6;
    overflow-x: hidden;
    transition: background-color 0.3s, color 0.3s;
}

.dark body { 
    background-color: var(--dark-bg);
    color: var(--light);
    background-image: url('https://www.transparenttextures.com/patterns/cubes.png');
    background-size: cover;
}

.quantum-container {
    max-width: 350px;
    margin: 20px auto;
    background-image: url('https://www.transparenttextures.com/patterns/inspiration-geometry.png');
    padding: 20px;
    background-color: var(--container-light-bg);
    border: 1px solid var(--glass-border-light);
    border-radius: 15px;
    backdrop-filter: blur(8px);
    min-height: calc(100vh - 40px);
    transition: background-color 0.3s, border-color 0.3s;
}

.dark .quantum-container {
    background-color: rgba(3, 6, 23, 0.85); 
    border-color: var(--glass-border-dark);
}

.popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(rgba(3, 6, 23, 0.98), rgba(6, 12, 30, 0.98)),
                url('https://img.wattpad.com/63b4fef6d4a8b5eef3a12394990aea164cfe4be1/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f776174747061642d6d656469612d736572766963652f53746f7279496d616765L434916e4f5962596f476f5241773d3d2d3132302e313563323538386461323838623263313733313931313130373332332e6a7067?s=fit&w=720&h=720') no-repeat center center fixed;
    background-size: cover;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    backdrop-filter: blur(10px);
    transition: opacity 0.5s, transform 0.5s;
}

.popup-container {
    background: var(--glass);
    padding: 40px;
    border-radius: 20px;
    text-align: center;
    border: 2px solid var(--neon-cyan);
    max-width: 500px;
    width: 90%;
    position: relative;
    overflow: hidden;
}

.popup-title {
    font-size: 2.2rem;
    font-weight: 700;
    background: linear-gradient(135deg, var(--neon-magenta), var(--neon-cyan));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 15px;
}

.popup-progress {
    width: 100%;
    height: 20px;
    background: var(--glass);
    border-radius: 10px;
    margin: 20px 0;
    overflow: hidden;
    border: 1px solid var(--glass-border);
}

.popup-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--neon-magenta), var(--neon-cyan));
    border-radius: 10px;
    transition: width 0.3s ease;
}

.popup-controls {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 25px;
}

.wildcard-dropdown {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin-top: 15px;
    margin-bottom: 25px;
    width: 50%;
    max-width: 250px;
    margin-left: auto;
    margin-right: auto;
}

select {
    width: 100%;
    max-width: 200px;
    padding: 0.4rem 0.6rem;
    font-size: 0.8rem;
    color: var(--dark-text);
    background: rgba(34, 197, 94, 0.05);
    border: 2px solid rgba(34, 197, 94, 0.3);
    border-radius: 10px;
    outline: none;
    font-family: 'Rajdhani', sans-serif;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    appearance: none;
    background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%231e293b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="M6 9l6 6 6-6"%3E%3C/path%3E%3C/svg%3E');
    background-position: right 10px center;
    background-repeat: no-repeat;
    background-size: 1rem;
    transition: all 0.3s ease;
}

.dark select {
    color: var(--light);
    background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23e0f2fe" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="M6 9l6 6 6-6"%3E%3C/path%3E%3C/svg%3E');
}

select:hover {
    border-color: var(--primary);
}

select:focus {
    border-color: var(--primary);
    background: rgba(34, 197, 94, 0.1);
}

.wildcard-dropdown select option {
    background-color: var(--light-bg);
    color: var(--dark-text);
}

.dark .wildcard-dropdown select option {
    background-color: var(--dark-bg);
    color: var(--light);
}

.quantum-pagination {
    display: flex;
    justify-content: center;
    gap: 0.8rem;
    margin-top: 2rem;
    flex-wrap: wrap;
}

.quantum-pagination a {
    padding: 0.8rem 1.5rem;
    background: rgba(0, 255, 136, 0.1);
    color: var(--primary);
    text-decoration: none;
    border-radius: 12px;
    border: 1px solid rgba(0, 255, 136, 0.3);
    transition: all 0.3s ease;
    font-family: 'Rajdhani', sans-serif;
    font-weight: 600;
    min-width: 45px;
    text-align: center;
}

.quantum-pagination a:hover,
.quantum-pagination a.active {
    background: var(--primary);
    color: var(--dark-bg);
    transform: translateY(-2px);
}

.quantum-pagination {
    gap: 0.5rem;
    flex-wrap: wrap;
}

.quantum-pagination a {
    padding: 0.5rem 0.7rem;
    font-size: 0.7rem;
    min-width: 30px;
}

.pagination-number.active {
    background: var(--neon-magenta);
    color: white !important;
    border-color: var(--neon-magenta);
}

.neon-active {
    color: #00FF00;
    text-shadow: 
        0 0 5px #00FF00,
        0 0 10px #00FF00,
        0 0 15px #00FF00,
        0 0 20px #00FF00;
    animation: neonBlink 2s infinite;
}

.neon-dead {
    color: #FF3333;
    text-shadow: 
        0 0 5px #FF3333,
        0 0 10px #FF3333,
        0 0 15px #FF3333;
    animation: deadPulse 1.5s infinite;
}

.status-container {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background: var(--card-bg-light);
    border-radius: 8px;
    font-family: 'Arial', sans-serif;
    flex-wrap: nowrap;
    white-space: nowrap;
    color: var(--dark-text);
    border: 1px solid #e2e8f0;
    backdrop-filter: blur(5px);
    transition: background-color 0.3s, color 0.3s, border-color 0.3s;
}

.dark .status-container {
    background: var(--card-bg-dark);
    color: #f7fafc;
    border: 1px solid #4a5568;
}

.status-container * {
    color: inherit;
}

.status-badge {
    display: flex;
    align-items: center;
    gap: 5px;
    font-weight: bold;
    font-size: 14px;
    padding: 5px 10px;
    border-radius: 4px;
}

.delay-badge {
    background: linear-gradient(45deg, #FFD700, #FFA500);
    color: #000;
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 12px;
    box-shadow: 0 0 5px gold;
}

.loading-container {
    display: flex;
    align-items: center;
    gap: 8px;
}

.spinner {
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3498db;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    animation: spin 1s linear infinite;
}

.loading-icon {
    color: #4CAF50;
    font-size: 20px;
}

.error-icon {
    color: red;
    font-size: 18px;
}

.quantum-title {
    font-family: 'Rajdhani', sans-serif;
    padding-top: 8px;
    margin-top: 8px;
    text-align: center;
    font-size: 16vw;
    font-weight: 600;
    background: linear-gradient(145deg,
        #00ff88 0%,
        #00cc66 25%,
        #10b981 50%,
        #047857 75%,
        #064e3b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    background-size: 200% 200%;
    position: relative;
}

.quantum-title {
    font-size: 1.5rem;
    margin-bottom: 0.8rem;
}

@media (min-width: 640px) {
    .quantum-container {
        max-width: 900px;
    }
    .quantum-container .table-wrapper {
        width: calc(100% + 40px);
        margin-left: -20px;
        margin-right: -20px;
        padding-left: 10px;
        padding-right: 10px;
        border-radius: 0;
        border-left: none;
        border-right: none;
    }
}

@media (max-width: 768px) {
    .quantum-title {
        font-size: 2.5rem;
    }
}

@media (min-width: 1024px) {
    .quantum-title {
        font-size: 3rem;
        margin-bottom: 0.8rem;
    }
}

.quantum-toast {
    position: fixed;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    background: #22c55e;
    color: white;
    padding: 8px 16px;
    border-radius: 8px;
    transition: all 0.3s;
    z-index: 50;
    font-size: 0.8rem;
}

.card {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(99, 102, 241, 0.03) 100%);
    border-radius: 20px;
    padding: 30px;
    backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border-light);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: relative;
    overflow: hidden;
}

.dark .card {
    border-color: var(--glass-border-dark);
}

/* Garis Api Merah - Kiri ke Kanan */
.card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #ff0000, #ff5500, #ff0000, transparent);
    animation: fireLine 3s ease-in-out infinite;
    filter: blur(1px);
    z-index: 2;
}

/* Garis Api Biru - Kanan ke Kiri */
.card::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: -100%;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #00ffff, #00aaff, #00ffff, transparent);
    animation: fireLine 4s ease-in-out infinite reverse;
    filter: blur(1px);
    z-index: 2;
}

@keyframes fireLine {
    0% { 
        left: -100%;
        opacity: 0;
    }
    50% { 
        opacity: 1;
    }
    100% { 
        left: 100%;
        opacity: 0;
    }
}

.card:hover {
    transform: translateY(-8px);
    border-color: rgba(99, 102, 241, 0.3);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.card-header {
    display: flex;
    align-items: center;
    margin-bottom: 25px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--glass-border-light);
}

.dark .card-header {
    border-bottom: 1px solid var(--glass-border-dark);
}

.card-icon {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;
    font-size: 20px;
    color: white;
}

.slide-up {
    animation: slideUp 0.6s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideUp {
    from { 
        opacity: 0;
        transform: translateY(30px);
    }
    to { 
        opacity: 1;
        transform: translateY(0);
    }
}

.content {
    flex: 1;
    padding: 40px;
    text-align: center;
}

/* Footer dengan Efek Meteor */
.footer {
    text-align: center;
    margin-top: 60px;
    padding: 40px 30px;
    background: var(--footer-bg-light);
    background-size: cover;
    border-radius: 20px;
    backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border-light);
    position: relative;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    transition: background-color 0.3s, border-color 0.3s;
}

.dark .footer {
    background: var(--footer-bg-dark);
    border-color: var(--glass-border-dark);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

/* Footer Content */
.footer-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 25px;
}

.footer-logo {
    font-size: 1.8rem;
    font-weight: 700;
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    margin-bottom: 10px;
}

.footer-links {
    display: flex;
    gap: 25px;
    margin-bottom: 20px;
}

.footer-link {
    color: var(--gray-light);
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
    position: relative;
    padding: 5px 0;
}

.footer-link:hover {
    color: var(--dark-text);
    transform: translateY(-2px);
}

.dark .footer-link:hover {
    color: white;
}

.footer-link::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    transition: width 0.3s ease;
}

.footer-link:hover::after {
    width: 100%;
}

.social-icons {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin-bottom: 25px;
    width: 100%;
}

.social-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--dark-text);
    text-decoration: none;
    transition: all 0.3s ease;
    border: 1px solid rgba(0, 0, 0, 0.1);
}

.dark .social-icon {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.social-icon:hover {
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(74, 144, 226, 0.4);
    color: white;
}

/* Copyright dengan efek api putih */
.copyright-fire {
    position: relative;
    margin-top: 20px;
    padding: 15px 20px;
    overflow: hidden;
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: background-color 0.3s, border-color 0.3s;
}

.dark .copyright-fire {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.copyright-fire::before, .copyright-fire::after {
    content: '';
    position: absolute;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--dark-text), transparent);
    animation: fireCollision 4s linear infinite;
}

.dark .copyright-fire::before, 
.dark .copyright-fire::after {
    background: linear-gradient(90deg, transparent, white, transparent);
}

.copyright-fire::before {
    top: 0;
    animation-direction: normal;
}

.copyright-fire::after {
    bottom: 0;
    animation-direction: reverse;
}

@keyframes fireCollision {
    0% { transform: translateX(-100%); }
    50% { transform: translateX(0); opacity: 1; }
    51% { opacity: 0.5; }
    52% { opacity: 1; }
    100% { transform: translateX(100%); }
}

/* Efek Meteor untuk Footer */
.footer::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: 
        radial-gradient(circle at 30% 30%, rgba(0, 0, 0, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 70% 70%, rgba(0, 0, 0, 0.05) 0%, transparent 50%);
    animation: meteorShower 20s linear infinite;
    pointer-events: none;
}

.dark .footer::before {
    background: 
        radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
}

@keyframes meteorShower {
    0% { transform: translateY(-100%) rotate(0deg); }
    100% { transform: translateY(100%) rotate(360deg); }
}

.footer p {
    color: var(--gray-light);
    margin-bottom: 15px;
}

/* Animasi Fade In */
.fade-in {
    animation: fadeIn 1.5s ease-in-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Responsif */
@media (max-width: 768px) {
    .footer-links {
        flex-direction: column;
        gap: 15px;
    }
    
    .footer {
        padding: 30px 20px;
    }
}
</style>
    </head>
   <body>
   ${SIDEBAR_COMPONENT}
    <div class="quantum-container">
    <div class="mt-10"></div>
                <div class="wildcard-dropdown"> 
                    <button onclick="toggleWildcardsWindow()" class="bg-gradient-to-r from-green-500 to-green-700 rounded-full p-2 block text-white border-2 border-green-900 transition duration-300 ease-in-out hover:from-green-700 hover:to-green-900">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" />
                        </svg> 
                    </button>
                    <select id="wildcard" name="wildcard" onchange="onWildcardChange(event)" style="width: 90px; height: 45px;">
                        <option value="" ${!selectedWildcard ? 'selected' : ''}>No Wildcard</option>
                        ${allWildcards.map(w => `<option value="${w}" ${selectedWildcard === w ? 'selected' : ''}>${w}</option>`).join('')}
                    </select>
                    <select id="configType" name="configType" onchange="onConfigTypeChange(event)" style="width: 60px; height: 45px;">
                        <option value="tls" ${selectedConfigType === 'tls' ? 'selected' : ''}>TLS</option>
                        <option value="non-tls" ${selectedConfigType === 'non-tls' ? 'selected' : ''}>NON TLS</option> 
                    </select>
                    <a href="${telegrambot}" target="_blank">
                        <button class="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 rounded-full border-2 border-gray-900 p-2 transition-colors duration-200 shadow-lg z-50">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-6">
                                <path d="M22 12A10 10 0 0 1 12 2A10 10 0 0 1 2 12A10 10 0 0 1 12 22A10 10 0 0 1 22 12z"></path>
                                <path d="M7 10l5 5l5-5"></path>
                                <path d="M12 15l-5 5"></path>
                                <path d="M12 15l5 5"></path>
                            </svg> 
                        </button> 
                    </a>
                    </div>
                
            <div class="w-full h-12 px-2 py-1 flex items-center space-x-2 shadow-lg border"
    style="border-width: 1px; border-style: solid; border-color: #28a745; height: 55px; border-radius: 10px; background-image: url('https://www.transparenttextures.com/patterns/cubes.png'); overflow-x: auto; overflow-y: hidden;">
    ${buildCountryFlag()}
</div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    ${cardsHTML}
                </div>
                
                ${showOptionsScript}
                
                <script>
            /* [PERBAIKAN 4]: Menggunakan document.documentElement untuk mendapatkan tag <html> */
            function toggleDarkMode() {
                const rootElement = document.documentElement; // <-- Diperbaiki!
                if (rootElement.classList.contains("dark")) {
                  rootElement.classList.remove("dark");
                  localStorage.setItem('theme', 'light');
                } else {
                  rootElement.classList.add("dark");
                  localStorage.setItem('theme', 'dark');
                }
            }
        </script>


                <script>
                document.addEventListener('DOMContentLoaded', () => {
                    const cards = document.querySelectorAll('.proxy-card');
                    const checkAllProxies = async () => {
                        for (const card of cards) {
                            const ipPort = card.dataset.ipPort;
                            const statusElement = card.querySelector('.proxy-status');
                            const delayElement = card.querySelector('.delay-badge');
                            const healthCheckUrl = \`/geo-ip?ip=\${ipPort}\`;

                            try {
                                const response = await fetch(healthCheckUrl);
                                if (!response.ok) throw new Error('Network response was not ok');
                                
                                const data = await response.json();
                                const status = data.status || 'UNKNOWN';
                                let delay = parseFloat(data.delay) || NaN;

                                if (!isNaN(delay)) {
                                    delay = Math.round(delay);
                                    delayElement.textContent = delay + ' ms';
                                    delayElement.style.display = 'block';
                                } else {
                                    delayElement.textContent = 'N/A';
                                }

                                let statusHTML = '';
                                let delayText = delayElement.textContent;
                                
                                switch (status) {
                                    case 'ACTIVE':
                                        statusHTML = \`
                                            <div class="status-badge neon-active">
                                                <i class="fas fa-bolt"></i>
                                                <span>ACTIVE</span>
                                            </div>
                                        \`;
                                        break;
                                    case 'DEAD':
                                        statusHTML = \`
                                            <div class="status-badge neon-dead">
                                                <i class="fas fa-times-circle"></i>
                                                <span>DEAD</span>
                                            </div>
                                        \`;
                                        delayText = '∞ ms';
                                        break;
                                    default:
                                        statusHTML = \`
                                            <div class="status-badge" style="color: orange;">
                                                <i class="fas fa-question-circle"></i>
                                                <span>UNKNOWN</span>
                                            </div>
                                        \`;
                                }
                                
                                statusElement.innerHTML = statusHTML;
                                delayElement.textContent = delayText;

                            } catch (error) {
                                console.error('Health check error for \${ipPort}:', error);
                                statusElement.innerHTML = \`
                                    <div class="status-badge" style="color: cyan;">
                                        <i class="fas fa-exclamation-triangle"></i>
                                        <span>ERROR</span>
                                    </div>
                                \`;
                                delayElement.textContent = '! ms';
                            }
                            await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay between checks
                        }
                    };

                    checkAllProxies();
                    setInterval(checkAllProxies, 500); // Re-check all every 60 seconds
                });
                </script>

                <div class="quantum-pagination">
                ${prevPage}
                ${paginationButtons.join('')}
                ${nextPage}
            </div>
           
          <!-- Showing X to Y of Z Proxies message -->
          <div style="text-align: center; margin-top: 16px; color: var(--primary); font-family: 'Rajdhani', sans-serif;">
            Showing ${startIndex + 1} to ${endIndex} of ${totalFilteredConfigs} Proxies
           
 
      <footer>
    <div class="content">
        <div class="social-icons">
            <a href="#" class="social-icon">
                <i class="fab fa-facebook-f"></i>
            </a>
            <a href="#" class="social-icon">
                <i class="fab fa-twitter"></i>
            </a>
            <a href="#" class="social-icon">
                <i class="fab fa-instagram"></i>
            </a>
            <a href="#" class="social-icon">
                <i class="fab fa-linkedin-in"></i>
            </a>
        </div>
        <div class="copyright-fire">
            <p style="margin: 0; font-size: 0.9rem; font-weight: 600;">© GEO PROJECT</p>
        </div>
    </div>
</footer>
            </div>
                </div>
            </div>
        </div>
        

        <script>
function copy(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            Swal.fire({
                icon: 'success',
                background: 'rgba(6, 18, 67, 0.95)',
                color: 'white',
                title: 'URL Copied!',
                width: '200px',
                padding: '10px',
                text: text,
                timer: 1200,
                showConfirmButton: false,
                backdrop: 'rgba(0,0,0,0.4)',
                customClass: {
                    popup: 'swal-copy-popup',
                    title: 'swal-copy-title',
                    htmlContainer: 'swal-copy-content'
                }
            });
        })
        .catch(() => {
            Swal.fire({
                icon: 'error',
                title: 'Copy Failed',
                text: 'Please try again!',
                width: '220px',
                background: 'rgba(6, 18, 67, 0.95)',
                color: 'white',
                timer: 1500,
                showConfirmButton: false
            });
        });
}

const updateURL = (params) => {
    const url = new URL(window.location.href);

    params.forEach(({ key, value }) => {
        if (key === 'search' && value) {
            url.searchParams.set('page', '1');
        }
        if (value) {
            url.searchParams.set(key, value);
        } else {
            url.searchParams.delete(key);
        }
    });

    window.location.href = url.toString();
};

function goToHomePage(hostName) {
    const homeURL = 'https://' + hostName + '/web';
    window.location.href = homeURL;
}

function onWildcardChange(event) {
    updateURL([{ key: 'wildcard', value: event.target.value }]);
}

function onConfigTypeChange(event) {
    updateURL([{ key: 'configType', value: event.target.value }]);
}

function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = 'quantum-toast';
    toast.textContent = message;
    if (isError) {
        toast.style.background = '#ff3366';
    }
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

function executeSearch() {
    const query = document.getElementById('search-bar').value.trim();
    if (query) {
        updateURL([{ key: 'search', value: query }]);
    } else {
        Swal.fire({
            title: 'Error',
            width: '220px',
            text: 'Please enter a search term.',
            icon: 'error',
            background: 'rgba(6, 18, 67, 0.95)',
            color: 'white',
            timer: 1500,
            showConfirmButton: false,
            customClass: {
                popup: 'swal-popup-extra-small-text',
                title: 'swal-title-extra-small-text',
                content: 'swal-content-extra-small-text',
            }
        });
    }
}

document.getElementById('search-bar').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        executeSearch();
    }
});

document.getElementById('search-button').addEventListener('click', executeSearch);
</script>

<div id="wildcards-window" class="fixed hidden z-30 top-0 right-0 w-full h-full flex justify-center items-center">
  <div class="w-[75%] max-w-md h-auto flex flex-col gap-2 p-4 rounded-lg 
              bg-blue-500 bg-opacity-20 backdrop-blur-md 
              border border-blue-300 text-white"> 
      
      <!-- Input add domain -->
      <div class="flex w-full h-full gap-2 justify-between">
          <input id="new-domain-input" 
                 type="text" 
                 placeholder="Input wildcard" 
                 class="w-full px-4 py-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          <button id="add-domain-button" onclick="registerDomain()" 
                  class="p-2 rounded-full bg-blue-600 hover:bg-blue-700 flex justify-center items-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                  <path fill-rule="evenodd" d="M16.72 7.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l2.47-2.47H3a.75.75 0 0 1 0-1.5h16.19l-2.47-2.47a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/>
              </svg>
          </button>
      </div>

      <!-- Container list domain -->
      <div id="container-domains" 
           class="w-full h-32 rounded-md flex flex-col gap-1 overflow-y-scroll scrollbar-hide p-2 bg-gray-900 text-white">
      </div>
  
      <!-- Input delete domain -->
      <div class="flex w-full h-full gap-2 justify-between">
          <input id="delete-domain-input" 
                 type="number" 
                 placeholder="Input Nomor" 
                 class="w-full px-4 py-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          <input id="delete-domain-password" 
                 type="password" 
                 placeholder="Input Password" 
                 class="w-full px-4 py-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          <button id="delete-domain-button" onclick="deleteDomainByNumber()" 
                  class="p-2 rounded-full bg-red-600 hover:bg-red-700 flex justify-center items-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                  <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clip-rule="evenodd" />
              </svg>
          </button>
      </div>

      <!-- Loading indicator -->
      <div id="wildcard-loading" class="hidden w-full text-center">
          <div class="popup-progress">
              <div class="popup-progress-fill" id="popupProgress"></div>
          </div>
          <p style="margin-top: 10px; font-size: 0.9em; color: #aaa;">Loading...</p>
      </div>

      <!-- Close button -->
      <button onclick="toggleWildcardsWindow()" 
              class="mt-1 p-3 rounded-lg bg-red-500 hover:bg-red-600 text-xs font-semibold transition-colors duration-300 flex items-center justify-center gap-1 px-6 py-2 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clip-rule="evenodd"/>
          </svg>
          Close
      </button>
  </div>
</div>

    <script>
        let domains = [];
        const wildcardsWindow = document.getElementById('wildcards-window');
        const domainsContainer = document.getElementById('container-domains');
        
        async function loadDomains() {
            try {
                const response = await fetch('/api/v1/domains');
                if (response.ok) {
                    domains = await response.json();
                    domainsContainer.innerHTML = domains.map((d, i) => \`<div>\${i + 1}. \${d.hostname}</div>\`).join('');
                } else {
                    console.error('Failed to load domains');
                }
            } catch (error) {
                console.error('Error loading domains:', error);
            }
        }

        function toggleWildcardsWindow() {
            if (wildcardsWindow.classList.contains('hidden')) {
                loadDomains();
                wildcardsWindow.classList.remove('hidden');
            } else {
                wildcardsWindow.classList.add('hidden');
            }
        }

        function setLoadingState(isLoading) {
            const loading = document.getElementById('wildcard-loading');
            const newDomainInput = document.getElementById('new-domain-input');
            const addDomainButton = document.getElementById('add-domain-button');
            const deleteDomainInput = document.getElementById('delete-domain-input');
            const deleteDomainButton = document.getElementById('delete-domain-button');
            const progressFill = document.getElementById('popupProgress');

            if (isLoading) {
                loading.classList.remove('hidden');
                newDomainInput.disabled = true;
                addDomainButton.disabled = true;
                deleteDomainInput.disabled = true;
                deleteDomainButton.disabled = true;
                
                progressFill.style.width = '0%';
                // Use a timeout to ensure the transition is applied after the initial width is set
                setTimeout(() => {
                    progressFill.style.transition = 'width 2s ease-in-out';
                    progressFill.style.width = '80%';
                }, 100);

            } else {
                progressFill.style.width = '100%';
                setTimeout(() => {
                    loading.classList.add('hidden');
                    // Reset for next time
                    progressFill.style.width = '0%';
                    progressFill.style.transition = '';
                }, 500);

                newDomainInput.disabled = false;
                addDomainButton.disabled = false;
                deleteDomainInput.disabled = false;
                deleteDomainButton.disabled = false;
            }
        }

        async function registerDomain() {
            const input = document.getElementById('new-domain-input');
            const domain = input.value.trim();
            if (!domain) return;

            setLoadingState(true);

            try {
                const response = await fetch('/api/v1/domains', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ domain }),
                });
                if (response.ok) {
                    input.value = '';
                    await loadDomains();
                } else {
                    alert('Failed to register domain: ' + await response.text());
                }
            } catch (error) {
                console.error('Error registering domain:', error);
                alert('An error occurred while registering the domain.');
            } finally {
                setLoadingState(false);
            }
        }

        async function deleteDomainByNumber() {
            const numberInput = document.getElementById('delete-domain-input');
            const passwordInput = document.getElementById('delete-domain-password');
            const number = parseInt(numberInput.value, 10);
            const password = passwordInput.value;

            if (isNaN(number) || number < 1 || number > domains.length) {
                alert('Invalid number');
                return;
            }

            const domainToDelete = domains[number - 1];
            setLoadingState(true);

            try {
                const response = await fetch('/api/v1/domains', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: domainToDelete.id, password: password }),
                });

                if (response.ok) {
                    numberInput.value = '';
                    passwordInput.value = '';
                    await loadDomains();
                } else {
                    alert('Failed to delete domain: ' + await response.text());
                }
            } catch (error) {
                console.error('Error deleting domain:', error);
                alert('An error occurred while deleting the domain.');
            } finally {
                setLoadingState(false);
            }
        }
    </script>
</body>
</html>

  `, { headers: { 'Content-Type': 'text/html' } });
}

async function websockerHandler(request) {
  const webSocketPair = new WebSocketPair();
  const [client, webSocket] = Object.values(webSocketPair);

  webSocket.accept();

  let addressLog = "";
  let portLog = "";
  const log = (info, event) => {
    console.log(`[${addressLog}:${portLog}] ${info}`, event || "");
  };
  const earlyDataHeader = request.headers.get("sec-websocket-protocol") || "";

  const readableWebSocketStream = makeReadableWebSocketStream(webSocket, earlyDataHeader, log);

  let remoteSocketWrapper = {
    value: null,
  };
  let udpStreamWrite = null;
  let isDNS = false;

  readableWebSocketStream
    .pipeTo(
      new WritableStream({
        async write(chunk, controller) {
          if (isDNS && udpStreamWrite) {
            return udpStreamWrite(chunk);
          }
          if (remoteSocketWrapper.value) {
            const writer = remoteSocketWrapper.value.writable.getWriter();
            await writer.write(chunk);
            writer.releaseLock();
            return;
          }

          const protocol = await protocolSniffer(chunk);
          let protocolHeader;

          if (protocol === "Trojan") {
            protocolHeader = parseTrojanHeader(chunk);
          } else if (protocol === "VLESS") {
            protocolHeader = parseVlessHeader(chunk);
          } else if (protocol === "Shadowsocks") {
            protocolHeader = parseShadowsocksHeader(chunk);
          } else {
            parseVmessHeader(chunk);
            throw new Error("Unknown Protocol!");
          }

          addressLog = protocolHeader.addressRemote;
          portLog = `${protocolHeader.portRemote} -> ${protocolHeader.isUDP ? "UDP" : "TCP"}`;

          if (protocolHeader.hasError) {
            throw new Error(protocolHeader.message);
          }

          if (protocolHeader.isUDP) {
            if (protocolHeader.portRemote === 53) {
              isDNS = true;
            } else {
              throw new Error("UDP only support for DNS port 53");
            }
          }

          if (isDNS) {
            const { write } = await handleUDPOutbound(webSocket, protocolHeader.version, log);
            udpStreamWrite = write;
            udpStreamWrite(protocolHeader.rawClientData);
            return;
          }

          handleTCPOutBound(
            remoteSocketWrapper,
            protocolHeader.addressRemote,
            protocolHeader.portRemote,
            protocolHeader.rawClientData,
            webSocket,
            protocolHeader.version,
            log
          );
        },
        close() {
          log(`readableWebSocketStream is close`);
        },
        abort(reason) {
          log(`readableWebSocketStream is abort`, JSON.stringify(reason));
        },
      })
    )
    .catch((err) => {
      log("readableWebSocketStream pipeTo error", err);
    });

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}

async function protocolSniffer(buffer) {
  if (buffer.byteLength >= 62) {
    const trojanDelimiter = new Uint8Array(buffer.slice(56, 60));
    if (trojanDelimiter[0] === 0x0d && trojanDelimiter[1] === 0x0a) {
      if (trojanDelimiter[2] === 0x01 || trojanDelimiter[2] === 0x03 || trojanDelimiter[2] === 0x7f) {
        if (trojanDelimiter[3] === 0x01 || trojanDelimiter[3] === 0x03 || trojanDelimiter[3] === 0x04) {
          return "Trojan";
        }
      }
    }
  }

  const vlessDelimiter = new Uint8Array(buffer.slice(1, 17));
  // Hanya mendukung UUID v4
  if (arrayBufferToHex(vlessDelimiter).match(/^\w{8}\w{4}4\w{3}[89ab]\w{3}\w{12}$/)) {
    return "VLESS";
  }

  return "Shadowsocks"; // default
}

async function handleTCPOutBound(
  remoteSocket,
  addressRemote,
  portRemote,
  rawClientData,
  webSocket,
  responseHeader,
  log
) {
  async function connectAndWrite(address, port) {
    const tcpSocket = connect({
      hostname: address,
      port: port,
    });
    remoteSocket.value = tcpSocket;
    log(`connected to ${address}:${port}`);
    const writer = tcpSocket.writable.getWriter();
    await writer.write(rawClientData);
    writer.releaseLock();
    return tcpSocket;
  }

  async function retry() {
    const tcpSocket = await connectAndWrite(
      proxyIP.split(/[:=-]/)[0] || addressRemote,
      proxyIP.split(/[:=-]/)[1] || portRemote
    );
    tcpSocket.closed
      .catch((error) => {
        console.log("retry tcpSocket closed error", error);
      })
      .finally(() => {
        safeCloseWebSocket(webSocket);
      });
    remoteSocketToWS(tcpSocket, webSocket, responseHeader, null, log);
  }

  const tcpSocket = await connectAndWrite(addressRemote, portRemote);

  remoteSocketToWS(tcpSocket, webSocket, responseHeader, retry, log);
}

function makeReadableWebSocketStream(webSocketServer, earlyDataHeader, log) {
  let readableStreamCancel = false;
  const stream = new ReadableStream({
    start(controller) {
      webSocketServer.addEventListener("message", (event) => {
        if (readableStreamCancel) {
          return;
        }
        const message = event.data;
        controller.enqueue(message);
      });
      webSocketServer.addEventListener("close", () => {
        safeCloseWebSocket(webSocketServer);
        if (readableStreamCancel) {
          return;
        }
        controller.close();
      });
      webSocketServer.addEventListener("error", (err) => {
        log("webSocketServer has error");
        controller.error(err);
      });
      const { earlyData, error } = base64ToArrayBuffer(earlyDataHeader);
      if (error) {
        controller.error(error);
      } else if (earlyData) {
        controller.enqueue(earlyData);
      }
    },

    pull(controller) {},
    cancel(reason) {
      if (readableStreamCancel) {
        return;
      }
      log(`ReadableStream was canceled, due to ${reason}`);
      readableStreamCancel = true;
      safeCloseWebSocket(webSocketServer);
    },
  });

  return stream;
}

function parseVmessHeader(vmessBuffer) {
  // https://xtls.github.io/development/protocols/vmess.html#%E6%8C%87%E4%BB%A4%E9%83%A8%E5%88%86
}

function parseShadowsocksHeader(ssBuffer) {
  const view = new DataView(ssBuffer);

  const addressType = view.getUint8(0);
  let addressLength = 0;
  let addressValueIndex = 1;
  let addressValue = "";

  switch (addressType) {
    case 1:
      addressLength = 4;
      addressValue = new Uint8Array(ssBuffer.slice(addressValueIndex, addressValueIndex + addressLength)).join(".");
      break;
    case 3:
      addressLength = new Uint8Array(ssBuffer.slice(addressValueIndex, addressValueIndex + 1))[0];
      addressValueIndex += 1;
      addressValue = new TextDecoder().decode(ssBuffer.slice(addressValueIndex, addressValueIndex + addressLength));
      break;
    case 4:
      addressLength = 16;
      const dataView = new DataView(ssBuffer.slice(addressValueIndex, addressValueIndex + addressLength));
      const ipv6 = [];
      for (let i = 0; i < 8; i++) {
        ipv6.push(dataView.getUint16(i * 2).toString(16));
      }
      addressValue = ipv6.join(":");
      break;
    default:
      return {
        hasError: true,
        message: `Invalid addressType for Shadowsocks: ${addressType}`,
      };
  }

  if (!addressValue) {
    return {
      hasError: true,
      message: `Destination address empty, address type is: ${addressType}`,
    };
  }

  const portIndex = addressValueIndex + addressLength;
  const portBuffer = ssBuffer.slice(portIndex, portIndex + 2);
  const portRemote = new DataView(portBuffer).getUint16(0);
  return {
    hasError: false,
    addressRemote: addressValue,
    addressType: addressType,
    portRemote: portRemote,
    rawDataIndex: portIndex + 2,
    rawClientData: ssBuffer.slice(portIndex + 2),
    version: null,
    isUDP: portRemote == 53,
  };
}

function parseVlessHeader(vlessBuffer) {
  const version = new Uint8Array(vlessBuffer.slice(0, 1));
  let isUDP = false;

  const optLength = new Uint8Array(vlessBuffer.slice(17, 18))[0];

  const cmd = new Uint8Array(vlessBuffer.slice(18 + optLength, 18 + optLength + 1))[0];
  if (cmd === 1) {
  } else if (cmd === 2) {
    isUDP = true;
  } else {
    return {
      hasError: true,
      message: `command ${cmd} is not support, command 01-tcp,02-udp,03-mux`,
    };
  }
  const portIndex = 18 + optLength + 1;
  const portBuffer = vlessBuffer.slice(portIndex, portIndex + 2);
  const portRemote = new DataView(portBuffer).getUint16(0);

  let addressIndex = portIndex + 2;
  const addressBuffer = new Uint8Array(vlessBuffer.slice(addressIndex, addressIndex + 1));

  const addressType = addressBuffer[0];
  let addressLength = 0;
  let addressValueIndex = addressIndex + 1;
  let addressValue = "";
  switch (addressType) {
    case 1: // For IPv4
      addressLength = 4;
      addressValue = new Uint8Array(vlessBuffer.slice(addressValueIndex, addressValueIndex + addressLength)).join(".");
      break;
    case 2: // For Domain
      addressLength = new Uint8Array(vlessBuffer.slice(addressValueIndex, addressValueIndex + 1))[0];
      addressValueIndex += 1;
      addressValue = new TextDecoder().decode(vlessBuffer.slice(addressValueIndex, addressValueIndex + addressLength));
      break;
    case 3: // For IPv6
      addressLength = 16;
      const dataView = new DataView(vlessBuffer.slice(addressValueIndex, addressValueIndex + addressLength));
      const ipv6 = [];
      for (let i = 0; i < 8; i++) {
        ipv6.push(dataView.getUint16(i * 2).toString(16));
      }
      addressValue = ipv6.join(":");
      break;
    default:
      return {
        hasError: true,
        message: `invild  addressType is ${addressType}`,
      };
  }
  if (!addressValue) {
    return {
      hasError: true,
      message: `addressValue is empty, addressType is ${addressType}`,
    };
  }

  return {
    hasError: false,
    addressRemote: addressValue,
    addressType: addressType,
    portRemote: portRemote,
    rawDataIndex: addressValueIndex + addressLength,
    rawClientData: vlessBuffer.slice(addressValueIndex + addressLength),
    version: new Uint8Array([version[0], 0]),
    isUDP: isUDP,
  };
}

function parseTrojanHeader(buffer) {
  const socks5DataBuffer = buffer.slice(58);
  if (socks5DataBuffer.byteLength < 6) {
    return {
      hasError: true,
      message: "invalid SOCKS5 request data",
    };
  }

  let isUDP = false;
  const view = new DataView(socks5DataBuffer);
  const cmd = view.getUint8(0);
  if (cmd == 3) {
    isUDP = true;
  } else if (cmd != 1) {
    throw new Error("Unsupported command type!");
  }

  let addressType = view.getUint8(1);
  let addressLength = 0;
  let addressValueIndex = 2;
  let addressValue = "";
  switch (addressType) {
    case 1: // For IPv4
      addressLength = 4;
      addressValue = new Uint8Array(socks5DataBuffer.slice(addressValueIndex, addressValueIndex + addressLength)).join(
        "."
      );
      break;
    case 3: // For Domain
      addressLength = new Uint8Array(socks5DataBuffer.slice(addressValueIndex, addressValueIndex + 1))[0];
      addressValueIndex += 1;
      addressValue = new TextDecoder().decode(
        socks5DataBuffer.slice(addressValueIndex, addressValueIndex + addressLength)
      );
      break;
    case 4: // For IPv6
      addressLength = 16;
      const dataView = new DataView(socks5DataBuffer.slice(addressValueIndex, addressValueIndex + addressLength));
      const ipv6 = [];
      for (let i = 0; i < 8; i++) {
        ipv6.push(dataView.getUint16(i * 2).toString(16));
      }
      addressValue = ipv6.join(":");
      break;
    default:
      return {
        hasError: true,
        message: `invalid addressType is ${addressType}`,
      };
  }

  if (!addressValue) {
    return {
      hasError: true,
      message: `address is empty, addressType is ${addressType}`,
    };
  }

  const portIndex = addressValueIndex + addressLength;
  const portBuffer = socks5DataBuffer.slice(portIndex, portIndex + 2);
  const portRemote = new DataView(portBuffer).getUint16(0);
  return {
    hasError: false,
    addressRemote: addressValue,
    addressType: addressType,
    portRemote: portRemote,
    rawDataIndex: portIndex + 4,
    rawClientData: socks5DataBuffer.slice(portIndex + 4),
    version: null,
    isUDP: isUDP,
  };
}

async function remoteSocketToWS(remoteSocket, webSocket, responseHeader, retry, log) {
  let header = responseHeader;
  let hasIncomingData = false;
  await remoteSocket.readable
    .pipeTo(
      new WritableStream({
        start() {},
        async write(chunk, controller) {
          hasIncomingData = true;
          if (webSocket.readyState !== WS_READY_STATE_OPEN) {
            controller.error("webSocket.readyState is not open, maybe close");
          }
          if (header) {
            webSocket.send(await new Blob([header, chunk]).arrayBuffer());
            header = null;
          } else {
            webSocket.send(chunk);
          }
        },
        close() {
          log(`remoteConnection!.readable is close with hasIncomingData is ${hasIncomingData}`);
        },
        abort(reason) {
          console.error(`remoteConnection!.readable abort`, reason);
        },
      })
    )
    .catch((error) => {
      console.error(`remoteSocketToWS has exception `, error.stack || error);
      safeCloseWebSocket(webSocket);
    });
  if (hasIncomingData === false && retry) {
    log(`retry`);
    retry();
  }
}

function base64ToArrayBuffer(base64Str) {
  if (!base64Str) {
    return { error: null };
  }
  try {
    base64Str = base64Str.replace(/-/g, "+").replace(/_/g, "/");
    const decode = atob(base64Str);
    const arryBuffer = Uint8Array.from(decode, (c) => c.charCodeAt(0));
    return { earlyData: arryBuffer.buffer, error: null };
  } catch (error) {
    return { error };
  }
}

function arrayBufferToHex(buffer) {
  return [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

async function handleUDPOutbound(webSocket, responseHeader, log) {
  let isVlessHeaderSent = false;
  const transformStream = new TransformStream({
    start(controller) {},
    transform(chunk, controller) {
      for (let index = 0; index < chunk.byteLength; ) {
        const lengthBuffer = chunk.slice(index, index + 2);
        const udpPakcetLength = new DataView(lengthBuffer).getUint16(0);
        const udpData = new Uint8Array(chunk.slice(index + 2, index + 2 + udpPakcetLength));
        index = index + 2 + udpPakcetLength;
        controller.enqueue(udpData);
      }
    },
    flush(controller) {},
  });
  transformStream.readable
    .pipeTo(
      new WritableStream({
        async write(chunk) {
          const resp = await fetch("https://1.1.1.1/dns-query", {
            method: "POST",
            headers: {
              "content-type": "application/dns-message",
            },
            body: chunk,
          });
          const dnsQueryResult = await resp.arrayBuffer();
          const udpSize = dnsQueryResult.byteLength;
          const udpSizeBuffer = new Uint8Array([(udpSize >> 8) & 0xff, udpSize & 0xff]);
          if (webSocket.readyState === WS_READY_STATE_OPEN) {
            log(`doh success and dns message length is ${udpSize}`);
            if (isVlessHeaderSent) {
              webSocket.send(await new Blob([udpSizeBuffer, dnsQueryResult]).arrayBuffer());
            } else {
              webSocket.send(await new Blob([responseHeader, udpSizeBuffer, dnsQueryResult]).arrayBuffer());
              isVlessHeaderSent = true;
            }
          }
        },
      })
    )
    .catch((error) => {
      log("dns udp has error" + error);
    });

  const writer = transformStream.writable.getWriter();

  return {
    write(chunk) {
      writer.write(chunk);
    },
  };
}

function safeCloseWebSocket(socket) {
  try {
    if (socket.readyState === WS_READY_STATE_OPEN || socket.readyState === WS_READY_STATE_CLOSING) {
      socket.close();
    }
  } catch (error) {
    console.error("safeCloseWebSocket error", error);
  }
}
// Fungsi untuk mengonversi countryCode menjadi emoji bendera
const getEmojiFlag = (countryCode) => {
  if (!countryCode || countryCode.length !== 2) return ''; // Validasi input
  return String.fromCodePoint(
    ...[...countryCode.toUpperCase()].map(char => 0x1F1E6 + char.charCodeAt(0) - 65)
  );
};
async function generateClashSub(type, bug, geo81, tls, country = null, limit = null) {
  const proxyList = await getProxyList();
  let ips = proxyList.map(p => `${p.proxyIP},${p.proxyPort},${p.country},${p.org}`);
  if (country && country.toLowerCase() === 'random') {
    // Pilih data secara acak jika country=random
    ips = ips.sort(() => Math.random() - 0.5); // Acak daftar proxy
  } else if (country) {
    // Filter berdasarkan country jika bukan "random"
    ips = ips.filter(line => {
      const parts = line.split(',');
      if (parts.length > 1) {
        const lineCountry = parts[2].toUpperCase();
        return lineCountry === country.toUpperCase();
      }
      return false;
    });
  }
  
  if (limit && !isNaN(limit)) {
    ips = ips.slice(0, limit); // Batasi jumlah proxy berdasarkan limit
  }
  
  let conf = '';
  let bex = '';
  let count = 1;
  
  for (let line of ips) {
    const parts = line.split(',');
    const proxyHost = parts[0];
    const proxyPort = parts[1] || 443;
    const emojiFlag = getEmojiFlag(line.split(',')[2]); // Konversi ke emoji bendera
    const sanitize = (text) => text.replace(/[\n\r]+/g, "").trim(); // Hapus newline dan spasi ekstra
    let ispName = sanitize(`${emojiFlag} (${line.split(',')[2]}) ${line.split(',')[3]} ${count ++}`);
    const UUIDS = `${generateUUIDv4()}`;
    const ports = tls ? '443' : '80';
    const snio = tls ? `\n  servername: ${geo81}` : '';
    const snioo = tls ? `\n  cipher: auto` : '';
    if (type === 'vless') {
      bex += `  - ${ispName}\n`
      conf += `
- name: ${ispName}
  server: ${bug}
  port: ${ports}
  type: vless
  uuid: ${UUIDS}${snioo}
  tls: ${tls}
  udp: true
  skip-cert-verify: true
  network: ws${snio}
  ws-opts:
    path: ${pathinfo}${proxyHost}=${proxyPort}
    headers:
      Host: ${geo81}`;
    } else if (type === 'trojan') {
      bex += `  - ${ispName}\n`
      conf += `
- name: ${ispName}
  server: ${bug}
  port: 443
  type: trojan
  password: ${UUIDS}
  udp: true
  skip-cert-verify: true
  network: ws
  sni: ${geo81}
  ws-opts:
    path: ${pathinfo}${proxyHost}=${proxyPort}
    headers:
      Host: ${geo81}`;
    } else if (type === 'ss') {
      bex += `  - ${ispName}\n`
      conf += `
- name: ${ispName}
  type: ss
  server: ${bug}
  port: ${ports}
  cipher: none
  password: ${UUIDS}
  udp: true
  plugin: v2ray-plugin
  plugin-opts:
    mode: websocket
    tls: ${tls}
    skip-cert-verify: true
    host: ${geo81}
    path: ${pathinfo}${proxyHost}=${proxyPort}
    mux: false
    headers:
      custom: ${geo81}`;
    } else if (type === 'mix') {
      bex += `  - ${ispName} vless\n  - ${ispName} trojan\n  - ${ispName} ss\n`;
      conf += `
- name: ${ispName} vless
  server: ${bug}
  port: ${ports}
  type: vless
  uuid: ${UUIDS}
  cipher: auto
  tls: ${tls}
  udp: true
  skip-cert-verify: true
  network: ws${snio}
  ws-opts:
    path: ${pathinfo}${proxyHost}=${proxyPort}
    headers:
      Host: ${geo81}
- name: ${ispName} trojan
  server: ${bug}
  port: 443
  type: trojan
  password: ${UUIDS}
  udp: true
  skip-cert-verify: true
  network: ws
  sni: ${geo81}
  ws-opts:
    path: ${pathinfo}${proxyHost}=${proxyPort}
    headers:
      Host: ${geo81}
- name: ${ispName} ss
  type: ss
  server: ${bug}
  port: ${ports}
  cipher: none
  password: ${UUIDS}
  udp: true
  plugin: v2ray-plugin
  plugin-opts:
    mode: websocket
    tls: ${tls}
    skip-cert-verify: true
    host: ${geo81}
    path: ${pathinfo}${proxyHost}=${proxyPort}
    mux: false
    headers:
      custom: ${geo81}`;
    }
  }
  return `#### BY : GEO PROJECT #### 

port: 7890
socks-port: 7891
redir-port: 7892
mixed-port: 7893
tproxy-port: 7895
ipv6: false
mode: rule
log-level: silent
allow-lan: true
external-controller: 0.0.0.0:9090
secret: ""
bind-address: "*"
unified-delay: true
profile:
  store-selected: true
  store-fake-ip: true
dns:
  enable: true
  ipv6: false
  use-host: true
  enhanced-mode: fake-ip
  listen: 0.0.0.0:7874
  nameserver:
    - 8.8.8.8
    - 1.0.0.1
    - https://dns.google/dns-query
  fallback:
    - 1.1.1.1
    - 8.8.4.4
    - https://cloudflare-dns.com/dns-query
    - 112.215.203.254
  default-nameserver:
    - 8.8.8.8
    - 1.1.1.1
    - 112.215.203.254
  fake-ip-range: 198.18.0.1/16
  fake-ip-filter:
    - "*.lan"
    - "*.localdomain"
    - "*.example"
    - "*.invalid"
    - "*.localhost"
    - "*.test"
    - "*.local"
    - "*.home.arpa"
    - time.*.com
    - time.*.gov
    - time.*.edu.cn
    - time.*.apple.com
    - time1.*.com
    - time2.*.com
    - time3.*.com
    - time4.*.com
    - time5.*.com
    - time6.*.com
    - time7.*.com
    - ntp.*.com
    - ntp1.*.com
    - ntp2.*.com
    - ntp3.*.com
    - ntp4.*.com
    - ntp5.*.com
    - ntp6.*.com
    - ntp7.*.com
    - "*.time.edu.cn"
    - "*.ntp.org.cn"
    - +.pool.ntp.org
    - time1.cloud.tencent.com
    - music.163.com
    - "*.music.163.com"
    - "*.126.net"
    - musicapi.taihe.com
    - music.taihe.com
    - songsearch.kugou.com
    - trackercdn.kugou.com
    - "*.kuwo.cn"
    - api-jooxtt.sanook.com
    - api.joox.com
    - joox.com
    - y.qq.com
    - "*.y.qq.com"
    - streamoc.music.tc.qq.com
    - mobileoc.music.tc.qq.com
    - isure.stream.qqmusic.qq.com
    - dl.stream.qqmusic.qq.com
    - aqqmusic.tc.qq.com
    - amobile.music.tc.qq.com
    - "*.xiami.com"
    - "*.music.migu.cn"
    - music.migu.cn
    - "*.msftconnecttest.com"
    - "*.msftncsi.com"
    - msftconnecttest.com
    - msftncsi.com
    - localhost.ptlogin2.qq.com
    - localhost.sec.qq.com
    - +.srv.nintendo.net
    - +.stun.playstation.net
    - xbox.*.microsoft.com
    - xnotify.xboxlive.com
    - +.battlenet.com.cn
    - +.wotgame.cn
    - +.wggames.cn
    - +.wowsgame.cn
    - +.wargaming.net
    - proxy.golang.org
    - stun.*.*
    - stun.*.*.*
    - +.stun.*.*
    - +.stun.*.*.*
    - +.stun.*.*.*.*
    - heartbeat.belkin.com
    - "*.linksys.com"
    - "*.linksyssmartwifi.com"
    - "*.router.asus.com"
    - mesu.apple.com
    - swscan.apple.com
    - swquery.apple.com
    - swdownload.apple.com
    - swcdn.apple.com
    - swdist.apple.com
    - lens.l.google.com
    - stun.l.google.com
    - +.nflxvideo.net
    - "*.square-enix.com"
    - "*.finalfantasyxiv.com"
    - "*.ffxiv.com"
    - "*.mcdn.bilivideo.cn"
    - +.media.dssott.com
proxies:${conf}
proxy-groups:
- name: INTERNET
  type: select
  disable-udp: true
  proxies:
  - BEST-PING
${bex}- name: ADS
  type: select
  disable-udp: false
  proxies:
  - REJECT
  - INTERNET
- name: BEST-PING
  type: url-test
  url: https://detectportal.firefox.com/success.txt
  interval: 60
  proxies:
${bex}rule-providers:
  rule_hijacking:
    type: file
    behavior: classical
    path: "./rule_provider/rule_hijacking.yaml"
    url: https://raw.githubusercontent.com/malikshi/open_clash/main/rule_provider/rule_hijacking.yaml
  rule_privacy:
    type: file
    behavior: classical
    url: https://raw.githubusercontent.com/malikshi/open_clash/main/rule_provider/rule_privacy.yaml
    path: "./rule_provider/rule_privacy.yaml"
  rule_basicads:
    type: file
    behavior: domain
    url: https://raw.githubusercontent.com/malikshi/open_clash/main/rule_provider/rule_basicads.yaml
    path: "./rule_provider/rule_basicads.yaml"
  rule_personalads:
    type: file
    behavior: classical
    url: https://raw.githubusercontent.com/malikshi/open_clash/main/rule_provider/rule_personalads.yaml
    path: "./rule_provider/rule_personalads.yaml"
rules:
- IP-CIDR,198.18.0.1/16,REJECT,no-resolve
- RULE-SET,rule_personalads,ADS
- RULE-SET,rule_basicads,ADS
- RULE-SET,rule_hijacking,ADS
- RULE-SET,rule_privacy,ADS
- MATCH,INTERNET`;
}
async function generateSurfboardSub(type, bug, geo81, tls, country = null, limit = null) {
  const proxyList = await getProxyList();
  let ips = proxyList.map(p => `${p.proxyIP},${p.proxyPort},${p.country},${p.org}`);
  if (country && country.toLowerCase() === 'random') {
    // Pilih data secara acak jika country=random
    ips = ips.sort(() => Math.random() - 0.5); // Acak daftar proxy
  } else if (country) {
    // Filter berdasarkan country jika bukan "random"
    ips = ips.filter(line => {
      const parts = line.split(',');
      if (parts.length > 1) {
        const lineCountry = parts[2].toUpperCase();
        return lineCountry === country.toUpperCase();
      }
      return false;
    });
  }
  if (limit && !isNaN(limit)) {
    ips = ips.slice(0, limit); // Batasi jumlah proxy berdasarkan limit
  }
  let conf = '';
  let bex = '';
  let count = 1;
  
  for (let line of ips) {
    const parts = line.split(',');
    const proxyHost = parts[0];
    const proxyPort = parts[1] || 443;
    const emojiFlag = getEmojiFlag(line.split(',')[2]); // Konversi ke emoji bendera
    const sanitize = (text) => text.replace(/[\n\r]+/g, "").trim(); // Hapus newline dan spasi ekstra
    let ispName = sanitize(`${emojiFlag} (${line.split(',')[2]}) ${line.split(',')[3]} ${count ++}`);
    const UUIDS = `${generateUUIDv4()}`;
    if (type === 'trojan') {
      bex += `${ispName},`
      conf += `
${ispName} = trojan, ${bug}, 443, password = ${UUIDS}, udp-relay = true, skip-cert-verify = true, sni = ${geo81}, ws = true, ws-path = ${pathinfo}${proxyHost}:${proxyPort}, ws-headers = Host:"${geo81}"\n`;
    }
  }
  return `#### BY : GEO PROJECT ####

[General]
dns-server = system, 108.137.44.39, 108.137.44.9, puredns.org:853

[Proxy]
${conf}

[Proxy Group]
Select Group = select,Load Balance,Best Ping,FallbackGroup,${bex}
Load Balance = load-balance,${bex}
Best Ping = url-test,${bex} url=http://www.gstatic.com/generate_204, interval=600, tolerance=100, timeout=5
FallbackGroup = fallback,${bex} url=http://www.gstatic.com/generate_204, interval=600, timeout=5
AdBlock = select,REJECT,Select Group

[Rule]
MATCH,Select Group
DOMAIN-SUFFIX,pagead2.googlesyndication.com, AdBlock
DOMAIN-SUFFIX,pagead2.googleadservices.com, AdBlock
DOMAIN-SUFFIX,afs.googlesyndication.com, AdBlock
DOMAIN-SUFFIX,ads.google.com, AdBlock
DOMAIN-SUFFIX,adservice.google.com, AdBlock
DOMAIN-SUFFIX,googleadservices.com, AdBlock
DOMAIN-SUFFIX,static.media.net, AdBlock
DOMAIN-SUFFIX,media.net, AdBlock
DOMAIN-SUFFIX,adservetx.media.net, AdBlock
DOMAIN-SUFFIX,mediavisor.doubleclick.net, AdBlock
DOMAIN-SUFFIX,m.doubleclick.net, AdBlock
DOMAIN-SUFFIX,static.doubleclick.net, AdBlock
DOMAIN-SUFFIX,doubleclick.net, AdBlock
DOMAIN-SUFFIX,ad.doubleclick.net, AdBlock
DOMAIN-SUFFIX,fastclick.com, AdBlock
DOMAIN-SUFFIX,fastclick.net, AdBlock
DOMAIN-SUFFIX,media.fastclick.net, AdBlock
DOMAIN-SUFFIX,cdn.fastclick.net, AdBlock
DOMAIN-SUFFIX,adtago.s3.amazonaws.com, AdBlock
DOMAIN-SUFFIX,analyticsengine.s3.amazonaws.com, AdBlock
DOMAIN-SUFFIX,advice-ads.s3.amazonaws.com, AdBlock
DOMAIN-SUFFIX,affiliationjs.s3.amazonaws.com, AdBlock
DOMAIN-SUFFIX,advertising-api-eu.amazon.com, AdBlock
DOMAIN-SUFFIX,amazonclix.com, AdBlock, AdBlock
DOMAIN-SUFFIX,assoc-amazon.com, AdBlock
DOMAIN-SUFFIX,ads.yahoo.com, AdBlock
DOMAIN-SUFFIX,adserver.yahoo.com, AdBlock
DOMAIN-SUFFIX,global.adserver.yahoo.com, AdBlock
DOMAIN-SUFFIX,us.adserver.yahoo.com, AdBlock
DOMAIN-SUFFIX,adspecs.yahoo.com, AdBlock
DOMAIN-SUFFIX,br.adspecs.yahoo.com, AdBlock
DOMAIN-SUFFIX,latam.adspecs.yahoo.com, AdBlock
DOMAIN-SUFFIX,ush.adspecs.yahoo.com, AdBlock
DOMAIN-SUFFIX,advertising.yahoo.com, AdBlock
DOMAIN-SUFFIX,de.advertising.yahoo.com, AdBlock
DOMAIN-SUFFIX,es.advertising.yahoo.com, AdBlock
DOMAIN-SUFFIX,fr.advertising.yahoo.com, AdBlock
DOMAIN-SUFFIX,in.advertising.yahoo.com, AdBlock
DOMAIN-SUFFIX,it.advertising.yahoo.com, AdBlock
DOMAIN-SUFFIX,sea.advertising.yahoo.com, AdBlock
DOMAIN-SUFFIX,uk.advertising.yahoo.com, AdBlock
DOMAIN-SUFFIX,analytics.yahoo.com, AdBlock
DOMAIN-SUFFIX,cms.analytics.yahoo.com, AdBlock
DOMAIN-SUFFIX,opus.analytics.yahoo.com, AdBlock
DOMAIN-SUFFIX,sp.analytics.yahoo.com, AdBlock
DOMAIN-SUFFIX,comet.yahoo.com, AdBlock
DOMAIN-SUFFIX,log.fc.yahoo.com, AdBlock
DOMAIN-SUFFIX,ganon.yahoo.com, AdBlock
DOMAIN-SUFFIX,gemini.yahoo.com, AdBlock
DOMAIN-SUFFIX,beap.gemini.yahoo.com, AdBlock
DOMAIN-SUFFIX,geo.yahoo.com, AdBlock
DOMAIN-SUFFIX,marketingsolutions.yahoo.com, AdBlock
DOMAIN-SUFFIX,pclick.yahoo.com, AdBlock
DOMAIN-SUFFIX,analytics.query.yahoo.com, AdBlock
DOMAIN-SUFFIX,geo.query.yahoo.com, AdBlock
DOMAIN-SUFFIX,onepush.query.yahoo.com, AdBlock
DOMAIN-SUFFIX,bats.video.yahoo.com, AdBlock
DOMAIN-SUFFIX,visit.webhosting.yahoo.com, AdBlock
DOMAIN-SUFFIX,ads.yap.yahoo.com, AdBlock
DOMAIN-SUFFIX,m.yap.yahoo.com, AdBlock
DOMAIN-SUFFIX,partnerads.ysm.yahoo.com, AdBlock
DOMAIN-SUFFIX,appmetrica.yandex.com, AdBlock
DOMAIN-SUFFIX,redirect.appmetrica.yandex.com, AdBlock
DOMAIN-SUFFIX,19534.redirect.appmetrica.yandex.com, AdBlock
DOMAIN-SUFFIX,3.redirect.appmetrica.yandex.com, AdBlock
DOMAIN-SUFFIX,30488.redirect.appmetrica.yandex.com, AdBlock
DOMAIN-SUFFIX,4.redirect.appmetrica.yandex.com, AdBlock
DOMAIN-SUFFIX,report.appmetrica.yandex.net, AdBlock
DOMAIN-SUFFIX,extmaps-api.yandex.net, AdBlock
DOMAIN-SUFFIX,analytics.mobile.yandex.net, AdBlock
DOMAIN-SUFFIX,banners.mobile.yandex.net, AdBlock
DOMAIN-SUFFIX,banners-slb.mobile.yandex.net, AdBlock
DOMAIN-SUFFIX,startup.mobile.yandex.net, AdBlock
DOMAIN-SUFFIX,offerwall.yandex.net, AdBlock
DOMAIN-SUFFIX,adfox.yandex.ru, AdBlock
DOMAIN-SUFFIX,matchid.adfox.yandex.ru, AdBlock
DOMAIN-SUFFIX,adsdk.yandex.ru, AdBlock
DOMAIN-SUFFIX,an.yandex.ru, AdBlock
DOMAIN-SUFFIX,redirect.appmetrica.yandex.ru, AdBlock
DOMAIN-SUFFIX,awaps.yandex.ru, AdBlock
DOMAIN-SUFFIX,awsync.yandex.ru, AdBlock
DOMAIN-SUFFIX,bs.yandex.ru, AdBlock
DOMAIN-SUFFIX,bs-meta.yandex.ru, AdBlock
DOMAIN-SUFFIX,clck.yandex.ru, AdBlock
DOMAIN-SUFFIX,informer.yandex.ru, AdBlock
DOMAIN-SUFFIX,kiks.yandex.ru, AdBlock
DOMAIN-SUFFIX,grade.market.yandex.ru, AdBlock
DOMAIN-SUFFIX,mc.yandex.ru, AdBlock
DOMAIN-SUFFIX,metrika.yandex.ru, AdBlock
DOMAIN-SUFFIX,click.sender.yandex.ru, AdBlock
DOMAIN-SUFFIX,share.yandex.ru, AdBlock
DOMAIN-SUFFIX,yandexadexchange.net, AdBlock
DOMAIN-SUFFIX,mobile.yandexadexchange.net, AdBlock
DOMAIN-SUFFIX,google-analytics.com, AdBlock
DOMAIN-SUFFIX,ssl.google-analytics.com, AdBlock
DOMAIN-SUFFIX,api-hotjar.com, AdBlock
DOMAIN-SUFFIX,hotjar-analytics.com, AdBlock
DOMAIN-SUFFIX,hotjar.com, AdBlock
DOMAIN-SUFFIX,static.hotjar.com, AdBlock
DOMAIN-SUFFIX,mouseflow.com, AdBlock
DOMAIN-SUFFIX,a.mouseflow.com, AdBlock
DOMAIN-SUFFIX,freshmarketer.com, AdBlock
DOMAIN-SUFFIX,luckyorange.com, AdBlock
DOMAIN-SUFFIX,luckyorange.net, AdBlock
DOMAIN-SUFFIX,cdn.luckyorange.com, AdBlock
DOMAIN-SUFFIX,w1.luckyorange.com, AdBlock
DOMAIN-SUFFIX,upload.luckyorange.net, AdBlock
DOMAIN-SUFFIX,cs.luckyorange.net, AdBlock
DOMAIN-SUFFIX,settings.luckyorange.net, AdBlock
DOMAIN-SUFFIX,stats.wp.com, AdBlock
DOMAIN-SUFFIX,notify.bugsnag.com, AdBlock
DOMAIN-SUFFIX,sessions.bugsnag.com, AdBlock
DOMAIN-SUFFIX,api.bugsnag.com, AdBlock
DOMAIN-SUFFIX,app.bugsnag.com, AdBlock
DOMAIN-SUFFIX,browser.sentry-cdn.com, AdBlock
DOMAIN-SUFFIX,app.getsentry.com, AdBlock
DOMAIN-SUFFIX,pixel.facebook.com, AdBlock
DOMAIN-SUFFIX,analytics.facebook.com, AdBlock
DOMAIN-SUFFIX,ads.facebook.com, AdBlock
DOMAIN-SUFFIX,an.facebook.com, AdBlock
DOMAIN-SUFFIX,ads-api.twitter.com, AdBlock
DOMAIN-SUFFIX,advertising.twitter.com, AdBlock
DOMAIN-SUFFIX,ads-twitter.com, AdBlock
DOMAIN-SUFFIX,static.ads-twitter.com, AdBlock
DOMAIN-SUFFIX,ads.linkedin.com, AdBlock
DOMAIN-SUFFIX,analytics.pointdrive.linkedin.com, AdBlock
DOMAIN-SUFFIX,ads.pinterest.com, AdBlock
DOMAIN-SUFFIX,log.pinterest.com, AdBlock
DOMAIN-SUFFIX,ads-dev.pinterest.com, AdBlock
DOMAIN-SUFFIX,analytics.pinterest.com, AdBlock
DOMAIN-SUFFIX,trk.pinterest.com, AdBlock
DOMAIN-SUFFIX,trk2.pinterest.com, AdBlock
DOMAIN-SUFFIX,widgets.pinterest.com, AdBlock
DOMAIN-SUFFIX,ads.reddit.com, AdBlock
DOMAIN-SUFFIX,rereddit.com, AdBlock
DOMAIN-SUFFIX,events.redditmedia.com, AdBlock
DOMAIN-SUFFIX,d.reddit.com, AdBlock
DOMAIN-SUFFIX,ads-sg.tiktok.com, AdBlock
DOMAIN-SUFFIX,analytics-sg.tiktok.com, AdBlock
DOMAIN-SUFFIX,ads.tiktok.com, AdBlock
DOMAIN-SUFFIX,analytics.tiktok.com, AdBlock
DOMAIN-SUFFIX,ads.youtube.com, AdBlock
DOMAIN-SUFFIX,youtube.cleverads.vn, AdBlock
DOMAIN-SUFFIX,ads.yahoo.com, AdBlock
DOMAIN-SUFFIX,adserver.yahoo.com, AdBlock
DOMAIN-SUFFIX,global.adserver.yahoo.com, AdBlock
DOMAIN-SUFFIX,us.adserver.yahoo.com, AdBlock
DOMAIN-SUFFIX,adspecs.yahoo.com, AdBlock
DOMAIN-SUFFIX,advertising.yahoo.com, AdBlock
DOMAIN-SUFFIX,analytics.yahoo.com, AdBlock
DOMAIN-SUFFIX,analytics.query.yahoo.com, AdBlock
DOMAIN-SUFFIX,ads.yap.yahoo.com, AdBlock
DOMAIN-SUFFIX,m.yap.yahoo.com, AdBlock
DOMAIN-SUFFIX,partnerads.ysm.yahoo.com, AdBlock
DOMAIN-SUFFIX,appmetrica.yandex.com, AdBlock
DOMAIN-SUFFIX,redirect.appmetrica.yandex.com, AdBlock
DOMAIN-SUFFIX,19534.redirect.appmetrica.yandex.com, AdBlock
DOMAIN-SUFFIX,3.redirect.appmetrica.yandex.com, AdBlock
DOMAIN-SUFFIX,30488.redirect.appmetrica.yandex.com, AdBlock
DOMAIN-SUFFIX,4.redirect.appmetrica.yandex.com, AdBlock
DOMAIN-SUFFIX,report.appmetrica.yandex.net, AdBlock
DOMAIN-SUFFIX,extmaps-api.yandex.net, AdBlock
DOMAIN-SUFFIX,analytics.mobile.yandex.net, AdBlock
DOMAIN-SUFFIX,banners.mobile.yandex.net, AdBlock
DOMAIN-SUFFIX,banners-slb.mobile.yandex.net, AdBlock
DOMAIN-SUFFIX,startup.mobile.yandex.net, AdBlock
DOMAIN-SUFFIX,offerwall.yandex.net, AdBlock
DOMAIN-SUFFIX,adfox.yandex.ru, AdBlock
DOMAIN-SUFFIX,matchid.adfox.yandex.ru, AdBlock
DOMAIN-SUFFIX,adsdk.yandex.ru, AdBlock
DOMAIN-SUFFIX,an.yandex.ru, AdBlock
DOMAIN-SUFFIX,redirect.appmetrica.yandex.ru, AdBlock
DOMAIN-SUFFIX,awaps.yandex.ru, AdBlock
DOMAIN-SUFFIX,awsync.yandex.ru, AdBlock
DOMAIN-SUFFIX,bs.yandex.ru, AdBlock
DOMAIN-SUFFIX,bs-meta.yandex.ru, AdBlock
DOMAIN-SUFFIX,clck.yandex.ru, AdBlock
DOMAIN-SUFFIX,informer.yandex.ru, AdBlock
DOMAIN-SUFFIX,kiks.yandex.ru, AdBlock
DOMAIN-SUFFIX,grade.market.yandex.ru, AdBlock
DOMAIN-SUFFIX,mc.yandex.ru, AdBlock
DOMAIN-SUFFIX,metrika.yandex.ru, AdBlock
DOMAIN-SUFFIX,click.sender.yandex.ru, AdBlock
DOMAIN-SUFFIX,share.yandex.ru, AdBlock
DOMAIN-SUFFIX,yandexadexchange.net, AdBlock
DOMAIN-SUFFIX,mobile.yandexadexchange.net, AdBlock
DOMAIN-SUFFIX,bdapi-in-ads.realmemobile.com, AdBlock
DOMAIN-SUFFIX,adsfs.oppomobile.com, AdBlock
DOMAIN-SUFFIX,adx.ads.oppomobile.com, AdBlock
DOMAIN-SUFFIX,bdapi.ads.oppomobile.com, AdBlock
DOMAIN-SUFFIX,ck.ads.oppomobile.com, AdBlock
DOMAIN-SUFFIX,data.ads.oppomobile.com, AdBlock
DOMAIN-SUFFIX,g1.ads.oppomobile.com, AdBlock
DOMAIN-SUFFIX,api.ad.xiaomi.com, AdBlock
DOMAIN-SUFFIX,app.chat.xiaomi.net, AdBlock
DOMAIN-SUFFIX,data.mistat.xiaomi.com, AdBlock
DOMAIN-SUFFIX,data.mistat.intl.xiaomi.com, AdBlock
DOMAIN-SUFFIX,data.mistat.india.xiaomi.com, AdBlock
DOMAIN-SUFFIX,data.mistat.rus.xiaomi.com, AdBlock
DOMAIN-SUFFIX,sdkconfig.ad.xiaomi.com, AdBlock
DOMAIN-SUFFIX,sdkconfig.ad.intl.xiaomi.com, AdBlock
DOMAIN-SUFFIX,globalapi.ad.xiaomi.com, AdBlock
DOMAIN-SUFFIX,www.cdn.ad.xiaomi.com, AdBlock
DOMAIN-SUFFIX,tracking.miui.com, AdBlock
DOMAIN-SUFFIX,sa.api.intl.miui.com, AdBlock
DOMAIN-SUFFIX,tracking.miui.com, AdBlock
DOMAIN-SUFFIX,tracking.intl.miui.com, AdBlock
DOMAIN-SUFFIX,tracking.india.miui.com, AdBlock
DOMAIN-SUFFIX,tracking.rus.miui.com, AdBlock
DOMAIN-SUFFIX,analytics.oneplus.cn, AdBlock
DOMAIN-SUFFIX,click.oneplus.cn, AdBlock
DOMAIN-SUFFIX,click.oneplus.com, AdBlock
DOMAIN-SUFFIX,open.oneplus.net, AdBlock
DOMAIN-SUFFIX,metrics.data.hicloud.com, AdBlock
DOMAIN-SUFFIX,metrics1.data.hicloud.com, AdBlock
DOMAIN-SUFFIX,metrics2.data.hicloud.com, AdBlock
DOMAIN-SUFFIX,metrics3.data.hicloud.com, AdBlock
DOMAIN-SUFFIX,metrics4.data.hicloud.com, AdBlock
DOMAIN-SUFFIX,metrics5.data.hicloud.com, AdBlock
DOMAIN-SUFFIX,logservice.hicloud.com, AdBlock
DOMAIN-SUFFIX,logservice1.hicloud.com, AdBlock
DOMAIN-SUFFIX,metrics-dra.dt.hicloud.com, AdBlock
DOMAIN-SUFFIX,logbak.hicloud.com, AdBlock
DOMAIN-SUFFIX,ad.samsungadhub.com, AdBlock
DOMAIN-SUFFIX,samsungadhub.com, AdBlock
DOMAIN-SUFFIX,samsungads.com, AdBlock
DOMAIN-SUFFIX,smetrics.samsung.com, AdBlock
DOMAIN-SUFFIX,nmetrics.samsung.com, AdBlock
DOMAIN-SUFFIX,samsung-com.112.2o7.net, AdBlock
DOMAIN-SUFFIX,business.samsungusa.com, AdBlock
DOMAIN-SUFFIX,analytics.samsungknox.com, AdBlock
DOMAIN-SUFFIX,bigdata.ssp.samsung.com, AdBlock
DOMAIN-SUFFIX,analytics-api.samsunghealthcn.com, AdBlock
DOMAIN-SUFFIX,config.samsungads.com, AdBlock
DOMAIN-SUFFIX,metrics.apple.com, AdBlock
DOMAIN-SUFFIX,securemetrics.apple.com, AdBlock
DOMAIN-SUFFIX,supportmetrics.apple.com, AdBlock
DOMAIN-SUFFIX,metrics.icloud.com, AdBlock
DOMAIN-SUFFIX,metrics.mzstatic.com, AdBlock
DOMAIN-SUFFIX,dzc-metrics.mzstatic.com, AdBlock
DOMAIN-SUFFIX,books-analytics-events.news.apple-dns.net, AdBlock
DOMAIN-SUFFIX,books-analytics-events.apple.com, AdBlock
DOMAIN-SUFFIX,stocks-analytics-events.apple.com, AdBlock
DOMAIN-SUFFIX,stocks-analytics-events.news.apple-dns.net, AdBlock
DOMAIN-KEYWORD,pagead2, AdBlock
DOMAIN-KEYWORD,adservice, AdBlock
DOMAIN-KEYWORD,.ads, AdBlock
DOMAIN-KEYWORD,.ad, AdBlock
DOMAIN-KEYWORD,adservetx, AdBlock
DOMAIN-KEYWORD,mediavisor, AdBlock
DOMAIN-KEYWORD,adtago, AdBlock
DOMAIN-KEYWORD,analyticsengine, AdBlock
DOMAIN-KEYWORD,advice-ads, AdBlock
DOMAIN-KEYWORD,affiliationjs, AdBlock
DOMAIN-KEYWORD,advertising, AdBlock
DOMAIN-KEYWORD,adserver, AdBlock
DOMAIN-KEYWORD,pclick, AdBlock
DOMAIN-KEYWORD,partnerads, AdBlock
DOMAIN-KEYWORD,appmetrica, AdBlock
DOMAIN-KEYWORD,adfox, AdBlock
DOMAIN-KEYWORD,adsdk, AdBlock
DOMAIN-KEYWORD,clck, AdBlock
DOMAIN-KEYWORD,metrika, AdBlock
DOMAIN-KEYWORD,api-hotjar, AdBlock
DOMAIN-KEYWORD,hotjar-analytics, AdBlock
DOMAIN-KEYWORD,hotjar, AdBlock
DOMAIN-KEYWORD,luckyorange, AdBlock
DOMAIN-KEYWORD,bugsnag, AdBlock
DOMAIN-KEYWORD,sentry-cdn, AdBlock
DOMAIN-KEYWORD,getsentry, AdBlock
DOMAIN-KEYWORD,ads-api, AdBlock
DOMAIN-KEYWORD,ads-twitter, AdBlock
DOMAIN-KEYWORD,pointdrive, AdBlock
DOMAIN-KEYWORD,ads-dev, AdBlock
DOMAIN-KEYWORD,trk, AdBlock
DOMAIN-KEYWORD,cleverads, AdBlock
DOMAIN-KEYWORD,ads-sg, AdBlock
DOMAIN-KEYWORD,analytics-sg, AdBlock
DOMAIN-KEYWORD,adspecs, AdBlock
DOMAIN-KEYWORD,adsfs, AdBlock
DOMAIN-KEYWORD,adx, AdBlock
DOMAIN-KEYWORD,tracking, AdBlock
DOMAIN-KEYWORD,logservice, AdBlock
DOMAIN-KEYWORD,logbak, AdBlock
DOMAIN-KEYWORD,smetrics, AdBlock
DOMAIN-KEYWORD,nmetrics, AdBlock
DOMAIN-KEYWORD,securemetrics, AdBlock
DOMAIN-KEYWORD,supportmetrics, AdBlock
DOMAIN-KEYWORD,books-analytics, AdBlock
DOMAIN-KEYWORD,stocks-analytics, AdBlock
DOMAIN-SUFFIX,analytics.s3.amazonaws.com, AdBlock
DOMAIN-SUFFIX,analytics.google.com, AdBlock
DOMAIN-SUFFIX,click.googleanalytics.com, AdBlock
DOMAIN-SUFFIX,events.reddit.com, AdBlock
DOMAIN-SUFFIX,business-api.tiktok.com, AdBlock
DOMAIN-SUFFIX,log.byteoversea.com, AdBlock
DOMAIN-SUFFIX,udc.yahoo.com, AdBlock
DOMAIN-SUFFIX,udcm.yahoo.com, AdBlock
DOMAIN-SUFFIX,auction.unityads.unity3d.com, AdBlock
DOMAIN-SUFFIX,webview.unityads.unity3d.com, AdBlock
DOMAIN-SUFFIX,config.unityads.unity3d.com, AdBlock
DOMAIN-SUFFIX,adfstat.yandex.ru, AdBlock
DOMAIN-SUFFIX,iot-eu-logser.realme.com, AdBlock
DOMAIN-SUFFIX,iot-logser.realme.com, AdBlock
DOMAIN-SUFFIX,bdapi-ads.realmemobile.com, AdBlock
DOMAIN-SUFFIX,grs.hicloud.com, AdBlock
DOMAIN-SUFFIX,weather-analytics-events.apple.com, AdBlock
DOMAIN-SUFFIX,notes-analytics-events.apple.com, AdBlock
FINAL,Select Group`;
}
async function generateHusiSub(type, bug, geo81, tls, country = null, limit = null) {
  const proxyList = await getProxyList();
  let ips = proxyList.map(p => `${p.proxyIP},${p.proxyPort},${p.country},${p.org}`);
  if (country && country.toLowerCase() === 'random') {
    // Pilih data secara acak jika country=random
    ips = ips.sort(() => Math.random() - 0.5); // Acak daftar proxy
  } else if (country) {
    // Filter berdasarkan country jika bukan "random"
    ips = ips.filter(line => {
      const parts = line.split(',');
      if (parts.length > 1) {
        const lineCountry = parts[2].toUpperCase();
        return lineCountry === country.toUpperCase();
      }
      return false;
    });
  }
  if (limit && !isNaN(limit)) {
    ips = ips.slice(0, limit); // Batasi jumlah proxy berdasarkan limit
  }
  let conf = '';
  let bex = '';
  let count = 1;

  for (let line of ips) {
    const parts = line.split(',');
    const proxyHost = parts[0];
    const proxyPort = parts[1] || 443;
    const emojiFlag = getEmojiFlag(line.split(',')[2]); // Konversi ke emoji bendera
    const sanitize = (text) => text.replace(/[\n\r]+/g, "").trim(); // Hapus newline dan spasi ekstra
    let ispName = sanitize(`${emojiFlag} (${line.split(',')[2]}) ${line.split(',')[3]} ${count ++}`);
    const UUIDS = `${generateUUIDv4()}`;
    const ports = tls ? '443' : '80';
    const snio = tls ? `\n      "tls": {\n        "disable_sni": false,\n        "enabled": true,\n        "insecure": true,\n        "server_name": "${geo81}"\n      },` : '';
    if (type === 'vless') {
      bex += `        "${ispName}",\n`
      conf += `
    {
      "domain_strategy": "ipv4_only",
      "flow": "",
      "multiplex": {
        "enabled": false,
        "max_streams": 32,
        "protocol": "smux"
      },
      "packet_encoding": "xudp",
      "server": "${bug}",
      "server_port": ${ports},
      "tag": "${ispName}",${snio}
      "transport": {
        "early_data_header_name": "Sec-WebSocket-Protocol",
        "headers": {
          "Host": "${geo81}"
        },
        "max_early_data": 0,
        "path": "${pathinfo}${proxyHost}=${proxyPort}",
        "type": "ws"
      },
      "type": "vless",
      "uuid": "${UUIDS}"
    },`;
    } else if (type === 'trojan') {
      bex += `        "${ispName}",\n`
      conf += `
    {
      "domain_strategy": "ipv4_only",
      "multiplex": {
        "enabled": false,
        "max_streams": 32,
        "protocol": "smux"
      },
      "password": "${UUIDS}",
      "server": "${bug}",
      "server_port": ${ports},
      "tag": "${ispName}",${snio}
      "transport": {
        "early_data_header_name": "Sec-WebSocket-Protocol",
        "headers": {
          "Host": "${geo81}"
        },
        "max_early_data": 0,
        "path": "${pathinfo}${proxyHost}=${proxyPort}",
        "type": "ws"
      },
      "type": "trojan"
    },`;
    } else if (type === 'ss') {
      bex += `        "${ispName}",\n`
      conf += `
    {
      "type": "shadowsocks",
      "tag": "${ispName}",
      "server": "${bug}",
      "server_port": 443,
      "method": "none",
      "password": "${UUIDS}",
      "plugin": "v2ray-plugin",
      "plugin_opts": "mux=0;path=${pathinfo}${proxyHost}=${proxyPort};host=${geo81};tls=1"
    },`;
    } else if (type === 'mix') {
      bex += `        "${ispName} vless",\n        "${ispName} trojan",\n        "${ispName} ss",\n`
      conf += `
    {
      "domain_strategy": "ipv4_only",
      "flow": "",
      "multiplex": {
        "enabled": false,
        "max_streams": 32,
        "protocol": "smux"
      },
      "packet_encoding": "xudp",
      "server": "${bug}",
      "server_port": ${ports},
      "tag": "${ispName} vless",${snio}
      "transport": {
        "early_data_header_name": "Sec-WebSocket-Protocol",
        "headers": {
          "Host": "${geo81}"
        },
        "max_early_data": 0,
        "path": "${pathinfo}${proxyHost}=${proxyPort}",
        "type": "ws"
      },
      "type": "vless",
      "uuid": "${UUIDS}"
    },
    {
      "domain_strategy": "ipv4_only",
      "multiplex": {
        "enabled": false,
        "max_streams": 32,
        "protocol": "smux"
      },
      "password": "${UUIDS}",
      "server": "${bug}",
      "server_port": ${ports},
      "tag": "${ispName} trojan",${snio}
      "transport": {
        "early_data_header_name": "Sec-WebSocket-Protocol",
        "headers": {
          "Host": "${geo81}"
        },
        "max_early_data": 0,
        "path": "${pathinfo}${proxyHost}=${proxyPort}",
        "type": "ws"
      },
      "type": "trojan"
    },
    {
      "type": "shadowsocks",
      "tag": "${ispName} ss",
      "server": "${bug}",
      "server_port": 443,
      "method": "none",
      "password": "${UUIDS}",
      "plugin": "v2ray-plugin",
      "plugin_opts": "mux=0;path=${pathinfo}${proxyHost}=${proxyPort};host=${geo81};tls=1"
    },`;
    }
  }
  return `#### BY : GEO PROJECT ####

{
  "dns": {
    "final": "dns-final",
    "independent_cache": true,
    "rules": [
      {
        "disable_cache": false,
        "domain": [
          "family.cloudflare-dns.com",
          "${bug}"
        ],
        "server": "direct-dns"
      }
    ],
    "servers": [
      {
        "address": "https://family.cloudflare-dns.com/dns-query",
        "address_resolver": "direct-dns",
        "strategy": "ipv4_only",
        "tag": "remote-dns"
      },
      {
        "address": "local",
        "strategy": "ipv4_only",
        "tag": "direct-dns"
      },
      {
        "address": "local",
        "address_resolver": "dns-local",
        "strategy": "ipv4_only",
        "tag": "dns-final"
      },
      {
        "address": "local",
        "tag": "dns-local"
      },
      {
        "address": "rcode://success",
        "tag": "dns-block"
      }
    ]
  },
  "experimental": {
    "cache_file": {
      "enabled": true,
      "path": "../cache/cache.db",
      "store_fakeip": true
    },
    "clash_api": {
      "external_controller": "127.0.0.1:9090"
    },
    "v2ray_api": {
      "listen": "127.0.0.1:0",
      "stats": {
        "enabled": true,
        "outbounds": [
          "proxy",
          "direct"
        ]
      }
    }
  },
  "inbounds": [
    {
      "listen": "0.0.0.0",
      "listen_port": 6450,
      "override_address": "8.8.8.8",
      "override_port": 53,
      "tag": "dns-in",
      "type": "direct"
    },
    {
      "domain_strategy": "",
      "endpoint_independent_nat": true,
      "inet4_address": [
        "172.19.0.1/28"
      ],
      "mtu": 9000,
      "sniff": true,
      "sniff_override_destination": true,
      "stack": "system",
      "tag": "tun-in",
      "type": "tun"
    },
    {
      "domain_strategy": "",
      "listen": "0.0.0.0",
      "listen_port": 2080,
      "sniff": true,
      "sniff_override_destination": true,
      "tag": "mixed-in",
      "type": "mixed"
    }
  ],
  "log": {
    "level": "info"
  },
  "outbounds": [
    {
      "outbounds": [
        "Best Latency",
${bex}        "direct"
      ],
      "tag": "Internet",
      "type": "selector"
    },
    {
      "interval": "1m0s",
      "outbounds": [
${bex}        "direct"
      ],
      "tag": "Best Latency",
      "type": "urltest",
      "url": "https://detectportal.firefox.com/success.txt"
    },
${conf}
    {
      "tag": "direct",
      "type": "direct"
    },
    {
      "tag": "bypass",
      "type": "direct"
    },
    {
      "tag": "block",
      "type": "block"
    },
    {
      "tag": "dns-out",
      "type": "dns"
    }
  ],
  "route": {
    "auto_detect_interface": true,
    "rules": [
      {
        "outbound": "dns-out",
        "port": [
          53
        ]
      },
      {
        "inbound": [
          "dns-in"
        ],
        "outbound": "dns-out"
      },
      {
        "network": [
          "udp"
        ],
        "outbound": "block",
        "port": [
          443
        ],
        "port_range": []
      },
      {
        "ip_cidr": [
          "224.0.0.0/3",
          "ff00::/8"
        ],
        "outbound": "block",
        "source_ip_cidr": [
          "224.0.0.0/3",
          "ff00::/8"
        ]
      }
    ]
  }
}`;
}
async function generateSingboxSub(type, bug, geo81, tls, country = null, limit = null) {
  const proxyList = await getProxyList();
  let ips = proxyList.map(p => `${p.proxyIP},${p.proxyPort},${p.country},${p.org}`);
  if (country && country.toLowerCase() === 'random') {
    // Pilih data secara acak jika country=random
    ips = ips.sort(() => Math.random() - 0.5); // Acak daftar proxy
  } else if (country) {
    // Filter berdasarkan country jika bukan "random"
    ips = ips.filter(line => {
      const parts = line.split(',');
      if (parts.length > 1) {
        const lineCountry = parts[2].toUpperCase();
        return lineCountry === country.toUpperCase();
      }
      return false;
    });
  }
  if (limit && !isNaN(limit)) {
    ips = ips.slice(0, limit); // Batasi jumlah proxy berdasarkan limit
  }
  let conf = '';
  let bex = '';
  let count = 1;

  for (let line of ips) {
    const parts = line.split(',');
    const proxyHost = parts[0];
    const proxyPort = parts[1] || 443;
    const emojiFlag = getEmojiFlag(line.split(',')[2]); // Konversi ke emoji bendera
    const sanitize = (text) => text.replace(/[\n\r]+/g, "").trim(); // Hapus newline dan spasi ekstra
    let ispName = sanitize(`${emojiFlag} (${line.split(',')[2]}) ${line.split(',')[3]} ${count ++}`);
    const UUIDS = `${generateUUIDv4()}`;
    const ports = tls ? '443' : '80';
    const snio = tls ? `\n      "tls": {\n        "enabled": true,\n        "server_name": "${geo81}",\n        "insecure": true\n      },` : '';
    if (type === 'vless') {
      bex += `        "${ispName}",\n`
      conf += `
    {
      "type": "vless",
      "tag": "${ispName}",
      "domain_strategy": "ipv4_only",
      "server": "${bug}",
      "server_port": ${ports},
      "uuid": "${UUIDS}",${snio}
      "multiplex": {
        "protocol": "smux",
        "max_streams": 32
      },
      "transport": {
        "type": "ws",
        "path": "${pathinfo}${proxyHost}=${proxyPort}",
        "headers": {
          "Host": "${geo81}"
        },
        "early_data_header_name": "Sec-WebSocket-Protocol"
      },
      "packet_encoding": "xudp"
    },`;
    } else if (type === 'trojan') {
      bex += `        "${ispName}",\n`
      conf += `
    {
      "type": "trojan",
      "tag": "${ispName}",
      "domain_strategy": "ipv4_only",
      "server": "${bug}",
      "server_port": ${ports},
      "password": "${UUIDS}",${snio}
      "multiplex": {
        "protocol": "smux",
        "max_streams": 32
      },
      "transport": {
        "type": "ws",
        "path": "${pathinfo}${proxyHost}=${proxyPort}",
        "headers": {
          "Host": "${geo81}"
        },
        "early_data_header_name": "Sec-WebSocket-Protocol"
      }
    },`;
    } else if (type === 'ss') {
      bex += `        "${ispName}",\n`
      conf += `
    {
      "type": "shadowsocks",
      "tag": "${ispName}",
      "server": "${bug}",
      "server_port": 443,
      "method": "none",
      "password": "${UUIDS}",
      "plugin": "v2ray-plugin",
      "plugin_opts": "mux=0;path=${pathinfo}${proxyHost}=${proxyPort};host=${geo81};tls=1"
    },`;
    } else if (type === 'mix') {
      bex += `        "${ispName} vless",\n        "${ispName} trojan",\n        "${ispName} ss",\n`
      conf += `
    {
      "type": "vless",
      "tag": "${ispName} vless",
      "domain_strategy": "ipv4_only",
      "server": "${bug}",
      "server_port": ${ports},
      "uuid": "${UUIDS}",${snio}
      "multiplex": {
        "protocol": "smux",
        "max_streams": 32
      },
      "transport": {
        "type": "ws",
        "path": "${pathinfo}${proxyHost}=${proxyPort}",
        "headers": {
          "Host": "${geo81}"
        },
        "early_data_header_name": "Sec-WebSocket-Protocol"
      },
      "packet_encoding": "xudp"
    },
    {
      "type": "trojan",
      "tag": "${ispName} trojan",
      "domain_strategy": "ipv4_only",
      "server": "${bug}",
      "server_port": ${ports},
      "password": "${UUIDS}",${snio}
      "multiplex": {
        "protocol": "smux",
        "max_streams": 32
      },
      "transport": {
        "type": "ws",
        "path": "${pathinfo}${proxyHost}=${proxyPort}",
        "headers": {
          "Host": "${geo81}"
        },
        "early_data_header_name": "Sec-WebSocket-Protocol"
      }
    },
    {
      "type": "shadowsocks",
      "tag": "${ispName} ss",
      "server": "${bug}",
      "server_port": 443,
      "method": "none",
      "password": "${UUIDS}",
      "plugin": "v2ray-plugin",
      "plugin_opts": "mux=0;path=${pathinfo}${proxyHost}=${proxyPort};host=${geo81};tls=1"
    },`;
    }
  }
  return `#### BY : GEO PROJECT ####

{
  "log": {
    "level": "info"
  },
  "dns": {
    "servers": [
      {
        "tag": "remote-dns",
        "address": "https://family.cloudflare-dns.com/dns-query",
        "address_resolver": "direct-dns",
        "strategy": "ipv4_only"
      },
      {
        "tag": "direct-dns",
        "address": "local",
        "strategy": "ipv4_only"
      },
      {
        "tag": "dns-final",
        "address": "local",
        "address_resolver": "dns-local",
        "strategy": "ipv4_only"
      },
      {
        "tag": "dns-local",
        "address": "local"
      },
      {
        "tag": "dns-block",
        "address": "rcode://success"
      }
    ],
    "rules": [
      {
        "domain": [
          "family.cloudflare-dns.com",
          "${bug}"
        ],
        "server": "direct-dns"
      }
    ],
    "final": "dns-final",
    "independent_cache": true
  },
  "inbounds": [
    {
      "type": "tun",
      "mtu": 1400,
      "inet4_address": "172.19.0.1/30",
      "inet6_address": "fdfe:dcba:9876::1/126",
      "auto_route": true,
      "strict_route": true,
      "endpoint_independent_nat": true,
      "stack": "mixed",
      "sniff": true
    }
  ],
  "outbounds": [
    {
      "tag": "Internet",
      "type": "selector",
      "outbounds": [
        "Best Latency",
${bex}        "direct"
      ]
    },
    {
      "type": "urltest",
      "tag": "Best Latency",
      "outbounds": [
${bex}        "direct"
      ],
      "url": "https://ping.geo81.us.kg",
      "interval": "30s"
    },
${conf}
    {
      "type": "direct",
      "tag": "direct"
    },
    {
      "type": "direct",
      "tag": "bypass"
    },
    {
      "type": "block",
      "tag": "block"
    },
    {
      "type": "dns",
      "tag": "dns-out"
    }
  ],
  "route": {
    "rules": [
      {
        "port": 53,
        "outbound": "dns-out"
      },
      {
        "inbound": "dns-in",
        "outbound": "dns-out"
      },
      {
        "network": "udp",
        "port": 443,
        "outbound": "block"
      },
      {
        "source_ip_cidr": [
          "224.0.0.0/3",
          "ff00::/8"
        ],
        "ip_cidr": [
          "224.0.0.0/3",
          "ff00::/8"
        ],
        "outbound": "block"
      }
    ],
    "auto_detect_interface": true
  },
  "experimental": {
    "cache_file": {
      "enabled": false
    },
    "clash_api": {
      "external_controller": "127.0.0.1:9090",
      "external_ui": "ui",
      "external_ui_download_url": "https://github.com/MetaCubeX/metacubexd/archive/gh-pages.zip",
      "external_ui_download_detour": "Internet",
      "secret": "bitzblack",
      "default_mode": "rule"
    }
  }
}`;
}
async function generateNekoboxSub(type, bug, geo81, tls, country = null, limit = null) {
  const proxyList = await getProxyList();
  let ips = proxyList.map(p => `${p.proxyIP},${p.proxyPort},${p.country},${p.org}`);
  if (country && country.toLowerCase() === 'random') {
    // Pilih data secara acak jika country=random
    ips = ips.sort(() => Math.random() - 0.5); // Acak daftar proxy
  } else if (country) {
    // Filter berdasarkan country jika bukan "random"
    ips = ips.filter(line => {
      const parts = line.split(',');
      if (parts.length > 1) {
        const lineCountry = parts[2].toUpperCase();
        return lineCountry === country.toUpperCase();
      }
      return false;
    });
  }
  if (limit && !isNaN(limit)) {
    ips = ips.slice(0, limit); // Batasi jumlah proxy berdasarkan limit
  }
  let conf = '';
  let bex = '';
  let count = 1;

  for (let line of ips) {
    const parts = line.split(',');
    const proxyHost = parts[0];
    const proxyPort = parts[1] || 443;
    const emojiFlag = getEmojiFlag(line.split(',')[2]); // Konversi ke emoji bendera
    const sanitize = (text) => text.replace(/[\n\r]+/g, "").trim(); // Hapus newline dan spasi ekstra
    let ispName = sanitize(`${emojiFlag} (${line.split(',')[2]}) ${line.split(',')[3]} ${count ++}`);
    const UUIDS = `${generateUUIDv4()}`;
    const ports = tls ? '443' : '80';
    const snio = tls ? `\n      "tls": {\n        "disable_sni": false,\n        "enabled": true,\n        "insecure": true,\n        "server_name": "${geo81}"\n      },` : '';
    if (type === 'vless') {
      bex += `        "${ispName}",\n`
      conf += `
    {
      "domain_strategy": "ipv4_only",
      "flow": "",
      "multiplex": {
        "enabled": false,
        "max_streams": 32,
        "protocol": "smux"
      },
      "packet_encoding": "xudp",
      "server": "${bug}",
      "server_port": ${ports},
      "tag": "${ispName}",${snio}
      "transport": {
        "early_data_header_name": "Sec-WebSocket-Protocol",
        "headers": {
          "Host": "${geo81}"
        },
        "max_early_data": 0,
        "path": "${pathinfo}${proxyHost}=${proxyPort}",
        "type": "ws"
      },
      "type": "vless",
      "uuid": "${UUIDS}"
    },`;
    } else if (type === 'trojan') {
      bex += `        "${ispName}",\n`
      conf += `
    {
      "domain_strategy": "ipv4_only",
      "multiplex": {
        "enabled": false,
        "max_streams": 32,
        "protocol": "smux"
      },
      "password": "${UUIDS}",
      "server": "${bug}",
      "server_port": ${ports},
      "tag": "${ispName}",${snio}
      "transport": {
        "early_data_header_name": "Sec-WebSocket-Protocol",
        "headers": {
          "Host": "${geo81}"
        },
        "max_early_data": 0,
        "path": "${pathinfo}${proxyHost}=${proxyPort}",
        "type": "ws"
      },
      "type": "trojan"
    },`;
    } else if (type === 'ss') {
      bex += `        "${ispName}",\n`
      conf += `
    {
      "type": "shadowsocks",
      "tag": "${ispName}",
      "server": "${bug}",
      "server_port": 443,
      "method": "none",
      "password": "${UUIDS}",
      "plugin": "v2ray-plugin",
      "plugin_opts": "mux=0;path=${pathinfo}${proxyHost}=${proxyPort};host=${geo81};tls=1"
    },`;
    } else if (type === 'mix') {
      bex += `        "${ispName} vless",\n        "${ispName} trojan",\n        "${ispName} ss",\n`
      conf += `
    {
      "domain_strategy": "ipv4_only",
      "flow": "",
      "multiplex": {
        "enabled": false,
        "max_streams": 32,
        "protocol": "smux"
      },
      "packet_encoding": "xudp",
      "server": "${bug}",
      "server_port": ${ports},
      "tag": "${ispName} vless",${snio}
      "transport": {
        "early_data_header_name": "Sec-WebSocket-Protocol",
        "headers": {
          "Host": "${geo81}"
        },
        "max_early_data": 0,
        "path": "${pathinfo}${proxyHost}=${proxyPort}",
        "type": "ws"
      },
      "type": "vless",
      "uuid": "${UUIDS}"
    },
    {
      "domain_strategy": "ipv4_only",
      "multiplex": {
        "enabled": false,
        "max_streams": 32,
        "protocol": "smux"
      },
      "password": "${UUIDS}",
      "server": "${bug}",
      "server_port": ${ports},
      "tag": "${ispName} trojan",${snio}
      "transport": {
        "early_data_header_name": "Sec-WebSocket-Protocol",
        "headers": {
          "Host": "${geo81}"
        },
        "max_early_data": 0,
        "path": "${pathinfo}${proxyHost}=${proxyPort}",
        "type": "ws"
      },
      "type": "trojan"
    },
    {
      "type": "shadowsocks",
      "tag": "${ispName} ss",
      "server": "${bug}",
      "server_port": 443,
      "method": "none",
      "password": "${UUIDS}",
      "plugin": "v2ray-plugin",
      "plugin_opts": "mux=0;path=${pathinfo}${proxyHost}=${proxyPort};host=${geo81};tls=1"
    },`;
    }
  }
  return `#### BY : GEO PROJECT ####

{
  "dns": {
    "final": "dns-final",
    "independent_cache": true,
    "rules": [
      {
        "disable_cache": false,
        "domain": [
          "family.cloudflare-dns.com",
          "${bug}"
        ],
        "server": "direct-dns"
      }
    ],
    "servers": [
      {
        "address": "https://family.cloudflare-dns.com/dns-query",
        "address_resolver": "direct-dns",
        "strategy": "ipv4_only",
        "tag": "remote-dns"
      },
      {
        "address": "local",
        "strategy": "ipv4_only",
        "tag": "direct-dns"
      },
      {
        "address": "local",
        "address_resolver": "dns-local",
        "strategy": "ipv4_only",
        "tag": "dns-final"
      },
      {
        "address": "local",
        "tag": "dns-local"
      },
      {
        "address": "rcode://success",
        "tag": "dns-block"
      }
    ]
  },
  "experimental": {
    "cache_file": {
      "enabled": true,
      "path": "../cache/clash.db",
      "store_fakeip": true
    },
    "clash_api": {
      "external_controller": "127.0.0.1:9090",
      "external_ui": "../files/yacd"
    }
  },
  "inbounds": [
    {
      "listen": "0.0.0.0",
      "listen_port": 6450,
      "override_address": "8.8.8.8",
      "override_port": 53,
      "tag": "dns-in",
      "type": "direct"
    },
    {
      "domain_strategy": "",
      "endpoint_independent_nat": true,
      "inet4_address": [
        "172.19.0.1/28"
      ],
      "mtu": 9000,
      "sniff": true,
      "sniff_override_destination": true,
      "stack": "system",
      "tag": "tun-in",
      "type": "tun"
    },
    {
      "domain_strategy": "",
      "listen": "0.0.0.0",
      "listen_port": 2080,
      "sniff": true,
      "sniff_override_destination": true,
      "tag": "mixed-in",
      "type": "mixed"
    }
  ],
  "log": {
    "level": "info"
  },
  "outbounds": [
    {
      "outbounds": [
        "Best Latency",
${bex}        "direct"
      ],
      "tag": "Internet",
      "type": "selector"
    },
    {
      "interval": "1m0s",
      "outbounds": [
${bex}        "direct"
      ],
      "tag": "Best Latency",
      "type": "urltest",
      "url": "https://detectportal.firefox.com/success.txt"
    },
${conf}
    {
      "tag": "direct",
      "type": "direct"
    },
    {
      "tag": "bypass",
      "type": "direct"
    },
    {
      "tag": "block",
      "type": "block"
    },
    {
      "tag": "dns-out",
      "type": "dns"
    }
  ],
  "route": {
    "auto_detect_interface": true,
    "rules": [
      {
        "outbound": "dns-out",
        "port": [
          53
        ]
      },
      {
        "inbound": [
          "dns-in"
        ],
        "outbound": "dns-out"
      },
      {
        "network": [
          "udp"
        ],
        "outbound": "block",
        "port": [
          443
        ],
        "port_range": []
      },
      {
        "ip_cidr": [
          "224.0.0.0/3",
          "ff00::/8"
        ],
        "outbound": "block",
        "source_ip_cidr": [
          "224.0.0.0/3",
          "ff00::/8"
        ]
      }
    ]
  }
}`;
}
async function generateV2rayngSub(type, bug, geo81, tls, country = null, limit = null) {
  const proxyList = await getProxyList();
  let ips = proxyList.map(p => `${p.proxyIP},${p.proxyPort},${p.country},${p.org}`);

  if (country && country.toLowerCase() === 'random') {
    // Pilih data secara acak jika country=random
    ips = ips.sort(() => Math.random() - 0.5); // Acak daftar proxy
  } else if (country) {
    // Filter berdasarkan country jika bukan "random"
    ips = ips.filter(line => {
      const parts = line.split(',');
      if (parts.length > 1) {
        const lineCountry = parts[2].toUpperCase();
        return lineCountry === country.toUpperCase();
      }
      return false;
    });
  }
  
  if (limit && !isNaN(limit)) {
    ips = ips.slice(0, limit); // Batasi jumlah proxy berdasarkan limit
  }

  let conf = '';

  for (let line of ips) {
    const parts = line.split(',');
    const proxyHost = parts[0];
    const proxyPort = parts[1] || 443;
    const countryCode = parts[2]; // Kode negara ISO
    const isp = parts[3]; // Informasi ISP

    // Gunakan teks Latin-1 untuk menggantikan emoji flag
    const countryText = `[${countryCode}]`; // Format bendera ke teks Latin-1
    const ispInfo = `${countryText} ${isp}`;
    const UUIDS = `${generateUUIDv4()}`;

    if (type === 'vless') {
      if (tls) {
        conf += `vless://${UUIDS}\u0040${bug}:443?encryption=none&security=tls&sni=${geo81}&fp=randomized&type=ws&host=${geo81}&path=%2FFree-VPN-CF-Geo-Project%2F${proxyHost}%3D${proxyPort}#${ispInfo}\n`;
      } else {
        conf += `vless://${UUIDS}\u0040${bug}:80?path=%2FFree-VPN-CF-Geo-Project%2F${proxyHost}%3D${proxyPort}&security=none&encryption=none&host=${geo81}&fp=randomized&type=ws&sni=${geo81}#${ispInfo}\n`;
      }
    } else if (type === 'trojan') {
      if (tls) {
        conf += `trojan://${UUIDS}\u0040${bug}:443?encryption=none&security=tls&sni=${geo81}&fp=randomized&type=ws&host=${geo81}&path=%2FFree-VPN-CF-Geo-Project%2F${proxyHost}%3D${proxyPort}#${ispInfo}\n`;
      } else {
        conf += `trojan://${UUIDS}\u0040${bug}:80?path=%2FFree-VPN-CF-Geo-Project%2F${proxyHost}%3D${proxyPort}&security=none&encryption=none&host=${geo81}&fp=randomized&type=ws&sni=${geo81}#${ispInfo}\n`;
      }
    } else if (type === 'ss') {
      if (tls) {
        conf += `ss://${btoa(`none:${UUIDS}`)}%3D@${bug}:443?encryption=none&type=ws&host=${geo81}&path=%2FFree-VPN-CF-Geo-Project%2F${proxyHost}%3D${proxyPort}&security=tls&sni=${geo81}#${ispInfo}\n`;
      } else {
        conf += `ss://${btoa(`none:${UUIDS}`)}%3D@${bug}:80?encryption=none&type=ws&host=${geo81}&path=%2FFree-VPN-CF-Geo-Project%2F${proxyHost}%3D${proxyPort}&security=none&sni=${geo81}#${ispInfo}\n`;
      }
    } else if (type === 'mix') {
      if (tls) {
        conf += `vless://${UUIDS}\u0040${bug}:443?encryption=none&security=tls&sni=${geo81}&fp=randomized&type=ws&host=${geo81}&path=%2FFree-VPN-CF-Geo-Project%2F${proxyHost}%3D${proxyPort}#${ispInfo}\n`;
        conf += `trojan://${UUIDS}\u0040${bug}:443?encryption=none&security=tls&sni=${geo81}&fp=randomized&type=ws&host=${geo81}&path=%2FFree-VPN-CF-Geo-Project%2F${proxyHost}%3D${proxyPort}#${ispInfo}\n`;
        conf += `ss://${btoa(`none:${UUIDS}`)}%3D@${bug}:443?encryption=none&type=ws&host=${geo81}&path=%2FFree-VPN-CF-Geo-Project%2F${proxyHost}%3D${proxyPort}&security=tls&sni=${geo81}#${ispInfo}\n`;
      } else {
        conf += `vless://${UUIDS}\u0040${bug}:80?path=%2FFree-VPN-CF-Geo-Project%2F${proxyHost}%3D${proxyPort}&security=none&encryption=none&host=${geo81}&fp=randomized&type=ws&sni=${geo81}#${ispInfo}\n`;
        conf += `trojan://${UUIDS}\u0040${bug}:80?path=%2FFree-VPN-CF-Geo-Project%2F${proxyHost}%3D${proxyPort}&security=none&encryption=none&host=${geo81}&fp=randomized&type=ws&sni=${geo81}#${ispInfo}\n`;
        conf += `ss://${btoa(`none:${UUIDS}`)}%3D@${bug}:80?encryption=none&type=ws&host=${geo81}&path=%2FFree-VPN-CF-Geo-Project%2F${proxyHost}%3D${proxyPort}&security=none&sni=${geo81}#${ispInfo}\n`;
      }
    }
  }

  const base64Conf = btoa(conf.replace(/ /g, '%20'));

  return base64Conf;
}
async function generateV2raySub(type, bug, geo81, tls, country = null, limit = null) {
  const proxyList = await getProxyList();
  let ips = proxyList.map(p => `${p.proxyIP},${p.proxyPort},${p.country},${p.org}`);
  if (country && country.toLowerCase() === 'random') {
    // Pilih data secara acak jika country=random
    ips = ips.sort(() => Math.random() - 0.5); // Acak daftar proxy
  } else if (country) {
    // Filter berdasarkan country jika bukan "random"
    ips = ips.filter(line => {
      const parts = line.split(',');
      if (parts.length > 1) {
        const lineCountry = parts[2].toUpperCase();
        return lineCountry === country.toUpperCase();
      }
      return false;
    });
  }
  if (limit && !isNaN(limit)) {
    ips = ips.slice(0, limit); // Batasi jumlah proxy berdasarkan limit
  }
  let conf = '';
  for (let line of ips) {
    const parts = line.split(',');
    const proxyHost = parts[0];
    const proxyPort = parts[1] || 443;
    const emojiFlag = getEmojiFlag(line.split(',')[2]); // Konversi ke emoji bendera
    const UUIDS = generateUUIDv4();
    const information = encodeURIComponent(`${emojiFlag} (${line.split(',')[2]}) ${line.split(',')[3]}`);
    if (type === 'vless') {
      if (tls) {
        conf += `vless://${UUIDS}@${bug}:443?encryption=none&security=tls&sni=${geo81}&fp=randomized&type=ws&host=${geo81}&path=%2FFree-VPN-CF-Geo-Project%2F${proxyHost}%3D${proxyPort}#${information}\n`;
      } else {
        conf += `vless://${UUIDS}@${bug}:80?path=%2FFree-VPN-CF-Geo-Project%2F${proxyHost}%3D${proxyPort}&security=none&encryption=none&host=${geo81}&fp=randomized&type=ws&sni=${geo81}#${information}\n`;
      }
    } else if (type === 'trojan') {
      if (tls) {
        conf += `trojan://${UUIDS}@${bug}:443?encryption=none&security=tls&sni=${geo81}&fp=randomized&type=ws&host=${geo81}&path=%2FFree-VPN-CF-Geo-Project%2F${proxyHost}%3D${proxyPort}#${information}\n`;
      } else {
        conf += `trojan://${UUIDS}@${bug}:80?path=%2FFree-VPN-CF-Geo-Project%2F${proxyHost}%3D${proxyPort}&security=none&encryption=none&host=${geo81}&fp=randomized&type=ws&sni=${geo81}#${information}\n`;
      }
    } else if (type === 'ss') {
      if (tls) {
        conf += `ss://${btoa(`none:${UUIDS}`)}%3D@${bug}:443?encryption=none&type=ws&host=${geo81}&path=%2FFree-VPN-CF-Geo-Project%2F${proxyHost}%3D${proxyPort}&security=tls&sni=${geo81}#${information}\n`;
      } else {
        conf += `ss://${btoa(`none:${UUIDS}`)}%3D@${bug}:80?encryption=none&type=ws&host=${geo81}&path=%2FFree-VPN-CF-Geo-Project%2F${proxyHost}%3D${proxyPort}&security=none&sni=${geo81}#${information}\n`;
      }
    } else if (type === 'mix') {
      if (tls) {
        conf += `vless://${UUIDS}@${bug}:443?encryption=none&security=tls&sni=${geo81}&fp=randomized&type=ws&host=${geo81}&path=%2FFree-VPN-CF-Geo-Project%2F${proxyHost}%3D${proxyPort}#${information}\n`;
        conf += `trojan://${UUIDS}@${bug}:443?encryption=none&security=tls&sni=${geo81}&fp=randomized&type=ws&host=${geo81}&path=%2FFree-VPN-CF-Geo-Project%2F${proxyHost}%3D${proxyPort}#${information}\n`;
        conf += `ss://${btoa(`none:${UUIDS}`)}%3D@${bug}:443?encryption=none&type=ws&host=${geo81}&path=%2FFree-VPN-CF-Geo-Project%2F${proxyHost}%3D${proxyPort}&security=tls&sni=${geo81}#${information}\n`;
      } else {
        conf += `vless://${UUIDS}@${bug}:80?path=%2FFree-VPN-CF-Geo-Project%2F${proxyHost}%3D${proxyPort}&security=none&encryption=none&host=${geo81}&fp=randomized&type=ws&sni=${geo81}#${information}\n`;
        conf += `trojan://${UUIDS}@${bug}:80?path=%2FFree-VPN-CF-Geo-Project%2F${proxyHost}%3D${proxyPort}&security=none&encryption=none&host=${geo81}&fp=randomized&type=ws&sni=${geo81}#${information}\n`;
        conf += `ss://${btoa(`none:${UUIDS}`)}%3D@${bug}:80?encryption=none&type=ws&host=${geo81}&path=%2FFree-VPN-CF-Geo-Project%2F${proxyHost}%3D${proxyPort}&security=none&sni=${geo81}#${information}\n`;
      }
    }
  }
  
  return conf;
}
function generateUUIDv4() {
  const randomValues = crypto.getRandomValues(new Uint8Array(16));
  randomValues[6] = (randomValues[6] & 0x0f) | 0x40;
  randomValues[8] = (randomValues[8] & 0x3f) | 0x80;
  return [
    randomValues[0].toString(16).padStart(2, '0'),
    randomValues[1].toString(16).padStart(2, '0'),
    randomValues[2].toString(16).padStart(2, '0'),
    randomValues[3].toString(16).padStart(2, '0'),
    randomValues[4].toString(16).padStart(2, '0'),
    randomValues[5].toString(16).padStart(2, '0'),
    randomValues[6].toString(16).padStart(2, '0'),
    randomValues[7].toString(16).padStart(2, '0'),
    randomValues[8].toString(16).padStart(2, '0'),
    randomValues[9].toString(16).padStart(2, '0'),
    randomValues[10].toString(16).padStart(2, '0'),
    randomValues[11].toString(16).padStart(2, '0'),
    randomValues[12].toString(16).padStart(2, '0'),
    randomValues[13].toString(16).padStart(2, '0'),
    randomValues[14].toString(16).padStart(2, '0'),
    randomValues[15].toString(16).padStart(2, '0'),
  ].join('').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
}
