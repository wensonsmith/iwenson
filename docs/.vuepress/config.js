const path = require('path')

const sortBy = (key) => {
    return (a, b) => (a[key] > b[key]) ? -1 : ((b[key] > a[key]) ? 1 : 0);
}

// set your global feed options - override in page frontmatter `feed`
const feedOptions = {
    feed_options: {
        title: 'Wenson 的独立博客',
        favicon: "https://iwenson.com/favicon.ico",
        copyright: "Powered by Vuepress | Design by Wenson",
        feedLinks: {
            atom: "https://iwenson.com/feed.atom"
          },
          author: {
            name: "Wenson Smith",
            email: "wensonsmith@gmail.com",
            link: "https://iwenson.com/about"
          }
    },
    posts_directories: ['/posts/'],
    canonical_base: 'https://iwenson.com/',
    feeds: {
        rss2: {enable: false},
        json1: {enable: false}
    },
    sort: entries => entries.concat().sort(sortBy("date")),
}

module.exports = {
    title: 'Wenson',
    description: '一生为一次发光',
    theme: 'seeker',
    markdown: {
        lineNumbers: true,
    },
    evergreen: true,
    plugins: [
        '@vuepress/last-updated',
        [
            '@vuepress/google-analytics',
            {
              'ga': 'UA-149929964-1' // UA-00000000-0
            }
        ],
        [ 'feed', feedOptions]
    ],
    themeConfig: {
        lastUpdated: '最近更新',
        logo: '/logo-white.png',
        valine: {
            appId: 'zpYH60z3swFivRMCzdH85xHw-gzGzoHsz',
            appKey: 'eB05xKa2vXzULbAkaqR2W1EK',
        },
        footer: {
            slogan: 'poetry',
            copyright: 'Made with 💚 by Wenson',
            social: [
                {
                    type: 'rss', // qq, wechat, bilibili, github, rss, weibo
                    value: 'https://iwenson.com/feed.atom', 
                },
                {
                    type: 'wechat', // qq, wechat, bilibili, github, rss, weibo
                    value: '', 
                },
                {
                    type: 'github', // qq, wechat, bilibili, github, rss, weibo
                    value: 'https://github.com/wensonsmith', 
                },
            ]
        },
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
                text: '关于',
                link: '/about/'
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