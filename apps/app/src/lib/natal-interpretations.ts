/**
 * Natal chart interpretations by planet/sign, house/sign, aspect, planet/house.
 * Keys: planet_sign (e.g. sun_pisces), house_sign (e.g. house_1_scorpio),
 * aspect_planetA_planetB_type (e.g. aspect_venus_neptune_conjunction), planet_house (e.g. sun_3).
 */

type Locale = 'en' | 'ru' | 'hy';

const interpretations: Record<string, Record<Locale, string>> = {
  sun_pisces: {
    en: 'Soft, sensitive, compassionate. Highly receptive to others\' problems and emotions, they experience them as their own and strive to understand, support, and help. Deep need for love, tendency to idealize partners. Creative inclinations in arts, music, literature. May escape into fantasy; need grounding and healthy boundaries.',
    ru: 'Мягкие, чувствительные, сострадательные люди. Они крайне восприимчивы к чужим проблемам и эмоциям, переживают их как свои, стремятся понять, поддержать, помочь. Большая потребность в любви. Склонны идеализировать партнёра. Способности в области искусств.',
    hy: 'Մեղմ, զգայուն, կարեկցող մարդիկ: Մեծ փափագ սիրո. Հակված են իդեալացնելու զուգընկերին: Ստեղծագործական հակվածություններ արվեստում:',
  },
  moon_taurus: {
    en: 'Emotional stability, need for comfort and security. Practical in feelings, loyal, patient. Love for beauty and sensual pleasures. Can be stubborn when feeling threatened. Values material and emotional security.',
    ru: 'Эмоциональная стабильность, потребность в комфорте и безопасности. Практичность в чувствах, верность, терпение. Любовь к красоте и sensual наслаждениям.',
    hy: 'Էմոցիոնալ կայունություն, կարիք հարմարավետության և անվտանգության: Հավատարմություն, համբերատարություն:',
  },
  mercury_pisces: {
    en: 'Intuitive, imaginative thinking. Strong connection between subconscious and conscious mind. May excel in creative writing, poetry, music. Can be dreamy or vague; benefits from structure.',
    ru: 'Интуитивное, образное мышление. Связь подсознания и сознания. Талант в творческом письме, поэзии, музыке.',
    hy: 'Ինтуիտիվ, երևակայական մտածողություն: Ստեղծագործական գրելու, պոեզիայի, երաժշտության տաղանդ:',
  },
  venus_aquarius: {
    en: 'Unconventional approach to love and relationships. Values friendship and intellectual connection. May need freedom and independence in partnerships. Attracted to unique, original people.',
    ru: 'Неконвенциональный подход к любви и отношениям. Ценит дружбу и интеллектуальную связь. Нуждается в свободе в партнёрстве.',
    hy: 'Ոչ ավանդական մոտեցում սիրուն: Արժևորում է բարեկամությունը: Կարիք ազատության:',
  },
  mars_capricorn: {
    en: 'Ambition, discipline, strategic action. Patient and persistent. Achieves goals through hard work. Strong sense of responsibility. Can be authoritative or controlling.',
    ru: 'Амбициозность, дисциплина, стратегические действия. Терпение и настойчивость. Достигает целей упорным трудом.',
    hy: 'Հակվածություն, կարգապահություն: Համբերատար և համառ: Հասնում է նպատակներին աշխատանքով:',
  },
  jupiter_leo: {
    en: 'Generous, warm, expansive expression. Love of performance and recognition. Creative confidence. May be overly dramatic or proud. Natural teachers and entertainers.',
    ru: 'Щедрость, тепло, экспансивность. Любовь к выступлениям и признанию. Уверенность в творчестве.',
    hy: 'Մեծ generous, ջերմություն: Սեր ներկայացումների և ճանաչման:',
  },
  saturn_gemini: {
    en: 'Serious, disciplined approach to communication and learning. May have felt restricted in early education. Develops through structured study and careful thinking. Can be overly cautious in expression.',
    ru: 'Серьёзный, дисциплинированный подход к общению и обучению. Развивается через структурированную учёбу.',
    hy: 'Լուրջ, կարգապահ մոտեցում հաղորդակցության:',
  },
  uranus_aquarius: {
    en: 'Innovative, rebellious, humanitarian. Strong need for freedom and originality. May break with tradition. Forward-thinking, often ahead of their time.',
    ru: 'Инновационный, бунтарский, гуманитарный. Сильная потребность в свободе и оригинальности.',
    hy: 'Նորարար, ապստամբական, հումանիտար: Մեծ կարիք ազատության:',
  },
  neptune_aquarius: {
    en: 'Idealistic, visionary, drawn to collective ideals. Blends mysticism with humanitarian goals. May have prophetic or intuitive gifts. Needs to ground idealism in practice.',
    ru: 'Идеалистичный, visionary, притягательность к коллективным идеалам. Смешивает мистику с гуманитарными целями.',
    hy: 'Իդեալիստ, տեսանելի: Հակված է կոլեկտիվ իդեալների:',
  },
  pluto_sagittarius: {
    en: 'Deep transformational energy through philosophy, travel, higher learning. Intensity in seeking truth. May experience profound shifts through education or foreign experiences.',
    ru: 'Глубинная трансформационная энергия через философию, путешествия, высшее образование.',
    hy: 'Խորը վերափոխիչ էներգիա փիլիսոփայության, ճանապարհորդության, բարձրագույն ուսուցման միջոցով:',
  },
  house_1_scorpio: {
    en: 'Many secrets, hidden or non-public activity. Keen perception of the world. Strong intuition, ability to see through people. Intensity in self-expression.',
    ru: 'Много тайн, скрытая или непубличная деятельность. Обостренное восприятие окружающего мира. Сильная интуиция, позволяющая видеть людей насквозь.',
    hy: 'Շատ գաղտնիքներ, թաքնված գործունեություն: Սրացած ընկալում: Ուժեղ ինտուիցիա:',
  },
  house_3_aquarius: {
    en: 'Unconventional thinking, original ideas. Interest in technology, science, groups. Communication through innovation. May have unusual siblings or neighbors.',
    ru: 'Неконвенциональное мышление, оригинальные идеи. Интерес к технологиям, науке, группам.',
    hy: 'Ոչ ավանդական մտածողություն, օրիգինալ գաղափարներ:',
  },
  house_6_taurus: {
    en: 'Practical approach to health and work. Need for comfort in daily routine. May work with beauty, food, or material values. Steady, methodical work habits.',
    ru: 'Практичный подход к здоровью и работе. Потребность в комфорте в повседневной жизни.',
    hy: 'Գործնական մոտեցում առողջության և աշխատանքի:',
  },
  house_7_taurus: {
    en: 'Stable, reliable partnerships. Attraction to beauty and material security in relationships. May seek comfort and loyalty in marriage. Values lasting commitments.',
    ru: 'Стабильные, надёжные партнёрства. Притяжение к красоте и материальной безопасности в отношениях.',
    hy: 'Կայուն, հուսալի գործընկերություններ:',
  },
  sun_house_3: {
    en: 'Great curiosity, striving for new knowledge, activity related to information exchange. Communication and connections with close surroundings play an increased role. Love of travel, small trips.',
    ru: 'Большая любознательность, стремление к получению новых знаний, деятельность связанная с обменом информацией. Повышенное значение играет общение, установление связей с близким окружением. Любовь к передвижениям, небольшим поездкам.',
    hy: 'Մեծ curiosity, ձգտում նոր գիտելիքների: Հաղորդակցություն և կապեր մոտիկ շրջանի հետ:',
  },
  moon_house_6: {
    en: 'Emotional investment in daily work and health. Need for routine and practical self-care. May work in caregiving, nutrition, or wellness. Sensitivity to work environment.',
    ru: 'Эмоциональная вовлечённость в повседневную работу и здоровье. Потребность в рутине и практическом самообслуживании.',
    hy: 'Էմոցիոնալ ներդրում ամենօրյա աշխատանքում և առողջության մեջ:',
  },
  pluto_house_1: {
    en: 'Intense personality, transformative presence. Strong will and capacity for rebirth. May experience major identity shifts. Others may perceive intensity or power.',
    ru: 'Интенсивная личность, преобразующее присутствие. Сильная воля и способность к перерождению.',
    hy: 'Ինտենսիվ անհատականություն, վերափոխիչ ներկայություն:',
  },
  aspect_venus_neptune_conjunction: {
    en: 'Ability to experience deep feelings. Love of creativity, poetry, music. Developed imagination and intuition. Negative: tendency to "go with the flow" without boundaries.',
    ru: 'Способность испытывать глубокие чувства. Любят творчество, поэзию, музыку. Имеют развитое воображение, интуицию. Негативными проявлениями может быть склонность "плыть по течению".',
    hy: 'Կարողություն խորը զգացումներ ապրելու: Սեր ստեղծագործության, պոեզիայի, երաժշտության նկատմամբ:',
  },
  aspect_sun_moon_sextile: {
    en: 'Harmony between conscious and unconscious. Ease in expressing emotions. Good relationship with parents. Natural emotional balance and self-acceptance.',
    ru: 'Гармония между сознательным и бессознательным. Лёгкость в выражении эмоций. Хорошие отношения с родителями.',
    hy: 'Հարմոնիա գիտակցական և անգիտակցականի միջև:',
  },
  aspect_mercury_mars_sextile: {
    en: 'Quick mind combined with action. Good at debates, writing, speaking under pressure. Energetic communication. Mental agility.',
    ru: 'Быстрый ум в сочетании с действием. Хорошо в дебатах, письме, говорении под давлением.',
    hy: 'Արագ միտք զուգակցված գործողության հետ:',
  },
  aspect_mars_uranus_sextile: {
    en: 'Innovative action, sudden initiatives. Courage to break with convention. Energetic and unpredictable. May excel in technology or sports.',
    ru: 'Инновационное действие, внезапные инициативы. Смелость порвать с условностями.',
    hy: 'Նորարարական գործողություն, հանկարծակի նախաձեռնություններ:',
  },
  aspect_moon_uranus_square: {
    en: 'Emotional restlessness, need for freedom in feelings. Sudden mood shifts. May have unusual family or domestic situation. Tension between security and change.',
    ru: 'Эмоциональное беспокойство, потребность в свободе в чувствах. Внезапные перепады настроения. Напряжение между безопасностью и изменениями.',
    hy: 'Էմոցիոնալ անհանգստություն, կարիք ազատության զգացումներում:',
  },
  aspect_saturn_uranus_trine: {
    en: 'Balance between tradition and innovation. Ability to integrate discipline with originality. Stable yet progressive approach. Good for reform and structure.',
    ru: 'Баланс между традицией и инновацией. Способность сочетать дисциплину с оригинальностью.',
    hy: 'Հավասարակշռություն ավանդույթի և նորարարության միջև:',
  },
  aspect_saturn_pluto_opposition: {
    en: 'Tension between structure and transformation. May face power struggles, authority issues. Deep need to reconcile control with change. Can lead to major life restructuring.',
    ru: 'Напряжение между структурой и трансформацией. Возможны конфликты власти, проблемы с авторитетом. Глубокая потребность примирить контроль с изменениями.',
    hy: 'Լարվածություն կառուցվածքի և վերափոխման միջև:',
  },
};

export function getPlanetInSignInterpretation(
  planet: string,
  sign: string,
  locale: Locale
): string {
  const key = `${planet.toLowerCase()}_${sign.toLowerCase()}`;
  const rec = interpretations[key];
  return rec?.[locale] ?? rec?.en ?? '';
}

export function getHouseInSignInterpretation(
  house: number,
  sign: string,
  locale: Locale
): string {
  const key = `house_${house}_${sign.toLowerCase()}`;
  const rec = interpretations[key];
  return rec?.[locale] ?? rec?.en ?? '';
}

export function getPlanetInHouseInterpretation(
  planet: string,
  house: number,
  locale: Locale
): string {
  const key = `${planet.toLowerCase()}_house_${house}`;
  const rec = interpretations[key];
  return rec?.[locale] ?? rec?.en ?? '';
}

export function getAspectInterpretation(
  planetA: string,
  planetB: string,
  aspect: string,
  locale: Locale
): string {
  const key = `aspect_${planetA.toLowerCase()}_${planetB.toLowerCase()}_${aspect.toLowerCase()}`.replace(
    /\s+/g,
    '_'
  );
  const rec = interpretations[key];
  return rec?.[locale] ?? rec?.en ?? '';
}
