import type { AstrologyBasicsPayload } from './astrology-basics.types';

export type AstrologyBasicsLang = 'en' | 'ru' | 'hy';

const EN: AstrologyBasicsPayload = {
  concepts: [
    {
      id: 'zodiacSigns',
      title: 'Zodiac signs',
      definition:
        'The twelve zodiac signs are symbolic styles of energy—like twelve “flavors” the sky uses to color how planets express themselves.',
      explanation:
        'They do not decide your fate. They describe tendencies in how you might act, feel, or grow when a planet moves through that sign. Think of them as moods or costumes: Aries feels direct, Libra seeks balance, Pisces leans dreamy—each sign has its own tone.',
      example:
        'If someone says “I’m a Leo Sun,” they mean the Sun was in Leo when they were born—that highlights a warm, expressive style in how their core self shows up.',
      summary: 'Signs describe style and flavor, not a fixed destiny.',
    },
    {
      id: 'planets',
      title: 'Planets',
      definition:
        'In astrology, planets stand for different parts of life and personality—like inner “departments” that work together.',
      explanation:
        'The Sun is your sense of self; the Moon is needs and feelings; Mercury is thinking and talking; Venus is love and values; Mars is drive; Jupiter expands; Saturn sets limits; outer planets mark generational and deeper themes. Charts combine these voices.',
      example:
        'Strong Mars might show up as quick initiative; a emphasized Venus might show up as caring a lot about harmony in relationships.',
      summary: 'Each planet answers a different “what part of me is this?” question.',
    },
    {
      id: 'houses',
      title: 'Houses',
      definition:
        'Houses are twelve slices of the chart that map life areas—where topics like home, work, or relationships tend to show up.',
      explanation:
        'They are not the same as signs. Signs describe how; houses describe where in life the story tends to unfold. The 1st house is self-presentation, the 4th home and roots, the 7th partnerships, the 10th career and public role, and so on.',
      example:
        'Planets in your 10th house often connect to career or reputation; planets in the 4th often connect to family and private life.',
      summary: 'Houses point to life arenas; signs color how you meet them.',
    },
    {
      id: 'planetInSign',
      title: 'Planet in sign',
      definition:
        'A planet in a sign means that planet’s theme is expressed through that sign’s style.',
      explanation:
        'Same planet, different sign = same core topic, different flavor. Mercury in Gemini might love quick ideas; Mercury in Taurus may prefer steady, practical thinking. The sign modulates tone, not the planet’s basic meaning.',
      example:
        'Mars in Aries acts fast and direct; Mars in Cancer may push for action through care, protection, or mood.',
      summary: 'Sign is the “how” wrapped around the planet’s “what.”',
    },
    {
      id: 'planetInHouse',
      title: 'Planet in house',
      definition:
        'A planet in a house shows where in life that planet’s energy tends to appear most clearly.',
      explanation:
        'Houses are settings: Venus in the 5th might highlight creativity and romance; Venus in the 6th might show love through routine, service, or health habits. The planet still means the same thing; the house suggests the stage.',
      example:
        'The Moon in the 11th often ties feelings to friends, groups, and hopes; in the 2nd, feelings may link closely to money and self-worth.',
      summary: 'House = where the planet’s story tends to play out.',
    },
    {
      id: 'aspects',
      title: 'Aspects',
      definition:
        'Aspects are angles between planets—they describe how two planetary themes talk to each other in your chart.',
      explanation:
        'Some angles feel easy and flowing; others feel tense and motivating. Aspects don’t label you “good” or “bad”; they show chemistry between parts of you. Learning them helps you see inner patterns, not future events.',
      example:
        'A tight aspect between Mercury and Saturn might blend careful thinking with seriousness; Mercury and Jupiter might blend big ideas with curiosity.',
      summary: 'Aspects map relationships between planetary themes.',
      aspectTypes: {
        conjunction:
          'Planets are close together—their themes blend and act as one strong focus.',
        trine:
          'A flowing 120° angle—talents and ease; things may come naturally but still need awareness.',
        square:
          'A 90° angle of tension—friction that can build skill and growth when you work with it.',
        opposition:
          'Planets 180° apart—two sides to balance, like dialogue between different needs.',
      },
    },
    {
      id: 'transits',
      title: 'Transits',
      definition:
        'Transits are the current positions of planets in the sky compared to your birth chart.',
      explanation:
        'As planets move, they form temporary angles to your natal planets and points. That can highlight themes for a while—like a season of focus, not a verdict on your life. Astrology here is about timing and reflection, not fortune-telling.',
      example:
        'When transiting Saturn contacts your natal Sun, you might feel a push toward structure or responsibility for a period—not because you’re “cursed,” but because that pairing emphasizes maturity.',
      summary: 'Transits describe moving sky weather against your fixed birth map.',
    },
    {
      id: 'natalChart',
      title: 'Natal chart',
      definition:
        'A natal chart is a snapshot of the sky at your birth: planet positions, signs, houses, and aspects drawn as a wheel.',
      explanation:
        'It is a map of symbolic patterns, not a sentence about who you must be. People use it to reflect on strengths, tensions, and growth edges—like a personality sketch from astronomy’s point of view, open to your lived experience.',
      example:
        'Your chart might show a strong emphasis in one house or a cluster of planets in one sign—those become conversation starters for self-understanding.',
      summary: 'Your natal chart is a personal sky-map for reflection, not prediction.',
    },
  ],
};

const RU: AstrologyBasicsPayload = {
  concepts: [
    {
      id: 'zodiacSigns',
      title: 'Знаки зодиака',
      definition:
        'Двенадцать знаков зодиака — это символические стили энергии, как двенадцать «вкусов», через которые небо окрашивает проявление планет.',
      explanation:
        'Они не решают вашу судьбу. Они описывают склонности в том, как вы можете действовать, чувствовать или расти, когда планета проходит знак. Думайте о них как о настроении или маске: Овен — прямолинейность, Весы — стремление к балансу, Рыбы — мечтательность — у каждого знака свой тон.',
      example:
        'Если говорят «я Лев по Солнцу», имеют в виду, что при рождении Солнце было во Льве — это подчёркивает тёплый, выразительный стиль ядра личности.',
      summary: 'Знаки описывают стиль и оттенок, а не жёсткую судьбу.',
    },
    {
      id: 'planets',
      title: 'Планеты',
      definition:
        'В астрологии планеты означают разные сферы жизни и личности — как внутренние «отделы», которые работают вместе.',
      explanation:
        'Солнце — ощущение «я»; Луна — потребности и чувства; Меркурий — мышление и речь; Венера — любовь и ценности; Марс — движение к цели; Юпитер расширяет; Сатурн задаёт границы; внешние планеты отражают поколенческие и более глубокие темы. Карта соединяет эти голоса.',
      example:
        'Сильный Марс может проявляться как быстрая инициатива; выраженная Венера — как забота о гармонии в отношениях.',
      summary: 'Каждая планета отвечает на вопрос: «какая это часть меня?»',
    },
    {
      id: 'houses',
      title: 'Дома',
      definition:
        'Дома — это двенадцать секторов карты, которые показывают сферы жизни: где обычно разворачиваются темы дома, работы, отношений и т. д.',
      explanation:
        'Это не то же самое, что знаки. Знаки — как; дома — где в жизни чаще проявляется сюжет. 1-й дом — образ и тело, 4-й — дом и корни, 7-й — партнёрство, 10-й — карьера и публичная роль и так далее.',
      example:
        'Планеты в 10-м доме часто связывают с карьерой или репутацией; в 4-м — с семьёй и личным пространством.',
      summary: 'Дома указывают на арены жизни; знаки окрашивают, как вы их проживаете.',
    },
    {
      id: 'planetInSign',
      title: 'Планета в знаке',
      definition:
        'Планета в знаке означает, что тема планеты выражается в стиле этого знака.',
      explanation:
        'Та же планета, другой знак — та же основная тема, другой вкус. Меркурий в Близнецах любит быстрые идеи; в Тельце — спокойное практичное мышление. Знак меняет тон, а не смысл планеты.',
      example:
        'Марс в Овне действует быстро и прямо; в Раке — через заботу, защиту или эмоциональные качели.',
      summary: 'Знак — это «как» вокруг «чего» планеты.',
    },
    {
      id: 'planetInHouse',
      title: 'Планета в доме',
      definition:
        'Планета в доме показывает, в какой сфере жизни энергия планеты проявляется яснее всего.',
      explanation:
        'Дома — это сцена: Венера в 5-м может подчеркнуть творчество и романтику; в 6-м — любовь через рутину, служение или здоровье. Смысл планеты тот же; дом задаёт место действия.',
      example:
        'Луна в 11-м часто связывает чувства с друзьями, группами и мечтами; во 2-м — с деньгами и самооценкой.',
      summary: 'Дом — это там, где чаще разворачивается история планеты.',
    },
    {
      id: 'aspects',
      title: 'Аспекты',
      definition:
        'Аспекты — углы между планетами; они показывают, как две планетарные темы «разговаривают» в вашей карте.',
      explanation:
        'Некоторые углы ощущаются легко и плавно, другие — напряжённо и мотивирующе. Аспекты не делают вас «хорошим» или «плохим»; они показывают химию между частями вас. Это про внутренние паттерны, а не предсказание событий.',
      example:
        'Тесный аспект Меркурия и Сатурна может смешивать вдумчивость и серьёзность; Меркурий и Юпитер — большие идеи и любопытство.',
      summary: 'Аспекты описывают связи между планетарными темами.',
      aspectTypes: {
        conjunction:
          'Планеты рядом — темы сливаются и действуют как один сильный акцент.',
        trine:
          'Плавный угол 120° — дар и лёгкость; может даваться естественно, но важно осознанность.',
        square:
          'Напряжённый угол 90° — трение, из которого может вырасти навык, если с ним работать.',
        opposition:
          'Планеты напротив друг друга — две стороны, которые нужно балансировать.',
      },
    },
    {
      id: 'transits',
      title: 'Транзиты',
      definition:
        'Транзиты — это текущие положения планет на небе по сравнению с вашей натальной картой.',
      explanation:
        'Когда планеты движутся, они на время образуют углы к вашим натальным планетам и точкам. Это может подсвечивать темы на время — как сезон фокуса, а не приговор жизни. Здесь речь о времени и рефлексии, а не о гадании.',
      example:
        'Когда транзитный Сатурн касается натального Солнца, можно почувствовать запрос к структуре и ответственности — не из-за «проклятия», а потому что такое сочетание усиливает зрелость.',
      summary: 'Транзиты — движущееся «небо» на фоне вашей постоянной карты рождения.',
    },
    {
      id: 'natalChart',
      title: 'Натальная карта',
      definition:
        'Натальная карта — снимок неба в момент вашего рождения: положения планет, знаки, дома и аспекты на круге.',
      explanation:
        'Это карта символических паттернов, а не приговор, кем вы должны быть. Её используют, чтобы заметить сильные стороны, напряжения и зоны роста — как набросок личности с «астрономической» стороны, открытый вашему опыту.',
      example:
        'На карте может быть акцент в одном доме или скопление планет в одном знаке — это отправные точки для самопознания.',
      summary: 'Натальная карта — личная карта неба для размышлений, а не предсказаний.',
    },
  ],
};

const HY: AstrologyBasicsPayload = {
  concepts: [
    {
      id: 'zodiacSigns',
      title: 'Զոդիակի նշաններ',
      definition:
        'Տասներկու նշանները խորհրդանշական էներգիայի ոճեր են՝ կարծես տասներկու «համ» որով երկինքը ներկայացնում է, թե ինչպես են արտահայտվում մոլորակները։',
      explanation:
        'Դրանք չեն որոշում ձեր ճակատագիրը։ Դրանք նկարագրում են թենդենցիաներ, թե ինչպես կարող եք գործել, զգալ կամ աճել, երբ մոլորակը անցնում է տվյալ նշանով։ Մտածեք դրանց մասին որպես տրամադրություն կամ դիմակ՝ Օվենը՝ ուղղակի, Կշիռները՝ հավասարակշռություն, Ձկներ՝ երազկոտ՝ յուրաքանչյուր նշան ունի իր տոնը։',
      example:
        'Երբ ասում են «Արևով Առյուծ եմ», նկատի ունեն, որ ծննդյան պահին Արևը Առյուծում էր՝ դա ընդգծում է ջերմ, արտահայտիչ ոճը, թե ինչպես է երևում ձեր կորիզը։',
      summary: 'Նշանները նկարագրում են ոճ և համ, ոչ թե կոշտ ճակատագիր։',
    },
    {
      id: 'planets',
      title: 'Մոլորակներ',
      definition:
        'Աստղաբանության մեջ մոլորակները ներկայացնում են կյանքի և անհատականության տարբեր հատվածներ՝ կարծես ներքին «բաժիններ», որոնք միասին աշխատում են։',
      explanation:
        'Արևը՝ ձեր «ես»-ի զգացումը, Լուսինը՝ կարիքներ և զգացմունքներ, Մերկուրին՝ մտքեր և խոսք, Վեներան՝ սեր և արժեքներ, Մարսը՝ շարժ դեպի նպատակ, Յուպիտերը՝ ընդլայնում, Սատուրնը՝ սահմաններ, արտաքին մոլորակները՝ սերնդային և ավելի խորը թեմաներ։ Քարտը միավորում է այս ձայները։',
      example:
        'Ուժեղ Մարսը կարող է երևալ որպես արագ նախաձեռնություն, արտահայտված Վեներան՝ որպես հոգատարություն հարաբերությունների ներդաշնկության նկատմամբ։',
      summary: 'Յուրաքանչյուր մոլորակ պատասխանում է «իսկ իմ որ մասն է սա» հարցին։',
    },
    {
      id: 'houses',
      title: 'Տները',
      definition:
        'Տները քարտի տասներկու հատվածներն են, որոնք ցույց են տալիս կյանքի ոլորտները՝ որտեղ են բացվում տուն, աշխատանք, հարաբերություններ և այլն։',
      explanation:
        'Դրանք նույնը չեն, ինչ նշանները։ Նշանը՝ ինչպես, տունը՝ կյանքի որտեղ է հիմնականում բացվում պատմությունը։ 1-ին տունը՝ ինքնարտահայտում, 4-րդը՝ տուն և արմատներ, 7-րդը՝ զույգություն, 10-րդը՝ կարիերա և հանրային դեր և այլն։',
      example:
        'Մոլորակները 10-րդ տանը հաճախ կապվում են կարիերայի կամ համբավի հետ, 4-րդ տանը՝ ընտանիքի և անձնական կյանքի հետ։',
      summary: 'Տները ցույց են տալիս կյանքի դաշտերը, նշանները՝ ինչպես եք դրանք ապրում։',
    },
    {
      id: 'planetInSign',
      title: 'Մոլորակը նշանում',
      definition:
        'Երբ մոլորակը նշանի մեջ է, նրա թեման արտահայտվում է այդ նշանի ոճով։',
      explanation:
        'Նույն մոլորակը, այլ նշան՝ նույն հիմնական թեմա, այլ համ։ Մերկուրին Երկվորյակներում կարող է սիրել արագ գաղափարներ, Ցուլում՝ հանգիստ, գործնական մտածողություն։ Նշանը փոխում է տոնը, ոչ թե մոլորակի իմաստը։',
      example:
        'Մարսը Օվենում գործում է արագ և ուղղակի, Խեցգետնում՝ խնամքի, պաշտպանության կամ տրամադրության միջով։',
      summary: 'Նշանը «ինչպես»-ն է մոլորակի «ինչ»-ի շուրջ։',
    },
    {
      id: 'planetInHouse',
      title: 'Մոլորակը տան մեջ',
      definition:
        'Մոլորակը տան մեջ ցույց է տալիս, թե կյանքի որ ոլորտում է նրա էներգիան ամենից հստակ երևում։',
      explanation:
        'Տները բեմն են՝ Վեներան 5-րդ տանը կարող է ընդգծել ստեղծագործություն և ռոմանտիկա, 6-րդում՝ սերը առօրյա, ծառայություն կամ առողջության սովորությունների միջով։ Մոլորակի իմաստը նույնն է, տունը՝ բեմադրությունը։',
      example:
        'Լուսինը 11-րդ տանը հաճախ կապում է զգացմունքները ընկերների, խմբերի և երազանքների հետ, 2-րդում՝ գումարի և ինքնագնահատականի հետ։',
      summary: 'Տունը այնտեղ է, որտեղ մոլորակի պատմությունը հիմնականում բացվում է։',
    },
    {
      id: 'aspects',
      title: 'Ասպեկտներ',
      definition:
        'Ասպեկտները մոլորակների միջև անկյուններ են՝ նկարագրում են, թե ինչպես են երկու թեման «խոսում» ձեր քարտում։',
      explanation:
        'Որոշ անկյուններ հեշտ և հոսքային են, այլք՝ լարված ու շարժիչ։ Ասպեկտները ձեզ «լավ» կամ «վատ» չեն դասում՝ դրանք ցույց են տալիս քիմիա ձեր ներսի մասերի միջև։ Սա ներքին օրինաչափությունների մասին է, ոչ թե ապագայի կանխագուշակման։',
      example:
        'Մերկուրիի և Սատուրնի մոտ ասպեկտը կարող է միավորել խորը մտածողություն և լրջություն, Մերկուրին և Յուպիտերը՝ մեծ գաղափարներ և հետաքրքրություն։',
      summary: 'Ասպեկտները քարտեզագրում են մոլորակային թեմաների կապերը։',
      aspectTypes: {
        conjunction:
          'Մոլորակները մոտ են՝ թեմաները սերտվում են և գործում որպես մեկ ուժեղ կենտրոն։',
        trine:
          'Հոսքային 120° անկյուն՝ տաղանդ և հեշտություն, բայց դեռ պետք է իրազեկություն։',
        square:
          'Լարված 90° անկյուն՝ տրաձայնություն, որից կարող է աճել հմտություն, եթե աշխատեք դրա հետ։',
        opposition:
          'Մոլորակները դիմաց դիմի՝ երկու կողմ, որոնք պետք է հավասարակշռել։',
      },
    },
    {
      id: 'transits',
      title: 'Տրանզիտներ',
      definition:
        'Տրանզիտները երկնքում մոլորակների ներկա դիրքներն են՝ համեմատած ձեր ծննդյան քարտի հետ։',
      explanation:
        'Երբ մոլորակները շարժվում են, ժամանակավոր անկյուններ են առաջանում ձեր նատալ մոլորակների և կետերի հետ։ Դա կարող է որոշ ժամանակ ընդգծել թեմաներ՝ կարծես կենտրոնացման սեզոն, ոչ թե կյանքի վերջնական դատավճիռ։ Այստեղ ժամանակի և մտորումների մասին է, ոչ թե գուշակության։',
      example:
        'Երբ տրանզիտ Սատուրնը հպում է նատալ Արևին, կարող եք զգալ կառուցվածքի և պատասխանատվության խնդրանք՝ ոչ թե «անեծքի» պատճառով, այլ որովհետև այդ զույգը ուժեղացնում է հասունություն։',
      summary: 'Տրանզիտները շարժվող երկնքի «կլիման» են ձեր հաստատ քարտի նկատմամբ։',
    },
    {
      id: 'natalChart',
      title: 'Նատալ քարտ',
      definition:
        'Նատալ քարտը ձեր ծննդյան պահի երկնքի նկարն է՝ մոլորակների դիրքեր, նշաններ, տներ և ասպեկտներ շրջանի վրա։',
      explanation:
        'Դա խորհրդանշական օրինաչափությունների քարտեզ է, ոչ թե նախադասություն, թե ով պետք է լինեք։ Այն օգտագործում են ուժեղ կողմերը, լարումները և աճի եզրերը նկատելու համար՝ կարծես անհատականության էսքիզ աստղագիտական տեսանկյունից, բաց ձեր փորձի համար։',
      example:
        'Քարտում կարող է ուժեղ շեշտ լինել մեկ տան վրա կամ մոլորակների կուտակում մեկ նշանում՝ դրանք ինքնաճանաչման մեկնարկային կետեր են։',
      summary: 'Ձեր նատալ քարտը անձնական երկնքի քարտեզ է մտորումների համար, ոչ թե կանխագուշակման։',
    },
  ],
};

export const ASTROLOGY_BASICS_STATIC: Record<AstrologyBasicsLang, AstrologyBasicsPayload> = {
  en: EN,
  ru: RU,
  hy: HY,
};

export function resolveAstrologyBasicsLang(raw: string | undefined): AstrologyBasicsLang {
  const s = (raw ?? 'en').trim().toLowerCase();
  if (s === 'ru' || s === 'rus' || s.startsWith('ru-')) return 'ru';
  if (s === 'hy' || s === 'hye' || s === 'am' || s.startsWith('hy-')) return 'hy';
  return 'en';
}
