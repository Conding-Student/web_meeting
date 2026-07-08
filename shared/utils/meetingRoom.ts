export function createMeetingRoomName() {
	const timestamp = Date.now().toString(36);
	const randomPart = Math.random().toString(36).slice(2, 8);

	return `room-${timestamp}-${randomPart}`;
}

export function normalizeMeetingRoomName(value: string) {
	return value
		.trim()
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9-_]/g, "")
		.slice(0, 60);
}