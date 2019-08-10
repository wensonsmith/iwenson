const path = require('path')

module.exports = {
    title: '网站名称',
    description: '网站 Slogan',
    theme: 'seeker',
    plugins: ['@vuepress/last-updated'],
    themeConfig: {
        lastUpdated: 'ok',
        logo: '/seeker_logo_white.png',
        footer: {
            slogan: '世界你好',
            // copyright: 'no copyright'
        },
        watchDog: 'cat',
        nav: [
            {
                text: '归档',
                link: '/archive'
            },
            {
                text: '分类',
                link: '/category'
            },
            {
                text: '标签',
                link: '/tags'
            },
            {
                text: 'Github',
                link: 'https://github.com/wensonsmith'
            },
        ],
    }
}