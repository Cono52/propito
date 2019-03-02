const blockedResourceTypes = [
  // 'image', <-- seems to fail when we block images
  'media',
  'font',
  'texttrack',
  // 'stylesheet',
  'object',
  'beacon',
  'csp_report',
  'imageset'
]

const skippedResources = [
  'quantserve',
  'adzerk',
  'doubleclick',
  'adition',
  'exelator',
  'sharethrough',
  'cdn.api.twitter',
  'google-analytics',
  'googletagmanager',
  'google',
  'fontawesome',
  'https://lid.zoocdn.com/80/60',
  'facebook',
  'analytics',
  'optimizely',
  'clicktale',
  'mixpanel',
  'match',
  'criteo',
  'zedo',
  'clicksor',
  'zoopla/static',
  'tiqcdn'
]

module.exports = { blockedResourceTypes, skippedResources }
