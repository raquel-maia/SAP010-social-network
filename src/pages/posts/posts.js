import { getDoc, doc } from 'firebase/firestore/lite';
import { db, auth } from '../../lib/firebase.js';
import {
  likePost,
  editPost,
  deletePost,
  getPosts,
  addPost,
  userStateChanged,
  userStateLogout,
} from '../../lib/index.js';

export default () => {
  const container = document.createElement('div');

  const template = `
    <header class="geral">
      <h1 class="Techsisters">Techsisters</h1>
      <nav class="links">
        <a class="sobreA" href="#sobre">SOBRE</a>
        <button class="inicioA">SAIR</button>
      </nav>
    </header>

    <section class="feed-container" id="feed-container">
      <div class="feed-novo-post">
        <textarea class="feed-text-box" id="text-post" placeholder="Escreva aqui seu post..." name="story" rows="5" cols="33"></textarea>
        <button id="post-button">Publicar</button>
      </div>
      <div id="post-area">
        <!-- Aqui serão exibidos os posts -->
      </div>
    </section>
  `;

  container.innerHTML = template;

  const btnSair = container.querySelector('.inicioA');
  const btnEnvio = container.querySelector('#post-button');
  const postArea = container.querySelector('#post-area');

  btnSair.addEventListener('click', async () => {
    try {
      console.log('Deslogou');
      userStateLogout(userStateChanged);
      window.location.href = '#login';
    } catch (error) {
      console.log('Erro ao fazer logout:', error);
    }
  });

  btnEnvio.addEventListener('click', async () => {
    const textPost = document.getElementById('text-post').value;

    if (textPost.trim() !== '') {
      const post = {
        name: auth.currentUser.displayName,
        author: auth.currentUser.uid,
        conteúdo: textPost,
        like: [],
      };

      try {
        await addPost(db, post);
        alert('Post adicionado com sucesso');
        document.getElementById('text-post').value = '';
        await displayPosts();
      } catch (error) {
        alert(`Erro ao adicionar o post: ${error}`);
      }
    }
  });

  async function displayPosts() {
    postArea.innerHTML = ''; // Clear previous content

    try {
      const posts = await getPosts(db);
      posts.forEach((post) => {
        const postElement = document.createElement('div');
        postElement.className = 'content-post';
        postElement.innerHTML = `
          <section class="content">
            <h3 class="contentTitle">${post.name}</h3>
            <p class="contentParag">${post.conteúdo}</p>
            <div class="button-content">
              <button class="like-button${post.like.includes(auth.currentUser.uid) ? ' liked' : ''}" data-post-id="${post.id}">❤️</button>
              <span class="like-count">${post.like.length}</span>
              <button class="edit-button" data-post-id="${post.id}">✏️</button>
              <button class="delete-button" data-post-id="${post.id}">🗑️</button>
            </div>
          </section>
        `;
        postArea.appendChild(postElement);

        const likeButton = postElement.querySelector('.like-button');
        const editButton = postElement.querySelector('.edit-button');
        const deleteButton = postElement.querySelector('.delete-button');

        likeButton.addEventListener('click', async () => {
          const postId = likeButton.getAttribute('data-post-id');
          const likeCountElement = postElement.querySelector('.like-count');

          try {
            await likePost(db, postId, auth.currentUser.uid);
            const updatedDocRef = await getDoc(doc(db, 'posts', postId));
            const updatedLikeCount = updatedDocRef.data().like.length;
            likeCountElement.textContent = updatedLikeCount;

            if (updatedDocRef.data().like.includes(auth.currentUser.uid)) {
              likeButton.classList.add('liked');
            } else {
              likeButton.classList.remove('liked');
            }
          } catch (error) {
            console.log('Error', error);
          }
        });

        editButton.addEventListener('click', () => {
          const postId = editButton.getAttribute('data-post-id');
          if (post.name === auth.currentUser.displayName) {
            const newText = prompt('Digite o novo texto:');
            if (newText) {
              editPost(postId, newText);
              postElement.querySelector('.contentParag').textContent = newText;
            }
          } else {
            alert('Você só pode editar seus próprios posts.');
          }
        });

        deleteButton.addEventListener('click', async () => {
          const postId = deleteButton.getAttribute('data-post-id');
          if (post.name === auth.currentUser.displayName) {
            if (confirm('Tem certeza de que deseja excluir este post?')) {
              try {
                await deletePost(postId);
                postElement.remove();
              } catch (error) {
                console.log('Erro ao excluir o post:', error);
              }
            }
          } else {
            alert('Você só pode excluir seus próprios posts.');
          }
        });
      });
    } catch (error) {
      console.log('Erro ao obter os posts:', error);
    }
  }

  displayPosts();

  return container;
};
