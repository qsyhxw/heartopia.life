export const EVENT_DISCOVERY_SOURCES = Object.freeze([
  {
    id: 'official-news-api',
    label: 'Official Heartopia news feed',
    kind: 'official',
    format: 'json',
    url: 'https://poster-api.xd.com/api/v1.0/form/articles/list?block_code=xdt-website-news-global&language=en_US&order_by=time&page_size=50&page=1',
  },
  { id: 'official-news-page', label: 'Official Heartopia news page', kind: 'official', url: 'https://heartopia.xd.com/news?language=en_US', revisionOnly: true },
  { id: 'official-home', label: 'Official Heartopia website', kind: 'official', url: 'https://heartopia.xd.com/', revisionOnly: true },
  { id: 'event-catalog', label: 'Event listing cross-check', kind: 'catalog', url: 'https://www.heartodex.com/en/events/' },
]);

export const OFFICIAL_EVENT_IMAGE_HOSTS = Object.freeze([
  'heartopia.xd.com',
  'website.xdcdn.net',
  'web.xdcdn.net',
]);
