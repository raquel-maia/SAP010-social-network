import { auth } from '../firebase.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  updateDoc,
  deleteDoc,
  increment,
} from 'firebase/firestore/lite';

// Função para fazer login com o Google
// Função para fazer login com o Google
export const loginGoogle = () => {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      // IdP data available using getAdditionalUserInfo(result)
      // ...
    })
    .catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
    });
};

// Função para fazer login com email e senha
export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password); //importa dessa nova maneira que é o novo
};

// Função para criar login com email e senha
export const loginCreate = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// função para manter o usuário logado
export function userStateChanged(callback) {
  const auth = getAuth(app);
  onAuthStateChanged(auth, callback);
}

// função para deslogar o usuário
export function userStateLogout() {
  const auth = getAuth();
  signOut(auth)
    .then(() => {})
    .catch(() => {});
}

export async function likePost(postId) {
  const db = getFirestore(app);
  const docRef = doc(db, 'posts', postId);
  await updateDoc(docRef, {
    like: increment(1),
  });
}

export async function editPost(postId, textEdit) {
  const db = getFirestore(app);
  const docRef = doc(db, 'posts', postId);
  await updateDoc(docRef, {
    conteúdo: textEdit,
  });
}

export async function deletePost(postId) {
  const db = getFirestore(app);
  await deleteDoc(doc(db, 'posts', postId));
}
