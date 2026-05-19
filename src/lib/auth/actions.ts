"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AuthFormState } from "@/lib/auth/types";

function normalizeSlug(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function loginAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = getText(formData, "email");
  const password = getText(formData, "password");

  if (!email || !password) {
    return {
      status: "error",
      message: "Informe e-mail e senha para entrar.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      status: "error",
      message: "Nao foi possivel entrar. Confira os dados e tente novamente.",
    };
  }

  redirect("/dashboard/agenda");
}

export async function signupAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const barbershopName = getText(formData, "barbershopName");
  const email = getText(formData, "email");
  const password = getText(formData, "password");
  const slug = normalizeSlug(formData.get("slug"));

  if (!barbershopName || !email || !password || !slug) {
    return {
      status: "error",
      message: "Preencha nome da barbearia, e-mail, senha e slug.",
    };
  }

  if (password.length < 6) {
    return {
      status: "error",
      message: "Use uma senha com pelo menos 6 caracteres.",
    };
  }

  const supabase = await createClient();
  const { data: isAvailable, error: slugError } = await supabase.rpc(
    "is_slug_available",
    { p_slug: slug },
  );

  if (slugError) {
    return {
      status: "error",
      message: "Nao foi possivel validar o slug agora.",
    };
  }

  if (!isAvailable) {
    return {
      status: "error",
      message: "Esse slug ja esta em uso. Tente outro.",
    };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        barbershop_name: barbershopName,
        barbershop_slug: slug,
      },
    },
  });

  if (error) {
    return {
      status: "error",
      message:
        error.message === "SLUG_ALREADY_EXISTS"
          ? "Esse slug acabou de ser reservado. Tente outro."
          : "Nao foi possivel criar a conta. Tente novamente.",
    };
  }

  redirect("/dashboard/agenda");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
