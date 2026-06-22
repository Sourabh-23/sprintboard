const clientsByOrganization = new Map();

const addClient = ({ organizationId, res }) => {
  const key = String(organizationId);
  if (!clientsByOrganization.has(key)) {
    clientsByOrganization.set(key, new Set());
  }

  clientsByOrganization.get(key).add(res);

  res.on('close', () => {
    clientsByOrganization.get(key)?.delete(res);
    if (clientsByOrganization.get(key)?.size === 0) {
      clientsByOrganization.delete(key);
    }
  });
};

const sendEvent = (res, event, data) => {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

const publishToOrganization = (organizationId, event, data) => {
  const clients = clientsByOrganization.get(String(organizationId));
  if (!clients) return;

  for (const client of clients) {
    sendEvent(client, event, data);
  }
};

module.exports = { addClient, sendEvent, publishToOrganization };
