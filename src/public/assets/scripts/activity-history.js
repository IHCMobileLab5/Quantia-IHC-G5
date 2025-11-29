// Datos de ejemplo para la tabla
const activityData = [
    { date: '10 de AGO', time: '15:00', activity: 'Inicio de sesión', device: 'MacBook', location: 'Lima' },
    { date: '7 de SEP', time: '17:20', activity: 'Actualización por correo electrónico', device: 'MacBook', location: 'San Isidro' },
    { date: '14 de SEP', time: '12:00', activity: 'Cambio de contraseña', device: 'iPhone', location: 'Surco' },
    { date: '2 de OCT', time: '09:30', activity: 'Perfil editado', device: 'iPhone', location: 'Cañete' },
    { date: '2 de OCT', time: '09:00', activity: 'Perfil editado', device: 'iPhone', location: 'Cañete' },
    { date: '14 de SEP', time: '12:00', activity: 'Cambio de contraseña', device: 'iPhone', location: 'Surco' },
    { date: '5 de NOV', time: '14:30', activity: 'Descarga de documento', device: 'iPad', location: 'Miraflores' },
    { date: '8 de NOV', time: '10:15', activity: 'Inicio de sesión', device: 'MacBook', location: 'Lima' },
    { date: '12 de NOV', time: '16:45', activity: 'Cambio de foto de perfil', device: 'iPhone', location: 'Barranco' },
    { date: '15 de NOV', time: '11:20', activity: 'Actualización de datos', device: 'MacBook', location: 'San Isidro' },
    { date: '18 de NOV', time: '13:00', activity: 'Cierre de sesión', device: 'iPhone', location: 'Surco' },
    { date: '20 de NOV', time: '09:45', activity: 'Inicio de sesión', device: 'iPad', location: 'Lima' },
];

let currentPage = 1;
const itemsPerPage = 6;
let filteredData = [...activityData];

// Función para renderizar la tabla
function renderTable() {
    const tbody = document.getElementById('activityTableBody');
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = filteredData.slice(start, end);

    tbody.innerHTML = '';

    pageData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.date}</td>
            <td>${item.time}</td>
            <td>${item.activity}</td>
            <td>${item.device}</td>
            <td>${item.location}</td>
        `;
        tbody.appendChild(row);
    });

    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    document.querySelector('.page-info').textContent = `${currentPage} de ${totalPages}`;

    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages;
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
    }
}

function goBack() {
    window.history.back();
}

document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();

    filteredData = activityData.filter(item => {
        return item.date.toLowerCase().includes(searchTerm) ||
            item.time.toLowerCase().includes(searchTerm) ||
            item.activity.toLowerCase().includes(searchTerm) ||
            item.device.toLowerCase().includes(searchTerm) ||
            item.location.toLowerCase().includes(searchTerm);
    });

    currentPage = 1;
    renderTable();
});

document.getElementById('dateFilter').addEventListener('change', function(e) {
    const months = parseInt(e.target.value);

    filteredData = [...activityData];
    currentPage = 1;
    renderTable();

    console.log(`Filtrar por últimos ${months} meses`);
});

window.addEventListener('load', function() {
    const container = document.querySelector('.container');
    container.style.opacity = '0';
    container.style.transform = 'translateY(20px)';

    setTimeout(() => {
        container.style.transition = 'all 0.6s ease';
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
    }, 100);

    renderTable();
});

document.addEventListener('click', function(e) {
    if (e.target.closest('tbody tr')) {
        const row = e.target.closest('tr');
        const allRows = document.querySelectorAll('tbody tr');

        allRows.forEach(r => r.style.background = '');
        row.style.background = '#fff3e6';
    }
});