const telemetryController = require('./controllers/telemetryController');

const req = { query: { period: '30d' } };
const res = {
  json: (data) => console.log('JSON Output:', JSON.stringify(data, null, 2)),
  status: (code) => {
    console.log('Status code:', code);
    return {
      json: (data) => console.log('Error JSON Output:', JSON.stringify(data, null, 2))
    };
  }
};

telemetryController.getTelemetrySummary(req, res);
