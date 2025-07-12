import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { useAuth } from "../contexts/AuthContext";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const handleLogin = async (data: LoginForm) => {
    try {
      setLoading(true);
      await login(data.email, data.password);
      onClose();
      loginForm.reset();
    } catch (error) {
      // You could handle error here or let AuthContext handle it
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: RegisterForm) => {
    try {
      setLoading(true);
      await register(data.username, data.email, data.password);
      onClose();
      registerForm.reset();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    loginForm.reset();
    registerForm.reset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isLogin ? "Sign In" : "Create Account"}
      size="sm"
    >
      {isLogin ? (
        <form
          onSubmit={loginForm.handleSubmit(handleLogin)}
          className="space-y-4"
        >
          <Input
            label="Email"
            type="email"
            {...loginForm.register("email")}
            error={loginForm.formState.errors.email?.message}
          />
          <Input
            label="Password"
            type="password"
            {...loginForm.register("password")}
            error={loginForm.formState.errors.password?.message}
          />
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={loading}
          >
            Sign In
          </Button>
        </form>
      ) : (
        <form
          onSubmit={registerForm.handleSubmit(handleRegister)}
          className="space-y-4"
        >
          <Input
            label="Username"
            {...registerForm.register("username")}
            error={registerForm.formState.errors.username?.message}
          />
          <Input
            label="Email"
            type="email"
            {...registerForm.register("email")}
            error={registerForm.formState.errors.email?.message}
          />
          <Input
            label="Password"
            type="password"
            {...registerForm.register("password")}
            error={registerForm.formState.errors.password?.message}
          />
          <Input
            label="Confirm Password"
            type="password"
            {...registerForm.register("confirmPassword")}
            error={registerForm.formState.errors.confirmPassword?.message}
          />
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={loading}
          >
            Create Account
          </Button>
        </form>
      )}

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            type="button"
            onClick={switchMode}
            className="ml-1 text-blue-600 hover:text-blue-700 font-medium"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </Modal>
  );
}
