const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

const resolveTikTokRedirect = async (url) => {
  try {
    const response = await axios.get(url, {
      maxRedirects: 0,
      validateStatus: status => status >= 300 && status < 400,
    });
    return response.headers.location;
  } catch (err) {
    if (err.response && err.response.status >= 300 && err.response.status < 400) {
      return err.response.headers.location;
    } else {
      throw new Error('Could not resolve redirect from vt.tiktok.com');
    }
  }
};


app.get('/api/download', async (req, res) => {
let tiktokUrl = req.query.url;

if (!tiktokUrl) {
  return res.status(400).json({
    error: 'The parameter ?url= with a valid TikTok URL is missing.'
  });
}

if (tiktokUrl.includes('vt.tiktok.com') || tiktokUrl.includes('vm.tiktok.com')) {
  try {
    tiktokUrl = await resolveTikTokRedirect(tiktokUrl);
  } catch (err) {
    return res.status(400).json({ error: 'Failed to resolve shortened TikTok URL.' });
  }
}

if (!tiktokUrl.includes('/video/')) {
  return res.status(400).json({
    error: 'The resolved URL is not a valid TikTok video URL.'
  });
}

  try {
    const videoIdMatch = tiktokUrl.match(/\/video\/(\d+)/);
    if (!videoIdMatch) throw new Error('The video ID could not be extracted.');
    const videoId = videoIdMatch[1];

    const tikwmUrl = `https://www.tikwm.com/video/${videoId}.html`;

    const response = await axios.get(tikwmUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Referer: 'https://www.tikwm.com/',
      },
    });

    const $ = cheerio.load(response.data);

    let downloadLink = null;
    $('a.btn.btn-success').each((i, el) => {
      const text = $(el).text().toLowerCase();
      const href = $(el).attr('href');
      if (text.includes('no watermark') && !text.includes('hd')) {
        downloadLink = href.startsWith('/') ? `https://www.tikwm.com${href}` : href;
      }
    });

    if (!downloadLink) {
      return res.status(404).json({ error: 'The video was not found.' });
    }

    const title = $('h1').text().trim();
    const nickname = $('h5').first().text().trim();

    const usernameMatch = $('a[target="_blank"]').attr('href') || '';
    const username = usernameMatch.split('@')[1]?.split('/')[0] || '';

    const region = $('h5:contains("Region")').text().replace('Region:', '').trim();
    const date = $('h5:contains("GMT")').text().trim();

    const musicUrl = $('audio').attr('src')
      ? `https://www.tikwm.com${$('audio').attr('src')}`
      : null;

    const statsContainer = $('div.col-lg-12.col-md-12.col-sm-12.col-xs-12.col-md-offset-2.col-lg-offset-2.text-center');
    const stats = {
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0
    };

    if (statsContainer.length) {
      const statDivs = statsContainer.find('> div');
      
      statDivs.each((i, el) => {
        const iconClass = $(el).find('span.glyphicon').attr('class') || '';
        const countText = $(el).contents().filter((_, node) => node.nodeType === 3).text().trim();
        const count = parseInt(countText.replace(/[^\d]/g, '')) || 0;

        if (iconClass.includes('play-circle')) stats.views = count;
        else if (iconClass.includes('heart')) stats.likes = count;
        else if (iconClass.includes('comment')) stats.comments = count;
        else if (iconClass.includes('share')) stats.shares = count;
      });
    }

    res.json({
      videoId,
      username,
      nickname,
      title,
      region,
      createdAt: date,
      downloadLink,
      music: {
        url: musicUrl
      },
      stats
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Unexpected error.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`run http://localhost:${PORT}/`);
});
