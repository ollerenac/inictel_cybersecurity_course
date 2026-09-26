// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  cursoSidebar: [
    {
      type: 'doc',
      id: 'index',
      label: '¿Cómo usar este curso?',
    },
    {
      type: 'doc',
      id: 'conexion',
      label: '🖥 Conexión al servidor',
    },
    {
      type: 'doc',
      id: 'vpn-fix',
      label: '🔧 Arreglar la VPN',
    },
    {
      type: 'category',
      label: '🔐 Criptografía',
      items: [
        'crypto/baby-rsa',
      ],
    },
    {
      type: 'category',
      label: '🌐 Web Hacking',
      items: [
        'web-hacking/my-webview',
        'web-hacking/denylist',
      ],
    },
    {
      type: 'category',
      label: '🔍 Forensics',
      items: [
        'forensics/forensics-intro',
      ],
    },
    {
      type: 'category',
      label: '💻 System Hacking',
      items: [
        'system-hacking/system-hacking-intro',
      ],
    },
    {
      type: 'category',
      label: '🦠 Malware',
      items: [
        'malware/malware-intro',
        'malware/dll-injection',
      ],
    },
    {
      type: 'category',
      label: '📋 ISMS',
      items: [
        'isms/isms-intro',
      ],
    },
    {
      type: 'category',
      label: '⚙️ Reversing',
      items: [
        'reversing/reversing-intro',
      ],
    },
  ],
};

export default sidebars;
