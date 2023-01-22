var axios = require('axios');

async function shortLink(link) {
    return axios.post(
        `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyBGQErpxps_ZpBF20BVKgEmv8TGglLOnz4`,

        {
            dynamicLinkInfo: {
                domainUriPrefix: 'https://amsapp.page.link',
                link,
            },
        }
    );
}

module.exports = shortLink;
