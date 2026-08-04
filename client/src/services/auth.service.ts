import axios from '../api/axios';
import type { User } from '../types/auth';

interface AuthResponse {
  user: User;
  token: string;
}

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const res = await axios.post('/auth/register', data);
  return res.data.data;
};

export const loginUser = async (data: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const res = await axios.post('/auth/login', data);
  return res.data.data;
};
