// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Curso de Ciberseguridad — INICTEL',
  tagline: 'Aprende ciberseguridad resolviendo ejercicios reales',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  // Updated when GitHub repo is created
  url: 'https://your-github-username.github.io',
  baseUrl: '/ciberwar-curso/',

  organizationName: 'your-github-username',
  projectName: 'ciberwar-curso',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'es',
    locales: ['es'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'dark',
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Ciberseguridad INICTEL',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'cursoSidebar',
            position: 'left',
            label: 'Ejercicios',
          },
          {
            to: '/conexion',
            label: '🖥 Servidor Wargame',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `INICTEL — Curso de Ciberseguridad © ${new Date().getFullYear()}`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'python', 'c'],
      },
    }),
};

export default config;
