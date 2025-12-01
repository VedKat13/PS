const API_BASE_URL = 'http://localhost:3001/api';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const api = {
  users: {
    getAll: () => fetch(`${API_BASE_URL}/users`).then(handleResponse),
    getById: (id: string) => fetch(`${API_BASE_URL}/users/${id}`).then(handleResponse),
    getByEmail: (email: string) => fetch(`${API_BASE_URL}/users/email/${email}`).then(handleResponse),
    create: (data: any) => 
      fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(handleResponse),
    update: (id: string, data: any) =>
      fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(handleResponse),
    delete: (id: string) =>
      fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE'
      }).then(handleResponse)
  },
  
  groups: {
    getAll: () => fetch(`${API_BASE_URL}/groups`).then(handleResponse),
    getById: (id: string) => fetch(`${API_BASE_URL}/groups/${id}`).then(handleResponse),
    getUserGroups: (userid: string) => 
      fetch(`${API_BASE_URL}/groups/user/${userid}`).then(handleResponse),
    create: (data: any) =>
      fetch(`${API_BASE_URL}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(handleResponse),
    update: (id: string, data: any) =>
      fetch(`${API_BASE_URL}/groups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(handleResponse),
    delete: (id: string) =>
      fetch(`${API_BASE_URL}/groups/${id}`, {
        method: 'DELETE'
      }).then(handleResponse),
    getMembers: (id: string) =>
      fetch(`${API_BASE_URL}/groups/${id}/members`).then(handleResponse),
    addMember: (id: string, data: any) =>
      fetch(`${API_BASE_URL}/groups/${id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(handleResponse),
    removeMember: (id: string, userid: string) =>
      fetch(`${API_BASE_URL}/groups/${id}/members/${userid}`, {
        method: 'DELETE'
      }).then(handleResponse),
    searchUsers: (groupid: string, query: string) =>
      fetch(`${API_BASE_URL}/groups/search/users?groupid=${groupid}&query=${encodeURIComponent(query)}`).then(handleResponse),
    getPosts: (id: string) =>
      fetch(`${API_BASE_URL}/groups/${id}/posts`).then(handleResponse),
    createPost: (id: string, data: any) =>
      fetch(`${API_BASE_URL}/groups/${id}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(handleResponse),
    deletePost: (id: string, postid: string, adminId: number) =>
      fetch(`${API_BASE_URL}/groups/${id}/posts/${postid}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId })
      }).then(handleResponse)
  },
  
  events: {
    getAll: () => fetch(`${API_BASE_URL}/events`).then(handleResponse),
    getById: (id: string) => fetch(`${API_BASE_URL}/events/${id}`).then(handleResponse),
    getByUser: (userId: string) =>
      fetch(`${API_BASE_URL}/events/user/${userId}`).then(handleResponse),
    create: (data: any) =>
      fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(handleResponse),
    update: (id: string, data: any) =>
      fetch(`${API_BASE_URL}/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(handleResponse),
    delete: (id: string) =>
      fetch(`${API_BASE_URL}/events/${id}`, {
        method: 'DELETE'
      }).then(handleResponse)
  },
  
  friendships: {
    getByUser: (userId: string) =>
      fetch(`${API_BASE_URL}/friendships/${userId}`).then(handleResponse),
    create: (data: any) =>
      fetch(`${API_BASE_URL}/friendships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(handleResponse),
    updateStatus: (id: string, status: string) =>
      fetch(`${API_BASE_URL}/friendships/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      }).then(handleResponse),
    delete: (id: string) =>
      fetch(`${API_BASE_URL}/friendships/${id}`, {
        method: 'DELETE'
      }).then(handleResponse)
  },
  
  applications: {
    getAll: () => fetch(`${API_BASE_URL}/applications`).then(handleResponse),
    getById: (id: string) =>
      fetch(`${API_BASE_URL}/applications/${id}`).then(handleResponse),
    getByUser: (userId: string) =>
      fetch(`${API_BASE_URL}/applications/user/${userId}`).then(handleResponse),
    getByEvent: (eventId: string) =>
      fetch(`${API_BASE_URL}/applications/event/${eventId}`).then(handleResponse),
    create: (data: any) =>
      fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(handleResponse),
    updateStatus: (id: string, status: string) =>
      fetch(`${API_BASE_URL}/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      }).then(handleResponse),
    delete: (id: string) =>
      fetch(`${API_BASE_URL}/applications/${id}`, {
        method: 'DELETE'
      }).then(handleResponse)
  }
};

// Helper function to sync Firebase user with MySQL database
export const syncFirebaseUserToDatabase = async (firebaseUser: any) => {
  try {
    // Check if user already exists in database
    const existingUser = await api.users.getByEmail(firebaseUser.email).catch(() => null);
    
    if (!existingUser || existingUser.error) {
      // User doesn't exist, create new record
      const userData = {
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        email: firebaseUser.email,
        profilePhoto: firebaseUser.photoURL || null,
        branch: '', // Will be updated by user later
        bio: '',
        specialization: '',
        academicYear: null
      };
      
      const result = await api.users.create(userData);
      console.log('User synced to database:', result);
      return result;
    } else {
      console.log('User already exists in database');
      return existingUser;
    }
  } catch (error) {
    console.error('Error syncing user to database:', error);
    throw error;
  }
};
