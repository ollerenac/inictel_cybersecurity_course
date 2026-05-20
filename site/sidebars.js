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
