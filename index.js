const SteamUser = require('steam-user');
const client = new SteamUser();

// Данные берутся из настроек Render (Environment Variables), чтобы не светить их в коде
const logOnOptions = {
    accountName: process.env.STEAM_USERNAME,
    password: process.env.STEAM_PASSWORD,
};

// Если у тебя есть Shared Secret, добавь его в настройки Render, и код введется сам
if (process.env.STEAM_SHARED_SECRET) {
    const SteamTotp = require('steam-totp');
    logOnOptions.twoFactorCode = SteamTotp.generateAuthCode(process.env.STEAM_SHARED_SECRET);
}

client.logOn(logOnOptions);

client.on('loggedOn', () => {
    console.log('Бот успешно вошел в Steam!');
    
    // Список ID игр через запятую из настроек Render (например: 730, 570)
    const games = process.env.STEAM_GAMES.split(',').map(id => parseInt(id.trim()));
    
    client.setPersona(SteamUser.EPersonaState.Online); // Статус "В сети"
    client.gamesPlayed(games); 
    console.log(`Фармим часы в играх: ${games.join(', ')}`);
});

client.on('error', (err) => {
    console.log('Ошибка:', err.message);
    // Если нужен код Steam Guard, бот напишет об этом в логи
    if (err.message === 'SteamGuardMobile') {
        console.log('СРОЧНО: Введи код из мобильного приложения в настройки или используй Shared Secret!');
    }
});

// Простейший веб-сервер, чтобы Render не закрыл проект
const http = require('http');
http.createServer((req, res) => {
    res.write('Бот работает!');
    res.end();
}).listen(process.env.PORT || 3000);
