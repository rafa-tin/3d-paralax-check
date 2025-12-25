document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const body = document.body;

  // Проверяем, мобильное ли устройство (грубая, но эффективная проверка)
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Глобальные переменные для авто-анимации
  let autoAnimationFrameId;
  let isGyroEnabled = false;

  // --- 1. ЛОГИКА ДЛЯ ПК (Мышь) ---
  if (!isMobile) {
    document.addEventListener("mousemove", (e) => {
      // Ваша формула из старого кода
      const x = (e.clientX - window.innerWidth / 2) * -0.005;
      const y = (e.clientY - window.innerHeight / 2) * -0.01;
      
      root.style.setProperty("--mouse-x", `${x}deg`);
      root.style.setProperty("--mouse-y", `${y}deg`);
    });
  }

  // --- 2. ЛОГИКА ДЛЯ МОБИЛОК (Авто-анимация + Гироскоп) ---
  if (isMobile) {
    
    // Функция авто-анимации (плавное движение восьмеркой)
    // Работает, пока не разрешат гироскоп или если откажут
    const startAutoAnimation = () => {
      const animate = () => {
        if (isGyroEnabled) return; // Если гироскоп включили, авто-анимацию стопаем

        const time = Date.now() * 0.001; // Время в секундах
        // Амплитуда 5-7 градусов, чтобы было заметно, но не тошнило
        const x = Math.sin(time) * 2; 
        const y = Math.cos(time * 0.8) * 1;

        root.style.setProperty("--mouse-x", `${x}deg`);
        root.style.setProperty("--mouse-y", `${y}deg`);

        autoAnimationFrameId = requestAnimationFrame(animate);
      };
      animate();
    };

    // Запускаем авто-анимацию сразу при загрузке
    startAutoAnimation();

    // Функция обработки данных гироскопа
    const handleGyro = (e) => {
      if (!e.gamma || !e.beta) return;

      // Ограничиваем углы (clamp), чтобы не выворачивало сцену
      const maxTilt = 10; // Максимальный наклон в градусах
      
      // Gamma - наклон влево/вправо (-90...90)
      let x = e.gamma; 
      // Beta - наклон вперед/назад (-180...180). 
      // Вычитаем 45, так как люди держат телефон под углом ~45 град к лицу
      let y = e.beta - 45; 

      // Ограничиваем значения
      if (x > maxTilt) x = maxTilt;
      if (x < -maxTilt) x = -maxTilt;
      if (y > maxTilt) y = maxTilt;
      if (y < -maxTilt) y = -maxTilt;

      // Делим на 1.5 или 2, чтобы движение было плавнее
      root.style.setProperty("--mouse-x", `${x * -0.7}deg`);
      root.style.setProperty("--mouse-y", `${y * -0.7}deg`);
    };

    // Функция запроса разрешений (Специфика iOS 13+)
    const requestGyroPermission = async () => {
      // Если уже включено — выходим
      if (isGyroEnabled) return;

      // Проверяем, нужна ли iOS проверка
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
      ) {
        try {
          const permissionState = await DeviceOrientationEvent.requestPermission();
          if (permissionState === "granted") {
            // УРА! Разрешили
            isGyroEnabled = true;
            window.addEventListener("deviceorientation", handleGyro);
            cancelAnimationFrame(autoAnimationFrameId); // Останавливаем авто-анимацию
          } else {
            // ОТКАЗАЛИ. Ничего не делаем, авто-анимация продолжается сама
            console.log("Gyro permission denied");
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        // Android или старый iOS (разрешение не нужно)
        isGyroEnabled = true;
        window.addEventListener("deviceorientation", handleGyro);
        cancelAnimationFrame(autoAnimationFrameId);
      }
    };

    // Вешаем запрос на клик по экрану (любое место)
    // iOS требует, чтобы запрос шел от действия пользователя
    body.addEventListener("click", requestGyroPermission, { once: true });
    body.addEventListener("touchstart", requestGyroPermission, { once: true });
  }
});