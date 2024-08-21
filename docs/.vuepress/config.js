import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress/cli'
import { viteBundler } from '@vuepress/bundler-vite'

export default defineUserConfig({
  port: '3000',
  lang: 'zh-CN',

  title: '然麦悟道',
  description: 'Java技能提升',

  theme: defaultTheme({
    logo: 'https://vuejs.press/images/hero.png',

    navbar: ['base/', 'java/', 'middleware/', 'spring/'],
  }),

  bundler: viteBundler(),
})
