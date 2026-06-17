import React, { useState, useEffect } from 'react';
import { 
  Search, TrendingUp, Package, Link as LinkIcon, 
  Key, Crosshair, Grid, Users, Building, GraduationCap, 
  Briefcase, Store, Loader2, AlertCircle, CheckCircle2, ChevronRight,
  CalendarDays, Info, Lightbulb, Image as ImageIcon, PenTool, Send,
  Upload, X, Plus, LayoutTemplate, Copy, Download
} from 'lucide-react';

const TARGET_AUDIENCES = [
  { id: 'umkm', name: 'UMKM', icon: Store },
  { id: 'lpk_blk', name: 'LPK / BLK', icon: Building },
  { id: 'education', name: 'Sekolah / Perguruan Tinggi', icon: GraduationCap },
  { id: 'services', name: 'Bidang Jasa Lainnya', icon: Briefcase },
];

const TOOLS = [
  { id: 'seo', name: 'SEO Research', icon: Search, desc: 'Hasilkan meta tag, struktur konten, dan ide artikel SEO.' },
  { id: 'market', name: 'Riset Pasar', icon: TrendingUp, desc: 'Analisis audiens target, tren, dan pain points.' },
  { id: 'product', name: 'Riset Produk/Jasa', icon: Package, desc: 'Ideasi fitur, strategi harga, dan Unique Value Proposition.' },
  { id: 'backlink', name: 'Riset Backlink', icon: LinkIcon, desc: 'Cari peluang backlink dan web outreach potensial (Live Web).' },
  { id: 'keyword', name: 'Riset Keyword', icon: Key, desc: 'Temukan volume pencarian, tingkat kesulitan, dan intent keyword.' },
  { id: 'competitor', name: 'Riset Kompetitor', icon: Crosshair, desc: 'Analisis strategi dan kelemahan pesaing utama (Live Web).' },
  { id: 'swot', name: 'SWOT Generator', icon: Grid, desc: 'Buat matriks Kekuatan, Kelemahan, Peluang, & Ancaman.' },
  { id: 'calendar', name: 'Content Calendar', icon: CalendarDays, desc: 'Rekomendasi jadwal & ide konten (30 Hari).' },
  { id: 'leads', name: 'Prospek Pelanggan', icon: Users, desc: 'Cari prospek dengan kontak publik (WA & Email) (Live Web).' },
  { id: 'copywriting', name: 'AI Copywriting', icon: PenTool, desc: 'Buat teks iklan persuasif dengan formula AIDA, PAS, & Storytelling.' },
  { id: 'ad_image', name: 'AI Image Ad', icon: ImageIcon, desc: 'Hasilkan visual gambar untuk kebutuhan iklan dan sosmed.' },
  { id: 'landing_page', name: 'Landing Page Builder', icon: LayoutTemplate, desc: 'Buat halaman web promosi (HTML/Tailwind) siap pakai untuk bisnis Anda.' },
];

const generateContent = async (payload) => {
  const apiKey = ""; // Let Canvas handle the API key
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
};

const generateImage = async (prompt, imageObjs = []) => {
  const apiKey = ""; 
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{
      role: "user",
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: { aspectRatio: "1:1" }
    }
  };

  if (imageObjs && imageObjs.length > 0) {
     imageObjs.forEach(img => {
         payload.contents[0].parts.push({
           inlineData: {
             mimeType: img.mimeType,
             data: img.data
           }
         });
     });
    payload.generationConfig.responseModalities = ['TEXT', 'IMAGE'];
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const result = await response.json();
    const part = result?.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    
    if (part && part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("Gagal menghasilkan gambar. Coba detailkan kembali deskripsi atau gunakan gambar lain.");
  } catch (error) {
    console.error("Error calling Gemini Image API:", error);
    throw error;
  }
};

const SimpleMarkdown = ({ text, className = "" }) => {
  if (!text) return null;
  
  let lines = text.split('\n');
  let inTable = false;
  let tableHtml = '';
  let newLines = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableHtml = '<div class="overflow-x-auto my-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"><table class="w-full text-sm text-left"><thead class="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200">';
      }
      if (line.match(/^\|[\s-:]+\|/)) {
        tableHtml += '</thead><tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">';
      } else {
        let cells = line.split('|').filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
        tableHtml += '<tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">';
        cells.forEach(cell => {
          let cellContent = cell.trim();
          cellContent = cellContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
          
          if (tableHtml.includes('<tbody>')) {
            tableHtml += `<td class="px-4 py-3 text-gray-800 dark:text-gray-200">${cellContent}</td>`;
          } else {
            tableHtml += `<th class="px-4 py-3 font-semibold">${cellContent}</th>`;
          }
        });
        tableHtml += '</tr>';
      }
    } else {
      if (inTable) {
        tableHtml += '</tbody></table></div>';
        newLines.push(tableHtml);
        inTable = false;
        tableHtml = '';
      }
      newLines.push(line);
    }
  }
  
  if (inTable) {
     tableHtml += '</tbody></table></div>';
     newLines.push(tableHtml);
  }

  let joinedText = newLines.join('\n');

  let htmlResult = joinedText
    .replace(/### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2 text-indigo-800 dark:text-indigo-300">$1</h3>')
    .replace(/## (.*$)/gim, '<h2 class="text-xl font-bold mt-5 mb-3 text-indigo-900 dark:text-indigo-200 border-b border-indigo-100 dark:border-indigo-900 pb-1">$1</h2>')
    .replace(/# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-white">$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/^\* (.*$)/gim, '<li class="ml-5 list-disc my-1">$1</li>')
    .replace(/^- (.*$)/gim, '<li class="ml-5 list-disc my-1">$1</li>');

  htmlResult = htmlResult.replace(/\n/g, '<br />')
    .replace(/<br \/><div class="overflow-x-auto/g, '<div class="overflow-x-auto')
    .replace(/<\/div><br \/>/g, '</div>')
    .replace(/<\/h3><br \/>/g, '</h3>')
    .replace(/<\/h2><br \/>/g, '</h2>')
    .replace(/<\/li><br \/>/g, '</li>');

  return (
    <div 
      className={`text-sm md:text-base leading-relaxed space-y-2 ${className || 'text-gray-700 dark:text-gray-300'}`}
      dangerouslySetInnerHTML={{ __html: htmlResult }} 
    />
  );
};

export default function AIMarketApp() {
  const [activeTab, setActiveTab] = useState('seo');
  const [targetAudience, setTargetAudience] = useState('umkm');
  const [topic, setTopic] = useState('');
  const [location, setLocation] = useState(''); 
  const [chatReply, setChatReply] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [uploadImages, setUploadImages] = useState([]);
  const [uploadImagePreviews, setUploadImagePreviews] = useState([]);
  
  const [results, setResults] = useState({});

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newImages = [];
    const newPreviews = [];
    let filesProcessed = 0;

    files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result;
            newPreviews.push(base64String);

            const mimeType = file.type;
            const data = base64String.split(',')[1];
            newImages.push({ mimeType, data });

            filesProcessed++;

            if (filesProcessed === files.length) {
                setUploadImagePreviews(prev => [...prev, ...newPreviews]);
                setUploadImages(prev => [...prev, ...newImages]);
            }
        };
        reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeImage = (indexToRemove) => {
      setUploadImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
      setUploadImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleReplyChat = async () => {
    if (!chatReply.trim()) return;
    setIsLoading(true);
    setError('');
    
    const audienceName = TARGET_AUDIENCES.find(t => t.id === targetAudience)?.name || targetAudience;
    const systemPrompt = `Anda adalah seorang ahli Digital Marketing dan SEO kelas dunia. Anda sedang membantu klien di bidang "${audienceName}". 
    Topik/Bisnis klien adalah: "${topic}". Berikan jawaban menggunakan bahasa Indonesia yang profesional, aplikatif, dan mudah dipahami. Khusus jika memberikan data tabular, formatlah menggunakan tabel Markdown (wajib diawali dan diakhiri dengan garis lurus '|').`;

    const currentHistory = results[activeTab] || [];
    const newTurn = { role: 'user', parts: [{ text: chatReply }] };
    const updatedHistoryForUI = [...currentHistory, newTurn];
    
    setResults(prev => ({ ...prev, [activeTab]: updatedHistoryForUI }));
    setChatReply('');

    try {
      const apiKey = ""; // Let Canvas handle the API key
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
      
      const payload = {
        contents: updatedHistoryForUI,
        systemInstruction: { parts: [{ text: systemPrompt }] }
      };

      if (activeTab === 'backlink') {
         payload.tools = [{ google_search: {} }];
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const result = await response.json();
      const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text || null;
      
      setResults(prev => ({
        ...prev,
        [activeTab]: [...updatedHistoryForUI, { role: 'model', parts: [{ text: responseText }] }]
      }));
    } catch (err) {
      setError("Gagal mengirim jawaban ke AI. Coba beberapa saat lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Silakan masukkan topik, produk, atau nama bisnis Anda.");
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    const audienceName = TARGET_AUDIENCES.find(t => t.id === targetAudience)?.name || targetAudience;
    
    let systemPrompt = `Anda adalah seorang ahli Digital Marketing kelas dunia. Anda sedang membantu klien di bidang "${audienceName}". 
    Topik/Bisnis klien adalah: "${topic}". Berikan jawaban menggunakan bahasa Indonesia yang profesional, aplikatif, dan mudah dipahami.`;
    
    let userPrompt = "";
    let useSearch = false;
    let schema = null;

    try {
      switch (activeTab) {
        case 'seo':
          userPrompt = `Buatkan riset SEO komprehensif untuk "${topic}". Sertakan secara terstruktur: 1) Ide Meta Title & Description yang click-magnet. 2) Rekomendasi 5 Judul Artikel utama yang sangat SEO Friendly dan menarik. 3) Draft / Outline Isi Artikel lengkap untuk salah satu judul terbaik (sertakan struktur heading H1, H2, H3 beserta poin-poin pembahasan di tiap bagian).
          PENTING: Setelah menyajikan riset SEO tersebut, berikan 2-3 pertanyaan konsultasi langsung kepada saya untuk menggali detail lebih dalam (misalnya target kata kunci spesifik, tone of voice gaya bahasa, atau panjang artikel yang sanggup diproduksi) agar kita bisa berdiskusi lebih lanjut.`;
          break;
        case 'landing_page':
          userPrompt = `Tindak lanjuti peran Anda sebagai Web Developer dan Copywriter ahli. Buatkan satu halaman penuh (single page) Landing Page promosi untuk bisnis/topik: "${topic}".
          Target audiens: ${audienceName}.
          Gunakan HTML5 murni dan styling menggunakan framework Tailwind CSS (wajib sertakan script CDN Tailwind di dalam head: <script src="https://cdn.tailwindcss.com"></script>).
          Sertakan komponen berikut dengan desain yang modern, responsif, dan elegan:
          1. Header/Navbar (Logo teks dan tombol navigasi/kontak).
          2. Hero Section (Headline yang memikat, Subheadline, dan tombol Call to Action yang kontras).
          3. Bagian Fitur/Manfaat Produk (Gunakan grid layout).
          4. Social Proof / Testimoni Pelanggan.
          5. Footer (Copyright dan info kontak sederhana).
          PENTING: Berikan HANYA KODE HTML MENTAH yang valid dari tag <html> sampai </html>. Jangan berikan teks penjelasan apapun sebelum atau sesudah kode. Gunakan dummy teks secukupnya jika diperlukan.`;
          break;
        case 'market':
          userPrompt = `Lakukan riset pasar tahap awal untuk "${topic}". Identifikasi: 1) Demografi target audiens spesifik. 2) Masalah utama (pain points) mereka. 3) Tren pasar saat ini. 4) Solusi yang dicari audiens.
          PENTING: Sajikan data riset pasar tersebut (Demografi, Pain Points, Tren, Solusi) DALAM BENTUK TABEL (Format Markdown tabel wajib diawali dan diakhiri dengan karakter garis lurus '|' contoh: | Aspek | Analisis / Detail |). 
          Setelah menyajikan tabel tersebut, berikan 2-3 pertanyaan konsultasi langsung kepada saya (sebagai pemilik bisnis) untuk menggali detail lebih dalam, sehingga pada respon Anda berikutnya, Anda bisa memberikan strategi pasar yang jauh lebih spesifik dan tajam.`;
          break;
        case 'product':
          userPrompt = `Bantu saya melakukan riset produk/jasa untuk "${topic}". Berikan: 1) Unique Value Proposition (UVP). 2) Ide paket fitur/layanan yang menarik. 3) Strategi penetapan harga (pricing strategy). 4) Sudut pandang promosi (angle promo).
          PENTING: Sajikan data riset tersebut (UVP, Fitur, Harga, Promo) DALAM BENTUK TABEL (Format Markdown tabel wajib diawali dan diakhiri dengan karakter garis lurus '|' contoh: | Aspek | Detail / Rekomendasi |). 
          Setelah menyajikan tabel tersebut, berikan 2-3 pertanyaan konsultasi langsung kepada saya untuk menggali detail produk/layanan (misalnya budget produksi, target spesifik, atau keterbatasan saat ini) agar kita bisa berdiskusi lebih lanjut.`;
          break;
        case 'backlink':
          useSearch = true;
          userPrompt = `Cari di internet tentang "${topic}" di Indonesia. Temukan 5-7 website, portal berita, direktori, atau blog lokal yang relevan dan bisa dijadikan target penanaman backlink (guest post/media partner). 
          PENTING: Sajikan data website tersebut DALAM BENTUK TABEL (Format Markdown tabel wajib diawali dan diakhiri dengan karakter garis lurus '|' contoh: | Nama Website | URL Target | Relevansi/Topik | Strategi Outreach |). 
          Setelah menyajikan tabel tersebut, berikan 2-3 pertanyaan konsultasi langsung kepada saya untuk menggali detail strategi backlink yang saya inginkan (seperti budget, kemampuan produksi artikel tamu, atau otoritas yang diincar) agar kita bisa berdiskusi lebih lanjut.`;
          break;
        case 'keyword':
          userPrompt = `Buatkan 10-15 keyword turunan (long-tail keywords) terkait "${topic}". Berikan juga satu paragraf rekomendasi strategi penggunaan keyword ini untuk pemula.`;
          schema = {
            type: "OBJECT",
            properties: {
              keywords: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    keyword: { type: "STRING" },
                    intent: { type: "STRING", description: "Informational, Navigational, Commercial, atau Transactional" },
                    volume: { type: "STRING", description: "Estimasi volume: Rendah, Sedang, Tinggi" },
                    difficulty: { type: "STRING", description: "Tingkat persaingan: Mudah, Sedang, Sulit" }
                  }
                }
              },
              beginner_recommendation: { type: "STRING", description: "Rekomendasi langkah-langkah untuk pemula" }
            }
          };
          break;
        case 'competitor':
          useSearch = true;
          userPrompt = `Cari di internet siapa saja pesaing (kompetitor) utama untuk bisnis/topik "${topic}" di Indonesia. Berikan analisis 3-5 kompetitor teratas secara terstruktur.`;
          schema = {
             type: "ARRAY",
             items: {
               type: "OBJECT",
               properties: {
                 name: { type: "STRING", description: "Nama Kompetitor / Bisnis" },
                 strengths: { type: "STRING", description: "Kekuatan utama atau keunggulan mereka" },
                 weaknesses: { type: "STRING", description: "Kelemahan atau komplain pelanggan mereka" },
                 opportunities: { type: "STRING", description: "Celah / Peluang yang bisa kita manfaatkan" }
               }
             }
          };
          break;
        case 'swot':
          userPrompt = `Buatkan analisis SWOT mendalam untuk bisnis/topik "${topic}". Berikan poin-poin Strength, Weakness, Opportunity, Threat. Selain itu, wajib berikan juga kombinasi strategi TOWS secara spesifik: Strategi SO (Kekuatan-Peluang), Strategi WO (Kelemahan-Peluang), Strategi ST (Kekuatan-Ancaman), dan Strategi WT (Kelemahan-Ancaman).`;
          schema = {
            type: "OBJECT",
            properties: {
              strengths: { type: "ARRAY", items: { type: "STRING" } },
              weaknesses: { type: "ARRAY", items: { type: "STRING" } },
              opportunities: { type: "ARRAY", items: { type: "STRING" } },
              threats: { type: "ARRAY", items: { type: "STRING" } },
              strategies: {
                type: "OBJECT",
                properties: {
                  so: { type: "STRING", description: "Strategi SO (Strengths-Opportunities): Gunakan kekuatan untuk memanfaatkan peluang" },
                  wo: { type: "STRING", description: "Strategi WO (Weaknesses-Opportunities): Atasi kelemahan dengan memanfaatkan peluang" },
                  st: { type: "STRING", description: "Strategi ST (Strengths-Threats): Gunakan kekuatan untuk menghindari ancaman" },
                  wt: { type: "STRING", description: "Strategi WT (Weaknesses-Threats): Minimalkan kelemahan dan hindari ancaman" }
                }
              }
            }
          };
          break;
        case 'calendar':
          userPrompt = `Buatkan jadwal Content Calendar selama 10 hari untuk bisnis/topik "${topic}". Pastikan bervariasi platformnya.`;
          schema = {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                day: { type: "STRING", description: "Contoh: Hari 1, Hari 2" },
                platform: { type: "STRING", description: "Contoh: Instagram Reels, Blog, TikTok" },
                content_type: { type: "STRING", description: "Contoh: Edukasi, Promosi, Hiburan, Testimoni" },
                title: { type: "STRING", description: "Ide Judul Konten" },
                description: { type: "STRING", description: "Penjelasan isi konten singkat" }
              }
            }
          };
          break;
        case 'leads':
          useSearch = true;
          const locString = location ? `di area ${location}` : 'di Indonesia';
          userPrompt = `Tugas pencarian data web secara real-time: Cari daftar institusi, bisnis, atau profil publik yang secara spesifik merupakan entitas: "${topic}" ${locString}. 
          Penting: Jika kata kuncinya adalah sebuah institusi atau tempat (contoh: "SMK"), maka carilah daftar nama-nama institusi tersebut (daftar sekolah SMK), BUKAN perusahaan lain. 
          Kumpulkan maksimal 10 data yang paling relevan dan publik. Cari Nama Entitas, Kategori, kontak WhatsApp/Telepon publik, dan Email publik dari web mereka. Jika kontak tidak dipublikasikan, tulis 'Tidak Ditemukan'. Dilarang keras mengarang (halusinasi) nomor/email.`;
          schema = {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING", description: "Nama Bisnis/Institusi/Orang" },
                category: { type: "STRING", description: "Kategori/Jenis Bisnis" },
                whatsapp: { type: "STRING", description: "Nomor Telepon / WhatsApp jika ada secara publik" },
                email: { type: "STRING", description: "Email publik jika ada" }
              }
            }
          };
          break;
        case 'copywriting':
          userPrompt = `Buatkan 3 variasi Teks Copywriting (Caption Sosial Media / Teks Iklan) untuk mempromosikan: "${topic}". Gunakan 3 formula berbeda: 1) Formula AIDA (Attention, Interest, Desire, Action). 2) Formula PAS (Problem, Agitate, Solve). 3) Storytelling (Bercerita pendek yang menggugah emosi). Gunakan Call to Action yang kuat, dan selipkan emoji yang relevan! Targetkan kepada audiens: ${audienceName}`;
          break;
        case 'ad_image':
          break;
        default:
          userPrompt = `Berikan insight marketing untuk ${topic}`;
      }

      let finalResult = null;

      if (activeTab === 'ad_image') {
        let finalPrompt = `Create a professional marketing advertisement poster based on this request: "${topic}". Visually appealing, modern design layout, suitable for a digital marketing campaign targeting ${audienceName}. Clean composition, vibrant colors, highly detailed, 4k resolution.`;
        
        if (uploadImages.length > 0) {
           finalPrompt = `Using the provided reference image(s) as key elements, create a professional marketing advertisement poster based on this request: "${topic}". Incorporate the products/elements from the images seamlessly into a new, appealing scene. Enhance the quality, make it visually appealing with a modern design layout suitable for a digital marketing campaign targeting ${audienceName}. Highly detailed.`;
        }
        
        finalResult = await generateImage(finalPrompt, uploadImages);
      } else if (['market', 'backlink', 'product', 'seo'].includes(activeTab)) {
        const payload = {
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
        };

        if (useSearch) {
          payload.tools = [{ google_search: {} }];
        }

        const responseText = await generateContent(payload);
        finalResult = [
          { role: 'user', parts: [{ text: userPrompt }], isInitial: true },
          { role: 'model', parts: [{ text: responseText }] }
        ];
      } else {
        const payload = {
          contents: [{ parts: [{ text: userPrompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
        };

        if (useSearch) {
          payload.tools = [{ google_search: {} }];
        }

        if (schema) {
          payload.generationConfig = {
            responseMimeType: "application/json",
            responseSchema: schema
          };
        }

        const responseText = await generateContent(payload);
        
        finalResult = responseText;
        if (schema) {
          try {
            finalResult = JSON.parse(responseText);
            if (activeTab === 'competitor' && finalResult.competitors) finalResult = finalResult.competitors;
            if (activeTab === 'calendar' && finalResult.calendar) finalResult = finalResult.calendar;
          } catch (e) {
            console.error("Failed to parse JSON", e);
            setError("Gagal memproses format data terstruktur dari AI. Silakan coba lagi.");
          }
        }
      }

      setResults(prev => ({
        ...prev,
        [activeTab]: finalResult
      }));

    } catch (err) {
      setError("Terjadi kesalahan saat menghubungi server AI. Pastikan koneksi internet stabil dan coba beberapa saat lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderResult = () => {
    const data = results[activeTab];
    if (!data) return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Search className="w-16 h-16 mb-4 opacity-20" />
        <p>Isi form dan klik "Generate AI" untuk melihat hasil analisis.</p>
      </div>
    );

    // LANDING PAGE VIEW (HTML RENDERER)
    if (activeTab === 'landing_page' && typeof data === 'string') {
      let cleanHtml = data;
      // Filter the markdown wrapper block with a safe regex logic to avoid breaking parser
      const htmlRegex = /`{3}(?:html)?\s*([\s\S]*?)\s*`{3}/i;
      const htmlMatch = data.match(htmlRegex);
      if (htmlMatch) {
         cleanHtml = htmlMatch[1];
      } else {
         cleanHtml = data.replace(/^`{3}html|`{3}$/gm, '').trim();
      }

      return (
        <div className="flex flex-col space-y-4 w-full">
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-4 md:p-5 rounded-xl border border-indigo-100 dark:border-indigo-800/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5" /> Preview Web Landing Page
              </h3>
              <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-1">
                Website siap pakai untuk: <span className="font-semibold italic">{topic}</span>. Anda dapat menyalin kode atau mengunduh file HTML.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(cleanHtml);
                  alert("Kode HTML berhasil disalin ke Clipboard!");
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                <Copy className="w-4 h-4" /> Copy Code
              </button>
              <button 
                onClick={() => {
                  const blob = new Blob([cleanHtml], {type: 'text/html'});
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `landing-page-${topic.replace(/\s+/g, '-').toLowerCase()}.html`;
                  a.click();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-md"
              >
                <Download className="w-4 h-4" /> Download .HTML
              </button>
            </div>
          </div>

          {/* Panduan Publikasi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 md:p-5 rounded-xl border border-blue-100 dark:border-blue-800/30 flex items-start gap-4 text-sm">
              <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2 text-base">🚀 Via Hosting Instan (Netlify / Tiiny)</h4>
                <ol className="list-decimal ml-4 space-y-1.5 text-gray-700 dark:text-gray-300">
                  <li>Klik <strong>Download .HTML</strong> untuk menyimpan file.</li>
                  <li>Buka layanan gratis seperti <strong>app.netlify.com/drop</strong>.</li>
                  <li><strong>Tarik & Lepas (Drag and Drop)</strong> file HTML tadi ke halaman web tersebut.</li>
                  <li>Selesai! Anda akan langsung mendapat URL publik.</li>
                </ol>
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 md:p-5 rounded-xl border border-indigo-100 dark:border-indigo-800/30 flex items-start gap-4 text-sm">
              <LayoutTemplate className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-indigo-900 dark:text-indigo-200 mb-2 text-base">🌐 Via Google Sites (Sematkan Kode)</h4>
                <ol className="list-decimal ml-4 space-y-1.5 text-gray-700 dark:text-gray-300">
                  <li>Klik tombol <strong>Copy Code</strong> di atas.</li>
                  <li>Buka <a href="https://sites.google.com" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">sites.google.com</a> & buat "Situs Kosong".</li>
                  <li>Di panel kanan, klik <strong>Sematkan (Embed)</strong> lalu pilih tab <strong>Sematkan Kode</strong>.</li>
                  <li><strong>Paste</strong> kodenya, klik Berikutnya &gt; Sisipkan.</li>
                  <li>Tarik ujung kotak agar layar penuh, lalu <strong>Publikasikan</strong>!</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="border-[6px] md:border-[8px] border-gray-800 dark:border-gray-700 rounded-2xl overflow-hidden h-[600px] md:h-[750px] w-full relative shadow-xl">
            <div className="bg-gray-800 h-6 md:h-7 w-full flex items-center px-3 gap-1.5 absolute top-0 z-10 border-b border-gray-900">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500"></div>
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500"></div>
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500"></div>
              <div className="ml-2 bg-gray-700 text-[10px] text-gray-400 px-3 py-0.5 rounded-full hidden md:block w-64 text-center truncate">
                 https://{topic.replace(/\s+/g, '').toLowerCase()}.com/promo
              </div>
            </div>
            <iframe 
               srcDoc={cleanHtml} 
               className="w-full h-full bg-white pt-6 md:pt-7" 
               title="Landing Page Preview" 
            />
          </div>
        </div>
      );
    }

    // INTERACTIVE CHAT VIEW (MARKET, BACKLINK, PRODUCT, SEO)
    if (['market', 'backlink', 'product', 'seo'].includes(activeTab) && Array.isArray(data)) {
      const tabConfig = TOOLS.find(t => t.id === activeTab);
      const TabIcon = tabConfig.icon;

      return (
        <div className="flex flex-col h-[650px] border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm bg-gray-50 dark:bg-gray-900">
          <div className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shadow-sm z-10">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <TabIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Diskusi {tabConfig.name} Interaktif
            </h3>
            <span className="text-xs font-medium px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/30 scroll-smooth">
            {data.map((msg, idx) => {
              const isUser = msg.role === 'user';
              let displayText = msg.parts[0].text;
              if (msg.isInitial) {
                displayText = `Memulai ${tabConfig.name.toLowerCase()} untuk: **${topic}**`;
              }
              
              return (
                <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[95%] md:max-w-[85%] rounded-2xl p-4 md:p-5 shadow-sm ${
                    isUser 
                      ? 'bg-indigo-600 text-white rounded-tr-sm' 
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-tl-sm'
                  }`}>
                    {isUser && msg.isInitial ? (
                       <SimpleMarkdown text={displayText} className="text-indigo-100" />
                    ) : isUser ? (
                       <p className="text-sm md:text-base whitespace-pre-wrap">{displayText}</p>
                    ) : (
                       <SimpleMarkdown text={displayText} />
                    )}
                  </div>
                </div>
              );
            })}
            
            {isLoading && data[data.length - 1].role === 'user' && (
              <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm p-4 flex items-center gap-3 shadow-sm">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                    <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">AI sedang memproses jawaban Anda...</span>
                  </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-10">
             <div className="flex gap-3 max-w-4xl mx-auto">
                <textarea 
                  value={chatReply}
                  onChange={(e) => setChatReply(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleReplyChat();
                    }
                  }}
                  placeholder="Ketik jawaban atau pertanyaan Anda di sini..."
                  className="flex-1 resize-none h-[52px] bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 outline-none transition-all shadow-inner"
                />
                <button 
                  onClick={handleReplyChat}
                  disabled={isLoading || !chatReply.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0 shadow-md hover:shadow-lg"
                  title="Kirim Jawaban"
                >
                  <Send className="w-5 h-5" />
                </button>
             </div>
             <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2 text-center">Tekan Shift + Enter untuk baris baru, Enter untuk mengirim.</p>
          </div>
        </div>
      );
    }

    // KEYWORD VIEW
    if (activeTab === 'keyword' && data.keywords) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 shadow-sm">
              <h4 className="font-bold flex items-center text-blue-800 dark:text-blue-400 mb-2 text-sm"><Info className="w-4 h-4 mr-2"/> Search Intent</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Tujuan pencarian. <b>Informational</b> (mencari info), <b>Navigational</b> (mencari web), <b>Commercial</b> (riset sebelum beli), <b>Transactional</b> (siap beli).</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-green-100 dark:border-green-900/30 shadow-sm">
              <h4 className="font-bold flex items-center text-green-800 dark:text-green-400 mb-2 text-sm"><TrendingUp className="w-4 h-4 mr-2"/> Volume</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Estimasi pencarian. Volume <b>Tinggi</b> berarti banyak dicari, tetapi biasanya persaingan juga lebih ketat.</p>
            </div>
             <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-red-100 dark:border-red-900/30 shadow-sm">
              <h4 className="font-bold flex items-center text-red-800 dark:text-red-400 mb-2 text-sm"><Crosshair className="w-4 h-4 mr-2"/> Difficulty</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Tingkat kesulitan ranking Google. Disarankan memilih difficulty <b>Mudah / Rendah</b> agar cepat mendominasi halaman pencarian.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Keyword</th>
                  <th className="px-6 py-4 font-semibold">Search Intent</th>
                  <th className="px-6 py-4 font-semibold">Volume</th>
                  <th className="px-6 py-4 font-semibold">Difficulty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {data.keywords.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.keyword}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium 
                        ${item.intent.toLowerCase().includes('informational') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 
                          item.intent.toLowerCase().includes('commercial') ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' : 
                          item.intent.toLowerCase().includes('transactional') ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 
                          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {item.intent}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{item.volume}</td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${item.difficulty.toLowerCase().includes('mudah') || item.difficulty.toLowerCase().includes('rendah') ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 
                          item.difficulty.toLowerCase().includes('sedang') ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' : 
                          'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
                        {item.difficulty}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.beginner_recommendation && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-5 rounded-xl border border-indigo-100 dark:border-indigo-800/30 flex items-start gap-4">
              <Lightbulb className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-indigo-900 dark:text-indigo-200 mb-1">Rekomendasi Strategi untuk Pemula</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{data.beginner_recommendation}</p>
              </div>
            </div>
          )}
        </div>
      );
    }

    // COMPETITOR VIEW (TABLE FORMAT)
    if (activeTab === 'competitor' && Array.isArray(data)) {
      return (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200">
              <tr>
                <th className="px-6 py-4 font-semibold min-w-[150px]">Nama Kompetitor</th>
                <th className="px-6 py-4 font-semibold min-w-[200px]">Kekuatan (Strengths)</th>
                <th className="px-6 py-4 font-semibold min-w-[200px]">Kelemahan (Weaknesses)</th>
                <th className="px-6 py-4 font-semibold min-w-[200px]">Celah / Peluang (Opportunities)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {data.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors align-top">
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{item.name}</td>
                  <td className="px-6 py-4 text-green-700 dark:text-green-400 bg-green-50/30 dark:bg-green-900/10">{item.strengths}</td>
                  <td className="px-6 py-4 text-red-700 dark:text-red-400 bg-red-50/30 dark:bg-red-900/10">{item.weaknesses}</td>
                  <td className="px-6 py-4 text-blue-700 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-900/10 font-medium">{item.opportunities}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // CALENDAR VIEW
    if (activeTab === 'calendar' && Array.isArray(data)) {
      return (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Hari / Waktu</th>
                <th className="px-6 py-4 font-semibold">Platform & Format</th>
                <th className="px-6 py-4 font-semibold min-w-[200px]">Ide Judul Konten</th>
                <th className="px-6 py-4 font-semibold min-w-[250px]">Keterangan / Isi Singkat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {data.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors align-top">
                  <td className="px-6 py-4 font-medium whitespace-nowrap text-indigo-600 dark:text-indigo-400">{item.day}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{item.platform}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full inline-block w-max">{item.content_type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{item.title}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // SWOT VIEW
    if (activeTab === 'swot' && data.strengths) {
      const SwotCard = ({ title, items, colorClass, bgClass }) => (
        <div className={`p-6 rounded-2xl border ${bgClass} ${colorClass} h-full`}>
          <h3 className="text-xl font-bold mb-4 uppercase tracking-wider">{title}</h3>
          <ul className="space-y-2">
            {items.map((item, i) => (
              <li key={i} className="flex items-start">
                <ChevronRight className="w-5 h-5 mr-2 shrink-0 opacity-70" />
                <span className="text-sm md:text-base leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      );

      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SwotCard title="Strengths (Kekuatan)" items={data.strengths} 
              bgClass="bg-green-50 dark:bg-green-900/20" colorClass="border-green-200 text-green-900 dark:text-green-100 dark:border-green-800" />
            <SwotCard title="Weaknesses (Kelemahan)" items={data.weaknesses} 
              bgClass="bg-red-50 dark:bg-red-900/20" colorClass="border-red-200 text-red-900 dark:text-red-100 dark:border-red-800" />
            <SwotCard title="Opportunities (Peluang)" items={data.opportunities} 
              bgClass="bg-blue-50 dark:bg-blue-900/20" colorClass="border-blue-200 text-blue-900 dark:text-blue-100 dark:border-blue-800" />
            <SwotCard title="Threats (Ancaman)" items={data.threats} 
              bgClass="bg-orange-50 dark:bg-orange-900/20" colorClass="border-orange-200 text-orange-900 dark:text-orange-100 dark:border-orange-800" />
          </div>
          
          {data.strategies && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-800">
              <h3 className="text-xl font-bold mb-4 text-indigo-900 dark:text-indigo-200 flex items-center">
                <Lightbulb className="w-6 h-6 mr-2" /> Kombinasi Strategi (TOWS Analysis)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 shadow-sm">
                  <h4 className="font-bold text-green-700 dark:text-green-400 mb-2">Strategi SO (Strength + Opportunity)</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{data.strategies.so}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 shadow-sm">
                  <h4 className="font-bold text-blue-700 dark:text-blue-400 mb-2">Strategi WO (Weakness + Opportunity)</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{data.strategies.wo}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 shadow-sm">
                  <h4 className="font-bold text-orange-700 dark:text-orange-400 mb-2">Strategi ST (Strength + Threat)</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{data.strategies.st}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 shadow-sm">
                  <h4 className="font-bold text-red-700 dark:text-red-400 mb-2">Strategi WT (Weakness + Threat)</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{data.strategies.wt}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // LEADS VIEW
    if (activeTab === 'leads' && Array.isArray(data)) {
      return (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200">
              <tr>
                <th className="px-6 py-4 font-semibold rounded-tl-xl">Prospek / Bisnis</th>
                <th className="px-6 py-4 font-semibold">Kategori</th>
                <th className="px-6 py-4 font-semibold">WhatsApp / Telepon</th>
                <th className="px-6 py-4 font-semibold rounded-tr-xl">Email Publik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {data.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.name}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                     <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">{item.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    {item.whatsapp && !item.whatsapp.includes('Tidak Ditemukan') ? (
                      <a href={`https://wa.me/${item.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="text-green-600 dark:text-green-400 font-medium hover:underline flex items-center">
                        {item.whatsapp}
                      </a>
                    ) : (
                      <span className="text-gray-400 text-xs italic">Tidak dipublikasikan</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                     {item.email && !item.email.includes('Tidak Ditemukan') ? (
                      <a href={`mailto:${item.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {item.email}
                      </a>
                    ) : (
                      <span className="text-gray-400 text-xs italic">Tidak dipublikasikan</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs text-center border-t border-yellow-100 dark:border-yellow-800">
            *Catatan: Data ditarik dari hasil pencarian publik di web. Hubungi prospek secara etis dan hindari spam.
          </div>
        </div>
      );
    }

    // IMAGE AD VIEW
    if (activeTab === 'ad_image' && typeof data === 'string' && data.startsWith('data:image')) {
      return (
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-5 rounded-xl border border-indigo-100 dark:border-indigo-800/30 text-center w-full max-w-2xl">
            <h3 className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center justify-center gap-2 mb-2">
              <ImageIcon className="w-5 h-5" /> Visual Iklan AI Dihasilkan
            </h3>
            <p className="text-xs text-indigo-700 dark:text-indigo-400">Prompt dioptimalkan secara otomatis ke AI: <br/><span className="italic">"{topic}"</span></p>
          </div>
          
          <div className="relative group">
            <img 
              src={data} 
              alt={`Generated Advertisement for ${topic}`} 
              className="rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 max-w-full h-auto max-h-[500px] object-contain bg-white dark:bg-gray-800" 
            />
          </div>
          
          <button 
            onClick={() => {
              const link = document.createElement('a');
              link.href = data;
              link.download = `AI-Ad-${topic.replace(/\s+/g, '-').toLowerCase()}.png`;
              link.click();
            }} 
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold rounded-xl transition-all shadow-md"
          >
            Download Gambar Resolusi Tinggi
          </button>
        </div>
      );
    }

    // DEFAULT TEXT VIEW
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700">
        <SimpleMarkdown text={typeof data === 'string' ? data : JSON.stringify(data, null, 2)} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col md:flex-row">
      
      <aside className="w-full md:w-72 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 shrink-0 flex flex-col z-20">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <TrendingUp className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">AI Market</h1>
            <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Marketing Suite</p>
          </div>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Tools & Modules</p>
          <nav className="space-y-1">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeTab === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => setActiveTab(tool.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'opacity-70'}`} />
                  <span className="text-sm">{tool.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        
        <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg">
              {React.createElement(TOOLS.find(t => t.id === activeTab).icon, { className: "w-5 h-5 text-indigo-700 dark:text-indigo-300" })}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{TOOLS.find(t => t.id === activeTab).name}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{TOOLS.find(t => t.id === activeTab).desc}</p>
            </div>
          </div>

          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 shrink-0 overflow-x-auto hide-scrollbar">
            {TARGET_AUDIENCES.map((target) => {
              const TargetIcon = target.icon;
              return (
                <button
                  key={target.id}
                  onClick={() => setTargetAudience(target.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    targetAudience === target.id
                      ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-300 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <TargetIcon className="w-3.5 h-3.5" />
                  {target.name}
                </button>
              );
            })}
          </div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                <div className={`md:col-span-${activeTab === 'leads' ? '5' : '9'}`}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {activeTab === 'leads' 
                      ? 'Kriteria Target Prospek (Siapa yang dicari?)' 
                      : activeTab === 'ad_image' 
                      ? 'Prompt / Deskripsi Poster Iklan'
                      : activeTab === 'landing_page'
                      ? 'Topik / Nama Brand / Penjelasan Singkat Bisnis'
                      : 'Topik / Nama Bisnis / Produk'}
                  </label>
                  <input 
                    type="text" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder={activeTab === 'leads' 
                      ? "Contoh: SMK Negeri, Klinik Gigi, Pabrik Tekstil..." 
                      : activeTab === 'ad_image'
                      ? "Contoh: Buat poster promosi kopi susu aren bernuansa senja estetik..."
                      : activeTab === 'landing_page'
                      ? "Contoh: Pelatihan Digital Marketing untuk UMKM..."
                      : "Contoh: Kursus Bahasa Jepang, Kopi Susu Aren..."}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 outline-none transition-all"
                  />

                  {activeTab === 'ad_image' && (
                    <div className="mt-4">
                      <label className="cursor-pointer bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-sm w-max">
                          <Upload className="w-4 h-4" />
                          <span>Upload Referensi ({uploadImagePreviews.length})</span>
                          <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                      </label>
                      
                      {uploadImagePreviews.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-3">
                          {uploadImagePreviews.map((preview, index) => (
                            <div key={index} className="relative group flex shrink-0">
                                <img src={preview} alt={`Preview ${index + 1}`} className="h-14 w-14 object-cover rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm" />
                                <button 
                                    onClick={() => removeImage(index)} 
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                    title="Hapus gambar ini"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {activeTab === 'leads' && (
                  <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Lokasi (Opsional)
                    </label>
                    <input 
                      type="text" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Contoh: Jakarta Selatan, Surabaya..."
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 outline-none transition-all"
                    />
                  </div>
                )}

                <div className="md:col-span-3">
                  <button 
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm px-5 py-3.5 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/30 h-[50px] mt-[28px]"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    {isLoading ? 'Memproses...' : 'Generate AI'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl flex items-start gap-3 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </div>

            <div className="relative">
              {isLoading && !(['market', 'backlink', 'product', 'seo'].includes(activeTab) && Array.isArray(results[activeTab])) && (
                <div className="absolute inset-0 z-10 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center">
                  <div className="relative">
                     <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-900 rounded-full"></div>
                     <div className="w-16 h-16 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                  </div>
                  <p className="mt-4 font-bold text-indigo-700 dark:text-indigo-400 animate-pulse drop-shadow-sm">
                    Menganalisis data dari web & AI...
                  </p>
                </div>
              )}
              
              <div className={isLoading && !(['market', 'backlink', 'product', 'seo'].includes(activeTab) && Array.isArray(results[activeTab])) ? 'opacity-40 pointer-events-none transition-opacity' : 'transition-opacity duration-500'}>
                {renderResult()}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}