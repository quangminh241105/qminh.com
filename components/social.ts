export function getSocialHoverClasses(label: string): string {
  const normalizedLabel = label.toLowerCase();

  if (normalizedLabel.includes("git")) {
    return "hover:bg-black hover:text-white dark:hover:bg-black dark:hover:text-white";
  }

  if (normalizedLabel.includes("link")) {
    return "hover:bg-[#0a66c2] hover:text-white dark:hover:bg-[#0a66c2] dark:hover:text-white";
  }

  if (normalizedLabel.includes("instagram")) {
    return "hover:bg-[#e1306c] hover:text-white dark:hover:bg-[#e1306c] dark:hover:text-white";
  }

  if (normalizedLabel.includes("mail") || normalizedLabel.includes("email")) {
    return "hover:bg-[#ea4335] hover:text-white dark:hover:bg-[#ea4335] dark:hover:text-white";
  }

  return "hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white";
}
