import usePageTitle from '../../hooks/usePageTitle'
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../../api/axios'
import { fadeUp } from '../../utils/animations'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"
const TEAL = '#1D8B95'
const TEAL_HOVER = '#0E8F96'
const NAVY = '#0B1D34'

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api/v1', '') ?? 'http://localhost:5000'
function resolveImage(src) {
  if (!src) return null
  if (typeof src === 'object') src = src.url || src.secure_url || src.path || ''
  if (!src) return null
  if (src.startsWith('http')) return src
  if (src.startsWith('/')) return `${BACKEND}${src}`
  return src
}

const getDoctorName      = (d) => d.userId?.fullName || d.fullName || d.name || 'Həkim'
const getDoctorImage     = (d) => resolveImage(d.image || d.userId?.photoUrl || d.photoUrl || d.photo)
const getDoctorDeptId    = (d) => d.departmentId?._id || d.departmentId

const isHtml = (str) => /<[a-z][\s\S]*>/i.test(str || '')

const replaceLegacyBranding = (value) => {
  if (typeof value !== 'string') return value
  return value
    .replace(/\bLIV BONA DEA HOSPITAL BAK[ÜU]\b/gi, 'ASLAN MEDICAL CENTER, BAKI')
    .replace(/\bLiv Bona Dea Hospital Bak[üu]\b/gi, 'Aslan Medical Center, Bakı')
    .replace(/\bLiv Bona Dea Hospital\b/gi, 'Aslan Medical Center')
    .replace(/\bLiv Bona Dea\b/gi, 'Aslan Medical Center')
    .replace(/\bBona Dea Hospital\b/gi, 'Aslan Medical Center')
    .replace(/\bBona Dea\b/gi, 'Aslan Medical Center')
    .replace(/\bAcıbadem\b/gi, 'Aslan Medical Center')
    .replace(/\bAcibadem\b/gi, 'Aslan Medical Center')
    .replace(/\bMemorial\b/gi, 'Aslan Medical Center')
    .replace(/\bMedicana\b/gi, 'Aslan Medical Center')
    .replace(/\bAnadolu\b/gi, 'Aslan Medical Center')
    .replace(/\bLiv\b/g, 'Aslan Medical')
    .replace(/\bLIV\b/g, 'ASLAN MEDICAL')
}

const getDoctorSpecialty = (d) => replaceLegacyBranding(d.specialization || d.specialty || '')

const cleanDepartmentName = (value) => {
  const clean = replaceLegacyBranding(value || '')
    .replace(/\s+şöbəsi$/i, '')
    .replace(/\s+şöbə$/i, '')
    .trim()
  return clean || 'Tibbi xidmət'
}

const normalizeDepartmentKey = (value) =>
  cleanDepartmentName(value)
    .toLocaleLowerCase('az-AZ')
    .replace(/ə/g, 'e')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ç/g, 'c')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const DEFAULT_WHY =
  'Aslan Medical Center-də pasiyentlərin sağlamlıq ehtiyacları fərdi yanaşma ilə qiymətləndirilir. Müasir avadanlıq, peşəkar tibbi heyət və sistemli müayinə prinsipləri əsasında etibarlı və keyfiyyətli tibbi xidmət təqdim olunur.'

const createDepartmentContent = ({ name, summary, services, when, why = DEFAULT_WHY }) => ({
  name: `${name} şöbəsi`,
  heroSubtitle: `Aslan Medical Center-in ${name} şöbəsində ${summary} müasir tibbi yanaşmalar və təcrübəli həkimlər tərəfindən həyata keçirilir.`,
  aboutHeading: `${name} şöbəsində hansı xidmətlər göstərilir?`,
  aboutBody: services.join('\n\n'),
  contentSections: [
    {
      title: `${name} şöbəsinə nə zaman müraciət etmək lazımdır?`,
      body: when.join('\n\n'),
    },
    {
      title: 'Niyə Aslan Medical Center?',
      body: why,
    },
  ],
})

const DEPARTMENT_CONTENTS = [
  {
    aliases: ['kardiologiya', 'kardio', 'cardiology'],
    content: createDepartmentContent({
      name: 'Kardiologiya',
      summary: 'ürək-damar sistemi xəstəliklərinin diaqnostikası, müalicəsi və profilaktikası',
      services: [
        'Aslan Medical Center-in Kardiologiya şöbəsində ürək və damar xəstəliklərinin diaqnostikası, müalicəsi və izlənməsi həyata keçirilir. Şöbədə arterial hipertenziya, işemik ürək xəstəliyi, ürək ritm pozuntuları, ürək çatışmazlığı və digər kardioloji problemlərin qiymətləndirilməsi aparılır.',
        'Pasiyentlərə elektrokardioqramma (EKQ), exokardioqrafiya, Holter monitorinqi, təzyiq nəzarəti, laborator müayinələr və risk faktorlarının dəyərləndirilməsi kimi xidmətlər göstərilir. Məqsəd ürək sağlamlığını vaxtında qiymətləndirmək və pasiyent üçün uyğun müalicə planını müəyyən etməkdir.',
      ],
      when: [
        'Sinə nahiyəsində ağrı, təngnəfəslik, ürəkdöyünmə, arterial təzyiqin yüksəlməsi, tez yorulma, başgicəllənmə, ayaqlarda şişkinlik və ya ürək ritmində dəyişiklik kimi hallar olduqda kardioloqa müraciət etmək vacibdir.',
        'Ailəsində ürək-damar xəstəlikləri olan şəxslər, diabet, piylənmə, yüksək xolesterin və hipertoniya riski daşıyan pasiyentlər mütəmadi kardioloji müayinədən keçməlidirlər.',
      ],
    }),
  },
  {
    aliases: ['nevrologiya', 'neurology', 'nevroloji'],
    content: createDepartmentContent({
      name: 'Nevrologiya',
      summary: 'baş beyin, onurğa beyni, sinirlər və əzələ-sinir sistemi ilə bağlı xəstəliklərin qiymətləndirilməsi',
      services: [
        'Nevrologiya şöbəsində baş ağrıları, miqren, başgicəllənmə, keyimə, sinir sıxılmaları, bel və boyun ağrıları, yaddaş pozğunluğu, insult riski və digər nevroloji şikayətlər araşdırılır.',
        'Həkim müayinəsi zamanı pasiyentin nevroloji vəziyyəti qiymətləndirilir, ehtiyac olduqda laborator və instrumental müayinələrə yönləndirmə aparılır. Müalicə və izləmə planı şikayətin səbəbinə, xəstənin yaşına və ümumi sağlamlıq vəziyyətinə uyğun qurulur.',
      ],
      when: [
        'Təkrarlayan və ya güclü baş ağrısı, başgicəllənmə, əl-ayaqda keyimə, əzələ zəifliyi, yeriş pozğunluğu, qıcolma, nitqdə çətinlik, yaddaş zəifləməsi və bel-boyun ağrıları zamanı nevroloqa müraciət etmək tövsiyə olunur.',
        'İnsult riski, şəkərli diabetə bağlı sinir zədələnməsi və uzunmüddətli nevroloji şikayətlər erkən qiymətləndirildikdə daha düzgün izləmə və müalicə planı seçmək mümkündür.',
      ],
    }),
  },
  {
    aliases: ['pediatriya', 'pediatri', 'usaq', 'uşaq', 'pediatric'],
    content: createDepartmentContent({
      name: 'Pediatriya',
      summary: 'uşaqların sağlamlığının qorunması, inkişafının izlənməsi və pediatrik xəstəliklərin müalicəsi',
      services: [
        'Pediatriya şöbəsində uşaqların rutin müayinələri, böyümə və inkişaf göstəricilərinin izlənməsi, qidalanma məsləhətləri, peyvənd təqibi və uşaqlarda rast gəlinən infeksion xəstəliklərin qiymətləndirilməsi aparılır.',
        'Həkimlər körpəlik dövründən yeniyetməliyə qədər uşaqların sağlamlıq ehtiyaclarını nəzərə alaraq valideynlərlə birlikdə profilaktik və müalicəvi yanaşma formalaşdırırlar.',
      ],
      when: [
        'Uşaqda yüksək hərarət, öskürək, iştahasızlıq, qusma, ishal, səpgilər, çəki artımında geriləmə, inkişaf mərhələlərində ləngimə və ya ümumi halsızlıq müşahidə edilərsə pediatra müraciət edilməlidir.',
        'Sağlam uşaqların da mütəmadi pediatrik baxışdan keçməsi böyümə, inkişaf, peyvənd və qidalanma məsələlərinin düzgün izlənməsi üçün vacibdir.',
      ],
    }),
  },
  {
    aliases: ['ginekologiya', 'ginekoloji', 'qadin', 'qadın', 'gynecology'],
    content: createDepartmentContent({
      name: 'Ginekologiya',
      summary: 'qadın sağlamlığı, profilaktik müayinələr, reproduktiv sağlamlıq və ginekoloji xəstəliklərin izlənməsi',
      services: [
        'Ginekologiya şöbəsində qadın sağlamlığı ilə bağlı profilaktik müayinələr, menstrual pozğunluqlar, hamiləliyə hazırlıq, ginekoloji infeksiyalar, hormonal dəyişikliklər və ultrasəs müayinəsi kimi xidmətlər göstərilir.',
        'Pasiyentin yaşı, şikayətləri və reproduktiv planları nəzərə alınaraq fərdi müayinə və müalicə yanaşması seçilir. Məqsəd qadın sağlamlığının vaxtında qiymətləndirilməsi və mümkün risklərin erkən aşkarlanmasıdır.',
      ],
      when: [
        'Aybaşı pozğunluğu, qarınaltı ağrı, qeyri-adi ifrazat, qanaxma, hamiləlik planlaması, sonsuzluq şübhəsi və ya menopauza dövrü ilə bağlı narahatlıqlar zamanı ginekoloqa müraciət etmək lazımdır.',
        'Şikayət olmasa belə, profilaktik ginekoloji baxış qadın sağlamlığının qorunmasında mühüm rol oynayır.',
      ],
    }),
  },
  {
    aliases: ['dermatologiya', 'dermatoloji', 'deri', 'dəri', 'skin'],
    content: createDepartmentContent({
      name: 'Dermatologiya',
      summary: 'dəri, saç və dırnaq xəstəliklərinin diaqnostikası, müalicəsi və profilaktik izlənməsi',
      services: [
        'Dermatologiya şöbəsində akne, allergik dəri reaksiyaları, ekzema, göbələk infeksiyaları, saç tökülməsi, dırnaq problemləri, səpgilər və xalların qiymətləndirilməsi kimi xidmətlər təqdim olunur.',
        'Müayinə zamanı dəri dəyişikliklərinin səbəbi araşdırılır, ehtiyac olduqda laborator və əlavə diaqnostik müayinələr təyin edilir. Müalicə planı dəri tipinə, problemin davametmə müddətinə və pasiyentin ümumi vəziyyətinə uyğun hazırlanır.',
      ],
      when: [
        'Uzunmüddətli səpgilər, qaşınma, dəridə qızartı, ləkələr, irinli sızanaqlar, xallarda forma və rəng dəyişikliyi, saç tökülməsi və dırnaq quruluşunda dəyişiklik olduqda dermatoloqa müraciət etmək tövsiyə edilir.',
        'Dəri problemlərinin erkən qiymətləndirilməsi həm müalicənin düzgün seçilməsinə, həm də təkrarlanma riskinin azaldılmasına kömək edir.',
      ],
    }),
  },
  {
    aliases: ['ortopediya', 'travmatologiya', 'travma', 'orthopedics'],
    content: createDepartmentContent({
      name: 'Ortopediya və Travmatologiya',
      summary: 'sümük, oynaq, əzələ və travma ilə bağlı problemlərin qiymətləndirilməsi və müalicəsi',
      services: [
        'Ortopediya və Travmatologiya şöbəsində sınıqlar, burxulmalar, bağ və əzələ zədələnmələri, oynaq ağrıları, diz, çiyin, bel və onurğa ilə bağlı şikayətlər qiymətləndirilir.',
        'Pasiyentlərə müayinə, görüntüləmə nəticələrinin dəyərləndirilməsi, konservativ müalicə, zəruri hallarda cərrahi yönləndirmə və reabilitasiya üzrə tövsiyələr verilir. Məqsəd hərəkət qabiliyyətini qorumaq və gündəlik aktivliyi bərpa etməyə kömək etməkdir.',
      ],
      when: [
        'Yıxılma və zərbədən sonra ağrı, şişkinlik, hərəkət məhdudluğu, oynaqda qeyri-sabitlik, uzunmüddətli bel, diz, çiyin və ya omba ağrısı olduqda ortoped-travmatoloqa müraciət etmək lazımdır.',
        'İdman zədələri və təkrarlayan oynaq problemləri vaxtında qiymətləndirildikdə daha düzgün müalicə və bərpa planı seçilə bilər.',
      ],
    }),
  },
  {
    aliases: ['endokrinologiya', 'endokrin', 'hormonal', 'diabet'],
    content: createDepartmentContent({
      name: 'Endokrinologiya',
      summary: 'hormonal sistem, qalxanabənzər vəzi, şəkərli diabet və metabolik pozğunluqların izlənməsi',
      services: [
        'Endokrinologiya şöbəsində qalxanabənzər vəzi xəstəlikləri, şəkərli diabet, insulin müqaviməti, piylənmə, hormonal disbalans və metabolik pozğunluqların diaqnostikası və izlənməsi aparılır.',
        'Pasiyentlər laborator nəticələr, klinik şikayətlər və həyat tərzi faktorları əsasında qiymətləndirilir. Müalicə planı dərman müalicəsi, qidalanma tövsiyələri və mütəmadi nəzarət prinsiplərini əhatə edə bilər.',
      ],
      when: [
        'Çəki artımı və ya azalması, halsızlıq, ürəkdöyünmə, çox susama, tez-tez sidiyə getmə, saç tökülməsi, tərləmə, əllərdə titrəmə və ya boyunda şişkinlik olduqda endokrinoloqa müraciət etmək tövsiyə olunur.',
        'Diabet, yüksək xolesterin, ailəvi hormonal xəstəlik riski və qalxanabənzər vəzi problemi olan pasiyentlər mütəmadi endokrinoloji nəzarətdə olmalıdırlar.',
      ],
    }),
  },
  {
    aliases: ['qastroenterologiya', 'qastro', 'gastroenterology', 'hezm', 'həzm'],
    content: createDepartmentContent({
      name: 'Qastroenterologiya',
      summary: 'mədə-bağırsaq, qaraciyər və həzm sistemi xəstəliklərinin diaqnostikası və müalicəsi',
      services: [
        'Qastroenterologiya şöbəsində reflüks, qarın ağrısı, köp, qəbizlik, ishal, mədə-bağırsaq narahatlıqları, qaraciyər və öd yolları ilə bağlı şikayətlər qiymətləndirilir.',
        'Pasiyentin şikayətləri, qidalanma vərdişləri və müayinə nəticələri birlikdə dəyərləndirilir. Lazım olduqda laborator, ultrasəs və digər müvafiq müayinələrə yönləndirmə aparılır.',
      ],
      when: [
        'Uzunmüddətli mədə yanması, qıcqırma, qarın ağrısı, köp, ürəkbulanma, qusma, qəbizlik, ishal, iştahsızlıq və ya nəcisdə dəyişikliklər olduqda qastroenteroloqa müraciət etmək lazımdır.',
        'Həzm sistemi şikayətlərinin vaxtında araşdırılması xroniki problemlərin idarə olunmasına və düzgün qidalanma-müalicə planının seçilməsinə kömək edir.',
      ],
    }),
  },
  {
    aliases: ['oftalmologiya', 'oftalmoloji', 'goz', 'göz', 'ophthalmology'],
    content: createDepartmentContent({
      name: 'Oftalmologiya',
      summary: 'göz sağlamlığı, görmə problemləri və profilaktik göz müayinələrinin aparılması',
      services: [
        'Oftalmologiya şöbəsində görmə zəifliyi, göz təzyiqi, quru göz, katarakta şübhəsi, göz infeksiyaları, allergik reaksiyalar və digər göz xəstəlikləri qiymətləndirilir.',
        'Müayinə zamanı görmə itiliyi, göz quruluşu və risk faktorları dəyərləndirilir. Uşaqlar, böyüklər və xroniki xəstəliyi olan pasiyentlər üçün profilaktik baxışlar xüsusi əhəmiyyət daşıyır.',
      ],
      when: [
        'Görmədə bulanıqlıq, göz ağrısı, qızartı, sulanma, işığa həssaslıq, baş ağrısı ilə müşayiət olunan görmə narahatlığı və ya göz önündə uçuşan nöqtələr olduqda oftalmoloqa müraciət edilməlidir.',
        'Diabet, yüksək təzyiq və ailəvi göz xəstəlikləri riski olan şəxslərin mütəmadi göz müayinəsindən keçməsi tövsiyə olunur.',
      ],
    }),
  },
  {
    aliases: ['lor', 'otolarinqologiya', 'otolaringologiya', 'qulaq-burun-bogaz', 'qulaq burun boğaz', 'ent'],
    content: createDepartmentContent({
      name: 'LOR və Otolarinqologiya',
      summary: 'qulaq, burun və boğaz xəstəliklərinin diaqnostikası, müalicəsi və izlənməsi',
      services: [
        'LOR və Otolarinqologiya şöbəsində sinusit, tonzillit, burun tutulması, boğaz ağrısı, qulaq ağrısı, eşitmə problemləri, başgicəllənmə və yuxarı tənəffüs yolları infeksiyaları qiymətləndirilir.',
        'Müayinə zamanı qulaq, burun və boğaz nahiyəsi diqqətlə dəyərləndirilir, ehtiyac olduqda əlavə diaqnostik müayinələrə yönləndirmə aparılır. Müalicə planı şikayətin səbəbinə və pasiyentin vəziyyətinə uyğun seçilir.',
      ],
      when: [
        'Uzunmüddətli burun tutulması, təkrarlayan boğaz infeksiyaları, qulaqda ağrı və ya küy, eşitmə azalması, udqunma çətinliyi, xroniki öskürək və başgicəllənmə zamanı LOR həkiminə müraciət etmək lazımdır.',
        'Uşaqlarda tez-tez təkrarlayan boğaz və qulaq infeksiyaları da vaxtında LOR müayinəsi tələb edə bilər.',
      ],
    }),
  },
  {
    aliases: ['urologiya', 'uroloji', 'urology', 'sidik', 'prostat'],
    content: createDepartmentContent({
      name: 'Urologiya',
      summary: 'sidik sistemi, böyrək, sidik kisəsi, prostat və kişi sağlamlığı ilə bağlı problemlərin qiymətləndirilməsi',
      services: [
        'Urologiya şöbəsində sidik yolu infeksiyaları, böyrək və sidik kisəsi problemləri, prostat xəstəlikləri, sidikdə yanma, tez-tez sidiyə getmə və kişi sağlamlığı ilə bağlı şikayətlər araşdırılır.',
        'Pasiyentin şikayətləri, laborator analizləri və görüntüləmə nəticələri əsasında fərdi müayinə və müalicə planı hazırlanır. Məqsəd uroloji problemlərin vaxtında aşkarlanması və düzgün izlənməsidir.',
      ],
      when: [
        'Sidikdə yanma, ağrı, qan görülməsi, bel nahiyəsində ağrı, tez-tez sidiyə getmə, sidiyi saxlamaqda çətinlik, prostatla bağlı narahatlıq və təkrarlayan infeksiyalar zamanı uroloqa müraciət edilməlidir.',
        'Kişi sağlamlığı və yaşla bağlı uroloji dəyişikliklər üçün profilaktik müayinələr də vacibdir.',
      ],
    }),
  },
  {
    aliases: ['laboratoriya', 'lab', 'analiz'],
    content: createDepartmentContent({
      name: 'Laboratoriya',
      summary: 'qan, sidik, biokimyəvi, hormonal və digər laborator analizlərin aparılması və diaqnostik prosesə dəstək',
      services: [
        'Laboratoriya şöbəsində qan analizləri, sidik müayinələri, biokimyəvi göstəricilər, hormonal testlər, infeksion markerlər və həkim təyinatına uyğun digər laborator müayinələr icra olunur.',
        'Nəticələrin düzgün götürülməsi, qeydiyyatı və vaxtında təqdim edilməsi diaqnostik qərarların dəqiqləşdirilməsinə kömək edir. Analizlər həkim müayinəsi və klinik şikayətlərlə birlikdə qiymətləndirilməlidir.',
      ],
      when: [
        'Profilaktik müayinə, xəstəliklərin ilkin aşkarlanması, müalicə prosesinin izlənməsi, hormonal və metabolik göstəricilərin qiymətləndirilməsi üçün laborator analizlərə ehtiyac yarana bilər.',
        'Həkim tərəfindən təyin edilən analizlərdən əvvəl hazırlıq qaydalarına əməl etmək nəticələrin daha düzgün qiymətləndirilməsinə şərait yaradır.',
      ],
    }),
  },
  {
    aliases: ['cerrahiyye', 'cərrahiyyə', 'umumi-cerrahiyye', 'surgery'],
    content: createDepartmentContent({
      name: 'Cərrahiyyə',
      summary: 'cərrahi xəstəliklərin ilkin qiymətləndirilməsi, müalicə planlaması və əməliyyat sonrası izlənməsi',
      services: [
        'Cərrahiyyə şöbəsində qarın boşluğu, yumşaq toxuma, dərialtı törəmələr, yırtıq, öd kisəsi və digər cərrahi problemlərlə bağlı ilkin müayinə və yönləndirmə aparılır.',
        'Pasiyentin şikayəti, müayinə nəticələri və risk faktorları dəyərləndirilərək konservativ və ya cərrahi yanaşma ehtiyacı müəyyən edilir. Əməliyyat sonrası nəzarət və sarğı prosesləri də həkim göstərişinə uyğun izlənir.',
      ],
      when: [
        'Kəskin və ya davamlı qarın ağrısı, şişkinlik, dərialtı törəmə, yara, irinləmə, yırtıq əlamətləri və travmadan sonra yaranan şikayətlər zamanı cərraha müraciət etmək lazımdır.',
        'Cərrahi şikayətlərin vaxtında qiymətləndirilməsi düzgün müalicə taktikasının seçilməsinə kömək edir.',
      ],
    }),
  },
  {
    aliases: ['terapiya', 'daxili-xestelikler', 'internal-medicine'],
    content: createDepartmentContent({
      name: 'Terapiya',
      summary: 'daxili xəstəliklərin ilkin diaqnostikası, müalicəsi və profilaktik izlənməsi',
      services: [
        'Terapiya şöbəsində ümumi halsızlıq, hərarət, təzyiq dəyişiklikləri, xroniki xəstəliklərin izlənməsi, profilaktik müayinələr və müxtəlif sistemlərlə bağlı ilkin şikayətlər qiymətləndirilir.',
        'Terapevt pasiyentin ümumi sağlamlıq vəziyyətini dəyərləndirir, lazımi analiz və müayinələri təyin edir, ehtiyac olduqda uyğun ixtisas həkiminə yönləndirir.',
      ],
      when: [
        'Səbəbi bilinməyən halsızlıq, hərarət, iştahasızlıq, təzyiq problemi, bədən ağrıları, profilaktik yoxlanış ehtiyacı və xroniki xəstəlik nəzarəti üçün terapevtə müraciət etmək olar.',
        'Daimi həkim nəzarəti xroniki xəstəliklərin daha sistemli izlənməsinə və risklərin erkən aşkarlanmasına kömək edir.',
      ],
    }),
  },
  {
    aliases: ['radiologiya', 'radioloji', 'usm', 'rentgen', 'imaging'],
    content: createDepartmentContent({
      name: 'Radiologiya',
      summary: 'görüntüləmə müayinələrinin aparılması və həkim diaqnostikasına dəstək verilməsi',
      services: [
        'Radiologiya şöbəsində həkim təyinatına uyğun görüntüləmə müayinələri aparılır və nəticələr klinik məlumatlarla birlikdə dəyərləndirilir. Bu müayinələr daxili orqanlar, yumşaq toxumalar, sümük-oynaq sistemi və digər sahələrin qiymətləndirilməsinə kömək edir.',
        'Radioloji nəticələr diaqnozun dəqiqləşdirilməsi, müalicə planının seçilməsi və xəstəliyin gedişinin izlənməsi üçün mühüm məlumat mənbəyidir.',
      ],
      when: [
        'Ağrı, şişkinlik, travma, daxili orqanlarla bağlı şikayətlər, profilaktik müayinə və ya həkim göstərişi olduqda radioloji müayinəyə ehtiyac yarana bilər.',
        'Müayinə növü pasiyentin şikayəti və həkimin klinik qiymətləndirməsi əsasında seçilməlidir.',
      ],
    }),
  },
  {
    aliases: ['stomatologiya', 'dental', 'dis', 'diş'],
    content: createDepartmentContent({
      name: 'Stomatologiya',
      summary: 'diş, diş əti və ağız boşluğu sağlamlığı ilə bağlı problemlərin müayinəsi və müalicəsi',
      services: [
        'Stomatologiya şöbəsində diş ağrısı, kariyes, diş əti xəstəlikləri, ağız boşluğu infeksiyaları, profilaktik baxış və gigiyena ilə bağlı xidmətlər göstərilir.',
        'Müayinə zamanı dişlərin və diş ətlərinin vəziyyəti qiymətləndirilir, pasiyentə uyğun müalicə və profilaktik qulluq planı hazırlanır.',
      ],
      when: [
        'Diş ağrısı, diş ətində qanama, ağız qoxusu, isti-soyuğa həssaslıq, çeynəmə zamanı ağrı və ya profilaktik baxış ehtiyacı olduqda stomatoloqa müraciət etmək lazımdır.',
        'Mütəmadi stomatoloji müayinə ağız sağlamlığının qorunmasına və problemlərin erkən aşkarlanmasına kömək edir.',
      ],
    }),
  },
  {
    aliases: ['fizioterapiya', 'reabilitasiya', 'rehabilitation'],
    content: createDepartmentContent({
      name: 'Fizioterapiya və Reabilitasiya',
      summary: 'hərəkət funksiyasının bərpası, ağrıların azaldılması və reabilitasiya proqramlarının təşkili',
      services: [
        'Fizioterapiya və Reabilitasiya şöbəsində travma, əməliyyat sonrası dövr, oynaq və əzələ ağrıları, hərəkət məhdudluğu və xroniki ağrı sindromları üzrə fərdi bərpa proqramları hazırlanır.',
        'Müalicə planı pasiyentin vəziyyəti, yaşı, ağrı səviyyəsi və funksional ehtiyacları nəzərə alınaraq qurulur. Məqsəd gündəlik aktivliyi dəstəkləmək və hərəkət keyfiyyətini yaxşılaşdırmaqdır.',
      ],
      when: [
        'Əməliyyat və ya zədədən sonra hərəkət məhdudluğu, bel-boyun ağrıları, oynaq sərtliyi, əzələ zəifliyi və uzunmüddətli ağrı olduqda reabilitasiya həkiminə müraciət etmək tövsiyə olunur.',
        'Erkən və düzgün reabilitasiya bərpa prosesinin daha sistemli aparılmasına kömək edir.',
      ],
    }),
  },
  {
    aliases: ['pulmonologiya', 'pulmonoloji', 'agciyer', 'ağciyər', 'respiratory'],
    content: createDepartmentContent({
      name: 'Pulmonologiya',
      summary: 'ağciyər və tənəffüs sistemi xəstəliklərinin diaqnostikası, müalicəsi və izlənməsi',
      services: [
        'Pulmonologiya şöbəsində öskürək, təngnəfəslik, bronxit, astma, allergik tənəffüs şikayətləri və digər ağciyər problemləri qiymətləndirilir.',
        'Pasiyentin tənəffüs vəziyyəti, risk faktorları və müayinə nəticələri əsasında uyğun müalicə və izləmə planı hazırlanır. Siqaret istifadəsi, allergiya və xroniki xəstəliklər ayrıca dəyərləndirilir.',
      ],
      when: [
        'Uzunmüddətli öskürək, nəfəs darlığı, sinədə xışıltı, tez-tez bronxit, fiziki aktivlik zamanı təngnəfəslik və təkrarlayan tənəffüs yolu infeksiyaları zamanı pulmonoloqa müraciət etmək lazımdır.',
        'Xroniki tənəffüs xəstəlikləri olan pasiyentlər mütəmadi həkim nəzarətində olmalıdırlar.',
      ],
    }),
  },
]

const getDepartmentContent = (dept, slug) => {
  const values = [slug, dept?.slug, dept?.name].filter(Boolean).map(normalizeDepartmentKey)
  return DEPARTMENT_CONTENTS.find(({ aliases }) =>
    aliases
      .map(normalizeDepartmentKey)
      .some(alias => values.some(value => value.includes(alias)))
  )?.content
}

const createGenericDepartmentContent = (name) => createDepartmentContent({
  name,
  summary: `${name.toLocaleLowerCase('az-AZ')} istiqaməti üzrə müayinə, diaqnostika, müalicə və profilaktik izləmə`,
  services: [
    `Aslan Medical Center-in ${name} şöbəsində pasiyentlərin şikayətləri diqqətlə qiymətləndirilir, uyğun müayinə planı seçilir və tibbi ehtiyaclara əsaslanan müalicə yanaşması hazırlanır.`,
    'Şöbədə məqsəd xəstəliyin səbəbini vaxtında müəyyən etmək, pasiyentin ümumi sağlamlıq vəziyyətini nəzərə almaq və davamlı izləmə ilə keyfiyyətli tibbi xidmət təqdim etməkdir.',
  ],
  when: [
    `${name} sahəsi ilə bağlı davamlı ağrı, narahatlıq, funksional dəyişiklik, təkrarlayan şikayətlər və ya profilaktik müayinə ehtiyacı yarandıqda həkimə müraciət etmək tövsiyə olunur.`,
    'Erkən həkim müayinəsi diaqnostika prosesinin düzgün aparılmasına və fərdi müalicə planının seçilməsinə kömək edir.',
  ],
})

const sanitizeSections = (sections) =>
  Array.isArray(sections)
    ? sections.map(section => ({
      ...section,
      title: replaceLegacyBranding(section.title),
      body: replaceLegacyBranding(section.body),
    }))
    : []

const buildDepartmentViewModel = (data, slug) => {
  const sanitized = {
    ...data,
    name: replaceLegacyBranding(data.name),
    description: replaceLegacyBranding(data.description),
    contentSections: sanitizeSections(data.contentSections),
  }
  const departmentName = cleanDepartmentName(sanitized.name)
  const content = getDepartmentContent(sanitized, slug) || createGenericDepartmentContent(departmentName)

  // DB content takes priority; fall back to hardcoded only when the DB fields are empty
  const hasDbDescription = Boolean(sanitized.description?.trim())
  const hasDbSections    = sanitized.contentSections.some(s => s.title || s.body)

  return {
    ...sanitized,
    name:            content.name,
    heroSubtitle:    content.heroSubtitle,
    aboutHeading:    content.aboutHeading,
    description:     hasDbDescription ? sanitized.description : content.aboutBody,
    contentSections: hasDbSections    ? sanitized.contentSections : content.contentSections,
  }
}

const formatDate = (value) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}.${d.getFullYear()}`
}

export default function DepartmentDetailPage() {
  const { slug }   = useParams()
  const navigate   = useNavigate()

  const [deptState, setDeptState] = useState({ slug: null, data: null, error: false })
  const [doctors, setDoctors]     = useState([])

  const dept = deptState.slug === slug ? deptState.data : null
  const loading = deptState.slug !== slug
  const error = deptState.slug === slug && deptState.error

  usePageTitle(dept?.name || 'Şöbə', dept?.heroSubtitle || dept?.description || 'Tibbi mərkəzimizin şöbəsi haqqında məlumat.')

  useEffect(() => {
    let ignore = false

    api.get(`/departments/${slug}`)
      .then(res => {
        const data = res.data?.data ?? res.data
        if (!data) throw new Error('not found')
        if (!ignore) {
          setDeptState({ slug, data: buildDepartmentViewModel(data, slug), error: false })
        }
      })
      .catch(() => {
        if (!ignore) {
          setDeptState({ slug, data: null, error: true })
        }
      })

    return () => { ignore = true }
  }, [slug])

  useEffect(() => {
    if (!dept?._id) return
    api.get('/doctors/public/all')
      .then(res => {
        const data = res.data?.data ?? res.data
        const all = Array.isArray(data) ? data : []
        setDoctors(all.filter(d => String(getDoctorDeptId(d)) === String(dept._id)))
      })
      .catch(() => {})
  }, [dept])

  const hasContact = dept && (dept.phone || dept.fax || dept.room)
  const heroSubtitle = dept?.heroSubtitle || dept?.description
  const aboutHeading = dept?.aboutHeading || 'Haqqında'
  const relatedDoctors = dept?._id
    ? doctors.filter(d => String(getDoctorDeptId(d)) === String(dept._id))
    : []

  return (
    <main className="bg-white" style={{ fontFamily: FONT }}>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${TEAL} 0%, ${NAVY} 100%)`, padding: '90px 0' }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.08,
            backgroundImage: 'repeating-linear-gradient(45deg, #ffffff 0px, #ffffff 2px, transparent 2px, transparent 64px)',
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            opacity: 0.06, right: -120, top: -120, width: 360, height: 360,
            borderRadius: '50%', border: '40px solid #ffffff',
          }}
        />

        <motion.div
          className="relative px-4"
          style={{ maxWidth: 1280, width: '100%', margin: '0 auto' }}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[14px] mb-10 text-white/80">
            <a href="/" className="hover:underline text-white/80">Ana Səhifə</a>
            <span className="text-white/50">›</span>
            <Link to="/departments" className="hover:underline text-white/80">Şöbələr</Link>
            <span className="text-white/50">›</span>
            <span className="text-white">{dept?.name || '...'}</span>
          </nav>

          {/* Title */}
          <h1 className="text-center text-4xl md:text-5xl font-light text-white" style={{ textAlign: 'center' }}>
            {loading ? 'Yüklənir...' : (dept?.name || 'Şöbə tapılmadı')}
          </h1>

          {/* Subtitle */}
          {!loading && heroSubtitle && (
            <p
              className="text-base text-white/80"
              style={{
                maxWidth: 760,
                width: '100%',
                margin: '16px auto 0',
                textAlign: 'center',
                lineHeight: 1.6,
              }}
            >
              {heroSubtitle}
            </p>
          )}
        </motion.div>
      </section>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="px-4" style={{ maxWidth: 1280, width: '100%', margin: '0 auto', padding: '60px 16px 80px' }}>

          {error && !loading && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ color: '#64748B', marginBottom: 16 }}>Bu şöbə tapılmadı.</p>
              <Link to="/departments" className="text-sm hover:underline" style={{ color: TEAL }}>← Bütün şöbələr</Link>
            </div>
          )}

          {!error && loading && (
            <p style={{ textAlign: 'center', color: '#64748B', padding: '60px 0' }}>Yüklənir...</p>
          )}

          {!error && !loading && dept && (
            <>
              <div className="flex flex-col md:flex-row gap-10">

                {/* LEFT — Doctors sidebar
                    Sticky wrapper is a plain div (no Framer Motion transform) so
                    position:sticky is not disrupted by translateY during animation. */}
                <div className="w-full md:w-[34%] md:self-start lg:sticky lg:top-[160px]">
                  <motion.aside
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    <h2 className="text-lg font-semibold mb-4" style={{ color: TEAL }}>Əlaqədar Həkimlər</h2>

                    {relatedDoctors.length > 0 ? (
                      <div className="overflow-y-auto pr-1" style={{ maxHeight: 460 }}>
                        {relatedDoctors.map(doc => {
                          const photo = getDoctorImage(doc)
                          const name  = getDoctorName(doc)
                          const spec  = getDoctorSpecialty(doc)
                          const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'DR'
                          return (
                            <div
                              key={doc._id}
                              className="flex items-center gap-4 rounded-lg border transition-all"
                              style={{ borderColor: '#E2E8F0', background: '#F8FAFC', padding: '14px 16px', marginBottom: 12, boxShadow: 'none' }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.boxShadow = '0 4px 12px rgba(29, 139, 149, 0.12)' }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none' }}
                            >
                              {photo ? (
                                <img src={photo} alt={name} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
                              ) : (
                                <div className="w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center text-white text-lg font-semibold" style={{ background: TEAL }}>
                                  {initials}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                {spec && <div className="text-xs uppercase tracking-wide truncate" style={{ color: '#64748B' }}>{spec}</div>}
                                <div className="text-base font-semibold truncate" style={{ color: NAVY }}>{name}</div>
                              </div>
                              <button
                                type="button"
                                onClick={() => navigate(`/randevu?doctorId=${doc._id}`)}
                                className="flex-shrink-0 whitespace-nowrap text-[15px] font-semibold rounded px-3.5 py-1.5 text-white transition-colors"
                                style={{ background: TEAL }}
                                onMouseEnter={e => { e.currentTarget.style.background = TEAL_HOVER }}
                                onMouseLeave={e => { e.currentTarget.style.background = TEAL }}
                              >
                                Randevu al
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-sm" style={{ color: '#64748B' }}>Bu şöbə üzrə həkim tapılmadı.</p>
                    )}
                  </motion.aside>
                </div>

                {/* RIGHT — Content */}
                <motion.div
                  className="w-full md:w-[66%]"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {dept.updatedAt && (
                    <div className="text-right text-xs mb-4" style={{ color: '#64748B' }}>
                      Son yenilənmə: {formatDate(dept.updatedAt)}
                    </div>
                  )}

                  {/* Description */}
                  {dept.description && (
                    <div className="mb-8">
                      <h2 className="text-base font-bold mb-3" style={{ color: NAVY }}>{aboutHeading}</h2>
                      {isHtml(dept.description) ? (
                        <div
                          className="text-[15px] leading-relaxed [&_p]:mb-4"
                          style={{ color: '#334155' }}
                          dangerouslySetInnerHTML={{ __html: dept.description }}
                        />
                      ) : (
                        dept.description.split(/\n+/).filter(Boolean).map((para, i) => (
                          <p key={i} className="text-[15px] leading-relaxed mb-4" style={{ color: '#334155' }}>
                            {para}
                          </p>
                        ))
                      )}
                    </div>
                  )}

                  {/* Additional content sections */}
                  {(dept.contentSections || []).filter(s => s.title || s.body).map((section, i) => (
                    <div key={i} className="mt-8">
                      {section.title && (
                        <h2 className="text-base font-bold mb-3" style={{ color: NAVY }}>{section.title}</h2>
                      )}
                      {section.body && (
                        isHtml(section.body) ? (
                          <div
                            className="text-sm leading-relaxed [&_p]:mb-4"
                            style={{ color: '#475569' }}
                            dangerouslySetInnerHTML={{ __html: section.body }}
                          />
                        ) : (
                          section.body.split(/\n+/).filter(Boolean).map((para, j) => (
                            <p key={j} className="text-sm leading-relaxed mb-4" style={{ color: '#475569' }}>
                              {para}
                            </p>
                          ))
                        )
                      )}
                    </div>
                  ))}

                  {/* Contact card */}
                  {hasContact && (
                    <div className="bg-white rounded-lg p-6 mb-8" style={{ border: '1px solid #E2E8F0', maxWidth: 480 }}>
                      <h2 className="text-base font-bold mb-3" style={{ color: NAVY }}>Əlaqə məlumatları</h2>
                      <div className="text-[14px] leading-[1.9]" style={{ color: '#334155' }}>
                        {dept.phone && <div>Tel: {dept.phone}</div>}
                        {dept.fax   && <div>Faks: {dept.fax}</div>}
                        {dept.room  && <div>Otaq: {dept.room}</div>}
                      </div>
                    </div>
                  )}

                  {/* Back link */}
                  <Link
                    to="/departments"
                    className="inline-flex items-center gap-1.5 text-sm hover:underline mt-2 transition-transform duration-200 hover:scale-105"
                    style={{ color: TEAL }}
                    onMouseEnter={e => { e.currentTarget.style.color = TEAL_HOVER }}
                    onMouseLeave={e => { e.currentTarget.style.color = TEAL }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="12" x2="5" y2="12" />
                      <polyline points="12 19 5 12 12 5" />
                    </svg>
                    Bütün şöbələr
                  </Link>
                </motion.div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  )
}
