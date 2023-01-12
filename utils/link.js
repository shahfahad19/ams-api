var axios = require('axios');

async function shortLink(link) {
    return axios.post(`https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${process.env.FIREBASE_KEY}`, {
        dynamicLinkInfo: {
            domainUriPrefix: 'https://amsapp.page.link',
            link,
        },
    });
}

module.exports = shortLink;
