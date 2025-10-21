import auth from 'react-native-firebase/auth';


// A biblioteca @react-native-firebase lê a configuração automaticamente
// dos ficheiros que você já configurou (google-services.json, etc.).
// Por isso, não precisamos do objeto 'firebaseConfig' aqui.

// Exporta a instância de autenticação para ser usada em toda a aplicação.
// A persistência (guardar o login) é tratada automaticamente.
export const firebaseAuth = auth();
