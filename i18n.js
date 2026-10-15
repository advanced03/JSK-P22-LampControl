;(function () {
  const translations = {
    en: {
      language: 'Language',
      languageName: 'English',
      'app.title': 'JSK-P22 Lamp Control',
      'nav.color': 'Color',
      'nav.effects': 'Effects',
      'nav.music': 'Music',
      'nav.schedule': 'Schedule',
      'nav.settings': 'Settings',
      'settings.title': 'Settings',
      'settings.languageDescription': 'Choose the language used by the application.',
      'settings.trayTitle': 'Keep in tray',
      'settings.trayDescription': 'Closing the window hides the app in the system tray. Use the tray menu to open the app, disconnect from the lamp, or quit.',
      'tray.open': 'Open app',
      'tray.startSync': 'Start sync',
      'tray.stopSync': 'Stop sync',
      'tray.disconnect': 'Disconnect from lamp',
      'tray.connect': 'Open to connect',
      'tray.turnOn': 'Turn lamp on',
      'tray.turnOff': 'Turn lamp off',
      'tray.quit': 'Quit',
      'connection.disconnected': 'Not connected',
      'connection.connect': 'Connect',
      'connection.reconnect': 'Reconnect',
      'connection.disconnect': 'Disconnect',
      'connection.connecting': 'Connecting…',
      'connection.connected': 'Connected to {name}',
      'connection.disconnectedStatus': 'Disconnected',
      'connection.noBluetooth': 'Web Bluetooth is not available in this browser.',
      'connection.bluetoothOff': 'Bluetooth is turned off. Turn it on in Windows Settings and try again.',
      'connection.noDevice': 'No device chosen, or it has no 0xFFF0 service.',
      'connection.failed': 'Could not connect: {message}',
      'connection.writeFailed': 'Write failed: {message}',
      'power.title': 'Power',
      'power.description': "Turn the lamp on or off. Status shows the last command sent; the lamp doesn't report its power state.",
      'power.on': 'On',
      'power.off': 'Off',
      'brightness.title': 'Brightness',
      'brightness.description': 'Lamp output level',
      'color.pick': 'Pick a color',
      'color.wheelLabel': 'Color wheel: drag to choose hue and saturation',
      'color.hexLabel': 'Hex color',
      'color.help': 'Drag on the wheel or type a hex code. The center is white.',
      'effects.title': 'Effects',
      'effects.nowPlaying': 'Now playing',
      'effects.colorStops': 'Picking a color stops the running effect',
      'effects.none': 'none',
      'effects.speed': 'Effect speed',
      'effects.speedDescription': 'How fast the effect runs',
      'effects.search': 'Search effects',
      'effects.categories': 'Effect categories',
      'effects.scrollLeft': 'Scroll categories left',
      'effects.scrollRight': 'Scroll categories right',
      'effects.colors': 'Filter by color',
      'effects.all': 'All',
      'effects.noMatches': 'No effects match.',
      'effects.onlyColor': 'Only {color} effects',
      'effects.multicolor': 'Multicolor',
      'music.title': 'Music',
      'music.sync': 'Music sync',
      'music.description': 'The lamp responds to sound captured by its built-in microphone.',
      'music.unknown': 'Unknown',
      'music.running': 'Running',
      'music.stopped': 'Stopped',
      'music.start': 'Start',
      'music.stop': 'Stop',
      'music.mode': 'Mode',
      'music.modeDescription': 'How the lamp reacts to sound',
      'music.eqEnergetic': 'Energetic',
      'music.eqRhythm': 'Rhythm',
      'music.eqSpectrum': 'Spectrum',
      'music.eqRolling': 'Rolling',
      'music.eqEnergetic2': 'Energetic 2',
      'music.eqRhythm2': 'Rhythm 2',
      'music.eqSpectrum2': 'Spectrum 2',
      'music.eqRolling2': 'Rolling 2',
      'music.sensitivity': 'Sensitivity',
      'music.sensitivityDescription': 'Higher values make the lamp respond to quieter sounds.',
      'music.noMicrophone': 'This model has no microphone.',
      'schedule.title': 'Schedule',
      'schedule.clock': 'Lamp clock',
      'schedule.clockDescription': 'Schedules need the correct time. It is set automatically when you connect.',
      'schedule.setClock': "Set to this PC's time",
      'schedule.readTitle': 'Read from lamp',
      'schedule.readDescription': 'Loads the timers stored on the lamp. This also happens when you connect.',
      'schedule.read': 'Read',
      'schedule.timers': 'Timers',
      'schedule.on': 'Schedule on',
      'schedule.off': 'Schedule off',
      'schedule.enabled': 'Enabled',
      'schedule.repeat': 'Repeat',
      'schedule.everyDay': 'every day',
      'schedule.noDays': 'no days',
      'schedule.days': '{count} days',
      'schedule.oneDay': '{count} day',
      'schedule.keepDay': 'Keep at least one day selected',
      'schedule.connectFirst': 'Connect to the lamp first',
      'schedule.chooseTime': 'Pick a time and at least one day',
      'schedule.sent': 'Sent: {time}, {days}, {state}',
      'schedule.onState': 'on',
      'schedule.offState': 'off',
      'schedule.notSet': 'Not set',
      'schedule.onLamp': 'On lamp: {time}, {days}, {state}',
      'schedule.reading': 'Reading from lamp…',
      'schedule.noReport': 'Lamp did not report a schedule',
      'schedule.readFailed': 'Could not read: {message}',
      'schedule.dayMon': 'Monday',
      'schedule.dayTue': 'Tuesday',
      'schedule.dayWed': 'Wednesday',
      'schedule.dayThu': 'Thursday',
      'schedule.dayFri': 'Friday',
      'schedule.daySat': 'Saturday',
      'schedule.daySun': 'Sunday',
      'schedule.shortMon': 'M',
      'schedule.shortTue': 'T',
      'schedule.shortWed': 'W',
      'schedule.shortThu': 'T',
      'schedule.shortFri': 'F',
      'schedule.shortSat': 'S',
      'schedule.shortSun': 'S',
      'category.special': 'Special',
      'category.jump': 'Jump & strobe',
      'category.fade': 'Fade & transition',
      'category.marquee': 'Marquee',
      'category.race': 'Race & wave',
      'category.flush': 'Flush & curtain',
      'category.water': 'Water',
      'category.flow': 'Flow',
      'category.tail': 'Tail',
      'category.running': 'Running',
      'category.runningReverse': 'Running reverse',
      'category.scenes': 'Scenes',
      'picker.title': 'Choose your lamp',
      'picker.searchingHint': 'Looking for lamps, usually named MELK-.',
      'picker.pickHint': 'Pick your lamp from the list.',
      'picker.rangeHint': 'Make sure the lamp is powered and in range.',
      'picker.cancel': 'Cancel',
      'picker.unnamed': 'Unnamed device',
      'picker.searching': 'Searching for nearby devices…',
      'effectWords': {
        'Auto play': 'Auto play',
        'Magic reverse': 'Magic reverse',
        'Magic': 'Magic',
        'Energy': 'Energy',
        'Jump': 'Jump',
        'Strobe': 'Strobe',
        'Fade': 'Fade',
        'Transition reverse': 'Transition reverse',
        'Transition': 'Transition',
        'Marquee': 'Marquee',
        'Race reverse': 'Race reverse',
        'Race': 'Race',
        'Wave reverse': 'Wave reverse',
        'Wave': 'Wave',
        'Flush close': 'Flush close',
        'Flush open': 'Flush open',
        'Flush reverse': 'Flush reverse',
        'Flush': 'Flush',
        'Curtain close': 'Curtain close',
        'Curtain open': 'Curtain open',
        'Curtain': 'Curtain',
        'Water reverse': 'Water reverse',
        'Water': 'Water',
        'Flow reverse': 'Flow reverse',
        'Flow': 'Flow',
        'Tail reverse': 'Tail reverse',
        'Tail': 'Tail',
        'Running reverse': 'Running reverse',
        'Running': 'Running',
        'Sunrise': 'Sunrise',
        'Sunset': 'Sunset',
        'Birthday': 'Birthday',
        'Candlelight': 'Candlelight',
        'Fireworks': 'Fireworks',
        'Party': 'Party',
        'Destiny': 'Destiny',
        'Starry sky': 'Starry sky',
        'Romantic': 'Romantic',
        'Disco': 'Disco',
        'Rainbow': 'Rainbow',
        'Movie': 'Movie',
        'Christmas': 'Christmas',
        'Flowing': 'Flowing',
        'Sleeping': 'Sleeping',
        'Ocean': 'Ocean',
        'Forest': 'Forest',
        'Reading': 'Reading',
        'Working': 'Working',
        'Dazzle': 'Dazzle',
        'Gentle': 'Gentle',
        'Wedding': 'Wedding',
        'Snow': 'Snow',
        'Fire': 'Fire',
        'Lightning': 'Lightning',
        "Valentine's Day": "Valentine's Day",
        'Halloween': 'Halloween',
        'Warning': 'Warning',
        'multicolor': 'multicolor',
        'six colors': 'six colors',
        'red': 'red',
        'green': 'green',
        'blue': 'blue',
        'yellow': 'yellow',
        'cyan': 'cyan',
        'purple': 'purple',
        'white': 'white',
        'reverse': 'reverse',
        'and': 'and',
        'to': 'to',
        'dot': 'dot',
        'on': 'on',
      },
    },
    nl: {
      language: 'Taal',
      languageName: 'Nederlands',
      'app.title': 'JSK-P22 Lampbediening',
      'nav.color': 'Kleur',
      'nav.effects': 'Effecten',
      'nav.music': 'Muziek',
      'nav.schedule': 'Schema',
      'nav.settings': 'Instellingen',
      'settings.title': 'Instellingen',
      'settings.languageDescription': 'Kies de taal die de toepassing gebruikt.',
      'settings.trayTitle': 'In systeemvak houden',
      'settings.trayDescription': 'Bij het sluiten wordt de toepassing verborgen in het systeemvak. Gebruik het menu om de toepassing te openen, de verbinding met de lamp te verbreken of af te sluiten.',
      'tray.open': 'App openen',
      'tray.startSync': 'Synchronisatie starten',
      'tray.stopSync': 'Synchronisatie stoppen',
      'tray.disconnect': 'Verbinding met lamp verbreken',
      'tray.connect': 'Openen om verbinding te maken',
      'tray.turnOn': 'Lamp inschakelen',
      'tray.turnOff': 'Lamp uitschakelen',
      'tray.quit': 'Afsluiten',
      'connection.disconnected': 'Niet verbonden',
      'connection.connect': 'Verbinden',
      'connection.reconnect': 'Opnieuw verbinden',
      'connection.disconnect': 'Verbinding verbreken',
      'connection.connecting': 'Verbinden…',
      'connection.connected': 'Verbonden met {name}',
      'connection.disconnectedStatus': 'Verbinding verbroken',
      'connection.noBluetooth': 'Web Bluetooth is niet beschikbaar in deze browser.',
      'connection.bluetoothOff': 'Bluetooth is uitgeschakeld. Schakel Bluetooth in via de Windows-instellingen en probeer het opnieuw.',
      'connection.noDevice': 'Geen apparaat gekozen of het apparaat heeft geen 0xFFF0-service.',
      'connection.failed': 'Verbinden mislukt: {message}',
      'connection.writeFailed': 'Schrijven mislukt: {message}',
      'power.title': 'Aan/uit',
      'power.description': 'Zet de lamp aan of uit. De status toont de laatst verzonden opdracht; de lamp meldt de voedingsstatus niet terug.',
      'power.on': 'Aan',
      'power.off': 'Uit',
      'brightness.title': 'Helderheid',
      'brightness.description': 'Lichtsterkte van de lamp',
      'color.pick': 'Kies een kleur',
      'color.wheelLabel': 'Kleurwiel: sleep om tint en verzadiging te kiezen',
      'color.hexLabel': 'Hexkleur',
      'color.help': 'Sleep over het wiel of typ een hexcode. Het midden is wit.',
      'effects.title': 'Effecten',
      'effects.nowPlaying': 'Nu actief',
      'effects.colorStops': 'Een kleur kiezen stopt het actieve effect',
      'effects.none': 'geen',
      'effects.speed': 'Effectsnelheid',
      'effects.speedDescription': 'Hoe snel het effect wordt afgespeeld',
      'effects.search': 'Effecten zoeken',
      'effects.categories': 'Effectcategorieën',
      'effects.scrollLeft': 'Categorieën naar links scrollen',
      'effects.scrollRight': 'Categorieën naar rechts scrollen',
      'effects.colors': 'Filteren op kleur',
      'effects.all': 'Alles',
      'effects.noMatches': 'Geen overeenkomende effecten.',
      'effects.onlyColor': 'Alleen effecten in {color}',
      'effects.multicolor': 'Meerkleurig',
      'music.title': 'Muziek',
      'music.sync': 'Muzieksynchronisatie',
      'music.description': 'De lamp reageert op geluid via de ingebouwde microfoon.',
      'music.unknown': 'Onbekend',
      'music.running': 'Actief',
      'music.stopped': 'Gestopt',
      'music.start': 'Starten',
      'music.stop': 'Stoppen',
      'music.mode': 'Modus',
      'music.modeDescription': 'Hoe de lamp op geluid reageert',
      'music.eqEnergetic': 'Energiek',
      'music.eqRhythm': 'Ritme',
      'music.eqSpectrum': 'Spectrum',
      'music.eqRolling': 'Rollend',
      'music.eqEnergetic2': 'Energiek 2',
      'music.eqRhythm2': 'Ritme 2',
      'music.eqSpectrum2': 'Spectrum 2',
      'music.eqRolling2': 'Rollend 2',
      'music.sensitivity': 'Gevoeligheid',
      'music.sensitivityDescription': 'Een hogere waarde laat de lamp ook op zachtere geluiden reageren.',
      'music.noMicrophone': 'Dit model heeft geen microfoon.',
      'schedule.title': 'Schema',
      'schedule.clock': 'Klok van de lamp',
      'schedule.clockDescription':
        'Voor schema’s moet de tijd kloppen. Deze wordt automatisch ingesteld bij het verbinden.',
      'schedule.setClock': 'Instellen op de tijd van deze pc',
      'schedule.readTitle': 'Timers van de lamp ophalen',
      'schedule.readDescription': 'Laadt de timers die op de lamp zijn opgeslagen. Dit gebeurt ook wanneer je verbinding maakt.',
      'schedule.read': 'Lezen',
      'schedule.timers': 'Timers',
      'schedule.on': 'Inschakelen plannen',
      'schedule.off': 'Uitschakelen plannen',
      'schedule.enabled': 'Ingeschakeld',
      'schedule.repeat': 'Herhalen',
      'schedule.everyDay': 'elke dag',
      'schedule.noDays': 'geen dagen',
      'schedule.days': '{count} dagen',
      'schedule.oneDay': '{count} dag',
      'schedule.keepDay': 'Selecteer ten minste één dag',
      'schedule.connectFirst': 'Verbind eerst met de lamp',
      'schedule.chooseTime': 'Kies een tijd en ten minste één dag',
      'schedule.sent': 'Verstuurd: {time}, {days}, {state}',
      'schedule.onState': 'aan',
      'schedule.offState': 'uit',
      'schedule.notSet': 'Niet ingesteld',
      'schedule.onLamp': 'Op lamp: {time}, {days}, {state}',
      'schedule.reading': 'Lezen van de lamp…',
      'schedule.noReport': 'De lamp heeft geen schema gemeld',
      'schedule.readFailed': 'Lezen mislukt: {message}',
      'schedule.dayMon': 'Maandag',
      'schedule.dayTue': 'Dinsdag',
      'schedule.dayWed': 'Woensdag',
      'schedule.dayThu': 'Donderdag',
      'schedule.dayFri': 'Vrijdag',
      'schedule.daySat': 'Zaterdag',
      'schedule.daySun': 'Zondag',
      'schedule.shortMon': 'M',
      'schedule.shortTue': 'D',
      'schedule.shortWed': 'W',
      'schedule.shortThu': 'D',
      'schedule.shortFri': 'V',
      'schedule.shortSat': 'Z',
      'schedule.shortSun': 'Z',
      'category.special': 'Speciaal',
      'category.jump': 'Sprong en flits',
      'category.fade': 'Vervagen en overgang',
      'category.marquee': 'Lichtkrant',
      'category.race': 'Race en golf',
      'category.flush': 'Veeg- en gordijneffecten',
      'category.water': 'Water',
      'category.flow': 'Stroom',
      'category.tail': 'Staart',
      'category.running': 'Lopend',
      'category.runningReverse': 'Omgekeerd lopend',
      'category.scenes': 'Scènes',
      'picker.title': 'Kies je lamp',
      'picker.searchingHint': 'Zoeken... Lampen hebben meestal een naam die met MELK- begint.',
      'picker.pickHint': 'Kies je lamp uit de lijst.',
      'picker.rangeHint': 'Controleer of de lamp aanstaat en binnen bereik is.',
      'picker.cancel': 'Annuleren',
      'picker.unnamed': 'Naamloos apparaat',
      'picker.searching': 'Zoeken naar lampen in de buurt…',
      'effectWords': {
        'Auto play': 'Automatisch',
        'Magic reverse': 'Magie omgekeerd',
        'Magic': 'Magie',
        'Energy': 'Energie',
        'Jump': 'Sprong',
        'Strobe': 'Flits',
        'Fade': 'Vervagen',
        'Transition reverse': 'Overgang omgekeerd',
        'Transition': 'Overgang',
        'Marquee': 'Lichtkrant',
        'Race reverse': 'Race omgekeerd',
        'Race': 'Race',
        'Wave reverse': 'Golf omgekeerd',
        'Wave': 'Golf',
        'Flush close': 'Vegen sluiten',
        'Flush open': 'Vegen openen',
        'Flush reverse': 'Vegen omgekeerd',
        'Flush': 'Vegen',
        'Curtain close': 'Gordijn sluiten',
        'Curtain open': 'Gordijn openen',
        'Curtain': 'Gordijn',
        'Water reverse': 'Water omgekeerd',
        'Water': 'Water',
        'Flow reverse': 'Stroom omgekeerd',
        'Flow': 'Stroom',
        'Tail reverse': 'Staart omgekeerd',
        'Tail': 'Staart',
        'Running reverse': 'Lopend omgekeerd',
        'Running': 'Lopend',
        'Sunrise': 'Zonsopgang',
        'Sunset': 'Zonsondergang',
        'Birthday': 'Verjaardag',
        'Candlelight': 'Kaarslicht',
        'Fireworks': 'Vuurwerk',
        'Party': 'Feest',
        'Destiny': 'Lot',
        'Starry sky': 'Sterrenhemel',
        'Romantic': 'Romantisch',
        'Disco': 'Disco',
        'Rainbow': 'Regenboog',
        'Movie': 'Film',
        'Christmas': 'Kerstmis',
        'Flowing': 'Stromend',
        'Sleeping': 'Slapen',
        'Ocean': 'Oceaan',
        'Forest': 'Bos',
        'Reading': 'Lezen',
        'Working': 'Werken',
        'Dazzle': 'Verblinden',
        'Gentle': 'Zacht',
        'Wedding': 'Bruiloft',
        'Snow': 'Sneeuw',
        'Fire': 'Vuur',
        'Lightning': 'Bliksem',
        "Valentine's Day": 'Valentijnsdag',
        'Halloween': 'Halloween',
        'Warning': 'Waarschuwing',
        'multicolor': 'meerkleurig',
        'six colors': 'zes kleuren',
        'red': 'rood',
        'green': 'groen',
        'blue': 'blauw',
        'yellow': 'geel',
        'cyan': 'cyaan',
        'purple': 'paars',
        'white': 'wit',
        'reverse': 'omgekeerd',
        'and': 'en',
        'to': 'naar',
        'dot': 'punt',
        'on': 'op',
      },
    },
    'zh-CN': {
      language: '语言',
      languageName: '简体中文',
      'app.title': 'JSK-P22 灯光控制',
      'nav.color': '颜色',
      'nav.effects': '效果',
      'nav.music': '音乐',
      'nav.schedule': '定时',
      'nav.settings': '设置',
      'settings.title': '设置',
      'settings.languageDescription': '选择应用程序使用的语言。',
      'settings.trayTitle': '最小化到系统托盘',
      'settings.trayDescription': '关闭窗口时，应用程序会隐藏到系统托盘。使用托盘菜单打开应用、断开灯具连接或退出应用。',
      'tray.open': '打开应用',
      'tray.startSync': '开始同步',
      'tray.stopSync': '停止同步',
      'tray.disconnect': '断开灯具连接',
      'tray.connect': '打开以连接',
      'tray.turnOn': '打开灯具',
      'tray.turnOff': '关闭灯具',
      'tray.quit': '退出',
      'connection.disconnected': '未连接',
      'connection.connect': '连接',
      'connection.reconnect': '重新连接',
      'connection.disconnect': '断开连接',
      'connection.connecting': '正在连接…',
      'connection.connected': '已连接到 {name}',
      'connection.disconnectedStatus': '已断开连接',
      'connection.noBluetooth': '此浏览器不支持 Web Bluetooth。',
      'connection.bluetoothOff': '蓝牙已关闭。请在 Windows 设置中启用蓝牙后重试。',
      'connection.noDevice': '未选择设备，或设备没有 0xFFF0 服务。',
      'connection.failed': '连接失败：{message}',
      'connection.writeFailed': '写入失败：{message}',
      'power.title': '电源',
      'power.description': '打开或关闭灯。状态显示最后发送的命令；灯具不会反馈电源状态。',
      'power.on': '开',
      'power.off': '关',
      'brightness.title': '亮度',
      'brightness.description': '灯光亮度',
      'color.pick': '选择颜色',
      'color.wheelLabel': '色轮：拖动以选择色调和饱和度',
      'color.hexLabel': '十六进制颜色',
      'color.help': '在色轮上拖动或输入十六进制代码。中心为白色。',
      'effects.title': '效果',
      'effects.nowPlaying': '当前效果',
      'effects.colorStops': '选择颜色会停止当前效果',
      'effects.none': '无',
      'effects.speed': '效果速度',
      'effects.speedDescription': '效果播放速度',
      'effects.search': '搜索效果',
      'effects.categories': '效果类别',
      'effects.scrollLeft': '向左滚动类别',
      'effects.scrollRight': '向右滚动类别',
      'effects.colors': '按颜色筛选',
      'effects.all': '全部',
      'effects.noMatches': '没有匹配的效果。',
      'effects.onlyColor': '仅显示{color}效果',
      'effects.multicolor': '多色',
      'music.title': '音乐',
      'music.sync': '音乐同步',
      'music.description': '灯光跟随内置麦克风接收到的声音变化',
      'music.unknown': '未知',
      'music.running': '运行中',
      'music.stopped': '已停止',
      'music.start': '开始',
      'music.stop': '停止',
      'music.mode': '模式',
      'music.modeDescription': '灯光对声音的响应方式',
      'music.eqEnergetic': '活力',
      'music.eqRhythm': '节奏',
      'music.eqSpectrum': '频谱',
      'music.eqRolling': '滚动',
      'music.eqEnergetic2': '活力 2',
      'music.eqRhythm2': '节奏 2',
      'music.eqSpectrum2': '频谱 2',
      'music.eqRolling2': '滚动 2',
      'music.sensitivity': '灵敏度',
      'music.sensitivityDescription': '数值越高，对较轻的声音也越敏感',
      'music.noMicrophone': '此型号没有麦克风。',
      'schedule.title': '定时',
      'schedule.clock': '灯具时钟',
      'schedule.clockDescription': '定时功能需要正确时间。连接时会自动设置。',
      'schedule.setClock': '设为电脑时间',
      'schedule.readTitle': '从灯具读取',
      'schedule.readDescription': '加载灯具中保存的定时设置。连接时也会自动读取。',
      'schedule.read': '读取',
      'schedule.timers': '定时器',
      'schedule.on': '定时开灯',
      'schedule.off': '定时关灯',
      'schedule.enabled': '已启用',
      'schedule.repeat': '重复',
      'schedule.everyDay': '每天',
      'schedule.noDays': '无日期',
      'schedule.days': '{count} 天',
      'schedule.oneDay': '{count} 天',
      'schedule.keepDay': '请至少选择一天',
      'schedule.connectFirst': '请先连接灯具',
      'schedule.chooseTime': '请选择时间和至少一天',
      'schedule.sent': '已发送：{time}，{days}，{state}',
      'schedule.onState': '开启',
      'schedule.offState': '关闭',
      'schedule.notSet': '未设置',
      'schedule.onLamp': '灯具设置：{time}，{days}，{state}',
      'schedule.reading': '正在从灯具读取…',
      'schedule.noReport': '灯具未返回定时信息',
      'schedule.readFailed': '读取失败：{message}',
      'schedule.dayMon': '星期一',
      'schedule.dayTue': '星期二',
      'schedule.dayWed': '星期三',
      'schedule.dayThu': '星期四',
      'schedule.dayFri': '星期五',
      'schedule.daySat': '星期六',
      'schedule.daySun': '星期日',
      'schedule.shortMon': '一',
      'schedule.shortTue': '二',
      'schedule.shortWed': '三',
      'schedule.shortThu': '四',
      'schedule.shortFri': '五',
      'schedule.shortSat': '六',
      'schedule.shortSun': '日',
      'category.special': '特别',
      'category.jump': '跳变与频闪',
      'category.fade': '渐变与过渡',
      'category.marquee': '跑马灯',
      'category.race': '竞速与波浪',
      'category.flush': '扫动与窗帘',
      'category.water': '流水',
      'category.flow': '流动',
      'category.tail': '尾迹',
      'category.running': '跑动',
      'category.runningReverse': '跑动反向',
      'category.scenes': '场景',
      'picker.title': '选择灯具',
      'picker.searchingHint': '正在搜索。灯具名称通常以 MELK- 开头',
      'picker.pickHint': '从列表中选择你的灯具。',
      'picker.rangeHint': '请确认灯具已通电且在蓝牙范围内。',
      'picker.cancel': '取消',
      'picker.unnamed': '未命名设备',
      'picker.searching': '正在搜索附近的灯具…',
      'effectWords': {
        'Auto play': '自动播放',
        'Magic reverse': '魔幻反向',
        'Magic': '魔幻',
        'Energy': '能量',
        'Jump': '跳变',
        'Strobe': '频闪',
        'Fade': '渐变',
        'Transition reverse': '过渡反向',
        'Transition': '过渡',
        'Marquee': '跑马灯',
        'Race reverse': '竞速反向',
        'Race': '竞速',
        'Wave reverse': '波浪反向',
        'Wave': '波浪',
        'Flush close': '扫动关闭',
        'Flush open': '扫动打开',
        'Flush reverse': '扫动反向',
        'Flush': '扫动',
        'Curtain close': '窗帘关闭',
        'Curtain open': '窗帘打开',
        'Curtain': '窗帘',
        'Water reverse': '流水反向',
        'Water': '流水',
        'Flow reverse': '流动反向',
        'Flow': '流动',
        'Tail reverse': '尾迹反向',
        'Tail': '尾迹',
        'Running reverse': '跑动反向',
        'Running': '跑动',
        'Sunrise': '日出',
        'Sunset': '日落',
        'Birthday': '生日',
        'Candlelight': '烛光',
        'Fireworks': '烟花',
        'Party': '派对',
        'Destiny': '命运',
        'Starry sky': '星空',
        'Romantic': '浪漫',
        'Disco': '迪斯科',
        'Rainbow': '彩虹',
        'Movie': '电影',
        'Christmas': '圣诞节',
        'Flowing': '流动',
        'Sleeping': '睡眠',
        'Ocean': '海洋',
        'Forest': '森林',
        'Reading': '阅读',
        'Working': '工作',
        'Dazzle': '炫彩',
        'Gentle': '柔和',
        'Wedding': '婚礼',
        'Snow': '雪景',
        'Fire': '火焰',
        'Lightning': '闪电',
        "Valentine's Day": '情人节',
        'Halloween': '万圣节',
        'Warning': '警告',
        'multicolor': '多色',
        'six colors': '六色',
        'red': '红色',
        'green': '绿色',
        'blue': '蓝色',
        'yellow': '黄色',
        'cyan': '青色',
        'purple': '紫色',
        'white': '白色',
        'reverse': '反向',
        'and': '和',
        'to': '至',
        'dot': '点',
        'on': '在',
      },
    },
  }

  function addLocale(code, languageName, labels, effectLabels) {
    const entries = (source) => Object.fromEntries(
      source.trim().split('\n').map((line) => {
        const separator = line.indexOf('|')
        return [line.slice(0, separator), line.slice(separator + 1)]
      }),
    )

    translations[code] = {
      ...translations.en,
      ...entries(labels),
      languageName,
      effectWords: entries(effectLabels),
    }
  }

  addLocale('fr', 'Français', `
language|Langue
app.title|Contrôle de la lampe JSK-P22
nav.color|Couleur
nav.effects|Effets
nav.music|Musique
nav.schedule|Programmation
nav.settings|Paramètres
settings.title|Paramètres
settings.languageDescription|Choisissez la langue de l’application.
settings.trayTitle|Garder dans la zone de notification
settings.trayDescription|À la fermeture, l’application est masquée dans la zone de notification. Utilisez son menu pour la rouvrir, déconnecter la lampe ou quitter.
tray.open|Ouvrir l’application
tray.startSync|Démarrer la synchronisation
tray.stopSync|Arrêter la synchronisation
tray.disconnect|Déconnecter la lampe
tray.connect|Ouvrir pour se connecter
tray.turnOn|Allumer la lampe
tray.turnOff|Éteindre la lampe
tray.quit|Quitter
connection.disconnected|Non connecté
connection.connect|Connecter
connection.reconnect|Reconnecter
connection.disconnect|Déconnecter
connection.connecting|Connexion…
connection.connected|Connecté à {name}
connection.disconnectedStatus|Déconnecté
connection.noBluetooth|Web Bluetooth n’est pas disponible dans ce navigateur.
connection.bluetoothOff|Le Bluetooth est désactivé. Activez-le dans les paramètres Windows, puis réessayez.
connection.noDevice|Aucun appareil sélectionné, ou le service 0xFFF0 est introuvable.
connection.failed|Échec de la connexion : {message}
connection.writeFailed|Échec de l’écriture : {message}
power.title|Alimentation
power.description|Allumez ou éteignez la lampe. L’état indique la dernière commande envoyée ; la lampe ne signale pas son état d’alimentation.
power.on|Allumer
power.off|Éteindre
brightness.title|Luminosité
brightness.description|Niveau de luminosité de la lampe
color.pick|Choisir une couleur
color.wheelLabel|Palette de couleurs : faites glisser pour choisir la teinte et la saturation
color.hexLabel|Code couleur hexadécimal
color.help|Faites glisser sur la palette ou saisissez un code hexadécimal. Le centre est blanc.
effects.title|Effets
effects.nowPlaying|Effet en cours
effects.colorStops|Choisir une couleur arrête l’effet en cours
effects.none|aucun
effects.speed|Vitesse de l’effet
effects.speedDescription|Vitesse de lecture de l’effet
effects.search|Rechercher des effets
effects.categories|Catégories d’effets
effects.scrollLeft|Faire défiler les catégories vers la gauche
effects.scrollRight|Faire défiler les catégories vers la droite
effects.colors|Filtrer par couleur
effects.all|Tout
effects.noMatches|Aucun effet ne correspond.
effects.onlyColor|Afficher uniquement les effets de couleur {color}
effects.multicolor|Multicolore
music.title|Musique
music.sync|Synchronisation musicale
music.description|La lampe réagit aux sons captés par son microphone intégré
music.unknown|Inconnu
music.running|En cours
music.stopped|Arrêté
music.start|Démarrer
music.stop|Arrêter
music.mode|Mode
music.modeDescription|Réaction de la lampe au son
music.eqEnergetic|Énergique
music.eqRhythm|Rythme
music.eqSpectrum|Spectre
music.eqRolling|Défilement
music.eqEnergetic2|Énergique 2
music.eqRhythm2|Rythme 2
music.eqSpectrum2|Spectre 2
music.eqRolling2|Défilement 2
music.sensitivity|Sensibilité
music.sensitivityDescription|Une valeur élevée permet de détecter les sons plus faibles.
music.noMicrophone|Ce modèle n’a pas de microphone.
schedule.title|Programmation
schedule.clock|Horloge de la lampe
schedule.clockDescription|Les programmations nécessitent une heure exacte. Elle est réglée automatiquement lors de la connexion.
schedule.setClock|Régler sur l’heure de ce PC
schedule.readTitle|Lire depuis la lampe
schedule.readDescription|Charge les minuteries enregistrées sur la lampe. Cette lecture a aussi lieu lors de la connexion.
schedule.read|Lire
schedule.timers|Minuteries
schedule.on|Programmer l’allumage
schedule.off|Programmer l’extinction
schedule.enabled|Activé
schedule.repeat|Répéter
schedule.everyDay|tous les jours
schedule.noDays|aucun jour
schedule.days|{count} jours
schedule.oneDay|{count} jour
schedule.keepDay|Sélectionnez au moins un jour
schedule.connectFirst|Connectez d’abord la lampe
schedule.chooseTime|Choisissez une heure et au moins un jour
schedule.sent|Envoyé : {time}, {days}, {state}
schedule.onState|activé
schedule.offState|désactivé
schedule.notSet|Non défini
schedule.onLamp|Sur la lampe : {time}, {days}, {state}
schedule.reading|Lecture depuis la lampe…
schedule.noReport|La lampe n’a pas renvoyé de programmation
schedule.readFailed|Échec de la lecture : {message}
schedule.dayMon|Lundi
schedule.dayTue|Mardi
schedule.dayWed|Mercredi
schedule.dayThu|Jeudi
schedule.dayFri|Vendredi
schedule.daySat|Samedi
schedule.daySun|Dimanche
schedule.shortMon|L
schedule.shortTue|M
schedule.shortWed|M
schedule.shortThu|J
schedule.shortFri|V
schedule.shortSat|S
schedule.shortSun|D
category.special|Spécial
category.jump|Sauts et stroboscope
category.fade|Fondus et transitions
category.marquee|Défilement
category.race|Courses et vagues
category.flush|Balayages et rideaux
category.water|Eau
category.flow|Flux
category.tail|Traînée
category.running|Défilement
category.runningReverse|Défilement inversé
category.scenes|Scènes
picker.title|Choisissez votre lampe
picker.searchingHint|Recherche en cours. Les lampes s’appellent généralement MELK-.
picker.pickHint|Sélectionnez votre lampe dans la liste.
picker.rangeHint|Vérifiez que la lampe est allumée et à portée.
picker.cancel|Annuler
picker.unnamed|Appareil sans nom
picker.searching|Recherche des appareils à proximité…
`, `
Auto play|Lecture automatique
Magic reverse|Magie inversée
Magic|Magie
Energy|Énergie
Jump|Saut
Strobe|Stroboscope
Fade|Fondu
Transition reverse|Transition inversée
Transition|Transition
Marquee|Défilement
Race reverse|Course inversée
Race|Course
Wave reverse|Vague inversée
Wave|Vague
Flush close|Balayage fermé
Flush open|Balayage ouvert
Flush reverse|Balayage inversé
Flush|Balayage
Curtain close|Fermeture du rideau
Curtain open|Ouverture du rideau
Curtain|Rideau
Water reverse|Eau inversée
Water|Eau
Flow reverse|Flux inversé
Flow|Flux
Tail reverse|Traînée inversée
Tail|Traînée
Running reverse|Défilement inversé
Running|Défilement
Sunrise|Lever de soleil
Sunset|Coucher de soleil
Birthday|Anniversaire
Candlelight|Lueur de bougie
Fireworks|Feux d’artifice
Party|Fête
Destiny|Destin
Starry sky|Ciel étoilé
Romantic|Romantique
Disco|Disco
Rainbow|Arc-en-ciel
Movie|Film
Christmas|Noël
Flowing|Fluide
Sleeping|Sommeil
Ocean|Océan
Forest|Forêt
Reading|Lecture
Working|Travail
Dazzle|Éblouissant
Gentle|Doux
Wedding|Mariage
Snow|Neige
Fire|Feu
Lightning|Éclair
Valentine's Day|Saint-Valentin
Halloween|Halloween
Warning|Avertissement
multicolor|multicolore
six colors|six couleurs
red|rouge
green|vert
blue|bleu
yellow|jaune
cyan|cyan
purple|violet
white|blanc
reverse|inversé
and|et
to|vers
dot|point
on|sur
`)

  addLocale('de', 'Deutsch', `
language|Sprache
app.title|JSK-P22-Lampensteuerung
nav.color|Farbe
nav.effects|Effekte
nav.music|Musik
nav.schedule|Zeitplan
nav.settings|Einstellungen
settings.title|Einstellungen
settings.languageDescription|Wählen Sie die Sprache der Anwendung aus.
settings.trayTitle|Im Infobereich behalten
settings.trayDescription|Beim Schließen wird die Anwendung im Infobereich ausgeblendet. Über das Infobereichsmenü können Sie die App öffnen, die Lampe trennen oder die App beenden.
tray.open|App öffnen
tray.startSync|Synchronisierung starten
tray.stopSync|Synchronisierung stoppen
tray.disconnect|Verbindung zur Lampe trennen
tray.connect|Zum Verbinden öffnen
tray.turnOn|Lampe einschalten
tray.turnOff|Lampe ausschalten
tray.quit|Beenden
connection.disconnected|Nicht verbunden
connection.connect|Verbinden
connection.reconnect|Erneut verbinden
connection.disconnect|Verbindung trennen
connection.connecting|Verbindung wird hergestellt…
connection.connected|Verbunden mit {name}
connection.disconnectedStatus|Verbindung getrennt
connection.noBluetooth|Web Bluetooth ist in diesem Browser nicht verfügbar.
connection.bluetoothOff|Bluetooth ist ausgeschaltet. Schalten Sie es in den Windows-Einstellungen ein und versuchen Sie es erneut.
connection.noDevice|Kein Gerät ausgewählt oder der Dienst 0xFFF0 ist nicht verfügbar.
connection.failed|Verbindung fehlgeschlagen: {message}
connection.writeFailed|Schreiben fehlgeschlagen: {message}
power.title|Stromversorgung
power.description|Schalten Sie die Lampe ein oder aus. Der Status zeigt den zuletzt gesendeten Befehl an; die Lampe meldet ihren Stromzustand nicht zurück.
power.on|Ein
power.off|Aus
brightness.title|Helligkeit
brightness.description|Helligkeit der Lampe
color.pick|Farbe auswählen
color.wheelLabel|Farbkreis: Ziehen Sie, um Farbton und Sättigung auszuwählen
color.hexLabel|Hex-Farbwert
color.help|Wählen Sie eine Farbe im Farbkreis oder geben Sie einen Hex-Code ein. Die Mitte ist weiß.
effects.title|Effekte
effects.nowPlaying|Aktueller Effekt
effects.colorStops|Wenn Sie eine Farbe auswählen, wird der laufende Effekt beendet.
effects.none|kein
effects.speed|Effektgeschwindigkeit
effects.speedDescription|Wie schnell der Effekt abläuft
effects.search|Effekte suchen
effects.categories|Effektkategorien
effects.scrollLeft|Kategorien nach links verschieben
effects.scrollRight|Kategorien nach rechts verschieben
effects.colors|Nach Farbe filtern
effects.all|Alle
effects.noMatches|Keine passenden Effekte gefunden.
effects.onlyColor|Nur Effekte mit der Farbe {color}
effects.multicolor|Mehrfarbig
music.title|Musik
music.sync|Musiksynchronisierung
music.description|Die Lampe reagiert auf Geräusche, die ihr integriertes Mikrofon aufnimmt.
music.unknown|Unbekannt
music.running|Läuft
music.stopped|Gestoppt
music.start|Starten
music.stop|Stoppen
music.mode|Modus
music.modeDescription|So reagiert die Lampe auf Geräusche
music.eqEnergetic|Energetisch
music.eqRhythm|Rhythmus
music.eqSpectrum|Spektrum
music.eqRolling|Lauflicht
music.eqEnergetic2|Energetisch 2
music.eqRhythm2|Rhythmus 2
music.eqSpectrum2|Spektrum 2
music.eqRolling2|Lauflicht 2
music.sensitivity|Empfindlichkeit
music.sensitivityDescription|Bei höherer Empfindlichkeit reagiert die Lampe auch auf leisere Geräusche.
music.noMicrophone|Dieses Modell hat kein Mikrofon.
schedule.title|Zeitplan
schedule.clock|Lampen-Uhr
schedule.clockDescription|Für Zeitpläne muss die Uhr richtig eingestellt sein. Beim Verbinden wird sie automatisch gestellt.
schedule.setClock|Auf PC-Zeit einstellen
schedule.readTitle|Von der Lampe lesen
schedule.readDescription|Lädt die auf der Lampe gespeicherten Timer. Das geschieht auch beim Verbinden.
schedule.read|Lesen
schedule.timers|Timer
schedule.on|Einschalten planen
schedule.off|Ausschalten planen
schedule.enabled|Aktiviert
schedule.repeat|Wiederholen
schedule.everyDay|jeden Tag
schedule.noDays|keine Tage
schedule.days|{count} Tage
schedule.oneDay|{count} Tag
schedule.keepDay|Wählen Sie mindestens einen Tag aus.
schedule.connectFirst|Verbinden Sie zuerst die Lampe.
schedule.chooseTime|Wählen Sie eine Uhrzeit und mindestens einen Tag aus.
schedule.sent|Gesendet: {time}, {days}, {state}
schedule.onState|ein
schedule.offState|aus
schedule.notSet|Nicht festgelegt
schedule.onLamp|Auf der Lampe: {time}, {days}, {state}
schedule.reading|Daten werden von der Lampe gelesen…
schedule.noReport|Die Lampe hat keinen Zeitplan zurückgemeldet.
schedule.readFailed|Lesen fehlgeschlagen: {message}
schedule.dayMon|Montag
schedule.dayTue|Dienstag
schedule.dayWed|Mittwoch
schedule.dayThu|Donnerstag
schedule.dayFri|Freitag
schedule.daySat|Samstag
schedule.daySun|Sonntag
schedule.shortMon|Mo
schedule.shortTue|Di
schedule.shortWed|Mi
schedule.shortThu|Do
schedule.shortFri|Fr
schedule.shortSat|Sa
schedule.shortSun|So
category.special|Spezial
category.jump|Sprung und Stroboskop
category.fade|Überblenden und Übergang
category.marquee|Lauflicht
category.race|Rennen und Wellen
category.flush|Wischen und Vorhang
category.water|Wasser
category.flow|Fließen
category.tail|Schweif
category.running|Lauflicht
category.runningReverse|Rückwärts laufend
category.scenes|Szenen
picker.title|Lampe auswählen
picker.searchingHint|Suche läuft. Lampen heißen normalerweise MELK-.
picker.pickHint|Wählen Sie Ihre Lampe aus der Liste aus.
picker.rangeHint|Vergewissern Sie sich, dass die Lampe eingeschaltet und in Reichweite ist.
picker.cancel|Abbrechen
picker.unnamed|Unbenanntes Gerät
picker.searching|Suche nach Geräten in der Nähe…
`, `
Auto play|Automatische Wiedergabe
Magic reverse|Magie rückwärts
Magic|Magie
Energy|Energie
Jump|Sprung
Strobe|Stroboskop
Fade|Überblenden
Transition reverse|Übergang rückwärts
Transition|Übergang
Marquee|Lauflicht
Race reverse|Rennen rückwärts
Race|Rennen
Wave reverse|Welle rückwärts
Wave|Welle
Flush close|Wisch schließen
Flush open|Wisch öffnen
Flush reverse|Wisch rückwärts
Flush|Wisch
Curtain close|Vorhang schließen
Curtain open|Vorhang öffnen
Curtain|Vorhang
Water reverse|Wasser rückwärts
Water|Wasser
Flow reverse|Fluss rückwärts
Flow|Fluss
Tail reverse|Schweif rückwärts
Tail|Schweif
Running reverse|Lauflicht rückwärts
Running|Lauflicht
Sunrise|Sonnenaufgang
Sunset|Sonnenuntergang
Birthday|Geburtstag
Candlelight|Kerzenlicht
Fireworks|Feuerwerk
Party|Party
Destiny|Schicksal
Starry sky|Sternenhimmel
Romantic|Romantisch
Disco|Disco
Rainbow|Regenbogen
Movie|Film
Christmas|Weihnachten
Flowing|Fließend
Sleeping|Schlafen
Ocean|Ozean
Forest|Wald
Reading|Lesen
Working|Arbeiten
Dazzle|Blendend
Gentle|Sanft
Wedding|Hochzeit
Snow|Schnee
Fire|Feuer
Lightning|Blitz
Valentine's Day|Valentinstag
Halloween|Halloween
Warning|Warnung
multicolor|mehrfarbig
six colors|sechs Farben
red|rot
green|grün
blue|blau
yellow|gelb
cyan|türkis
purple|lila
white|weiß
reverse|rückwärts
and|und
to|bis
dot|Punkt
on|an
`)

  addLocale('es', 'Español', `
language|Idioma
app.title|Control de lámpara JSK-P22
nav.color|Color
nav.effects|Efectos
nav.music|Música
nav.schedule|Programación
nav.settings|Ajustes
settings.title|Ajustes
settings.languageDescription|Elige el idioma de la aplicación.
settings.trayTitle|Mantener en la bandeja del sistema
settings.trayDescription|Al cerrar la ventana, la aplicación se oculta en la bandeja del sistema. Usa su menú para abrirla, desconectar la lámpara o salir.
tray.open|Abrir aplicación
tray.startSync|Iniciar sincronización
tray.stopSync|Detener sincronización
tray.disconnect|Desconectar la lámpara
tray.connect|Abrir para conectar
tray.turnOn|Encender lámpara
tray.turnOff|Apagar lámpara
tray.quit|Salir
connection.disconnected|Desconectado
connection.connect|Conectar
connection.reconnect|Volver a conectar
connection.disconnect|Desconectar
connection.connecting|Conectando…
connection.connected|Conectado a {name}
connection.disconnectedStatus|Desconectado
connection.noBluetooth|Web Bluetooth no está disponible en este navegador.
connection.bluetoothOff|Bluetooth está desactivado. Actívalo en la configuración de Windows y vuelve a intentarlo.
connection.noDevice|No se ha seleccionado ningún dispositivo o no ofrece el servicio 0xFFF0.
connection.failed|No se pudo conectar: {message}
connection.writeFailed|Error al escribir: {message}
power.title|Encendido
power.description|Enciende o apaga la lámpara. El estado muestra el último comando enviado; la lámpara no informa de su estado de encendido.
power.on|Encender
power.off|Apagar
brightness.title|Brillo
brightness.description|Nivel de brillo de la lámpara
color.pick|Elegir un color
color.wheelLabel|Rueda de color: arrastra para elegir el tono y la saturación
color.hexLabel|Código de color hexadecimal
color.help|Arrastra en la rueda o escribe un código hexadecimal. El centro es blanco.
effects.title|Efectos
effects.nowPlaying|Efecto actual
effects.colorStops|Al elegir un color se detiene el efecto actual
effects.none|ninguno
effects.speed|Velocidad del efecto
effects.speedDescription|Velocidad a la que se reproduce el efecto
effects.search|Buscar efectos
effects.categories|Categorías de efectos
effects.scrollLeft|Desplazar las categorías a la izquierda
effects.scrollRight|Desplazar las categorías a la derecha
effects.colors|Filtrar por color
effects.all|Todos
effects.noMatches|No hay efectos que coincidan.
effects.onlyColor|Solo efectos en color {color}
effects.multicolor|Multicolor
music.title|Música
music.sync|Sincronización con música
music.description|La lámpara reacciona al sonido que capta su micrófono integrado
music.unknown|Desconocido
music.running|En marcha
music.stopped|Detenido
music.start|Iniciar
music.stop|Detener
music.mode|Modo
music.modeDescription|Cómo reacciona la lámpara al sonido
music.eqEnergetic|Enérgico
music.eqRhythm|Ritmo
music.eqSpectrum|Espectro
music.eqRolling|Rodante
music.eqEnergetic2|Enérgico 2
music.eqRhythm2|Ritmo 2
music.eqSpectrum2|Espectro 2
music.eqRolling2|Rodante 2
music.sensitivity|Sensibilidad
music.sensitivityDescription|Con un valor más alto, la lámpara reacciona a sonidos más suaves.
music.noMicrophone|Este modelo no tiene micrófono.
schedule.title|Programación
schedule.clock|Reloj de la lámpara
schedule.clockDescription|La programación requiere que la hora sea correcta. Se ajusta automáticamente al conectar.
schedule.setClock|Usar la hora de este PC
schedule.readTitle|Leer de la lámpara
schedule.readDescription|Carga los temporizadores guardados en la lámpara. También se hace al conectar.
schedule.read|Leer
schedule.timers|Temporizadores
schedule.on|Programar encendido
schedule.off|Programar apagado
schedule.enabled|Activado
schedule.repeat|Repetir
schedule.everyDay|todos los días
schedule.noDays|ningún día
schedule.days|{count} días
schedule.oneDay|{count} día
schedule.keepDay|Selecciona al menos un día.
schedule.connectFirst|Conecta primero la lámpara.
schedule.chooseTime|Elige una hora y al menos un día.
schedule.sent|Enviado: {time}, {days}, {state}
schedule.onState|encendido
schedule.offState|apagado
schedule.notSet|Sin configurar
schedule.onLamp|En la lámpara: {time}, {days}, {state}
schedule.reading|Leyendo de la lámpara…
schedule.noReport|La lámpara no ha informado de ningún horario.
schedule.readFailed|Error al leer: {message}
schedule.dayMon|Lunes
schedule.dayTue|Martes
schedule.dayWed|Miércoles
schedule.dayThu|Jueves
schedule.dayFri|Viernes
schedule.daySat|Sábado
schedule.daySun|Domingo
schedule.shortMon|L
schedule.shortTue|M
schedule.shortWed|X
schedule.shortThu|J
schedule.shortFri|V
schedule.shortSat|S
schedule.shortSun|D
category.special|Especial
category.jump|Saltos y estrobos
category.fade|Fundidos y transiciones
category.marquee|Letrero luminoso
category.race|Carreras y ondas
category.flush|Barridos y cortinas
category.water|Agua
category.flow|Flujo
category.tail|Estela
category.running|En movimiento
category.runningReverse|Movimiento inverso
category.scenes|Escenas
picker.title|Elige tu lámpara
picker.searchingHint|Buscando. Las lámparas suelen llamarse MELK-.
picker.pickHint|Elige tu lámpara de la lista.
picker.rangeHint|Comprueba que la lámpara esté encendida y dentro del alcance.
picker.cancel|Cancelar
picker.unnamed|Dispositivo sin nombre
picker.searching|Buscando dispositivos cercanos…
`, `
Auto play|Reproducción automática
Magic reverse|Magia inversa
Magic|Magia
Energy|Energía
Jump|Salto
Strobe|Estrobo
Fade|Fundido
Transition reverse|Transición inversa
Transition|Transición
Marquee|Letrero luminoso
Race reverse|Carrera inversa
Race|Carrera
Wave reverse|Onda inversa
Wave|Onda
Flush close|Barrido hacia dentro
Flush open|Barrido hacia fuera
Flush reverse|Barrido inverso
Flush|Barrido
Curtain close|Cerrar cortina
Curtain open|Abrir cortina
Curtain|Cortina
Water reverse|Agua inversa
Water|Agua
Flow reverse|Flujo inverso
Flow|Flujo
Tail reverse|Estela inversa
Tail|Estela
Running reverse|Movimiento inverso
Running|En movimiento
Sunrise|Amanecer
Sunset|Atardecer
Birthday|Cumpleaños
Candlelight|Luz de vela
Fireworks|Fuegos artificiales
Party|Fiesta
Destiny|Destino
Starry sky|Cielo estrellado
Romantic|Romántico
Disco|Discoteca
Rainbow|Arcoíris
Movie|Cine
Christmas|Navidad
Flowing|Fluido
Sleeping|Sueño
Ocean|Océano
Forest|Bosque
Reading|Lectura
Working|Trabajo
Dazzle|Deslumbrante
Gentle|Suave
Wedding|Boda
Snow|Nieve
Fire|Fuego
Lightning|Relámpago
Valentine's Day|San Valentín
Halloween|Halloween
Warning|Aviso
multicolor|multicolor
six colors|seis colores
red|rojo
green|verde
blue|azul
yellow|amarillo
cyan|cian
purple|morado
white|blanco
reverse|inverso
and|y
to|a
dot|punto
on|en
`)

  addLocale('it', 'Italiano', `
language|Lingua
app.title|Controllo lampada JSK-P22
nav.color|Colore
nav.effects|Effetti
nav.music|Musica
nav.schedule|Programmazione
nav.settings|Impostazioni
settings.title|Impostazioni
settings.languageDescription|Scegli la lingua dell’applicazione.
settings.trayTitle|Mantieni nell’area di notifica
settings.trayDescription|Quando chiudi la finestra, l’applicazione viene nascosta nell’area di notifica. Usa il menu per aprirla, disconnettere la lampada o uscire.
tray.open|Apri applicazione
tray.startSync|Avvia sincronizzazione
tray.stopSync|Interrompi sincronizzazione
tray.disconnect|Disconnetti la lampada
tray.connect|Apri per connetterti
tray.turnOn|Accendi la lampada
tray.turnOff|Spegni la lampada
tray.quit|Esci
connection.disconnected|Non connessa
connection.connect|Connetti
connection.reconnect|Riconnetti
connection.disconnect|Disconnetti
connection.connecting|Connessione in corso…
connection.connected|Connessa a {name}
connection.disconnectedStatus|Disconnessa
connection.noBluetooth|Web Bluetooth non è disponibile in questo browser.
connection.bluetoothOff|Il Bluetooth è disattivato. Attivalo nelle impostazioni di Windows e riprova.
connection.noDevice|Nessun dispositivo selezionato oppure il servizio 0xFFF0 non è disponibile.
connection.failed|Connessione non riuscita: {message}
connection.writeFailed|Scrittura non riuscita: {message}
power.title|Alimentazione
power.description|Accendi o spegni la lampada. Lo stato indica l’ultimo comando inviato; la lampada non comunica lo stato dell’alimentazione.
power.on|Accendi
power.off|Spegni
brightness.title|Luminosità
brightness.description|Livello di luminosità della lampada
color.pick|Scegli un colore
color.wheelLabel|Ruota dei colori: trascina per scegliere tonalità e saturazione
color.hexLabel|Codice colore esadecimale
color.help|Trascina sulla ruota o inserisci un codice esadecimale. Il centro è bianco.
effects.title|Effetti
effects.nowPlaying|Effetto in corso
effects.colorStops|Scegliendo un colore si interrompe l’effetto in corso
effects.none|nessuno
effects.speed|Velocità dell’effetto
effects.speedDescription|Velocità di riproduzione dell’effetto
effects.search|Cerca effetti
effects.categories|Categorie di effetti
effects.scrollLeft|Scorri le categorie a sinistra
effects.scrollRight|Scorri le categorie a destra
effects.colors|Filtra per colore
effects.all|Tutti
effects.noMatches|Nessun effetto corrispondente.
effects.onlyColor|Solo effetti di colore {color}
effects.multicolor|Multicolore
music.title|Musica
music.sync|Sincronizzazione con la musica
music.description|La lampada reagisce ai suoni rilevati dal microfono integrato
music.unknown|Sconosciuto
music.running|In esecuzione
music.stopped|Interrotto
music.start|Avvia
music.stop|Interrompi
music.mode|Modalità
music.modeDescription|Come reagisce la lampada ai suoni
music.eqEnergetic|Energetica
music.eqRhythm|Ritmo
music.eqSpectrum|Spettro
music.eqRolling|Scorrimento
music.eqEnergetic2|Energetica 2
music.eqRhythm2|Ritmo 2
music.eqSpectrum2|Spettro 2
music.eqRolling2|Scorrimento 2
music.sensitivity|Sensibilità
music.sensitivityDescription|Un valore più alto fa reagire la lampada anche ai suoni più deboli.
music.noMicrophone|Questo modello non ha un microfono.
schedule.title|Programmazione
schedule.clock|Orologio della lampada
schedule.clockDescription|La programmazione richiede che l’ora sia corretta. L’orologio viene impostato automaticamente alla connessione.
schedule.setClock|Imposta sull’ora del PC
schedule.readTitle|Leggi dalla lampada
schedule.readDescription|Carica i timer salvati sulla lampada. La lettura avviene anche alla connessione.
schedule.read|Leggi
schedule.timers|Timer
schedule.on|Programma l’accensione
schedule.off|Programma lo spegnimento
schedule.enabled|Attivato
schedule.repeat|Ripeti
schedule.everyDay|ogni giorno
schedule.noDays|nessun giorno
schedule.days|{count} giorni
schedule.oneDay|{count} giorno
schedule.keepDay|Seleziona almeno un giorno.
schedule.connectFirst|Connetti prima la lampada.
schedule.chooseTime|Scegli un orario e almeno un giorno.
schedule.sent|Inviato: {time}, {days}, {state}
schedule.onState|accesa
schedule.offState|spenta
schedule.notSet|Non impostato
schedule.onLamp|Sulla lampada: {time}, {days}, {state}
schedule.reading|Lettura dalla lampada…
schedule.noReport|La lampada non ha comunicato alcun programma.
schedule.readFailed|Lettura non riuscita: {message}
schedule.dayMon|Lunedì
schedule.dayTue|Martedì
schedule.dayWed|Mercoledì
schedule.dayThu|Giovedì
schedule.dayFri|Venerdì
schedule.daySat|Sabato
schedule.daySun|Domenica
schedule.shortMon|L
schedule.shortTue|M
schedule.shortWed|M
schedule.shortThu|G
schedule.shortFri|V
schedule.shortSat|S
schedule.shortSun|D
category.special|Speciale
category.jump|Salti e strobo
category.fade|Dissolvenze e transizioni
category.marquee|Scorrimento
category.race|Gare e onde
category.flush|Scansioni e tendine
category.water|Acqua
category.flow|Flusso
category.tail|Scia
category.running|Scorrimento
category.runningReverse|Scorrimento inverso
category.scenes|Scene
picker.title|Scegli la lampada
picker.searchingHint|Ricerca in corso. Le lampade si chiamano solitamente MELK-.
picker.pickHint|Scegli la lampada dall’elenco.
picker.rangeHint|Assicurati che la lampada sia accesa e nelle vicinanze.
picker.cancel|Annulla
picker.unnamed|Dispositivo senza nome
picker.searching|Ricerca dei dispositivi nelle vicinanze…
`, `
Auto play|Riproduzione automatica
Magic reverse|Magia inversa
Magic|Magia
Energy|Energia
Jump|Salto
Strobe|Strobo
Fade|Dissolvenza
Transition reverse|Transizione inversa
Transition|Transizione
Marquee|Scorrimento
Race reverse|Corsa inversa
Race|Corsa
Wave reverse|Onda inversa
Wave|Onda
Flush close|Scansione chiusa
Flush open|Scansione aperta
Flush reverse|Scansione inversa
Flush|Scansione
Curtain close|Chiusura della tendina
Curtain open|Apertura della tendina
Curtain|Tendina
Water reverse|Acqua inversa
Water|Acqua
Flow reverse|Flusso inverso
Flow|Flusso
Tail reverse|Scia inversa
Tail|Scia
Running reverse|Scorrimento inverso
Running|Scorrimento
Sunrise|Alba
Sunset|Tramonto
Birthday|Compleanno
Candlelight|Luce di candela
Fireworks|Fuochi d’artificio
Party|Festa
Destiny|Destino
Starry sky|Cielo stellato
Romantic|Romantico
Disco|Discoteca
Rainbow|Arcobaleno
Movie|Film
Christmas|Natale
Flowing|Fluido
Sleeping|Sonno
Ocean|Oceano
Forest|Foresta
Reading|Lettura
Working|Lavoro
Dazzle|Abbagliante
Gentle|Delicato
Wedding|Matrimonio
Snow|Neve
Fire|Fuoco
Lightning|Fulmine
Valentine's Day|San Valentino
Halloween|Halloween
Warning|Avviso
multicolor|multicolore
six colors|sei colori
red|rosso
green|verde
blue|blu
yellow|giallo
cyan|ciano
purple|viola
white|bianco
reverse|inverso
and|e
to|a
dot|punto
on|su
`)

  addLocale('pt-BR', 'Português (Brasil)', `
language|Idioma
app.title|Controle da lâmpada JSK-P22
nav.color|Cor
nav.effects|Efeitos
nav.music|Música
nav.schedule|Programação
nav.settings|Configurações
settings.title|Configurações
settings.languageDescription|Escolha o idioma do aplicativo.
settings.trayTitle|Manter na bandeja do sistema
settings.trayDescription|Ao fechar a janela, o aplicativo fica oculto na bandeja do sistema. Use o menu para abrir o aplicativo, desconectar a lâmpada ou sair.
tray.open|Abrir aplicativo
tray.startSync|Iniciar sincronização
tray.stopSync|Parar sincronização
tray.disconnect|Desconectar da lâmpada
tray.connect|Abrir para conectar
tray.turnOn|Acender a lâmpada
tray.turnOff|Apagar a lâmpada
tray.quit|Sair
connection.disconnected|Desconectado
connection.connect|Conectar
connection.reconnect|Reconectar
connection.disconnect|Desconectar
connection.connecting|Conectando…
connection.connected|Conectado a {name}
connection.disconnectedStatus|Desconectado
connection.noBluetooth|O Web Bluetooth não está disponível neste navegador.
connection.bluetoothOff|O Bluetooth está desligado. Ative-o nas configurações do Windows e tente novamente.
connection.noDevice|Nenhum dispositivo foi selecionado ou o serviço 0xFFF0 não está disponível.
connection.failed|Não foi possível conectar: {message}
connection.writeFailed|Falha ao gravar: {message}
power.title|Energia
power.description|Acenda ou apague a lâmpada. O status mostra o último comando enviado; a lâmpada não informa o próprio estado de energia.
power.on|Ligar
power.off|Desligar
brightness.title|Brilho
brightness.description|Nível de brilho da lâmpada
color.pick|Escolher uma cor
color.wheelLabel|Roda de cores: arraste para escolher o matiz e a saturação
color.hexLabel|Código de cor hexadecimal
color.help|Arraste na roda ou digite um código hexadecimal. O centro é branco.
effects.title|Efeitos
effects.nowPlaying|Efeito atual
effects.colorStops|Ao escolher uma cor, o efeito atual é interrompido
effects.none|nenhum
effects.speed|Velocidade do efeito
effects.speedDescription|Velocidade de reprodução do efeito
effects.search|Buscar efeitos
effects.categories|Categorias de efeitos
effects.scrollLeft|Rolar categorias para a esquerda
effects.scrollRight|Rolar categorias para a direita
effects.colors|Filtrar por cor
effects.all|Todos
effects.noMatches|Nenhum efeito encontrado.
effects.onlyColor|Somente efeitos na cor {color}
effects.multicolor|Multicolorido
music.title|Música
music.sync|Sincronização com música
music.description|A lâmpada reage aos sons captados pelo microfone integrado
music.unknown|Desconhecido
music.running|Em execução
music.stopped|Parado
music.start|Iniciar
music.stop|Parar
music.mode|Modo
music.modeDescription|Como a lâmpada reage ao som
music.eqEnergetic|Energético
music.eqRhythm|Ritmo
music.eqSpectrum|Espectro
music.eqRolling|Rolante
music.eqEnergetic2|Energético 2
music.eqRhythm2|Ritmo 2
music.eqSpectrum2|Espectro 2
music.eqRolling2|Rolante 2
music.sensitivity|Sensibilidade
music.sensitivityDescription|Um valor mais alto faz a lâmpada reagir a sons mais baixos.
music.noMicrophone|Este modelo não tem microfone.
schedule.title|Programação
schedule.clock|Relógio da lâmpada
schedule.clockDescription|A programação exige que o horário esteja correto. Ele é ajustado automaticamente ao conectar.
schedule.setClock|Usar o horário deste PC
schedule.readTitle|Ler da lâmpada
schedule.readDescription|Carrega os temporizadores salvos na lâmpada. Isso também acontece ao conectar.
schedule.read|Ler
schedule.timers|Temporizadores
schedule.on|Programar para ligar
schedule.off|Programar para desligar
schedule.enabled|Ativado
schedule.repeat|Repetir
schedule.everyDay|todos os dias
schedule.noDays|nenhum dia
schedule.days|{count} dias
schedule.oneDay|{count} dia
schedule.keepDay|Selecione pelo menos um dia.
schedule.connectFirst|Conecte a lâmpada primeiro.
schedule.chooseTime|Escolha um horário e pelo menos um dia.
schedule.sent|Enviado: {time}, {days}, {state}
schedule.onState|ligada
schedule.offState|desligada
schedule.notSet|Não definido
schedule.onLamp|Na lâmpada: {time}, {days}, {state}
schedule.reading|Lendo da lâmpada…
schedule.noReport|A lâmpada não informou uma programação.
schedule.readFailed|Falha ao ler: {message}
schedule.dayMon|Segunda-feira
schedule.dayTue|Terça-feira
schedule.dayWed|Quarta-feira
schedule.dayThu|Quinta-feira
schedule.dayFri|Sexta-feira
schedule.daySat|Sábado
schedule.daySun|Domingo
schedule.shortMon|S
schedule.shortTue|T
schedule.shortWed|Q
schedule.shortThu|Q
schedule.shortFri|S
schedule.shortSat|S
schedule.shortSun|D
category.special|Especial
category.jump|Saltos e estroboscópio
category.fade|Desvanecimento e transição
category.marquee|Letreiro
category.race|Corrida e onda
category.flush|Varredura e cortina
category.water|Água
category.flow|Fluxo
category.tail|Rastro
category.running|Corrida
category.runningReverse|Corrida inversa
category.scenes|Cenas
picker.title|Escolha sua lâmpada
picker.searchingHint|Buscando. As lâmpadas geralmente se chamam MELK-.
picker.pickHint|Escolha sua lâmpada na lista.
picker.rangeHint|Verifique se a lâmpada está ligada e dentro do alcance.
picker.cancel|Cancelar
picker.unnamed|Dispositivo sem nome
picker.searching|Buscando dispositivos próximos…
`, `
Auto play|Reprodução automática
Magic reverse|Magia reversa
Magic|Magia
Energy|Energia
Jump|Salto
Strobe|Estroboscópio
Fade|Desvanecimento
Transition reverse|Transição reversa
Transition|Transição
Marquee|Letreiro
Race reverse|Corrida reversa
Race|Corrida
Wave reverse|Onda reversa
Wave|Onda
Flush close|Varredura fechada
Flush open|Varredura aberta
Flush reverse|Varredura reversa
Flush|Varredura
Curtain close|Fechar cortina
Curtain open|Abrir cortina
Curtain|Cortina
Water reverse|Água reversa
Water|Água
Flow reverse|Fluxo reverso
Flow|Fluxo
Tail reverse|Rastro reverso
Tail|Rastro
Running reverse|Corrida inversa
Running|Corrida
Sunrise|Nascer do sol
Sunset|Pôr do sol
Birthday|Aniversário
Candlelight|Luz de vela
Fireworks|Fogos de artifício
Party|Festa
Destiny|Destino
Starry sky|Céu estrelado
Romantic|Romântico
Disco|Discoteca
Rainbow|Arco-íris
Movie|Filme
Christmas|Natal
Flowing|Fluido
Sleeping|Sono
Ocean|Oceano
Forest|Floresta
Reading|Leitura
Working|Trabalho
Dazzle|Deslumbrante
Gentle|Suave
Wedding|Casamento
Snow|Neve
Fire|Fogo
Lightning|Relâmpago
Valentine's Day|Dia dos Namorados
Halloween|Halloween
Warning|Aviso
multicolor|multicolorido
six colors|seis cores
red|vermelho
green|verde
blue|azul
yellow|amarelo
cyan|ciano
purple|roxo
white|branco
reverse|reverso
and|e
to|para
dot|ponto
on|em
`)

  const languages = Object.keys(translations)
  const stored = localStorage.getItem('lamp-language')
  let current = languages.includes(stored) ? stored : 'en'

  function t(key, values) {
    const dict = translations[current]
    const translationKey = key === 'schedule.days' && Number(values && values.count) === 1
      ? 'schedule.oneDay'
      : key
    let text = dict[translationKey] || translations.en[translationKey] || translationKey
    if (values) {
      text = text.replace(/\{(\w+)\}/g, (_, name) => values[name] === undefined ? '' : values[name])
    }
    return text
  }

  function effect(name) {
    const words = translations[current].effectWords
    if (!words) return name
    return Object.keys(words).sort((a, b) => b.length - a.length).reduce((result, source) => {
      const pattern = new RegExp(
        '(^|[^A-Za-z])' + source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?=$|[^A-Za-z])',
        'gi',
      )
      return result.replace(pattern, (_, prefix) => prefix + words[source])
    }, name)
  }

  function apply() {
    document.documentElement.lang = current
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      element.textContent = t(element.dataset.i18n)
    })
    document.querySelectorAll('[data-i18n-attr]').forEach((element) => {
      element.dataset.i18nAttr.split(';').forEach((entry) => {
        const [attribute, key] = entry.split(':')
        element.setAttribute(attribute, t(key))
      })
    })
    const titleKey = document.querySelector('[data-i18n-title]')
    if (titleKey) document.title = t(titleKey.dataset.i18nTitle)
    const selector = document.getElementById('language')
    if (selector) {
      if (!selector.options.length) {
        languages.forEach((language) => {
          const option = document.createElement('option')
          option.value = language
          option.textContent = translations[language].languageName || language
          selector.appendChild(option)
        })
      }
      selector.value = current
    }
  }

  document.addEventListener('DOMContentLoaded', apply)
  document.addEventListener('change', (event) => {
    if (event.target.id !== 'language') return
    if (!languages.includes(event.target.value)) return
    current = event.target.value
    localStorage.setItem('lamp-language', current)
    apply()
    document.dispatchEvent(new Event('languagechange'))
  })

  window.i18n = {
    t,
    effect,
    get language() {
      return current
    },
  }
  if (document.readyState !== 'loading') apply()
})()
