// Shared store for mocked users
// Key: userId (string)
// Value: { channelId: string, webhook: Webhook }
const mockedUsers = new Map();

module.exports = { mockedUsers };
