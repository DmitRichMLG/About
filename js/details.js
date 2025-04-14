document.addEventListener('DOMContentLoaded', function() {
    const details = document.querySelector('details');
    
    function centerDetailsContent() {
        if (details) {
            const container = details.querySelector('.container');
            if (container) {
                container.style.width = '100%';
                container.style.maxWidth = '1400px';
                container.style.margin = '0 auto';
                container.style.display = 'flex';
                container.style.flexDirection = 'column';
                container.style.alignItems = 'center';
            }
            
            const row = details.querySelector('.row');
            if (row) {
                row.style.width = '100%';
                row.style.margin = '0';
                row.style.display = 'flex';
                row.style.justifyContent = 'center';
                row.style.flexWrap = 'wrap';
            }
            
            const cols = details.querySelectorAll('[class*="col-"]');
            cols.forEach(col => {
                col.style.display = 'flex';
                col.style.justifyContent = 'center';
                col.style.padding = '0 15px';
                col.style.margin = '0';
                col.style.width = '100%';
            });
        }
    }

    // Initial centering
    centerDetailsContent();

    // Center when details is opened
    details.addEventListener('toggle', centerDetailsContent);

    // Center on window resize
    window.addEventListener('resize', centerDetailsContent);
}); 