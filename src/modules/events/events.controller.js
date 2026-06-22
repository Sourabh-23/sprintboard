const { addClient, sendEvent } = require('./events.service');

const stream = async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  sendEvent(res, 'connected', {
    message: 'Connected to SprintBoard event stream',
    user_id: req.user.id,
  });

  addClient({
    organizationId: req.user.organization_id,
    res,
  });
};

module.exports = { stream };
