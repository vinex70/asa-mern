const generateUserName = async (email) => {
  let username = email.split("@")[0];

  let isUserNameNotUnique = await User.exists({
    "personal_info.username": username,
  }).then((result) => result);

  isUserNameNotUnique ? (username += nanoid(5)) : "";

  return username;
};

export default generateUserName;
