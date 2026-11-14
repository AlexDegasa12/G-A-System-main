(() => {
    const requiredRoles = {
        '/attendance.html': ['Program Head', 'Faculty'],
        '/grades.html': ['Program Head', 'Faculty'],
        '/reports.html': ['Program Head', 'Faculty'],
        '/students.html': ['Program Head'],
        '/faculty.html': ['Program Head']
    };
    const roles = requiredRoles[window.location.pathname];
    if (!roles) return;

    const token = sessionStorage.getItem('uccAccessToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    fetch('/api/session', { headers, credentials: 'same-origin' })
        .then((response) => response.json().then((result) => ({ response, result })))
        .then(({ response, result }) => {
            const role = result.session?.role;
            if (!response.ok || !role || !roles.includes(role)) {
                throw new Error('Invalid session or insufficient access.');
            }
        })
        .catch(() => {
            sessionStorage.removeItem('uccAccessRole');
            sessionStorage.removeItem('uccAccessToken');
            sessionStorage.removeItem('currentStudentName');
            window.location.replace('index.html?message=Please%20sign%20in%20to%20continue.');
        });
})();
