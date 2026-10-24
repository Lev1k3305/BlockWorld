/**
 * Конфигурация дня рождения и персонажей
 * Централизованная локализация для Алижана и Дильназ.
 */

export interface HeroConfig {
  id: 'sister' | 'brother';
  name: string;
  age: number;
  role: string;
  badge: string;
  outfitColor: string;
  accentColor: string;
  trimColor: string;
  favoriteThings: string[];
  description: string;
}

export interface BirthdayGiftConfig {
  id: 'sister_gift' | 'brother_gift';
  recipientName: string;
  recipientAge: number;
  itemName: string;
  itemSubtitle: string;
  icon: 'crystal_blade' | 'chess_knight';
  description: string;
  personalMessage: string;
  lore: string;
}

export interface BirthdayConfig {
  gameTitle: string;
  subtitle: string;
  birthdayLabel: string;
  shortDescription: string;
  olderBrotherName: string;
  audioFilePath: string;
  heroes: {
    sister: HeroConfig;
    brother: HeroConfig;
  };
  gifts: {
    sister: BirthdayGiftConfig;
    brother: BirthdayGiftConfig;
  };
  questItems: {
    totalCrystals: number;
    totalStars: number;
  };
  messages: {
    restorationTitle: string;
    restorationSubtitle: string;
    finalHeading: string;
    finalSubheading: string;
    finalHeartMessage: string;
  };
}

export const birthdayConfig: BirthdayConfig = {
  gameTitle: "BLOCKWORLD: Два героя и Сердце острова",
  subtitle: "Особенное приключение для Алижана и Дильназ",
  birthdayLabel: "Особенное приключение для Алижана и Дильназ",
  shortDescription: "Исследуйте волшебный остров, собирайте кристаллы, находите секреты и откройте последний подарок!",
  olderBrotherName: "Твой старший брат",
  audioFilePath: "/audio/birthday-message.mp3",
  
  heroes: {
    sister: {
      id: "sister",
      name: "Дильназ",
      age: 14,
      role: "Хранительница порталов",
      badge: "Уровень 14",
      outfitColor: "#ec4899", // Розово-малиновый
      accentColor: "#a855f7", // Фиолетовый
      trimColor: "#06b6d4",   // Бирюзовый
      favoriteThings: ["Minecraft", "Roblox", "Магические порталы", "Приключения"],
      description: "Отважная исследовательница и хранительница тайных врат. Её любопытство способно открыть двери в любые неизведанные миры!"
    },
    brother: {
      id: "brother",
      name: "Алижан",
      age: 16,
      role: "Мастер тактики",
      badge: "Уровень 16",
      outfitColor: "#2563eb", // Благородный синий
      accentColor: "#f59e0b", // Золотой
      trimColor: "#1e293b",   // Темно-грифельный
      favoriteThings: ["Minecraft", "Шахматы", "Стратегия", "Воксельное строительство"],
      description: "Острый ум, расчётливый строитель и бесстрашный защитник. Всегда просчитывает игру на несколько ходов вперёд!"
    }
  },

  gifts: {
    sister: {
      id: "sister_gift",
      recipientName: "Дильназ",
      recipientAge: 14,
      itemName: "Астральный Звёздный Клинок и Компас Миров",
      itemSubtitle: "Выкован в сердце Парящего Архипелага",
      icon: "crystal_blade",
      description: "Инкрустированный небесными кристаллами клинок и зачарованный компас, который всегда указывает путь к самым удивительным открытиям и защищает от любых невзгод.",
      personalMessage: "Дорогая Дильназ! Поздравляю тебя с 14-летием! Ты невероятно добрая, умная, яркая и талантливая сестра. Пусть в твоей жизни будет столько же волшебства, радости и вдохновения, сколько в любимых мирах Minecraft и Roblox. Никогда не переставай мечтать, исследовать мир и сиять своей тёплой улыбкой. Я всегда рядом и горжусь тобой! С днём рождения! ❤️",
      lore: "Легенда гласит, что свет этого кристалла рассеивает любые сомнения и ведёт к заветной мечте."
    },
    brother: {
      id: "brother_gift",
      recipientName: "Алижан",
      recipientAge: 16,
      itemName: "Золотой Воксельный Конь Стратегии",
      itemSubtitle: "Легендарная реликвия гроссмейстера",
      icon: "chess_knight",
      description: "Величественная статуэтка шахматного коня, отлитая из чистого звёздного золота и лазурита. Символ тактической мудрости, решимости и побед.",
      personalMessage: "Алижан, брат, с 16-летием тебя! 16 лет — это классный, важный возраст. Ты растёшь сильным, рассудительным и надёжным парнем. И в шахматах, и в жизни пусть каждый твой шаг будет выверенным и ведёт тебя к большим победам. Помни, что конь всегда умеет перепрыгивать препятствия, которые кажутся непреодолимыми для других. Всегда верь в свои силы. С днём рождения! ❤️",
      lore: "В шахматах и в жизни конь ходит неожиданно и смело, открывая путь к победе даже в самых сложных позициях."
    }
  },

  questItems: {
    totalCrystals: 3,
    totalStars: 5
  },

  messages: {
    restorationTitle: "Сердце острова пробуждено!",
    restorationSubtitle: "Древний свет засиял... Открылся портал в секретную праздничную комнату!",
    finalHeading: "Ваше приключение на острове завершилось...",
    finalSubheading: "...но впереди вас ждёт ещё множество великих жизненных приключений!",
    finalHeartMessage: "С днём рождения! ❤️"
  }
};
