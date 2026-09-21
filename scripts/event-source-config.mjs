export const EVENT_DISCOVERY_SOURCES = Object.freeze([
  {
    id: 'steam-official-news-rss',
    label: 'Official Heartopia Steam news feed',
    kind: 'official',
    format: 'steam-rss',
    url: 'https://store.steampowered.com/feeds/news/app/4025700/?l=english&cc=US',
  },
  {
    id: 'official-x-burger-bliss',
    label: 'Official Heartopia X post: Burger Bliss',
    kind: 'official',
    format: 'fx-tweet',
    url: 'https://api.fxtwitter.com/MyHeartopia/status/2098698174743605572',
  },
  {
    id: 'official-x-september-preview',
    label: 'Official Heartopia X post: September update preview',
    kind: 'official',
    format: 'fx-tweet',
    url: 'https://api.fxtwitter.com/MyHeartopia/status/2101597244990382260',
  },
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
  'pbs.twimg.com',
  'img.youtube.com',
  'raw.githubusercontent.com',
  'clan.cdn.queniuqe.com',
  'clan.fastly.steamstatic.com',
  'clan.st.dl.eccdnx.com',
  'steamuserimages-a.akamaihd.net',
  'shared.akamai.steamstatic.com',
]);

// Stable, event-specific artwork selected from verified announcements or the
// cross-check catalog. Discovery may add images for new events, but it must not
// replace these known-good assets with a generic Steam "Notice" enclosure.
export const VERIFIED_EVENT_ARTWORK_SOURCES = Object.freeze([
  {
    slug: 'september-23-update-preview',
    title: 'September 23 Update Preview',
    imageUrl: 'https://pbs.twimg.com/media/HSpOglDaAAArP4V.jpg?name=orig',
    url: 'https://x.com/MyHeartopia/status/2101597244990382260',
  },
  {
    slug: 'echo-of-ancients',
    title: 'Echo of Ancients',
    imageUrl: 'https://img.youtube.com/vi/8K5lHoKJgyI/maxresdefault.jpg',
    url: 'https://www.youtube.com/watch?v=8K5lHoKJgyI',
  },
  {
    slug: 'qixi-fair',
    title: 'Qixi Fair',
    imageUrl: 'https://raw.githubusercontent.com/deskoxp/htpimagstor/main/webcms/eventos/1788212824431-evento-134312823022865932_1239_697_1786790731377.webp',
    url: 'https://www.heartodex.com/en/events/qixi-fair/',
  },
  {
    slug: 'dave-the-diver',
    title: 'Dave the Diver',
    imageUrl: 'https://clan.fastly.steamstatic.com/images/45812445/41615538ecf9abb1f2a2a602025ea175da9790ba.jpg',
    url: 'https://store.steampowered.com/news/app/4025700/view/719038550989865207',
  },
]);
