document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  // Простая проверка на мобильное устройство
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // --- 1. ПК (Следим за мышкой) ---
  if (!isMobile) {
    document.addEventListener("mousemove", (e) => {
      const x = (e.clientX - window.innerWidth / 2) * -0.005;
      const y = (e.clientY - window.innerHeight / 2) * -0.01;
      
      root.style.setProperty("--mouse-x", `${x}deg`);
      root.style.setProperty("--mouse-y", `${y}deg`);
    });
  }

  // --- 2. МОБИЛКИ (Автоматическое дыхание) ---
  if (isMobile) {
    const startAutoAnimation = () => {
      const animate = () => {
        // Время в секундах
        const time = Date.now() * 0.001; 
        
        // НАСТРОЙКИ СКОРОСТИ И АМПЛИТУДЫ
        // Math.sin(time * СКОРОСТЬ) * АМПЛИТУДА
        
        // Движение влево-вправо (пошире)
        const x = Math.sin(time * 0.5) * 2; 
        
        // Движение вверх-вниз (поменьше, другая частота для красоты)
        const y = Math.cos(time * 0.3) * 1; 

        root.style.setProperty("--mouse-x", `${x}deg`);
        root.style.setProperty("--mouse-y", `${y}deg`);

        requestAnimationFrame(animate);
      };
      animate();
    };

    startAutoAnimation();
  }
});