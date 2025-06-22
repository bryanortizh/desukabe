function registerUserForm(
  nickname,
  email,
  password,
  uuid,
  type_register,
  type_user
) {
  const missingFields = [];
  if (!nickname) missingFields.push("nickname");
  if (!email) missingFields.push("email");
  if (!password) missingFields.push("password");
  if (!uuid) missingFields.push("uuid");
  if (!type_register) missingFields.push("type_register");
  if (!type_user) missingFields.push("type_user");
  if (missingFields.length) {
    return registerUserErrors.missingFields(missingFields);
  }
  return null;
}

const registerUserErrors = {
  missingFields: (fields) => {
    if (fields.length === 1) {
      if (fields[0] === "nickname") {
        return {
          message:
            "El campo 'Nickname' es obligatorio. Por favor ingresa tu apodo.",
        };
      }
      if (fields[0] === "email") {
        return {
          message:
            "El campo 'Correo' es obligatorio. Por favor ingresa tu correo electrónico.",
        };
      }
      if (fields[0] === "password") {
        return {
          message:
            "El campo 'Contraseña' es obligatorio. Por favor ingresa tu contraseña.",
        };
      }
    }
    return {
      message: "Debes completar los campos restantes.",
    };
  },
  userRegisterError: (error) => ({
    message: "Error al registrar usuario",
    error: error.message,
  }),
};

module.exports = registerUserForm;
