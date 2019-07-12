var Menu =
{
    preload: function () {
        // Загрузка изображения, которое нам
        // будет необходимо позже для создания спрайта
        // Первый аргумент - название, по которому мы будем обращаться к
        // изображению
        // Второй аргумент - путь к файлу изображения
        this.load.image('startBtn', 'images/start.png');
    },

    create: function () {
        // Создаём и добавляем спрайт в нашу игру. Спрайтом будет
        // игровой лого для меню
        // Аргументы: X, Y, имя изображения (см. выше)
        this.startBtn = this.add.sprite(window.innerWidth / 2, window.innerHeight / 2, 'startBtn').setInteractive();
        this.startBtn.on('pointerdown', Menu.startGame, this);
    },

    startGame: function () {
        this.scene.start('Game');
    }
};

export default Menu;