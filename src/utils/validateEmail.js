const validateEmail = (email) => {
  // very simple regex check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;

  // only allow Gmail for now
  const domain = email.split("@")[1];
  if (domain !== "gmail.com") return false;

  return true;
}

export {validateEmail};