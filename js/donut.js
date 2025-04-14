document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.createElement('canvas');
    canvas.id = 'donut-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.opacity = '0.15';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Массив изображений
    const images = [
        'img/3.png',
        'img/web-dev.png',
        'img/roblox.png',
        'img/4.png',
        'img/scratch.svg',
        'img/go-backend.png'
    ];

    const imageObjects = [];
    let loadedImages = 0;
    const totalImages = images.length;

    // Загружаем изображения
    images.forEach(src => {
        const img = new Image();
        img.onload = () => {
            loadedImages++;
            if (loadedImages === totalImages) {
                draw();
            }
        };
        img.src = src;
        imageObjects.push(img);
    });

    const radius = Math.min(width, height) * 0.45;
    let angleX = 0;
    let angleY = 0;
    let angleZ = 0;
    let pulseAngle = 0;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function rotate3D(x, y, z, angleX, angleY, angleZ) {
        let y1 = y * Math.cos(angleX) - z * Math.sin(angleX);
        let z1 = y * Math.sin(angleX) + z * Math.cos(angleX);
        
        let x2 = x * Math.cos(angleY) + z1 * Math.sin(angleY);
        let z2 = -x * Math.sin(angleY) + z1 * Math.cos(angleY);
        
        let x3 = x2 * Math.cos(angleZ) - y1 * Math.sin(angleZ);
        let y3 = x2 * Math.sin(angleZ) + y1 * Math.cos(angleZ);
        
        return { x: x3, y: y3, z: z2 };
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        ctx.save();
        ctx.translate(width / 2, height / 2);
        
        const pulseScale = 1 + Math.sin(pulseAngle) * 0.1;
        
        for (let i = 0; i < imageObjects.length; i++) {
            const angle = (i * 2 * Math.PI) / imageObjects.length;
            const x = radius * Math.cos(angle) * pulseScale;
            const y = radius * Math.sin(angle) * pulseScale;
            const z = 0;
            
            const rotated = rotate3D(x, y, z, angleX, angleY, angleZ);
            
            const scale = 1000 / (1000 + rotated.z);
            const x2d = rotated.x * scale;
            const y2d = rotated.y * scale;
            
            ctx.save();
            ctx.translate(x2d, y2d);
            ctx.rotate(Math.atan2(rotated.y, rotated.x) + Math.PI / 2);
            ctx.scale(scale, scale);
            
            // Рисуем изображение
            const img = imageObjects[i];
            const size = 150; // Увеличил размер до 150
            ctx.drawImage(img, -size/2, -size/2, size, size);
            
            ctx.restore();
        }
        
        ctx.restore();
        
        angleX += 0.002;
        angleY += 0.003;
        angleZ += 0.001;
        pulseAngle += 0.02;
        
        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
}); 