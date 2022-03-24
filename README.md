<!-- anchor -->
<div id="top"></div>

<!-- logo -->
<br/>
<p align="center">
    <a href="https://github.com/jonitoh/auth-react-express" target="_blank">
        <img width="50%" src="docs/assets/lock-svgrepo-com.svg" alt="logo">
    </a>
</p>

<!-- title -->
<p>
 <h3 align="center">Auth-React-Express</h3>
</p>
<br/>

<!-- available languages -->
<p align="center">
README available in:
   <a href="#">
    <img height="20px" src="https://img.shields.io/badge/EN-flag.svg?color=555555&style=flat&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNjAgMzAiIGhlaWdodD0iNjAwIj4NCjxkZWZzPg0KPGNsaXBQYXRoIGlkPSJ0Ij4NCjxwYXRoIGQ9Im0zMCwxNWgzMHYxNXp2MTVoLTMwemgtMzB2LTE1enYtMTVoMzB6Ii8+DQo8L2NsaXBQYXRoPg0KPC9kZWZzPg0KPHBhdGggZmlsbD0iIzAwMjQ3ZCIgZD0ibTAsMHYzMGg2MHYtMzB6Ii8+DQo8cGF0aCBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iNiIgZD0ibTAsMGw2MCwzMG0wLTMwbC02MCwzMCIvPg0KPHBhdGggc3Ryb2tlPSIjY2YxNDJiIiBzdHJva2Utd2lkdGg9IjQiIGQ9Im0wLDBsNjAsMzBtMC0zMGwtNjAsMzAiIGNsaXAtcGF0aD0idXJsKCN0KSIvPg0KPHBhdGggc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEwIiBkPSJtMzAsMHYzMG0tMzAtMTVoNjAiLz4NCjxwYXRoIHN0cm9rZT0iI2NmMTQyYiIgc3Ryb2tlLXdpZHRoPSI2IiBkPSJtMzAsMHYzMG0tMzAtMTVoNjAiLz4NCjwvc3ZnPg0K">
  </a>  
  <a href="docs/README.fr.md">
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
[![LinkedIn link](https://img.shields.io/badge/LinkedIn-0077B5?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/ninsemou-jordan-toh-a14434108/?locale=en_US)

<!-- tagline or short introduction -->
<br/>
<div>
<p align="center">
  A minimal React project with an authentification/authorisation implementation from scratch and a server side made with Express.
 </p>
</div>
<br/>

---

---

<!-- news / quick announcements -->

### Paused for now ...

---

---

<!-- summary -->
<br />
<div align="center">

**TABLE OF CONTENT**

[**🌱&nbsp; About the project**](#philosophy) | [**👨‍💻&nbsp; Tech stack**](#tech) |
[**📖&nbsp; Usage**](#usage) |
[**🎯&nbsp; Features**](#features) |
[**⚠️&nbsp; Limitations**](#limits) |
[**🤝&nbsp; Contributions**](#contribs) |
[**📘&nbsp; License**](#license) |
[**❤️&nbsp; Acknowledgments**](#acknowledgments) |
[**👀&nbsp; What else ?**](#encore)

</div>

# <a id="philosophy">🌱&nbsp;</a> About the project

For a more complex project, I need to implement authentification/authorisation. Therefore, I decided to do it in its own project and from scratch ( as much as possible ) so that I can understand all the concepts.

<!-- back to top -->
<p align="right">
 <a href="#top">
   <img height="20px" src="docs/assets/up-arrow-svgrepo-com.svg" />
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
   <img height="20px" src="docs/assets/up-arrow-svgrepo-com.svg" />
 </a>
</p>

# <a id="usage">📖&nbsp;</a> Usage

<br/>

## 🚀&nbsp; Getting started

There is a folder named `server` which concerns the backend using Express.
The folder named `client` is the frontend implemented in React.

Each folder has a `package.json` file however a global `package.json` can be found at the root to start the application.

Here are some available scripts:

- `npm start`: run the app in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
- `npm test`: lauch whatever test runner that has been used.
- `npm run build`: builds the app for production.

## ⚙️&nbsp; Requirements

- [Zustand](https://github.com/pmndrs/zustand) is used for the global state managment ( so easier than redux ).
- [Chakra UI](https://chakra-ui.com/) is an amazing component library to build beautiful React apps.
- [Mongoose](https://mongoosejs.com/), the documentation is so good.

## 👀&nbsp; Examples

In preparation.

<!-- back to top -->
<p align="right">
 <a href="#top">
   <img height="20px" src="docs/assets/up-arrow-svgrepo-com.svg" />
 </a>
</p>

# <a id="features">🎯&nbsp;</a> Features

- [ ]
- [ ]
- [ ]
- [ ]
  - [x]
  - [x]

<!-- back to top -->
<p align="right">
 <a href="#top">
   <img height="20px" src="docs/assets/up-arrow-svgrepo-com.svg" />
 </a>
</p>

# <a id="limits">⚠️&nbsp;</a> Limitations

### `npm run build`

I need to check if the build can be minified and the filenames include the hashes.

<!-- back to top -->
<p align="right">
 <a href="#top">
   <img height="20px" src="docs/assets/up-arrow-svgrepo-com.svg" />
 </a>
</p>

# <a id="contribs">🤝&nbsp;</a> Contributions

**Thanks in advance for anyone who will contribute to expanding this template!**

😱 Found a bug? Missing a specific feature?

If you have any suggestion, please proceed by forking this repo and creating a pull request or opening an issue with the tag `enhancement`.

🤩 Don't forget to give the project a star! Thanks again!

<!-- back to the top -->
<p align="right">
 <a href="#top">
   <img height="20px" src="docs/assets/up-arrow-svgrepo-com.svg" />
 </a>
</p>

# <a id="license">📘&nbsp;</a> License

This project is released under the terms of the [MIT License](LICENSE).

<!-- back to the top -->
<p align="right">
 <a href="#top">
   <img height="20px" src="docs/assets/up-arrow-svgrepo-com.svg" />
 </a>
</p>

# <a id="acknowledgments">❤️&nbsp;</a> Acknowledgments

🏆 Here are the nominees, with no particular order, in the category for **_best resources used for this project_**:

### front end

- [How to create forms with Chakra UI in React apps](https://blog.logrocket.com/how-to-create-forms-with-chakra-ui-in-react-apps/): very detailed article

- [Add a Color Mode to a Chakra-based app](https://dev.to/carwack/the-one-with-chakra-ui-vue-and-color-palette-switching-68e)

- [Use of HTTP cookie in React](https://blog.logrocket.com/how-to-secure-react-app-login-authentication/)

- [usehooks](https://usehooks.com/), a useful website of handful react hooks

---

### back end

- [Express with example](https://www.freecodecamp.org/news/express-explained-with-examples-installation-routing-middleware-and-more/)

- [Example of authentification with Mongo and Express](https://www.bezkoder.com/node-js-mongodb-auth-jwt/)

- [Mongoose's style Guide](https://github.com/Zwimber/mongoose-style-guide)

- [Use of HTTP cookie in Express](https://medium.com/@zahedialfurquan20/using-cookies-to-store-jwt-for-authentication-and-authorization-in-a-mern-stack-app-a58d7a5d6b6e)

- [Clean code for Express app](https://www.codepedia.org/ama/cleaner-code-in-expressjs-rest-api-with-custom-error-handling)

- [Usage of Mongooose and Typescript 1](https://www.dailydeveloping.com/posts/Use-mongoose-with-typescript)
- [Usage of Mongooose and Typescript 2](https://medium.com/swlh/using-typescript-with-mongodb-393caf7adfef)
- [Usage of Mongooose and Typescript 3](https://medium.com/weekly-webtips/make-typescript-and-mongoose-play-nicely-together-3d3c94a91e34)

---

### other

- [Usage of jsconfig.json](https://saurabhshah23.medium.com/react-app-with-absolute-paths-using-jsconfig-json-2b07b1cb24d4)

- [Nested value in object](https://dev.to/rajnishkatharotiya/select-a-nested-value-from-the-object-in-javascript-2fjd)

<!-- back to the top -->
<p align="right">
 <a href="#top">
   <img height="20px" src="docs/assets/up-arrow-svgrepo-com.svg" />
 </a>
</p>

# <a id="encore">👀&nbsp;</a> What else ?

Thanks again for reading this README !!!

<!-- back to the top -->
<p align="right">
 <a href="#top">
   <img height="20px" src="docs/assets/up-arrow-svgrepo-com.svg" />
 </a>
</p>
