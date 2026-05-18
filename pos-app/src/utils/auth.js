export function getUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getUserRole() {
  const user = getUser();
  return user?.role?.name || '';
}

export function isAdmin() {
  return getUserRole() === 'admin';
}
