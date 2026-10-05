# Тестовый стенд Dustline

Файлы для проверки игры без браузера. Восстанавливаются в рабочую папку одной командой.

## Как поднять заново
    mkdir -p /home/claude/dl && cd /home/claude/dl
    cp /mnt/user-data/outputs/teststand/* .
    cp /mnt/user-data/outputs/dustline-v17.html .
    npm install jsdom canvas --silent

## Что чем проверяется
| Файл | Что делает |
|---|---|
| `soak.js` | играет сам: `node soak.js dustline-v17.html <секунд> <класс 0-3> [миссия]`, ловит ошибки |
| `h2.js` | проверка чистой загрузки игры |
| `path.js` | проходимость: 5 фиксированных карт, 24 врага, среднее расстояние |
| `check.js` | сводная проверка: минералы, базы, коридоры, сетка камней |
| `ntest.js` | как враги обходят гряды |
| `mapshot.js` | рисует карты сверху в maps.png |
| `ships2.js`, `launch4.js` | рисуют корабли и кадры взлёта |
| `alien.js`, `art.js` | постройки роя и превью миссий |
| `audio.js` | заглушка звука для jsdom (нужна всем тестам) |

Проверка синтаксиса:
    node -e "const h=require('fs').readFileSync('dustline-v17.html','utf8');const m=h.match(/<script>([\s\S]*?)<\/script>/);new Function(m[1]);console.log('ок')"
