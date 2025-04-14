document.addEventListener('DOMContentLoaded', function() {
    const details = document.querySelector('details');
    
    function centerDetailsContent() {
        if (details) {
            const container = details.querySelector('.container');
            if (container) {
                container.style.margin = '0 auto';
                container.style.display = 'flex';
                container.style.flexDirection = 'column';
                container.style.alignItems = 'center';
            }
            
            const row = details.querySelector('.row');
            if (row) {
                row.style.display = 'flex';
                row.style.justifyContent = 'center';
                row.style.flexWrap = 'wrap';
            }
            
            const isMobile = window.innerWidth <= 767;
            
            if (!isMobile) {
                const cols = details.querySelectorAll('[class*="col-"]');
                cols.forEach(col => {
                    col.style.display = 'flex';
                    col.style.justifyContent = 'center';
                    col.style.padding = '0 15px';
                });
            }
        }
    }

    // Initial centering
    centerDetailsContent();

    // Center when details is opened
    details.addEventListener('toggle', centerDetailsContent);

    // Center on window resize
    window.addEventListener('resize', centerDetailsContent);
}); 
