export function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function isValidUsername(username: string) {
  return /^[a-zA-Z0-9_]{4,20}$/.test(username);
}

export function isValidPassword(password: string) {
  return password.length >= 8;
}

export function isValidNickname(nickname: string) {
  return nickname.length >= 2 && nickname.length <= 16;
}
