const canvas = document.getElementById('sparksCanvas');
const c = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

function Spark(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    
    // Начальная прозрачность
    this.opacity = Math.random(); 
    
    // 1. ПЛАВНОСТЬ: Скорость полета вверх (от 0.5 до 1.5 пикселей за кадр)
    // Чем меньше числа, тем медленнее и плавнее полет
    this.speedY = Math.random() * 1 + 0.5; 
    
    // 2. ВЫСОТА: Скорость исчезновения. 
    // 0.004 означает, что искра проживет около 250 кадров (4-5 секунд)
    // Это позволит ей подняться почти до верха экрана.
    this.fadeRate = 0.004+ Math.random() * 0.0001; 

    // Для покачивания влево-вправо (синусоида)
    this.oscillation = Math.random() * Math.PI * 2;
    this.oscillationSpeed = Math.random() * 0.02;

    this.draw = function() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        // Теплое свечение
        c.shadowBlur = 10;
        c.shadowColor = "rgba(255, 140, 0, 0.8)"; // Оранжевый
        c.fillStyle = "rgba(255, 180, 50, " + this.opacity + ")"; // Золотистый
        c.fill();
        c.shadowBlur = 0;
    }

    this.update = function() {
        // Движение вверх
        this.y -= this.speedY;
        
        // Плавное покачивание (S-образное движение)
        this.oscillation += this.oscillationSpeed;
        this.x += Math.sin(this.oscillation) * 0.5;

        // Затухание
        this.opacity -= this.fadeRate;

        // Если искра погасла ИЛИ улетела совсем высоко за экран
        if (this.opacity <= 0 || this.y < -50) {
            this.y = window.innerHeight + 20; // Респаун внизу
            this.x = Math.random() * window.innerWidth;
            this.opacity = 1;
            // При респауне немного меняем скорость, чтобы не было скучно
            this.speedY = Math.random() * 1 + 0.5;
        }
        
        this.draw();
    }
}

let sparksArray = [];

function init() {
    sparksArray = [];
    // Количество искр (можно менять: 50 - мало, 150 - много)
    for (let i = 0; i < 100; i++) { 
        let x = Math.random() * window.innerWidth;
        // Разбрасываем их сразу по всей высоте при загрузке
        let y = Math.random() * window.innerHeight; 
        let radius = Math.random() * 2 + 0.5; // Размер от 0.5 до 2.5px

        sparksArray.push(new Spark(x, y, radius));
    }
}

function animateSparks() {
    requestAnimationFrame(animateSparks);
    c.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = 0; i < sparksArray.length; i++) {
        sparksArray[i].update();
    }
}

init();
animateSparks();