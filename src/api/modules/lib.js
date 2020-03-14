const sleep = ms => new Promise(res => setTimeout(res, ms))

async function waitForTruthy (callback, delay = 200) {
  try { return callback() } catch {}
  return await sleep(delay).then(() => waitForTruthy(callback, delay))
}

const slugify = (text) => {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/&/g, 'and')           // Replace & with and
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single
}

module.exports = {
    waitForTruthy: waitForTruthy,
    sleep: sleep,
    slugify: slugify
};