import { redirect } from "next/navigation";

export default function Home() {
  // Instantly send visitors to the login page
  redirect("/login");
}