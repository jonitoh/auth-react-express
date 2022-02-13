const authConfig = require("../config/auth.config");
const { User, Role, ProductKey } = require("../models");
const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  const token = jwt.sign(
    { id: user.id, role: user.role },
    authConfig.ACCESS_TOKEN_SECRET,
    {
      expiresIn: authConfig.ACCESS_TOKEN_EXPIRATION,
    }
  );
  return token;
};

const generateRefreshToken = (user) => {
  const token = jwt.sign(
    { id: user.id, role: user.role },
    authConfig.REFRESH_TOKEN_SECRET,
    {
      expiresIn: authConfig.REFRESH_TOKEN_EXPIRATION,
    }
  );
  return token;
};

const refreshToken = (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(403).send({ message: "NO_TOKEN_PROVIDED" });
  }
  jwt.verify(token, authConfig.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "UNAUTHORIZED" });
    }
    // check user exists and his rights
    delete decoded.iat;
    delete decoded.exp;
    const refreshedToken = generateRefreshToken(decoded);
    res.send({
      accessToken: refreshedToken,
    });
  });
};

const signup = async (req, res) => {
  const { username, email, password, productKey, roleName, roleId, forceRole } =
    req.body;
  const user = new User({
    username,
    email,
    password: await User.hashPassword(password),
  });
  user.save((err, user) => {
    // errors
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    // Product Key
    if (productKey) {
      ProductKey.findOne(
        {
          key: productKey,
        },
        (err, foundProductKey) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          user.productKey = foundProductKey._id;
        }
      );
    } else {
      res.status(500).send({ message: "MISSING_PRODUCT_KEY" });
      return;
    }
    // Role
    const allRoles = Role.allRoles();
    let userRole;
    if (roleId) {
      const isValidRole = allRoles.find(({ _id }) => _id === roleId);
      if (isValidRole) {
        userRole = roleId;
      }
    }
    if (roleName && userRole) {
      const isValidName = allRoles.find(({ name }) => name === roleName);
      if (isValidName) {
        userRole = isValidName._id;
      }
    }
    if (forceRole) {
      if (!userRole) {
        console.log("No given role. Set to default.");
        userRole = allRoles.find(({ name }) => name === Role.defaultRole)._id;
      }
    }

    if (userRole) {
      user.role = userRole;
    } else {
      res.status(500).send({ message: "NO_ROLE_FOUND" });
    }
  });
};

const signinWithEmail = async (req, res) => {
  const { email, password } = req.body;
  await User.findByEmail(email).exec(async (err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    if (!user) {
      return res.status(404).send({ message: "USER_NOT_FOUND" });
    }
    // check password
    const isValidPassword = await user.checkPassword(password);
    if (!isValidPassword) {
      return res.status(401).send({
        accessToken: null,
        message: "INVALID_PASSWORD",
      });
    }
    // retrieve token
    const accessToken = generateAccessToken(user);
    const refreshedToken = generateRefreshToken(user);

    const roleDoc = await Role.findById(user.role);

    res.status(200).send({
      id: user._id,
      username: user.username,
      email: user.email,
      roleId: user.role,
      roleName: roleDoc.name,
      accessToken,
      refreshToken: refreshedToken,
    });
  });
};

const signinWithProductKey = (req, res) => {
  ProductKey.findOne(
    {
      key: req.body.productKey,
    },
    async (err, productKey) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      await User.findOne(
        {
          productKey: productKey.key,
        },
        async (err, user) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          if (!user) {
            return res.status(404).send({ message: "USER_NOT_FOUND" });
          }

          const token = generateAccessToken(user);
          const refreshedToken = generateRefreshToken(user);

          const roleDoc = await Role.findById(user.role);

          res.status(200).send({
            id: user._id,
            username: user.username,
            email: user.email,
            roleId: user.role,
            roleName: roleDoc,
            accessToken: token,
            refreshToken: refreshedToken,
          });
        }
      );
    }
  );
};

module.exports = {
  signup,
  signinWithEmail,
  signinWithProductKey,
  refreshToken,
};
