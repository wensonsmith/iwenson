const path = require('path')

module.exports = {
    title: '文森',
    description: '一生为一次发光',
    theme: 'seeker',
    markdown: {
        lineNumbers: true,
    },
    plugins: ['@vuepress/last-updated'],
    themeConfig: {
        lastUpdated: '最近更新',
        logo: '/ws-logo-white.png',
        footer: {
            // slogan: 'poetry',
            // copyright: 'no copyright',
            social: [
                {
                    type: 'qq', // qq, wechat, bilibili, github, rss, weibo
                    value: '', 
                },
                {
                    type: 'wechat', // qq, wechat, bilibili, github, rss, weibo
                    value: '', 
                },
            ]
        },
        watchDog: 'cat',
        nav: [
            {
                text: '归档',
                link: '/archive/'
            },
            {
                text: '分类',
                link: '/categories/'
            },
            {
                text: 'Github',
                link: 'https://github.com/wensonsmith'
            },
            {
                text: '关于',
                link: '/about'
            },
        ],
    },
    configureWebpack() {
        return {
            resolve: {
                alias: {
                    '@public': path.join(__dirname, './public')
                }
            }
        }
    }
}