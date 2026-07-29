export function formatDate(dateString: string, style: "medium" | "full" | "long" | "short" | undefined) {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    dateStyle: style,
    timeStyle: style,
  });
}
