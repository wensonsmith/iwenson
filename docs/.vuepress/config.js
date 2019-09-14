const path = require('path')

module.exports = {
    title: '网站名称',
    description: '网站 Slogan',
    theme: 'seeker',
    plugins: ['@vuepress/last-updated'],
    themeConfig: {
        lastUpdated: '最近更新',
        logo: '/seeker_logo_white.png',
        footer: {
            slogan: '世界你好',
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