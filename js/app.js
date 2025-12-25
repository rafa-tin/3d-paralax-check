document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const body = document.body;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  let autoAnimationFrameId;
  let isGyroEnabled = false;

  // Новые переменные для запоминания начального положения (калибровка)
  let startGamma = null;
  let startBeta = null;

  // --- 1. ПК (Мышь) ---
  if (!isMobile) {
    document.addEventListener("mousemove", (e) => {
      const x = (e.clientX - window.innerWidth / 2) * -0.005;
      const y = (e.clientY - window.innerHeight / 2) * -0.01;
      root.style.setProperty("--mouse-x", `${x}deg`);
      root.style.setProperty("--mouse-y", `${y}deg`);
    });
  }

  // --- 2. МОБИЛКИ ---
  if (isMobile) {
    
    // АВТО-АНИМАЦИЯ (пока не кликнули)
    const startAutoAnimation = () => {
      const animate = () => {
        if (isGyroEnabled) return;
        const time = Date.now() * 0.01;
        const x = Math.sin(time) * 0.5; 
        const y = Math.cos(time * 0.8) * 0.5;
        root.style.setProperty("--mouse-x", `${x}deg`);
        root.style.setProperty("--mouse-y", `${y}deg`);
        autoAnimationFrameId = requestAnimationFrame(animate);
      };
      animate();
    };

    startAutoAnimation();

    // ОБРАБОТКА ГИРОСКОПА С КАЛИБРОВКОЙ
    const handleGyro = (e) => {
      if (e.gamma === null || e.beta === null) return;

      // 1. Если это ПЕРВЫЙ кадр гироскопа — запоминаем позицию как "Центр"
      if (startGamma === null || startBeta === null) {
        startGamma = e.gamma;
        startBeta = e.beta;
        return; // Пропускаем первый кадр, чтобы не было рывка
      }

      // 2. Считаем разницу между ТЕКУЩИМ и СТАРТОВЫМ положением
      // Теперь 0 — это то, как человек держал телефон в момент клика
      let x = e.gamma - startGamma;
      let y = e.beta - startBeta;

      // 3. Ограничиваем углы (чтобы не улетало при сильном наклоне)
      const maxTilt = 3; 

      if (x > maxTilt) x = maxTilt;
      if (x < -maxTilt) x = -maxTilt;
      if (y > maxTilt) y = maxTilt;
      if (y < -maxTilt) y = -maxTilt;

      // 4. Применяем (инверсия -0.7 для эффекта глубины)
      root.style.setProperty("--mouse-x", `${x * -0.7}deg`);
      root.style.setProperty("--mouse-y", `${y * -0.7}deg`);
    };

    const requestGyroPermission = async () => {
      if (isGyroEnabled) return;

      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
      ) {
        try {
          const permissionState = await DeviceOrientationEvent.requestPermission();
          if (permissionState === "granted") {
            isGyroEnabled = true;
            cancelAnimationFrame(autoAnimationFrameId);
            window.addEventListener("deviceorientation", handleGyro);
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        // Android
        isGyroEnabled = true;
        cancelAnimationFrame(autoAnimationFrameId);
        window.addEventListener("deviceorientation", handleGyro);
      }
    };

    body.addEventListener("click", requestGyroPermission, { once: true });
    body.addEventListener("touchstart", requestGyroPermission, { once: true });
  }
});