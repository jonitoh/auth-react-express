<!-- anchor -->
<div id="top"></div>

<!-- logo -->
<br/>
<p align="center">
    <a href="https://github.com/jonitoh/auth-react-express" target="_blank">
        <img width="50%" src="assets/lock-svgrepo-com.svg" alt="logo">
    </a>
</p>

<!-- title -->
<p>
 <h3 align="center">Auth-React-Express</h3>
</p>
<br/>

<!-- available languages -->
<p align="center">
README disponible en:
   <a href="./README.md">
    <img height="20px" src="https://img.shields.io/badge/EN-flag.svg?color=555555&style=flat&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNjAgMzAiIGhlaWdodD0iNjAwIj4NCjxkZWZzPg0KPGNsaXBQYXRoIGlkPSJ0Ij4NCjxwYXRoIGQ9Im0zMCwxNWgzMHYxNXp2MTVoLTMwemgtMzB2LTE1enYtMTVoMzB6Ii8+DQo8L2NsaXBQYXRoPg0KPC9kZWZzPg0KPHBhdGggZmlsbD0iIzAwMjQ3ZCIgZD0ibTAsMHYzMGg2MHYtMzB6Ii8+DQo8cGF0aCBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iNiIgZD0ibTAsMGw2MCwzMG0wLTMwbC02MCwzMCIvPg0KPHBhdGggc3Ryb2tlPSIjY2YxNDJiIiBzdHJva2Utd2lkdGg9IjQiIGQ9Im0wLDBsNjAsMzBtMC0zMGwtNjAsMzAiIGNsaXAtcGF0aD0idXJsKCN0KSIvPg0KPHBhdGggc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEwIiBkPSJtMzAsMHYzMG0tMzAtMTVoNjAiLz4NCjxwYXRoIHN0cm9rZT0iI2NmMTQyYiIgc3Ryb2tlLXdpZHRoPSI2IiBkPSJtMzAsMHYzMG0tMzAtMTVoNjAiLz4NCjwvc3ZnPg0K">
  </a>  
  <a href="#">
    <img height="20px" src="https://img.shields.io/badge/FR-flag.svg?color=555555&style=flat&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA5MDAgNjAwIj4NCjxwYXRoIGZpbGw9IiNlZDI5MzkiIGQ9Im0wLDBoOTAwdjYwMGgtOTAweiIvPg0KPHBhdGggZmlsbD0iI2ZmZiIgZD0ibTAsMGg2MDB2NjAwaC02MDB6Ii8+DQo8cGF0aCBmaWxsPSIjMDAyMzk1IiBkPSJtMCwwaDMwMHY2MDBoLTMwMHoiLz4NCjwvc3ZnPg0K">
  </a>
</p>
<br/>

<!-- github badges -->

![GitHub contributors](https://img.shields.io/github/contributors/jonitoh/auth-react-express)
![GitHub repo size](https://img.shields.io/github/repo-size/jonitoh/auth-react-express)
![GitHub all releases](https://img.shields.io/github/downloads/jonitoh/auth-react-express/total)
![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/jonitoh/auth-react-express)
[![GitHub license](https://img.shields.io/github/license/jonitoh/auth-react-express)](LICENSE)
[![LinkedIn link](https://img.shields.io/badge/LinkedIn-0077B5?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/ninsemou-jordan-toh-a14434108/)

<!-- tagline or short introduction -->
<br/>
<div>
<p align="center">
  Un projet React-Express avec une implémentation d'authentification/autorisation à partir de zéro (en tout cas le plus possible).
 </p>
</div>
<br/>

---

---

<!-- news / quick announcements -->

### En pause pour l'instant ...

---

---

<!-- summary -->
<br />
<div align="center">

**TABLE OF CONTENT**

[**🌱&nbsp; Quel projet ?**](#philosophy) | [**👨‍💻&nbsp; Tech stack**](#tech) |
[**📖&nbsp; Utilisation**](#usage) |
[**🎯&nbsp; Fonctionnalités**](#features) |
[**⚠️&nbsp; Limitations**](#limits) |
[**🤝&nbsp; Contributions**](#contribs) |
[**📘&nbsp; Licence**](#license) |
[**❤️&nbsp; Merci à vous !**](#acknowledgments) |
[**👀&nbsp; Et sinon ?**](#encore)

</div>

# <a id="philosophy">🌱&nbsp;</a> Quel projet ?

Pour un projet plus complexe, je dois implémenter une procédure d'authentification/autorisation. Pour mieux assimiler les concepts qui sont en jeu sans risquer de détruire mon projet complexe, j'ai décidé d'en faire un projet à part entière et d'implémenter le plus possible les différents mécanismes.

<!-- back to top -->
<p align="right">
 <a href="#top">
   <img height="20px" src="assets/up-arrow-svgrepo-com.svg" />
 </a>
</p>

# <a id="tech">👨‍💻&nbsp;</a> Tech stack

- MongoDB / Mongoose
- Express
- React
- Typescript

<!-- back to top -->
<p align="right">
 <a href="#top">
   <img height="20px" src="assets/up-arrow-svgrepo-com.svg" />
 </a>
</p>

# <a id="usage">📖&nbsp;</a> Utilisation

<br/>

## 🚀&nbsp; Rapide démarrage

There is a folder named `server` which concerns the backend using Express.
The folder named `client` is the frontend implemented in React.

Each folder has a `package.json` file however a global `package.json` can be found at the root to start the application.

Here are some available scripts:

- `npm start`: run the app in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
- `npm test`: lauch whatever test runner that has been used.
- `npm run build`: builds the app for production.

## ⚙️&nbsp; Minimales spécifications

- [Zustand](https://github.com/pmndrs/zustand) is used for the global state managment ( so easier than redux ).
- [Chakra UI](https://chakra-ui.com/) is an amazing component library to build beautiful React apps.
- [Mongoose](https://mongoosejs.com/), the documentation is so good.

## 👀&nbsp; Exemples

En préparation.

<!-- back to top -->
<p align="right">
 <a href="#top">
   <img height="20px" src="assets/up-arrow-svgrepo-com.svg" />
 </a>
</p>

# <a id="features">🎯&nbsp;</a> Fonctionnalités

- [ ]
- [ ]
- [ ]
- [ ] - [x]
  - [x]

<!-- back to top -->
<p align="right">
 <a href="#top">
   <img height="20px" src="assets/up-arrow-svgrepo-com.svg" />
 </a>
</p>

# <a id="limits">⚠️&nbsp;</a> Limitations

### `npm run build`

I need to check if the build can be minified and the filenames include the hashes.

<!-- back to top -->
<p align="right">
 <a href="#top">
   <img height="20px" src="assets/up-arrow-svgrepo-com.svg" />
 </a>
</p>

# <a id="contribs">🤝&nbsp;</a> Contributions

**Merci d'avance pour quiconque voudra contribuer de quelque manière que ce soit!**

😱 Un bogue ? Une fonctionnalité manquante ?

Pour toute suggestion, "forkez" le répertoire et effectuez un "pull request" ou ouvrez une "issue" avec l'étiquette `enhancement`.

🤩 N'oubliez pas de partager ce projet et d'y mettre une étoile! Encore merci!

<!-- back to the top -->
<p align="right">
 <a href="#top">
   <img height="20px" src="assets/up-arrow-svgrepo-com.svg" />
 </a>
</p>

# <a id="license">📘&nbsp;</a> Licence

La licence de ce projet est [MIT](LICENSE).

<!-- back to the top -->
<p align="right">
 <a href="#top">
   <img height="20px" src="assets/up-arrow-svgrepo-com.svg" />
 </a>
</p>

# <a id="acknowledgments">❤️&nbsp;</a> Merci à vous !

🏆 Le nom des nominés retenus, sans ordre particulier, dans la catégorie de **_meilleure ressource déterminante pour ce projet_**:

### front end

- [Créer des formulaires avec Chakra UI](https://blog.logrocket.com/how-to-create-forms-with-chakra-ui-in-react-apps/): article en anglais très détaillé

- [Chakra UI et les thèmes de couleurs](https://dev.to/carwack/the-one-with-chakra-ui-vue-and-color-palette-switching-68e)

- [Les cookies HTTP avec React](https://blog.logrocket.com/how-to-secure-react-app-login-authentication/)

- [usehooks](https://usehooks.com/), un site avec des hooks de reacts intéressants

---

### back end

- [Vidéo Mongoose Crash Course - Débutant à Avancé (en anglais)](https://www.youtube.com/watch?v=DZBGEVgL2eE)

- [Vidéo Tuto Authentification/Refresh JSON Web Token en Nodejs avec Express](https://www.youtube.com/watch?v=GXokEYwbOwA)

- [Clean code for Express app](https://www.codepedia.org/ama/cleaner-code-in-expressjs-rest-api-with-custom-error-handling)

- [Utiliser Mongooose typé](https://ichi.pro/fr/modeles-fortement-types-avec-mongoose-et-typescript-136077299513122)

---

### other

- [Utilisation du fichier jsconfig.json](https://geek-week.imtqy.com/articles/fr493704/index.html)

- [Propriétés imbriquées dans un objet Javascript](https://dev.to/rajnishkatharotiya/select-a-nested-value-from-the-object-in-javascript-2fjd)

<!-- back to the top -->
<p align="right">
 <a href="#top">
   <img height="20px" src="assets/up-arrow-svgrepo-com.svg" />
 </a>
</p>

# <a id="encore">👀&nbsp;</a> Et sinon ?

_An optional section to add one last thing before ending this amazing README._

Merci encore pour avoir lu jusqu'au bout ce README!!!

<!-- back to the top -->
<p align="right">
 <a href="#top">
   <img height="20px" src="assets/up-arrow-svgrepo-com.svg" />
 </a>
</p>
