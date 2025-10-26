import { GoogleGenAI, Type } from "@google/genai";
import { LessonPlan, CreativeActivity, Quiz, GradedExam, DashboardInsights } from '../types';
import { Language } from '../translations';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getStyleInstructions = (style: string, language: Language) => {
    const instructions = {
        en: {
            'Minimalist': `Use a minimalist color palette. Background: #ffffff. Shapes: stroke #1f2937, fill #f9fafb. Text: #1f2937. Use a single, subtle accent color like #60a5fa (light blue) for highlights or key connectors.`,
            'Vibrant': `Use a vibrant and engaging color palette. Primary elements: #ef4444 (red-500). Secondary elements: #3b82f6 (blue-500). Connectors: #6b7280 (gray-500). Text: #1f2937. Backgrounds for shapes can be lighter tints like #fee2e2 or #dbeafe.`,
            'Monochromatic': `Use a monochromatic color palette based on a single hue (e.g., blue). Use various shades and tints. For example: #dbeafe (lightest), #93c5fd, #3b82f6 (base), #1d4ed8 (darkest). Text should be dark gray or white for contrast.`
        },
        id: {
            'Minimalist': `Gunakan palet warna minimalis. Latar belakang: #ffffff. Bentuk: guratan #1f2937, isi #f9fafb. Teks: #1f2937. Gunakan satu warna aksen yang lembut seperti #60a5fa (biru muda) untuk sorotan atau konektor utama.`,
            'Vibrant': `Gunakan palet warna yang cerah dan menarik. Elemen utama: #ef4444 (merah-500). Elemen sekunder: #3b82f6 (biru-500). Konektor: #6b7280 (abu-abu-500). Teks: #1f2937. Latar belakang bentuk bisa menggunakan warna yang lebih terang seperti #fee2e2 atau #dbeafe.`,
            'Monochromatic': `Gunakan palet warna monokromatik berdasarkan satu rona warna (misalnya, biru). Gunakan berbagai bayangan dan corak. Contoh: #dbeafe (paling terang), #93c5fd, #3b82f6 (dasar), #1d4ed8 (paling gelap). Teks harus berwarna abu-abu gelap atau putih untuk kontras.`
        }
    };
    // Provide a default or fallback
    // @ts-ignore
    return instructions[language][style] || instructions[language]['Vibrant'];
}

const prompts = {
  lessonPlan: {
    en: (topic: string, duration: number, gradeLevel: string) => `Generate a structured lesson plan for a ${gradeLevel} class on the topic: "${topic}". The lesson should be exactly ${duration} minutes long. Provide clear learning objectives, a list of required materials, a sequence of activities with time allocation, and a method for assessment.`,
    id: (topic: string, duration: number, gradeLevel: string) => `Buat rencana pelajaran terstruktur untuk kelas ${gradeLevel} dengan topik: "${topic}". Pelajaran harus berdurasi tepat ${duration} menit. Berikan tujuan pembelajaran yang jelas, daftar materi yang dibutuhkan, urutan kegiatan dengan alokasi waktu, dan metode penilaian.`,
  },
  creativeActivities: {
    en: (theme: string, gradeLevel: string, activityType: string) => `Generate 3 creative and engaging activity ideas for a ${gradeLevel} class. The theme is "${theme}" and the activity type is "${activityType}". For each activity, provide a name, a detailed description, a list of materials, and step-by-step instructions. The instructions must be a numbered list where each step starts on a new line.`,
    id: (theme: string, gradeLevel: string, activityType: string) => `Hasilkan 3 ide aktivitas yang kreatif dan menarik untuk kelas ${gradeLevel}. Temanya adalah "${theme}" dan jenis aktivitasnya adalah "${activityType}". Untuk setiap aktivitas, berikan nama, deskripsi terperinci, daftar materi, dan instruksi langkah demi langkah. Instruksi harus berupa daftar bernomor di mana setiap langkah dimulai di baris baru.`,
  },
  quiz: {
    en: (topic: string, type: string, numQuestions: number, gradeLevel: string) => `Create a quiz for a ${gradeLevel} class with ${numQuestions} questions on the topic: "${topic}". All questions should be of the type "${type}". For multiple choice questions, provide 4 options, indicate the correct answer, and provide a brief, one-sentence explanation for why the answer is correct.`,
    id: (topic: string, type: string, numQuestions: number, gradeLevel: string) => `Buat kuis untuk kelas ${gradeLevel} dengan ${numQuestions} pertanyaan tentang topik: "${topic}". Semua pertanyaan harus bertipe "${type}". Untuk pertanyaan pilihan ganda, berikan 4 opsi, tunjukkan jawaban yang benar, dan berikan penjelasan singkat satu kalimat mengapa jawaban itu benar.`,
  },
  aiGrader: {
    en: () => `You are an AI Teaching Assistant specializing in grading handwritten or typed exam papers. Your task is to compare the student's answer sheet (first image) with the provided answer key (second image).

Based on the comparison, you must:
1.  Determine the total number of questions visible on both sheets.
2.  Identify which questions the student answered correctly and incorrectly by comparing their answer to the key.
3.  Calculate the total number of correct answers.
4.  Calculate a final score as a percentage (correct answers / total questions * 100), rounded to the nearest whole number.
5.  Provide a brief, overall analysis (2-3 sentences) of the student's performance, highlighting areas of strength and weakness.
6.  Give specific, constructive feedback for each question number, stating if it was correct or incorrect and briefly explaining why based on the answer key.

Return your output ONLY in the specified JSON format. Do not include any other text, markdown, or explanations.`,
    id: () => `Anda adalah Asisten Pengajar AI yang berspesialisasi dalam menilai lembar ujian tulisan tangan atau ketikan. Tugas Anda adalah membandingkan lembar jawaban siswa (gambar pertama) dengan kunci jawaban yang disediakan (gambar kedua).

Berdasarkan perbandingan tersebut, Anda harus:
1.  Tentukan jumlah total pertanyaan yang terlihat di kedua lembar.
2.  Identifikasi pertanyaan mana yang dijawab siswa dengan benar dan salah dengan membandingkan jawabannya dengan kunci.
3.  Hitung jumlah total jawaban yang benar.
4.  Hitung skor akhir sebagai persentase (jawaban benar / total pertanyaan * 100), dibulatkan ke bilangan bulat terdekat.
5.  Berikan analisis keseluruhan yang singkat (2-3 kalimat) tentang kinerja siswa, soroti area kekuatan dan kelemahan.
6.  Berikan umpan balik yang spesifik dan konstruktif untuk setiap nomor pertanyaan, nyatakan apakah itu benar atau salah dan jelaskan secara singkat alasannya berdasarkan kunci jawaban.

Kembalikan output Anda HANYA dalam format JSON yang ditentukan. Jangan sertakan teks, markdown, atau penjelasan lain.`,
  },
  interactiveDiagram: {
    en: (concept: string, style: string, type: string) => `Generate a complete, single SVG code block for an interactive ${type} illustrating "${concept}".

The SVG must be self-contained and adhere to the following modern design system for a professional and educational look:
- **Color Palette:** ${getStyleInstructions(style, 'en')}
- **SVG Structure:** Use a <style> tag within the SVG for all CSS. Do not use inline styles. Group related shapes and their labels within a single <g> tag.
- **Typography:** Use a clean, sans-serif font family (e.g., 'Inter', Arial, sans-serif) with a font-size of around 14px for labels. Make text easy to read.
- **Shapes & Lines:** Use a stroke-width of 1.5px for outlines. Give rectangles slightly rounded corners (e.g., rx="8"). Use a subtle drop-shadow filter on main shape groups for depth. For Mind Maps and Flowcharts, use curved <path> elements for connectors instead of straight lines for a more organic feel.
- **Contextual Visuals:** Where appropriate, use simple, universally recognizable icons or shapes to represent concepts. Keep these visuals clean and within the specified design system.

- **Advanced Interactivity (Click-to-Reveal):**
  1.  For each key concept, create a group <g> with class "interactive-group" and a unique ID (e.g., id="concept-1"). Make it clickable with \`cursor: pointer\`.
  2.  Inside this group, include the visual shape and its main text label.
  3.  Also inside this group, add a detailed explanation (2-3 sentences) for the concept. This explanation MUST be wrapped in a <foreignObject> element with a class "details-text". Inside the <foreignObject>, use a styled HTML <div> for better text wrapping.
  4.  The ".details-text" foreignObject MUST be hidden by default using CSS (\`opacity: 0; visibility: hidden;\`).
  5.  Use CSS to style an ".active" state for ".interactive-group". When a group is active, its main shape should have a more prominent stroke (e.g., thicker or a different color), and its associated ".details-text" MUST become visible (\`opacity: 1; visibility: visible;\`).

- **Example CSS within the <style> tag:**
  \`\`\`css
  .interactive-group { cursor: pointer; transition: transform 0.2s ease; }
  .interactive-group:hover { transform: scale(1.03); }
  .interactive-group .main-shape { filter: url(#drop-shadow); }
  .interactive-group.active .main-shape { stroke: #2563eb; stroke-width: 2.5px; }
  .details-text { 
    opacity: 0; 
    visibility: hidden; 
    transition: opacity 0.3s ease-in-out; 
    font-family: 'Inter', Arial, sans-serif;
    font-size: 12px;
  }
  .interactive-group.active .details-text { opacity: 1; visibility: visible; }
  \`\`\`
- **Example Filter within the <defs> tag:**
  \`\`\`xml
  <defs>
    <filter id="drop-shadow" x="-0.5" y="-0.5" width="2" height="2">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"/>
      <feOffset in="blur" dx="2" dy="2" result="offsetBlur"/>
      <feMerge>
        <feMergeNode in="offsetBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  \`\`\`

Do not include any explanation, comments, or markdown formatting outside of the single SVG code block itself. The output must be only the <svg>...</svg> code.`,
    id: (concept: string, style: string, type: string) => `Hasilkan satu blok kode SVG lengkap untuk ${type} interaktif yang mengilustrasikan "${concept}".

SVG harus mandiri dan mematuhi sistem desain modern berikut untuk tampilan yang profesional dan edukatif:
- **Palet Warna:** ${getStyleInstructions(style, 'id')}
- **Struktur SVG:** Gunakan tag <style> di dalam SVG untuk semua CSS. Jangan gunakan gaya inline. Kelompokkan bentuk dan label terkaitnya dalam satu tag <g>.
- **Tipografi:** Gunakan keluarga font sans-serif yang bersih (misalnya, 'Inter', Arial, sans-serif) dengan ukuran font sekitar 14px untuk label. Buat teks mudah dibaca.
- **Bentuk & Garis:** Gunakan stroke-width 1.5px untuk garis luar. Beri persegi panjang sudut yang sedikit membulat (misalnya, rx="8"). Gunakan filter drop-shadow halus pada grup bentuk utama untuk kedalaman. Untuk Peta Pikiran dan Bagan Alir, gunakan elemen <path> melengkung untuk konektor, bukan garis lurus, untuk nuansa yang lebih organik.
- **Visual Kontekstual:** Jika sesuai, gunakan ikon atau bentuk sederhana yang mudah dikenali secara universal untuk merepresentasikan konsep. Jaga agar visual ini tetap bersih dan sesuai dengan sistem desain yang ditentukan.

- **Interaktivitas Tingkat Lanjut (Klik-untuk-Menampilkan):**
  1.  Untuk setiap konsep kunci, buat grup <g> dengan kelas "interactive-group" dan ID unik (misalnya, id="konsep-1"). Buat agar dapat diklik dengan \`cursor: pointer\`.
  2.  Di dalam grup ini, sertakan bentuk visual dan label teks utamanya.
  3.  Juga di dalam grup ini, tambahkan penjelasan terperinci (2-3 kalimat) untuk konsep tersebut. Penjelasan ini HARUS dibungkus dalam elemen <foreignObject> dengan kelas "details-text". Di dalam <foreignObject>, gunakan <div> HTML yang ditata untuk pembungkusan teks yang lebih baik.
  4.  Elemen foreignObject ".details-text" HARUS disembunyikan secara default menggunakan CSS (\`opacity: 0; visibility: hidden;\`).
  5.  Gunakan CSS untuk menata status ".active" untuk ".interactive-group". Saat grup aktif, bentuk utamanya harus memiliki guratan yang lebih menonjol (misalnya, lebih tebal atau warna berbeda), dan ".details-text" terkaitnya HARUS menjadi terlihat (\`opacity: 1; visibility: visible;\`).

- **Contoh CSS di dalam tag <style>:**
  \`\`\`css
  .interactive-group { cursor: pointer; transition: transform 0.2s ease; }
  .interactive-group:hover { transform: scale(1.03); }
  .interactive-group .main-shape { filter: url(#drop-shadow); }
  .interactive-group.active .main-shape { stroke: #2563eb; stroke-width: 2.5px; }
  .details-text { 
    opacity: 0; 
    visibility: hidden; 
    transition: opacity 0.3s ease-in-out; 
    font-family: 'Inter', Arial, sans-serif;
    font-size: 12px;
  }
  .interactive-group.active .details-text { opacity: 1; visibility: visible; }
  \`\`\`
- **Contoh Filter di dalam tag <defs>:**
  \`\`\`xml
  <defs>
    <filter id="drop-shadow" x="-0.5" y="-0.5" width="2" height="2">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"/>
      <feOffset in="blur" dx="2" dy="2" result="offsetBlur"/>
      <feMerge>
        <feMergeNode in="offsetBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  \`\`\`

Jangan sertakan penjelasan, komentar, atau format markdown apa pun di luar satu blok kode SVG itu sendiri. Outputnya harus hanya kode <svg>...</svg>.`,
  },
  slides: {
    en: (topic: string, audience: string, numSlides: number) => `You are an expert presentation designer and AI prompt engineer. Your task is to generate a single, comprehensive, copy-paste-ready prompt for an AI presentation generator (like Gamma.ai, Tome.app, or Pop AI).

The presentation details are:
- **Topic:** ${topic}
- **Audience:** ${audience}
- **Number of Slides:** ${numSlides}

Generate a detailed prompt with the following distinct sections, using Markdown for formatting.

---

### **Overall Goal & Core Message**
(Describe the primary objective of this presentation in one sentence.)

### **Target Audience Persona & Tone**
- **Audience:** ${audience}
- **Tone:** (Choose one: Professional, Engaging, Casual, Academic, Inspirational)
- **Key Takeaway:** (What is the one thing the audience must remember?)

### **Visual Style Guide**
- **Theme:** (Suggest a theme, e.g., "Modern & Clean", "Dark & Techy", "Playful & Illustrated", "Corporate Blue")
- **Iconography:** (Suggest a style, e.g., "Line icons", "3D icons", "Flat illustrations")
- **Imagery:** (Suggest a type, e.g., "High-quality stock photos of people collaborating", "Abstract data visualizations")

### **Slide-by-Slide Breakdown**

**Slide 1: Title Slide**
- **Content:** Title: "${topic}"; Subtitle: A Presentation for ${audience}.
- **Visual:** A powerful, high-impact image related to the topic.

**Slide 2: Introduction / Agenda**
- **Content:**
  - Hook: (A surprising statistic or a compelling question)
  - What we'll cover: (3-4 key agenda points)
- **Visual:** A simple layout with icons for each agenda point.

(Generate content for slides 3 to ${numSlides - 1} here. Each slide should follow the format below.)

**Slide ...: [Specific, Action-Oriented Title]**
- **Content:**
  - (3-5 concise bullet points explaining the core concept of this slide.)
  - (Use simple language. Avoid jargon.)
- **Visual:** (Suggest a specific visual aid, e.g., "A timeline graphic showing key dates", "A bar chart comparing A and B", "A world map highlighting relevant countries", "An animated GIF illustrating the process".)

**Slide ${numSlides}: Summary & Call to Action**
- **Content:**
  - Key Takeaways: (Reiterate the 3 most important points from the presentation.)
  - Call to Action: (What should the audience do next? e.g., "Visit our website", "Start your project", "Ask questions.")
- **Visual:** A summary graphic or a clean layout with contact information.

---`,
    id: (topic: string, audience: string, numSlides: number) => `Anda adalah seorang desainer presentasi ahli dan rekayasawan prompt AI. Tugas Anda adalah menghasilkan satu prompt komprehensif yang siap disalin-tempel untuk generator presentasi AI (seperti Gamma.ai, Tome.app, atau Pop AI).

Detail presentasi adalah:
- **Topik:** ${topic}
- **Audiens:** ${audience}
- **Jumlah Slide:** ${numSlides}

Hasilkan prompt terperinci dengan bagian-bagian yang jelas berikut ini, menggunakan Markdown untuk pemformatan.

---

### **Tujuan Utama & Pesan Inti**
(Jelaskan tujuan utama presentasi ini dalam satu kalimat.)

### **Persona Audiens & Nada**
- **Audiens:** ${audience}
- **Nada:** (Pilih satu: Profesional, Menarik, Santai, Akademis, Inspiratif)
- **Pesan Kunci:** (Apa satu hal yang harus diingat oleh audiens?)

### **Panduan Gaya Visual**
- **Tema:** (Sarankan sebuah tema, mis., "Modern & Bersih", "Gelap & Teknologis", "Ceria & Berilustrasi", "Biru Korporat")
- **Ikonografi:** (Sarankan sebuah gaya, mis., "Ikon garis", "Ikon 3D", "Ilustrasi datar")
- **Citra:** (Sarankan sebuah jenis, mis., "Foto stok berkualitas tinggi tentang orang yang berkolaborasi", "Visualisasi data abstrak")

### **Rincian Slide-demi-Slide**

**Slide 1: Slide Judul**
- **Konten:** Judul: "${topic}"; Subjudul: Presentasi untuk ${audience}.
- **Visual:** Gambar yang kuat dan berdampak tinggi terkait dengan topik.

**Slide 2: Pendahuluan / Agenda**
- **Konten:**
  - Pancingan: (Statistik yang mengejutkan atau pertanyaan yang menarik)
  - Apa yang akan kita bahas: (3-4 poin agenda utama)
- **Visual:** Tata letak sederhana dengan ikon untuk setiap poin agenda.

(Hasilkan konten untuk slide 3 hingga ${numSlides - 1} di sini. Setiap slide harus mengikuti format di bawah ini.)

**Slide ...: [Judul Spesifik Berorientasi Aksi]**
- **Konten:**
  - (3-5 poin ringkas yang menjelaskan konsep inti dari slide ini.)
  - (Gunakan bahasa yang sederhana. Hindari jargon.)
- **Visual:** (Sarankan bantuan visual spesifik, mis., "Grafik linimasa yang menunjukkan tanggal-tanggal penting", "Bagan batang yang membandingkan A dan B", "Peta dunia yang menyoroti negara-negara relevan", "GIF animasi yang mengilustrasikan proses".)

**Slide ${numSlides}: Ringkasan & Ajakan Bertindak**
- **Konten:**
  - Poin-Poin Kunci: (Ulangi 3 poin terpenting dari presentasi.)
  - Ajakan Bertindak: (Apa yang harus dilakukan audiens selanjutnya? mis., "Kunjungi situs web kami", "Mulai proyek Anda", "Ajukan pertanyaan.")
- **Visual:** Grafik ringkasan atau tata letak bersih dengan informasi kontak.

---`,
  },
  dashboardInsights: {
    en: (data: string) => `You are EduMate AI, an expert educational data analyst. Your goal is to help a teacher understand their students' performance based on varied data and provide actionable insights. Analyze the following JSON data which includes student scores, participation levels, and qualitative notes.

Data:
${data}

Follow these steps for your analysis:
1.  **Summarize Overall Performance:** Write a brief, narrative summary (2-3 sentences) of the class's current standing. Consider average scores, participation trends, and any recurring themes from the notes.
2.  **Categorize Students:** Group each student into one of three performance tiers: 'High', 'Medium', or 'At-Risk'. Base this on a holistic view of their scores, participation, and any notes.
    -   'High': Consistently high scores (e.g., >=85), active participation.
    -   'Medium': Average scores (e.g., 65-84), inconsistent performance, or mixed participation.
    -   'At-Risk': Consistently low scores (e.g., <65), low participation, or concerning notes (e.g., absenteeism, sharp decline).
    Provide a concise, one-sentence reason for each student's categorization that synthesizes all available data points for them.
3.  **Identify Key Trends & Anomalies:** Analyze the data to find 2-3 significant trends or anomalies. This could be a general decline in scores, a specific assignment being difficult, a correlation between participation and performance, or a student whose performance is an outlier. For each trend, describe the observation and its potential implication.
4.  **Suggest Actionable Recommendations:** Based on the analysis, provide 2-3 concrete, actionable suggestions for the teacher. These should be specific interventions or pedagogical strategies. Frame them as clear actions. For example: "For the 'At-Risk' group, consider a review session on 'Topic X' using a 'Think-Pair-Share' activity" or "Pair high-performing students with medium-tier students for the next group project to encourage peer learning."

Your entire output must be in the specified JSON format. Do not add any extra text or explanations.`,
    id: (data: string) => `Anda adalah EduMate AI, seorang analis data pendidikan ahli. Tujuan Anda adalah membantu guru memahami kinerja siswa mereka berdasarkan data yang bervariasi dan memberikan wawasan yang dapat ditindaklanjuti. Analisis data JSON berikut yang mencakup nilai siswa, tingkat partisipasi, dan catatan kualitatif.

Data:
${data}

Ikuti langkah-langkah ini untuk analisis Anda:
1.  **Ringkas Kinerja Keseluruhan:** Tulis ringkasan naratif singkat (2-3 kalimat) tentang posisi kelas saat ini. Pertimbangkan nilai rata-rata, tren partisipasi, dan tema berulang dari catatan.
2.  **Kategorikan Siswa:** Kelompokkan setiap siswa ke dalam salah satu dari tiga tingkatan kinerja: 'Tinggi', 'Sedang', atau 'Berisiko'. Dasarkan ini pada pandangan holistik dari nilai, partisipasi, dan catatan apa pun.
    -   'Tinggi': Nilai konsisten tinggi (mis., >=85), partisipasi aktif.
    -   'Sedang': Nilai rata-rata (mis., 65-84), kinerja tidak konsisten, atau partisipasi campuran.
    -   'Berisiko': Nilai konsisten rendah (mis., <65), partisipasi rendah, atau catatan yang mengkhawatirkan (mis., absensi, penurunan tajam).
    Berikan alasan singkat satu kalimat untuk kategorisasi setiap siswa yang mensintesis semua titik data yang tersedia untuk mereka.
3.  **Identifikasi Tren & Anomali Utama:** Analisis data untuk menemukan 2-3 tren atau anomali yang signifikan. Ini bisa berupa penurunan umum dalam nilai, tugas tertentu yang sulit, korelasi antara partisipasi dan kinerja, atau siswa yang kinerjanya merupakan outlier. Untuk setiap tren, jelaskan observasi dan implikasi potensialnya.
4.  **Sarankan Rekomendasi yang Dapat Ditindaklanjuti:** Berdasarkan analisis, berikan 2-3 saran konkret yang dapat ditindaklanjuti untuk guru. Ini harus berupa intervensi atau strategi pedagogis yang spesifik. Bingkai sebagai tindakan yang jelas. Contohnya: "Untuk kelompok 'Berisiko', pertimbangkan sesi ulasan tentang 'Topik X' menggunakan aktivitas 'Pikir-Pasangkan-Bagikan'" atau "Pasangkan siswa berkinerja tinggi dengan siswa tingkat menengah untuk proyek kelompok berikutnya untuk mendorong pembelajaran teman sebaya."

Seluruh output Anda harus dalam format JSON yang ditentukan. Jangan tambahkan teks atau penjelasan tambahan.`,
  },
};

export async function generateLessonPlan(topic: string, duration: number, gradeLevel: string, language: Language): Promise<LessonPlan> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompts.lessonPlan[language](topic, duration, gradeLevel),
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          duration: { type: Type.INTEGER },
          objectives: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          materials: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                duration: { type: Type.INTEGER },
                description: { type: Type.STRING },
              },
              required: ["name", "duration", "description"],
            },
          },
          assessment: { type: Type.STRING },
        },
        required: ["title", "duration", "objectives", "materials", "activities", "assessment"],
      },
    },
  });

  const jsonText = response.text.trim();
  return JSON.parse(jsonText);
}

export async function generateCreativeActivities(theme: string, gradeLevel: string, activityType: string, language: Language): Promise<CreativeActivity[]> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompts.creativeActivities[language](theme, gradeLevel, activityType),
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        materials: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                        },
                        instructions: { type: Type.STRING },
                    },
                    required: ["name", "description", "materials", "instructions"],
                },
            },
        },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
}

export async function generateQuiz(topic: string, type: 'Multiple Choice' | 'Short Answer' | 'Essay', numQuestions: number, gradeLevel: string, language: Language): Promise<Quiz> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompts.quiz[language](topic, type, numQuestions, gradeLevel),
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    topic: { type: Type.STRING },
                    questions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                type: { type: Type.STRING },
                                options: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING },
                                },
                                correctAnswer: { type: Type.STRING },
                                explanation: { type: Type.STRING },
                            },
                            required: ["question", "type"],
                        },
                    },
                },
                required: ["topic", "questions"],
            },
        },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
}

export async function gradeAnswerSheet(
    studentSheet: { data: string, mimeType: string },
    answerKey: { data: string, mimeType: string },
    language: Language
): Promise<GradedExam> {
    const studentImagePart = {
        inlineData: {
            data: studentSheet.data,
            mimeType: studentSheet.mimeType,
        },
    };
    const answerKeyImagePart = {
        inlineData: {
            data: answerKey.data,
            mimeType: answerKey.mimeType,
        },
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [
            { text: prompts.aiGrader[language]() },
            studentImagePart, 
            answerKeyImagePart
        ]},
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    score: { type: Type.INTEGER },
                    totalQuestions: { type: Type.INTEGER },
                    correctAnswers: { type: Type.INTEGER },
                    analysis: { type: Type.STRING },
                    questionFeedback: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                questionNumber: { type: Type.INTEGER },
                                isCorrect: { type: Type.BOOLEAN },
                                feedback: { type: Type.STRING },
                            },
                            required: ['questionNumber', 'isCorrect', 'feedback'],
                        },
                    },
                },
                required: ['score', 'totalQuestions', 'correctAnswers', 'analysis', 'questionFeedback'],
            },
        },
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
}

export async function generateInteractiveDiagram(concept: string, style: string, type: string, language: Language): Promise<string> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompts.interactiveDiagram[language](concept, style, type),
    });
    // The response is expected to be a raw SVG string, potentially in a markdown block
    const svgCode = response.text.trim().replace(/```svg\n/g, '').replace(/```/g, '');
    return svgCode;
}

export async function generateSlides(topic: string, audience: string, numSlides: number, language: Language): Promise<string> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompts.slides[language](topic, audience, numSlides),
    });

    return response.text.trim();
}

export async function generateDashboardInsights(
  classData: object,
  language: Language
): Promise<DashboardInsights> {
  const dataString = JSON.stringify(classData, null, 2);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompts.dashboardInsights[language](dataString),
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.STRING,
            description: "A brief narrative summary of the class's current standing.",
          },
          studentTiers: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                studentName: { type: Type.STRING },
                tier: { type: Type.STRING },
                reason: { type: Type.STRING },
              },
              required: ['studentName', 'tier', 'reason'],
            },
            description: "A list of students categorized into performance tiers with reasons.",
          },
          trends: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    observation: { type: Type.STRING },
                    implication: { type: Type.STRING },
                },
                required: ['observation', 'implication'],
            },
            description: "Key trends or anomalies observed in the data.",
          },
          suggestedActions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                },
                required: ['title', 'description'],
            },
            description: 'A list of concrete, actionable suggestions for the teacher.',
          },
        },
        required: ['summary', 'studentTiers', 'trends', 'suggestedActions'],
      },
    },
  });

  const jsonText = response.text.trim();
  return JSON.parse(jsonText);
}
