import axios from 'axios';
import auth from '@react-native-firebase/auth';

// A URL base da sua API que está rodando localmente.
const baseURL = 'http://192.168.52.190:3000';

const api = axios.create({
  baseURL,
});

// Interceptor para adicionar o token de autenticação em todas as requisições
api.interceptors.request.use(
  async (config) => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      const idToken = await currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${idToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
