import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const eventData = JSON.parse(fs.readFileSync(path.join(root, 'data/heartopia-events.json'), 'utf8'));
const whaleData = JSON.parse(fs.readFileSync(path.join(root, 'data/heartopia-call-of-whales-routes.json'), 'utf8'));
const current = eventData.events.filter((event) => ['active', 'upcoming'].includes(event.status));
const archived = eventData.events.filter((event) => event.status === 'archive');
const updated = eventData.generatedAt || new Date().toISOString().slice(0, 10);
const officialSite = 'https://heartopia.xd.com';
const googlePlay = 'https://play.google.com/store/apps/details?id=com.xd.xdtglobal.gp';

const T = {
  id: {
    lang: 'id', og: 'id_ID', prefix: '/id', official: `${officialSite}/id/`,
    nav: ['Event', 'Kode', 'Gacha', 'Top Up', 'Download'],
    links: ['/id/events/', '/id/codes/', '/id/guides/gacha/', '/id/guides/top-up/', '/id/download/'],
    eventsTitle: 'Event Heartopia: Aktif, Mendatang & Arsip',
    eventsDesc: 'Pantau event Heartopia aktif dan mendatang, lalu buka panduan, jadwal, checklist, lokasi, dan arsip event.',
    calendar: 'Kalender event Heartopia', active: 'Sedang berlangsung', currentGuides: 'Panduan event saat ini',
    currentIntro: 'Buka event untuk melihat jadwal, syarat masuk, aktivitas, lokasi, checklist, dan tautan panduan terkait.',
    upcoming: 'Segera hadir', upcomingEmpty: 'Belum ada event mendatang yang tercatat.',
    recurring: 'Aktivitas permanen', recurringIntro: 'Aktivitas bergaya event yang dapat dimainkan di luar jadwal event musiman.',
    archive: 'Arsip event', archiveIntro: 'Gunakan arsip untuk mengenali koleksi, resep, satwa, dan hadiah terbatas yang mungkin kembali.',
    view: 'Buka panduan', past: 'Event berakhir', updated: 'Diperbarui',
    recurringNames: ['Memancing Laut', 'Umpan Serangga', 'Sarang Ratusan'],
    footer: 'Situs penggemar tidak resmi. Ketersediaan event dapat berbeda menurut server; konfirmasikan di panel event dalam game.',
    labels: { status: 'Status', schedule: 'Jadwal', type: 'Jenis', requirement: 'Syarat masuk', focus: 'Fokus utama', server: 'Waktu server' },
    sanrio: {
      title: 'Heartopia x SANRIO CHARACTERS',
      desc: 'Cinnamoroll, Kuromi, dan My Melody hadir di Heartopia. Lihat jadwal, aktivitas undangan, hadiah, dan checklist kolaborasi.',
      eyebrow: 'Kolaborasi terbatas', intro: 'Cinnamoroll, Kuromi, dan My Melody hadir di Heartopia pada 17 Juli 2026. Gunakan panduan ini untuk memeriksa undangan harian, hadiah, aktivitas kolaborasi, dan hal yang perlu disiapkan.',
      characters: 'Karakter yang diumumkan', start: 'Mulai 17 Juli 2026', pre: 'Pra-event undangan: 10 Juli',
      facts: [['Tanggal mulai', '17 Juli 2026', 'Kolaborasi dimulai pada 17 Juli dan berlangsung hingga 23 Agustus 2026.'], ['Pra-event', 'Undangan harian', 'SANRIO CHARACTERS’ Invitation dimulai pada 10 Juli.'], ['Catatan jadwal', 'Periksa dalam game', 'Gunakan panel event langsung untuk jam server dan perubahan jadwal.']],
      checklistTitle: 'Checklist pra-event undangan', checklist: [['Login setiap hari', 'Buka SANRIO CHARACTERS’ Invitation dari panel event.'], ['Nyalakan kepingan puzzle', 'Selesaikan check-in harian untuk membuka progres undangan.'], ['Ambil hadiah', 'Klaim Exhibition Pass dan wallpaper kolaborasi yang tercantum.']],
      announced: 'Konten kolaborasi yang diumumkan', announcedItems: [['Speciality Exhibition', 'Aktivitas pameran khusus kolaborasi.'], ['Furniture Fair', 'Konten furnitur dan dekorasi bertema SANRIO.'], ['SANRIO Gacha Machine', 'Gacha kolaborasi dengan aturan dan pool khusus.']],
      launchTitle: 'Yang dilakukan saat kolaborasi dibuka', launch: [['Buka panel event', 'Baca jadwal server sebelum memakai pass atau masuk aktivitas terbatas.'], ['Klaim hadiah undangan', 'Ambil hadiah puzzle yang telah selesai sebelum memulai konten utama.'], ['Kunjungi pameran', 'Gunakan navigasi dalam game menuju Speciality Exhibition.'], ['Periksa gacha dan biaya', 'Cocokkan pool, nomor draw, rate, dan kebutuhan mata uang sebelum menarik.']],
      faqTitle: 'FAQ kolaborasi SANRIO', faq: [['Kapan kolaborasi dimulai?', 'Kolaborasi dimulai 17 Juli 2026; pra-event undangan dimulai 10 Juli.'], ['Bagaimana memakai pra-event undangan?', 'Login harian, nyalakan kepingan puzzle, lalu klaim Exhibition Pass dan wallpaper.'], ['Apakah aturan gacha sama dengan banner lain?', 'Tidak. Baca aturan pool SANRIO yang sedang dibuka dan jangan memakai asumsi pity dari banner lain.'], ['Di mana melihat waktu berakhir?', 'Periksa panel event langsung karena jadwal menggunakan waktu server.']],
    },
    whale: {
      title: 'Call of Whales: Lokasi Paus Hari 1–16',
      desc: 'Panduan Call of Whales dalam Bahasa Indonesia: jadwal, syarat, 16 lokasi Splash Whale, gelembung hadiah, Concert, koleksi, dan solusi masalah.',
      eyebrow: 'Fashionwave musim panas', intro: 'Call of Whales menghadirkan Whalefall Canyon, Ocean Cleanup, koleksi Splash Whale, Concert, resep laut, satwa baru, dan rumah bawah air.',
      facts: [['Periode event', '11 Juli – 22 Agustus', 'Mulai 06.00 dan berakhir 05.59 menurut waktu server.'], ['Syarat masuk', 'D.G. Member Level 7', 'Selesaikan syarat cerita utama yang tampil di panel event.'], ['Fokus utama', 'Laut dan Fashionwave', 'Jelajahi Whalefall Canyon, Ocean Cleanup, koleksi, dan rumah bawah air.']],
      includedTitle: 'Isi utama Call of Whales', included: [['Whalefall Canyon', 'Area laut baru untuk quest, aktivitas, dan koleksi musiman.'], ['Ocean Cleanup', 'Hobi permanen untuk membersihkan polusi laut dan membuka progres terkait.'], ['Splash Whale', 'Foto 16 paus kecil dan ambil gelembung hadiah terpisah di setiap rute.'], ['Fashionwave & Memory Journal', 'Periksa tugas terbatas, pass, dan hadiah sebelum hitung mundur berakhir.']],
      startTitle: 'Cara memulai tanpa melewatkan hadiah', steps: [['Periksa level dan cerita', 'Pastikan D.G. Member Level 7 dan syarat cerita utama sudah selesai.'], ['Buka ikon event paus', 'Cek sisa waktu, Fashionwave, Memory Journal, dan hadiah aktif.'], ['Masuk ke Whalefall Canyon', 'Ikuti navigasi dalam game untuk membuka camp dan area laut.'], ['Dahulukan konten terbatas', 'Selesaikan jurnal, Splash Whale, dan Fashionwave sebelum aktivitas permanen.']],
      whalesTitle: '16 lokasi Splash Whale dan gelembung hadiah', whalesIntro: 'Ambil foto setelah nama target muncul di kamera. Foto dan gelembung hadiah adalah dua langkah terpisah.',
      day: 'Hari', location: 'Lokasi paus', bubble: 'Gelembung hadiah', marked: 'Tandai sudah difoto', photographed: 'Sudah difoto ✓',
      concertTitle: 'Cara mengikuti Concert', concert: [['Buka ikon event paus dan pilih Fashion Activity.'], ['Lacak tugas Concert dan catat waktu server yang ditampilkan.'], ['Ikuti tujuan dari panel event dan datang sebelum waktu mulai.'], ['Setelah acara, periksa tugas, kotak surat, dan hadiah yang belum diklaim.']],
      collectionsTitle: 'Koleksi, resep, dan material penting', collections: [['Satwa laut', 'Japanese Flying Squid, Firefly Squid, Sea Slug, Mandarin Fish, Olive Ridley Turtle, Flatback Turtle, dan Scallop.'], ['Burung event', 'Wandering Albatross, Grey-mantled Albatross, White Spoonbill, Roseate Spoonbill, White-winged Tern, dan Pomarine Skua.'], ['Material memasak', 'Simpan Glasswort, Sea Grape, Wakame, Spirulina Powder, Scallop, Japanese Flying Squid, dan Starfruit.'], ['Resep event', 'Buka Tidal Stove dari quest memasak Massimo dan selesaikan resep musiman sebelum event berakhir.']],
      troubleTitle: 'Jika event atau target tidak muncul', trouble: [['Panel event terkunci', 'Periksa level D.G., progres cerita utama, lalu buka kembali panel setelah refresh server.'], ['Aktivitas tidak tersedia', 'Bandingkan waktu lokal dengan waktu server; akhir event bukan tengah malam di semua wilayah.'], ['Target Ocean Cleanup tidak terlihat', 'Pasang pembaruan terbaru dan muat ulang Whalefall Canyon.'], ['Hadiah paus belum diterima', 'Selesaikan quest paus prasyarat, foto target, lalu cari dan buka gelembung hadiah terpisah.']],
      faqTitle: 'FAQ Call of Whales', faq: [['Kapan Call of Whales berakhir?', '22 Agustus 2026 pukul 05.59 menurut waktu server.'], ['Berapa jumlah Splash Whale?', 'Ada 16 paus dalam urutan lengkap dan semua lokasi Hari 1–16 tercantum di halaman ini.'], ['Apakah Ocean Cleanup terbatas waktu?', 'Ocean Cleanup diperkenalkan sebagai hobi permanen; Fashionwave dan hadiah musiman memakai hitung mundur event.'], ['Mengapa furnitur paus belum diterima?', 'Foto saja belum cukup. Ambil juga gelembung hadiah terpisah setelah menyelesaikan quest prasyarat.']],
    },
    download: {
      title: 'Download Heartopia dengan Aman', desc: 'Download Heartopia lewat situs resmi XD atau Google Play terverifikasi, dengan panduan platform, kompatibilitas, penyimpanan, dan keamanan APK.',
      intro: 'Gunakan hanya situs resmi XD atau halaman Google Play dengan paket com.xd.xdtglobal.gp. Untuk platform lain, mulai dari situs resmi agar tidak salah membuka halaman toko.',
      official: 'Rute download yang sudah diverifikasi', xd: 'Situs resmi Heartopia', play: 'Google Play resmi', other: 'Steam, iPhone, iPad, dan platform lain', otherText: 'Pilih platform dari situs resmi Heartopia. Halaman ini tidak membuat tautan toko yang belum diverifikasi di repositori.',
      stepsTitle: 'Sebelum memasang', steps: [['Periksa domain', 'Pastikan alamatnya heartopia.xd.com atau play.google.com.'], ['Periksa developer', 'Di Google Play, developer harus XD Entertainment dan paketnya com.xd.xdtglobal.gp.'], ['Siapkan ruang kosong', 'Sediakan ruang untuk aplikasi, data tambahan, dan pembaruan berikutnya.'], ['Lindungi akun', 'Jangan berikan kata sandi, kode OTP, atau backup code kepada situs download.']],
      platformTitle: 'Memilih rute berdasarkan perangkat', platforms: [['Android', 'Gunakan Google Play resmi. Hindari APK atau MOD dari situs distribusi tidak dikenal.'], ['PC dan platform lain', 'Mulai dari situs XD resmi, lalu pilih platform yang tersedia untuk wilayah Anda.'], ['Perangkat tidak kompatibel', 'Perbarui sistem dan Google Play, kosongkan ruang, lalu periksa kembali kompatibilitas pada halaman resmi.']],
      faqTitle: 'FAQ download', faq: [['Apakah APK pihak ketiga aman?', 'Jangan memasang APK jika sumber dan perubahan filenya tidak dapat diverifikasi. Gunakan Google Play atau rute yang ditunjuk XD.'], ['Mengapa game tidak muncul di toko?', 'Ketersediaan dapat berbeda menurut perangkat, akun, dan wilayah. Periksa lewat situs resmi.'], ['Apakah halaman ini menyediakan installer PC?', 'Tidak. Untuk PC atau platform lain, halaman ini mengarahkan pengguna ke situs resmi XD.']],
    },
    safety: {
      title: 'Apakah Heartopia Aman?', desc: 'Panduan keamanan Heartopia untuk download resmi, perlindungan akun, chat, anak, pembayaran pihak ketiga, dan penanganan akun bermasalah.',
      intro: 'Risiko file palsu, pencurian akun, chat, dan pembayaran pihak ketiga bukan masalah yang sama. Periksa masing-masing secara terpisah.',
      quick: 'Pemeriksaan keamanan 30 detik', good: 'Kemungkinan aman untuk dilanjutkan', caution: 'Periksa sebelum lanjut', stop: 'Segera berhenti',
      groups: [['Domain resmi XD atau Google Play; developer dan paket cocok; total pembayaran terlihat jelas.'], ['Layanan top-up pihak ketiga; meminta player ID; diskon besar atau kebijakan refund tidak jelas.'], ['Meminta password atau OTP; menyuruh memasang MOD/APK; tidak menampilkan perusahaan, mata uang, atau dukungan.']],
      accountTitle: 'Lindungi akun dan metode login', account: ['Gunakan password unik untuk email atau akun sosial yang terhubung.', 'Aktifkan autentikasi dua faktor jika tersedia.', 'Jangan bagikan OTP, backup code, atau sesi login.', 'Simpan nomor pesanan dan bukti pembayaran sampai item diterima.'],
      chatTitle: 'Chat dan pemain di bawah umur', chat: ['Jangan bagikan nama lengkap, sekolah, alamat, nomor telepon, atau akun sosial.', 'Blokir dan laporkan pemain yang membuat tidak nyaman.', 'Aktifkan autentikasi pembelian dan batas waktu perangkat.', 'Orang tua perlu meninjau chat, konten pengguna, dan pembelian dalam aplikasi.'],
      paymentTitle: 'Periksa pembayaran pihak ketiga', payment: ['Siapa perusahaan yang memproses pesanan?', 'Informasi akun apa yang benar-benar dibutuhkan?', 'Apakah server, produk, mata uang, biaya, dan total akhir sudah benar?', 'Siapa yang menangani refund atau item yang belum masuk?'],
      responseTitle: 'Jika Anda sudah memasukkan informasi akun', response: ['Ubah password melalui penyedia login resmi.', 'Tinjau riwayat login dan keluarkan sesi yang tidak dikenal.', 'Aktifkan autentikasi dua faktor dan amankan email.', 'Hubungi dukungan dalam game serta penyedia pembayaran jika ada transaksi mencurigakan.'],
      faqTitle: 'FAQ keamanan', faq: [['Apakah Heartopia berbahaya?', 'Tidak ada dasar untuk menyebut game berbahaya hanya dari namanya, tetapi file palsu, phishing, chat, dan pembelian tetap perlu dikendalikan.'], ['Apakah semua top-up pihak ketiga adalah penipuan?', 'Tidak dapat disimpulkan hanya karena pihak ketiga, tetapi jalur tersebut menambah pemeriksaan, pihak pemroses, dan risiko sengketa.'], ['Apa yang dilakukan jika item belum masuk?', 'Jangan langsung membeli lagi. Periksa status pesanan, akun, server, kotak surat, lalu hubungi tempat pembelian dengan nomor pesanan.']],
    },
  },
  'pt-br': {
    lang: 'pt-BR', og: 'pt_BR', prefix: '/pt-br', official: `${officialSite}/pt/`,
    nav: ['Eventos', 'Códigos', 'Gacha', 'Recarga', 'Download'],
    links: ['/pt-br/events/', '/pt-br/codes/', '/pt-br/guides/gacha/', '/pt-br/guides/top-up/', '/pt-br/download/'],
    eventsTitle: 'Eventos de Heartopia: Ativos, Próximos e Arquivo',
    eventsDesc: 'Acompanhe eventos ativos e anunciados de Heartopia e abra guias com datas, atividades, locais, checklists e arquivos.',
    calendar: 'Calendário de eventos de Heartopia', active: 'Acontecendo agora', currentGuides: 'Guias dos eventos atuais',
    currentIntro: 'Abra um evento para conferir datas, requisitos, atividades, locais, checklists e guias relacionados.',
    upcoming: 'Em breve', upcomingEmpty: 'Nenhum evento futuro está listado no momento.',
    recurring: 'Atividades permanentes', recurringIntro: 'Atividades no estilo de evento que continuam disponíveis fora das temporadas.',
    archive: 'Arquivo de eventos', archiveIntro: 'Use o arquivo para identificar coleções, receitas, animais e recompensas que podem retornar.',
    view: 'Abrir guia', past: 'Evento encerrado', updated: 'Atualizado',
    recurringNames: ['Pesca Marítima', 'Isca para Insetos', 'Ninho das Centenas'],
    footer: 'Site de fãs não oficial. A disponibilidade pode variar por servidor; confirme no painel do evento dentro do jogo.',
    labels: { status: 'Status', schedule: 'Período', type: 'Tipo', requirement: 'Requisito', focus: 'Foco principal', server: 'Horário do servidor' },
    sanrio: {
      title: 'Heartopia x SANRIO CHARACTERS',
      desc: 'Guia da colaboração SANRIO em Heartopia com datas, convite diário, recompensas, atividades, gacha e checklist.',
      eyebrow: 'Colaboração limitada', intro: 'Cinnamoroll, Kuromi e My Melody chegam a Heartopia em 17 de julho de 2026. Confira o convite diário, as recompensas, as atividades e o que preparar.',
      characters: 'Personagens anunciados', start: 'Início em 17 de julho de 2026', pre: 'Pré-evento: 10 de julho',
      facts: [['Data de início', '17 de julho de 2026', 'A colaboração vai de 17 de julho a 23 de agosto de 2026.'], ['Pré-evento', 'Convite diário', 'SANRIO CHARACTERS’ Invitation começa em 10 de julho.'], ['Nota de horário', 'Confira no jogo', 'Use o painel ativo para verificar o horário do servidor e mudanças.']],
      checklistTitle: 'Checklist do pré-evento de convite', checklist: [['Entre todos os dias', 'Abra SANRIO CHARACTERS’ Invitation no painel de eventos.'], ['Ilumine as peças', 'Complete o check-in diário para avançar no quebra-cabeça.'], ['Resgate as recompensas', 'Pegue os Exhibition Passes e papéis de parede indicados.']],
      announced: 'Conteúdo anunciado para a colaboração', announcedItems: [['Speciality Exhibition', 'Atividade de exposição exclusiva da colaboração.'], ['Furniture Fair', 'Móveis e decoração com tema SANRIO.'], ['SANRIO Gacha Machine', 'Gacha da colaboração com regras e pool próprios.']],
      launchTitle: 'O que fazer quando a colaboração abrir', launch: [['Abra o painel primeiro', 'Leia o horário do servidor antes de usar passes.'], ['Resgate o convite', 'Pegue as recompensas concluídas do quebra-cabeça.'], ['Visite a exposição', 'Use a navegação do jogo para entrar na Speciality Exhibition.'], ['Confira gacha e custo', 'Confirme pool, draw atual, taxas e moeda restante antes de puxar.']],
      faqTitle: 'FAQ da colaboração SANRIO', faq: [['Quando começa?', 'A colaboração começa em 17 de julho; o convite começa em 10 de julho.'], ['Como funciona o convite?', 'Entre diariamente, ilumine as peças e resgate passes e papéis de parede.'], ['O pity é igual ao de outros banners?', 'Não presuma isso. Leia as regras do pool SANRIO aberto no jogo.'], ['Onde vejo o encerramento?', 'Confira o painel ativo, pois os horários usam o servidor.']],
    },
    whale: {
      title: 'Call of Whales: Locais das Baleias — Dias 1–16',
      desc: 'Guia de Call of Whales em português: período, requisitos, 16 Splash Whales, bolhas de recompensa, Concert, coleções e solução de problemas.',
      eyebrow: 'Fashionwave de verão', intro: 'Call of Whales traz Whalefall Canyon, Ocean Cleanup, 16 Splash Whales, Concert, receitas do mar, animais e casa subaquática.',
      facts: [['Período', '11 de julho – 22 de agosto', 'Começa às 06:00 e termina às 05:59 no horário do servidor.'], ['Requisito', 'D.G. Member Nível 7', 'Conclua o requisito de história mostrado no painel ativo.'], ['Foco principal', 'Oceano e Fashionwave', 'Explore o cânion, a limpeza do oceano, coleções e a casa subaquática.']],
      includedTitle: 'O que Call of Whales inclui', included: [['Whalefall Canyon', 'Nova área oceânica para missões, atividades e coleções.'], ['Ocean Cleanup', 'Hobby permanente para remover poluição e avançar nas recompensas.'], ['Splash Whales', 'Fotografe 16 baleias e encontre uma bolha de recompensa separada em cada rota.'], ['Fashionwave e Memory Journal', 'Priorize tarefas e recompensas limitadas antes do fim da contagem.']],
      startTitle: 'Como começar sem perder recompensas', steps: [['Confira nível e história', 'Garanta o Nível 7 de D.G. Member e a missão principal exigida.'], ['Abra o ícone da baleia', 'Veja tempo restante, Fashionwave, Memory Journal e recompensas.'], ['Entre em Whalefall Canyon', 'Siga a navegação do jogo para liberar o acampamento e o mar.'], ['Priorize o conteúdo limitado', 'Faça o diário, as baleias e Fashionwave antes do hobby permanente.']],
      whalesTitle: '16 locais de Splash Whale e bolhas de recompensa', whalesIntro: 'Tire a foto quando o nome aparecer na câmera. A fotografia e a bolha são duas etapas separadas.',
      day: 'Dia', location: 'Local da baleia', bubble: 'Bolha de recompensa', marked: 'Marcar como fotografada', photographed: 'Fotografada ✓',
      concertTitle: 'Como participar do Concert', concert: [['Abra o ícone da baleia e escolha Fashion Activity.'], ['Rastreie a tarefa Concert e anote o horário do servidor.'], ['Siga o destino indicado e chegue antes do início.'], ['Depois, confira tarefas, correio e recompensas pendentes.']],
      collectionsTitle: 'Coleções, receitas e materiais importantes', collections: [['Vida marinha', 'Japanese Flying Squid, Firefly Squid, Sea Slug, Mandarin Fish, Olive Ridley Turtle, Flatback Turtle e Scallop.'], ['Aves do evento', 'Wandering Albatross, Grey-mantled Albatross, White Spoonbill, Roseate Spoonbill, White-winged Tern e Pomarine Skua.'], ['Materiais culinários', 'Guarde Glasswort, Sea Grape, Wakame, Spirulina Powder, Scallop, Japanese Flying Squid e Starfruit.'], ['Receitas do evento', 'Libere o Tidal Stove pela missão de Massimo e termine as receitas sazonais antes do fim.']],
      troubleTitle: 'Se o evento ou o alvo não aparecer', trouble: [['Painel bloqueado', 'Confira nível D.G. e história principal; reabra após a atualização do servidor.'], ['Atividade indisponível', 'Compare seu relógio com o horário do servidor.'], ['Alvos invisíveis', 'Instale a atualização mais recente e recarregue Whalefall Canyon.'], ['Recompensa não recebida', 'Conclua a missão, fotografe e abra a bolha separada antes de sair.']],
      faqTitle: 'FAQ de Call of Whales', faq: [['Quando termina?', '22 de agosto de 2026 às 05:59 no horário do servidor.'], ['Quantas Splash Whales existem?', 'São 16; todos os locais dos Dias 1–16 estão nesta página.'], ['Ocean Cleanup é temporário?', 'Não. O hobby é permanente, mas Fashionwave e recompensas sazonais usam contagem regressiva.'], ['Por que não recebi o móvel?', 'A foto não basta; abra também a bolha de recompensa após a missão exigida.']],
    },
    download: {
      title: 'Baixar Heartopia com Segurança', desc: 'Baixe Heartopia pelo site oficial da XD ou Google Play verificado e confira plataforma, compatibilidade, armazenamento e segurança de APK.',
      intro: 'Use somente o site oficial da XD ou o Google Play com o pacote com.xd.xdtglobal.gp. Para outras plataformas, comece pelo site oficial.',
      official: 'Rotas de download verificadas', xd: 'Site oficial de Heartopia', play: 'Google Play oficial', other: 'Steam, iPhone, iPad e outras plataformas', otherText: 'Escolha a plataforma no site oficial. Esta página não inventa links de lojas que ainda não foram verificados no repositório.',
      stepsTitle: 'Antes de instalar', steps: [['Confira o domínio', 'Use heartopia.xd.com ou play.google.com.'], ['Confira a desenvolvedora', 'No Google Play, confirme XD Entertainment e com.xd.xdtglobal.gp.'], ['Reserve espaço', 'Deixe espaço para o aplicativo, dados adicionais e atualizações.'], ['Proteja sua conta', 'Não informe senha, OTP ou código de recuperação a sites de download.']],
      platformTitle: 'Escolha a rota para seu dispositivo', platforms: [['Android', 'Use o Google Play oficial; evite APK, MOD e distribuidores desconhecidos.'], ['PC e outras plataformas', 'Comece no site oficial da XD e escolha uma opção disponível em sua região.'], ['Dispositivo incompatível', 'Atualize o sistema e a loja, libere espaço e confira novamente a página oficial.']],
      faqTitle: 'FAQ de download', faq: [['APK de terceiros é seguro?', 'Evite arquivos cuja origem e integridade não podem ser verificadas.'], ['Por que o jogo não aparece na loja?', 'A disponibilidade pode variar por dispositivo, conta e região; confira pelo site oficial.'], ['Esta página oferece instalador de PC?', 'Não. Ela direciona usuários de PC e outras plataformas ao site oficial da XD.']],
    },
    safety: {
      title: 'Heartopia é Seguro?', desc: 'Guia de segurança de Heartopia para download oficial, conta, chat, menores, pagamentos de terceiros e resposta a incidentes.',
      intro: 'Arquivos falsos, roubo de conta, chat e pagamentos externos são riscos diferentes e precisam ser avaliados separadamente.',
      quick: 'Verificação de segurança em 30 segundos', good: 'Provavelmente seguro para continuar', caution: 'Confira antes de continuar', stop: 'Pare imediatamente',
      groups: [['Domínio oficial ou Google Play; pacote e desenvolvedora corretos; total da compra visível.'], ['Recarga externa; pedido de player ID; desconto grande ou reembolso pouco claro.'], ['Pedido de senha ou OTP; instalação de MOD/APK; empresa, moeda ou suporte ausentes.']],
      accountTitle: 'Proteja sua conta e login', account: ['Use uma senha exclusiva no e-mail ou login conectado.', 'Ative autenticação de dois fatores quando disponível.', 'Nunca compartilhe OTP, código de recuperação ou sessão.', 'Guarde número do pedido e comprovantes até receber os itens.'],
      chatTitle: 'Chat e jogadores menores de idade', chat: ['Não publique nome completo, escola, endereço, telefone ou rede social.', 'Bloqueie e denuncie contatos desconfortáveis.', 'Ative autenticação de compra e limites do dispositivo.', 'Responsáveis devem revisar chat, conteúdo de usuários e compras.'],
      paymentTitle: 'Confira pagamentos de terceiros', payment: ['Qual empresa processa o pedido?', 'Quais dados da conta são realmente necessários?', 'Servidor, produto, moeda, taxas e total estão corretos?', 'Quem trata reembolso ou item não entregue?'],
      responseTitle: 'Se você já informou dados da conta', response: ['Altere a senha pelo provedor oficial.', 'Revise logins e encerre sessões desconhecidas.', 'Ative 2FA e proteja o e-mail.', 'Contate o suporte do jogo e o meio de pagamento se houver cobrança suspeita.'],
      faqTitle: 'FAQ de segurança', faq: [['Heartopia é perigoso?', 'O nome do jogo não é motivo para classificá-lo como perigoso, mas arquivos falsos, phishing, chat e compras exigem cuidado.'], ['Toda recarga externa é golpe?', 'Não é possível concluir isso apenas por ser externa, mas há mais empresas, verificações e risco de disputa.'], ['O item não chegou; o que fazer?', 'Não compre novamente de imediato. Confira pedido, conta, servidor e correio; depois contate o vendedor.']],
    },
  },
};

const regional = {
  ja: {
    lang: 'ja', og: 'ja_JP', prefix: '/ja',
    nav: ['イベント', 'コード', 'ガチャ', '課金'], links: ['/ja/events/', '/ja/codes/', '/ja/guides/gacha/', '/ja/guides/top-up/'],
    eventsTitle: 'ハートピア開催中・予定・過去イベント', eventsDesc: 'ハートピアの開催中イベント、予定、過去イベントを日程・攻略リンク・チェックリスト付きで確認。',
    calendar: 'ハートピアイベントカレンダー', active: '開催中', currentGuides: '現在のイベント攻略',
    currentIntro: '日程、参加条件、活動内容、場所、チェックリスト、関連攻略を確認できます。', upcoming: '開催予定', upcomingEmpty: '現在、開催予定イベントは登録されていません。',
    recurring: '常設アクティビティ', recurringIntro: 'シーズン期間外でも遊べるイベント形式の常設コンテンツ。', archive: '過去イベント', archiveIntro: '復刻時に備えて限定コレクション、レシピ、生き物、報酬を確認できます。',
    view: '攻略を見る', past: '終了', updated: '更新', recurringNames: ['海釣り', '虫の餌やり', '百鳥の巣'],
    footer: '非公式ファンサイトです。開催状況はサーバーによって異なるため、ゲーム内イベント画面で確認してください。',
  },
  'zh-tw': {
    lang: 'zh-Hant', og: 'zh_TW', prefix: '/zh-tw',
    nav: ['活動', '兌換碼', '轉蛋', '儲值'], links: ['/zh-tw/events/', '/zh-tw/codes/', '/guides/gacha/', '/zh-tw/guides/top-up/'],
    eventsTitle: '心動小鎮目前、即將開始與過去活動', eventsDesc: '整理心動小鎮進行中、已公布與過去活動，包含日期、攻略、檢查表與相關入口。',
    calendar: '心動小鎮活動日曆', active: '進行中', currentGuides: '目前活動攻略',
    currentIntro: '開啟活動頁即可查看日期、參加條件、活動內容、位置、檢查表與相關攻略。', upcoming: '即將開始', upcomingEmpty: '目前沒有已列出的即將開始活動。',
    recurring: '常設活動', recurringIntro: '不受季節活動期限影響的常設活動內容。', archive: '過去活動', archiveIntro: '用來查找可能在復刻時回歸的限定收藏、食譜、生物與獎勵。',
    view: '查看攻略', past: '已結束', updated: '更新', recurringNames: ['海釣', '誘餌昆蟲', '百鳥巢'],
    footer: '非官方粉絲網站。活動狀態可能因伺服器而異，請以遊戲內活動頁面為準。',
  },
};

const sanrioRegional = {
  ja: {
    title: 'ハートピア × SANRIO CHARACTERS コラボ攻略', desc: 'サンリオコラボの日程、招待プレイベント、報酬、展示、家具、ガチャと開始日のチェックリスト。',
    eyebrow: '期間限定コラボ', intro: 'シナモロール、クロミ、マイメロディが2026年7月17日に登場。招待プレイベント、報酬、コラボ活動、開始前の準備を確認します。',
    characters: '発表済みキャラクター', start: '2026年7月17日開始', pre: '招待プレイベント：7月10日',
    facts: [['開始日', '2026年7月17日', 'コラボは7月17日から8月23日まで開催。'], ['プレイベント', '毎日の招待', 'SANRIO CHARACTERS’ Invitationは7月10日開始。'], ['時間の確認', 'ゲーム内を確認', 'サーバー時間と変更は開催中のイベント画面で確認します。']],
    checklistTitle: '招待プレイベントのチェックリスト', checklist: [['毎日ログイン', 'イベント画面から招待アクティビティを開きます。'], ['パズルを点灯', '毎日のチェックインで招待パズルを進めます。'], ['報酬を受け取る', '展示パスとコラボ壁紙を忘れず受け取ります。']],
    announced: '発表されているコラボ内容', announcedItems: [['Speciality Exhibition', 'コラボ限定の展示アクティビティ。'], ['Furniture Fair', 'サンリオテーマの家具と装飾。'], ['SANRIO Gacha Machine', '専用ルールとプールを持つコラボガチャ。']],
    launchTitle: 'コラボ開始日にすること', launch: [['イベント画面を確認', 'パスを使う前にサーバー時間を確認します。'], ['招待報酬を回収', '完成したパズル報酬を先に受け取ります。'], ['展示へ移動', 'ゲーム内ナビからSpeciality Exhibitionへ進みます。'], ['ガチャと費用を確認', '対象プール、現在の回数、確率、必要通貨を確認します。']],
    faqTitle: 'SANRIOコラボ FAQ', faq: [['いつ始まりますか？', 'コラボは7月17日、招待プレイベントは7月10日開始です。'], ['招待イベントの進め方は？', '毎日ログインし、パズルを点灯して展示パスと壁紙を受け取ります。'], ['他のガチャと同じ天井ですか？', '同じとは限りません。開催中のSANRIOプールのルールを確認してください。'], ['終了時刻はどこで確認？', 'サーバー時間を使うため、ゲーム内イベント画面で確認します。']],
  },
  'zh-tw': {
    title: '心動小鎮 × SANRIO CHARACTERS 聯動攻略', desc: '三麗鷗聯動日期、邀請預熱、獎勵、展覽、家具、轉蛋與活動開始檢查表。',
    eyebrow: '期間限定聯動', intro: '大耳狗喜拿、酷洛米與美樂蒂於2026年7月17日登場。這裡整理邀請預熱、獎勵、聯動內容與開始前準備。',
    characters: '已公布角色', start: '2026年7月17日開始', pre: '邀請預熱：7月10日',
    facts: [['開始日期', '2026年7月17日', '聯動活動期間為7月17日至8月23日。'], ['預熱活動', '每日邀請', 'SANRIO CHARACTERS’ Invitation於7月10日開始。'], ['時間提醒', '以遊戲內為準', '伺服器時間與調整請查看目前活動頁面。']],
    checklistTitle: '邀請預熱檢查表', checklist: [['每日登入', '從活動頁面開啟邀請活動。'], ['點亮拼圖', '透過每日簽到推進邀請拼圖。'], ['領取獎勵', '領取展覽券與聯動限定桌布。']],
    announced: '已公布的聯動內容', announcedItems: [['Speciality Exhibition', '聯動限定展覽活動。'], ['Furniture Fair', '三麗鷗主題家具與裝飾。'], ['SANRIO Gacha Machine', '具有獨立規則與卡池的聯動轉蛋。']],
    launchTitle: '聯動開啟後先做什麼', launch: [['先看活動頁面', '使用展覽券前先確認伺服器時間。'], ['領取邀請獎勵', '先領完已完成的拼圖獎勵。'], ['前往展覽', '使用遊戲內導航進入Speciality Exhibition。'], ['確認轉蛋與成本', '核對卡池、目前抽數、機率與剩餘貨幣。']],
    faqTitle: 'SANRIO聯動 FAQ', faq: [['聯動何時開始？', '聯動於7月17日開始，邀請預熱於7月10日開始。'], ['邀請活動怎麼玩？', '每日登入、點亮拼圖並領取展覽券與桌布。'], ['保底和其他卡池相同嗎？', '不一定，請查看目前SANRIO卡池規則。'], ['結束時間去哪裡看？', '活動使用伺服器時間，請以遊戲內活動頁面為準。']],
  },
};

const esc = (v) => String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const route = (event) => event.localSlug || event.slug;
const period = (event) => event.dateLabel || [event.startDate, event.endDate].filter(Boolean).join(' – ') || '—';
const imageFor = (event) => {
  for (const extension of ['webp', 'jpg', 'jpeg', 'png']) {
    const relative = `/img/events/${route(event)}.${extension}`;
    if (fs.existsSync(path.join(root, relative.slice(1)))) return relative;
  }
  return '/img/header.jpg';
};
const write = (relative, html) => {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${html}\n`);
};
const alternate = (pageRoute) => [
  ['en', `https://heartopia.life/${pageRoute}`],
  ['id', `https://heartopia.life/id/${pageRoute}`],
  ['pt-BR', `https://heartopia.life/pt-br/${pageRoute}`],
  ['ja', `https://heartopia.life/ja/${pageRoute}`],
  ['zh-Hant', `https://heartopia.life/zh-tw/${pageRoute}`],
  ['x-default', `https://heartopia.life/${pageRoute}`],
].map(([lang, href]) => `<link rel="alternate" hreflang="${lang}" href="${href}">`).join('');

function head(l, pageRoute, title, description, image = '/img/header.jpg', schema = {}) {
  const url = `https://heartopia.life${l.prefix}/${pageRoute}`;
  return `<!doctype html><html lang="${l.lang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="robots" content="index,follow"><link rel="canonical" href="${url}">${alternate(pageRoute)}<meta property="og:type" content="article"><meta property="og:locale" content="${l.og}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${url}"><meta property="og:site_name" content="Heartopia.Life"><meta property="og:image" content="https://heartopia.life${image}"><link rel="icon" href="/favicon-96x96.png"><script src="https://cdn.tailwindcss.com"></script><script>tailwind.config={theme:{extend:{colors:{cozy:{cream:'#FFF8F0',peach:'#FFE5D9',coral:'#FF9B85',sage:'#A8C686',sky:'#95C8D8',wood:'#8B7355',bark:'#5D4E37'}},fontFamily:{display:['Georgia','serif'],body:['system-ui','sans-serif']}}}}</script><script async src="https://www.googletagmanager.com/gtag/js?id=G-FRJ91G3VRR"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-FRJ91G3VRR');</script><script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', ...schema })}</script><style>html{scroll-behavior:smooth}.surface{background:#fff;border:1px solid #e7d5c8;border-radius:.65rem}.eyebrow{font-size:.76rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.event-card{box-shadow:0 5px 16px rgb(93 78 55/.08);transition:.2s}.event-card:hover{transform:translateY(-3px);box-shadow:0 14px 28px rgb(93 78 55/.14)}.cta{display:inline-flex;min-height:44px;align-items:center;border-radius:.55rem;background:#5D4E37;padding:.7rem 1rem;font-weight:800;color:#fff}.cta-soft{display:inline-flex;min-height:44px;align-items:center;border:1px solid #d9c8bb;border-radius:.55rem;background:#fff;padding:.7rem 1rem;font-weight:800}.whale-check{min-height:44px;width:100%;border:1px solid #5D4E37;border-radius:.5rem;padding:.6rem;font-weight:800}.whale-check.is-done{background:#e7f4e7;color:#315b38}</style></head><body class="bg-cozy-cream text-cozy-bark font-body">`;
}
function nav(l) {
  return `<header class="sticky top-0 z-50 border-b border-cozy-peach bg-white/95 backdrop-blur"><nav class="mx-auto max-w-6xl px-4 py-3"><div class="flex items-center justify-between gap-4"><a href="/" class="flex shrink-0 items-center gap-2"><img src="/favicon-96x96.png" alt="Heartopia.Life" class="h-7 w-7"><strong class="font-display text-xl">Heartopia<span class="text-cozy-sage">.Life</span></strong></a><div class="hidden items-center gap-5 text-sm font-bold md:flex">${l.nav.map((label, i) => `<a href="${l.links[i]}">${label}</a>`).join('')}</div><a class="rounded bg-cozy-peach px-3 py-2 text-xs font-bold md:hidden" href="${l.prefix}/events/">${l.nav[0]}</a></div></nav></header>`;
}
const footer = (l) => `<footer class="mt-12 bg-cozy-bark py-10 text-white"><div class="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-2"><div><strong class="font-display text-xl">Heartopia.Life</strong><p class="mt-3 max-w-xl text-sm leading-6 text-white/70">${esc(l.footer)}</p></div><div class="flex flex-wrap gap-4 text-sm font-bold md:justify-end"><a href="${l.prefix}/events/">${l.nav[0]}</a><a href="/guides/">Guides</a><a href="/database/">Database</a><a href="/tools/">Tools</a></div></div></footer></body></html>`;
const listCards = (items) => items.map(([title, text]) => `<article class="surface p-5"><h3 class="text-xl font-bold">${esc(title)}</h3><p class="mt-2 text-sm leading-6 text-cozy-wood">${esc(text)}</p></article>`).join('');
const faqCards = (items) => items.map(([q, a]) => `<details class="surface p-5"><summary class="cursor-pointer text-lg font-bold">${esc(q)}</summary><p class="mt-3 text-sm leading-6 text-cozy-wood">${esc(a)}</p></details>`).join('');

function eventIndex(l) {
  const activeCards = current.map((event) => {
    const eventSummary = route(event) === 'sanrio-characters-collaboration'
      ? (l.sanrio?.intro || sanrioRegional[l.lang === 'ja' ? 'ja' : 'zh-tw'].intro)
      : (l.whale?.intro || l.currentIntro);
    return `<a class="surface event-card group flex h-full flex-col overflow-hidden" href="${l.prefix}/events/${route(event)}/"><div class="aspect-[16/9] overflow-hidden bg-slate-100"><img src="${imageFor(event)}" alt="${esc(event.name)}" class="h-full w-full object-cover transition group-hover:scale-[1.025]" loading="lazy"></div><div class="flex flex-1 flex-col p-5"><div class="flex flex-wrap items-center gap-2"><span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">${l.active}</span><span class="text-xs font-bold uppercase text-cozy-wood">${esc(event.type || 'Event')}</span></div><h3 class="mt-3 text-xl font-bold">${esc(event.name)}</h3><p class="mt-2 text-sm font-semibold text-cozy-wood">${esc(period(event))}</p><p class="mt-3 flex-1 text-sm leading-6 text-cozy-wood">${esc(eventSummary)}</p><span class="mt-5 w-fit rounded bg-cozy-bark px-4 py-2 text-sm font-bold text-white">${l.view} →</span></div></a>`;
  }).join('');
  const archives = archived.map((event) => `<a class="surface event-card overflow-hidden" href="/events/${route(event)}/"><img src="${imageFor(event)}" alt="${esc(event.name)}" class="aspect-[16/9] w-full object-cover" loading="lazy"><div class="p-4"><span class="text-xs font-bold uppercase text-stone-600">${l.past}</span><h3 class="mt-2 text-lg font-bold">${esc(event.name)}</h3><p class="mt-2 text-sm text-cozy-wood">${esc(period(event))}</p></div></a>`).join('');
  const body = `${nav(l)}<main><section class="border-b border-cozy-peach bg-white"><div class="mx-auto max-w-6xl px-5 py-14"><p class="eyebrow text-cozy-coral">${l.calendar}</p><h1 class="mt-3 text-4xl font-bold md:text-5xl">${l.eventsTitle}</h1><p class="mt-4 max-w-3xl text-lg leading-8 text-cozy-wood">${l.eventsDesc}</p><p class="mt-5 text-sm font-bold text-cozy-wood">${l.updated}: ${updated}</p></div></section><section class="mx-auto max-w-6xl px-5 py-12"><p class="eyebrow text-emerald-700">${l.active}</p><h2 class="mt-2 text-3xl font-bold">${l.currentGuides}</h2><p class="mt-3 max-w-3xl text-cozy-wood">${l.currentIntro}</p><div class="mt-6 grid items-stretch gap-6 md:grid-cols-2">${activeCards}</div></section><section class="border-y border-sky-100 bg-sky-50"><div class="mx-auto max-w-6xl px-5 py-12"><p class="eyebrow text-sky-700">${l.upcoming}</p><h2 class="mt-2 text-3xl font-bold">${l.upcoming}</h2><p class="surface mt-5 border-dashed p-5 text-sm text-cozy-wood">${l.upcomingEmpty}</p></div></section><section class="mx-auto max-w-6xl px-5 py-12"><p class="eyebrow text-amber-700">${l.recurring}</p><h2 class="mt-2 text-3xl font-bold">${l.recurring}</h2><p class="mt-3 text-cozy-wood">${l.recurringIntro}</p><div class="mt-5 grid gap-4 md:grid-cols-3">${['sea-fishing', 'bait-insects', 'nest-of-hundreds'].map((slug, i) => `<a class="surface event-card p-5 font-bold" href="/events/${slug}/">${l.recurringNames[i]} →</a>`).join('')}</div></section><section class="border-t border-cozy-peach bg-[#fff6ef]"><div class="mx-auto max-w-6xl px-5 py-12"><p class="eyebrow text-stone-600">${l.archive}</p><h2 class="mt-2 text-3xl font-bold">${l.archive}</h2><p class="mt-3 max-w-3xl text-cozy-wood">${l.archiveIntro}</p><div class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">${archives}</div></div></section></main>${footer(l)}`;
  return `${head(l, 'events/', l.eventsTitle, l.eventsDesc, '/img/header.jpg', { '@type': 'CollectionPage', name: l.eventsTitle, dateModified: updated })}${body}`;
}

function sanrioPage(l, s, event) {
  const image = imageFor(event);
  const body = `${nav(l)}<main><section class="border-b border-pink-100 bg-[#fff4f7]"><div class="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[1.1fr_.9fr] md:items-center"><div><p class="eyebrow text-pink-700">${s.eyebrow}</p><h1 class="mt-3 text-4xl font-bold leading-tight md:text-5xl">${s.title}</h1><p class="mt-4 text-lg leading-8 text-cozy-wood">${s.intro}</p><div class="mt-6 flex flex-wrap gap-2"><span class="rounded-full bg-pink-100 px-3 py-1 text-sm font-bold">${s.start}</span><span class="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold">${s.pre}</span></div></div><figure class="surface overflow-hidden p-2"><img src="${image}" alt="${s.title}" class="aspect-[16/9] w-full rounded object-cover"></figure></div></section><section class="mx-auto max-w-6xl px-5 py-12"><div class="grid gap-5 md:grid-cols-3">${s.facts.map(([a, b, c]) => `<article class="surface p-5"><p class="eyebrow text-pink-700">${a}</p><h2 class="mt-2 text-2xl font-bold">${b}</h2><p class="mt-2 text-sm leading-6 text-cozy-wood">${c}</p></article>`).join('')}</div><div class="mt-10 grid gap-8 lg:grid-cols-[1.05fr_.95fr]"><div><h2 class="text-3xl font-bold">${s.checklistTitle}</h2><ol class="mt-5 space-y-4">${s.checklist.map(([a, b], i) => `<li class="surface flex gap-4 p-5"><strong class="text-2xl text-pink-700">${i + 1}</strong><div><h3 class="text-xl font-bold">${a}</h3><p class="mt-1 text-sm leading-6 text-cozy-wood">${b}</p></div></li>`).join('')}</ol></div><aside class="surface p-6"><h2 class="text-2xl font-bold">${s.announced}</h2><div class="mt-4 grid gap-4">${listCards(s.announcedItems)}</div></aside></div></section><section class="border-y border-sky-100 bg-sky-50"><div class="mx-auto max-w-6xl px-5 py-12"><h2 class="text-3xl font-bold">${s.launchTitle}</h2><div class="mt-6 grid gap-4 sm:grid-cols-2">${listCards(s.launch)}</div></div></section><section class="mx-auto max-w-6xl px-5 py-12"><h2 class="text-3xl font-bold">${s.faqTitle}</h2><div class="mt-5 grid gap-4 md:grid-cols-2">${faqCards(s.faq)}</div><div class="mt-10 grid gap-4 md:grid-cols-3"><a class="cta" href="${l.links[2]}">${l.nav[2]}</a><a class="cta-soft" href="${l.links[3]}">${l.nav[3]}</a><a class="cta-soft" href="${l.prefix}/events/">${l.nav[0]}</a></div></section></main>${footer(l)}`;
  return `${head(l, `events/${route(event)}/`, s.title, s.desc, image, { '@type': 'Event', name: event.name, startDate: event.startDate, endDate: event.endDate, eventStatus: 'https://schema.org/EventScheduled' })}${body}`;
}

function whalePage(l, event) {
  const w = l.whale, image = imageFor(event);
  const whales = whaleData.routes.map((item) => `<article id="${item.id}" class="surface scroll-mt-24 overflow-hidden"><div class="h-2 bg-sky-300"></div><div class="p-5"><div class="flex items-start justify-between gap-3"><h3 class="text-xl font-bold">${esc(item.name)}</h3><span class="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold">${w.day} ${item.day}</span></div><dl class="mt-4 grid gap-3 text-sm"><div><dt class="font-bold">${w.location}</dt><dd class="mt-1 leading-6 text-cozy-wood">${esc(item.location)}</dd></div><div><dt class="font-bold">${w.bubble}</dt><dd class="mt-1 leading-6 text-cozy-wood">${esc(item.rewardBubble)}</dd></div></dl><button class="whale-check mt-5" type="button" data-whale-check="${item.id}">${w.marked}</button></div></article>`).join('');
  const body = `${nav(l)}<main><section class="border-b border-sky-100 bg-[#eff9f8]"><div class="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[1fr_.8fr] md:items-center"><div><p class="eyebrow text-emerald-700">${w.eyebrow}</p><h1 class="mt-3 text-4xl font-bold leading-tight md:text-5xl">${w.title}</h1><p class="mt-4 text-lg leading-8 text-cozy-wood">${w.intro}</p><div class="mt-6 flex flex-wrap gap-3"><a class="cta" href="#whale-locations">${w.whalesTitle}</a><a class="cta-soft" href="#concert">${w.concertTitle}</a></div></div><img src="${image}" alt="${w.title}" class="surface aspect-[16/9] w-full object-cover p-2"></div></section><section class="mx-auto max-w-6xl px-5 py-12"><div class="grid gap-5 md:grid-cols-3">${w.facts.map(([a, b, c]) => `<article class="surface p-5"><p class="eyebrow text-emerald-700">${a}</p><h2 class="mt-2 text-2xl font-bold">${b}</h2><p class="mt-2 text-sm leading-6 text-cozy-wood">${c}</p></article>`).join('')} </div><div class="mt-10"><h2 class="text-3xl font-bold">${w.includedTitle}</h2><div class="mt-5 grid gap-4 sm:grid-cols-2">${listCards(w.included)}</div></div><div class="mt-10"><h2 class="text-3xl font-bold">${w.startTitle}</h2><ol class="mt-5 grid gap-4 md:grid-cols-2">${w.steps.map(([a, b], i) => `<li class="surface flex gap-4 p-5"><strong class="text-2xl text-cozy-coral">${i + 1}</strong><div><h3 class="text-xl font-bold">${a}</h3><p class="mt-2 text-sm leading-6 text-cozy-wood">${b}</p></div></li>`).join('')}</ol></div></section><section id="whale-locations" class="border-y border-sky-100 bg-white scroll-mt-20"><div class="mx-auto max-w-6xl px-5 py-12"><h2 class="text-3xl font-bold">${w.whalesTitle}</h2><p class="mt-3 max-w-4xl leading-7 text-cozy-wood">${w.whalesIntro}</p><p class="mt-4 font-bold"><span id="whale-progress-count">0</span> / ${whaleData.total}</p><div class="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">${whales}</div></div></section><section id="concert" class="mx-auto max-w-6xl px-5 py-12"><div class="grid gap-8 lg:grid-cols-2"><div><h2 class="text-3xl font-bold">${w.concertTitle}</h2><ol class="mt-5 space-y-4">${w.concert.map((x, i) => `<li class="surface flex gap-4 p-5"><strong>${i + 1}.</strong><span>${x}</span></li>`).join('')}</ol></div><div><h2 class="text-3xl font-bold">${w.collectionsTitle}</h2><div class="mt-5 grid gap-4">${listCards(w.collections)}</div></div></div></section><section class="border-y border-amber-100 bg-amber-50"><div class="mx-auto max-w-6xl px-5 py-12"><h2 class="text-3xl font-bold">${w.troubleTitle}</h2><div class="mt-5 grid gap-4 md:grid-cols-2">${listCards(w.trouble)}</div></div></section><section class="mx-auto max-w-6xl px-5 py-12"><h2 class="text-3xl font-bold">${w.faqTitle}</h2><div class="mt-5 grid gap-4 md:grid-cols-2">${faqCards(w.faq)}</div><div class="mt-10 flex flex-wrap gap-3"><a class="cta" href="${l.prefix}/events/">${l.nav[0]}</a><a class="cta-soft" href="/events/call-of-whales/bubble-locations/">Bubble locations</a><a class="cta-soft" href="/tools/my-progress/">My Progress</a></div></section><script>(function(){const key='heartopia-splash-whales-${l.lang}',buttons=[...document.querySelectorAll('[data-whale-check]')];let saved=[];try{saved=JSON.parse(localStorage.getItem(key)||'[]')}catch{}function paint(){buttons.forEach(b=>{const done=saved.includes(b.dataset.whaleCheck);b.classList.toggle('is-done',done);b.textContent=done?${JSON.stringify(w.photographed)}:${JSON.stringify(w.marked)}});document.getElementById('whale-progress-count').textContent=saved.length}buttons.forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.whaleCheck;saved=saved.includes(id)?saved.filter(x=>x!==id):[...saved,id];localStorage.setItem(key,JSON.stringify(saved));paint()}));paint()})();</script></main>${footer(l)}`;
  return `${head(l, `events/${route(event)}/`, w.title, w.desc, image, { '@type': 'Event', name: event.name, startDate: event.startDate, endDate: event.endDate, eventStatus: 'https://schema.org/EventScheduled' })}${body}`;
}

function downloadPage(l) {
  const d = l.download;
  const body = `${nav(l)}<main><section class="border-b border-cozy-peach bg-white"><div class="mx-auto max-w-6xl px-5 py-14"><p class="eyebrow text-cozy-coral">${d.official}</p><h1 class="mt-3 text-4xl font-bold md:text-5xl">${d.title}</h1><p class="mt-4 max-w-3xl text-lg leading-8 text-cozy-wood">${d.intro}</p></div></section><section class="mx-auto max-w-6xl px-5 py-12"><h2 class="text-3xl font-bold">${d.official}</h2><div class="mt-5 grid gap-5 md:grid-cols-2"><a class="surface border-l-4 border-l-green-600 p-6" href="${l.official}" target="_blank" rel="noopener"><h3 class="text-2xl font-bold">${d.xd}</h3><p class="mt-2 break-all text-sm text-cozy-wood">${l.official}</p></a><a class="surface border-l-4 border-l-green-600 p-6" href="${googlePlay}&hl=${l.lang === 'pt-BR' ? 'pt' : 'id'}" target="_blank" rel="noopener"><h3 class="text-2xl font-bold">${d.play}</h3><p class="mt-2 text-sm text-cozy-wood">com.xd.xdtglobal.gp</p></a></div><aside class="mt-6 rounded-lg border-l-4 border-amber-500 bg-amber-50 p-5"><h3 class="font-bold">${d.other}</h3><p class="mt-2 leading-7 text-cozy-wood">${d.otherText}</p></aside><h2 class="mt-12 text-3xl font-bold">${d.stepsTitle}</h2><div class="mt-5 grid gap-4 md:grid-cols-2">${listCards(d.steps)}</div></section><section class="border-y border-sky-100 bg-sky-50"><div class="mx-auto max-w-6xl px-5 py-12"><h2 class="text-3xl font-bold">${d.platformTitle}</h2><div class="mt-5 grid gap-4 md:grid-cols-3">${listCards(d.platforms)}</div></div></section><section class="mx-auto max-w-6xl px-5 py-12"><h2 class="text-3xl font-bold">${d.faqTitle}</h2><div class="mt-5 grid gap-4">${faqCards(d.faq)}</div><a class="cta mt-8" href="${l.prefix}/faq/safety/">${l.safety.title}</a></section></main>${footer(l)}`;
  return `${head(l, 'download/', d.title, d.desc, '/img/header.jpg', { '@type': 'WebPage', name: d.title, dateModified: updated })}${body}`;
}

function safetyPage(l) {
  const s = l.safety;
  const groups = [[s.good, s.groups[0][0], 'border-l-green-600'], [s.caution, s.groups[1][0], 'border-l-amber-500'], [s.stop, s.groups[2][0], 'border-l-red-500']];
  const body = `${nav(l)}<main><section class="border-b border-cozy-peach bg-white"><div class="mx-auto max-w-6xl px-5 py-14"><p class="eyebrow text-cozy-coral">${s.quick}</p><h1 class="mt-3 text-4xl font-bold md:text-5xl">${s.title}</h1><p class="mt-4 max-w-3xl text-lg leading-8 text-cozy-wood">${s.intro}</p></div></section><section class="mx-auto max-w-6xl px-5 py-12"><h2 class="text-3xl font-bold">${s.quick}</h2><div class="mt-5 grid gap-4 md:grid-cols-3">${groups.map(([a, b, c]) => `<article class="surface border-l-4 ${c} p-5"><h3 class="text-xl font-bold">${a}</h3><p class="mt-3 text-sm leading-6 text-cozy-wood">${b}</p></article>`).join('')}</div><div class="mt-12 grid gap-8 lg:grid-cols-2"><section><h2 class="text-3xl font-bold">${s.accountTitle}</h2><ol class="mt-5 space-y-3">${s.account.map((x, i) => `<li class="surface p-4"><strong>${i + 1}.</strong> ${x}</li>`).join('')}</ol></section><section><h2 class="text-3xl font-bold">${s.chatTitle}</h2><ul class="mt-5 space-y-3">${s.chat.map((x) => `<li class="surface p-4">• ${x}</li>`).join('')}</ul></section></div></section><section class="border-y border-amber-100 bg-amber-50"><div class="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-2"><section><h2 class="text-3xl font-bold">${s.paymentTitle}</h2><ul class="mt-5 space-y-3">${s.payment.map((x) => `<li class="surface p-4">• ${x}</li>`).join('')}</ul></section><section><h2 class="text-3xl font-bold">${s.responseTitle}</h2><ol class="mt-5 space-y-3">${s.response.map((x, i) => `<li class="surface p-4"><strong>${i + 1}.</strong> ${x}</li>`).join('')}</ol></section></div></section><section class="mx-auto max-w-6xl px-5 py-12"><h2 class="text-3xl font-bold">${s.faqTitle}</h2><div class="mt-5 grid gap-4">${faqCards(s.faq)}</div><div class="mt-8 flex flex-wrap gap-3"><a class="cta" href="${l.prefix}/download/">${l.download.title}</a><a class="cta-soft" href="${l.links[3]}">${l.nav[3]}</a></div></section></main>${footer(l)}`;
  return `${head(l, 'faq/safety/', s.title, s.desc, '/img/header.jpg', { '@type': 'FAQPage', name: s.title, dateModified: updated })}${body}`;
}

function injectAlternateBlock(relative, entries) {
  const file = path.join(root, relative);
  let html = fs.readFileSync(file, 'utf8');
  const block = entries.map(([lang, href]) => `<link rel="alternate" hreflang="${lang}" href="${href}">`).join('');
  html = html.replace(/<link rel="alternate" hreflang="[^"]+" href="[^"]+">/g, '');
  html = html.replace(/(<link rel="canonical"[^>]+>)/, `$1${block}`);
  fs.writeFileSync(file, html);
}

for (const [key, l] of Object.entries(T)) {
  write(`${key}/events/index.html`, eventIndex(l));
  const sanrio = current.find((event) => route(event) === 'sanrio-characters-collaboration');
  const whale = current.find((event) => route(event) === 'call-of-whales');
  if (sanrio) write(`${key}/events/${route(sanrio)}/index.html`, sanrioPage(l, l.sanrio, sanrio));
  if (whale) write(`${key}/events/${route(whale)}/index.html`, whalePage(l, whale));
  write(`${key}/download/index.html`, downloadPage(l));
  write(`${key}/faq/safety/index.html`, safetyPage(l));
}
for (const [key, l] of Object.entries(regional)) {
  write(`${key}/events/index.html`, eventIndex(l));
  const sanrio = current.find((event) => route(event) === 'sanrio-characters-collaboration');
  if (sanrio) write(`${key}/events/${route(sanrio)}/index.html`, sanrioPage(l, sanrioRegional[key], sanrio));
}

const downloadAlternates = [
  ['en', 'https://heartopia.life/download/'],
  ['id', 'https://heartopia.life/id/download/'],
  ['pt-BR', 'https://heartopia.life/pt-br/download/'],
  ['x-default', 'https://heartopia.life/download/'],
];
for (const file of ['download/index.html', 'id/download/index.html', 'pt-br/download/index.html']) injectAlternateBlock(file, downloadAlternates);
const safetyAlternates = [
  ['ja', 'https://heartopia.life/ja/faq/safety/'],
  ['id', 'https://heartopia.life/id/faq/safety/'],
  ['pt-BR', 'https://heartopia.life/pt-br/faq/safety/'],
  ['x-default', 'https://heartopia.life/ja/faq/safety/'],
];
for (const file of ['ja/faq/safety/index.html', 'id/faq/safety/index.html', 'pt-br/faq/safety/index.html']) injectAlternateBlock(file, safetyAlternates);

console.log('Rendered complete localized event, download, and safety pages.');
