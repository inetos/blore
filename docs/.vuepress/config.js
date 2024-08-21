import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress/cli'
import { viteBundler } from '@vuepress/bundler-vite'
import { searchPlugin } from '@vuepress/plugin-search'

export default defineUserConfig({

  // 站点配置说明:  https://vuepress.vuejs.org/zh/reference/config.html
  port: '3000',
  lang: 'zh-CN',

  title: '然麦悟道',
  description: '助你Java技能提升',
  
  base: '/',
  head: [
    ["meta", { name: "robots", content: "all" }],
    ["meta", { name: "author", content: "然麦" }],
    ["link", { rel: "icon", href: "https://vuejs.press/images/hero.png"}]
  ],

  // 生成的路径
  public: `docs/assets`,
  dest: './dist',

  markdown: {
    // anchor: {},
    // links: {},
    // emoji: {}
  },


  theme: defaultTheme({
    logo: 'https://vuejs.press/images/hero.png',

    navbar: ['base/', 'java/', 'middleware/', 'spring/'],
  }),

  bundler: viteBundler(),

  // setup plugins
  plugins: [
    searchPlugin({
      locales: {
        '/': {
          placeholder: 'Search',
        },
      },
      // 排除首页
      isSearchable: (page) => page.path !== '/',
      
    }),
  ],
})
