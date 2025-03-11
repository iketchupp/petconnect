export interface AuthResponse {
  token: string;
}

export interface UserRegister {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}
