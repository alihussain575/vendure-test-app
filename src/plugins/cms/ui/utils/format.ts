export function dateFormat(date: string) {
	return new Date(date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "numeric",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
		second: "numeric",
	});
}
