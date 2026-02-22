export const products = [
  // ВЗУТТЯ (6 товарів)
  { id: 1, name: "Nike Alphafly 3", category: "Взуття", price: 9500, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600" },
  { id: 2, name: "Adidas Ultraboost", category: "Взуття", price: 5200, image: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?q=80&w=600" },
  { id: 3, name: "Asics Gel-Kayano", category: "Взуття", price: 4800, image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600" },
  { id: 4, name: "Nike Air Max Pro", category: "Взуття", price: 4100, image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=600" },
  { id: 5, name: "Reebok Nano X", category: "Взуття", price: 3600, image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600" },
  { id: 6, name: "Puma RS-X Sport", category: "Взуття", price: 3200, image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=600" },

  // ОДЯГ (4 товари)
  { id: 7, name: "Худі Nike Tech Fleece", category: "Одяг", price: 3500, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600" },
  { id: 8, name: "Спортивні штани Puma", category: "Одяг", price: 1800, image: "https://sportano.ua/img/986c30c27a3d26a3ee16c136f92f4ff5/1/9/196148134162_01-jpg/cholovichi-trenuval-ni-shtani-nike-therma-fit-open-hem-black-black-white-1834802.jpg" },
  { id: 9, name: "Футболка Under Armour", category: "Одяг", price: 950, image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=600" },
  { id: 10, name: "Куртка для бігу Reebok", category: "Одяг", price: 2800, image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=600" },

  // ІНВЕНТАР (4 товари)
  { id: 11, name: "М'яч Adidas Al Rihla", category: "Інвентар", price: 1200, image: "https://sportano.ua/img/986c30c27a3d26a3ee16c136f92f4ff5/4/0/4062075229775_40-jpg/m-jach-futbol-nij-erima-hybrid-match-silver-fiery-coral-rozmir-5-1504825.jpg" },
  { id: 12, name: "Килимок для йоги PRO", category: "Інвентар", price: 1450, image: "https://sportano.ua/img/986c30c27a3d26a3ee16c136f92f4ff5/8/8/887791761811_20-jpg/kilimok-dlja-jogi-nike-yoga-reversible-4-mm-anthracite-medium-grey-1852107.jpg" },
  { id: 13, name: "Скакалка швидкісна", category: "Інвентар", price: 450, image: "https://sportano.ua/img/986c30c27a3d26a3ee16c136f92f4ff5/5/9/5902701513528_20-jpg/skakalka-trenuval-na-thorn-fit-turbo-2-0-speed-rope-chervona-513528-370815.jpg" },
  { id: 14, name: "Боксерські рукавиці Everlast", category: "Інвентар", price: 2100, image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=600" },

  // ТРЕНАЖЕРИ (3 товари)
  { id: 15, name: "Гантелі розбірні (30кг)", category: "Тренажери", price: 2800, image: "https://sportano.ua/img/986c30c27a3d26a3ee16c136f92f4ff5/5/9/5904823023596_20-jpg/gantelja-regul-ovana-xtrexo-24-kg-evo-chornij-1748607.jpg" },
  { id: 16, name: "Турнік 3-в-1", category: "Тренажери", price: 1950, image: "https://interatletika.com.ua/upload/resize_cache/iblock/99f/1000_1000_0fa552c3cfce9ae4b21d694dd2f95d240/turnik_nastennyy_interatletika_st057.jpg" },
  { id: 17, name: "Гіря сталева 16кг", category: "Тренажери", price: 1600, image: "https://sportano.ua/img/986c30c27a3d26a3ee16c136f92f4ff5/5/9/5904823029710_20-jpg/girja-chavunna-xtrexo-8kg-chornij-1666187.jpg" },

  // АКСЕСУАРИ (3 товари)
  { id: 18, name: "Шейкер 700мл", category: "Аксесуари", price: 320, image: "https://bodylife.ua/image/cache/catalog/import_yml/116/838/887/2/4066772484_shejker-optimum-nutrition-600x600.jpg" },
  { id: 19, name: "Фітнес-трекер Sport V8", category: "Аксесуари", price: 1400, image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?q=80&w=600" },
  { id: 20, name: "Сумка для залу GymBag", category: "Аксесуари", price: 1850, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600" },
// --- НОВА ПАРТІЯ ТОВАРІВ ---
  
  { id: 21, name: "Кросівки New Balance 574", mainCategory: "Спортивний одяг", category: "Взуття", price: 4500, image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=500" },
  { id: 22, name: "Штангетки Adidas Powerlift", mainCategory: "Спортивний одяг", category: "Взуття", price: 5800, image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=500" },
  
  // СПОРТИВНИЙ ОДЯГ -> ОДЯГ
  { id: 23, name: "Компресійна футболка Under Armour", mainCategory: "Спортивний одяг", category: "Одяг", price: 1200, image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500" },
  { id: 24, name: "Спортивний топ Nike Pro", mainCategory: "Спортивний одяг", category: "Одяг", price: 1100, image: "https://images.unsplash.com/photo-1608228079968-c7681eaef81a?w=500" },
  { id: 25, name: "Шорти для бігу Asics", mainCategory: "Спортивний одяг", category: "Одяг", price: 950, image: "https://images.unsplash.com/photo-1591557304165-8ee6eb154d89?w=500" },
  
  // СПОРТИВНИЙ ОДЯГ -> АКСЕСУАРИ
  { id: 26, name: "Спортивна сумка Puma Challenger", mainCategory: "Спортивний одяг", category: "Аксесуари", price: 1400, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500" },
  { id: 27, name: "Кепка Nike Sportswear", mainCategory: "Спортивний одяг", category: "Аксесуари", price: 750, image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500" },
  { id: 28, name: "Пляшка для води BlenderBottle 0.8л", mainCategory: "Спортивний одяг", category: "Аксесуари", price: 450, image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500" },
  
  // ТРЕНАЖЕРИ -> КАРДІО
  { id: 29, name: "Бігова доріжка FitLogic", mainCategory: "Тренажери", category: "Кардіо", price: 18500, image: "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500" },
  { id: 30, name: "Орбітрек Vigor Pro", mainCategory: "Тренажери", category: "Кардіо", price: 14200, image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500" },
  { id: 31, name: "Велотренажер Gymtek", mainCategory: "Тренажери", category: "Кардіо", price: 8900, image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=500" },
  
  // ТРЕНАЖЕРИ -> СИЛОВІ
  { id: 32, name: "Гантелі набірні (2х15 кг)", mainCategory: "Тренажери", category: "Силові", price: 2100, image: "https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=500" },
  { id: 33, name: "Штанга олімпійська 100 кг", mainCategory: "Тренажери", category: "Силові", price: 7500, image: "https://images.unsplash.com/photo-1534438097544-e53591f42dcb?w=500" },
  { id: 34, name: "Гиря чавунна 24 кг", mainCategory: "Тренажери", category: "Силові", price: 1800, image: "https://images.unsplash.com/photo-1601288496920-b6154fe3626a?w=500" },
  
  // ТРЕНАЖЕРИ -> ІНВЕНТАР
  { id: 35, name: "Набір фітнес-резинок (5 шт)", mainCategory: "Тренажери", category: "Інвентар", price: 350, image: "https://images.unsplash.com/photo-1598266663412-7f79026bf1ea?w=500" },
  { id: 36, name: "Колесо для преса", mainCategory: "Тренажери", category: "Інвентар", price: 400, image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=500" },
  { id: 37, name: "Еспандер трубчастий з ручками", mainCategory: "Тренажери", category: "Інвентар", price: 550, image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500" },
  { id: 38, name: "Масажний валик (Foam Roller)", mainCategory: "Тренажери", category: "Інвентар", price: 600, image: "https://images.unsplash.com/photo-1600881333168-2ef49b341f30?w=500" },

  // ДОБАВКИ -> ПРОТЕЇН
  { id: 39, name: "100% Whey Gold Standard 2.27 кг", mainCategory: "Добавки", category: "Протеїн", price: 2800, image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500" },
  { id: 40, name: "Impact Whey Protein MyProtein 1 кг", mainCategory: "Добавки", category: "Протеїн", price: 1100, image: "https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=500" },
  { id: 41, name: "Ізолят Dymatize ISO100 1.4 кг", mainCategory: "Добавки", category: "Протеїн", price: 3200, image: "https://images.unsplash.com/photo-1550572017-edb91b9787ff?w=500" },

  // ДОБАВКИ -> КРЕАТИН
  { id: 42, name: "Creatine Monohydrate BioTech 500г", mainCategory: "Добавки", category: "Креатин", price: 650, image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500" },
  { id: 43, name: "Creatine Powder Optimum Nutrition", mainCategory: "Добавки", category: "Креатин", price: 850, image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500" },

  // ДОБАВКИ -> ВІТАМІНИ
  { id: 44, name: "Opti-Men 150 таблеток", mainCategory: "Добавки", category: "Вітаміни", price: 1450, image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500" },
  { id: 45, name: "Animal Pak Universal Nutrition", mainCategory: "Добавки", category: "Вітаміни", price: 1800, image: "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=500" },
  { id: 46, name: "Omega-3 NOW Foods 200 капсул", mainCategory: "Добавки", category: "Вітаміни", price: 750, image: "https://images.unsplash.com/photo-1616671285401-277d1ca42ab4?w=500" }
];