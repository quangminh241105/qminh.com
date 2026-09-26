import { redirect } from "next/navigation";

export const metadata = {
  title: "Resume | Quang Minh",
};

export default function ResumePage() {
  redirect("/about");
}
