import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import versions from './versions.json';
import sources from './.generated/static/website-sources.json';

const latestReleasedVersion = versions[0] ?? 'current';

const config: Config = {
  title: 'FScript',
  tagline: 'Script. Embed. Compile.',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: process.env.WEBSITE_URL ?? 'https://fscriptlang.github.io',
  baseUrl: process.env.WEBSITE_BASE_URL ?? '/website/',

  organizationName: 'FScriptLang',
  projectName: 'website',

  onBrokenLinks: 'throw',
  staticDirectories: ['static', '.generated/static'],
  customFields: {sources},

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: './.generated/next',
          sidebarPath: './.generated/sidebars.json',
          routeBasePath: 'manual',
          lastVersion: latestReleasedVersion,
          versions: {
            current: {
              label: 'Next',
              banner: 'unreleased',
              path: versions.length > 0 ? 'next' : '',
            },
            ...(versions.length > 0 ? {[latestReleasedVersion]: {banner: 'none', label: `Stable (${sources.stable[0].tag})`}} : {}),
          },
          editUrl: ({version, docPath}) => {
            if (docPath === 'whats-new.md') return 'https://github.com/MagnusOpera/FScript/edit/main/CHANGELOG.md';
            const edition = version === 'stable' ? 'stable' : 'next';
            return `https://github.com/FScriptLang/website/edit/main/docs/${edition}/${docPath}`;
          },
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/fscript-social-card.png',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'FScript',
      logo: {
        alt: 'FScript Logo',
        src: 'img/fscript-icon.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Docs',
        },
        {
          type: 'docsVersionDropdown',
          position: 'left',
          dropdownActiveClassDisabled: true,
          versions: ['current', ...versions],
        },
        {
          to: '/sandbox',
          label: 'Playground',
          position: 'left',
        },
        {
          to: '/manual/embedding/overview',
          label: 'Embedding',
          position: 'left',
        },
        {
          to: '/manual/compiler/overview',
          label: 'Compilation',
          position: 'left',
        },
        {
          href: 'https://github.com/MagnusOpera/FScript',
          label: 'GitHub ↗',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `<span class="footer-brand">© ${new Date().getFullYear()} <a href="https://magnusopera.io"><img src="${process.env.WEBSITE_BASE_URL ?? '/website/'}img/magnus-opera-logo.svg" alt="" /> Magnus Opera SAS</a></span>`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['fsharp', 'bash'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
