// Shared helpers for the student-only pages (my-attendance.html, my-grades.html).
(function () {
  function getAuthHeaders() {
    const token = sessionStorage.getItem('uccAccessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
  }

  // 2026-11-14 -> 11/14/2026
  function formatDate(value) {
    const text = String(value ?? '').slice(0, 10);
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
    return match ? `${match[2]}/${match[3]}/${match[1]}` : String(value ?? '');
  }

  function clearSession() {
    sessionStorage.removeItem('uccAccessRole');
    sessionStorage.removeItem('uccAccessToken');
    sessionStorage.removeItem('currentStudentName');
  }

  // Only a logged-in student may stay on these pages.
  async function requireStudent() {
    try {
      const response = await fetch('/api/session', { headers: getAuthHeaders(), credentials: 'same-origin' });
      const result = await response.json();
      if (response.ok && result.session) {
        const role = String(result.session.role || '').toLowerCase();
        if (role !== 'student') {
          window.location.replace('index.html');
          return null;
        }
        return result.session;
      }
    } catch (error) {
      console.error('Session validation error:', error);
    }
    clearSession();
    window.location.replace('index.html?message=' + encodeURIComponent('Please sign in to continue.'));
    return null;
  }

  async function loadMyRecords() {
    const response = await fetch('/api/my-records', { headers: getAuthHeaders() });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || 'Unable to load records');
    return result.data; // { student, attendance, grades }
  }

  async function logout() {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    clearSession();
    window.location.replace('index.html?message=' + encodeURIComponent('You have been logged out.'));
  }

  async function changePassword() {
    const currentPassword = prompt('Enter your current password:');
    if (currentPassword === null) return;
    const newPassword = prompt('Enter a new password (at least 8 characters):');
    if (newPassword === null) return;
    const response = await fetch('/api/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const result = await response.json();
    alert(result.message || (result.success ? 'Password updated.' : 'Unable to update password.'));
  }

  function bindTopbarButtons() {
    document.getElementById('logout-btn')?.addEventListener('click', logout);
    document.getElementById('change-password-btn')?.addEventListener('click', changePassword);
  }

  window.StudentPortal = { escapeHtml, formatDate, requireStudent, loadMyRecords, bindTopbarButtons };
})();
