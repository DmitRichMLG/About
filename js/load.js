var hesaplar = [
 {
    img: "img/1.png",
    link: "https://t.me/dmitriy_i0o"
}]

document.addEventListener('DOMContentLoaded', function() {
    function loadSocialIcons() {
        var socialtext = ""
        for (x in hesaplar) {
            var data = `<a class="center" href="` + hesaplar[x].link + `" aria-label="Telegram" style="margin: 0 auto;"> <img class="center social-icon" alt="Telegram" src="` + hesaplar[x].img + `" style="margin: 0 auto;"></a>`
            socialtext += data
        }
        var socialList = document.getElementById("social-list");
        if (socialList) {
            socialList.innerHTML = socialtext;
            
            // Add proper centering for all screen sizes
            function adjustSocialList() {
                // Set base styles for perfect centering
                socialList.style.display = 'flex';
                socialList.style.justifyContent = 'center';
                socialList.style.alignItems = 'center';
                socialList.style.margin = '20px auto';
                socialList.style.position = 'relative';
                socialList.style.left = '0';
                socialList.style.right = '0';
                socialList.style.transform = 'none';
                socialList.style.padding = '0';
                socialList.style.float = 'none';
                socialList.style.width = 'auto';
                
                // Ensure link is properly centered
                const socialLink = socialList.querySelector('a');
                if (socialLink) {
                    socialLink.style.margin = '0 auto';
                    socialLink.style.display = 'flex';
                    socialLink.style.justifyContent = 'center';
                    socialLink.style.alignItems = 'center';
                    socialLink.style.float = 'none';
                    socialLink.style.padding = '0';
                    
                    // Mobile specific adjustments
                    if (window.innerWidth <= 768) {
                        socialLink.style.width = '150px';
                        socialLink.style.height = '150px';
                        
                        // Specific fix for 768px
                        if (window.innerWidth === 768) {
                            document.querySelector('.container > .row > .col-12').style.display = 'flex';
                            document.querySelector('.container > .row > .col-12').style.justifyContent = 'center';
                            document.querySelector('.container > .row > .col-12').style.alignItems = 'center';
                            document.querySelector('.container > .row > .col-12').style.width = '100%';
                            document.querySelector('.container > .row > .col-12').style.padding = '0';
                            document.querySelector('.container > .row > .col-12').style.margin = '0 auto';
                        }
                    } else {
                        socialLink.style.width = '160px';
                        socialLink.style.height = '160px';
                    }
                }
            }
            
            // Initial adjustment
            adjustSocialList();
            
            // Add automatic image switching with random animations
            const socialIcon = socialList.querySelector('.social-icon');
            if (socialIcon) {
                let currentImage = 1;
                let showingTelegram = false;
                
                // Image sequences: 1,telegram,2,telegram,3,telegram, etc.
                const mainImages = [1, 2, 3, 4, 5, 6, 7];
                
                const animations = [
                    'flip-animation', 
                    'bounce-animation', 
                    'rotate-animation', 
                    'wave-animation',
                    'glitch-animation',
                    'pulse-animation',
                    'cube-animation'
                ];
                
                // Preload all images
                const preloadImages = () => {
                    // Preload numbered images
                    for (let i = 1; i <= 7; i++) {
                        const img = new Image();
                        img.src = `img/${i}.png`;
                    }
                    
                    // Preload telegram image
                    const telegramImg = new Image();
                    telegramImg.src = 'img/telegram.png';
                };
                
                preloadImages();
                
                setInterval(() => {
                    // Remove all animation classes
                    animations.forEach(anim => socialIcon.classList.remove(anim));
                    
                    // Add random animation
                    const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
                    socialIcon.classList.add(randomAnimation);
                    
                    // Change image after animation
                    setTimeout(() => {
                        if (showingTelegram) {
                            // After telegram, show the next numbered image
                            socialIcon.src = `img/${currentImage}.png`;
                            
                            // Increment to next number
                            currentImage = currentImage < 7 ? currentImage + 1 : 1;
                            showingTelegram = false;
                        } else {
                            // After numbered image, always show telegram
                            socialIcon.src = 'img/telegram.png';
                            showingTelegram = true;
                        }
                    }, 500);
                }, 2000);
            }
        }
    }

    loadSocialIcons();
    
    // Re-apply fixes on resize
    window.addEventListener('resize', function() {
        // Debounce the resize event to prevent excessive updates
        if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(function() {
            loadSocialIcons();
        }, 200);
    });
});

function dayNightToggle() {
    var element = document.body;
    element.classList.toggle("light-mode");
    var check = window.localStorage.getItem('light-mode');
    if (check == "light") {
        window.localStorage.clear();
    } else {
        window.localStorage.setItem('light-mode', 'light');
    }
}

function checkDayNight() {
    var check = window.localStorage.getItem('light-mode');
    var element = document.body;
    if (check == "light") {
        element.classList.add("light-mode");
    } else {
        element.classList.remove("light-mode");
    }
}

// Функция для проверки ширины экрана и переключения темы
function checkScreenWidth() {
    const element = document.body;
    if (window.innerWidth < 800) {
        // Если ширина меньше 800px, переключаем на темную тему
        if (element.classList.contains("light-mode")) {
            element.classList.remove("light-mode");
            localStorage.removeItem('light-mode');
        }
    }
}

// Проверяем при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    checkDayNight();
    checkScreenWidth();
});

// Проверяем при изменении размера окна
window.addEventListener('resize', function() {
    checkScreenWidth();
});
